"""Import the supplied cycle-2 archive into the existing static data contracts."""
import argparse
from collections import defaultdict, Counter
from datetime import date
import hashlib
import io
import json
from pathlib import Path
import shutil
import zipfile
import csv
import unicodedata

import shapefile
from pyproj import CRS, Transformer
from shapely import STRtree, make_valid, prepare, wkt, union_all
from shapely.geometry import shape
from shapely.ops import transform
from compute_impact import PROJECT, measure, clipped_union
from prepare_map import polygonal, feature, collection

csv.field_size_limit(50_000_000)


def digest(path):
    result = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            result.update(block)
    return result.hexdigest()


def load_js(path, name):
    text = Path(path).read_text(encoding='utf-8-sig').strip()
    prefix = f'window.{name} = '
    if not text.startswith(prefix):
        raise ValueError(f'Unexpected data contract: {path}')
    return json.loads(text[len(prefix):].removesuffix(';'))


def is_goias(value):
    normalized = unicodedata.normalize('NFD', str(value)).encode('ascii', 'ignore').decode().upper()
    return normalized in ('GO', 'GOIAS')


def materialize(source, work):
    """Extract only named data formats into a dedicated directory, without ZIP paths."""
    inventory = []
    with zipfile.ZipFile(source) as outer:
        for member in outer.infolist():
            if not member.filename.endswith('.zip'):
                continue
            name = Path(member.filename).name
            archive = work / name
            if not archive.exists() or archive.stat().st_size != member.file_size:
                with outer.open(member) as src, archive.open('wb') as dst:
                    shutil.copyfileobj(src, dst)
            entry = {'archive': name, 'sha256': digest(archive), 'members': []}
            folder = work / archive.stem
            folder.mkdir(exist_ok=True)
            with zipfile.ZipFile(archive) as container:
                nested = [n for n in container.namelist() if n.endswith('.zip')]
                dataset = zipfile.ZipFile(io.BytesIO(container.read(nested[0]))) if nested else container
                for item in dataset.infolist():
                    entry['members'].append({'name': item.filename, 'bytes': item.file_size})
                    # Raster is inventoried, not treated as annual vector events or native vegetation.
                    if Path(item.filename).suffix.lower() not in ('.shp', '.shx', '.dbf', '.prj', '.txt', '.qml', '.cst'):
                        continue
                    target = folder / Path(item.filename).name
                    if not target.exists() or target.stat().st_size != item.file_size:
                        with dataset.open(item) as src, target.open('wb') as dst:
                            shutil.copyfileobj(src, dst)
            inventory.append(entry)
    return inventory


