import {escapeHTML as safe, titleCase, number} from '../shared/format.js';
import {firePeriods, getDeforestationPeriods} from '../data/monitoring.js';

export async function initMap(impact) {
  const host = document.getElementById('environment-map');
  const status = document.getElementById('map-status');
  const retry = document.getElementById('map-retry');
  const L = window.L;
  if (!L) {status.textContent = 'Biblioteca do mapa indisponível. Recarregue a página; a tabela continua disponível.'; return;}
  const map = L.map(host, {preferCanvas: true, scrollWheelZoom: false, minZoom: 5, maxZoom: 17});
  const cache = new Map();
  const layers = new Map();
  const unitLayers = new Map();
  const byId = new Map((impact?.units ?? []).map(unit => [unit.id, unit]));
  const year = document.getElementById('fire-year');
  const lossYear = document.getElementById('loss-year');
  const lossPeriods = getDeforestationPeriods(impact);
  const alertPeriods = impact?.datasets?.alerts ?? {};
  const alertYear = document.getElementById('deter-year');
  let bounds, unitGroup, selected, version = 0;
  const check = id => document.getElementById(id).checked;
  const styles = {alert: {color: '#8a6500', weight: 1, fillOpacity: .4}, fire: {color: '#ce5716', weight: 1, fillOpacity: .55}, loss: {color: '#9c2861', weight: 1, fillOpacity: .65}};
  map.createPane('units'); map.getPane('units').style.zIndex = 450;
  L.control.scale({imperial: false}).addTo(map);
  map.attributionControl.addAttribution('PRODES/DETER: acervo Ciclo 2 · Limites/queimadas: base anterior');
  new ResizeObserver(() => {if (host.clientWidth) map.invalidateSize({pan: false});}).observe(host);
  async function load(key) {
    if (!cache.has(key)) cache.set(key, fetch(`data/map/${key}.geojson`).then(response => {
      if (!response.ok) throw new Error(`Falha ao carregar ${key}`);
      return response.json();
    }).catch(error => {cache.delete(key); throw error;}));
    return cache.get(key);
  }
  function unitPopup(feature) {
    const unit = byId.get(feature.properties.id);
    const fire = unit?.periods[year.value]?.fire;
    const loss = unit?.periods[lossYear.value]?.deforestation;
    const value = item => item ? `${number(item.areaHa, 2)} ha · ${number(item.percent, 2)}%` : 'Não disponível';
    return `<strong>${safe(titleCase(feature.properties.name))}</strong><p>Queimadas · ${safe(firePeriods[year.value].label)}<br>${value(fire)}</p><p>${safe(lossPeriods[lossYear.value].label)}<br>${value(loss)}</p><small>Área atingida dentro do limite da unidade.</small>`;
  }
  async function update() {
    const current = ++version;
    retry.hidden = true; status.textContent = 'Carregando camadas…'; host.setAttribute('aria-busy', 'true');
    for (const layer of layers.values()) map.removeLayer(layer);
    const requested = [];
    if (check('layer-fire')) requested.push([firePeriods[year.value].key, 'fire', `Queimadas · ${firePeriods[year.value].label}`]);
    if (check('layer-loss')) requested.push([lossPeriods[lossYear.value].key, 'loss', lossPeriods[lossYear.value].label]);
    if (check('layer-deter') && alertPeriods[alertYear.value]) requested.push([alertPeriods[alertYear.value].key, 'alert', alertPeriods[alertYear.value].label]);
    try {
      const ready = await Promise.all(requested.map(async ([key, type, label]) => {
        if (!layers.has(key)) {
          const data = await load(key);
          const layer = L.geoJSON(data, {style: styles[type], onEachFeature(feature, shape) {
            const p = feature.properties;
            shape.bindPopup(`<strong>${safe(label)}</strong><p>${safe(titleCase(p.place))}<br>Registro ${safe(p.record)} · ${safe(p.period)}</p><p>Área do registro: ${p.sourceAreaHa == null ? 'Não informada' : number(Number(p.sourceAreaHa), 2) + ' ha'}</p><small>${p.product === 'DETER' ? 'Alerta DETER: não equivale a taxa PRODES. ' : ''}${p.class ? 'Classe: ' + safe(p.class) + '. ' : ''}Área informada na fonte, sem deduplicação.${p.clippedToGoias ? ' Desenho recortado ao território disponível.' : ''}</small>`);
          }});
          layer.recordCount = data.features.length;
          // Concurrent selections can finish out of order; only cache each layer once.
          if (!layers.has(key)) layers.set(key, layer);
        }
        return [layers.get(key), label];
      }));
      if (current !== version) return;
      for (const [layer] of ready) layer.addTo(map);
      status.textContent = ready.length ? ready.map(([layer, label]) => `${label}: ${number(layer.recordCount)} registros`).join(' · ') : 'Camadas de ocorrências ocultas. Ative uma camada para consultar os registros.';
    } catch {
      if (current !== version) return;
      status.textContent = 'Não foi possível carregar as ocorrências. A tabela permanece disponível.';
      retry.hidden = false;
    } finally {if (current === version) host.setAttribute('aria-busy', 'false');}
    const activeKeys = new Set(requested.map(([key]) => key));
    for (const key of layers.keys()) if (layers.size > 4 && !activeKeys.has(key)) {layers.delete(key); cache.delete(key);}
    for (const layer of unitLayers.values()) layer.setPopupContent(unitPopup(layer.feature));
  }
  try {
    const data = await load('boundaries');
    const state = L.geoJSON(data.state, {interactive: false, style: {color: '#527068', weight: 2, fillColor: '#f2f5e9', fillOpacity: 1}}).addTo(map);
    bounds = state.getBounds(); map.fitBounds(bounds, {padding: [15, 15]});
    const municipalities = L.geoJSON(data.municipalities, {interactive: false, style: {color: '#a9b8ae', weight: .7, fillOpacity: 0}});
    document.getElementById('layer-cities').addEventListener('change', () => check('layer-cities') ? municipalities.addTo(map) : map.removeLayer(municipalities));
    unitGroup = L.geoJSON(data.units, {pane: 'units', style: {color: '#16705d', weight: 2, fillOpacity: .06}, onEachFeature(feature, layer) {
      unitLayers.set(feature.properties.id, layer);
      layer.bindPopup(unitPopup(feature));
      layer.bindTooltip(safe(titleCase(feature.properties.name)));
      layer.on('click', () => document.dispatchEvent(new CustomEvent('unit:select', {detail: {id: feature.properties.id, source: 'map'}})));
    }}).addTo(map);
    document.getElementById('layer-units').addEventListener('change', () => check('layer-units') ? unitGroup.addTo(map) : map.removeLayer(unitGroup));
    document.getElementById('map-reset').addEventListener('click', () => {
      map.invalidateSize({pan: false}); map.fitBounds(bounds, {padding: [15, 15], animate: false}); map.closePopup();
      document.dispatchEvent(new CustomEvent('unit:select', {detail: {id: null, source: 'map'}}));
    });
    document.addEventListener('unit:select', event => {
      if (selected) selected.setStyle({color: '#16705d', weight: 2, fillOpacity: .06});
      selected = unitLayers.get(event.detail.id);
      document.getElementById('map-selection').textContent = selected ? titleCase(selected.feature.properties.name) : 'Selecione uma unidade no mapa ou na tabela.';
      if (!selected) return;
      selected.setStyle({color: '#1746a0', weight: 4, fillOpacity: .12});
      if (event.detail.source === 'table') {
        document.getElementById('layer-units').checked = true; unitGroup.addTo(map);
        host.scrollIntoView({behavior: 'auto', block: 'center'});
        map.invalidateSize(); map.fitBounds(selected.getBounds(), {padding: [35, 35], maxZoom: 13, animate: false}); selected.openPopup();
      }
    });
    for (const id of ['layer-fire', 'layer-loss', 'layer-deter', 'fire-year', 'loss-year', 'deter-year']) document.getElementById(id).addEventListener('change', update);
    retry.addEventListener('click', update);
    await update();
  } catch {
    status.textContent = 'Não foi possível carregar os limites do mapa. Recarregue a página; a tabela permanece disponível.';
    map.setView([-16, -49], 6); host.setAttribute('aria-busy', 'false');
  }
}
