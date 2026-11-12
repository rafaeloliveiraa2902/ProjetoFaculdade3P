import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {rankUnits} from '../src/js/data/monitoring.js';

test('ranking distinguishes hectares, percentage, periods and unavailable data', () => {
  const units = [
    {name: 'Maior', periods: {'2026': {fire: {areaHa: 20, percent: 2}}, '2025': {fire: {areaHa: 1, percent: 1}, deforestation: {areaHa: 3, percent: 3}}}},
    {name: 'Menor', periods: {'2026': {fire: {areaHa: 10, percent: 50}}, '2025': {fire: {areaHa: 4, percent: 4}, deforestation: {areaHa: 0, percent: 0}}}},
    {name: 'Sem dados', periods: {}}
  ];
  assert.equal(rankUnits(units, 'fire', '2026')[0].unit.name, 'Maior');
  assert.equal(rankUnits(units, 'fire', '2026', 'percent')[0].unit.name, 'Menor');
  assert.equal(rankUnits(units, 'fire', '2025')[0].unit.name, 'Menor');
  assert.equal(rankUnits(units, 'deforestation', '2026')[0].item.areaHa, 3);
  assert.equal(rankUnits(units, 'deforestation', '2026', 'areaHa', '2024')[0].item, null);
  assert.equal(rankUnits(units, 'fire', '2026')[2].item, null);
});

test('map and impact use the same source and unit identifiers', () => {
  const read = name => JSON.parse(readFileSync(new URL(`../data/generated/map/${name}`, import.meta.url), 'utf8'));
  const context = {window: {}};
  vm.runInNewContext(readFileSync(new URL('../data/generated/impact-data.js', import.meta.url), 'utf8'), context);
  const metadata = read('metadata.json');
  const boundaries = read('boundaries.geojson');
  assert.equal(metadata.sourceSha256, context.window.IMPACT.method.sourceSha256);
  assert.equal(boundaries.municipalities.features.length, 246);
  const ids = boundaries.units.features.map(feature => feature.properties.id).sort();
  assert.equal(JSON.stringify(ids), JSON.stringify(Array.from(context.window.IMPACT.units, unit => unit.id).sort()));
  for (const [key, count] of Object.entries(metadata.counts)) {
    const collection = read(`${key}.geojson`);
    assert.equal(collection.features.length, count);
    for (const feature of collection.features) {
      assert.ok(['Polygon', 'MultiPolygon', 'GeometryCollection'].includes(feature.geometry.type));
    }
  }
});
