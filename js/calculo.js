// Cálculo de similaridade entre o perfil do aluno e as figuras.
// Usado pelo site (navegador) e pelos scripts de verificação (Node).

export const TRACOS = [
  'dialogo', 'firmeza', 'estrategia', 'empatia',          // estilo
  'paz', 'igualdade', 'liberdade', 'desenvolvimento',     // causa
  'ritmo', 'quemResolve',                                 // ideológico suave
];
export const NOMES_TRACOS = {
  dialogo: 'Diálogo', firmeza: 'Firmeza', estrategia: 'Estratégia', empatia: 'Empatia',
  paz: 'Paz', igualdade: 'Igualdade e direitos', liberdade: 'Liberdade e democracia',
  desenvolvimento: 'Desenvolvimento', ritmo: 'Ritmo da mudança', quemResolve: 'Quem resolve',
};
const PERFIL = TRACOS.slice(0, 8);
const IDEOLOGIA = TRACOS.slice(8);
export const PESO_IDEOLOGIA = 0.2; // eixo ideológico é só um tempero

function correlacao(a, b) {
  const n = a.length;
  const ma = a.reduce((s, x) => s + x, 0) / n;
  const mb = b.reduce((s, x) => s + x, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return da && db ? num / Math.sqrt(da * db) : 0;
}

// Estilo e causa: compara o FORMATO do perfil (o que se destaca mais),
// pela correlação. Ideologia: compara a POSIÇÃO absoluta nos dois eixos.
// Retorna 0–1.
export function similaridade(aluno, figura) {
  const r = correlacao(PERFIL.map((t) => aluno[t]), PERFIL.map((t) => figura[t]));
  const d = IDEOLOGIA.reduce((s, t) => s + Math.abs(aluno[t] - figura[t]), 0) / (5 * IDEOLOGIA.length);
  return (1 - PESO_IDEOLOGIA) * (r + 1) / 2 + PESO_IDEOLOGIA * (1 - d);
}

export function ranking(aluno, figuras) {
  return figuras
    .map((f) => ({ figura: f, sim: similaridade(aluno, f.tracos) }))
    .sort((a, b) => b.sim - a.sim);
}

// Para exibir: escala os 8 traços do aluno para o mais forte valer 5.
// (Não muda o cálculo, que compara só o formato do perfil.)
export function perfilParaExibir(aluno) {
  const m = Math.max(...PERFIL.map((t) => aluno[t])) || 1;
  return { ...aluno, ...Object.fromEntries(PERFIL.map((t) => [t, (aluno[t] / m) * 5])) };
}

// Traços em que aluno e figura mais se destacam juntos (para "qualidades em comum").
export function tracosEmComum(aluno, figura, n = 3) {
  aluno = perfilParaExibir(aluno);
  return PERFIL
    .map((t) => ({ t, v: Math.min(aluno[t], figura[t]) }))
    .sort((a, b) => b.v - a.v)
    .slice(0, n)
    .map((x) => x.t);
}

// Transforma as respostas (índice da alternativa escolhida por pergunta) no vetor do aluno.
// Estilo e causa: soma de pontos normalizada pelo máximo possível → 0–5.
// Ritmo e Quem resolve: média das posições escolhidas (padrão 2,5).
export function perfilDoAluno(perguntas, respostas) {
  const soma = {}, max = {}, pos = { ritmo: [], quemResolve: [] };
  for (const t of PERFIL) { soma[t] = 0; max[t] = 0; }
  perguntas.forEach((p, i) => {
    if (p.alternativas[0].pontos) {
      for (const t of PERFIL) max[t] += Math.max(0, ...p.alternativas.map((a) => a.pontos[t] ?? 0));
      const a = p.alternativas[respostas[i]];
      if (a) for (const [t, v] of Object.entries(a.pontos)) soma[t] += v;
    } else if (respostas[i] != null) {
      pos[p.foco].push(p.alternativas[respostas[i]].posicao);
    }
  });
  const v = {};
  for (const t of PERFIL) v[t] = max[t] ? (soma[t] / max[t]) * 5 : 0;
  for (const t of IDEOLOGIA) v[t] = pos[t].length ? pos[t].reduce((s, x) => s + x, 0) / pos[t].length : 2.5;
  return v;
}

// "Combinação rara": os dois traços mais fortes do aluno, e quantas figuras têm os dois em 4 ou mais.
export function combinacaoRara(aluno, figuras, limite = 3) {
  aluno = perfilParaExibir(aluno);
  const [a, b] = PERFIL.slice().sort((x, y) => aluno[y] - aluno[x]);
  const n = figuras.filter((f) => f.tracos[a] >= 4 && f.tracos[b] >= 4).length;
  return n <= limite ? { tracos: [a, b], n } : null;
}
