"""Clip and dissolve supplied event polygons per conservation unit and period."""
import csv
import hashlib
import io
import json
from pathlib import Path
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.sites-runtime' / 'geo'))
from pyproj import Transformer
from shapely import STRtree, make_valid, union_all, wkt
from shapely.geometry import GeometryCollection
from shapely.ops import transform

csv.field_size_limit(50_000_000)
SOURCE = Path(r'C:\Users\NoteLenovo\Downloads\files (1).zip')
PROJECTION = '+proj=laea +lat_0=-15 +lon_0=-49 +datum=WGS84 +units=m +no_defs'
PROJECT = Transformer.from_crs('EPSG:4326', PROJECTION, always_xy=True).transform

def clipped_union(boundary, events):
    """Events already use the same metric equal-area projection as the boundary."""
    pieces = [boundary.intersection(event) for event in events]
    return union_all(pieces) if pieces else GeometryCollection()

def measure(boundary, affected):
    total = boundary.area / 10000
    if total <= 0:
        raise ValueError('Conservation unit has no measurable polygon area')
    area = affected.area / 10000
    ratio = 100 * area / total
    assert -1e-8 <= ratio <= 100 + 1e-8, (total, area, ratio)
    return {'areaHa': area, 'percent': min(100, max(0, ratio))}

def main():
    repairs = {}
    def geometry(row, source):
        geom = wkt.loads(row['poligono_wkt'])
        if geom.is_empty:
            raise ValueError(f'Empty geometry in {source}')
        x1,y1,x2,y2 = geom.bounds
        assert -180 <= x1 <= x2 <= 180 and -90 <= y1 <= y2 <= 90
        if not geom.is_valid:
            repairs[source] = repairs.get(source, 0) + 1
            geom = make_valid(geom)
        projected = transform(PROJECT, geom)
        return make_valid(projected) if not projected.is_valid else projected

    with zipfile.ZipFile(SOURCE) as outer:
        with zipfile.ZipFile(io.BytesIO(outer.read('csv_banco_de_dados.zip'))) as source:
            def read(key):
                return list(csv.DictReader(io.StringIO(source.read(f'csv_banco_de_dados/{key}.csv').decode('utf-8-sig'))))
            events = {}
            for key in ('queimadas_2025', 'queimadas_2026_jan_ago', 'desmatamento_prodes_2025'):
                rows = read(key)
                geometries = [geometry(row, key) for row in rows]
                events[key] = (geometries, STRtree(geometries))
                print(f'Indexed {key}: {len(rows)}', flush=True)
            units = []
            for key in ('uc_estaduais', 'parques_nacionais_federais'):
                for index,row in enumerate(read(key)):
                    boundary = geometry(row, key)
                    intersections = {}
                    counts = {}
                    for source_key,(geometries,tree) in events.items():
                        indices = tree.query(boundary, predicate='intersects')
                        intersections[source_key] = clipped_union(boundary, [geometries[i] for i in indices])
                        counts[source_key] = len(indices)
                    fire25 = intersections['queimadas_2025']
                    fire26 = intersections['queimadas_2026_jan_ago']
                    deforestation = intersections['desmatamento_prodes_2025']
                    combined = union_all([fire25, deforestation])
                    units.append({
                        'id': f'{key}:{index}', 'name': row['nome'],
                        'sphere': row['esfera_administrativa'],
                        'totalHa': boundary.area/10000,
                        'sourceAreaHa': float(row['area_ha_recalculada']),
                        'periods': {
                            '2025': {'fire':measure(boundary,fire25), 'deforestation':measure(boundary,deforestation), 'combined':measure(boundary,combined)},
                            '2026': {'fire':measure(boundary,fire26), 'deforestation':None, 'combined':None}
                        }, 'intersectingRecords':counts
                    })
            output = {'units':units,'method':{'inputCRS':'EPSG:4326','areaCRS':PROJECTION,'formula':'100 * area(union(events) intersect unit) / area(unit)','sourceSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'repairedGeometries':repairs,'coverage':'30 conservation unit boundaries supplied in CSV; no 2026 deforestation dataset'}}
            (ROOT/'dist/impact-data.js').write_text('window.IMPACT = '+json.dumps(output,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')+';',encoding='utf8')
            print(json.dumps({'units':len(units),'repairs':repairs,'sample':next(u for u in units if 'VEADEIROS' in u['name'])},ensure_ascii=True),flush=True)

if __name__ == '__main__':
    main()
