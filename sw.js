// Guarda o site no aparelho para abrir sem internet depois da primeira visita.
// Ao mudar qualquer arquivo, troque a versão abaixo.
const VERSAO = 'passaporte-v12';
const ARQUIVOS = [
  './', 'index.html', 'css/estilo.css', 'js/app.js', 'js/calculo.js', 'js/config.js',
  'figuras.json', 'perguntas.json', 'manifest.webmanifest',
  "fotos/annan.jpg",
  "fotos/aquino.jpg",
  "fotos/ardern.jpg",
  "fotos/arias.jpg",
  "fotos/pandit.jpg",
  "fotos/bunche.jpg",
  "fotos/carter.jpg",
  "fotos/diana.jpg",
  "fotos/eleanor.jpg",
  "fotos/brundtland.jpg",
  "fotos/gandhi.jpg",
  "fotos/gorbachev.jpg",
  "fotos/hammarskjold.jpg",
  "fotos/scholl.jpg",
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
  "fotos/antonieta.jpg",
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
  // cache: 'reload' evita guardar uma cópia velha que ainda esteja no cache do navegador
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const guardada = () => caches.match(e.request, { ignoreSearch: true });
  // Fotos não mudam: usa a cópia guardada. O resto: tenta a rede primeiro (para
  // atualizações aparecerem na hora) e cai na cópia guardada se a rede falhar ou demorar.
  if (new URL(e.request.url).pathname.includes('/fotos/')) {
    e.respondWith(guardada().then((r) => r || fetch(e.request)));
    return;
  }
  const rede = fetch(new Request(e.request.url, { cache: 'no-cache' })).then((r) => {
    if (r.ok) { const copia = r.clone(); caches.open(VERSAO).then((c) => c.put(e.request, copia)); }
    return r;
  });
  const limite = new Promise((ok) => setTimeout(ok, 4000)).then(guardada);
  e.respondWith(Promise.race([rede, limite]).then((r) => r || rede).catch(() => guardada().then((r) => r || Response.error())));
});
