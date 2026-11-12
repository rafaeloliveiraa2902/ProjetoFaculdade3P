export const firePeriods = {
  '2026': {key: 'queimadas_2026_jan_ago', label: 'Jan–ago de 2026'},
  '2025': {key: 'queimadas_2025', label: '2025 (ano completo)'}
};

export function rankUnits(units, metric, fireYear, order = 'areaHa', lossYear = '2025') {
  const year = metric === 'fire' ? fireYear : lossYear;
  return units.map(unit => ({unit, item: unit.periods[year]?.[metric] ?? null}))
    .sort((a, b) => (b.item?.[order] ?? -1) - (a.item?.[order] ?? -1)
      || a.unit.name.localeCompare(b.unit.name, 'pt-BR'));
}

export function getDeforestationPeriods(impact) {
  return impact?.datasets?.deforestation ?? {'2025': {key: 'desmatamento_prodes_2025', label: 'PRODES · 2025'}};
}
