/* ============================================================
   AMCE — catálogo de ejercicios y plan de la semana
   ------------------------------------------------------------
   Las fotos salen de Free Exercise DB (dominio público, Unlicense).
   Para que la app funcione sin conexión, bajá las imágenes al repo
   y cambiá BASE_IMG por './img/'. El README explica cómo.
   ============================================================ */

const BASE_IMG = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

/* ------------------------------------------------------------
   CÓDIGOS DE ACCESO
   Se guardan cifrados para que no se lean a simple vista.
   OJO: esto frena a un curioso, no es seguridad de verdad.
   Cualquiera con conocimientos puede saltearlo.

   El código de prueba es 123456. Para cambiarlo, pedime que
   genere el cifrado del número que quieras y reemplazá la lista.
   ------------------------------------------------------------ */
const CODIGOS = [
  '7dd1705a-dfbb4963'   // 123456  ← reemplazar
];

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
  Barbell_Hip_Thrust: { nombre:'Empuje de cadera', slot:'CADERA', carga:true, claves:[
    'Apoyá la parte de abajo de los omóplatos en el banco.',
    'Subí apretando los glúteos, sin arquear la espalda.',
    'La pelvis termina alineada, no más arriba.'] },
  Butt_Lift_Bridge: { nombre:'Puente de glúteos', slot:'CADERA', carga:false, claves:[
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
  Thigh_Adductor: { nombre:'Aductores en máquina', slot:'GLÚTEO MEDIO', carga:true, claves:[
    'Espalda apoyada.',
    'Cerrá despacio y controlá la vuelta.',
    'Rango cómodo, sin forzar la apertura.'] },
  Seated_Calf_Raise: { nombre:'Gemelos sentada', slot:'GEMELO', carga:true, claves:[
    'Subí lo más alto que puedas y bajá el talón por debajo.',
    'Movimiento lento arriba y abajo.',
    'Sin rebotar.'] }
};

/* Los tres días. Estructura fija:
   cardio → zona media → cinco musculares.
   Todos los musculares van 3 × 10 y el peso lo decide Emilia.

   NOTA: la agrupación empuje / tracción / piernas todavía no está
   confirmada con Emilia. Cambiarla es reordenar estas listas. */
const DIAS = [
  { n:1, titulo:'Empuje', ejercicios:[
    { id:'Elliptical_Trainer', minutos:3, alts:['Jogging_Treadmill','Bicycling_Stationary'] },
    { id:'Plank', series:3, reps:20, alts:['Side_Bridge','Crunches','Hyperextensions_Back_Extensions'] },
    { id:'Dumbbell_Shoulder_Press', series:3, reps:10, alts:['Arnold_Dumbbell_Press'] },
    { id:'Dumbbell_Bench_Press', series:3, reps:10, alts:['Incline_Dumbbell_Press'] },
    { id:'Side_Lateral_Raise', series:3, reps:10, alts:['Face_Pull'] },
    { id:'Lying_Triceps_Press', series:3, reps:10, alts:['Cable_Rope_Overhead_Triceps_Extension','Triceps_Pushdown'] },
    { id:'Triceps_Pushdown', series:3, reps:10, alts:['Cable_Rope_Overhead_Triceps_Extension','Lying_Triceps_Press'] }
  ]},
  { n:2, titulo:'Tracción', ejercicios:[
    { id:'Jogging_Treadmill', minutos:3, alts:['Elliptical_Trainer','Bicycling_Stationary'] },
    { id:'Hyperextensions_Back_Extensions', series:3, reps:10, alts:['Plank','Side_Bridge','Crunches'] },
    { id:'Wide-Grip_Lat_Pulldown', series:3, reps:10, alts:['One_Arm_Lat_Pulldown','Rope_Straight-Arm_Pulldown'] },
    { id:'Seated_Cable_Rows', series:3, reps:10, alts:['Bent_Over_Two-Dumbbell_Row'] },
    { id:'Reverse_Grip_Bent-Over_Rows', series:3, reps:10, alts:['Bent_Over_Two-Dumbbell_Row','Seated_Cable_Rows'] },
    { id:'Face_Pull', series:3, reps:10, alts:['Side_Lateral_Raise'] },
    { id:'Alternate_Hammer_Curl', series:3, reps:10, alts:['Hammer_Curls','Machine_Bicep_Curl'] }
  ]},
  { n:3, titulo:'Piernas', ejercicios:[
    { id:'Bicycling_Stationary', minutos:3, alts:['Elliptical_Trainer','Jogging_Treadmill'] },
    { id:'Side_Bridge', series:3, reps:20, alts:['Plank','Air_Bike','Crunches'] },
    { id:'Barbell_Hip_Thrust', series:3, reps:10, alts:['Butt_Lift_Bridge'] },
    { id:'Step-up_with_Knee_Raise', series:3, reps:10, alts:['Dumbbell_Lunges','Dumbbell_Rear_Lunge'] },
    { id:'Leg_Press', series:3, reps:10, alts:['Leg_Extensions','Bodyweight_Squat'] },
    { id:'Lying_Leg_Curls', series:3, reps:10, alts:['Leg_Extensions'] },
    { id:'Thigh_Abductor', series:3, reps:10, alts:['Thigh_Adductor','Seated_Calf_Raise'] }
  ]}
];
