export const $ = id => document.getElementById(id);
export const number = (v, decimals = 0) => new Intl.NumberFormat('pt-BR', {maximumFractionDigits:decimals,minimumFractionDigits:decimals}).format(v);
export const normalize = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const escapeHTML = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const titleCase = value => { const text=String(value||''); return text && text===text.toUpperCase() ? text.toLocaleLowerCase('pt-BR').replace(/(^|[\s-])\p{L}/gu,c=>c.toLocaleUpperCase('pt-BR')).replace(/\b(Da|De|Do|Das|Dos|E)\b/g,c=>c.toLowerCase()) : text; };
export const numeric = value => value!=='' && value!=null && Number.isFinite(Number(value)) ? Number(value) : null;
export const month = value => {if(!value)return 'Não informado'; const [m,y]=value.split('-');return `${['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][Number(m)-1]||m}/${y}`;};
export const date = v => /^\d{4}-\d{2}-\d{2}$/.test(v||'') ? v.split('-').reverse().join('/') : v || 'Não informado';
