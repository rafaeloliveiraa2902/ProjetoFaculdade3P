import {titleCase, escapeHTML as safe, number} from '../shared/format.js';
import {firePeriods, rankUnits, getDeforestationPeriods} from '../data/monitoring.js';

export function initMonitoring(impact, navigate) {
  const metric = document.getElementById('impact-metric');
  const year = document.getElementById('fire-year');
  const lossYear = document.getElementById('loss-year');
  const lossPeriods = getDeforestationPeriods(impact);
  lossYear.replaceChildren(...Object.keys(lossPeriods).sort().reverse().map(value => new Option(lossPeriods[value].label, value)));
  const alerts = impact?.datasets?.alerts ?? {};
  document.getElementById('deter-year').replaceChildren(...Object.keys(alerts).sort().reverse().map(value => new Option(alerts[value].label, value)));
  const order = document.getElementById('impact-order');
  const result = document.getElementById('impact-result');
  const units = impact?.units ?? [];
  let selected = null;
  const pct = value => value > 0 && value < .01 ? '< 0,01%' : `${number(value, 2)}%`;
  const ranked = () => rankUnits(units, metric.value, year.value, order.value, lossYear.value);
  function render() {
    const label = metric.value === 'fire' ? `Queimadas · ${firePeriods[year.value].label}` : `Desmatamento · ${lossPeriods[lossYear.value].label}`;
    document.getElementById('monitoring-period').textContent = label;
    document.getElementById('impact-count').textContent = `${units.length} unidades · ordem decrescente`;
    document.getElementById('impact-heading').textContent = order.value === 'areaHa' ? 'Unidades com maior área atingida' : 'Unidades com maior percentual atingido';
    result.innerHTML = ranked().map(({unit, item}, index) => `<tr data-unit="${safe(unit.id)}" class="${selected === unit.id ? 'selected-unit' : ''}">
      <td>${index + 1}</td><th scope="row"><button class="unit-map-link" data-unit-id="${safe(unit.id)}" aria-label="Localizar ${safe(titleCase(unit.name))} no mapa">${safe(titleCase(unit.name))}</button><span class="record-sub">${safe(unit.sphere)}</span></th>
      <td class="numeric">${item === null ? 'Não disponível' : number(item.areaHa, 2)}</td>
      <td class="numeric">${item === null ? 'Não disponível' : safe(pct(item.percent))}</td>
      <td class="numeric">${number(unit.totalHa, 2)}</td></tr>`).join('');
    if (!units.length) result.innerHTML = '<tr><td colspan="5">Não foi possível carregar os indicadores das unidades.</td></tr>';
  }
  result.addEventListener('click', event => {
    const button = event.target.closest('[data-unit-id]');
    if (button) document.dispatchEvent(new CustomEvent('unit:select', {detail: {id: button.dataset.unitId, source: 'table'}}));
  });
  document.addEventListener('unit:select', event => {selected = event.detail.id; render();});
  for (const control of [metric, year, lossYear, order]) control.addEventListener('change', render);
  render();
  if (document.modelContext?.registerTool) {
    const lifecycle = new AbortController();
    try {
      Promise.resolve(document.modelContext.registerTool({
        name: 'select_monitoring_metric', title: 'Selecionar ocorrência no monitoramento',
        description: 'Seleciona o indicador do ranking de unidades. O mapa mantém suas camadas independentes.',
        inputSchema: {type: 'object', properties: {metric: {type: 'string', enum: ['fire', 'deforestation']}}, required: ['metric'], additionalProperties: false},
        annotations: {readOnlyHint: false, untrustedContentHint: true},
        execute(input) {
          if (!['fire', 'deforestation'].includes(input?.metric)) throw new Error('Ocorrência inválida');
          navigate('monitoramento'); metric.value = input.metric; render();
          return {metric: metric.value, year: metric.value === 'fire' ? year.value : lossYear.value, units: ranked().map(({unit, item}) => ({name: unit.name, ...item}))};
        }
      }, {signal: lifecycle.signal})).catch(() => {});
    } catch {}
    window.addEventListener('pagehide', () => lifecycle.abort(), {once: true});
  }
}
