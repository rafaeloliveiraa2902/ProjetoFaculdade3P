import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const names = ['introducao', 'fase-1', 'fase-2', 'fase-3', 'decisoes'];
const parts = await Promise.all(names.map(name => readFile(path.join(root, 'docs/planejamento', `${name}.md`), 'utf8')));
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
function inline(value) {
  return escape(value).replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
}
function markdown(source) {
  const lines = source.trim().split(/\r?\n/);
  let output = '', list = '', fence = false;
  function closeList() {if (list) {output += `</${list}>`; list = '';}}
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('```')) {closeList(); output += fence ? '</code></pre>' : '<pre><code>'; fence = !fence; continue;}
    if (fence) {output += escape(line) + '\n'; continue;}
    if (!line.trim()) {closeList(); continue;}
    if (line.startsWith('|')) {
      closeList(); const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      i--; const cells = row => row.split('|').slice(1, -1).map(cell => cell.trim());
      output += '<div class="table-wrap" tabindex="0"><table><thead><tr>' + cells(rows[0]).map(cell => `<th>${inline(cell)}</th>`).join('') + '</tr></thead><tbody>';
      for (const row of rows.slice(2)) output += '<tr>' + cells(row).map(cell => `<td>${inline(cell)}</td>`).join('') + '</tr>';
      output += '</tbody></table></div>'; continue;
    }
    const heading = line.match(/^(#{1,3}) (.*)$/);
    if (heading) {closeList(); const tag = heading[1].length + 1; output += `<h${tag}>${inline(heading[2])}</h${tag}>`; continue;}
    const bullet = line.match(/^- (.*)$/), ordered = line.match(/^\d+\. (.*)$/);
    if (bullet || ordered) {
      const type = bullet ? 'ul' : 'ol'; if (list !== type) {closeList(); output += `<${type}>`; list = type;}
      output += `<li>${inline((bullet || ordered)[1]).replace(/^\[ \] /, '<span class="check" aria-label="Pendente">□</span> ')}</li>`; continue;
    }
    closeList(); output += `<p>${inline(line)}</p>`;
  }
  closeList(); return output;
}

