// Verificação obrigatória dos dados das figuras (ver CLAUDE.md, Fase 1).
// Uso: node scripts/verificar.mjs [--sem-rede]
import { readFileSync, existsSync } from 'node:fs';
import { TRACOS, similaridade, ranking, perfilDoAluno } from '../js/calculo.js';

const raiz = new URL('../', import.meta.url);
const figuras = JSON.parse(readFileSync(new URL('figuras.json', raiz), 'utf8'));
const perguntas = JSON.parse(readFileSync(new URL('perguntas.json', raiz), 'utf8'));
const erros = [], avisos = [];
const ok = (cond, msg) => { if (!cond) erros.push(msg); };

// 1. Estrutura
ok(figuras.length === 36, `esperava 36 figuras, há ${figuras.length}`);
ok(new Set(figuras.map((f) => f.id)).size === figuras.length, 'ids repetidos');
ok(new Set(figuras.map((f) => f.titulo)).size === figuras.length, 'títulos repetidos');
for (const f of figuras) {
  const ch = Object.keys(f.tracos ?? {});
  ok(ch.length === 10 && TRACOS.every((t) => ch.includes(t)), `${f.id}: precisa dos 10 traços`);
  for (const t of TRACOS) ok(Number.isFinite(f.tracos[t]) && f.tracos[t] >= 0 && f.tracos[t] <= 5, `${f.id}.${t} fora de 0–5`);
  for (const c of ['id', 'nome', 'pais', 'periodo', 'categoria', 'titulo']) ok(f[c], `${f.id}: falta ${c}`);
  ok(f.card?.qualidades?.length === 3, `${f.id}: precisa de 3 qualidades`);
  for (const c of ['historia', 'fonteFrase', 'ganchoRI']) ok(f.card?.[c], `${f.id}: falta card.${c}`);
  if (!f.card?.frase) avisos.push(`${f.id}: sem frase (${f.card?.fonteFrase})`);
  for (const c of ['bio', 'contexto', 'oQueFez', 'porQueImportaRI']) ok(f.ficha?.[c], `${f.id}: falta ficha.${c}`);
  ok(f.ficha?.curiosidades?.length === 2, `${f.id}: precisa de 2 curiosidades`);
  for (const c of ['url', 'arquivo', 'autor', 'licenca']) ok(f.foto?.[c], `${f.id}: falta foto.${c}`);
  ok(existsSync(new URL(f.foto.arquivo, raiz)), `${f.id}: arquivo de foto não existe`);
}
const cats = Object.groupBy(figuras, (f) => f.categoria);
console.log('Categorias:', Object.entries(cats).map(([k, v]) => `${k} ${v.length}`).join(' | '));

// 2. Similaridade entre pares
const pares = [];
for (let i = 0; i < figuras.length; i++) for (let j = i + 1; j < figuras.length; j++)
  pares.push({ a: figuras[i].id, b: figuras[j].id, s: similaridade(figuras[i].tracos, figuras[j].tracos) });
pares.sort((x, y) => y.s - x.s);
console.log('\nPares mais parecidos:');
for (const p of pares.slice(0, 5)) console.log(`  ${(p.s * 100).toFixed(1)}%  ${p.a} ~ ${p.b}`);
for (const p of pares.filter((p) => p.s > 0.95)) erros.push(`par acima de 95%: ${p.a} ~ ${p.b} (${(p.s * 100).toFixed(1)}%)`);

// 3. Perguntas: 20, 4 alternativas cada, pontuação conforme o CLAUDE.md
ok(perguntas.length === 20, `esperava 20 perguntas, há ${perguntas.length}`);
for (const p of perguntas) {
  ok(p.alternativas.length === 4, `${p.id}: precisa de 4 alternativas`);
  for (const a of p.alternativas) ok(a.pontos ? Object.values(a.pontos).sort().join() === '1,2' : [0, 1.5, 3.5, 5].includes(a.posicao), `${p.id}: pontuação fora do modelo`);
}
const focos = Object.groupBy(perguntas, (p) => p.foco);
console.log('Perguntas por foco:', Object.entries(focos).map(([k, v]) => `${k} ${v.length}`).join(' | '),
  '| cotidiano', perguntas.filter((p) => p.tipo === 'cotidiano').length, '| RI', perguntas.filter((p) => p.tipo === 'ri').length);

// 4. Simulação: 1000 alunos respondendo as perguntas reais ao acaso
let semente = 20261007;
const rand = () => ((semente = (semente * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const alunoAleatorio = () => perfilDoAluno(perguntas, perguntas.map(() => Math.floor(rand() * 4)));
const N = 1000, cont = Object.fromEntries(figuras.map((f) => [f.id, 0]));
for (let i = 0; i < N; i++) cont[ranking(alunoAleatorio(), figuras)[0].figura.id]++;
const dist = Object.entries(cont).sort((a, b) => b[1] - a[1]);
console.log(`\nDistribuição em ${N} alunos simulados:`);
console.log(dist.map(([id, n]) => `  ${id.padEnd(14)} ${(n / N * 100).toFixed(1).padStart(4)}%`).join('\n'));
for (const [id, n] of dist) {
  if (n === 0) erros.push(`${id} inalcançável na simulação`);
  if (n / N > 0.10) erros.push(`${id} passa de 10% (${(n / N * 100).toFixed(1)}%)`);
}

// 5. Fotos: URLs do Commons respondem
if (!process.argv.includes('--sem-rede')) {
  console.log('\nConferindo URLs das fotos...');
  for (const f of figuras) {
    let st = 0;
    for (let t = 0; t < 4 && st !== 200; t++) {
      st = (await fetch(f.foto.url, { method: 'HEAD', headers: { 'User-Agent': 'PassaporteMundial/1.0' } }).catch(() => ({ status: 0 }))).status;
      if (st !== 200) await new Promise((r) => setTimeout(r, 3000 * (t + 1)));
    }
    ok(st === 200, `${f.id}: foto.url respondeu ${st}`);
  }
}

console.log('\n' + (avisos.length ? 'AVISOS:\n  ' + avisos.join('\n  ') + '\n' : ''));
if (erros.length) { console.log('ERROS:\n  ' + erros.join('\n  ')); process.exit(1); }
console.log('Tudo certo.');
