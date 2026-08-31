/* ============================================================
   AMCE — lógica de la aplicación
   Todo se guarda en el navegador de Emilia (localStorage).
   Nada sale del teléfono.
   ============================================================ */

const $  = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
const CLAVE = 'amce.v1';
const VERSION_APP = '15';   // sube cada vez que cambia app.js; se muestra en el menú

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
        ? Array.from({ length: item.series },
            () => ({ peso: cat.carga ? (ultimoPeso(item.id) || 1) : null, reps: item.reps, hecha: false }))
        : null
    };
  });
}

/* ---------- navegación ---------- */

function ver(id) {
  $$('.pantalla').forEach(p => p.classList.toggle('on', p.id === id));
  $$('.hoja').forEach(h => h.classList.remove('on'));
  $$('.cajon').forEach(c => c.classList.remove('on'));
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
  $('#saludo').textContent = 'Hola, ' + (ajustes.nombre || 'Emi');
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
        '<span class="v">' + String(s.peso).replace('.', ',') + '<small>kg</small></span>' +
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
  const alts = alternativas(ej);
  $('#cuantasAlts').textContent = alts.length === 0 ? ''
    : 'Trabajan el mismo músculo. Elegí la que tengas a mano. ' +
      (alts.length === 1 ? 'Hay 1 opción.' : 'Hay ' + alts.length + ' opciones.');
  $('#listaAlts').innerHTML = alts.map(id => {
    const c = CATALOGO[id];
    return '<button class="alt" data-cambiar="' + id + '">' +
      '<img src="' + foto(id, 0) + '" alt="" loading="lazy">' +
      '<span class="nm">' + c.nombre + (c.lumbar ? '<span class="tag">LUMBAR</span>' : '') +
      '<span class="meta">' + (c.carga ? 'Con peso' : 'Sin peso') + '</span></span></button>';
  }).join('') || '<p class="muted">No hay reemplazos para este ejercicio.</p>';

  $('#btnSiguiente').textContent = (i === plan.length - 1) ? 'Terminar la sesión' : 'Siguiente';
}

/* Todas las alternativas posibles: cualquier ejercicio del catálogo que
   ocupe el mismo lugar en la rutina. Primero las sugeridas a mano en
   datos.js, después el resto. Así, cada ejercicio que se agregue al
   catálogo aparece solo como opción donde corresponde. */
function alternativas(ej) {
  const slot = CATALOGO[ej.id].slot;
  const mismoSlot = Object.keys(CATALOGO)
    .filter(id => CATALOGO[id].slot === slot && id !== ej.id);
  const sugeridas = (ej.alts || []).filter(id => CATALOGO[id] && id !== ej.id);
  const resto = mismoSlot.filter(id => !sugeridas.includes(id));
  return sugeridas.concat(resto);
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
    if (p === 'p+') s.peso = (s.peso === null ? 1 : s.peso + 1);
    if (p === 'p-' && s.peso !== null) s.peso = Math.max(1, s.peso - 1);
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
  if (abre) {
    $('#hoja-' + abre.dataset.hoja).classList.add('on');
    if (abre.dataset.hoja === 'menu') { pintarPerfil(); pintarColores(); pintarSync(); }
  }
  if (ev.target.closest('[data-cerrar]')) {
    $$('.hoja').forEach(h => h.classList.remove('on'));
    $$('.cajon').forEach(c => c.classList.remove('on'));
  }

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
    if (ej.series) ej.series.forEach(s => {
      if (!s.hecha) s.peso = ej.carga ? (ultimoPeso(ej.id) || 1) : null;
    });
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
  subirDatos();
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

let diaHist = 0, rutinaHist = 0;

function pintarMenuHistorial() {
  $('#diasHist').innerHTML = DIAS.map((d, k) =>
    '<button data-diahist="' + k + '" aria-pressed="' + (k === diaHist) + '">' +
      '<span class="s">Día</span>' + d.n + '</button>').join('');

  const ops = DIAS[diaHist].opciones;
  if (rutinaHist >= ops.length) rutinaHist = 0;
  $('#rutinasHist').innerHTML = ops.map((o, k) =>
    '<button data-rutinahist="' + k + '" aria-pressed="' + (k === rutinaHist) + '" ' +
    'style="font-size:11.5px">' + o.titulo + '</button>').join('');

  // sólo los ejercicios con carga: son los que tienen peso para comparar
  const conCarga = ops[rutinaHist].ejercicios.filter(e => CATALOGO[e.id].carga);
  $('#listaHistorial').innerHTML = conCarga.map(e => {
    const filas = historial(e.id);
    const ultimo = filas.length ? filas[filas.length - 1].max + ' kg' : '—';
    return '<button class="filaHist" data-hist="' + e.id + '">' +
      '<span class="nm">' + CATALOGO[e.id].nombre + '</span>' +
      '<span class="muted">' + ultimo + '</span></button>';
  }).join('');
}

$('#diasHist').addEventListener('click', ev => {
  const b = ev.target.closest('[data-diahist]');
  if (!b) return;
  diaHist = +b.dataset.diahist;
  rutinaHist = 0;
  pintarMenuHistorial();
});

$('#rutinasHist').addEventListener('click', ev => {
  const b = ev.target.closest('[data-rutinahist]');
  if (!b) return;
  rutinaHist = +b.dataset.rutinahist;
  pintarMenuHistorial();
});

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
  // si la sincronización está configurada, hace falta haber iniciado sesión
  if (typeof syncConfigurada === 'function' && syncConfigurada() && !haySesion()) {
    pintarPortada();
    ver('portada');
    return;
  }
  pintarHoy();
  pintarMenuHistorial();
  ver('hoy');
}

