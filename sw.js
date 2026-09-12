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

     OJO: las fotos vienen de otro dominio. Si se piden como lo hace
     un <img> por defecto, la respuesta llega "opaca" y el navegador
     NO deja guardarla. Por eso las pedimos explícitamente con CORS,
     que GitHub permite. Sin esto, las fotos se bajaban de nuevo cada
     vez y cualquier error de red mostraba el ícono de imagen rota.
   ============================================================ */

const VERSION = 'amce-v2';
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

/* Una imagen gris con el ícono de una foto, para cuando no se pudo
   traer. Es mejor que el cuadrito roto del navegador. */
const SIN_FOTO = new Response(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<rect width="100" height="100" fill="#EFEBE1"/>' +
  '<path d="M30 62l14-16 10 11 8-8 12 13z" fill="#CFC8B8"/>' +
  '<circle cx="37" cy="38" r="6" fill="#CFC8B8"/></svg>',
  { headers: { 'Content-Type': 'image/svg+xml' } }
);

async function traerFoto(pedido) {
  const guardada = await caches.match(pedido);
  if (guardada) return guardada;

  try {
    // con CORS la respuesta no es opaca y SÍ se puede guardar
    const resp = await fetch(pedido.url, { mode: 'cors', credentials: 'omit' });
    if (resp && resp.ok) {
      const c = await caches.open(FOTOS);
      await c.put(pedido, resp.clone());
      return resp;
    }
  } catch (e) { /* sin red o falló: caemos al reemplazo */ }

  // último intento tal cual vino, y si no, la imagen de reemplazo
  try {
    const directa = await fetch(pedido);
    if (directa) return directa;
  } catch (e) { /* nada */ }

  return SIN_FOTO.clone();
}

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
    ev.respondWith(traerFoto(ev.request));
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
