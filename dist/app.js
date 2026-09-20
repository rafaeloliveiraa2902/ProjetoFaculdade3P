/* The original CSV fields are retained in the detail view; polygon geometry is omitted. */
const $ = id => document.getElementById(id);
const number = (v, decimals = 0) => new Intl.NumberFormat('pt-BR', {maximumFractionDigits:decimals,minimumFractionDigits:decimals}).format(v);
const normalize = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const escapeHTML = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const titleCase = value => { const text=String(value||''); return text && text===text.toUpperCase() ? text.toLocaleLowerCase('pt-BR').replace(/(^|[\s-])\p{L}/gu,c=>c.toLocaleUpperCase('pt-BR')).replace(/\b(Da|De|Do|Das|Dos|E)\b/g,c=>c.toLowerCase()) : text; };
const numeric = value => value!=='' && value!=null && Number.isFinite(Number(value)) ? Number(value) : null;
const month = value => {if(!value)return 'Não informado'; const [m,y]=value.split('-');return `${['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][Number(m)-1]||m}/${y}`;};
const date = v => /^\d{4}-\d{2}-\d{2}$/.test(v||'') ? v.split('-').reverse().join('/') : v || 'Não informado';
const settings = [
 {key:'queimadas_2026_jan_ago',name:'Queimadas · 2026',title:'Queimadas em 2026',group:'MONITORAMENTO',icon:'♧',subtitle:'Registros de janeiro a agosto disponíveis na base enviada.',kind:'fire'},
 {key:'queimadas_2025',name:'Queimadas · 2025',title:'Queimadas em 2025',group:'MONITORAMENTO',icon:'♧',subtitle:'Registros de queimadas de 2025 disponíveis na base enviada.',kind:'fire'},
 {key:'desmatamento_prodes_2025',name:'Desmatamento',title:'Desmatamento em 2025',group:'MONITORAMENTO',icon:'▧',subtitle:'Registros PRODES de 2025 para o Cerrado em Goiás.',kind:'deforestation'},
 {key:'uc_estaduais',name:'Unidades estaduais',title:'Unidades de conservação',group:'CONSERVAÇÃO',icon:'◇',subtitle:'Unidades estaduais e seus dados de cadastro e área.',kind:'conservation'},
 {key:'parques_nacionais_federais',name:'Parques nacionais',title:'Parques nacionais',group:'CONSERVAÇÃO',icon:'◇',subtitle:'Parques federais presentes na base de Goiás.',kind:'parks'},
 {key:'infraestrutura_uc',name:'Infraestrutura',title:'Infraestrutura das unidades',group:'CONSERVAÇÃO',icon:'▤',subtitle:'Estruturas cadastradas nas unidades de conservação.',kind:'infrastructure'},
 {key:'limites_municipais',name:'Municípios',title:'Municípios de Goiás',group:'TERRITÓRIO',icon:'⊞',subtitle:'Municípios e suas regiões de planejamento.',kind:'municipalities'},
 {key:'sedes_localidades',name:'Sedes e localidades',title:'Sedes e localidades',group:'TERRITÓRIO',icon:'⌖',subtitle:'Localidades, municípios e população informada na base.',kind:'localities'}
];
let active=settings[0], records=[], filtered=[], page=1, perPage=8;
function adapt(raw,index) {
 const r={raw,index,id:String(raw.fid||raw.codigo_uc_cnuc||raw.CD_GEOCODI||index+1),name:'',sub:'',type:'',date:'—',dateOrder:0,value:null,place:''};
 if(active.kind==='fire') Object.assign(r,{name:titleCase(raw.nome||raw.municipio)||'Município não informado',sub:titleCase(raw.area_sobreposta_nome||raw.uc_nome)||'Área sobreposta não informada',type:raw.area_sobreposta_tipo||(raw.uc_nome?'Unidade de conservação':'Não informado'),date:month(raw.mes_ano),dateOrder:Number(raw.ano)*100+Number(raw.mes_ano?.split('-')[0]||0),value:numeric(raw.area_ha),place:titleCase(raw.nome||raw.municipio)});
 if(active.kind==='deforestation') Object.assign(r,{name:`Registro PRODES #${raw.fid}`,sub:`${raw.satellite||'Satélite não informado'} · ${titleCase(raw.source)}`,type:raw.classe||'Não informado',date:date(raw.data_imagem),dateOrder:Number((raw.data_imagem||'').replaceAll('-','')),value:numeric(raw.area_ha_recalculada),place:raw.satellite});
 if(['conservation','parks'].includes(active.kind)) Object.assign(r,{name:titleCase(raw.nome),sub:titleCase(raw.municipio_nome||raw.municipios_abrangidos),type:raw.categoria,date:date(raw.data_registro||raw.ano_criacao),dateOrder:Number((raw.data_registro||'').replaceAll('-','')),value:numeric(raw.area_ha_recalculada),place:active.kind==='parks'?raw.grupo_manejo:titleCase(raw.municipio_nome)});
 if(active.kind==='infrastructure') Object.assign(r,{name:raw.DESCRICAO,sub:raw.UC,type:raw.UC,place:raw.UC});
 if(active.kind==='municipalities') Object.assign(r,{name:raw.Nome||titleCase(raw.NM_MUNICIP),sub:`Código IBGE ${raw.CD_GEOCODI}`,type:raw.RG_PLAN,place:raw.RG_PLAN,date:raw.MESO_IBGE});
 if(active.kind==='localities') Object.assign(r,{name:raw.NOME_ACEN||titleCase(raw.NOME),sub:titleCase(raw.MUNICIPIO),type:raw.GRUPO||'Não informado',place:titleCase(raw.MUNICIPIO),date:raw.LEGENDA||'Não informado',value:numeric(raw.POPULACAO)});
 r.search=normalize(Object.values(raw).join(' '));return r;
}
function navigate(key) {
 active=settings.find(s=>s.key===key)||settings[0];
 const packed=window.DATA[active.key];records=packed.rows.map((row,index)=>adapt(Object.fromEntries(packed.fields.map((field,i)=>[field,row[i]])),index));
 $('title').textContent=active.title;$('subtitle').textContent=active.subtitle;
 document.querySelectorAll('.nav-item').forEach(b=>{const selected=b.dataset.key===active.key;b.classList.toggle('active',selected);b.setAttribute('aria-current',selected?'page':'false');});
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
const labels={fid:'Identificador',id:'ID na fonte',dn:'Valor da classe (DN)',nome:'Nome',municipio:'Município',nome_acen:'Nome da localidade',municipio_nome:'Município',municipios_abrangidos:'Municípios abrangidos',area_ha:'Área (ha)',area_ha_recalculada:'Área recalculada (ha)',area_ha_declarada:'Área declarada (ha)',area_km2_original:'Área original (km²)',area_sobreposta_nome:'Área sobreposta',area_sobreposta_tipo:'Tipo de área sobreposta',uc_nome:'Unidade de conservação',uc_esfera_administrativa:'Esfera da unidade',uc_grupo_manejo:'Grupo de manejo da unidade',mes_ano:'Mês e ano',ano:'Ano',centroide_lat:'Latitude do centroide',centroide_lon:'Longitude do centroide',meso_ibge:'Mesorregião',micro_ibge:'Microrregião',geocodigo:'Código geográfico',codigosoli:'Código de solicitação',codigo_solicitacao:'Código de solicitação',codigo_uc_cnuc:'Código CNUC',codigo_wdpa:'Código WDPA',categoria:'Categoria',grupo_manejo:'Grupo de manejo',esfera_administrativa:'Esfera administrativa',data_registro:'Data de cadastro',ano_criacao:'Data de criação',ato_legal_criacao:'Ato legal de criação',orgao_gestor:'Órgão gestor',municipio_cod_ibge:'Código IBGE do município',uf:'Estado',confirmado:'Confirmado',aprovado:'Aprovado',descricao:'Descrição',uc:'Unidade de conservação',cd_geocodi:'Código geográfico',nm_municip:'Nome do município',cod_ibge:'Código IBGE',rg_plan:'Região de planejamento',cod_meso:'Código da mesorregião',cod_micro:'Código da microrregião',codibge:'Código IBGE',bounds:'Limites na fonte',cod_mun:'Código do município',nomemicro:'Microrregião',nomemeso:'Mesorregião',reg_planej:'Região de planejamento',estado:'Estado',regiao:'Região',grupo:'Grupo',srtm_m:'Altitude SRTM (m)',populacao:'População informada',legenda:'Legenda da fonte',obs:'Observações da fonte',setor_cens:'Setor censitário',situacao:'Código da situação',path_row:'Órbita / ponto',tipo:'Tipo',classe:'Classe',def_cloud:'Indicador de nuvem',julian_day:'Dia juliano',data_imagem:'Data da imagem',scene_id:'ID da cena',source:'Bioma de origem',satellite:'Satélite',sensor:'Sensor',uuid:'Identificador único'};
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
if(!window.DATA){$('title').textContent='Não foi possível carregar os dados';$('subtitle').textContent='Recarregue a página. Mantenha os arquivos do painel juntos ao abri-lo no computador.';}else{navigate(settings[0].key);}
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 try{Promise.resolve(document.modelContext.registerTool({name:'filter_environmental_records',title:'Filtrar registros ambientais',description:'Seleciona uma base e aplica busca na lista visível de dados ambientais de Goiás.',inputSchema:{type:'object',properties:{dataset:{type:'string',enum:settings.map(s=>s.key)},search:{type:'string'}},required:['dataset'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute(input){if(!input||!settings.some(s=>s.key===input.dataset)||(input.search!==undefined&&typeof input.search!=='string'))throw new Error('Base ou busca inválida');navigate(input.dataset);$('search').value=input.search||'';update();return {dataset:active.key,total:filtered.length,records:filtered.slice(0,8).map(r=>({name:r.name,type:r.type,areaOrPopulation:r.value}))};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
