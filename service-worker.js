const CACHE_NAME = 'sw4-cache-v1';
const cacheAssets = [
  './',
  './index.html',
  './pagina1.html',
  './pagina2.html',
  './pagina3.html',
  './styles.css',
  './main.js',
  './manifest.webmanifest',
  './img/logo.png',
  './img/logo2.png',
  './img/PartyFavors.jpg', 
  './img/IamTheDog.jpg',
  './img/STN.webp',
  './img/SirChloe_.jpg',
  './img/Iatd.jpg',
  './img/11.jpg'
];

// Iconos PWA
cacheAssets.push(
  './icons/icon-192.png',
  './icons/icon-256.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon-180.png',
  './favicon-512.png'
);

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('SW4: Instalando y cacheando assets iniciales...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(cacheAssets);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('SW4: Error al cachear', err))
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('SW4: Activado');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('SW4: Borrando caché antigua', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia Network First con fallback a caché
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Escuchar mensajes del main.js
self.addEventListener('message', event => {
  if (!event.data) return;

  // Cuando reciba el tipo MOSTRAR_NOTIFICACION
  if (event.data.type === 'MOSTRAR_NOTIFICACION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
});


