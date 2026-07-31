/** Tablas de opciones reutilizables (metamagia, maniobras, oleadas). Editables vía homebrew en localStorage. */

export type TableOption = {
  id: string;
  name: string;
  description: string;
  /** Coste en puntos de hechicería (metamagia) u otro recurso */
  cost?: number;
};

export const METAMAGIC_OPTIONS: TableOption[] = [
  { id: 'careful', name: 'Conjuro cuidadoso', description: 'Elige hasta mod. Carisma criaturas; automáticamente tienen éxito en la salvación del conjuro.', cost: 1 },
  { id: 'distant', name: 'Conjuro lejano', description: 'Duplica el alcance de un conjuro. Toque pasa a 30 ft.', cost: 1 },
  { id: 'empowered', name: 'Conjuro potenciado', description: 'Vuelve a tirar hasta mod. Carisma dados de daño; debes usar los nuevos resultados.', cost: 1 },
  { id: 'extended', name: 'Conjuro extendido', description: 'Duplica la duración de un conjuro (máx. 24 horas).', cost: 1 },
  { id: 'heightened', name: 'Conjuro elevado', description: 'Una criatura tiene desventaja en la primera salvación del conjuro.', cost: 3 },
  { id: 'quickened', name: 'Conjuro acelerado', description: 'Un conjuro de tiempo de lanzamiento 1 acción pasa a acción adicional.', cost: 2 },
  { id: 'subtle', name: 'Conjuro sutil', description: 'Lanza sin componentes verbales ni somáticos.', cost: 1 },
  { id: 'twinned', name: 'Conjuro gemelo', description: 'Si el conjuro afecta a una sola criatura y no tiene alcance personal, puedes apuntar a una segunda (coste = nivel del espacio; trucos cuestan 1).', cost: 1 },
  { id: 'seeking', name: 'Conjuro buscador', description: 'Si fallas un ataque de conjuro, puedes volver a tirar (2024).', cost: 2 },
  { id: 'transmuted', name: 'Conjuro transmutado', description: 'Cambia el tipo de daño del conjuro a ácido, frío, fuego, rayo, veneno o trueno.', cost: 1 },
];

export const BATTLE_MASTER_MANEUVERS: TableOption[] = [
  { id: 'ambush', name: 'Emboscada', description: 'Añades el dado de superioridad a una prueba de Sigilo o a la iniciativa.' },
  { id: 'bait', name: 'Cebo y cambio', description: 'Cuando una criatura te falla un ataque cuerpo a cuerpo, usa reacción para forzar ataque contra otra criatura.' },
  { id: 'commanders-strike', name: 'Golpe del comandante', description: 'Por acción adicional, un aliado puede usar su reacción para atacar y añadir el dado de superioridad al daño.' },
  { id: 'disarming', name: 'Ataque desarmador', description: 'Al golpear, añades el dado al daño y el objetivo debe soltar un objeto (salvación de Fuerza).' },
  { id: 'distracting', name: 'Ataque distractor', description: 'Al golpear, añades el dado al daño; el siguiente ataque de un aliado tiene ventaja.' },
  { id: 'evasive', name: 'Paso evasivo', description: 'Cuando te mueves, el dado se añade a la CA contra ataques de oportunidad.' },
  { id: 'feinting', name: 'Ataque de finta', description: 'Acción adicional: ventaja en el siguiente ataque contra el objetivo; añade el dado al daño.' },
  { id: 'goading', name: 'Ataque provocador', description: 'Al golpear, añades el dado al daño; el objetivo tiene desventaja al atacar a otros distintos de ti.' },
  { id: 'lunging', name: 'Ataque en estocada', description: 'Aumentas el alcance en 5 ft y añades el dado al daño.' },
  { id: 'maneuvering', name: 'Ataque de maniobra', description: 'Al golpear, añades el dado al daño; un aliado puede moverse sin provocar ataques de oportunidad.' },
  { id: 'menacing', name: 'Ataque amenazante', description: 'Al golpear, añades el dado al daño; el objetivo puede quedar asustado (salvación de Sabiduría).' },
  { id: 'parry', name: 'Parada', description: 'Reacción al ser golpeado: reduces el daño en el dado + mod. Destreza.' },
  { id: 'precision', name: 'Ataque de precisión', description: 'Tras ver la tirada de ataque, añades el dado de superioridad al ataque.' },
  { id: 'pushing', name: 'Ataque empujón', description: 'Al golpear, añades el dado al daño y empujas hasta 15 ft (salvación de Fuerza).' },
  { id: 'rally', name: 'Reagrupar', description: 'Acción adicional: un aliado gana PG temporales iguales al dado + mod. Carisma.' },
  { id: 'riposte', name: 'Respuesta', description: 'Reacción cuando una criatura te falla un ataque cuerpo a cuerpo: la atacas y añades el dado al daño.' },
  { id: 'sweeping', name: 'Ataque en barrido', description: 'Al golpear, otra criatura a 5 ft recibe daño igual al dado de superioridad si el ataque original la habría alcanzado.' },
  { id: 'trip', name: 'Ataque derribo', description: 'Al golpear, añades el dado al daño; el objetivo puede caer prono (salvación de Fuerza).' },
];

