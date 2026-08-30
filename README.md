# AMCE

App de rutinas para el gimnasio. Corre en el navegador, sin servidor ni base de datos.

## Cómo publicarla

1. Creá un repositorio y subí estos archivos:

```
index.html
app.js
datos.js
README.md
```

2. En **Settings → Pages**, elegí la rama `main` y la carpeta raíz.
3. GitHub te da una URL. Abrila en el celular y agregala a la pantalla de inicio.

## Cómo se guardan los datos

Todo queda en `localStorage`, dentro del navegador del teléfono. No hay servidor, no hay
cuenta, no sale nada del dispositivo.

**Esto tiene una consecuencia:** si se borran los datos de navegación o se cambia de teléfono,
se pierde el historial. Por eso hay un botón **Descargar copia** en la pantalla de Progreso.
Conviene usarlo cada tanto.

## Las fotos

Salen de [Free Exercise DB](https://github.com/yuhonas/free-exercise-db), dominio público
(licencia Unlicense). Por defecto se cargan desde internet, así que **la app necesita conexión
la primera vez que se muestra cada foto**.

Para que funcione sin señal, bajá las imágenes al repositorio:

```bash
git clone --depth 1 https://github.com/yuhonas/free-exercise-db /tmp/fedb
mkdir -p img
# copiá sólo las carpetas de los ejercicios que usa la app
grep -oE "^  '?[A-Za-z_][A-Za-z_0-9-]*'?: \{ nombre" datos.js \
  | sed "s/[ ':{]//g; s/nombre//" \
  | while read id; do cp -r "/tmp/fedb/exercises/$id" img/ 2>/dev/null; done
```

Después, en `datos.js`, cambiá:

```js
const BASE_IMG = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
```

por:

```js
const BASE_IMG = './img/';
```

## Estructura de la rutina

**Tres días, tres rutinas para elegir en cada uno: nueve rutinas en total.**

| Día | Músculos | Las tres rutinas |
|---|---|---|
| 1 | Cuádriceps, femorales, gemelos | En máquinas · Con peso libre · Pierna por pierna |
| 2 | Hombro, bíceps, tríceps, pecho, espalda | Con mancuernas · En poleas · Mixto |
| 3 | Abdomen, glúteo, aductores, abductores | En máquinas · En colchoneta · Completo |

Las tres rutinas de un día cubren los mismos músculos con ejercicios distintos.
La app propone el día siguiente al último que hizo y, dentro de ese día, la rutina
que hace más tiempo que no hace. Emilia puede elegir cualquier otra.

Toda rutina tiene siempre la misma forma:

1. Cardio suave, 3 minutos
2. Un ejercicio de zona media
3. Cinco ejercicios musculares, 3 series de 10 repeticiones

El peso lo decide Emilia en cada serie. La app **nunca sugiere cuánto levantar**: sólo
muestra con cuánto lo hizo la vez anterior, como referencia.

Cada serie guarda su propio peso y sus propias repeticiones. No se puede dar una serie por
hecha sin cargar repeticiones, ni sin cargar peso cuando el ejercicio lleva carga.

## Cambiar un ejercicio

El botón **No está disponible** ofrece todos los ejercicios del catálogo que ocupan el mismo
lugar en la rutina. No hay listas de reemplazos que mantener: cada ejercicio nuevo que se
agregue a `CATALOGO` aparece solo como alternativa donde corresponde, según su `slot`.

Hoy son 79 ejercicios y ninguno tiene menos de dos alternativas.

## Acceso

Por ahora la app **entra directo**, sin pedir nada. Hubo una versión con Face ID que se
sacó mientras se prueba, para poder abrirla desde varios teléfonos sin fricción.

Para reactivarlo hay que reponer la pantalla de acceso en `index.html` y el bloque de
credenciales en `app.js`. Usaba WebAuthn: `navigator.credentials.create` la primera vez
para registrar la cara, y `navigator.credentials.get` después. Requiere HTTPS.

## Pendientes

Cosas que quedaron abiertas y conviene resolver antes de darle mucho uso:

- **Los grupos de cada jornada** los definí yo. Cambiarlos es editar `SEMANAS` en `datos.js`.
- **Las claves de técnica** de cada ejercicio las escribí sin formación específica.
  Deberían revisarse con un profesional, sobre todo por el antecedente lumbar.
- **El catálogo de ejercicios** debería ser revisado por un kinesiólogo o profesor de
  educación física: qué entra, qué entra con tope de carga y qué sale. Los ejercicios con
  exigencia lumbar están marcados con `lumbar: true`.
- **Las fotos son de modelos hombres.** Los bancos con modelos mujeres son pagos.
  Reemplazarlas es cambiar el contenido de `img/`, no tocar código.