$('#btnEntrar').addEventListener('click', entrarALaApp);

/* ============================================================
   AJUSTES: color y perfil
   ============================================================ */

const CLAVE_AJUSTES = 'amce.ajustes';

/* Doce colores. Cada uno con un tono claro para los rellenos y uno
   más fuerte para lo que tiene que destacar. Todos son suficientemente
   claros como para que el texto oscuro se lea encima. */
const COLORES = [
  { id:'amarillo', nombre:'Amarillo',  claro:'#F7E1A0', fuerte:'#EFCB63' },
  { id:'durazno',  nombre:'Durazno',   claro:'#FAD7B0', fuerte:'#F0B677' },
  { id:'coral',    nombre:'Coral',     claro:'#F8C5BC', fuerte:'#EE9A8C' },
  { id:'rosa',     nombre:'Rosa',      claro:'#F7C9D9', fuerte:'#EC9CBB' },
  { id:'lila',     nombre:'Lila',      claro:'#DFCCF1', fuerte:'#BFA3E0' },
  { id:'violeta',  nombre:'Violeta',   claro:'#CFC9F2', fuerte:'#A79DE4' },
  { id:'cielo',    nombre:'Cielo',     claro:'#C3DCF5', fuerte:'#8FBCE8' },
  { id:'turquesa', nombre:'Turquesa',  claro:'#B9E3E0', fuerte:'#7FCBC6' },
  { id:'menta',    nombre:'Menta',     claro:'#C4E7CE', fuerte:'#8FCFA4' },
  { id:'verde',    nombre:'Verde',     claro:'#D3E4B0', fuerte:'#AECB77' },
  { id:'arena',    nombre:'Arena',     claro:'#E6DCC6', fuerte:'#CFC09A' },
  { id:'ladrillo', nombre:'Ladrillo',  claro:'#F0CBB3', fuerte:'#DCA37D' }
];

let ajustes = { color:'amarillo', nombre:'Emi', nacimiento:'' };

try {
  const guardado = localStorage.getItem(CLAVE_AJUSTES);
  if (guardado) ajustes = Object.assign(ajustes, JSON.parse(guardado));
} catch (e) { /* se usan los valores por defecto */ }

function guardarAjustes() {
  try { localStorage.setItem(CLAVE_AJUSTES, JSON.stringify(ajustes)); } catch (e) { /* nada */ }
}

function aplicarColor() {
  const c = COLORES.find(x => x.id === ajustes.color) || COLORES[0];
  document.documentElement.style.setProperty('--amarillo', c.claro);
  document.documentElement.style.setProperty('--amarillo2', c.fuerte);
}

function pintarColores() {
  $('#colores').innerHTML = COLORES.map(c =>
    '<button data-color="' + c.id + '" title="' + c.nombre + '" aria-label="' + c.nombre + '" ' +
    'aria-pressed="' + (c.id === ajustes.color) + '" ' +
    'style="background:' + c.claro + '"></button>').join('');
}

