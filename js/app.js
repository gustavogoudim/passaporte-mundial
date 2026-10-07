import { TRACOS, NOMES_TRACOS, ranking, tracosEmComum, perfilDoAluno, combinacaoRara, perfilParaExibir } from './calculo.js';

const CHAVE = 'passaporte:v1';
const CATEGORIAS = ['Líder de Estado', 'Diplomacia', 'Ativismo e resistência'];
const $ = (sel, raiz = document) => raiz.querySelector(sel);
const el = (tag, { dataset, ...props } = {}, ...filhos) => {
  const e = Object.assign(document.createElement(tag), props);
  if (dataset) Object.assign(e.dataset, dataset);
  e.append(...filhos);
  return e;
};

let figuras = [], perguntas = [];
let estado = { respostas: [], atual: 0 };
let resultado = null; // { aluno, ranking }

// ---------- armazenamento local (só neste aparelho) ----------
const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch {} };
const ler = () => { try { return JSON.parse(localStorage.getItem(CHAVE)); } catch { return null; } };
const apagar = () => { try { localStorage.removeItem(CHAVE); } catch {} };

// ---------- navegação entre telas ----------
function mostrar(id) {
  for (const t of document.querySelectorAll('.tela')) t.hidden = t.id !== id;
  window.scrollTo(0, 0);
  const foco = $(`#${id} h1, #${id} h2`);
  if (foco) { foco.tabIndex = -1; foco.focus({ preventScroll: true }); }
}

// ---------- perguntas ----------
function mostrarPergunta() {
  const i = estado.atual, p = perguntas[i], tela = $('#tela-pergunta');
  const feito = `${(i / (perguntas.length - 1)) * 100}%`;
  $('.rota-feito', tela).style.width = feito;
  $('.aviao', tela).style.left = feito;
  $('.rota', tela).setAttribute('aria-valuenow', i + 1);
  $('.contador', tela).textContent = `Pergunta ${i + 1} de ${perguntas.length}`;
  const tag = $('.tag-tipo', tela);
  tag.textContent = p.tipo === 'ri' ? '🌍 Missão internacional' : '🏫 No dia a dia';
  tag.className = `tag-tipo ${p.tipo}`;
  const cartao = $('.cartao-pergunta', tela);
  cartao.classList.remove('entrando'); void cartao.offsetWidth; cartao.classList.add('entrando');
  $('.enunciado', tela).textContent = p.texto;
  const lista = $('.alternativas', tela);
  lista.replaceChildren(...p.alternativas.map((a, k) => el('button', {
    className: 'alt', type: 'button', textContent: a.texto,
    onclick: (e) => responder(k, e.currentTarget),
  })));
  lista.querySelectorAll('.alt').forEach((b, k) => {
    b.setAttribute('role', 'listitem');
    b.setAttribute('aria-pressed', String(estado.respostas[i] === k));
  });
  $('.voltar', tela).hidden = i === 0;
  mostrar('tela-pergunta');
}

const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
const espera = (ms) => new Promise((r) => setTimeout(r, calmo ? 0 : ms));
let ocupado = false;

async function responder(k, botao) {
  if (ocupado) return;
  ocupado = true;
  estado.respostas[estado.atual] = k;
  botao?.classList.add('escolhida');
  await espera(280);
  ocupado = false;
  if (estado.atual < perguntas.length - 1) {
    estado.atual++;
    salvar();
    mostrarPergunta();
  } else {
    estado.terminou = true;
    salvar();
    revelar();
  }
}

// suspense: fotos passando rápido, desacelerando, até o resultado
async function revelar() {
  mostrar('tela-revelando');
  const img = $('#tela-revelando .roleta img'), nome = $('#tela-revelando .revelando-nome');
  const frases = ['Carimbando seu passaporte…', 'Comparando com 36 figuras…', 'Quase lá…'];
  let atraso = 70;
  for (let i = 0; i < 16 && !calmo; i++) {
    const f = figuras[(i * 7) % figuras.length];
    img.src = fotoDe(f);
    nome.textContent = f.nome;
    $('#tela-revelando .revelando-texto').textContent = frases[Math.min(2, Math.floor(i / 6))];
    await espera(atraso);
    atraso *= 1.13;
  }
  calcularEMostrar(true);
}

