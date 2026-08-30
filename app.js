/* ============================================================
   AMCE — lógica de la aplicación
   Todo se guarda en el navegador de Emilia (localStorage).
   Nada sale del teléfono.
   ============================================================ */

const $  = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
const CLAVE = 'amce.v1';

/* ---------- almacenamiento ---------- */

const almacen = {
  leer() {
    try {
      const crudo = localStorage.getItem(CLAVE);
      return crudo ? JSON.parse(crudo) : { sesiones: [] };
    } catch (e) {
      console.warn('No se pudo leer el historial:', e);
      return { sesiones: [] };
    }
  },
  guardar(datos) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(datos));
      return true;
    } catch (e) {
      console.warn('No se pudo guardar:', e);
      return false;
    }
  }
};

let datos = almacen.leer();

/* ---------- utilidades ---------- */

const foto = (id, n) => BASE_IMG + id + '/' + n + '.jpg';

function hoyISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function fechaLarga() {
  const d = new Date();
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return dias[d.getDay()] + ' ' + d.getDate() + ' de ' + meses[d.getMonth()];
}

/* Qué día propone la app: el siguiente al último que hizo. */
function diaSugerido() {
  const ult = datos.sesiones[datos.sesiones.length - 1];
  if (!ult) return 0;
  const idx = DIAS.findIndex(d => d.n === ult.dia);
  return idx === -1 ? 0 : (idx + 1) % DIAS.length;
}

/* Qué opción propone: la que hace más tiempo que no hace.
   Así la variedad sale sola, sin que ella tenga que acordarse. */
function opcionSugerida(iDia) {
  const ops = DIAS[iDia].opciones;
  let elegida = 0, masVieja = Infinity;
  ops.forEach((o, k) => {
    let ultima = -1;
    datos.sesiones.forEach((s, n) => { if (s.opcion === o.id) ultima = n; });
    if (ultima < masVieja) { masVieja = ultima; elegida = k; }
  });
  return elegida;
}

/* Cuándo hizo cada opción por última vez, para mostrarlo. */
function ultimaVez(idOpcion) {
  for (let i = datos.sesiones.length - 1; i >= 0; i--) {
    if (datos.sesiones[i].opcion === idOpcion) return datos.sesiones[i].fecha;
  }
  return null;
}

function haceCuanto(fechaISO) {
  if (!fechaISO) return 'nunca la hiciste';
  const dias = Math.round((new Date(hoyISO()) - new Date(fechaISO)) / 86400000);
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 7) return 'hace ' + dias + ' días';
  const sem = Math.floor(dias / 7);
  return 'hace ' + sem + (sem === 1 ? ' semana' : ' semanas');
}

/* Último peso usado en un ejercicio, mirando todas las sesiones. */
function ultimoPeso(idEjercicio) {
  for (let i = datos.sesiones.length - 1; i >= 0; i--) {
    const e = (datos.sesiones[i].ejercicios || []).find(x => x.id === idEjercicio);
    if (e) {
      const conPeso = e.series.filter(s => s.peso !== null && s.peso !== undefined);
      if (conPeso.length) return conPeso[conPeso.length - 1].peso;
    }
  }
  return null;
}

/* Historial de un ejercicio: peso máximo por sesión. */
function historial(idEjercicio) {
  const filas = [];
  datos.sesiones.forEach(s => {
    const e = (s.ejercicios || []).find(x => x.id === idEjercicio);
    if (!e) return;
    const pesos = e.series.map(x => x.peso).filter(p => p !== null && p !== undefined);
    if (pesos.length) filas.push({ fecha: s.fecha, max: Math.max.apply(null, pesos) });
  });
  return filas;
}

/* ---------- estado de la sesión en curso ---------- */

let rutina = null;   // rutina que se está haciendo
let nDia = null;     // número de día de esa rutina
let plan = [];       // ejercicios de la sesión, ya resueltos contra el catálogo
let i = 0;           // ejercicio actual

