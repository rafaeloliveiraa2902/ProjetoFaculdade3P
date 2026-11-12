import test from 'node:test';
import assert from 'node:assert/strict';
import {readRecords} from '../src/js/data/records.js';
import {normalize, escapeHTML} from '../src/js/shared/format.js';

test('adapta registros sem depender de estado global ou DOM', () => {
 const data={units:{fields:['nome','area_ha_recalculada','municipio_nome'],rows:[['PARQUE ÁGUA','12.5','GOIÂNIA']]}};
 const [record]=readRecords(data,{key:'units',kind:'conservation'});
 assert.equal(record.name,'Parque Água');
 assert.equal(record.value,12.5);
 assert.equal(record.place,'Goiânia');
 assert.ok(record.search.includes('goiania'));
 assert.equal(record.raw.nome,'PARQUE ÁGUA');
 assert.deepEqual(readRecords(data,{key:'missing',kind:'parks'}),[]);
});
test('busca ignora acentos e conteúdo dinâmico é escapado', () => {
 assert.equal(normalize('Goiás'),'goias');
 assert.equal(escapeHTML('<script>'),'&lt;script&gt;');
});
