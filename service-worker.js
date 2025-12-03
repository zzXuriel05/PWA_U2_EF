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
        return cache.addAll(cacheAssets).catch(err => {
          console.warn('SW4: Algunos assets no pudieron ser cacheados:', err);
          return Promise.resolve();
        });
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
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(response => response || new Response('Offline - recurso no disponible', { status: 503 }));
      })
  );
});

// Escuchar mensajes del main.js
self.addEventListener('message', event => {
  if (!event.data) return;

  // Cuando reciba el tipo MOSTRAR_NOTIFICACION
  if (event.data.type === 'MOSTRAR_NOTIFICACION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, options)
      .then(() => console.log('Notificación mostrada correctamente'))
      .catch(err => console.error('Error mostrando notificación:', err));
  }
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', event => {
  console.log('Notificación clickeada:', event.notification.tag);
  
  if (event.action === 'close') {
    event.notification.close();
    return;
  }

  event.notification.close();
  
  // Abrir la ventana/pestaña
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Si ya existe una ventana, enfocarla
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no existe, crear una nueva
        if (clients.openWindow) {
          return clients.openWindow('./');
        }
      })
  );
});

// Manejar cerrar notificaciones
self.addEventListener('notificationclose', event => {
  console.log('Notificación cerrada:', event.notification.tag);
});