function armarPlan(d) {
  return d.ejercicios.map(item => {
    const cat = CATALOGO[item.id];
    return {
      id: item.id,
      nombre: cat.nombre,
      slot: cat.slot,
      carga: cat.carga,
      tiempo: !!cat.tiempo,
      lumbar: !!cat.lumbar,
      claves: cat.claves,
      alts: item.alts || [],
      minutos: item.minutos || null,
      objetivoSeries: item.series || null,
      objetivoReps: item.reps || null,
      series: item.series
        ? Array.from({ length: item.series }, () => ({ peso: null, reps: item.reps, hecha: false }))
        : null
    };
  });
}

/* ---------- navegación ---------- */

function ver(id) {
  $$('.pantalla').forEach(p => p.classList.toggle('on', p.id === id));
  $$('.hoja').forEach(h => h.classList.remove('on'));
  const sc = $('#' + id + ' .scroll');
  if (sc) sc.scrollTop = 0;
}

/* ============================================================
   PANTALLA: HOY
   ============================================================ */

let diaVisto = 0;         // índice del día que se está mirando
let opcionElegida = 0;    // índice de la rutina seleccionada

function pintarDias() {
  $('#dias').innerHTML = DIAS.map((d, k) =>
    '<button data-dia="' + k + '" aria-pressed="' + (k === diaVisto) + '">' +
      '<span class="s">Día</span>' + d.n +
    '</button>').join('');
  $('#regionDia').textContent = DIAS[diaVisto].region + ' · ' + DIAS[diaVisto].resumen;
}

function pintarOpciones() {
  const ops = DIAS[diaVisto].opciones;
  $('#opciones').innerHTML = ops.map((o, k) =>
    '<button class="jornada" data-opcion="' + k + '" aria-pressed="' + (k === opcionElegida) + '">' +
      '<span class="num">' + (k + 1) + '</span>' +
      '<span class="cuerpo">' +
        '<span class="tit">' + o.titulo + '</span>' +
        '<span class="gs">' + o.grupos.map(g => '<span>' + g + '</span>').join('') + '</span>' +
        '<span class="cuando">' + haceCuanto(ultimaVez(o.id)) + '</span>' +
      '</span>' +
    '</button>').join('');
}

function pintarListaEjercicios() {
  const o = DIAS[diaVisto].opciones[opcionElegida];
  $('#diaTitulo').textContent = o.titulo;
  $('#listaHoy').innerHTML = o.ejercicios.map((item, k) => {
    const cat = CATALOGO[item.id];
    const meta = item.minutos ? item.minutos + ' min'
      : (cat.tiempo ? item.series + ' × ' + item.reps + '″' : item.series + ' × ' + item.reps);
    const clase = (item.minutos || cat.slot === 'ZONA MEDIA') ? ' class="pre"' : '';
    const tag = cat.lumbar ? '<span class="tag">LUMBAR</span>' : '';
    return '<li' + clase + '><span class="idx">' + String(k + 1).padStart(2, '0') + '</span>' +
      '<span class="nm">' + cat.nombre + tag + '</span>' +
      '<span class="sr">' + meta + '</span></li>';
  }).join('');
}

function pintarRacha() {
  const ult = datos.sesiones.slice(-6);
  $('#racha').innerHTML = Array.from({ length: 6 }, (_, k) =>
    '<i class="punto' + (k >= 6 - ult.length ? ' hecho' : '') + '"></i>').join('') +
    '<span class="muted" style="margin-left:8px;font-size:13px">' +
    datos.sesiones.length + (datos.sesiones.length === 1 ? ' sesión' : ' sesiones') + '</span>';
}

function pintarHoy() {
  $('#fecha').textContent = fechaLarga();
  diaVisto = diaSugerido();
  opcionElegida = opcionSugerida(diaVisto);
  pintarDias();
  pintarOpciones();
  pintarListaEjercicios();
  pintarRacha();
}

$('#dias').addEventListener('click', ev => {
  const b = ev.target.closest('[data-dia]');
  if (!b) return;
  diaVisto = +b.dataset.dia;
  opcionElegida = opcionSugerida(diaVisto);
  pintarDias();
  pintarOpciones();
  pintarListaEjercicios();
});

