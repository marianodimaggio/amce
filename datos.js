/* ============================================================
   AMCE — catálogo de ejercicios y plan de la semana
   ------------------------------------------------------------
   Las fotos salen de Free Exercise DB (dominio público, Unlicense).
   Para que la app funcione sin conexión, bajá las imágenes al repo
   y cambiá BASE_IMG por './img/'. El README explica cómo.
   ============================================================ */

/* Sincronización con Google. Dejá los dos vacíos y la app funciona
   igual, guardando sólo en el teléfono. El README explica cómo
   obtener cada uno. */
const SYNC_URL = 'https://app-gym-sync.mariano-dimaggio-dac.workers.dev';
const GOOGLE_CLIENT_ID = '1004130104733-rgqidecu7ng1l9diuln8r1s4vhbo4mm4.apps.googleusercontent.com';

const BASE_IMG = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

/* Cada ejercicio:
   id      identificador y carpeta de la foto
   nombre  como lo ve Emilia
   slot    lugar que ocupa en la rutina (define por qué se puede reemplazar)
   carga   true si lleva peso; false si es con el peso del cuerpo
   lumbar  true si exige cuidado con la zona baja de la espalda
   claves  tres cosas para revisar mientras lo hace  → PENDIENTE DE REVISIÓN PROFESIONAL
*/
const CATALOGO = {
  // ---------- cardio ----------
  Elliptical_Trainer: { nombre:'Elíptica suave', slot:'CARDIO', carga:false, claves:[
    'Ritmo en el que podrías hablar sin agitarte.',
    'Espalda derecha, sin colgarte de los manubrios.',
    'No es entrenamiento, es preparación.'] },
  Jogging_Treadmill: { nombre:'Cinta, trote suave', slot:'CARDIO', carga:false, claves:[
    'Trote liviano, no carrera.',
    'Pisada suave, sin golpear el talón.',
    'Si no podés hablar, bajá la velocidad.'] },
  Bicycling_Stationary: { nombre:'Bicicleta fija', slot:'CARDIO', carga:false, claves:[
    'Asiento a la altura de la cadera.',
    'Resistencia baja, piernas girando parejo.',
    'Espalda apoyada si el asiento tiene respaldo.'] },

  // ---------- zona media ----------
  Plank: { nombre:'Plancha', slot:'ZONA MEDIA', carga:false, tiempo:true, lumbar:true, claves:[
    'Cadera a la altura de los hombros, sin hundir la zona baja.',
    'Apretá glúteos y abdomen todo el tiempo.',
    'Si la espalda se arquea, cortá la serie.'] },
  Side_Bridge: { nombre:'Puente lateral', slot:'ZONA MEDIA', carga:false, tiempo:true, claves:[
    'Cuerpo en línea recta, cadera bien arriba.',
    'Codo justo debajo del hombro.',
    'Mismo tiempo de cada lado.'] },
  Hyperextensions_Back_Extensions: { nombre:'Banco lumbar', slot:'ZONA MEDIA', carga:false, lumbar:true, claves:[
    'Subí solo hasta que el cuerpo quede recto, no más.',
    'Movimiento lento, sin impulso.',
    'Ante cualquier molestia en la zona baja, pará.'] },
  Crunches: { nombre:'Abdominales en colchoneta', slot:'ZONA MEDIA', carga:false, claves:[
    'Despegá los omóplatos, no toda la espalda.',
    'La zona baja queda apoyada.',
    'No tires del cuello con las manos.'] },
  Air_Bike: { nombre:'Bicicleta abdominal', slot:'ZONA MEDIA', carga:false, claves:[
    'Movimiento lento, no una carrera.',
    'La zona baja pegada al piso.',
    'Contá una repetición por cada lado.'] },

  // ---------- empuje ----------
  Dumbbell_Shoulder_Press: { nombre:'Hombros con mancuernas', slot:'EMPUJE VERTICAL', carga:true, claves:[
    'Abdomen firme para no arquear la espalda al subir.',
    'Las mancuernas suben en línea con los hombros.',
    'Bajá controlando, no las dejes caer.'] },
  Arnold_Dumbbell_Press: { nombre:'Press Arnold', slot:'EMPUJE VERTICAL', carga:true, claves:[
    'Arrancá con las palmas mirándote y girá al subir.',
    'Sin arquear la espalda.',
    'Peso menor que en el press común: el giro suma dificultad.'] },
  Dumbbell_Bench_Press: { nombre:'Pecho plano con mancuernas', slot:'EMPUJE HORIZONTAL', carga:true, claves:[
    'Pies apoyados y espalda contra el banco, sin arquear.',
    'Codos a 45 grados del cuerpo, no abiertos del todo.',
    'Bajá contando hasta dos y subí sin trabar los codos.'] },
  Incline_Dumbbell_Press: { nombre:'Pecho inclinado con mancuernas', slot:'EMPUJE HORIZONTAL', carga:true, claves:[
    'Banco a 30 o 45 grados, no más.',
    'Espalda apoyada en todo el recorrido.',
    'Codos a 45 grados del cuerpo.'] },
  Side_Lateral_Raise: { nombre:'Vuelos laterales', slot:'HOMBRO LATERAL', carga:true, claves:[
    'Codos apenas flexionados y fijos todo el movimiento.',
    'Subí hasta la altura del hombro, no más.',
    'Con poco peso alcanza. Acá el impulso arruina el ejercicio.'] },
  Face_Pull: { nombre:'Face pull en polea', slot:'HOMBRO LATERAL', carga:true, claves:[
    'La soga viene hacia la cara, codos altos.',
    'Juntá los omóplatos al final.',
    'Poco peso y movimiento lento.'] },
  Lying_Triceps_Press: { nombre:'Press francés', slot:'TRÍCEPS', carga:true, claves:[
    'Los codos quedan quietos, apuntando al techo.',
    'Bajá hasta la frente, sin abrir los codos.',
    'Si te molesta el codo, pasá a la polea.'] },
  Triceps_Pushdown: { nombre:'Tríceps en polea', slot:'TRÍCEPS', carga:true, claves:[
    'Codos pegados al cuerpo, no se despegan.',
    'Estirá del todo abajo y volvé despacio.',
    'El torso queda firme, sin balancearte.'] },
  Cable_Rope_Overhead_Triceps_Extension: { nombre:'Tríceps sobre la cabeza', slot:'TRÍCEPS', carga:true, claves:[
    'Codos apuntando adelante y quietos.',
    'Abdomen firme para no arquear la espalda.',
    'Estirá completo sin trabar el codo.'] },

  // ---------- agregados para los días de Emilia ----------
  Seated_Leg_Curl: { nombre:'Femorales sentada', slot:'FEMORALES', carga:true, claves:[
    'Espalda bien apoyada en el respaldo.',
    'Bajá el peso contando hasta dos.',
    'Sin despegar la cadera del asiento.'] },
  Standing_Leg_Curl: { nombre:'Femoral de pie', slot:'FEMORALES', carga:true, claves:[
    'Una pierna por vez, mismo número de cada lado.',
    'El muslo queda quieto: solo se mueve la rodilla.',
    'Sin arquear la espalda al flexionar.'] },
  Ball_Leg_Curl: { nombre:'Femorales con pelota', slot:'FEMORALES', carga:false, claves:[
    'Cadera arriba todo el movimiento, sin dejarla caer.',
    'Traé los talones despacio hacia la cola.',
    'Si la cadera se hunde, cortá la serie.'] },
  Standing_Calf_Raises: { nombre:'Gemelos de pie', slot:'GEMELO', carga:true, claves:[
    'Subí lo más alto que puedas sobre la punta del pie.',
    'Bajá el talón por debajo del escalón.',
    'Movimiento lento, sin rebotar.'] },
  Calf_Press_On_The_Leg_Press_Machine: { nombre:'Gemelos en prensa', slot:'GEMELO', carga:true, claves:[
    'Solo la punta del pie apoyada en la plataforma.',
    'Rodillas casi estiradas, sin trabarlas.',
    'Recorrido completo, arriba y abajo.'] },
  Standing_Dumbbell_Calf_Raise: { nombre:'Gemelos con mancuerna', slot:'GEMELO', carga:true, claves:[
    'Una mancuerna del lado de la pierna que trabaja.',
    'Sujetate de algo para no perder el equilibrio.',
    'Subí completo y bajá controlando.'] },
  Band_Hip_Adductions: { nombre:'Aductores con banda', slot:'ADUCTOR', carga:false, claves:[
    'La banda a la altura del tobillo.',
    'Llevá la pierna hacia adentro, cruzando apenas.',
    'Volvé despacio, sin soltar la tensión.'] },
  Glute_Kickback: { nombre:'Patada de glúteo', slot:'GLÚTEO', carga:false, claves:[
    'Espalda recta, sin arquear la zona baja.',
    'Subí la pierna hasta la altura de la cadera, no más.',
    'El movimiento sale del glúteo, no de la espalda.'] },
  'One-Legged_Cable_Kickback': { nombre:'Patada en polea', slot:'GLÚTEO', carga:true, claves:[
    'Torso firme, apoyate para no balancearte.',
    'Llevá la pierna atrás apretando el glúteo.',
    'Volvé despacio, sin dejar caer el peso.'] },
  Single_Leg_Glute_Bridge: { nombre:'Puente a una pierna', slot:'GLÚTEO', carga:false, claves:[
    'Una pierna apoyada, la otra estirada.',
    'Subí la cadera apretando el glúteo de la pierna que apoya.',
    'La cadera queda pareja, sin caerse de un lado.'] },
  Cable_Crunch: { nombre:'Abdominales en polea', slot:'ABDOMEN', carga:true, claves:[
    'De rodillas, la soga al costado de la cara.',
    'Bajá redondeando el abdomen, no tirando con los brazos.',
    'La cadera queda quieta.'] },
  Decline_Crunch: { nombre:'Abdominales en banco declinado', slot:'ABDOMEN', carga:false, claves:[
    'Subí despegando los omóplatos, no toda la espalda.',
    'Sin tirar del cuello con las manos.',
    'Bajá despacio, sin dejarte caer.'] },
  Reverse_Crunch: { nombre:'Abdominales invertidos', slot:'ABDOMEN', carga:false, claves:[
    'Llevá las rodillas al pecho despegando la cadera.',
    'La zona baja de la espalda queda apoyada.',
    'Sin impulso: el movimiento es corto y controlado.'] },
  Flat_Bench_Lying_Leg_Raise: { nombre:'Elevación de piernas', slot:'ABDOMEN', carga:false, lumbar:true, claves:[
    'La zona baja de la espalda pegada al banco.',
    'Si se despega, bajá menos las piernas.',
    'Movimiento lento en los dos sentidos.'] },
  Russian_Twist: { nombre:'Twist ruso', slot:'ABDOMEN', carga:false, lumbar:true, claves:[
    'Espalda recta, sin redondear.',
    'El giro sale del tronco, no de los brazos.',
    'Si molesta la zona baja, apoyá los pies.'] },
  Ab_Crunch_Machine: { nombre:'Abdominales en máquina', slot:'ABDOMEN', carga:true, claves:[
    'Espalda apoyada en el respaldo.',
    'Bajá con el abdomen, no empujando con los brazos.',
    'Volvé despacio sin soltar la tensión.'] },
  'Cross-Body_Crunch': { nombre:'Abdominales cruzados', slot:'ABDOMEN', carga:false, claves:[
    'Codo hacia la rodilla contraria.',
    'Sin tirar del cuello.',
    'Mismo número de cada lado.'] },

  // ---------- refuerzo de los grupos con pocas opciones ----------
  Lying_Crossover: { nombre:'Cruce de pierna acostada', slot:'GLÚTEO MEDIO', carga:false, claves:[
    'Hombros apoyados en el piso todo el movimiento.',
    'Llevá la pierna cruzada despacio, sin rebotar.',
    'Mismo número de cada lado.'] },
  Monster_Walk: { nombre:'Caminata con banda', slot:'GLÚTEO MEDIO', carga:false, claves:[
    'La banda arriba de las rodillas o en los tobillos.',
    'Pasos cortos al costado, sin juntar los pies.',
    'Rodillas separadas: no dejes que se vayan hacia adentro.'] },
  Standing_Hip_Circles: { nombre:'Círculos de cadera de pie', slot:'GLÚTEO MEDIO', carga:false, claves:[
    'Sujetate de algo para no perder el equilibrio.',
    'Movimiento lento y con recorrido amplio.',
    'El torso queda quieto.'] },
  Side_Leg_Raises: { nombre:'Elevación lateral de pierna', slot:'ADUCTOR', carga:false, claves:[
    'Acostada de lado, el cuerpo en línea recta.',
    'Subí la pierna de abajo, no la de arriba.',
    'Movimiento corto y controlado.'] },
  Calf_Press: { nombre:'Gemelos en máquina de prensa', slot:'GEMELO', carga:true, claves:[
    'Solo la punta del pie en la plataforma.',
    'Estirá completo arriba y bajá el talón.',
    'Sin trabar las rodillas.'] },
  Calf_Raise_On_A_Dumbbell: { nombre:'Gemelos sobre mancuerna', slot:'GEMELO', carga:false, claves:[
    'La punta del pie sobre la mancuerna apoyada.',
    'Sujetate para mantener el equilibrio.',
    'Subí lento y bajá más lento todavía.'] },
  'Dumbbell_Seated_One-Leg_Calf_Raise': { nombre:'Gemelo sentada a una pierna', slot:'GEMELO', carga:true, claves:[
    'La mancuerna apoyada sobre la rodilla.',
    'Una pierna por vez, mismo número de cada lado.',
    'Recorrido completo, sin rebotar.'] },
  Glute_Ham_Raise: { nombre:'Femorales en banco', slot:'FEMORALES', carga:false, lumbar:true, claves:[
    'Bajá el cuerpo despacio, resistiendo.',
    'La espalda queda recta, sin arquearse.',
    'Si no podés subir sola, ayudate con las manos.'] },
  Barbell_Glute_Bridge: { nombre:'Puente de glúteo con barra', slot:'GLÚTEO', carga:true, claves:[
    'La barra apoyada sobre la cadera, con almohadilla.',
    'Subí apretando los glúteos, sin arquear la espalda.',
    'La pelvis termina alineada, no más arriba.'] },
  Physioball_Hip_Bridge: { nombre:'Puente con pelota', slot:'GLÚTEO', carga:false, claves:[
    'Los pies sobre la pelota, cuerpo en línea.',
    'Subí la cadera sin dejar que la pelota se mueva.',
    'Bajá controlando.'] },

  // ---------- refuerzo del tren superior ----------
  Front_Dumbbell_Raise: { nombre:'Elevación frontal', slot:'HOMBRO LATERAL', carga:true, claves:[
    'Subí hasta la altura del hombro, no más.',
    'Codos apenas flexionados y fijos.',
    'Sin balancear el torso para ayudarte.'] },
  'Standing_Palms-In_Dumbbell_Press': { nombre:'Press neutro de pie', slot:'EMPUJE VERTICAL', carga:true, claves:[
    'Palmas enfrentadas todo el movimiento.',
    'Abdomen firme para no arquear la espalda.',
    'Subí sin trabar los codos.'] },
  Machine_Shoulder_Military_Press: { nombre:'Hombros en máquina', slot:'EMPUJE VERTICAL', carga:true, claves:[
    'Espalda bien apoyada en el respaldo.',
    'Recorrido completo, sin golpear arriba.',
    'Bajá controlando.'] },
  Butterfly: { nombre:'Pecho en máquina', slot:'EMPUJE HORIZONTAL', carga:true, claves:[
    'Espalda apoyada y codos a la altura del pecho.',
    'Juntá despacio y abrí más despacio.',
    'No fuerces la apertura al final.'] },
  Dumbbell_Flyes: { nombre:'Aperturas con mancuernas', slot:'EMPUJE HORIZONTAL', carga:true, claves:[
    'Codos apenas flexionados, como abrazando.',
    'Bajá hasta la altura del pecho, no más.',
    'Peso liviano: acá el rango importa más que la carga.'] },
  Cable_Crossover: { nombre:'Cruce en poleas', slot:'EMPUJE HORIZONTAL', carga:true, claves:[
    'Un pie adelante para estar firme.',
    'Juntá las manos adelante del pecho.',
    'Volvé despacio sin soltar la tensión.'] },
  Reverse_Machine_Flyes: { nombre:'Hombro posterior en máquina', slot:'HOMBRO LATERAL', carga:true, claves:[
    'Pecho apoyado en el respaldo.',
    'Abrí juntando los omóplatos.',
    'Codos apenas flexionados.'] },
  'Seated_Bent-Over_Rear_Delt_Raise': { nombre:'Hombro posterior sentada', slot:'HOMBRO LATERAL', carga:true, claves:[
    'Torso inclinado sobre los muslos.',
    'Subí los brazos al costado, no hacia atrás.',
    'Poco peso y movimiento controlado.'] },
  Cable_Rear_Delt_Fly: { nombre:'Hombro posterior en polea', slot:'HOMBRO LATERAL', carga:true, claves:[
    'Brazos cruzados adelante al empezar.',
    'Abrí llevando las manos al costado.',
    'El torso queda firme.'] },
  Preacher_Curl: { nombre:'Bíceps en banco Scott', slot:'BÍCEPS', carga:true, claves:[
    'Los brazos bien apoyados en el respaldo.',
    'Estirá casi completo abajo, sin trabar el codo.',
    'Subí sin despegar los hombros.'] },
  'Cable_Hammer_Curls_-_Rope_Attachment': { nombre:'Bíceps con soga', slot:'BÍCEPS', carga:true, claves:[
    'Codos pegados al cuerpo, sin moverlos.',
    'Palmas enfrentadas todo el recorrido.',
    'Bajá contando hasta dos.'] },
  Concentration_Curls: { nombre:'Bíceps concentrado', slot:'BÍCEPS', carga:true, claves:[
    'El codo apoyado en la cara interna del muslo.',
    'Un brazo por vez, sin impulso.',
    'Mismo número de cada lado.'] },
  Bench_Dips: { nombre:'Fondos en banco', slot:'TRÍCEPS', carga:false, claves:[
    'Manos al borde del banco, dedos hacia adelante.',
    'Bajá hasta que el codo quede en ángulo recto, no más.',
    'Si molesta el hombro, bajá menos.'] },
  Standing_Dumbbell_Triceps_Extension: { nombre:'Tríceps de pie', slot:'TRÍCEPS', carga:true, claves:[
    'Codos apuntando al techo y quietos.',
    'Abdomen firme para no arquear la espalda.',
    'Estirá completo sin trabar el codo.'] },

  // ---------- ampliación del catálogo ----------
  Hack_Squat: { nombre:'Sentadilla hack', slot:'CUÁDRICEPS', carga:true, claves:[
    'Espalda y cadera bien apoyadas en el respaldo.',
    'Bajá hasta que el muslo quede paralelo, no más.',
    'Rodillas en línea con los pies, sin dejarlas caer hacia adentro.'] },
  Narrow_Stance_Leg_Press: { nombre:'Prensa con pies juntos', slot:'CUÁDRICEPS', carga:true, claves:[
    'Los pies juntos y bajos en la plataforma.',
    'La cola queda apoyada: si se despega, bajaste demasiado.',
    'No trabes las rodillas al estirar.'] },
  'Single-Leg_Leg_Extension': { nombre:'Extensión a una pierna', slot:'CUÁDRICEPS', carga:true, claves:[
    'Una pierna por vez, mismo número de cada lado.',
    'Estirá completo arriba y bajá despacio.',
    'Espalda apoyada en el respaldo.'] },
  Goblet_Squat: { nombre:'Sentadilla goblet', slot:'CUÁDRICEPS', carga:true, claves:[
    'La pesa contra el pecho, codos hacia abajo.',
    'Cadera hacia atrás y pecho arriba.',
    'Bajá hasta donde puedas sin redondear la espalda.'] },
  Smith_Machine_Squat: { nombre:'Sentadilla en multipower', slot:'CUÁDRICEPS', carga:true, lumbar:true, claves:[
    'La barra apoyada en los hombros, no en el cuello.',
    'Abdomen firme y espalda recta todo el movimiento.',
    'Si sentís la zona baja, bajá el peso o cambiá de ejercicio.'] },
  Chair_Squat: { nombre:'Sentadilla a la silla', slot:'CUÁDRICEPS', carga:false, claves:[
    'Bajá hasta tocar apenas la silla y volvé a subir.',
    'Cadera hacia atrás, como si te fueras a sentar.',
    'Sin dejarte caer de golpe.'] },
  Narrow_Stance_Hack_Squats: { nombre:'Hack con pies juntos', slot:'CUÁDRICEPS', carga:true, claves:[
    'Pies juntos y bajos en la plataforma.',
    'Espalda pegada al respaldo.',
    'Recorrido controlado, sin rebotar abajo.'] },
  Reverse_Hyperextension: { nombre:'Hiperextensión inversa', slot:'FEMORALES', carga:true, lumbar:true, claves:[
    'El torso bien apoyado, sin arquear la espalda al subir.',
    'Subí las piernas sólo hasta la línea del cuerpo.',
    'Movimiento lento, sin impulso.'] },
  Seated_Band_Hamstring_Curl: { nombre:'Femoral sentada con banda', slot:'FEMORALES', carga:false, claves:[
    'La banda en los tobillos, bien anclada.',
    'Flexioná la rodilla llevando el talón hacia atrás.',
    'Volvé despacio sin soltar la tensión.'] },
  Platform_Hamstring_Slides: { nombre:'Deslizamientos de femoral', slot:'FEMORALES', carga:false, claves:[
    'Cadera arriba todo el movimiento.',
    'Estirá las piernas despacio y traelas de vuelta.',
    'Si la cadera se hunde, cortá la serie.'] },
  'Stiff-Legged_Dumbbell_Deadlift': { nombre:'Peso muerto piernas rectas', slot:'FEMORALES', carga:true, lumbar:true, claves:[
    'Espalda recta: nunca la redondees.',
    'La cadera va hacia atrás, no te agachás.',
    'Bajá sólo hasta donde la espalda siga recta.'] },
  Smith_Machine_Calf_Raise: { nombre:'Gemelos en multipower', slot:'GEMELO', carga:true, claves:[
    'Sólo la punta del pie en el escalón.',
    'Subí completo y bajá el talón por debajo.',
    'Movimiento lento, sin rebotar.'] },
  Barbell_Seated_Calf_Raise: { nombre:'Gemelos sentada con barra', slot:'GEMELO', carga:true, claves:[
    'La barra apoyada sobre la rodilla, con almohadilla.',
    'Recorrido completo, arriba y abajo.',
    'Sin rebotar en la parte baja.'] },
  Smith_Machine_Reverse_Calf_Raises: { nombre:'Tibiales en multipower', slot:'GEMELO', carga:true, claves:[
    'Los talones apoyados y la punta libre.',
    'Subí la punta del pie hacia vos.',
    'Poco peso: es un músculo chico.'] },
  Pull_Through: { nombre:'Pull through en polea', slot:'GLÚTEO', carga:true, lumbar:true, claves:[
    'La soga entre las piernas, de espaldas a la polea.',
    'La cadera va hacia atrás y vuelve apretando el glúteo.',
    'Espalda recta todo el movimiento.'] },
  Leg_Lift: { nombre:'Elevación de pierna', slot:'GLÚTEO', carga:false, claves:[
    'En cuatro apoyos, espalda recta.',
    'Subí la pierna hasta la altura de la cadera, no más.',
    'Mismo número de cada lado.'] },
  Hip_Circles_prone: { nombre:'Círculos de cadera en el piso', slot:'GLÚTEO MEDIO', carga:false, claves:[
    'En cuatro apoyos, espalda quieta.',
    'Movimiento amplio pero controlado.',
    'Mismo número de cada lado.'] },
  Groiners: { nombre:'Aperturas de cadera', slot:'ADUCTOR', carga:false, claves:[
    'Desde posición de plancha, llevá el pie al lado de la mano.',
    'Movimiento lento, sin rebotes.',
    'Alterná los lados.'] },
  Pallof_Press: { nombre:'Press Pallof', slot:'ABDOMEN', carga:true, claves:[
    'De costado a la polea, brazos al pecho.',
    'Estirá los brazos sin dejar que el torso gire.',
    'Lo que trabaja es aguantar el giro, no moverse.'] },
  Rope_Crunch: { nombre:'Abdominales con soga', slot:'ABDOMEN', carga:true, claves:[
    'De rodillas, la soga al costado de la cara.',
    'Bajá redondeando el abdomen, no tirando con los brazos.',
    'La cadera queda quieta.'] },
  Dead_Bug: { nombre:'Bicho muerto', slot:'ABDOMEN', carga:false, claves:[
    'La zona baja de la espalda pegada al piso todo el tiempo.',
    'Estirá brazo y pierna contrarios, despacio.',
    'Si la espalda se despega, achicá el recorrido.'] },
  Side_Jackknife: { nombre:'Abdominales laterales', slot:'ABDOMEN', carga:false, claves:[
    'Acostada de lado, subí tronco y pierna a la vez.',
    'Movimiento corto y controlado.',
    'Mismo número de cada lado.'] },
  Dumbbell_Side_Bend: { nombre:'Inclinación lateral', slot:'ABDOMEN', carga:true, lumbar:true, claves:[
    'Una sola mancuerna, del lado que trabaja.',
    'Bajá al costado sin inclinarte adelante ni atrás.',
    'Si molesta la zona baja, dejá este ejercicio.'] },
  Pallof_Press_With_Rotation: { nombre:'Press Pallof con giro', slot:'ZONA MEDIA', carga:true, claves:[
    'Estirá los brazos y recién ahí girá.',
    'La cadera queda mirando al frente.',
    'Movimiento lento en los dos sentidos.'] },
  'Butt-Ups': { nombre:'Plancha con elevación', slot:'ZONA MEDIA', carga:false, claves:[
    'Desde la plancha, subí la cadera y volvé.',
    'Sin dejar caer la zona baja al volver.',
    'Movimiento corto y controlado.'] },
  Machine_Bench_Press: { nombre:'Press de pecho en máquina', slot:'EMPUJE HORIZONTAL', carga:true, claves:[
    'Espalda apoyada en el respaldo.',
    'Los manubrios a la altura del pecho.',
    'Estirá sin trabar los codos.'] },
  Leverage_Chest_Press: { nombre:'Press de pecho con palancas', slot:'EMPUJE HORIZONTAL', carga:true, claves:[
    'Espalda y hombros apoyados.',
    'Empujá parejo con los dos brazos.',
    'Volvé despacio sin soltar la tensión.'] },
  Smith_Machine_Bench_Press: { nombre:'Press de pecho en multipower', slot:'EMPUJE HORIZONTAL', carga:true, claves:[
    'Pies apoyados y espalda contra el banco.',
    'Bajá la barra al medio del pecho.',
    'Usá los seguros de la máquina.'] },
  'Push-Ups_With_Feet_Elevated': { nombre:'Flexiones con pies elevados', slot:'EMPUJE HORIZONTAL', carga:false, claves:[
    'Cuerpo en línea recta, sin hundir la cadera.',
    'Codos a 45 grados del cuerpo.',
    'Bajá hasta donde puedas manteniendo la línea.'] },
  'Incline_Push-Up': { nombre:'Flexiones inclinadas', slot:'EMPUJE HORIZONTAL', carga:false, claves:[
    'Las manos en un banco o barra a la altura de la cadera.',
    'Cuerpo en línea recta de la cabeza a los pies.',
    'Cuanto más alto el apoyo, más fácil.'] },
  Leverage_Shoulder_Press: { nombre:'Hombros con palancas', slot:'EMPUJE VERTICAL', carga:true, claves:[
    'Espalda bien apoyada en el respaldo.',
    'Subí sin encoger los hombros.',
    'Bajá controlando hasta la altura de la oreja.'] },
  Cable_Shoulder_Press: { nombre:'Hombros en polea', slot:'EMPUJE VERTICAL', carga:true, claves:[
    'Abdomen firme para no arquear la espalda.',
    'Subí en línea con los hombros.',
    'Recorrido completo y controlado.'] },
  Seated_Cable_Shoulder_Press: { nombre:'Hombros sentada en polea', slot:'EMPUJE VERTICAL', carga:true, claves:[
    'Espalda apoyada, pies firmes en el piso.',
    'Subí sin trabar los codos.',
    'Bajá contando hasta dos.'] },
  Smith_Machine_Overhead_Shoulder_Press: { nombre:'Hombros en multipower', slot:'EMPUJE VERTICAL', carga:true, claves:[
    'La barra al frente, no detrás de la nuca.',
    'Abdomen firme para no arquear la espalda.',
    'Bajá hasta la altura del mentón.'] },
  Cuban_Press: { nombre:'Press cubano', slot:'EMPUJE VERTICAL', carga:true, claves:[
    'Codos a la altura del hombro todo el movimiento.',
    'Primero rotás, después empujás.',
    'Poco peso: es un ejercicio de control, no de fuerza.'] },
  Cable_Seated_Lateral_Raise: { nombre:'Vuelos sentada en polea', slot:'HOMBRO LATERAL', carga:true, claves:[
    'Codos apenas flexionados y fijos.',
    'Subí hasta la altura del hombro, no más.',
    'Sin balancear el torso.'] },
  Front_Cable_Raise: { nombre:'Elevación frontal en polea', slot:'HOMBRO LATERAL', carga:true, claves:[
    'Subí hasta la altura del hombro.',
    'El torso queda quieto.',
    'Volvé despacio sin soltar la tensión.'] },
  'Standing_Low-Pulley_Deltoid_Raise': { nombre:'Vuelo en polea baja', slot:'HOMBRO LATERAL', carga:true, claves:[
    'Un brazo por vez, el otro sujeta la máquina.',
    'Subí al costado hasta la altura del hombro.',
    'Mismo número de cada lado.'] },
  'Cable_Rope_Rear-Delt_Rows': { nombre:'Hombro posterior con soga', slot:'HOMBRO LATERAL', carga:true, claves:[
    'Codos altos, la soga hacia la cara.',
    'Juntá los omóplatos al final.',
    'Poco peso y movimiento lento.'] },
  Machine_Triceps_Extension: { nombre:'Tríceps en máquina', slot:'TRÍCEPS', carga:true, claves:[
    'Espalda apoyada en el respaldo.',
    'Estirá completo sin trabar el codo.',
    'Volvé despacio sin soltar la tensión.'] },
  Dip_Machine: { nombre:'Fondos en máquina', slot:'TRÍCEPS', carga:true, claves:[
    'Torso derecho, hombros abajo.',
    'Bajá hasta que el codo quede en ángulo recto.',
    'Si molesta el hombro, bajá menos.'] },
  Low_Cable_Triceps_Extension: { nombre:'Tríceps en polea baja', slot:'TRÍCEPS', carga:true, claves:[
    'Codos pegados al cuerpo, sin moverlos.',
    'Estirá completo y volvé controlando.',
    'El torso queda firme.'] },
  Cable_Lying_Triceps_Extension: { nombre:'Tríceps acostada en polea', slot:'TRÍCEPS', carga:true, claves:[
    'Los codos quietos, apuntando al techo.',
    'Bajá hasta la frente, sin abrir los codos.',
    'Movimiento lento en los dos sentidos.'] },
  'Close-Grip_Dumbbell_Press': { nombre:'Press cerrado con mancuernas', slot:'TRÍCEPS', carga:true, claves:[
    'Las mancuernas juntas sobre el pecho.',
    'Codos pegados al cuerpo al bajar.',
    'Estirá sin trabar los codos.'] },
  Machine_Preacher_Curls: { nombre:'Bíceps en máquina Scott', slot:'BÍCEPS', carga:true, claves:[
    'Los brazos bien apoyados en el respaldo.',
    'Estirá casi completo abajo, sin trabar el codo.',
    'Subí sin despegar los hombros.'] },
  High_Cable_Curls: { nombre:'Bíceps en polea alta', slot:'BÍCEPS', carga:true, claves:[
    'Brazos a la altura del hombro, codos fijos.',
    'Llevá las manos hacia la cabeza.',
    'Volvé despacio.'] },
  Lying_Cable_Curl: { nombre:'Bíceps acostada en polea', slot:'BÍCEPS', carga:true, claves:[
    'Espalda apoyada en el piso o el banco.',
    'Los codos quedan quietos.',
    'Recorrido completo y controlado.'] },
  Reverse_Cable_Curl: { nombre:'Bíceps invertido en polea', slot:'BÍCEPS', carga:true, claves:[
    'Palmas hacia abajo todo el movimiento.',
    'Codos pegados al cuerpo.',
    'Menos peso que en el bíceps común.'] },
  'V-Bar_Pulldown': { nombre:'Jalón con agarre en V', slot:'TRACCIÓN VERTICAL', carga:true, claves:[
    'Llevá el mango al pecho, no detrás de la nuca.',
    'Codos hacia abajo, no hacia atrás.',
    'Volvé arriba controlando.'] },
  'Straight-Arm_Pulldown': { nombre:'Jalón con brazos rectos', slot:'TRACCIÓN VERTICAL', carga:true, claves:[
    'Brazos casi estirados todo el recorrido.',
    'El movimiento sale de la espalda, no de los codos.',
    'Torso levemente inclinado y quieto.'] },
  Kneeling_High_Pulley_Row: { nombre:'Remo de rodillas en polea', slot:'TRACCIÓN VERTICAL', carga:true, claves:[
    'De rodillas, espalda recta.',
    'Llevá los codos hacia atrás y abajo.',
    'Sin balancear el torso.'] },
  Leverage_Iso_Row: { nombre:'Remo con palancas', slot:'TRACCIÓN VERTICAL', carga:true, claves:[
    'Pecho apoyado en el respaldo.',
    'Tirá con los codos, no con las manos.',
    'Juntá los omóplatos al final.'] },
  'Close-Grip_Front_Lat_Pulldown': { nombre:'Jalón con agarre cerrado', slot:'TRACCIÓN VERTICAL', carga:true, claves:[
    'Llevá el mango al pecho.',
    'Codos pegados al cuerpo.',
    'Volvé arriba sin soltar de golpe.'] },
  Elevated_Cable_Rows: { nombre:'Remo en polea elevada', slot:'TRACCIÓN VERTICAL', carga:true, claves:[
    'Espalda recta, sin balancearte.',
    'Llevá el mango al abdomen.',
    'Juntá los omóplatos.'] },
  Shotgun_Row: { nombre:'Remo a un brazo en polea', slot:'TRACCIÓN VERTICAL', carga:true, claves:[
    'Un brazo por vez, torso firme.',
    'Girá apenas la mano al tirar.',
    'Mismo número de cada lado.'] },
  'Lying_T-Bar_Row': { nombre:'Remo T con pecho apoyado', slot:'TRACCIÓN HORIZONTAL', carga:true, claves:[
    'Pecho apoyado: así la espalda baja no trabaja.',
    'Tirá con los codos hacia atrás.',
    'Juntá los omóplatos al final.'] },
  Leverage_High_Row: { nombre:'Remo alto con palancas', slot:'TRACCIÓN HORIZONTAL', carga:true, claves:[
    'Pecho apoyado en el respaldo.',
    'Codos hacia atrás y abajo.',
    'Volvé despacio.'] },
  'One-Arm_Dumbbell_Row': { nombre:'Remo a un brazo', slot:'TRACCIÓN HORIZONTAL', carga:true, lumbar:true, claves:[
    'Una mano y una rodilla apoyadas en el banco.',
    'Espalda recta y paralela al piso.',
    'Si sentís la zona baja, apoyá más el torso.'] },
  'Seated_One-arm_Cable_Pulley_Rows': { nombre:'Remo a un brazo sentada', slot:'TRACCIÓN HORIZONTAL', carga:true, claves:[
    'Espalda recta, sin girar el torso.',
    'Llevá el codo hacia atrás, pegado al cuerpo.',
    'Mismo número de cada lado.'] },
  'T-Bar_Row_with_Handle': { nombre:'Remo T con agarre', slot:'TRACCIÓN HORIZONTAL', carga:true, lumbar:true, claves:[
    'Espalda recta, cadera hacia atrás.',
    'Tirá hasta el abdomen.',
    'Si sentís la zona baja, pasá al remo con pecho apoyado.'] },
  Incline_Bench_Pull: { nombre:'Remo en banco inclinado', slot:'TRACCIÓN HORIZONTAL', carga:true, claves:[
    'Boca abajo sobre el banco, pecho apoyado.',
    'Tirá con los codos hacia atrás.',
    'La espalda baja no trabaja: por eso es el más seguro.'] },
  Dumbbell_Step_Ups: { nombre:'Subidas al cajón con mancuernas', slot:'PIERNA UNILATERAL', carga:true, claves:[
    'Apoyá todo el pie en el cajón.',
    'Subí empujando con esa pierna, sin impulso de la otra.',
    'Mismo número de cada lado.'] },
  Split_Squat_with_Dumbbells: { nombre:'Sentadilla búlgara', slot:'PIERNA UNILATERAL', carga:true, claves:[
    'El pie de atrás apoyado en un banco.',
    'Bajá derecho, la rodilla de adelante sobre el pie.',
    'Torso erguido todo el movimiento.'] },
  'Smith_Single-Leg_Split_Squat': { nombre:'Búlgara en multipower', slot:'PIERNA UNILATERAL', carga:true, claves:[
    'La barra en los hombros, no en el cuello.',
    'El pie de atrás en un banco.',
    'Bajá derecho y controlado.'] },
  Bodyweight_Walking_Lunge: { nombre:'Estocadas caminando', slot:'PIERNA UNILATERAL', carga:false, claves:[
    'Torso derecho, mirada al frente.',
    'La rodilla de adelante no pasa la punta del pie.',
    'Pasos parejos de los dos lados.'] },
  'Single_Leg_Push-off': { nombre:'Empuje a una pierna', slot:'PIERNA UNILATERAL', carga:false, claves:[
    'Un pie en el cajón, empujá sólo con ese.',
    'La otra pierna acompaña, no ayuda.',
    'Mismo número de cada lado.'] },
  Suspended_Split_Squat: { nombre:'Búlgara en suspensión', slot:'PIERNA UNILATERAL', carga:false, claves:[
    'El pie de atrás en la cinta, apenas apoyado.',
    'Bajá derecho sin inclinarte adelante.',
    'Sujetate si perdés el equilibrio.'] },

  // ---------- tracción ----------
  'Wide-Grip_Lat_Pulldown': { nombre:'Jalón al pecho', slot:'TRACCIÓN VERTICAL', carga:true, claves:[
    'Llevá la barra al pecho, no detrás de la nuca.',
    'Codos hacia abajo, no hacia atrás.',
    'Volvé arriba controlando, sin soltar de golpe.'] },
  One_Arm_Lat_Pulldown: { nombre:'Jalón a un brazo', slot:'TRACCIÓN VERTICAL', carga:true, claves:[
    'Un lado por vez, mismo número de repeticiones.',
    'El torso queda firme, sin girar.',
    'Codo hacia la cadera.'] },
  'Rope_Straight-Arm_Pulldown': { nombre:'Pullover en polea', slot:'TRACCIÓN VERTICAL', carga:true, claves:[
    'Brazos casi estirados todo el recorrido.',
    'El movimiento sale de la espalda, no de los codos.',
    'Torso levemente inclinado y quieto.'] },
  Seated_Cable_Rows: { nombre:'Remo en polea', slot:'TRACCIÓN HORIZONTAL', carga:true, claves:[
    'Espalda derecha, sin balancearte hacia atrás.',
    'Llevá el mango al abdomen, juntando los omóplatos.',
    'Rodillas apenas flexionadas.'] },
  'Bent_Over_Two-Dumbbell_Row': { nombre:'Remo con mancuernas', slot:'TRACCIÓN HORIZONTAL', carga:true, lumbar:true, claves:[
    'Espalda recta y pecho firme: no la redondees.',
    'Cadera hacia atrás, rodillas apenas dobladas.',
    'Si sentís la zona baja, bajá el peso o pasá al remo en polea.'] },
  'Reverse_Grip_Bent-Over_Rows': { nombre:'Remo supino con barra', slot:'TRACCIÓN HORIZONTAL', carga:true, lumbar:true, claves:[
    'Espalda recta, nunca redondeada.',
    'Palmas hacia adelante, codos pegados al cuerpo.',
    'Si sentís la zona baja, pasá al remo en polea.'] },
  Alternate_Hammer_Curl: { nombre:'Bíceps martillo alternado', slot:'BÍCEPS', carga:true, claves:[
    'Palmas enfrentadas todo el movimiento.',
    'Codos pegados al cuerpo, sin balanceo.',
    'Un brazo por vez, bajando despacio.'] },
  Hammer_Curls: { nombre:'Bíceps martillo', slot:'BÍCEPS', carga:true, claves:[
    'Los dos brazos juntos, palmas enfrentadas.',
    'Sin mover el torso.',
    'Bajá contando hasta dos.'] },
  Machine_Bicep_Curl: { nombre:'Bíceps en máquina', slot:'BÍCEPS', carga:true, claves:[
    'Apoyá bien los brazos en el respaldo.',
    'Subí y bajá sin soltar la tensión.',
    'Sin despegar los hombros.'] },

  // ---------- piernas ----------
  Barbell_Hip_Thrust: { nombre:'Empuje de cadera', slot:'GLÚTEO', carga:true, claves:[
    'Apoyá la parte de abajo de los omóplatos en el banco.',
    'Subí apretando los glúteos, sin arquear la espalda.',
    'La pelvis termina alineada, no más arriba.'] },
  Butt_Lift_Bridge: { nombre:'Puente de glúteos', slot:'GLÚTEO', carga:false, claves:[
    'Pies apoyados cerca de la cola.',
    'Subí apretando glúteos, no la espalda.',
    'Bajá sin apoyar del todo entre repeticiones.'] },
  'Step-up_with_Knee_Raise': { nombre:'Subidas al cajón', slot:'PIERNA UNILATERAL', carga:true, claves:[
    'Apoyá todo el pie en el cajón.',
    'Subí empujando con esa pierna, sin impulso de la otra.',
    'Bajá controlando. Mismo número de cada lado.'] },
  Dumbbell_Lunges: { nombre:'Estocadas con mancuernas', slot:'PIERNA UNILATERAL', carga:true, claves:[
    'Torso derecho, mirada al frente.',
    'La rodilla de adelante no pasa la punta del pie.',
    'Mismo número de cada lado.'] },
  Dumbbell_Rear_Lunge: { nombre:'Estocadas hacia atrás', slot:'PIERNA UNILATERAL', carga:true, claves:[
    'El paso va hacia atrás, no adelante.',
    'Bajá la rodilla suave, sin golpear el piso.',
    'Torso derecho todo el movimiento.'] },
  Leg_Press: { nombre:'Prensa de piernas', slot:'CUÁDRICEPS', carga:true, claves:[
    'La cola queda apoyada: si se despega, bajaste demasiado.',
    'Rodillas en línea con los pies.',
    'No trabes las rodillas al estirar.'] },
  Leg_Extensions: { nombre:'Extensiones de cuádriceps', slot:'CUÁDRICEPS', carga:true, claves:[
    'Espalda apoyada en el respaldo.',
    'Estirá completo y bajá despacio.',
    'Si molesta la rodilla, bajá el peso.'] },
  Bodyweight_Squat: { nombre:'Sentadilla sin peso', slot:'CUÁDRICEPS', carga:false, claves:[
    'Pies al ancho de los hombros.',
    'Cadera hacia atrás, pecho arriba.',
    'Bajá hasta donde puedas sin redondear la espalda.'] },
  Lying_Leg_Curls: { nombre:'Camilla de femorales', slot:'FEMORALES', carga:true, claves:[
    'Cadera apoyada, sin despegarla al subir.',
    'Movimiento completo y controlado.',
    'Sin impulso.'] },
  Thigh_Abductor: { nombre:'Abductores en máquina', slot:'GLÚTEO MEDIO', carga:true, claves:[
    'Espalda apoyada en el respaldo.',
    'Abrí despacio y volvé más despacio todavía.',
    'Sin tirones al final del recorrido.'] },
  Thigh_Adductor: { nombre:'Aductores en máquina', slot:'ADUCTOR', carga:true, claves:[
    'Espalda apoyada.',
    'Cerrá despacio y controlá la vuelta.',
    'Rango cómodo, sin forzar la apertura.'] },
  Seated_Calf_Raise: { nombre:'Gemelos sentada', slot:'GEMELO', carga:true, claves:[
    'Subí lo más alto que puedas y bajá el talón por debajo.',
    'Movimiento lento arriba y abajo.',
    'Sin rebotar.'] }
};

