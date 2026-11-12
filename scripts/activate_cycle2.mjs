// Validate a complete staging set before updating the existing publication inputs.
import {readFile, access, cp} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const stage = path.resolve(root, process.argv[2] ?? '.venv/ciclo2-output');
const target = path.join(root, 'data/generated');
if (stage === target) throw new Error('Use a separate staging directory.');
const metadata = JSON.parse(await readFile(path.join(stage, 'map/metadata.json'), 'utf8'));
const manifest = JSON.parse(await readFile(path.join(stage, 'cycle2-manifest.json'), 'utf8'));
const context = {window: {}};
vm.runInNewContext(await readFile(path.join(stage, 'impact-data.js'), 'utf8'), context, {timeout: 1000});
const impact = context.window.IMPACT;
if (manifest.sourceSha256 !== metadata.sourceSha256 || impact.method.sourceSha256 !== metadata.sourceSha256) throw new Error('Source hashes differ.');
const boundaries = JSON.parse(await readFile(path.join(stage, 'map/boundaries.geojson'), 'utf8'));
const unitIds = new Set(boundaries.units.features.map(f => f.properties.id));
if (unitIds.size !== impact.units.length || impact.units.some(u => !unitIds.has(u.id))) throw new Error('Unit identifiers differ.');
for (const [key, count] of Object.entries(metadata.counts)) {
  const data = JSON.parse(await readFile(path.join(stage, `map/${key}.geojson`), 'utf8'));
  if (data.features.length !== count) throw new Error(`Wrong feature count: ${key}`);
}
for (const unit of impact.units) for (const period of Object.values(unit.periods)) {
  for (const item of Object.values(period)) if (item !== null && (!Number.isFinite(item.areaHa) || item.areaHa < 0 || item.percent < 0 || item.percent > 100)) throw new Error('Invalid impact indicator.');
}
await access(path.join(stage, 'data.js'));
const backup = path.join(root, '.venv', `before-cycle2-${Date.now()}`);
await cp(target, backup, {recursive: true});
await cp(stage, target, {recursive: true});
console.log(`Cycle 2 activated. Previous dataset preserved at ${backup}`);
