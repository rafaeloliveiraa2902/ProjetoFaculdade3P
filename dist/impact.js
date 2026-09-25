(() => {
  const unitSelect = document.getElementById('impact-unit');
  const periodSelect = document.getElementById('impact-period');
  const metricSelect = document.getElementById('impact-metric');
  const result = document.getElementById('impact-result');
  const units = window.IMPACT?.units ?? [];
  const fmt = value => new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2,minimumFractionDigits:2}).format(value);
  const pct = value => value > 0 && value < .01 ? '< 0,01%' : `${fmt(value)}%`;
  const names = {fire:'Queimadas',deforestation:'Desmatamento',combined:'Queimadas ou desmatamento'};
  const safe = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  if (!units.length) {
    result.textContent='Não foi possível carregar os percentuais. Recarregue a página.';
    [unitSelect,periodSelect,metricSelect].forEach(el=>el.disabled=true);
    return;
  }
  unitSelect.replaceChildren(...[...units].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(u=>new Option(`${u.name} · ${u.sphere}`,u.id)));
  unitSelect.value=units.find(u=>u.name.includes('VEADEIROS'))?.id ?? units[0].id;
  function render() {
    const unit=units.find(u=>u.id===unitSelect.value);
    const period=periodSelect.value,metric=metricSelect.value;
    const item=unit?.periods[period]?.[metric];
    if (!unit) return;
    if (item==null) {
      result.innerHTML=`<div class="impact-unavailable"><strong>Percentual não disponível para este período</strong><p>O arquivo não contém desmatamento de 2026. Selecione “Queimadas” para consultar janeiro a agosto de 2026, ou selecione 2025 para consultar os dois tipos de ocorrência.</p><span>Área total da unidade: ${fmt(unit.totalHa)} ha</span></div>`;
      return;
    }
    const percent=pct(item.percent);
    const periodLabel=period==='2026'?'jan–ago/2026':'2025';
    result.innerHTML=`<div class="impact-numbers"><div><strong>${safe(percent)}</strong><span>da área da unidade · ${safe(names[metric])} · ${periodLabel}</span></div><span class="impact-hectares"><b>${fmt(item.areaHa)} ha</b> atingidos de ${fmt(unit.totalHa)} ha</span></div>
      <div class="impact-track ${metric}" role="meter" aria-label="Percentual da área atingida: ${safe(unit.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${item.percent}" aria-valuetext="${safe(percent)}; ${fmt(item.areaHa)} hectares de ${fmt(unit.totalHa)} hectares"><span style="width:${item.percent}%"></span></div>
      <div class="impact-scale"><span>0% · nenhuma área identificada</span><span>100% · área total da unidade</span></div>
      <p class="impact-caption">${item.percent===0?'Nenhuma interseção identificada nos registros deste período.':'Área atingida dentro do limite da unidade, sem duplicar sobreposições.'}</p>`;
  }
  [unitSelect,periodSelect,metricSelect].forEach(el=>el.addEventListener('change',render));
  // Keep the initial dataset choice useful while allowing independent unit/period controls.
  document.getElementById('navigation').addEventListener('click',event=>{
    const key=event.target.closest('[data-key]')?.dataset.key;
    if(key==='queimadas_2025'||key==='queimadas_2026_jan_ago') {periodSelect.value=key==='queimadas_2025'?'2025':'2026';metricSelect.value='fire';render();}
    if(key==='desmatamento_prodes_2025') {periodSelect.value='2025';metricSelect.value='deforestation';render();}
  });
  render();
})();