/** Tabla simplificada de oleada de magia salvaje (efectos jugables resumidos) */
export const WILD_MAGIC_SURGE: { roll: string; effect: string }[] = [
  { roll: '01-02', effect: 'Tiras en esta tabla al inicio de cada uno de tus turnos durante 1 minuto. Si sacas este resultado otra vez, el efecto termina.' },
  { roll: '03-04', effect: 'Una explosión de magia te cura 2d10 PG o te daña 2d10 (elige al azar).' },
  { roll: '05-06', effect: 'Te vuelves invisible hasta que atacas o lanzas un conjuro, o hasta 1 minuto.' },
  { roll: '07-08', effect: 'Una criatura aleatoria a 60 ft (distinta de ti) queda hechizada 1 minuto (o hasta que le hagan daño).' },
  { roll: '09-10', effect: 'Recuperas 1d4 puntos de hechicería (o espacios de nivel 1 equivalentes).' },
  { roll: '11-12', effect: 'Lanzas Fireball centrado en ti (salvación normal).' },
  { roll: '13-14', effect: 'Lanzas Magic Missile como espacio de nivel 5.' },
  { roll: '15-16', effect: 'Tu piel cambia de color durante 24 horas.' },
  { roll: '17-18', effect: 'Ganas un vuelo de 30 ft durante 1 minuto.' },
  { roll: '19-20', effect: 'Quedas bajo el efecto de Mirror Image.' },
  { roll: '21-22', effect: 'Lanzas Darkness centrado en ti; solo tú puedes ver a través.' },
  { roll: '23-24', effect: 'Una copia ilusoria tuya aparece a 5 ft y hace ruido (1 minuto).' },
  { roll: '25-26', effect: 'Tú y hasta 3 criaturas a 30 ft ganan 1d10 PG temporales.' },
  { roll: '27-28', effect: 'Castas Levitate sobre ti mismo.' },
  { roll: '29-30', effect: 'Un unicornio ilusorio aparece a 5 ft durante 1 minuto.' },
  { roll: '31-32', effect: 'No puedes hablar durante 1 minuto; en su lugar emites brillos de colores.' },
  { roll: '33-34', effect: 'Recuperas el espacio de conjuro de menor nivel que hayas gastado.' },
  { roll: '35-36', effect: 'Durante 1 minuto, cada vez que te golpean el atacante recibe 1d6 de fuerza.' },
  { roll: '37-38', effect: 'Castas Fog Cloud centrado en ti.' },
  { roll: '39-40', effect: 'Hasta 3 criaturas a 30 ft hacen una salvación de Constitución o quedan incapacitadas 1 asalto.' },
  { roll: '41-42', effect: 'Tu velocidad se duplica durante 1 minuto.' },
  { roll: '43-44', effect: 'Lanzas Polymorph sobre ti: te conviertes en una oveja (si fallas la salvación).' },
  { roll: '45-46', effect: 'Puedes tomar una acción adicional de inmediato.' },
  { roll: '47-48', effect: 'Cada criatura a 30 ft queda bajo el efecto de Faerie Fire (sin concentración).' },
  { roll: '49-50', effect: 'Recuperas la mitad de tus PG máximos.' },
  { roll: '51-52', effect: 'Una de tus manos se convierte en una garra durante 1 minuto (+1d6 daño de tajo en un ataque).' },
  { roll: '53-54', effect: 'Castas Enlarge/Reduce sobre ti mismo (aleatorio).' },
  { roll: '55-56', effect: 'Ganas resistencia a todo el daño durante 1 minuto.' },
  { roll: '57-58', effect: 'Una luz brillante te rodea 1 minuto; criaturas a 10 ft tienen desventaja al atacarte.' },
  { roll: '59-60', effect: 'Castas Thunderwave desde ti (espacio 1).' },
  { roll: '61-62', effect: 'Durante 1 minuto añades 1d6 de rayo a un ataque o conjuro por turno.' },
  { roll: '63-64', effect: 'Una planta crece bajo tus pies (terreno difícil en 5 ft) durante 1 minuto.' },
  { roll: '65-66', effect: 'Ganas visión en la oscuridad 60 ft durante 1 minuto (o 24 h).' },
  { roll: '67-68', effect: 'Una criatura aleatoria a 60 ft debe hacer salvación de Sabiduría o soltar lo que sostiene.' },
  { roll: '69-70', effect: 'Lanzas Fear centrado en ti (tú estás inmunizado).' },
  { roll: '71-72', effect: 'Durante 1 minuto tu tamaño aumenta una categoría (como Enlarge).' },
  { roll: '73-74', effect: 'Castas Grease centrado en ti.' },
  { roll: '75-76', effect: 'Una armadura mágica te otorga +2 CA durante 1 minuto.' },
  { roll: '77-78', effect: 'Puedes teletransportarte hasta 60 ft como acción adicional durante 1 minuto.' },
  { roll: '79-80', effect: 'Castas Slow sobre una criatura aleatoria a 60 ft (sin concentración).' },
  { roll: '81-82', effect: 'Una nube de mariposas te oculta (ataques contra ti con desventaja) 1 minuto o hasta que ataques.' },
  { roll: '83-84', effect: 'Ganas 1d6 puntos de hechicería (máximo tu máximo).' },
  { roll: '85-86', effect: 'Castas Blink sobre ti mismo.' },
  { roll: '87-88', effect: 'Durante 1 minuto, cuando fallas una salvación puedes volver a tirar (1 vez).' },
  { roll: '89-90', effect: 'Una criatura a 60 ft (elegida al azar) queda bajo Hold Person (sin concentración, 1 asalto).' },
  { roll: '91-92', effect: 'Recuperas todos los espacios de conjuro de nivel 1 gastados.' },
  { roll: '93-94', effect: 'Castas Fly sobre ti mismo durante 1 minuto.' },
  { roll: '95-96', effect: 'Durante 1 minuto eres resistente al daño de conjuros.' },
  { roll: '97-98', effect: 'Tú y todas las criaturas a 30 ft ganan 3d10 PG temporales.' },
  { roll: '99-00', effect: 'Lanzas Wish (efecto no relacionado con daño masivo; el DM elige un efecto benigno útil) o recuperas todos los SP y espacios de nivel 1–2.' },
];

export const STORAGE_METAMAGIC = 'dnd-homebrew-metamagic';
export const STORAGE_MANEUVERS = 'dnd-homebrew-maneuvers';
export const STORAGE_WILD = 'dnd-homebrew-wild-surge';
