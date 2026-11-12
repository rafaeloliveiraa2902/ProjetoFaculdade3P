import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {rankUnits, getDeforestationPeriods} from '../src/js/data/monitoring.js';

test('selected PRODES period is independent from fire and missing data is not zero', () => {
  const units = [{name: 'A', periods: {'2026': {fire: {areaHa: 90, percent: 90}, deforestation: {areaHa: 2, percent: 2}}, '2021': {deforestation: {areaHa: 5, percent: 5}}}},
    {name: 'B', periods: {'2026': {fire: {areaHa: 1, percent: 1}, deforestation: {areaHa: 7, percent: 7}}}}];
  assert.equal(rankUnits(units, 'fire', '2026', 'areaHa', '2021')[0].unit.name, 'A');
  assert.equal(rankUnits(units, 'deforestation', '2026', 'areaHa', '2026')[0].unit.name, 'B');
  assert.equal(rankUnits(units, 'deforestation', '2026', 'areaHa', '2021')[1].item, null);
  assert.equal(getDeforestationPeriods({datasets: {deforestation: {'2026': {key: 'new'}}}})['2026'].key, 'new');
});

test('cycle 2 publication has separated alert and PRODES catalogs with complete unit indicators', () => {
  const read = name => JSON.parse(readFileSync(new URL(`../data/generated/${name}`, import.meta.url), 'utf8'));
  const metadata = read('map/metadata.json');
  const manifest = read('cycle2-manifest.json');
  const context = {window: {}};
  vm.runInNewContext(readFileSync(new URL('../data/generated/impact-data.js', import.meta.url), 'utf8'), context);
  const impact = context.window.IMPACT;
  assert.equal(metadata.cycle, 2);
  assert.equal(manifest.sourceSha256, impact.method.sourceSha256);
  assert.equal(manifest.baselineSourceSha256, metadata.baselineSourceSha256);
  assert.equal(Object.keys(impact.datasets.deforestation).length, 20);
  assert.equal(Object.keys(impact.datasets.alerts).length, 9);
  for (const [year, entry] of Object.entries(impact.datasets.deforestation)) {
    assert(entry.key.startsWith('desmatamento_prodes_'));
    assert.equal(entry.count, metadata.counts[entry.key]);
    for (const unit of impact.units) {
      const item = unit.periods[year].deforestation;
      assert(Number.isFinite(item.areaHa) && item.areaHa >= 0);
      assert(item.percent >= 0 && item.percent <= 100);
      assert(Math.abs(item.percent - 100 * item.areaHa / unit.totalHa) < 1e-6);
    }
  }
  for (const entry of Object.values(impact.datasets.alerts)) assert(entry.key.startsWith('deter_go_'));
  for (const unit of impact.units) {
    assert(unit.periods['2025'].fire !== null);
    assert(unit.periods['2026'].fire !== null);
    assert.equal(unit.periods['2026'].combined, null);
  }
});