$('#colores').addEventListener('click', ev => {
  const b = ev.target.closest('[data-color]');
  if (!b) return;
  ajustes.color = b.dataset.color;
  aplicarColor();
  pintarColores();
  guardarPerfilYSubir();
});

function edadDe(nacimiento) {
  if (!nacimiento) return null;
  const n = new Date(nacimiento), h = new Date();
  let e = h.getFullYear() - n.getFullYear();
  const m = h.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && h.getDate() < n.getDate())) e--;
  return (e >= 0 && e < 120) ? e : null;
}

function pintarPerfil() {
  $('#versionApp').textContent = 'Versión ' + VERSION_APP;
  $('#perfilNombre').value = ajustes.nombre;
  $('#perfilNacimiento').value = ajustes.nacimiento;
  const e = edadDe(ajustes.nacimiento);
  $('#perfilEdad').textContent = e === null ? '' : e + ' años';
  $('#saludo').textContent = 'Hola, ' + (ajustes.nombre || 'Emi');
}

let esperaPerfil = null;
function guardarPerfilYSubir() {
  guardarAjustes();
  clearTimeout(esperaPerfil);
  esperaPerfil = setTimeout(() => { if (haySesion()) subirDatos(); }, 1200);
}

$('#perfilNombre').addEventListener('input', ev => {
  ajustes.nombre = ev.target.value.trim();
  $('#saludo').textContent = 'Hola, ' + (ajustes.nombre || 'Emi');
  guardarPerfilYSubir();
});

$('#perfilNacimiento').addEventListener('change', ev => {
  ajustes.nacimiento = ev.target.value;
  const e = edadDe(ajustes.nacimiento);
  $('#perfilEdad').textContent = e === null ? '' : e + ' años';
  guardarPerfilYSubir();
});

aplicarColor();

/* ============================================================
   SINCRONIZACIÓN CON GOOGLE

   La app abre y funciona SIEMPRE, con o sin sesión iniciada.
   Iniciar sesión sólo habilita que el historial se guarde en el
   servidor, para no perderlo al cambiar de teléfono.

   Si faltan SYNC_URL o GOOGLE_CLIENT_ID, nada de esto se activa.
   ============================================================ */

function syncConfigurada() { return !!SYNC_URL && !!GOOGLE_CLIENT_ID; }
function haySesion() { return !!(ajustes.sync && ajustes.sync.token); }

async function subirDatos() {
  if (!syncConfigurada() || !haySesion()) return { ok: false };
  try {
    const r = await fetch(SYNC_URL + '/datos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Sesion': ajustes.sync.token },
      body: JSON.stringify(Object.assign({}, datos, {
        perfil: { nombre: ajustes.nombre, nacimiento: ajustes.nacimiento, color: ajustes.color }
      }))
    });
    if (r.status === 401) { ajustes.sync.token = null; guardarAjustes(); return { ok: false, vencida: true }; }
    if (!r.ok) throw new Error('respuesta ' + r.status);
    ajustes.sync.ultima = new Date().toISOString();
    ajustes.sync.pendiente = false;
    guardarAjustes();
    return { ok: true };
  } catch (e) {
    ajustes.sync.pendiente = true;
    guardarAjustes();
    return { ok: false };
  }
}

async function bajarDatos() {
  if (!syncConfigurada() || !haySesion()) return { ok: false, motivo: 'Iniciá sesión primero.' };
  try {
    const r = await fetch(SYNC_URL + '/datos', { headers: { 'X-Sesion': ajustes.sync.token } });
    if (r.status === 404) return { ok: false, motivo: 'No hay nada guardado en tu cuenta todavía.' };
    if (r.status === 401) { ajustes.sync.token = null; guardarAjustes(); return { ok: false, motivo: 'La sesión venció. Entrá de nuevo.' }; }
    if (!r.ok) throw new Error('respuesta ' + r.status);
    const nuevo = await r.json();
    if (!nuevo || !Array.isArray(nuevo.sesiones)) throw new Error('formato');
    if (nuevo.perfil) {
      if (nuevo.perfil.nombre) ajustes.nombre = nuevo.perfil.nombre;
      if (nuevo.perfil.nacimiento) ajustes.nacimiento = nuevo.perfil.nacimiento;
      if (nuevo.perfil.color) ajustes.color = nuevo.perfil.color;
      aplicarColor();
    }
    datos = nuevo;
    almacen.guardar(datos);
    ajustes.sync.ultima = new Date().toISOString();
    ajustes.sync.pendiente = false;
    guardarAjustes();
    return { ok: true, sesiones: datos.sesiones.length };
  } catch (e) {
    return { ok: false, motivo: 'No se pudo traer el historial.' };
  }
}

