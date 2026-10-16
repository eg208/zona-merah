/* Zona Merah — service worker
   Semua file game disimpan saat pertama dibuka, lalu dimainkan dari cache (bisa offline).
   Saat merilis versi baru, naikkan angka VERSION supaya HP pemain mengunduh ulang. */
const VERSION = 'zona-merah-v1';
const FILES = [
  './',
  './index.html',
  './three.min.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './fonts/chakra-petch-latin-400-normal.woff2',
  './fonts/chakra-petch-latin-600-normal.woff2',
  './fonts/chakra-petch-latin-700-normal.woff2',
  './fonts/saira-stencil-one-latin-400-normal.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if(url.origin !== location.origin) return;
  // halaman: coba jaringan dulu (dapat versi terbaru), kalau offline pakai cache
  if(e.request.mode === 'navigate'){
    e.respondWith(
      fetch(e.request)
        .then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); return r; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  // aset: cache dulu, jaringan sebagai cadangan
  e.respondWith(caches.match(e.request, {ignoreSearch:true}).then(hit => hit || fetch(e.request)));
});