const labels = ['DADOS E DASHBOARD', 'MAPA E ANÁLISE ESPACIAL', 'SISTEMA COMPLETO E ML'];
const statuses = ['Entregue · base inicial', 'Estamos aqui · mapa entregue', 'Planejada · evolução até a entrega final'];
const columns = parts.slice(1, 4).map((source, index) => {
  const [intro, ...cards] = source.split(/^## /m);
  return `<section class="phase phase-${index + 1}" aria-labelledby="phase-${index + 1}">
    <header class="phase-head"><span class="phase-number">FASE ${index + 1}</span><h2 id="phase-${index + 1}">${labels[index]}</h2><p class="status">${statuses[index]}</p><small>${cards.length} blocos de trabalho</small></header>
    <div class="phase-content" tabindex="0" aria-label="Detalhes da fase ${index + 1}">
      <div class="phase-intro">${markdown(intro.replace(/^# .*\n/, ''))}</div>
      ${cards.map(card => {const split = card.indexOf('\n'); return `<details class="task" open><summary>${inline(card.slice(0, split))}</summary><div class="task-body">${markdown(card.slice(split))}</div></details>`;}).join('')}
    </div></section>`;
}).join('');
const intro = parts[0];
const introStart = intro.indexOf('## Inventário');
const evidence = markdown(intro.slice(introStart));
const decisions = parts[4].split(/^## /m);
const supplemental = decisions.slice(1).map(section => {
  const split = section.indexOf('\n');
  return `<details class="appendix" open><summary>${inline(section.slice(0, split))}</summary><div>${markdown(section.slice(split))}</div></details>`;
}).join('');
const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Roadmap completo · ConservaGO</title>
<style>
:root{color-scheme:light;--ink:#153b33;--muted:#566d66;--line:#dbe5df;--paper:#f4f7f3;--green:#186b50;--blue:#285d9a;--purple:#6c4d91}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.65 system-ui,-apple-system,"Segoe UI",sans-serif}header.hero{padding:44px max(24px,4vw) 32px;background:#123c31;color:#f6faef}.eyebrow{font-size:12px;letter-spacing:2px;color:#c5e5ac;margin:0 0 8px}h1{font-size:clamp(30px,3.4vw,48px);line-height:1.12;margin:0 0 18px;font-weight:650;max-width:950px}.hero p{max-width:1060px;color:#dfede4}.hero strong{color:#fff}.hero-meta{display:flex;gap:12px 24px;flex-wrap:wrap;font-size:13px;color:#c5e5ac}.toolbar{padding:16px max(24px,4vw);display:flex;flex-wrap:wrap;align-items:center;gap:10px;background:#fff;border-bottom:1px solid var(--line)}button,.toolbar a{font:inherit;font-size:13px;border:1px solid #b8cbbf;border-radius:6px;padding:9px 12px;background:white;color:var(--ink);text-decoration:none;cursor:pointer}.toolbar a.primary{background:#186b50;color:white;border-color:#186b50}button:hover,.toolbar a:hover{filter:brightness(.94)}:focus-visible{outline:3px solid #c56c23;outline-offset:3px}.intro-note{margin:22px max(24px,4vw);padding:15px 18px;background:#e8efe6;border-left:4px solid #417b5c;max-width:1400px}.board{padding:0 max(24px,4vw) 32px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;align-items:start}.phase{border:1px solid var(--line);background:white;border-radius:12px;overflow:hidden;box-shadow:0 5px 18px #183b3207}.phase-head{padding:22px 22px 18px;border-top:5px solid var(--green);background:#edf4ec}.phase-2 .phase-head{border-top-color:var(--blue);background:#edf3f9}.phase-3 .phase-head{border-top-color:var(--purple);background:#f4f0f7}.phase-number{font-size:12px;letter-spacing:1.8px;font-weight:700}.phase-head h2{font-size:19px;line-height:1.35;margin:8px 0}.status{font-size:13px;margin:0 0 7px}.phase-head small{color:var(--muted)}.phase-content{max-height:78vh;overflow:auto;scrollbar-gutter:stable;padding:18px}.phase-intro{font-size:13px;color:var(--muted);margin-bottom:18px}.phase-intro p{margin:0}.task{border:1px solid var(--line);border-radius:8px;margin:0 0 13px;break-inside:avoid}.task summary{padding:15px 13px;font-weight:650;font-size:14px;cursor:pointer;line-height:1.5;background:#f9fbf8}.task-body{padding:0 14px 14px;font-size:13px}.task-body p{margin:13px 0}.task-body ul{padding-left:18px}.task-body li{margin:7px 0}.task-body strong{font-weight:650}.below{padding:0 max(24px,4vw) 40px;max-width:1800px;margin:auto}.below>h2{font-size:26px;margin:20px 0 8px}.section-label{color:var(--muted);max-width:1000px}.inventory,.appendix{background:white;border:1px solid var(--line);border-radius:10px;padding:22px;margin-bottom:16px}.appendix summary{font-size:19px;font-weight:650;cursor:pointer}.appendix>div{padding-top:12px}.table-wrap{overflow:auto;margin:18px 0;border:1px solid var(--line);border-radius:6px}table{width:100%;border-collapse:collapse;min-width:680px;font-size:13px}th,td{padding:12px 14px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{background:#edf3ec;font-weight:650}tr:last-child td{border-bottom:0}tbody tr:nth-child(even){background:#fbfcfa}a{color:#255f95;overflow-wrap:anywhere}pre{padding:18px;overflow:auto;background:#f2f5f1;border-radius:6px;font-size:13px}code{font-family:Consolas,monospace}.below li{margin:8px 0}.check{font-size:18px;color:#6c4d91}footer{padding:24px max(24px,4vw);border-top:1px solid var(--line);font-size:12px;color:var(--muted)}@media(min-width:1800px){.board{max-width:2000px;margin:auto}.task-body{font-size:14px}}@media(max-width:1000px){.board{grid-template-columns:repeat(3,minmax(310px,1fr));overflow-x:auto}.phase-content{max-height:72vh}.hero h1{font-size:32px}}@media print{@page{size:A3 landscape;margin:12mm}body{font-size:10pt;background:white}.toolbar,.intro-note{display:none}header.hero{padding:10px 0;background:white;color:#153b33}.hero p,.hero strong,.hero-meta,.eyebrow{color:#153b33}h1{font-size:25pt}.board{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));padding:12px 0;gap:12px;overflow:visible}.phase{overflow:visible;box-shadow:none}.phase-content{max-height:none;overflow:visible;padding:10px}.task{break-inside:auto}.task-body{font-size:9pt}.phase-head{padding:10px}.below{padding:0}.appendix{break-inside:auto}summary{list-style:none}a{color:inherit}.table-wrap{overflow:visible}table{min-width:0;font-size:9pt}footer{padding:12px 0}}
</style></head><body>
<header class="hero"><p class="eyebrow">CONSERVAGO / CERRADO EM LISTA · PLANEJAMENTO DO PROJETO</p><h1>Dos primeiros dados aos mapas de previsão.</h1><p>Três fases, com o caminho completo já percorrido e o trabalho necessário para concluir o sistema. <strong>Estamos na fase 2, com o mapa entregue.</strong> A fase 3 inclui ampliar o histórico e prever, com machine learning, o fogo e a distribuição futura da vegetação.</p><div class="hero-meta"><span>Revisão · 29/10/2026</span><span>34 blocos detalhados</span><span>Status baseado no chat e no repositório</span><span>Sem prazos ou precisão inventados</span></div></header>
<nav class="toolbar" aria-label="Navegação do documento"><a class="primary" href="#fases">Ver as três fases</a><a href="#inventario">Dados atuais</a><a href="#decisoes">Tecnologias e decisões</a><button id="expand" type="button">Expandir detalhes</button><button id="collapse" type="button">Recolher detalhes</button><button id="print" type="button">Imprimir / salvar PDF</button></nav>
<p class="intro-note">Cada coluna possui rolagem própria. Em telas estreitas, role o quadro horizontalmente para ver as três fases. Os blocos podem ser expandidos individualmente. <strong>Previsão de vegetação futura é parte obrigatória da fase 3:</strong> classificar imagens do passado, por si só, não conclui essa entrega.</p>
<main><div class="board" id="fases">${columns}</div><section class="below" id="inventario"><div class="inventory">${evidence}</div><h2 id="decisoes">Tecnologias, dependências e critérios de conclusão</h2><p class="section-label">Propostas técnicas ainda sujeitas à escolha da equipe. A descrição dos recursos atuais foi conferida no projeto; tecnologias futuras não estão implementadas apenas por aparecerem aqui.</p>${supplemental}</section></main>
<footer>Fonte editorial: docs/planejamento/*.md · Documento gerado por scripts/build-roadmap.mjs · O histórico identifica testes executados na entrega anterior; esta revisão do roadmap não executa novos treinamentos ou implantações.</footer>
<script>const details=()=>document.querySelectorAll('details');document.getElementById('expand').onclick=()=>details().forEach(d=>d.open=true);document.getElementById('collapse').onclick=()=>details().forEach(d=>d.open=false);document.getElementById('print').onclick=()=>{details().forEach(d=>d.open=true);window.print()};window.addEventListener('beforeprint',()=>details().forEach(d=>d.open=true));</script>
</body></html>`;

await writeFile(path.join(root, 'docs/roadmap.html'), html);
await writeFile(path.join(root, 'docs/roadmap.md'), '<!-- Gerado por scripts/build-roadmap.mjs; editar docs/planejamento/*.md. -->\n\n' + parts.join('\n\n---\n\n') + '\n');
console.log(`Roadmap gerado: ${parts.join(' ').split(/\s+/).length} palavras; 34 blocos; HTML em três colunas e Markdown completo.`);