// ---------- resultado ----------
const pct = (s) => `${Math.round(s * 100)}%`;
const fotoDe = (f) => f.foto.arquivo;
const creditoDe = (f) => `Foto: ${f.foto.autor} · ${f.foto.licenca} · Wikimedia Commons`;

function calcularEMostrar(festa) {
  const aluno = perfilDoAluno(perguntas, estado.respostas);
  resultado = { aluno, ranking: ranking(aluno, figuras) };
  history.replaceState(null, '', `#r=${resultado.ranking[0].figura.id}`);
  renderResultado(resultado.ranking[0].figura, true);
  if (festa) setTimeout(confete, calmo ? 0 : 900);
}

function renderResultado(f, completo) {
  const tela = $('#tela-resultado');
  const img = $('.visto .foto', tela);
  img.src = fotoDe(f);
  img.alt = `Retrato de ${f.nome}`;
  $('#res-nome').textContent = f.nome;
  $('.visto .kicker', tela).textContent = completo ? 'Você se parece com' : 'Resultado compartilhado';
  $('.visto .titulo', tela).textContent = f.titulo;
  $('.visto .origem', tela).textContent = `${f.pais} · ${f.periodo}`;
  $('.visto .qualidades', tela).replaceChildren(...f.card.qualidades.map((q) => el('li', { textContent: q })));
  $('.visto .historia', tela).textContent = f.card.historia;
  const bq = $('.visto .frase', tela);
  $('p', bq).textContent = f.card.frase ? `“${f.card.frase}”` : '';
  $('p', bq).hidden = !f.card.frase;
  $('cite', bq).textContent = f.card.frase ? f.card.fonteFrase : f.card.fonteFrase;
  $('.visto .gancho', tela).textContent = f.card.ganchoRI;
  $('.visto .credito', tela).textContent = creditoDe(f);
  $('[data-acao="ficha"]', tela).onclick = () => abrirFicha(f);

  // blocos que dependem das respostas do aluno
  const emComum = $('.em-comum', tela);
  for (const sel of ['.em-comum', '.comparacao', '.rara', '.compartilhar']) $(sel, tela).hidden = !completo;
  $('.top3', tela).closest('.bloco').hidden = !completo;
  $('.por-categoria', tela).closest('.bloco').hidden = !completo;
  $('.visto-num', tela).textContent = `Nº ${String(figuras.indexOf(f) + 1).padStart(2, '0')}/${figuras.length}`;
  $('[data-acao="refazer"]', tela).textContent = completo ? 'Refazer o teste' : 'Fazer o teste';

  if (completo) {
    const { aluno, ranking: rk } = resultado;
    $('.chips', emComum).replaceChildren(...tracosEmComum(aluno, f.tracos).map((t) => el('li', { textContent: NOMES_TRACOS[t] })));

    const rara = combinacaoRara(aluno, figuras), caixa = $('.rara', tela);
    caixa.hidden = !rara;
    if (rara) {
      const [a, b] = rara.tracos.map((t) => NOMES_TRACOS[t]);
      caixa.textContent = rara.n === 0
        ? `✨ Combinação rara: você junta ${a} e ${b} com uma força que nenhuma das ${figuras.length} figuras tem ao mesmo tempo.`
        : `✨ Combinação rara: você junta ${a} e ${b}. Só ${rara.n} das ${figuras.length} figuras têm essas duas marcas tão fortes.`;
    }

    $('.nome-fig', tela).textContent = f.nome;
    $('.barras', tela).replaceChildren(...TRACOS.slice(0, 8).map((t) => el('div', { className: 'traco' },
      el('div', { className: 'traco-nome', textContent: NOMES_TRACOS[t] }),
      linhaBarra('voce', 'Você', perfilParaExibir(aluno)[t]),
      linhaBarra('fig', 'Figura', f.tracos[t]),
    )));

    $('.top3', tela).replaceChildren(...rk.slice(0, 3).map((r) => itemFigura(r.figura, r.sim)));
    $('.por-categoria', tela).replaceChildren(...CATEGORIAS.map((c) => {
      const r = rk.find((x) => x.figura.categoria === c && x.figura !== f);
      return itemFigura(r.figura, r.sim, c);
    }));
    const texto = `No Passaporte Mundial, eu me pareço com ${f.nome}, "${f.titulo}"! Com qual figura você se parece?`;
    const url = location.href, t = encodeURIComponent(texto), u = encodeURIComponent(url);
    $('.rede.whatsapp', tela).href = `https://wa.me/?text=${t}%20${u}`;
    $('.rede.telegram', tela).href = `https://t.me/share/url?url=${u}&text=${t}`;
    $('.rede.x', tela).href = `https://twitter.com/intent/tweet?text=${t}&url=${u}`;
    $('.rede.facebook', tela).href = `https://www.facebook.com/sharer/sharer.php?u=${u}`;
  }
  mostrar('tela-resultado');
  animarNumeros(tela);
}