$('#opciones').addEventListener('click', ev => {
  const b = ev.target.closest('[data-opcion]');
  if (!b) return;
  opcionElegida = +b.dataset.opcion;
  pintarOpciones();
  pintarListaEjercicios();
  $('#tarjetaEj').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

/* ============================================================
   PANTALLA: EJERCICIO
   ============================================================ */

function textoSerie(ej, s) {
  const unidad = ej.tiempo ? ' <span class="u">SEG</span>' : ' <span class="u">REP</span>';
  const r = s.reps + unidad;
  if (!ej.carga) return r;
  return (s.peso === null ? '—' : String(s.peso).replace('.', ',')) + ' <span class="u">KG</span> × ' + r;
}

/* Una serie sólo se puede dar por hecha si tiene repeticiones y,
   cuando el ejercicio lleva carga, también un peso cargado. */
function serieValida(ej, s) {
  if (!s.reps || s.reps < 1) return { ok: false, motivo: 'Poné cuántas repeticiones hiciste.' };
  if (ej.carga && (s.peso === null || s.peso === undefined)) {
    return { ok: false, motivo: 'Poné con cuánto peso la hiciste.' };
  }
  if (ej.carga && s.peso <= 0) {
    return { ok: false, motivo: 'El peso tiene que ser mayor que cero.' };
  }
  return { ok: true };
}

function pintarSeries() {
  const ej = plan[i];
  if (!ej.series) { $('#listaSeries').innerHTML = ''; return; }

  const activa = ej.series.findIndex(s => !s.hecha);
  $('#contadorSeries').textContent = ej.series.filter(s => s.hecha).length + ' de ' + ej.series.length;

  $('#listaSeries').innerHTML = ej.series.map((s, n) => {
    const estado = s.hecha ? 'hecha' : (n === activa ? 'act' : 'pend');
    const visible = s.hecha || n === activa;
    const cabecera =
      '<div class="cab" data-abrir="' + n + '">' +
        '<span class="n">SERIE ' + (n + 1) + '</span>' +
        '<span class="val' + (visible ? '' : ' espera') + '">' +
          (visible ? textoSerie(ej, s) : 'pendiente') + '</span>' +
        '<span class="tick"></span>' +
      '</div>';

    if (estado !== 'act') return '<div class="serie ' + estado + '">' + cabecera + '</div>';

    const campoPeso = ej.carga ?
      '<div class="campo"><span class="k">PESO</span><div class="ctl">' +
        '<button data-paso="p-" aria-label="Bajar peso">−</button>' +
        '<span class="v' + (s.peso === null ? ' vacio' : '') + '">' +
          (s.peso === null ? '—' : String(s.peso).replace('.', ',')) + '<small>kg</small></span>' +
        '<button data-paso="p+" aria-label="Subir peso">+</button>' +
      '</div></div>' : '';

    const campoReps =
      '<div class="campo"><span class="k">' + (ej.tiempo ? 'SEGUNDOS' : 'REPETICIONES') + '</span><div class="ctl">' +
        '<button data-paso="r-" aria-label="Menos repeticiones">−</button>' +
        '<span class="v">' + s.reps + '</span>' +
        '<button data-paso="r+" aria-label="Más repeticiones">+</button>' +
      '</div></div>';

    const v = serieValida(ej, s);
    const boton = '<button class="btnHecha" data-hecha="' + n + '"' + (v.ok ? '' : ' disabled') + '>Serie hecha</button>';
    const aviso = v.ok ? '' : '<p class="aviso">' + v.motivo + '</p>';

    return '<div class="serie act">' + cabecera +
      '<div class="cuerpo"><div class="campos">' + campoPeso + campoReps + '</div>' +
      boton + aviso +
      '<p class="pista">Podés tocar una serie ya hecha para corregirla.</p>' +
      '</div></div>';
  }).join('');
}

function pintarEjercicio() {
  const ej = plan[i];
  const esCardio = !!ej.minutos;

  $('#contador').textContent = 'Ejercicio ' + (i + 1) + ' de ' + plan.length;
  $('#slot').textContent = ej.slot;
  $('#nombreEj').textContent = ej.nombre;
  $('#barra').innerHTML = plan.map((_, k) =>
    '<i class="' + (k < i ? 'hecho' : (k === i ? 'ahora' : '')) + '"></i>').join('');

  $('#cajaCardio').style.display = esCardio ? '' : 'none';
  $('#cajaSeries').style.display = esCardio ? 'none' : '';

  if (esCardio) {
    $('#minutos').textContent = ej.minutos + ' MIN';
  } else {
    const anterior = ultimoPeso(ej.id);
    $('#objetivo').innerHTML = 'Objetivo <b>' + ej.objetivoSeries + ' × ' + ej.objetivoReps +
      (ej.tiempo ? '″' : '') + '</b>' +
      (ej.carga && anterior !== null ? ' · La vez pasada <b>' + String(anterior).replace('.', ',') + ' kg</b>' : '');
    pintarSeries();
  }

  // hoja "cómo se hace"
  $('#tituloClaves').textContent = ej.nombre;
  $('#foto0').src = foto(ej.id, 0);
  $('#foto1').src = foto(ej.id, 1);
  $('#foto0').alt = ej.nombre + ', posición inicial';
  $('#foto1').alt = ej.nombre + ', posición final';
  $('#listaClaves').innerHTML = ej.claves.map(c => '<li>' + c + '</li>').join('');

  // hoja "cambiar"
  $('#listaAlts').innerHTML = ej.alts.map(id => {
    const c = CATALOGO[id];
    return '<button class="alt" data-cambiar="' + id + '">' +
      '<img src="' + foto(id, 0) + '" alt="" loading="lazy">' +
      '<span class="nm">' + c.nombre + (c.lumbar ? '<span class="tag">LUMBAR</span>' : '') + '</span></button>';
  }).join('') || '<p class="muted">Este ejercicio no tiene reemplazos cargados todavía.</p>';

  $('#btnSiguiente').textContent = (i === plan.length - 1) ? 'Terminar la sesión' : 'Siguiente';
  $('#ejercicio .scroll').scrollTop = 0;
}

/* ---------- interacciones de la lista de series ---------- */

$('#listaSeries').addEventListener('click', ev => {
  const ej = plan[i];
  if (!ej || !ej.series) return;

  const paso = ev.target.closest('[data-paso]');
  if (paso) {
    const activa = ej.series.findIndex(s => !s.hecha);
    const s = ej.series[activa];
    if (!s) return;
    const p = paso.dataset.paso;
    if (p === 'p+') s.peso = (s.peso === null ? 2 : s.peso + 2);
    if (p === 'p-' && s.peso !== null) s.peso = Math.max(0, s.peso - 2);
    if (p === 'r+') s.reps++;
    if (p === 'r-') s.reps = Math.max(1, s.reps - 1);
    pintarSeries();
    return;
  }

  const hecha = ev.target.closest('[data-hecha]');
  if (hecha) {
    const n = +hecha.dataset.hecha;
    const s = ej.series[n];
    const v = serieValida(ej, s);
    if (!v.ok) return;                       // no se puede cerrar sin peso ni repeticiones
    s.hecha = true;
    const sig = ej.series[n + 1];
    if (sig && !sig.hecha) { sig.peso = s.peso; sig.reps = s.reps; }
    pintarSeries();
    return;
  }

  const abrir = ev.target.closest('[data-abrir]');
  if (abrir) {
    const n = +abrir.dataset.abrir;
    if (ej.series[n].hecha) {
      for (let k = n; k < ej.series.length; k++) ej.series[k].hecha = false;
      pintarSeries();
    }
  }
});

/* ---------- avanzar de ejercicio ---------- */

$('#btnSiguiente').addEventListener('click', () => {
  if (i < plan.length - 1) { i++; pintarEjercicio(); }
  else { pintarCierre(); ver('cierre'); }
});

$('#btnAtras').addEventListener('click', () => {
  if (i > 0) { i--; pintarEjercicio(); } else ver('hoy');
});

/* ---------- hojas ---------- */

document.addEventListener('click', ev => {
  const abre = ev.target.closest('[data-hoja]');
  if (abre) $('#hoja-' + abre.dataset.hoja).classList.add('on');
  if (ev.target.closest('[data-cerrar]')) $$('.hoja').forEach(h => h.classList.remove('on'));

  const cambio = ev.target.closest('[data-cambiar]');
  if (cambio) {
    const nuevo = CATALOGO[cambio.dataset.cambiar];
    const ej = plan[i];
    const idViejo = ej.id;
    ej.id = cambio.dataset.cambiar;
    ej.nombre = nuevo.nombre;
    ej.carga = nuevo.carga;
    ej.tiempo = !!nuevo.tiempo;
    ej.lumbar = !!nuevo.lumbar;
    ej.claves = nuevo.claves;
    ej.alts = ej.alts.filter(a => a !== ej.id).concat(idViejo);
    if (ej.series) ej.series.forEach(s => { if (!s.hecha) s.peso = null; });
    $$('.hoja').forEach(h => h.classList.remove('on'));
    pintarEjercicio();
  }

  const pausa = ev.target.closest('#pausaFoto');
  if (pausa) {
    const on = $('#caraFoto').classList.toggle('quieta');
    pausa.textContent = on ? 'Reanudar' : 'Pausar';
  }
});

/* ============================================================
   PANTALLA: CIERRE
   ============================================================ */

function pintarCierre() {
  const hechas = plan.reduce((a, e) => a + (e.series ? e.series.filter(s => s.hecha).length : 0), 0);
  const totales = plan.reduce((a, e) => a + (e.series ? e.series.length : 0), 0);
  $('#resumenSeries').textContent = hechas + ' de ' + totales;

  let subio = 0;
  plan.forEach(e => {
    if (!e.carga || !e.series) return;
    const ant = ultimoPeso(e.id);
    const pesos = e.series.filter(s => s.hecha && s.peso !== null).map(s => s.peso);
    if (ant !== null && pesos.length && Math.max.apply(null, pesos) > ant) subio++;
  });
  $('#resumenSubio').textContent = subio === 0 ? 'Ninguno' :
    subio + (subio === 1 ? ' ejercicio' : ' ejercicios');
  $('#tituloCierre').textContent = rutina.titulo;
  $('#subCierre').textContent = 'Día ' + nDia + ' · ' + DIAS[nDia - 1].region;
}

$('#escala').addEventListener('click', ev => {
  const b = ev.target.closest('button');
  if (!b) return;
  $$('#escala button').forEach(x => x.setAttribute('aria-pressed', x === b));
});

$('#btnGuardar').addEventListener('click', () => {
  const lumbar = $('#escala button[aria-pressed="true"]');
  const sesion = {
    fecha: hoyISO(),
    dia: nDia,
    opcion: rutina.id,
    titulo: rutina.titulo,
    lumbar: lumbar ? +lumbar.dataset.v : null,
    ejercicios: plan.filter(e => e.series).map(e => ({
      id: e.id,
      nombre: e.nombre,
      series: e.series.filter(s => s.hecha).map(s => ({ peso: s.peso, reps: s.reps }))
    })).filter(e => e.series.length)
  };
  datos.sesiones.push(sesion);
  const ok = almacen.guardar(datos);
  if (!ok) alert('No se pudo guardar la sesión. Revisá que el navegador permita guardar datos.');
  pintarHoy();
  ver('hoy');
});

/* ============================================================
   PANTALLA: HISTORIAL
   ============================================================ */

function pintarHistorial(idEjercicio) {
  const cat = CATALOGO[idEjercicio];
  $('#histSlot').textContent = cat.slot;
  $('#histNombre').textContent = cat.nombre;

  const filas = historial(idEjercicio);
  if (!filas.length) {
    $('#histCuerpo').innerHTML =
      '<p class="vacio">Todavía no hay registros de este ejercicio. ' +
      'Después de la primera sesión vas a ver acá cómo cambia el peso.</p>';
    return;
  }

  const ultimas = filas.slice(-8);
  const max = Math.max.apply(null, ultimas.map(f => f.max));
  const barras = ultimas.map((f, k) => {
    const alto = Math.max(12, Math.round(f.max / max * 100));
    const dia = f.fecha.slice(8, 10) + '/' + f.fecha.slice(5, 7);
    return '<div class="b' + (k === ultimas.length - 1 ? ' hi' : '') + '">' +
      '<s>' + String(f.max).replace('.', ',') + '</s>' +
      '<i style="height:' + alto + '%"></i><em>' + dia + '</em></div>';
  }).join('');

  const primero = ultimas[0].max, ultimo = ultimas[ultimas.length - 1].max;
  const resumen = ultimas.length < 2 ? '' :
    '<div class="tarjeta" style="margin-top:24px"><span class="eyebrow">DESDE EL PRIMER REGISTRO</span>' +
    '<div class="grande">De ' + String(primero).replace('.', ',') + ' kg a ' + String(ultimo).replace('.', ',') + ' kg</div></div>';

  $('#histCuerpo').innerHTML = '<div class="barras">' + barras + '</div>' + resumen;
}

$('#listaHistorial').addEventListener('click', ev => {
  const b = ev.target.closest('[data-hist]');
  if (!b) return;
  pintarHistorial(b.dataset.hist);
  ver('historial');
});

function pintarMenuHistorial() {
  const ids = Object.keys(CATALOGO).filter(id => CATALOGO[id].carga);
  $('#listaHistorial').innerHTML = ids.map(id => {
    const filas = historial(id);
    return '<button class="filaHist" data-hist="' + id + '">' +
      '<span class="nm">' + CATALOGO[id].nombre + '</span>' +
      '<span class="muted">' + (filas.length ? filas[filas.length - 1].max + ' kg' : '—') + '</span>' +
      '</button>';
  }).join('');
}

/* ============================================================
   COPIA DE SEGURIDAD
   ============================================================ */

$('#btnExportar').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'amce-' + hoyISO() + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

$('#archivoImportar').addEventListener('change', ev => {
  const f = ev.target.files[0];
  if (!f) return;
  const lector = new FileReader();
  lector.onload = () => {
    try {
      const nuevo = JSON.parse(lector.result);
      if (!nuevo || !Array.isArray(nuevo.sesiones)) throw new Error('formato');
      datos = nuevo;
      almacen.guardar(datos);
      pintarHoy();
      pintarMenuHistorial();
      ver('hoy');
    } catch (e) {
      alert('Ese archivo no parece una copia de AMCE.');
    }
  };
  lector.readAsText(f);
  ev.target.value = '';
});

/* ============================================================
   ARRANQUE
   ============================================================ */

$('#btnEmpezar').addEventListener('click', () => {
  nDia = DIAS[diaVisto].n;
  rutina = DIAS[diaVisto].opciones[opcionElegida];
  plan = armarPlan(rutina);
  i = 0;
  ver('ejercicio');
  pintarEjercicio();
});

$$('[data-ver]').forEach(b => b.addEventListener('click', () => {
  if (b.dataset.ver === 'menuHist') pintarMenuHistorial();
  ver(b.dataset.ver);
}));

/* ============================================================
   ACCESO
   Por ahora la portada entra directo, sin pedir nada.

   Para volver a activar Face ID más adelante hay que reponer
   la pantalla de acceso y el bloque de credenciales. Está
   documentado en el README.
   ============================================================ */

function entrarALaApp() {
  pintarHoy();
  pintarMenuHistorial();
  ver('hoy');
}

$('#btnEntrar').addEventListener('click', entrarALaApp);

/* ============================================================
   FUNCIONAMIENTO SIN CONEXIÓN
   ============================================================ */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(e => {
      console.warn('No se pudo activar el modo sin conexión:', e);
    });
  });
}

function avisarConexion() {
  const previo = $('#sinRed');
  if (navigator.onLine) { if (previo) previo.remove(); return; }
  if (previo) return;
  const a = document.createElement('div');
  a.id = 'sinRed';
  a.textContent = 'Sin conexión. Se guarda todo igual.';
  document.querySelector('.app').appendChild(a);
}
window.addEventListener('online', avisarConexion);
window.addEventListener('offline', avisarConexion);
avisarConexion();
