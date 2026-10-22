// Mude este número a cada atualização da ficha para forçar os aparelhos a baixar a nova versão.
const VERSAO = 'v1';
const CACHE = 'ficha-rpg-' + VERSAO;
const ARQUIVOS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith('ficha-rpg-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache primeiro, atualizando em segundo plano (inclui as fontes do Google depois do 1º acesso online).
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const salvo = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
      const rede = fetch(req).then(res => {
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      }).catch(() => null);
      if (salvo) { rede; return salvo; }
      const res = await rede;
      return res || (req.mode === 'navigate' ? cache.match('./index.html') : Response.error());
    })
  );
});
