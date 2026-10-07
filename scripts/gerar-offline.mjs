// Gera passaporte-offline.html: o site inteiro num arquivo só (fotos embutidas),
// para mandar por WhatsApp, Bluetooth ou pendrive quando não houver internet.
import { readFileSync, writeFileSync } from 'node:fs';
const raiz = new URL('../', import.meta.url);
const ler = (p) => readFileSync(new URL(p, raiz), 'utf8');
const figuras = JSON.parse(ler('figuras.json')).map((f) => ({
  ...f, foto: { ...f.foto, arquivo: 'data:image/jpeg;base64,' + readFileSync(new URL(f.foto.arquivo, raiz)).toString('base64') },
}));
const dados = JSON.stringify({ figuras, perguntas: JSON.parse(ler('perguntas.json')) });
const js = (ler('js/calculo.js') + '\n' + ler('js/app.js'))
  .replace(/^import .*$/gm, '').replace(/^export /gm, '');
const html = ler('index.html')
  .replace('<link rel="stylesheet" href="css/estilo.css">', `<style>${ler('css/estilo.css')}</style>`)
  .replace('<link rel="manifest" href="manifest.webmanifest">', '')
  .replace('<script type="module" src="js/app.js"></script>',
    `<script>window.DADOS=${dados.replace(/</g, '\\u003c')};</script>\n<script type="module">${js}</script>`);
writeFileSync(new URL('passaporte-offline.html', raiz), html);
console.log(`passaporte-offline.html: ${(html.length / 1024).toFixed(0)} KB`);