// barras crescendo e porcentagens contando
function animarNumeros(tela) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    tela.querySelectorAll('.trilho').forEach((t, i) => {
      setTimeout(() => { t.firstChild.style.width = `${t.dataset.w}%`; }, calmo ? 0 : 400 + i * 40);
    });
  }));
  tela.querySelectorAll('.pct').forEach((n) => {
    const alvo = +n.dataset.alvo, inicio = performance.now(), dur = calmo ? 0 : 1100;
    const passo = (agora) => {
      const k = dur ? Math.min(1, (agora - inicio) / dur) : 1;
      n.textContent = `${Math.round(alvo * (1 - (1 - k) ** 3))}%`;
      if (k < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  });
}

// confete leve, sem biblioteca
function confete() {
  if (calmo) return;
  const c = $('#confete'), g = c.getContext('2d');
  c.width = innerWidth; c.height = innerHeight;
  const cores = ['#ffb627', '#2ec4b6', '#8b5cf6', '#ff8fab', '#ffffff'];
  const ps = Array.from({ length: 140 }, () => ({
    x: c.width / 2, y: c.height / 3, vx: (Math.random() - .5) * 14, vy: Math.random() * -14 - 4,
    r: Math.random() * 6 + 4, a: Math.random() * 6, va: (Math.random() - .5) * .3, cor: cores[Math.floor(Math.random() * cores.length)],
  }));
  const fim = performance.now() + 3200;
  const quadro = (agora) => {
    g.clearRect(0, 0, c.width, c.height);
    for (const p of ps) {
      p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va;
      g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.cor;
      g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); g.restore();
    }
    if (agora < fim) requestAnimationFrame(quadro); else g.clearRect(0, 0, c.width, c.height);
  };
  requestAnimationFrame(quadro);
}

function linhaBarra(classe, rotulo, valor) {
  const v = Math.max(0, Math.min(5, valor));
  return el('div', { className: `linha ${classe}`, role: 'img', ariaLabel: `${rotulo}: ${v.toFixed(1)} de 5` },
    el('div', { className: 'trilho', dataset: { w: (v / 5) * 100 } }, el('span')),
    el('span', { textContent: v.toFixed(1).replace('.', ',') }),
  );
}

function itemFigura(f, sim, rotulo) {
  return el('li', {}, el('button', { type: 'button', onclick: () => abrirFicha(f) },
    el('img', { src: fotoDe(f), alt: '', loading: 'lazy' }),
    el('span', {}, f.nome, el('small', { textContent: rotulo ?? f.titulo })),
    el('span', { className: 'pct', textContent: '0%', ariaLabel: `${pct(sim)} parecido`, dataset: { alvo: Math.round(sim * 100) } }),
  ));
}

// ---------- ficha ("Ver mais") ----------
function abrirFicha(f) {
  const d = $('#ficha');
  const img = $('.foto', d);
  img.src = fotoDe(f);
  img.alt = `Retrato de ${f.nome}`;
  $('#ficha-nome').textContent = f.nome;
  $('.titulo', d).textContent = f.titulo;
  $('.origem', d).textContent = `${f.pais} · ${f.periodo} · ${f.categoria}`;
  $('.f-bio', d).textContent = f.ficha.bio;
  $('.f-contexto', d).textContent = f.ficha.contexto;
  $('.f-oquefez', d).textContent = f.ficha.oQueFez;
  $('.f-curiosidades', d).replaceChildren(...f.ficha.curiosidades.map((c) => el('li', { textContent: c })));
  $('.f-ri', d).textContent = f.ficha.porQueImportaRI;
  $('.credito', d).textContent = creditoDe(f);
  d.showModal();
  d.scrollTop = 0;
}

