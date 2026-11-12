import {titleCase, numeric, month, date, normalize} from '../shared/format.js';

export function adapt(raw,index,kind) {
 const r={raw,index,id:String(raw.fid||raw.codigo_uc_cnuc||raw.CD_GEOCODI||index+1),name:'',sub:'',type:'',date:'—',dateOrder:0,value:null,place:''};
 if(kind==='fire') Object.assign(r,{name:titleCase(raw.nome||raw.municipio)||'Município não informado',sub:titleCase(raw.area_sobreposta_nome||raw.uc_nome)||'Área sobreposta não informada',type:raw.area_sobreposta_tipo||(raw.uc_nome?'Unidade de conservação':'Não informado'),date:month(raw.mes_ano),dateOrder:Number(raw.ano)*100+Number(raw.mes_ano?.split('-')[0]||0),value:numeric(raw.area_ha),place:titleCase(raw.nome||raw.municipio)});
 if(kind==='deforestation') Object.assign(r,{name:`Registro PRODES #${raw.fid}`,sub:`${raw.satellite||'Satélite não informado'} · ${titleCase(raw.source)}`,type:raw.classe||'Não informado',date:date(raw.data_imagem),dateOrder:Number((raw.data_imagem||'').replaceAll('-','')),value:numeric(raw.area_ha_recalculada),place:raw.satellite});
 if(['conservation','parks'].includes(kind)) Object.assign(r,{name:titleCase(raw.nome),sub:titleCase(raw.municipio_nome||raw.municipios_abrangidos),type:raw.categoria,date:date(raw.data_registro||raw.ano_criacao),dateOrder:Number((raw.data_registro||'').replaceAll('-','')),value:numeric(raw.area_ha_recalculada),place:kind==='parks'?raw.grupo_manejo:titleCase(raw.municipio_nome)});
 if(kind==='infrastructure') Object.assign(r,{name:raw.DESCRICAO,sub:raw.UC,type:raw.UC,place:raw.UC});
 if(kind==='municipalities') Object.assign(r,{name:raw.Nome||titleCase(raw.NM_MUNICIP),sub:`Código IBGE ${raw.CD_GEOCODI}`,type:raw.RG_PLAN,place:raw.RG_PLAN,date:raw.MESO_IBGE});
 if(kind==='localities') Object.assign(r,{name:raw.NOME_ACEN||titleCase(raw.NOME),sub:titleCase(raw.MUNICIPIO),type:raw.GRUPO||'Não informado',place:titleCase(raw.MUNICIPIO),date:raw.LEGENDA||'Não informado',value:numeric(raw.POPULACAO)});
 r.search=normalize(Object.values(raw).join(' '));return r;
}

export function readRecords(data, dataset) {
 const packed=data?.[dataset.key];
 if (!packed) return [];
 return packed.rows.map((row,index)=>adapt(Object.fromEntries(packed.fields.map((field,i)=>[field,row[i]])),index,dataset.kind));
}
