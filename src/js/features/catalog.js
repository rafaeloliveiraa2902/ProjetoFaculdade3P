import {$, number, normalize, escapeHTML, titleCase, numeric} from '../shared/format.js';
import {settings} from '../config/datasets.js';
import {labels} from '../config/field-labels.js';
import {readRecords} from '../data/records.js';

export function initCatalog(data) {
let active=settings[0], records=[], filtered=[], page=1, perPage=8;
function navigate(key) {
 active=settings.find(s=>s.key===key)||settings[0];
 $('title').textContent=active.title;$('subtitle').textContent=active.subtitle;
 document.querySelectorAll('.nav-item').forEach(b=>{const selected=b.dataset.key===active.key;b.classList.toggle('active',selected);b.setAttribute('aria-current',selected?'page':'false');});
 const monitoring=active.kind==='monitoring';
 document.querySelector('.impact-panel').hidden=!monitoring;
 for(const selector of ['.stats','.list-panel','.source-note'])document.querySelector(selector).hidden=monitoring;
 if(monitoring){records=[];filtered=[];page=1;return;}
 records=readRecords(data,active);
 $('search').value='';$('search').placeholder=active.kind==='fire'?'Buscar município, área ou código…':'Buscar nome, descrição ou código…';
 const filterNames={deforestation:'Satélite',infrastructure:'Unidade',municipalities:'Região',parks:'Grupo de manejo'};
 $('filter-label').textContent=filterNames[active.kind]||'Município';
 const places=[...new Set(records.map(r=>r.place).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 $('filter').replaceChildren(new Option('Todos', ''),...places.map(v=>new Option(v,v)));
 const hasArea=['fire','deforestation','parks','conservation'].includes(active.kind);
 $('sort').innerHTML='<option value="name">Nome · A–Z</option>'+(hasArea?'<option value="area-desc">Maior área</option><option value="area-asc">Menor área</option>':active.kind==='localities'?'<option value="area-desc">Maior população</option><option value="area-asc">Menor população</option>':'')+(['fire','deforestation','conservation'].includes(active.kind)?'<option value="recent">Mais recentes</option>':'');
 $('col-name').textContent=active.kind==='fire'?'Município / área':active.kind==='deforestation'?'Registro / origem':active.kind==='infrastructure'?'Estrutura / unidade':'Nome / localização';
 $('col-type').textContent=active.kind==='municipalities'?'Região de planejamento':active.kind==='infrastructure'?'Unidade':'Classificação';
 $('col-date').textContent=active.kind==='municipalities'?'Mesorregião':active.kind==='localities'?'Porte informado':active.kind==='conservation'?'Cadastro':active.kind==='parks'?'Criação':'Período';
 $('col-value').textContent=hasArea?'Área (ha)':active.kind==='localities'?'População':'Nº na base';
 $('stat2-label').textContent=active.kind==='deforestation'?'Satélites na seleção':active.kind==='infrastructure'?'Unidades na seleção':active.kind==='municipalities'?'Regiões na seleção':active.kind==='parks'?'Esferas na seleção':'Municípios na seleção';
 $('stat3-label').textContent=hasArea?'Área dos registros':active.kind==='localities'?'Tipos de localidade':'Registros nesta base';
 $('stat3-note').textContent=hasArea?'Soma das áreas informadas, em hectares':active.kind==='localities'?'Classificações presentes na seleção':'Total disponível antes dos filtros';
 $('source-note').textContent=`Fonte: ${active.key}.csv, do arquivo enviado. `+(hasArea?'Áreas somadas por registro; podem incluir sobreposições e não representam área territorial única. ':active.kind==='localities'?'A população tem referência histórica indicada nos detalhes de cada registro. ':'')+'Geometrias não são exibidas.';
 page=1;update();
}
function update() {
 const query=normalize($('search').value.trim()),place=$('filter').value;
 filtered=records.filter(r=>(!query||r.search.includes(query))&&(!place||r.place===place));
 const sort=$('sort').value;
 filtered.sort((a,b)=> sort==='area-desc'?(b.value??-Infinity)-(a.value??-Infinity):sort==='area-asc'?(a.value??Infinity)-(b.value??Infinity):sort==='recent'?b.dateOrder-a.dateOrder:a.name.localeCompare(b.name,'pt-BR',{numeric:true}));
 page=Math.min(page,Math.max(1,Math.ceil(filtered.length/perPage)));
 $('stat1').textContent=number(filtered.length);$('stat1-note').textContent=`De ${number(records.length)} registros na base`;
 const places=active.kind==='parks'?filtered.map(r=>r.raw.esfera_administrativa):filtered.map(r=>r.place);
 $('stat2').textContent=number(new Set(places.filter(Boolean)).size);
 const hasArea=['fire','deforestation','parks','conservation'].includes(active.kind);
 $('stat3').textContent=hasArea?(filtered.length&&!filtered.some(r=>r.value!==null)?'Não informada':number(filtered.reduce((sum,r)=>sum+(r.value??0),0),2)):active.kind==='localities'?number(new Set(filtered.map(r=>r.type)).size):number(records.length);
 $('result-count').textContent=`${number(filtered.length)} registros`;
 renderPage();
}
function renderPage() {
 const start=(page-1)*perPage, rows=filtered.slice(start,start+perPage);
 $('rows').innerHTML=rows.map(r=>{const hasArea=['fire','deforestation','parks','conservation'].includes(active.kind); const value=hasArea?(r.value===null?'Não informada':number(r.value,2)):active.kind==='localities'?(r.value===null?'Não informada':number(r.value)):number(r.index+1);return `<tr><td><span class="record-title">${escapeHTML(r.name)}</span><span class="record-sub">${escapeHTML(r.sub)}</span></td><td><span class="badge ${/indígena|quilombola/i.test(r.type)?'land':/conservação|parque/i.test(r.type)?'uc':''}">${escapeHTML(r.type||'Não informado')}</span></td><td>${escapeHTML(r.date)}</td><td class="numeric">${value}</td><td><button class="detail-button" data-index="${r.index}" aria-label="Ver detalhes: ${escapeHTML(r.name)}">›</button></td></tr>`;}).join('');
 $('empty').hidden=filtered.length>0;
 $('page-summary').textContent=filtered.length?`${number(start+1)}–${number(Math.min(start+perPage,filtered.length))} de ${number(filtered.length)} registros`:'0 registros';
 $('page-number').textContent=`${page} / ${Math.max(1,Math.ceil(filtered.length/perPage))}`;
 $('previous').disabled=page===1;$('next').disabled=page*perPage>=filtered.length;
}
function showDetails(index) {
 const r=records.find(r=>r.index===index);if(!r)return;
 $('detail-title').textContent=r.name;$('detail-source').textContent=`${active.name} · Registro ${r.id} · ${active.key}.csv`;
 $('detail-fields').innerHTML=Object.entries(r.raw).map(([key,value])=>{let display=value||'Não informado';if(value==='True')display='Sim';if(value==='False')display='Não';if(/^area_/.test(key)&&!key.includes('sobreposta')&&numeric(value)!==null)display=number(Number(value),4);return `<div><dt>${escapeHTML(labels[key.toLowerCase()]||titleCase(key.replaceAll('_',' ')))}</dt><dd>${escapeHTML(display)}</dd></div>`;}).join('');
 $('detail').showModal();$('detail').scrollTop=0;
}
function reset(){ $('search').value='';$('filter').value='';$('sort').value='name';page=1;update(); }
let group='';$('navigation').innerHTML=settings.map(s=>{const heading=group!==s.group?`<p class="nav-group">${s.group}</p>`:'';group=s.group;return heading+`<button class="nav-item" data-key="${s.key}"><span class="nav-icon" aria-hidden="true">${s.icon}</span><span>${s.name}</span></button>`;}).join('');
$('navigation').addEventListener('click',e=>{const button=e.target.closest('[data-key]');if(button)navigate(button.dataset.key);});
for(const id of ['search','filter','sort'])$(id).addEventListener(id==='search'?'input':'change',()=>{page=1;update();});
$('page-size').addEventListener('change',()=>{perPage=Number($('page-size').value);page=1;renderPage();});
$('previous').addEventListener('click',()=>{if(page>1){page--;renderPage();}});$('next').addEventListener('click',()=>{if(page*perPage<filtered.length){page++;renderPage();}});
$('reset').addEventListener('click',reset);$('empty-reset').addEventListener('click',reset);
$('rows').addEventListener('click',e=>{const b=e.target.closest('[data-index]');if(b)showDetails(Number(b.dataset.index));});
$('close-detail').addEventListener('click',()=>$('detail').close());$('detail').addEventListener('click',e=>{if(e.target===$('detail')){const box=e.target.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)e.target.close();}});
if(!data){$('title').textContent='Não foi possível carregar os dados';$('subtitle').textContent='Recarregue a página. Mantenha os arquivos do painel juntos ao abri-lo no computador.';}else{navigate(settings[0].key);}
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 try{Promise.resolve(document.modelContext.registerTool({name:'filter_environmental_records',title:'Filtrar registros ambientais',description:'Seleciona uma base e aplica busca na lista visível de dados ambientais de Goiás.',inputSchema:{type:'object',properties:{dataset:{type:'string',enum:settings.filter(s=>s.kind!=='monitoring').map(s=>s.key)},search:{type:'string'}},required:['dataset'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute(input){if(!input||!settings.some(s=>s.key===input.dataset&&s.kind!=='monitoring')||(input.search!==undefined&&typeof input.search!=='string'))throw new Error('Base ou busca inválida');navigate(input.dataset);$('search').value=input.search||'';update();return {dataset:active.key,total:filtered.length,records:filtered.slice(0,8).map(r=>({name:r.name,type:r.type,areaOrPopulation:r.value}))};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}

return {navigate};
}
