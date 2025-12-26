// Service Worker Simplificado para Deploy
const CACHE_NAME = 'txopito-ia-v2';

// Install - cache básico
self.addEventListener('install', (event) => {
  console.log('SW: Install');
  self.skipWaiting();
});

// Activate - limpar cache antigo
self.addEventListener('activate', (event) => {
  console.log('SW: Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - sem cache agressivo para evitar problemas
self.addEventListener('fetch', (event) => {
  // Apenas para requests GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Não cachear API calls
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request).catch(() => {
      // Fallback apenas para navegação
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});