// ---------- imagem para compartilhar ----------
async function gerarImagem() {
  const f = resultado.ranking[0].figura, W = 1080, H = 1920;
  const c = el('canvas', { width: W, height: H }), g = c.getContext('2d');
  const fonte = (peso, tam) => `${peso} ${tam}px system-ui, -apple-system, Roboto, sans-serif`;
  const fundo = g.createLinearGradient(0, 0, 0, H);
  fundo.addColorStop(0, '#143a63'); fundo.addColorStop(1, '#0b1f3a');
  g.fillStyle = fundo; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.7)';
  for (let i = 0; i < 90; i++) { g.beginPath(); g.arc((i * 337) % W, (i * 521) % H, (i % 3) + 1, 0, 7); g.fill(); }
  g.textAlign = 'center';
  g.fillStyle = '#2ec4b6'; g.font = fonte(800, 34); g.fillText('✈  PASSAPORTE MUNDIAL  ✈', W / 2, 150);
  g.fillStyle = '#e8eef7'; g.font = fonte(600, 40); g.fillText('Com qual figura você se parece?', W / 2, 215);

  const foto = await new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = fotoDe(f); });
  const fx = W / 2 - 230, fy = 300, fw = 460, fh = 575;
  const moldura = g.createLinearGradient(fx, fy, fx + fw, fy + fh);
  moldura.addColorStop(0, '#ffb627'); moldura.addColorStop(1, '#2ec4b6');
  g.fillStyle = moldura; g.beginPath(); g.roundRect(fx - 14, fy - 14, fw + 28, fh + 28, 40); g.fill();
  g.save(); g.beginPath(); g.roundRect(fx, fy, fw, fh, 30); g.clip();
  if (foto) {
    const s = Math.max(fw / foto.width, fh / foto.height);
    g.drawImage(foto, fx + (fw - foto.width * s) / 2, fy + (fh - foto.height * s) / 2, foto.width * s, foto.height * s);
  } else { g.fillStyle = '#d6e6ea'; g.fill(); }
  g.restore();

  g.save(); g.translate(W - 250, 420); g.rotate(0.25);
  g.strokeStyle = '#b45309'; g.lineWidth = 10; g.fillStyle = 'rgba(255,250,240,.95)';
  g.beginPath(); g.roundRect(-150, -70, 300, 140, 18); g.fill(); g.stroke();
  g.fillStyle = '#b45309'; g.font = fonte(900, 46); g.fillText('VISTO', 0, -8); g.fillText('APROVADO', 0, 46);
  g.restore();

  g.fillStyle = '#b9c6da'; g.font = fonte(600, 42); g.fillText('Eu me pareço com', W / 2, 990);
  g.fillStyle = '#ffffff'; g.font = fonte(900, f.nome.length > 20 ? 64 : 78); g.fillText(f.nome, W / 2, 1080);
  g.fillStyle = '#ffb627'; g.font = fonte(800, 54); g.fillText(f.titulo, W / 2, 1155);

  const comuns = tracosEmComum(resultado.aluno, f.tracos).map((t) => NOMES_TRACOS[t]);
  g.fillStyle = '#2ec4b6'; g.font = fonte(800, 30); g.fillText('EM COMUM', W / 2, 1255);
  g.fillStyle = '#e8eef7'; g.font = fonte(700, 40); g.fillText(comuns.join(' · '), W / 2, 1312);

  g.fillStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.roundRect(90, 1380, W - 180, 330, 30); g.fill();
  g.textAlign = 'left'; g.fillStyle = '#2ec4b6'; g.font = fonte(800, 30); g.fillText('MEU TOP 3', 140, 1440);
  resultado.ranking.slice(0, 3).forEach((r, k) => {
    const y = 1515 + k * 70;
    g.fillStyle = '#ffffff'; g.font = fonte(700, 42); g.fillText(`${['🥇', '🥈', '🥉'][k]} ${r.figura.nome}`, 140, y);
    g.textAlign = 'right'; g.fillStyle = '#ffb627'; g.font = fonte(900, 42); g.fillText(pct(r.sim), W - 140, y);
    g.textAlign = 'left';
  });
  g.textAlign = 'center'; g.fillStyle = '#ffffff'; g.font = fonte(800, 40); g.fillText('E você? Faça o teste!', W / 2, 1790);
  g.fillStyle = '#b9c6da'; g.font = fonte(500, 24);
  g.fillText(creditoDe(f).slice(0, 90), W / 2, 1860);

  const blob = await new Promise((ok) => c.toBlob(ok, 'image/png'));
  const arquivo = new File([blob], `passaporte-${f.id}.png`, { type: 'image/png' });
  if (navigator.canShare?.({ files: [arquivo] })) {
    try { await navigator.share({ files: [arquivo], title: 'Passaporte Mundial' }); return; } catch {}
  }
  const a = el('a', { href: URL.createObjectURL(blob), download: arquivo.name });
  document.body.append(a); a.click(); a.remove();
}

