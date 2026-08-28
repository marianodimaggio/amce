/* ============================================================
   AMCE — service worker
   Hace que la app abra y funcione sin conexión.

   Dos estrategias distintas, a propósito:

   · La app (html, js, íconos): primero la red, y si no hay, el
     guardado. Así, con internet siempre ves la última versión
     que subiste a GitHub, y sin internet la app abre igual.

   · Las fotos de los ejercicios: primero el guardado. No cambian
     nunca y son lo más pesado, así que una vez vistas quedan en
     el teléfono para siempre.
   ============================================================ */

const VERSION = 'amce-v1';
const APP = VERSION + '-app';
const FOTOS = VERSION + '-fotos';

const BASICOS = [
  './',
  './index.html',
  './app.js',
  './datos.js',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(APP)
      .then(c => c.addAll(BASICOS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())   // si algo falla, igual se instala
  );
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(claves => Promise.all(
        claves.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

const esFoto = url =>
  url.hostname === 'raw.githubusercontent.com' || /\.(jpg|jpeg|png|webp)$/i.test(url.pathname);

self.addEventListener('fetch', ev => {
  if (ev.request.method !== 'GET') return;

  const url = new URL(ev.request.url);

  // las tipografías de Google y cualquier otro dominio: se dejan pasar
  if (url.origin !== location.origin && !esFoto(url)) {
    ev.respondWith(
      fetch(ev.request).catch(() => caches.match(ev.request))
    );
    return;
  }

  // fotos de ejercicios: primero lo guardado
  if (esFoto(url)) {
    ev.respondWith(
      caches.match(ev.request).then(guardada => {
        if (guardada) return guardada;
        return fetch(ev.request).then(resp => {
          caches.open(FOTOS).then(c => c.put(ev.request, resp.clone()));
          return resp;
        });
      })
    );
    return;
  }

  // la app: primero la red, para que los cambios se vean enseguida
  ev.respondWith(
    fetch(ev.request)
      .then(resp => {
        if (resp && resp.ok) {
          const copia = resp.clone();
          caches.open(APP).then(c => c.put(ev.request, copia));
        }
        return resp;
      })
      .catch(() => caches.match(ev.request).then(g => g || caches.match('./index.html')))
  );
});