def get_groups(reader, deter=False):
    groups = defaultdict(list)
    fields = ['UF', 'VIEW_DATE', 'CLASSNAME'] if deter else ['state', 'year', 'main_class']
    for row in reader.iterRecords(fields=fields):
        if not is_goias(row[fields[0]]):
            continue
        if not deter and str(row['main_class']).upper() != 'DESMATAMENTO':
            continue
        year = str(row['VIEW_DATE'])[:4] if deter else str(int(row['year']))
        if not year.isdigit():
            raise ValueError(f'Invalid period in record {row.oid}')
        groups[year].append(row.oid)
    return groups


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, type=Path)
    parser.add_argument('--baseline-source', required=True, type=Path)
    parser.add_argument('--baseline-dir', type=Path, default=Path('data/generated'))
    parser.add_argument('--output-dir', required=True, type=Path)
    parser.add_argument('--work-dir', type=Path, default=Path('.venv/ciclo2'))
    args = parser.parse_args()
    if args.baseline_dir.resolve() == args.output_dir.resolve():
        parser.error('Generate into a separate staging directory before replacing published data.')
    args.work_dir.mkdir(parents=True, exist_ok=True)
    inventory = materialize(args.source, args.work_dir)
    source_hash, baseline_hash = digest(args.source), digest(args.baseline_source)
    impact = load_js(args.baseline_dir / 'impact-data.js', 'IMPACT')
    metadata = json.loads((args.baseline_dir / 'map/metadata.json').read_text(encoding='utf8'))
    if impact['method']['sourceSha256'] != baseline_hash:
        raise ValueError('Baseline source does not match the existing fire indicators.')
    shutil.copytree(args.baseline_dir, args.output_dir, dirs_exist_ok=True)
    dest = args.output_dir / 'map'
    def write(path, value):
        path.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':'), default=str, allow_nan=False), encoding='utf8')

    with zipfile.ZipFile(args.baseline_source) as outer:
        with zipfile.ZipFile(io.BytesIO(outer.read('csv_banco_de_dados.zip'))) as old:
            def rows(key):
                return list(csv.DictReader(io.StringIO(old.read(f'csv_banco_de_dados/{key}.csv').decode('utf-8-sig'))))
            state = union_all([polygonal(make_valid(wkt.loads(row['poligono_wkt']))) for row in rows('limites_municipais')])
            prepare(state)
            units = []
            for key in ('uc_estaduais', 'parques_nacionais_federais'):
                for index, row in enumerate(rows(key)):
                    geo = polygonal(make_valid(wkt.loads(row['poligono_wkt'])))
                    units.append((f'{key}:{index}', geo, make_valid(transform(PROJECT, geo))))
    by_id = {u['id']: u for u in impact['units']}
    if set(by_id) != {u[0] for u in units}:
        raise ValueError('Unit identifiers differ from baseline.')
    # Replace previous PRODES, including its combined metric; keep independent fire observations intact.
    for unit in impact['units']:
        for period in unit['periods'].values():
            period['deforestation'] = None
            period['combined'] = None
        unit['intersectingRecords'] = {k: v for k, v in unit['intersectingRecords'].items() if not k.startswith('desmatamento')}
    metadata['counts'] = {k: v for k, v in metadata['counts'].items() if k.startswith('queimadas')}
    metadata['excludedNonAreaRecords'] = {k: v for k, v in metadata['excludedNonAreaRecords'].items() if k.startswith('queimadas')}
    datasets = {'deforestation': {}, 'alerts': {}}
    report = {'generatedAt': date.today().isoformat(), 'cycle': 2, 'source': args.source.name,
              'sourceSha256': source_hash, 'baselineSourceSha256': baseline_hash, 'inventory': inventory,
              'selectionPolicy': 'Latest yearly PRODES vector for GO; regional 2021–2024 copies are not added to avoid duplicate versions. DETER remains a separate alert layer.',
              'rasterPolicy': 'Inventoried as complementary PRODES raster; not used as vegetation cover, prediction or added again to vector area.',
              'retained': ['municipalities', 'conservation units', 'infrastructure', 'localities', 'fire 2025', 'fire Jan–Aug 2026'],
              'products': {}, 'regionalComparison': {}}
    latest_rows = []
    for deter in (False, True):
        filename = 'deter-cerrado-nb-public-2026nov01' if deter else 'yearly_deforestation_biome_cerrado_v20261016'
        shp = next((args.work_dir / filename).glob('*.shp'))
        reader = shapefile.Reader(str(shp), encoding='utf8' if deter else 'latin1', encodingErrors='strict')
        crs = CRS.from_wkt(shp.with_suffix('.prj').read_text())
        reproj = Transformer.from_crs(crs, 'EPSG:4326', always_xy=True).transform
        groups = get_groups(reader, deter)
        print(f'{filename}: {sum(map(len, groups.values()))} GO records across {len(groups)} periods', flush=True)
        for year, ids in sorted(groups.items()):
            key = f'deter_go_{year}' if deter else f'desmatamento_prodes_{year}'
            features, geoms = [], []
            audit = {'inputGO': len(ids), 'repaired': 0, 'outsideOrNoArea': [], 'clipped': 0, 'classes': Counter()}
            for oid in ids:
                raw = reader.record(oid).as_dict()
                g = shape(reader.shape(oid).__geo_interface__)
                if not g.is_valid:
                    audit['repaired'] += 1
                    g = make_valid(g)
                g = polygonal(transform(reproj, g))
                if g.is_empty or not state.intersects(g):
                    audit['outsideOrNoArea'].append(oid)
                    continue
                if not state.covers(g):
                    g = polygonal(make_valid(g.intersection(state)))
                    audit['clipped'] += 1
                if g.is_empty or g.area <= 0:
                    audit['outsideOrNoArea'].append(oid)
                    continue
                kind = str(raw['CLASSNAME'] if deter else raw['class_name'])
                audit['classes'][kind] += 1
                record = str(raw.get('FID') if deter else raw.get('uuid') or raw['fid'])
                area = raw.get('AREAMUNKM') if deter else raw.get('area_km')
                properties = {'id': f'{key}:{record}', 'record': record, 'place': raw.get('MUNICIPALI', 'Goiás'),
                              'period': str(raw['VIEW_DATE'] if deter else raw['image_date']),
                              'referenceYear': year, 'class': kind, 'product': 'DETER' if deter else 'PRODES',
                              'sourceAreaHa': None if area is None else area * 100,
                              'clippedToGoias': True, 'sourceFile': shp.name}
                features.append(feature(g, properties))
                if not deter:
                    geoms.append(g)
                    if year == max(groups):
                        latest_rows.append({'fid': str(raw['fid']), 'uf': 'GO', 'classe': kind,
                                            'ano': year, 'data_imagem': str(raw['image_date']),
                                            'satellite': raw.get('satellite'), 'source': 'Cerrado',
                                            'area_ha_recalculada': transform(PROJECT, g).area / 10000,
                                            'uuid': record})
            write(dest / f'{key}.geojson', collection(features))
            metadata['counts'][key] = len(features)
            metadata['excludedNonAreaRecords'][key] = audit['outsideOrNoArea']
            audit['displayed'] = len(features)
            report['products'][key] = audit
            if deter:
                dates = sorted(f['properties']['period'] for f in features)
                label = f'Alertas DETER · {year}' + (' (até ' + dates[-1] + ')' if year == max(groups) and dates else '')
                datasets['alerts'][year] = {'key': key, 'label': label, 'count': len(features), 'dateRange': [dates[0], dates[-1]] if dates else []}
            else:
                # Do not label early multi-year mapping classes as comparable calendar years.
                label = f'PRODES · classe d{year}' if int(year) <= 2012 else f'PRODES · {year}'
                datasets['deforestation'][year] = {'key': key, 'label': label, 'count': len(features)}
                tree = STRtree(geoms)
                projected = {}
                for uid, geographic, metric in units:
                    indices = tree.query(geographic, predicate='intersects')
                    for i in indices:
                        if int(i) not in projected:
                            projected[int(i)] = make_valid(transform(PROJECT, geoms[i]))
                    affected = clipped_union(metric, [projected[int(i)] for i in indices])
                    unit = by_id[uid]
                    period = unit['periods'].setdefault(year, {'fire': None, 'deforestation': None, 'combined': None})
                    period['deforestation'] = measure(metric, affected)
                    unit['intersectingRecords'][key] = len(indices)
            print(f'{key}: {len(features)} displayed; {len(audit["outsideOrNoArea"])} excluded', flush=True)
        reader.close()

    # Audit regional versions without adding their polygons to the latest consolidated series.
    for shp in args.work_dir.glob('Desmat*/*.shp'):
        reader = shapefile.Reader(str(shp), encoding='utf8', encodingErrors='strict')
        fields = {f[0].lower(): f[0] for f in reader.fields[1:]}
        counts = Counter()
        for row in reader.iterRecords(fields=[fields['year'], fields['state']]):
            counts['GO' if is_goias(row[fields['state']]) else 'otherStates'] += 1
        report['regionalComparison'][shp.name] = {'total': reader.numRecords, **counts,
                                                 'usedForIndicators': False, 'reason': 'Superseded by the consolidated 20261016 vector in the same attachment.'}
        reader.close()
    impact['datasets'] = datasets
    if 'repairedGeometries' in impact['method']:
        impact['method']['baselineRepairedGeometries'] = impact['method'].pop('repairedGeometries')
    impact['method'].update({'sourceSha256': source_hash, 'baselineSourceSha256': baseline_hash,
                              'coverage': 'GO PRODES series and DETER alerts from cycle 2; prior fire and 30 unit boundaries retained.',
                              'deforestationSource': 'yearly_deforestation_biome_cerrado_v20261016',
                              'combinedPolicy': 'Not recalculated; null. DETER is never included in PRODES or fire rankings.'})
    metadata.update({'sourceSha256': source_hash, 'baselineSourceSha256': baseline_hash, 'datasets': datasets,
                     'cycle': 2, 'sourceCRS': 'SIRGAS 2000', 'crs': 'EPSG:4326'})
    data = load_js(args.baseline_dir / 'data.js', 'DATA')
    data = {k: v for k, v in data.items() if not k.startswith('desmatamento_prodes_')}
    latest = max(datasets['deforestation'])
    fields = list(latest_rows[0])
    data[f'desmatamento_prodes_{latest}'] = {'fields': fields, 'rows': [[r[f] for f in fields] for r in latest_rows]}
    for name, value in [('DATA', data), ('IMPACT', impact)]:
        target = 'data.js' if name == 'DATA' else 'impact-data.js'
        (args.output_dir / target).write_text(f'window.{name} = ' + json.dumps(value, ensure_ascii=False, separators=(',', ':'), allow_nan=False).replace('<', '\\u003c') + ';', encoding='utf8')
    write(dest / 'metadata.json', metadata)
    write(args.output_dir / 'cycle2-manifest.json', report)
    print('Cycle 2 staging complete.', flush=True)


if __name__ == '__main__':
    main()
