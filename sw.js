// Guarda o site no aparelho para abrir sem internet depois da primeira visita.
// Ao mudar qualquer arquivo, troque a versão abaixo.
const VERSAO = 'passaporte-v7';
const ARQUIVOS = [
  './', 'index.html', 'css/estilo.css', 'js/app.js', 'js/calculo.js', 'js/config.js',
  'figuras.json', 'perguntas.json', 'manifest.webmanifest',
  "fotos/annan.jpg",
  "fotos/aquino.jpg",
  "fotos/ardern.jpg",
  "fotos/arias.jpg",
  "fotos/brandt.jpg",
  "fotos/bunche.jpg",
  "fotos/carter.jpg",
  "fotos/diana.jpg",
  "fotos/eleanor.jpg",
  "fotos/fdr.jpg",
  "fotos/gandhi.jpg",
  "fotos/gorbachev.jpg",
  "fotos/hammarskjold.jpg",
  "fotos/havel.jpg",
  "fotos/jk.jpg",
  "fotos/kennedy.jpg",
  "fotos/lincoln.jpg",
  "fotos/lutz.jpg",
  "fotos/maathai.jpg",
  "fotos/malala.jpg",
  "fotos/mandela.jpg",
  "fotos/merkel.jpg",
  "fotos/mlk.jpg",
  "fotos/nabuco.jpg",
  "fotos/parks.jpg",
  "fotos/pedro2.jpg",
  "fotos/reboucas.jpg",
  "fotos/riobranco.jpg",
  "fotos/ruibarbosa.jpg",
  "fotos/sirleaf.jpg",
  "fotos/tiradentes.jpg",
  "fotos/tubman.jpg",
  "fotos/tutu.jpg",
  "fotos/vieirademello.jpg",
  "fotos/zilda.jpg",
  "fotos/zumbi.jpg",
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request)));
});
