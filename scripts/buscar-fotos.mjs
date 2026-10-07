// Busca a foto principal (licença livre) de cada figura no Wikimedia Commons,
// grava crédito em dados/fotos-meta.json e baixa o original reduzido (~400px).
import { writeFile, mkdir, readFile } from 'node:fs/promises';

const UA = 'PassaporteMundial/1.0 (projeto escolar; contato via github)';
const artigos = {
  mandela: 'Nelson Mandela', merkel: 'Angela Merkel', lincoln: 'Abraham Lincoln',
  kennedy: 'John F. Kennedy', fdr: 'Franklin D. Roosevelt', ardern: 'Jacinda Ardern',
  gorbachev: 'Mikhail Gorbachev', sirleaf: 'Ellen Johnson Sirleaf', carter: 'Jimmy Carter',
  jk: 'Juscelino Kubitschek', pedro2: 'Pedro II of Brazil',
  riobranco: 'José Paranhos, Baron of Rio Branco', ruibarbosa: 'Rui Barbosa',
  nabuco: 'Joaquim Nabuco', lutz: 'Bertha Lutz', vieirademello: 'Sérgio Vieira de Mello',
  annan: 'Kofi Annan', eleanor: 'Eleanor Roosevelt', diana: 'Diana, Princess of Wales',
  malala: 'Malala Yousafzai', mlk: 'Martin Luther King Jr.', gandhi: 'Mahatma Gandhi',
  parks: 'Rosa Parks', tutu: 'Desmond Tutu', maathai: 'Wangari Maathai',
  aquino: 'Corazon Aquino', zilda: 'Zilda Arns', tiradentes: 'Tiradentes',
  zumbi: 'Zumbi', tubman: 'Harriet Tubman',
  hammarskjold: 'Dag Hammarskjöld', brandt: 'Willy Brandt', havel: 'Václav Havel',
  arias: 'Óscar Arias', reboucas: 'André Rebouças', bunche: 'Ralph Bunche',
};
const override = process.argv.slice(2); // id=File:Nome.jpg para trocar a foto

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
async function baixa(url) {
  for (let t = 0; t < 6; t++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.ok) { await espera(1500); return r; }
    await espera(5000 * (t + 1)); // limite de requisições: espera e tenta de novo
  }
  throw new Error('falhou: ' + url);
}
const get = async (url) => (await baixa(url)).json();
const entidades = { '&amp;': '&', '&quot;': '"', '&#39;': "'", '&lt;': '<', '&gt;': '>', '&nbsp;': ' ' };
const limpa = (h = '') => h.replace(/<[^>]*>/g, '').replace(/&[#\w]+;/g, (e) => entidades[e] ?? e).replace(/\s+/g, ' ').trim();

const forced = Object.fromEntries(override.map((a) => a.split(/=(.*)/s).slice(0, 2)));
await mkdir(new URL('../fotos/', import.meta.url), { recursive: true });
await mkdir(new URL('../dados/', import.meta.url), { recursive: true });
const destino = new URL('../dados/fotos-meta.json', import.meta.url);
const meta = JSON.parse(await readFile(destino, 'utf8').catch(() => '{}'));
for (const [id, titulo] of Object.entries(artigos)) {
  if (meta[id] && !forced[id]) continue; // já baixada
  let arquivo = forced[id];
  if (!arquivo) {
    const r = await get(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=name&pilicense=free&redirects=1&titles=${encodeURIComponent(titulo)}`);
    const nome = Object.values(r.query.pages)[0].pageimage;
    if (!nome) { console.log(`${id}: SEM FOTO LIVRE`); continue; }
    arquivo = 'File:' + nome;
  }
  const r = await get(`https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=400&titles=${encodeURIComponent(arquivo)}`);
  const p = Object.values(r.query.pages)[0];
  if (!p.imageinfo) { console.log(`${id}: ${arquivo} NÃO ESTÁ NO COMMONS`); continue; }
  const ii = p.imageinfo[0], m = ii.extmetadata;
  const thumb = await baixa(ii.thumburl);
  await writeFile(new URL(`../fotos/${id}.jpg`, import.meta.url), Buffer.from(await thumb.arrayBuffer()));
  meta[id] = {
    url: ii.descriptionurl,
    arquivo: `fotos/${id}.jpg`,
    autor: limpa(m.Artist?.value) || 'Autor desconhecido',
    licenca: limpa(m.LicenseShortName?.value),
  };
  await writeFile(destino, JSON.stringify(meta, null, 2));
  console.log(`${id}: ${arquivo} | ${meta[id].licenca} | ${meta[id].autor.slice(0, 60)}`);
}