/* ============================================================
   LOS TRES DÍAS
   ------------------------------------------------------------
   Día 1  cuádriceps, femorales y gemelos
   Día 2  hombro, bíceps, tríceps, pecho y espalda
   Día 3  abdomen, glúteo, aductores y abductores

   Cada día tiene tres rutinas para elegir. Todas cubren los
   mismos músculos del día, con ejercicios distintos.

   Estructura fija de toda rutina:
   cardio → zona media → cinco musculares de 3 × 10.
   El peso lo decide Emilia en cada serie.
   ============================================================ */

const DIAS = [

  { n:1, region:'Piernas', resumen:'Cuádriceps, femorales y gemelos', opciones:[

    { id:'piernas-maquinas', titulo:'En máquinas',
      grupos:['Cuádriceps','Femorales','Gemelos'], ejercicios:[
      { id:'Elliptical_Trainer', minutos:3, alts:['Jogging_Treadmill','Bicycling_Stationary'] },
      { id:'Plank', series:3, reps:20, alts:['Side_Bridge','Crunches'] },
      { id:'Leg_Press', series:3, reps:10, alts:['Bodyweight_Squat','Leg_Extensions'] },
      { id:'Leg_Extensions', series:3, reps:10, alts:['Leg_Press'] },
      { id:'Lying_Leg_Curls', series:3, reps:10, alts:['Seated_Leg_Curl','Standing_Leg_Curl'] },
      { id:'Seated_Leg_Curl', series:3, reps:10, alts:['Lying_Leg_Curls','Ball_Leg_Curl'] },
      { id:'Seated_Calf_Raise', series:3, reps:12, alts:['Standing_Calf_Raises','Calf_Press_On_The_Leg_Press_Machine'] }
    ]},

    { id:'piernas-libres', titulo:'Con peso libre',
      grupos:['Cuádriceps','Femorales','Gemelos'], ejercicios:[
      { id:'Jogging_Treadmill', minutos:3, alts:['Elliptical_Trainer','Bicycling_Stationary'] },
      { id:'Side_Bridge', series:3, reps:20, alts:['Plank','Air_Bike'] },
      { id:'Dumbbell_Lunges', series:3, reps:10, alts:['Dumbbell_Rear_Lunge','Step-up_with_Knee_Raise'] },
      { id:'Bodyweight_Squat', series:3, reps:15, alts:['Leg_Press','Leg_Extensions'] },
      { id:'Ball_Leg_Curl', series:3, reps:12, alts:['Lying_Leg_Curls','Seated_Leg_Curl'] },
      { id:'Standing_Leg_Curl', series:3, reps:10, alts:['Seated_Leg_Curl','Lying_Leg_Curls'] },
      { id:'Standing_Dumbbell_Calf_Raise', series:3, reps:12, alts:['Standing_Calf_Raises','Seated_Calf_Raise'] }
    ]},

    { id:'piernas-unilateral', titulo:'Pierna por pierna',
      grupos:['Cuádriceps','Femorales','Gemelos'], ejercicios:[
      { id:'Bicycling_Stationary', minutos:3, alts:['Elliptical_Trainer','Jogging_Treadmill'] },
      { id:'Crunches', series:3, reps:15, alts:['Air_Bike','Plank'] },
      { id:'Step-up_with_Knee_Raise', series:3, reps:10, alts:['Dumbbell_Lunges','Dumbbell_Rear_Lunge'] },
      { id:'Dumbbell_Rear_Lunge', series:3, reps:10, alts:['Dumbbell_Lunges','Step-up_with_Knee_Raise'] },
      { id:'Standing_Leg_Curl', series:3, reps:10, alts:['Lying_Leg_Curls','Ball_Leg_Curl'] },
      { id:'Lying_Leg_Curls', series:3, reps:10, alts:['Seated_Leg_Curl'] },
      { id:'Calf_Press_On_The_Leg_Press_Machine', series:3, reps:12, alts:['Seated_Calf_Raise','Standing_Calf_Raises'] }
    ]}
  ]},

  { n:2, region:'Tren superior', resumen:'Hombro, bíceps, tríceps, pecho y espalda', opciones:[

    { id:'superior-mancuernas', titulo:'Con mancuernas',
      grupos:['Hombro','Bíceps','Tríceps','Pecho','Espalda'], ejercicios:[
      { id:'Jogging_Treadmill', minutos:3, alts:['Elliptical_Trainer','Bicycling_Stationary'] },
      { id:'Hyperextensions_Back_Extensions', series:3, reps:10, alts:['Plank','Side_Bridge'] },
      { id:'Dumbbell_Shoulder_Press', series:3, reps:10, alts:['Arnold_Dumbbell_Press'] },
      { id:'Dumbbell_Bench_Press', series:3, reps:10, alts:['Incline_Dumbbell_Press'] },
      { id:'Bent_Over_Two-Dumbbell_Row', series:3, reps:10, alts:['Seated_Cable_Rows'] },
      { id:'Alternate_Hammer_Curl', series:3, reps:10, alts:['Hammer_Curls','Machine_Bicep_Curl'] },
      { id:'Lying_Triceps_Press', series:3, reps:10, alts:['Triceps_Pushdown'] }
    ]},

    { id:'superior-poleas', titulo:'En poleas',
      grupos:['Hombro','Bíceps','Tríceps','Pecho','Espalda'], ejercicios:[
      { id:'Elliptical_Trainer', minutos:3, alts:['Jogging_Treadmill','Bicycling_Stationary'] },
      { id:'Plank', series:3, reps:20, alts:['Side_Bridge','Crunches'] },
      { id:'Wide-Grip_Lat_Pulldown', series:3, reps:10, alts:['One_Arm_Lat_Pulldown'] },
      { id:'Incline_Dumbbell_Press', series:3, reps:10, alts:['Dumbbell_Bench_Press'] },
      { id:'Face_Pull', series:3, reps:10, alts:['Side_Lateral_Raise'] },
      { id:'Machine_Bicep_Curl', series:3, reps:10, alts:['Hammer_Curls','Alternate_Hammer_Curl'] },
      { id:'Triceps_Pushdown', series:3, reps:10, alts:['Cable_Rope_Overhead_Triceps_Extension'] }
    ]},

    { id:'superior-mixto', titulo:'Mixto',
      grupos:['Hombro','Bíceps','Tríceps','Pecho','Espalda'], ejercicios:[
      { id:'Bicycling_Stationary', minutos:3, alts:['Elliptical_Trainer','Jogging_Treadmill'] },
      { id:'Air_Bike', series:3, reps:15, alts:['Crunches','Plank'] },
      { id:'Arnold_Dumbbell_Press', series:3, reps:10, alts:['Dumbbell_Shoulder_Press'] },
      { id:'Seated_Cable_Rows', series:3, reps:10, alts:['Bent_Over_Two-Dumbbell_Row'] },
      { id:'Dumbbell_Bench_Press', series:3, reps:10, alts:['Incline_Dumbbell_Press'] },
      { id:'Hammer_Curls', series:3, reps:10, alts:['Alternate_Hammer_Curl','Machine_Bicep_Curl'] },
      { id:'Cable_Rope_Overhead_Triceps_Extension', series:3, reps:10, alts:['Triceps_Pushdown','Lying_Triceps_Press'] }
    ]}
  ]},

  { n:3, region:'Abdomen y glúteo', resumen:'Abdomen, glúteo, aductores y abductores', opciones:[

    { id:'abdomen-gluteo-maquinas', titulo:'En máquinas',
      grupos:['Abdomen','Glúteo','Aductores','Abductores'], ejercicios:[
      { id:'Bicycling_Stationary', minutos:3, alts:['Elliptical_Trainer','Jogging_Treadmill'] },
      { id:'Plank', series:3, reps:20, alts:['Side_Bridge','Crunches'] },
      { id:'Ab_Crunch_Machine', series:3, reps:12, alts:['Cable_Crunch','Crunches'] },
      { id:'Barbell_Hip_Thrust', series:3, reps:10, alts:['Butt_Lift_Bridge','Single_Leg_Glute_Bridge'] },
      { id:'One-Legged_Cable_Kickback', series:3, reps:10, alts:['Glute_Kickback'] },
      { id:'Thigh_Adductor', series:3, reps:12, alts:['Band_Hip_Adductions'] },
      { id:'Thigh_Abductor', series:3, reps:12, alts:['Glute_Kickback'] }
    ]},

    { id:'abdomen-gluteo-piso', titulo:'En colchoneta',
      grupos:['Abdomen','Glúteo','Aductores','Abductores'], ejercicios:[
      { id:'Elliptical_Trainer', minutos:3, alts:['Jogging_Treadmill','Bicycling_Stationary'] },
      { id:'Side_Bridge', series:3, reps:20, alts:['Plank','Air_Bike'] },
      { id:'Reverse_Crunch', series:3, reps:12, alts:['Cross-Body_Crunch','Crunches'] },
      { id:'Single_Leg_Glute_Bridge', series:3, reps:12, alts:['Butt_Lift_Bridge','Barbell_Hip_Thrust'] },
      { id:'Glute_Kickback', series:3, reps:12, alts:['One-Legged_Cable_Kickback'] },
      { id:'Band_Hip_Adductions', series:3, reps:12, alts:['Thigh_Adductor'] },
      { id:'Thigh_Abductor', series:3, reps:12, alts:['Glute_Kickback'] }
    ]},

    { id:'abdomen-gluteo-completo', titulo:'Completo',
      grupos:['Abdomen','Glúteo','Aductores','Abductores'], ejercicios:[
      { id:'Jogging_Treadmill', minutos:3, alts:['Elliptical_Trainer','Bicycling_Stationary'] },
      { id:'Crunches', series:3, reps:15, alts:['Air_Bike','Plank'] },
      { id:'Cable_Crunch', series:3, reps:12, alts:['Ab_Crunch_Machine','Decline_Crunch'] },
      { id:'Butt_Lift_Bridge', series:3, reps:12, alts:['Barbell_Hip_Thrust','Single_Leg_Glute_Bridge'] },
      { id:'Thigh_Adductor', series:3, reps:12, alts:['Band_Hip_Adductions'] },
      { id:'Thigh_Abductor', series:3, reps:12, alts:['Glute_Kickback'] },
      { id:'Cross-Body_Crunch', series:3, reps:15, alts:['Reverse_Crunch','Decline_Crunch'] }
    ]}
  ]}
];