/* Google devuelve acá el token firmado; se lo mandamos al servidor,
   que lo verifica y nos da una sesión larga. */
async function entroGoogle(respuesta) {
  $('#estadoSync').textContent = 'Verificando…';
  try {
    const r = await fetch(SYNC_URL + '/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: respuesta.credential })
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'no se pudo');
    ajustes.sync = { token: d.token, email: d.email, ultima: null, pendiente: false };
    if (!ajustes.nombre && d.nombre) ajustes.nombre = d.nombre;
    guardarAjustes();

    // si ya había historial en la nube, lo traemos; si no, subimos el de este teléfono
    const bajada = await bajarDatos();
    if (!bajada.ok) await subirDatos();
    pintarPerfil(); pintarSync();
    entrarALaApp();
  } catch (e) {
    $('#estadoSync').textContent = 'No se pudo iniciar sesión.';
  }
}

function cerrarSesionGoogle() {
  ajustes.sync = null;
  guardarAjustes();
  pintarSync();
  pintarPortada();
  ver('portada');
}

function textoSync() {
  if (!haySesion()) return 'Tus datos están sólo en este teléfono.';
  if (ajustes.sync.pendiente) return 'Hay cambios sin subir. Suben solos cuando haya internet.';
  if (!ajustes.sync.ultima) return 'Sesión iniciada.';
  const d = new Date(ajustes.sync.ultima);
  return 'Última copia: ' + d.getDate() + '/' + (d.getMonth() + 1) + ' a las ' +
    String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function pintarSync() {
  const mostrar = syncConfigurada() && haySesion();
  $('#bloqueSync').style.display = mostrar ? '' : 'none';
  if (!mostrar) return;
  $('#estadoSync').textContent = textoSync();
  $('#cuentaSync').textContent = ajustes.sync.email || 'Sesión iniciada';
}

/* La portada: si hace falta iniciar sesión, muestra el botón de Google
   en lugar del botón de entrar. Una vez adentro, no se ve nunca más. */
function pintarPortada() {
  const pedirLogin = syncConfigurada() && !haySesion();
  $('#zonaLogin').style.display = pedirLogin ? '' : 'none';
  $('#btnEntrar').style.display = pedirLogin ? 'none' : '';
  if (!pedirLogin) return;

  if (window.google && google.accounts) {
    $('#botonGoogle').innerHTML = '';
    google.accounts.id.renderButton($('#botonGoogle'),
      { theme: 'filled_black', size: 'large', width: 280, text: 'signin_with', locale: 'es' });
    $('#avisoLogin').textContent = navigator.onLine
      ? 'Sólo la primera vez. Después entrás directo, con o sin internet.'
      : 'Para entrar la primera vez hace falta internet. Conectate y volvé a abrir la app.';
  } else {
    $('#avisoLogin').textContent = navigator.onLine
      ? 'Cargando…'
      : 'Para entrar la primera vez hace falta internet. Conectate y volvé a abrir la app.';
  }
}

function arrancarGoogle() {
  if (!syncConfigurada() || !window.google || !google.accounts) return;
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: entroGoogle,
    auto_select: false,
    cancel_on_tap_outside: true
  });
  pintarPortada();
}

if (syncConfigurada()) {
  const s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.async = true; s.defer = true;
  s.onload = arrancarGoogle;
  document.head.appendChild(s);
}

$('#btnSalirGoogle').addEventListener('click', () => {
  if (confirm('Los datos siguen en este teléfono. ¿Cerrar sesión?')) cerrarSesionGoogle();
});

$('#btnSincronizar').addEventListener('click', async () => {
  $('#estadoSync').textContent = 'Subiendo…';
  const r = await subirDatos();
  if (r.vencida) pintarSync();          // repinta primero, para no pisar el aviso
  $('#estadoSync').textContent = r.ok ? textoSync()
    : (r.vencida ? 'La sesión venció. Entrá de nuevo.' : 'No se pudo subir. Probá con internet.');
});

window.addEventListener('online', () => {
  if (haySesion() && ajustes.sync.pendiente) subirDatos();
  pintarPortada();
});

pintarPortada();

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
