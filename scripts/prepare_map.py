"""Export lightweight display geometries; never use them to calculate impact."""
import csv
import hashlib
import io
import json
import zipfile
from shapely import make_valid, union_all, wkt
from shapely.geometry import GeometryCollection, mapping
from source_data import arguments

csv.field_size_limit(50_000_000)


def geometry(value):
    geom = wkt.loads(value)
    if geom.is_empty:
        raise ValueError('Empty map geometry')
    x1, y1, x2, y2 = geom.bounds
    if not (-180 <= x1 <= x2 <= 180 and -90 <= y1 <= y2 <= 90):
        raise ValueError('Coordinates must be EPSG:4326')
    return geom if geom.is_valid else make_valid(geom)


def feature(geom, properties, tolerance=0.0001):
    return {'type': 'Feature', 'geometry': mapping(geom.simplify(tolerance, preserve_topology=True)),
            'properties': properties}


def polygonal(geom):
    """Discard collapsed lines/points from repaired polygon geometries."""
    if geom.geom_type in ('Polygon', 'MultiPolygon'):
        return geom
    if geom.geom_type == 'GeometryCollection':
        return union_all([polygonal(part) for part in geom.geoms])
    return GeometryCollection()


def collection(features):
    return {'type': 'FeatureCollection', 'features': features}


def main():
    args = arguments(__doc__)
    destination = args.output_dir / 'map'
    destination.mkdir(parents=True, exist_ok=True)

    def write(name, value):
        (destination / name).write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')), encoding='utf8')

    with zipfile.ZipFile(args.source) as outer:
        with zipfile.ZipFile(io.BytesIO(outer.read('csv_banco_de_dados.zip'))) as archive:
            def read(key):
                return list(csv.DictReader(io.StringIO(archive.read(f'csv_banco_de_dados/{key}.csv').decode('utf-8-sig'))))

            municipalities = read('limites_municipais')
            boundaries = [polygonal(geometry(row['poligono_wkt'])) for row in municipalities]
            # Derived from the supplied municipalities, not a separately sourced official state boundary.
            state = feature(union_all(boundaries), {'name': 'Goiás'}, 0.0004)
            units = []
            for key in ('uc_estaduais', 'parques_nacionais_federais'):
                for index, row in enumerate(read(key)):
                    units.append(feature(polygonal(geometry(row['poligono_wkt'])), {
                        'id': f'{key}:{index}', 'name': row['nome'], 'sphere': row['esfera_administrativa']}))
            write('boundaries.geojson', {'state': collection([state]), 'units': collection(units),
                  'municipalities': collection([feature(geom, {'name': row['Nome'] or row['NM_MUNICIP']}, 0.0004)
                                               for row, geom in zip(municipalities, boundaries)])})
            counts, excluded = {}, {}
            for key in ('queimadas_2025', 'queimadas_2026_jan_ago', 'desmatamento_prodes_2025'):
                rows = read(key)
                features = []
                excluded[key] = []
                for index, row in enumerate(rows):
                    geom = polygonal(geometry(row['poligono_wkt']))
                    if geom.is_empty or geom.area == 0:
                        excluded[key].append(row.get('fid', str(index)))
                        continue
                    features.append(feature(geom, {
                        'id': f'{key}:{index}', 'record': row.get('fid', str(index)),
                        'place': row.get('municipio') or row.get('nome') or 'Goiás',
                        'period': row.get('mes_ano') or row.get('data_imagem') or row.get('ano'),
                        'sourceAreaHa': row.get('area_ha') or row.get('area_ha_recalculada'),
                    }))
                write(f'{key}.geojson', collection(features))
                counts[key] = len(features)
                print(f'{key}: {len(features)} polygons', flush=True)
            write('metadata.json', {'sourceSha256': hashlib.sha256(args.source.read_bytes()).hexdigest(),
                  'counts': counts, 'excludedNonAreaRecords': excluded,
                  'units': len(units), 'municipalities': len(municipalities),
                  'crs': 'EPSG:4326', 'displayToleranceDegrees': 0.0001,
                  'boundaryToleranceDegrees': 0.0004, 'stateBoundary': 'Union of supplied municipal polygons'})


if __name__ == '__main__':
    main()