async function copiarLink() {
  const msg = $('.aviso-copia');
  try { await navigator.clipboard.writeText(location.href); msg.textContent = 'Link copiado!'; }
  catch { msg.textContent = `Copie este link: ${location.href}`; }
}

// ---------- início ----------
function comecar(continuar) {
  if (!continuar) { estado = { respostas: [], atual: 0 }; apagar(); }
  history.replaceState(null, '', location.pathname);
  mostrarPergunta();
}

let telaAntesDoComo = 'tela-inicio';
const acoes = {
  comecar: () => comecar(false),
  continuar: () => (estado.terminou ? calcularEMostrar() : comecar(true)),
  voltar: () => { if (estado.atual > 0) { estado.atual--; salvar(); mostrarPergunta(); } },
  ficha: () => {},
  'fechar-ficha': () => $('#ficha').close(),
  imagem: () => gerarImagem(),
  link: () => copiarLink(),
  refazer: () => { apagar(); estado = { respostas: [], atual: 0 }; history.replaceState(null, '', location.pathname); iniciar(); },
  como: () => { telaAntesDoComo = [...document.querySelectorAll('.tela')].find((t) => !t.hidden)?.id ?? 'tela-inicio'; mostrar('tela-como'); },
  'fechar-como': () => mostrar(telaAntesDoComo),
};
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-acao]');
  if (b && acoes[b.dataset.acao] && !b.onclick) acoes[b.dataset.acao]();
});
$('#ficha').addEventListener('click', (e) => { if (e.target.id === 'ficha') e.target.close(); });

function iniciar() {
  const salvo = ler();
  if (salvo?.respostas?.length) estado = salvo;
  const compartilhado = location.hash.match(/^#r=([\w-]+)/)?.[1];
  if (compartilhado && !salvo?.terminou) {
    const f = figuras.find((x) => x.id === compartilhado);
    if (f) return renderResultado(f, false);
  }
  if (salvo?.terminou) return calcularEMostrar();
  $('[data-acao="continuar"]').hidden = !salvo?.respostas?.length;
  const faixa = $('.esteira-faixa');
  if (!faixa.children.length) {
    const fotos = figuras.map((f) => el('img', { src: fotoDe(f), alt: '', loading: 'lazy' }));
    faixa.append(...fotos, ...fotos.map((i) => i.cloneNode()));
  }
  mostrar('tela-inicio');
}

async function carregar() {
  if (window.DADOS) return window.DADOS; // versão offline em arquivo único
  const [f, p] = await Promise.all(['figuras.json', 'perguntas.json'].map((u) => fetch(u).then((r) => r.json())));
  return { figuras: f, perguntas: p };
}

carregar().then((d) => {
  ({ figuras, perguntas } = d);
  iniciar();
}).catch(() => {
  $('#tela-carregando .carregando').textContent = 'Não foi possível carregar o teste. Verifique a internet e recarregue a página.';
});

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
