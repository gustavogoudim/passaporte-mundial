// Gera revisao.html (dados embutidos, abre com dois cliques). Rode após editar figuras.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { TRACOS, NOMES_TRACOS, similaridade } from '../js/calculo.js';
const raiz = new URL('../', import.meta.url);
const figuras = JSON.parse(readFileSync(new URL('figuras.json', raiz), 'utf8'));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const proximo = Object.fromEntries(figuras.map((f) => {
  const [m] = figuras.filter((g) => g !== f).map((g) => [g, similaridade(f.tracos, g.tracos)]).sort((a, b) => b[1] - a[1]);
  return [f.id, `${m[0].nome} (${(m[1] * 100).toFixed(0)}%)`];
}));
const abrev = ['Diál.', 'Firm.', 'Estr.', 'Emp.', 'Paz', 'Igual.', 'Lib.', 'Desenv.', 'Ritmo', 'Quem'];
const linhas = figuras.map((f) => `<tr><td><a href="#${f.id}">${esc(f.nome)}</a><small>${esc(f.categoria)}</small></td>${TRACOS.map((t, i) => `<td class="n n${f.tracos[t]}${i === 4 || i === 8 ? ' sep' : ''}">${f.tracos[t]}</td>`).join('')}<td><small>${esc(proximo[f.id])}</small></td></tr>`).join('');
const cards = figuras.map((f) => `<article id="${f.id}">
  <img src="${esc(f.foto.arquivo)}" alt="Foto de ${esc(f.nome)}" loading="lazy">
  <div><p class="cat">${esc(f.categoria)} · ${esc(f.pais)} · ${esc(f.periodo)}</p>
  <h2>${esc(f.nome)} <span>${esc(f.titulo)}</span></h2>
  <p class="q">${f.card.qualidades.map(esc).join(' · ')}</p>
  <p>${esc(f.card.historia)}</p>
  ${f.card.frase ? `<blockquote>“${esc(f.card.frase)}”<cite>${esc(f.card.fonteFrase)}</cite></blockquote>` : `<p class="alerta">Sem frase: ${esc(f.card.fonteFrase)}</p>`}
  <p class="gancho">${esc(f.card.ganchoRI)}</p>
  <details><summary>Ficha ("Ver mais")</summary>
    <h3>Bio</h3><p>${esc(f.ficha.bio)}</p><h3>Contexto histórico</h3><p>${esc(f.ficha.contexto)}</p>
    <h3>O que fez no mundo</h3><p>${esc(f.ficha.oQueFez)}</p>
    <h3>Curiosidades</h3><ul>${f.ficha.curiosidades.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
    <h3>Por que importa para RI</h3><p>${esc(f.ficha.porQueImportaRI)}</p></details>
  <p class="credito">Foto: ${esc(f.foto.autor)} · ${esc(f.foto.licenca)} · <a href="${esc(f.foto.url)}">Wikimedia Commons</a></p></div>
</article>`).join('\n');
writeFileSync(new URL('revisao.html', raiz), `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Revisão das figuras</title><style>
:root{--fundo:#faf7f0;--texto:#1d2a30;--suave:#5b6b72;--petroleo:#0f4c5c;--ambar:#e0a020;--borda:#ddd5c4}
body{margin:0;background:var(--fundo);color:var(--texto);font:16px/1.5 system-ui,sans-serif}
main{max-width:1100px;margin:auto;padding:16px}h1{color:var(--petroleo);margin-bottom:0}
.tabela{overflow-x:auto}table{border-collapse:collapse;font-size:14px;width:100%}
th,td{padding:4px 6px;border-bottom:1px solid var(--borda);text-align:left}th{position:sticky;top:0;background:var(--fundo)}
td small{display:block;color:var(--suave)}.n{text-align:center;font-weight:600;width:44px}.sep{border-left:2px solid var(--petroleo)}
.n0{background:#fff}.n1{background:#e6f0f2}.n2{background:#c7dde2}.n3{background:#9cc3cc}.n4{background:#5f9cab;color:#fff}.n5{background:#0f4c5c;color:#fff}
article{display:grid;grid-template-columns:120px 1fr;gap:16px;padding:20px 0;border-bottom:1px solid var(--borda)}
article img{width:120px;height:150px;object-fit:cover;border-radius:6px;background:#ccc}
h2{margin:0;font-size:20px}h2 span{color:var(--ambar);font-size:16px;margin-left:6px}.cat{margin:0;color:var(--suave);font-size:13px}
.q{font-weight:600;color:var(--petroleo)}blockquote{margin:8px 0;padding-left:12px;border-left:3px solid var(--ambar);font-style:italic}
cite{display:block;font-size:13px;color:var(--suave);font-style:normal}.gancho{font-weight:600}.alerta{background:#fff3cd;padding:6px}
.credito{font-size:12px;color:var(--suave)}h3{font-size:15px;margin:12px 0 0;color:var(--petroleo)}
@media(max-width:600px){article{grid-template-columns:1fr}}
</style></head><body><main>
<h1>Passaporte Mundial — revisão das figuras</h1>
<p>${figuras.length} figuras. Notas 0–5. Ritmo: 0 = aos poucos, 5 = ruptura. Quem resolve: 0 = governo, 5 = sociedade. A última coluna mostra a figura mais parecida (limite: 95%).</p>
<div class="tabela"><table><thead><tr><th>Figura</th>${abrev.map((a, i) => `<th title="${NOMES_TRACOS[TRACOS[i]]}" class="${i === 4 || i === 8 ? 'sep' : ''}">${a}</th>`).join('')}<th>Mais parecida</th></tr></thead><tbody>${linhas}</tbody></table></div>
${cards}
</main></body></html>
`);
console.log('revisao.html gerado');
