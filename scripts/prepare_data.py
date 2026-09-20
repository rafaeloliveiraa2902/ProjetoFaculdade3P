import csv, io, json, zipfile, pathlib
csv.field_size_limit(50_000_000)
ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = pathlib.Path(r'C:\Users\NoteLenovo\Downloads\files (1).zip')
def clean(value):
    if not isinstance(value, str): return value
    if 'Ã' in value or 'Â' in value:
        try: return value.encode('latin1').decode('utf8')
        except (UnicodeError, ValueError): pass
    return value
with zipfile.ZipFile(SOURCE) as outer:
    with zipfile.ZipFile(io.BytesIO(outer.read('csv_banco_de_dados.zip'))) as archive:
        datasets = {}
        for name in archive.namelist():
            if not name.endswith('.csv'): continue
            key = pathlib.Path(name).stem
            rows = [{k: clean(v) for k,v in row.items() if k != 'poligono_wkt'} for row in csv.DictReader(io.StringIO(archive.read(name).decode('utf-8-sig')))]
            datasets[key] = rows
            print(json.dumps({'base':key,'registros':len(rows),'amostra':rows[:1]},ensure_ascii=False))
datasets = {key:{'fields':list(rows[0]) if rows else [],'rows':[list(row.values()) for row in rows]} for key,rows in datasets.items()}
payload = json.dumps(datasets,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
(ROOT/'dist'/'data.js').write_text('window.DATA = '+payload+';',encoding='utf8')
