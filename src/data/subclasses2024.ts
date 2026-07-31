import type { FeatureEntry } from '../types/dnd';

export type SubclassDef = {
  id: string;
  name: string;
  description: string;
  /** Features gained at specific levels (2024 progression) */
  features: FeatureEntry[];
};

/**
 * Subclases PHB 2024 — progresión completa resumida (no texto legal del manual).
 * Niveles típicos: 3, 6, 10, 14 (varía por clase).
 */
export const SUBCLASSES_2024: Record<string, SubclassDef[]> = {
  barbarian: [
    {
      id: 'berserker',
      name: 'Senda del Berserker',
      description: 'Furia que estalla en violencia pura.',
      features: [
        { id: 'ber-3', name: 'Frenesí', description: 'Mientras estás en Furia, puedes hacer un ataque cuerpo a cuerpo como acción adicional. Al terminar la Furia puedes sufrir agotamiento (según reglas de tu mesa/2024).', level: 3, source: 'subclass', actionType: 'bonus' },
        { id: 'ber-6', name: 'Furia ciega', description: 'Mientras estás en Furia no puedes ser hechizado ni asustado; si ya lo estabas, se suspende hasta que termina la Furia.', level: 6, source: 'subclass', actionType: 'passive' },
        { id: 'ber-10', name: 'Presencia intimidante', description: 'Puedes asustar a criaturas cercanas usando tu fuerza de voluntad (salvación de Sabiduría).', level: 10, source: 'subclass', actionType: 'action', uses: { max: 1, recovery: 'long' } },
        { id: 'ber-14', name: 'Retaliación', description: 'Cuando sufres daño de una criatura a 5 ft, puedes usar tu reacción para atacarla cuerpo a cuerpo.', level: 14, source: 'subclass', actionType: 'reaction' },
      ],
    },
    {
      id: 'wild-heart',
      name: 'Senda del Corazón Salvaje',
      description: 'Espíritu animal y poderes de la bestia.',
      features: [
        { id: 'wh-3', name: 'Aspecto animal', description: 'Elige un aspecto (oso, águila, lobo, etc.) que otorga un beneficio en Furia o pasivo.', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Elige el aspecto animal.', actionType: 'passive' },
        { id: 'wh-6', name: 'Aspecto bestial', description: 'Ganas un beneficio adicional al elegir otro aspecto o potenciar el actual.', level: 6, source: 'subclass', requiresChoice: true, choiceHint: 'Elige el aspecto de nivel 6.', actionType: 'passive' },
        { id: 'wh-10', name: 'Llamada espiritual', description: 'Puedes comunicarte mejor con animales o invocar un efecto espiritual breve.', level: 10, source: 'subclass', actionType: 'action' },
        { id: 'wh-14', name: 'Poder tótem', description: 'Mientras estás en Furia obtienes un poder mayor ligado a tus aspectos.', level: 14, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'world-tree',
      name: 'Senda del Árbol del Mundo',
      description: 'Raíces de Yggdrasil: movilidad y protección.',
      features: [
        { id: 'wt-3', name: 'Raíces del Árbol del Mundo', description: 'En Furia puedes anclarte o extender raíces para moverte o restringir enemigos.', level: 3, source: 'subclass', actionType: 'bonus' },
        { id: 'wt-6', name: 'Ramas guardianas', description: 'Otorgas cobertura o resistencia temporal a aliados cercanos mientras estás en Furia.', level: 6, source: 'subclass', actionType: 'bonus' },
        { id: 'wt-10', name: 'Viaje por las raíces', description: 'Teletransporte corto a través de raíces místicas.', level: 10, source: 'subclass', actionType: 'bonus', uses: { max: 1, recovery: 'short' } },
        { id: 'wt-14', name: 'Bastión del Árbol del Mundo', description: 'Aura protectora potente durante la Furia.', level: 14, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'zealot',
      name: 'Senda del Zelote',
      description: 'Furia sagrada de un dios o ideal.',
      features: [
        { id: 'ze-3', name: 'Furia divina', description: 'En Furia, tus armas infligen daño radiante o necrótico extra.', level: 3, source: 'subclass', actionType: 'passive' },
        { id: 'ze-6', name: 'Guerrero del dios', description: 'Ventaja en salvaciones para no morir o bonus al revivir (según implementación de mesa).', level: 6, source: 'subclass', actionType: 'passive' },
        { id: 'ze-10', name: 'Presencia zelote', description: 'Bonus a intimidar o a tiradas de Carisma relacionadas con tu fe.', level: 10, source: 'subclass', actionType: 'passive' },
        { id: 'ze-14', name: 'Rabia del fanático', description: 'Puedes seguir combatiendo brevemente con 0 PG mientras estás en Furia.', level: 14, source: 'subclass', actionType: 'passive' },
      ],
    },
  ],
  bard: [
    {
      id: 'dance',
      name: 'Colegio de la Danza',
      description: 'Movimiento, ritmo y combate fluido.',
      features: [
        { id: 'da-3', name: 'Derviche inspirado', description: 'Usas danza para potenciar movimiento y ataques; opciones de acción adicional ligadas al ritmo.', level: 3, source: 'subclass', actionType: 'bonus' },
        { id: 'da-6', name: 'Paso refulgente', description: 'Cuando te mueves, puedes imponer desventaja a ataques de oportunidad o ganar distancia extra.', level: 6, source: 'subclass', actionType: 'passive' },
        { id: 'da-14', name: 'Coda final', description: 'Efecto potente de danza que afecta a varios enemigos o aliados una vez por descanso largo.', level: 14, source: 'subclass', actionType: 'action', uses: { max: 1, recovery: 'long' } },
      ],
    },
    {
      id: 'glamour',
      name: 'Colegio del Glamour',
      description: 'Encanto feérico y mando inspirador.',
      features: [
        { id: 'gl-3', name: 'Manto de inspiración', description: 'Repartes inspiración con un toque de glamour; aliados pueden ganar movimiento.', level: 3, source: 'subclass', actionType: 'bonus' },
        { id: 'gl-6', name: 'Manto de majestad', description: 'Asumes una presencia que fuerza a enemigos a arrodillarse o detenerse (efecto limitado).', level: 6, source: 'subclass', actionType: 'action', uses: { max: 1, recovery: 'long' } },
        { id: 'gl-14', name: 'Majestad inquebrantable', description: 'Resistencia a ser hechizado; puedes reflejar efectos de encantamiento.', level: 14, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'lore',
      name: 'Colegio del Saber',
      description: 'Erudición, secretos y corte de palabras.',
      features: [
        { id: 'lo-3', name: 'Competencias adicionales', description: 'Ganas competencia en 3 habilidades a tu elección.', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Indica las 3 habilidades.', actionType: 'passive' },
        { id: 'lo-3b', name: 'Palabras cortantes', description: 'Usas reacción y un dado de inspiración para restar a la tirada de una criatura.', level: 3, source: 'subclass', actionType: 'reaction' },
        { id: 'lo-6', name: 'Secretos mágicos', description: 'Aprendes 2 conjuros de cualquier clase (elige cuáles).', level: 6, source: 'subclass', requiresChoice: true, choiceHint: 'Indica los 2 conjuros de secretos mágicos.', actionType: 'passive' },
        { id: 'lo-14', name: 'Palabra de peerless', description: 'Puedes usar Palabras cortantes sin gastar inspiración un número limitado de veces.', level: 14, source: 'subclass', actionType: 'reaction', uses: { max: 1, recovery: 'long' } },
      ],
    },
    {
      id: 'valor',
      name: 'Colegio del Valor',
      description: 'Bardo de batalla con armas y armadura.',
      features: [
        { id: 'va-3', name: 'Entrenamiento de combate', description: 'Competencia con armadura media, escudos y armas marciales.', level: 3, source: 'subclass', actionType: 'passive' },
        { id: 'va-3b', name: 'Inspiración de combate', description: 'El aliado inspirado puede usar el dado también en daño o CA temporal.', level: 3, source: 'subclass', actionType: 'passive' },
        { id: 'va-6', name: 'Ataque adicional', description: 'Cuando usas la acción Atacar, puedes atacar dos veces.', level: 6, source: 'subclass', actionType: 'passive' },
        { id: 'va-14', name: 'Maestría en batalla', description: 'Puedes hacer un ataque como acción adicional cuando usas un conjuro de bardo.', level: 14, source: 'subclass', actionType: 'bonus' },
      ],
    },
  ],
  cleric: [
    {
      id: 'life',
      name: 'Dominio de la Vida',
      description: 'Curación y preservación de la vida.',
      features: [
        { id: 'li-3', name: 'Discípulo de la vida', description: 'Tus curaciones de conjuros restauran PG adicionales (2 + nivel del conjuro).', level: 3, source: 'subclass', actionType: 'passive' },
        { id: 'li-3b', name: 'Conjuros de dominio (Vida)', description: 'Siempre preparados: conjuros de curación del dominio (p. ej. Bendición, Cura de heridas según lista 2024).', level: 3, source: 'subclass', actionType: 'passive' },
        { id: 'li-6', name: 'Sanador bendito', description: 'Cuando lanzas un conjuro de curación de nivel 1+, una segunda criatura cercana recupera 2 + nivel del conjuro PG.', level: 6, source: 'subclass', actionType: 'passive' },
        { id: 'li-17', name: 'Curación suprema', description: 'Los dados de curación de tus conjuros de clérigo se maximizan.', level: 17, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'light',
      name: 'Dominio de la Luz',
      description: 'Fuego sagrado y revelación.',
      features: [
        { id: 'lt-3', name: 'Destello protector', description: 'Reacción: luz cegadora que impone desventaja a un ataque contra ti.', level: 3, source: 'subclass', actionType: 'reaction', uses: { max: 1, recovery: 'long', perLevels: 1, gainAmount: 0 } },
        { id: 'lt-6', name: 'Halo de luz', description: 'Canalizar divinidad o rasgo para irradiar luz que daña o disuade enemigos.', level: 6, source: 'subclass', actionType: 'action' },
        { id: 'lt-17', name: 'Corona de luz', description: 'Aura de luz brillante que impone desventaja a enemigos hostiles en el área.', level: 17, source: 'subclass', actionType: 'action', uses: { max: 1, recovery: 'long' } },
      ],
    },
    {
      id: 'trickery',
      name: 'Dominio de la Travesura',
      description: 'Engaño, duplicados y sigilo divino.',
      features: [
        { id: 'tr-3', name: 'Bendición del embaucador', description: 'Acción: un aliado gana ventaja en Sigilo durante un tiempo limitado.', level: 3, source: 'subclass', actionType: 'action' },
        { id: 'tr-6', name: 'Duplicado ilusorio', description: 'Puedes crear un duplicado que dificulta los ataques contra ti.', level: 6, source: 'subclass', actionType: 'bonus' },
        { id: 'tr-17', name: 'Mejor duplicado', description: 'Tu duplicado puede interactuar o confundir de forma más potente.', level: 17, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'war',
      name: 'Dominio de la Guerra',
      description: 'Clérigo marcial y golpes guiados.',
      features: [
        { id: 'wa-3', name: 'Sacerdote de guerra', description: 'Cuando tomas la acción Atacar, puedes hacer un ataque de arma adicional (usos limitados).', level: 3, source: 'subclass', actionType: 'bonus', uses: { max: 1, recovery: 'short', perLevels: 1, gainAmount: 0 } },
        { id: 'wa-6', name: 'Golpe guiado', description: 'Reacción: gastar uso para obtener +10 a una tirada de ataque (tras ver el d20).', level: 6, source: 'subclass', actionType: 'reaction' },
        { id: 'wa-17', name: 'Avatar de batalla', description: 'Transformación breve con resistencia y poder marcial.', level: 17, source: 'subclass', actionType: 'action', uses: { max: 1, recovery: 'long' } },
      ],
    },
  ],
  druid: [
    {
      id: 'land',
      name: 'Círculo de la Tierra',
      description: 'Magia de terrenos y recuperación de espacios.',
      features: [
        { id: 'la-3', name: 'Recuperación natural', description: 'En un descanso corto recuperas espacios de conjuro (como Recuperación arcana).', level: 3, source: 'subclass', actionType: 'special' },
        { id: 'la-3b', name: 'Conjuros de círculo', description: 'Elige un terreno; ganas conjuros siempre preparados asociados.', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Elige el terreno del círculo (costa, bosque, monte…).', actionType: 'passive' },
        { id: 'la-6', name: 'Zancada terrestre', description: 'Moverse por terreno difícil no cuesta movimiento extra en ciertos terrenos.', level: 6, source: 'subclass', actionType: 'passive' },
        { id: 'la-10', name: 'Protección de la naturaleza', description: 'Inmunidad o ventaja frente a ciertos efectos elementales según el círculo.', level: 10, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'moon',
      name: 'Círculo de la Luna',
      description: 'Formas salvajes de combate.',
      features: [
        { id: 'mo-3', name: 'Forma de combate', description: 'Formas salvajes más peligrosas; puedes gastar espacios para curarte en forma salvaje.', level: 3, source: 'subclass', actionType: 'bonus' },
        { id: 'mo-6', name: 'Golpe primigenio', description: 'Tus ataques en forma salvaje cuentan como mágicos.', level: 6, source: 'subclass', actionType: 'passive' },
        { id: 'mo-10', name: 'Formas elementales', description: 'Puedes adoptar formas elementales potentes.', level: 10, source: 'subclass', actionType: 'bonus' },
        { id: 'mo-14', name: 'Mil formas', description: 'Mejoras adicionales a CA o PG en forma salvaje.', level: 14, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'sea',
      name: 'Círculo del Mar',
      description: 'Oleaje, frío y poderes oceánicos.',
      features: [
        { id: 'se-3', name: 'Furia de las mareas', description: 'Opciones de daño de frío/rayo y movilidad acuática.', level: 3, source: 'subclass', actionType: 'bonus' },
        { id: 'se-6', name: 'Alma de la tempestad', description: 'Resistencia a frío o rayo; beneficios en agua.', level: 6, source: 'subclass', actionType: 'passive' },
        { id: 'se-10', name: 'Oleada aplastante', description: 'Efecto de área de agua/frío una vez por descanso.', level: 10, source: 'subclass', actionType: 'action', uses: { max: 1, recovery: 'long' } },
        { id: 'se-14', name: 'Señor de las profundidades', description: 'Nado y respiración mejorados; presencia oceánica.', level: 14, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'stars',
      name: 'Círculo de las Estrellas',
      description: 'Constelaciones y forma estrellada.',
      features: [
        { id: 'st-3', name: 'Mapa estelar', description: 'Elige constelación (Arquero, Cáliz, Dragón) que altera ataques o curaciones.', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Elige constelación activa.', actionType: 'bonus' },
        { id: 'st-6', name: 'Fulgor cósmico', description: 'Mejora el efecto de tu constelación o añade usos.', level: 6, source: 'subclass', actionType: 'passive' },
        { id: 'st-10', name: 'Forma de constelación mejorada', description: 'Mientras usas Mapa estelar ganas beneficios extra de CA o daño.', level: 10, source: 'subclass', actionType: 'passive' },
        { id: 'st-14', name: 'Lleno de estrellas', description: 'Forma brillante con resistencia a daño no mágico y vuelo breve.', level: 14, source: 'subclass', actionType: 'bonus', uses: { max: 1, recovery: 'long' } },
      ],
    },
  ],
  fighter: [
    {
      id: 'battle-master',
      name: 'Maestro de Batalla',
      description: 'Maniobras y dados de superioridad.',
      features: [
        { id: 'bm-3', name: 'Maniobras', description: 'Aprendes 3 maniobras y ganas dados de superioridad (d8). Elige las maniobras.', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Anota 3 maniobras.', actionType: 'special', uses: { max: 4, recovery: 'short' } },
        { id: 'bm-7', name: 'Conoce a tu enemigo', description: 'Estudias a una criatura para aprender rasgos de combate.', level: 7, source: 'subclass', actionType: 'action' },
        { id: 'bm-10', name: 'Mejora de maniobras', description: 'Dados de superioridad pasan a d10; aprendes más maniobras.', level: 10, source: 'subclass', actionType: 'passive' },
        { id: 'bm-15', name: 'Relentless', description: 'Si te quedan 0 dados de superioridad al iniciar un turno, recuperas 1.', level: 15, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'champion',
      name: 'Campeón',
      description: 'Críticos y atleta excepcional.',
      features: [
        { id: 'ch-3', name: 'Crítico mejorado', description: 'Crítico con arma en 19–20.', level: 3, source: 'subclass', actionType: 'passive' },
        { id: 'ch-7', name: 'Atleta excepcional', description: 'Corres, saltas y trepas mejor; iniciativa con ventaja ocasional.', level: 7, source: 'subclass', actionType: 'passive' },
        { id: 'ch-10', name: 'Combatiente adicional', description: 'Mejora de estilo de combate o segundo estilo.', level: 10, source: 'subclass', requiresChoice: true, choiceHint: 'Elige estilo de combate adicional o mejora.', actionType: 'passive' },
        { id: 'ch-15', name: 'Crítico superior', description: 'Crítico en 18–20.', level: 15, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'eldritch-knight',
      name: 'Caballero Arcano',
      description: 'Combate con magia de mago.',
      features: [
        { id: 'ek-3', name: 'Lanzamiento de conjuros', description: 'Ganas trucos y conjuros de mago. Elige trucos y conjuros iniciales.', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Indica trucos y conjuros de mago.', actionType: 'passive' },
        { id: 'ek-7', name: 'Vínculo con el arma', description: 'Vinculas un arma; no te pueden desarmar fácilmente; la puedes invocar.', level: 7, source: 'subclass', actionType: 'bonus' },
        { id: 'ek-10', name: 'Golpe de guerra', description: 'Cuando usas la acción Atacar, puedes lanzar un truco en lugar de un ataque.', level: 10, source: 'subclass', actionType: 'passive' },
        { id: 'ek-15', name: 'Carga arcana', description: 'Al golpear con arma puedes imponer efectos o teletransportarte corta distancia.', level: 15, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'psi-warrior',
      name: 'Guerrero Psi',
      description: 'Telequinesia y escudos psiónicos.',
      features: [
        { id: 'pw-3', name: 'Poder psiónico', description: 'Dados de energía psiónica para potenciar ataques o defensa.', level: 3, source: 'subclass', actionType: 'special', uses: { max: 4, recovery: 'long' } },
        { id: 'pw-7', name: 'Empuje telequinético', description: 'Mueves criaturas u objetos con la mente gastando dados psi.', level: 7, source: 'subclass', actionType: 'action' },
        { id: 'pw-10', name: 'Escudo psiónico mejorado', description: 'Más protección y reacción psiónica.', level: 10, source: 'subclass', actionType: 'reaction' },
        { id: 'pw-15', name: 'Maestría psi', description: 'Recuperas dados psi adicionales en combate.', level: 15, source: 'subclass', actionType: 'passive' },
      ],
    },
  ],
  monk: [
    {
      id: 'mercy',
      name: 'Guerrero de la Misericordia',
      description: 'Toques que curan o dañan.',
      features: [
        { id: 'me-3', name: 'Mano de la misericordia', description: 'Gasta focos para curar o infligir daño necrótico con un toque.', level: 3, source: 'subclass', actionType: 'bonus' },
        { id: 'me-6', name: 'Toque del médico', description: 'Puedes terminar enfermedades o envenenamientos con focos.', level: 6, source: 'subclass', actionType: 'action' },
        { id: 'me-11', name: 'Flor de la muerte y la vida', description: 'Al golpear con Ráfaga puedes aplicar manos de misericordia sin acción extra.', level: 11, source: 'subclass', actionType: 'passive' },
        { id: 'me-17', name: 'Mano perfecta', description: 'Maximiza curación o daño de la mano de la misericordia un número limitado de veces.', level: 17, source: 'subclass', actionType: 'passive', uses: { max: 1, recovery: 'long' } },
      ],
    },
    {
      id: 'elements',
      name: 'Guerrero de los Elementos',
      description: 'Puños y técnicas elementales.',
      features: [
        { id: 'el-3', name: 'Sintonía elemental', description: 'Imbuyes golpes con daño elemental a tu elección.', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Elemento preferido (fuego, frío, rayo…).', actionType: 'bonus' },
        { id: 'el-6', name: 'Paso elemental', description: 'Movimiento o alcance aumentados con focos.', level: 6, source: 'subclass', actionType: 'bonus' },
        { id: 'el-11', name: 'Explosión elemental', description: 'Ataques de área elemental gastando focos.', level: 11, source: 'subclass', actionType: 'action' },
        { id: 'el-17', name: 'Cuerpo de los elementos', description: 'Resistencia al daño elemental elegido y aura menor.', level: 17, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'open-hand',
      name: 'Guerrero de la Mano Abierta',
      description: 'Técnicas clásicas de control en combate.',
      features: [
        { id: 'oh-3', name: 'Técnica de mano abierta', description: 'Con Ráfaga de golpes puedes empujar, derribar o impedir reacciones.', level: 3, source: 'subclass', actionType: 'passive' },
        { id: 'oh-6', name: 'Integridad del cuerpo', description: 'Como acción, recuperas PG iguales al nivel de monje (usos limitados).', level: 6, source: 'subclass', actionType: 'action', uses: { max: 1, recovery: 'long' } },
        { id: 'oh-11', name: 'Tranquilidad', description: 'Al terminar un descanso largo ganas Sanctuary hasta que ataques.', level: 11, source: 'subclass', actionType: 'passive' },
        { id: 'oh-17', name: 'Quivering Palm', description: 'Golpe que puede reducir drásticamente los PG del objetivo (salvación de Constitución).', level: 17, source: 'subclass', actionType: 'action', uses: { max: 1, recovery: 'long' } },
      ],
    },
    {
      id: 'shadow',
      name: 'Guerrero de la Sombra',
      description: 'Sigilo, oscuridad y teletransporte sombrío.',
      features: [
        { id: 'sh-3', name: 'Artes de la sombra', description: 'Conjuros menores de oscuridad/silencio; movimiento entre penumbras.', level: 3, source: 'subclass', actionType: 'action' },
        { id: 'sh-6', name: 'Paso sombrío', description: 'Teletransporte entre sombras gastando focos.', level: 6, source: 'subclass', actionType: 'bonus' },
        { id: 'sh-11', name: 'Capa de sombras', description: 'Volverse invisible en oscuridad hasta atacar o lanzar conjuros.', level: 11, source: 'subclass', actionType: 'action' },
        { id: 'sh-17', name: 'Oportunista', description: 'Cuando una criatura a 5 ft es golpeada por otro, puedes atacarla con reacción.', level: 17, source: 'subclass', actionType: 'reaction' },
      ],
    },
  ],
  paladin: [
    {
      id: 'devotion',
      name: 'Juramento de Devoción',
      description: 'Justicia, honestidad y arma sagrada.',
      features: [
        { id: 'de-3', name: 'Canalizar divinidad: Arma sagrada', description: 'Imbuyes tu arma (+mod. Carisma al ataque) 1 minuto.', level: 3, source: 'subclass', actionType: 'action' },
        { id: 'de-3b', name: 'Canalizar divinidad: Destierro sagrado', description: 'Ahuyenta fiends/undead cercanos (salvación de Sabiduría).', level: 3, source: 'subclass', actionType: 'action' },
        { id: 'de-7', name: 'Aura de devoción', description: 'Tú y aliados en el aura no pueden ser hechizados.', level: 7, source: 'subclass', actionType: 'passive' },
        { id: 'de-15', name: 'Pureza de espíritu', description: 'Siempre bajo efecto de Protection from Evil and Good.', level: 15, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'glory',
      name: 'Juramento de Gloria',
      description: 'Hazañas heroicas y presencia atlética.',
      features: [
        { id: 'go-3', name: 'Presencia inspiradora', description: 'Canalizas divinidad para potenciar atletismo o velocidad de aliados.', level: 3, source: 'subclass', actionType: 'action' },
        { id: 'go-7', name: 'Aura de alacridad', description: 'Tú y aliados cercanos ganan +velocidad.', level: 7, source: 'subclass', actionType: 'passive' },
        { id: 'go-15', name: 'Gloria inmortal', description: 'Cuando te reducen a 0 PG puedes quedar a 1 PG (uso limitado).', level: 15, source: 'subclass', actionType: 'passive', uses: { max: 1, recovery: 'long' } },
      ],
    },
    {
      id: 'ancients',
      name: 'Juramento de los Ancestros',
      description: 'Luz primordial contra la oscuridad.',
      features: [
        { id: 'an-3', name: 'Canalizar divinidad: Ira de la naturaleza', description: 'Enredas enemigos con enredaderas espectrales.', level: 3, source: 'subclass', actionType: 'action' },
        { id: 'an-7', name: 'Aura de resguardo', description: 'Resistencia a daño de conjuros para ti y aliados en el aura.', level: 7, source: 'subclass', actionType: 'passive' },
        { id: 'an-15', name: 'Defensor undying', description: 'Reacción para reducir daño a un aliado en el aura.', level: 15, source: 'subclass', actionType: 'reaction' },
      ],
    },
    {
      id: 'vengeance',
      name: 'Juramento de Venganza',
      description: 'Cazar villanos sin descanso.',
      features: [
        { id: 've-3', name: 'Canalizar divinidad: Voto de enemistad', description: 'Ventaja en ataques contra una criatura marcada.', level: 3, source: 'subclass', actionType: 'bonus' },
        { id: 've-7', name: 'Furia del vengador', description: 'Reacción para moverte hacia una criatura que te dañó.', level: 7, source: 'subclass', actionType: 'reaction' },
        { id: 've-15', name: 'Alma de venganza', description: 'Reacción: ataque de oportunidad cuando la criatura marcada ataca a otro.', level: 15, source: 'subclass', actionType: 'reaction' },
      ],
    },
  ],
  ranger: [
    {
      id: 'beast-master',
      name: 'Maestro de Bestias',
      description: 'Compañero animal leal.',
      features: [
        { id: 'be-3', name: 'Compañero primigenio', description: 'Ganas un compañero bestia. Elige tipo (tierra, mar o cielo).', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Tipo de compañero.', actionType: 'passive' },
        { id: 'be-7', name: 'Entrenamiento excepcional', description: 'El compañero mejora en CA, PG o ataques.', level: 7, source: 'subclass', actionType: 'passive' },
        { id: 'be-11', name: 'Mejor compañero', description: 'Ataques adicionales o efectos del compañero.', level: 11, source: 'subclass', actionType: 'passive' },
        { id: 'be-15', name: 'Vínculo bestial', description: 'Cuando tú o el compañero sois golpeados, el otro puede reaccionar.', level: 15, source: 'subclass', actionType: 'reaction' },
      ],
    },
    {
      id: 'fey-wanderer',
      name: 'Errante Feérico',
      description: 'Encanto y magia del Reino Feérico.',
      features: [
        { id: 'fw-3', name: 'Regalos feéricos', description: 'Bonus a Carisma; opciones de daño psíquico o teletransporte corto.', level: 3, source: 'subclass', actionType: 'passive' },
        { id: 'fw-7', name: 'Retórica feérica', description: 'Ventaja en salvaciones contra ser hechizado o asustado.', level: 7, source: 'subclass', actionType: 'passive' },
        { id: 'fw-11', name: 'Refuerzo misty', description: 'Teletransporte y daño feérico al golpear.', level: 11, source: 'subclass', actionType: 'bonus' },
        { id: 'fw-15', name: 'Truco del mist', description: 'Cuando te golpean puedes teletransportarte (reacción, usos limitados).', level: 15, source: 'subclass', actionType: 'reaction', uses: { max: 1, recovery: 'long' } },
      ],
    },
    {
      id: 'gloom-stalker',
      name: 'Acechador de la Penumbra',
      description: 'Emboscadas en la oscuridad.',
      features: [
        { id: 'gs-3', name: 'Emboscada umbría', description: 'En el primer turno ganas velocidad y un ataque extra.', level: 3, source: 'subclass', actionType: 'passive' },
        { id: 'gs-7', name: 'Vista de hierro', description: 'Visión en la oscuridad mejorada; no puedes ser sorprendido fácilmente.', level: 7, source: 'subclass', actionType: 'passive' },
        { id: 'gs-11', name: 'Golpe acechador', description: 'Daño extra en el primer turno contra criaturas que no te han visto actuar.', level: 11, source: 'subclass', actionType: 'passive' },
        { id: 'gs-15', name: 'Sombra viva', description: 'Cuando estás en penumbra puedes volverte invisible hasta atacar.', level: 15, source: 'subclass', actionType: 'bonus' },
      ],
    },
    {
      id: 'hunter',
      name: 'Cazador',
      description: 'Tácticas contra amenazas peligrosas.',
      features: [
        { id: 'hu-3', name: 'Presa del cazador', description: 'Elige opción (coloso, horda, etc.).', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Opción de Presa del cazador.', actionType: 'passive' },
        { id: 'hu-7', name: 'Defensa excepcional', description: 'Elige defensa contra multiataque, hechizos o reducción de daño.', level: 7, source: 'subclass', requiresChoice: true, choiceHint: 'Opción de defensa.', actionType: 'passive' },
        { id: 'hu-11', name: 'Multiataque', description: 'Volley o Whirlwind según tu estilo de caza.', level: 11, source: 'subclass', requiresChoice: true, choiceHint: 'Volley o Whirlwind.', actionType: 'action' },
        { id: 'hu-15', name: 'Contraataque superior', description: 'Cuando una criatura te falla un ataque, puedes atacarla con reacción.', level: 15, source: 'subclass', actionType: 'reaction' },
      ],
    },
  ],
  rogue: [
    {
      id: 'arcane-trickster',
      name: 'Bribón Arcano',
      description: 'Magia de mago e ilusiones sutiles.',
      features: [
        { id: 'at-3', name: 'Lanzamiento de conjuros', description: 'Trucos y conjuros de mago. Elige los iniciales.', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Trucos y conjuros elegidos.', actionType: 'passive' },
        { id: 'at-3b', name: 'Mano de mago mejorada', description: 'Mage Hand invisible y puede hacer juegos de manos a distancia.', level: 3, source: 'subclass', actionType: 'bonus' },
        { id: 'at-9', name: 'Ambush mágico', description: 'Ventaja en ataques de conjuro si el objetivo no te ha visto actuar.', level: 9, source: 'subclass', actionType: 'passive' },
        { id: 'at-13', name: 'Versátil trampista', description: 'Puedes desviar conjuros o mejorar control con reacción.', level: 13, source: 'subclass', actionType: 'reaction' },
      ],
    },
    {
      id: 'assassin',
      name: 'Asesino',
      description: 'Identidades falsas y golpes letales.',
      features: [
        { id: 'as-3', name: 'Asesinar', description: 'Ventaja contra quienes no han actuado; críticos en sorpresa.', level: 3, source: 'subclass', actionType: 'passive' },
        { id: 'as-9', name: 'Infiltración experta', description: 'Creas identidades falsas creíbles con tiempo de preparación.', level: 9, source: 'subclass', actionType: 'passive' },
        { id: 'as-13', name: 'Impostor', description: 'Puedes imitar el habla y escritura de otra persona tras estudiarla.', level: 13, source: 'subclass', actionType: 'passive' },
        { id: 'as-17', name: 'Golpe de muerte', description: 'Tras un turno estudiando, el primer ataque puede forzar salvación o daño masivo.', level: 17, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'soulknife',
      name: 'Cuchilla del Alma',
      description: 'Hojas psíquicas y dados psiónicos.',
      features: [
        { id: 'sk-3', name: 'Hojas psíquicas', description: 'Armas de energía psíquica; dados psiónicos para potenciar tiradas.', level: 3, source: 'subclass', actionType: 'special', uses: { max: 4, recovery: 'long' } },
        { id: 'sk-9', name: 'Manos del alma', description: 'Telequinesis menor o desarmar con la mente.', level: 9, source: 'subclass', actionType: 'bonus' },
        { id: 'sk-13', name: 'Vínculo psíquico', description: 'Comunicación telepática y ataques a distancia psíquicos mejorados.', level: 13, source: 'subclass', actionType: 'passive' },
        { id: 'sk-17', name: 'Rendición del alma', description: 'Ataque que puede aturdir (salvación de Inteligencia).', level: 17, source: 'subclass', actionType: 'action', uses: { max: 1, recovery: 'long' } },
      ],
    },
    {
      id: 'thief',
      name: 'Ladrón',
      description: 'Manos rápidas y uso de objetos.',
      features: [
        { id: 'th-3', name: 'Manos rápidas', description: 'Acción astuta para Usar un objeto.', level: 3, source: 'subclass', actionType: 'bonus' },
        { id: 'th-3b', name: ' trepar segundo piso', description: 'Escalas más rápido; saltos con ventaja de velocidad.', level: 3, source: 'subclass', actionType: 'passive' },
        { id: 'th-9', name: 'Reflejos supremos', description: 'Puedes tomar dos reacciones por ronda (limitado).', level: 9, source: 'subclass', actionType: 'reaction' },
        { id: 'th-13', name: 'Uso de objetos mágicos', description: 'Ignoras restricciones de raza/clase/nivel en muchos objetos mágicos.', level: 13, source: 'subclass', actionType: 'passive' },
        { id: 'th-17', name: 'Reflejos de ladrón', description: 'Dos turnos en la primera ronda de combate (el segundo con iniciativa -10).', level: 17, source: 'subclass', actionType: 'passive' },
      ],
    },
  ],
  sorcerer: [
    {
      id: 'aberrant',
      name: 'Hechicería Aberrante',
      description: 'Poderes telepáticos del Vacío.',
      features: [
        { id: 'ab-3', name: 'Telepatía psiónica', description: 'Comunicación telepática y conjuros psiónicos bonus.', level: 3, source: 'subclass', actionType: 'passive' },
        { id: 'ab-6', name: 'Conjuros psiónicos', description: 'Puedes lanzar ciertos conjuros sin componentes verbales/somáticos gastando SP.', level: 6, source: 'subclass', actionType: 'passive' },
        { id: 'ab-14', name: 'Revelación oculta', description: 'Resistencia psíquica; teletransportes cortos con SP.', level: 14, source: 'subclass', actionType: 'bonus' },
        { id: 'ab-18', name: 'De la guerra de las mentes', description: 'Aura psíquica o ataque mental masivo (uso limitado).', level: 18, source: 'subclass', actionType: 'action', uses: { max: 1, recovery: 'long' } },
      ],
    },
    {
      id: 'clockwork',
      name: 'Hechicería de Mecanismos',
      description: 'Orden del plano de Mechanus.',
      features: [
        { id: 'cl-3', name: 'Restaurar equilibrio', description: 'Reacción: anulas ventaja o desventaja en una tirada cercana.', level: 3, source: 'subclass', actionType: 'reaction', uses: { max: 1, recovery: 'long' } },
        { id: 'cl-6', name: 'Bastión de ley', description: 'Escudo de fuerza que reduce daño gastando SP.', level: 6, source: 'subclass', actionType: 'reaction' },
        { id: 'cl-14', name: 'Trance de orden', description: 'Impones estabilidad: inmunidad temporal a ciertos estados.', level: 14, source: 'subclass', actionType: 'action', uses: { max: 1, recovery: 'long' } },
        { id: 'cl-18', name: 'Reloj del destino', description: 'Reescribes el resultado de una tirada cercana (uso muy limitado).', level: 18, source: 'subclass', actionType: 'special', uses: { max: 1, recovery: 'long' } },
      ],
    },
    {
      id: 'draconic',
      name: 'Hechicería Dracónica',
      description: 'Sangre de dragón: resiliencia y afinidad.',
      features: [
        { id: 'dr-3', name: 'Linaje dracónico', description: 'Elige tipo de dragón; CA 13+Des sin armadura; +1 PG por nivel de hechicero; afinidad de daño.', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Color/tipo de dragón ancestral.', actionType: 'passive' },
        { id: 'dr-6', name: 'Afinidad elemental', description: 'Añades mod. de Carisma al daño de conjuros de tu tipo elemental; resistencia a ese daño.', level: 6, source: 'subclass', actionType: 'passive' },
        { id: 'dr-14', name: 'Alas de dragón', description: 'Manifestas alas y ganas vuelo (concentración o duración limitada).', level: 14, source: 'subclass', actionType: 'bonus', uses: { max: 1, recovery: 'long' } },
        { id: 'dr-18', name: 'Presencia dracónica', description: 'Aura que asusta o encanta (salvación de Sabiduría).', level: 18, source: 'subclass', actionType: 'action', uses: { max: 1, recovery: 'long' } },
      ],
    },
    {
      id: 'wild-magic',
      name: 'Magia Salvaje',
      description: 'Oleadas impredecibles de magia.',
      features: [
        { id: 'wm-3', name: 'Oleada de magia salvaje', description: 'Cuando lanzas un conjuro de hechicero de nivel 1 o superior, el DM puede pedirte que tires d20; con 1 (o según mesa) tiras en la tabla de oleada.', level: 3, source: 'subclass', actionType: 'passive' },
        { id: 'wm-3b', name: 'Mareas del caos', description: 'Puedes obtener ventaja en una tirada de ataque, prueba o salvación. Tras usarlo, el DM puede forzar una oleada la próxima vez que lances un conjuro de hechicero. Se recupera en descanso largo.', level: 3, source: 'subclass', actionType: 'special', uses: { max: 1, recovery: 'long' } },
        { id: 'wm-6', name: 'Doblegar suerte (Bend Luck)', description: 'Cuando una criatura que puedes ver a 60 ft hace una tirada de ataque, prueba o salvación, puedes usar tu reacción y 2 SP para tirar 1d4 y sumarlo o restarlo al resultado (después de ver la tirada).', level: 6, source: 'subclass', actionType: 'reaction' },
        { id: 'wm-6b', name: 'Bendición del caos', description: 'Cuando ocurre una oleada de magia salvaje, recuperas 1d4 puntos de hechicería (sin superar tu máximo).', level: 6, source: 'subclass', actionType: 'passive' },
        { id: 'wm-14', name: 'Manipular el caos', description: 'Cuando tiras en la tabla de oleada, puedes tirar dos veces y elegir el resultado que prefieras.', level: 14, source: 'subclass', actionType: 'passive' },
        { id: 'wm-18', name: 'Sobrecarga de caos', description: 'Puedes gastar 5 SP para forzar una oleada tras lanzar un conjuro, o maximizar efectos según tu mesa.', level: 18, source: 'subclass', actionType: 'special' },
      ],
    },
  ],
  warlock: [
    {
      id: 'archfey',
      name: 'Patrón: El Archifeérico',
      description: 'Señor feérico del engaño y el encanto.',
      features: [
        { id: 'af-3', name: 'Presencia feérica', description: 'Puedes encantar o asustar en área corta.', level: 3, source: 'subclass', actionType: 'action', uses: { max: 1, recovery: 'short' } },
        { id: 'af-6', name: 'Escape misty', description: 'Cuando te golpean, puedes teletransportarte (reacción).', level: 6, source: 'subclass', actionType: 'reaction', uses: { max: 1, recovery: 'short' } },
        { id: 'af-10', name: 'Defensas beguiling', description: 'Resistencia a daño psíquico; reflejas ser hechizado.', level: 10, source: 'subclass', actionType: 'passive' },
        { id: 'af-14', name: 'Delirio del señor oscuro', description: 'Puedes hechizar hasta quedar incapacitado el objetivo (uso limitado).', level: 14, source: 'subclass', actionType: 'action', uses: { max: 1, recovery: 'long' } },
      ],
    },
    {
      id: 'celestial',
      name: 'Patrón: El Celestial',
      description: 'Ser de los planos superiores y curación.',
      features: [
        { id: 'ce-3', name: 'Luz sanadora', description: 'Dados de curación que repartes a criaturas cercanas.', level: 3, source: 'subclass', actionType: 'bonus' },
        { id: 'ce-6', name: 'Alma radiante', description: 'Resistencia a radiante; bonus a curaciones.', level: 6, source: 'subclass', actionType: 'passive' },
        { id: 'ce-10', name: 'Resplandor celestial', description: 'Cuando usas Luz sanadora o ciertos conjuros, añades efectos radiantes.', level: 10, source: 'subclass', actionType: 'passive' },
        { id: 'ce-14', name: 'Segen de los cielos', description: 'Al caer a 0 PG puedes recuperar PG y emitir luz que daña enemigos (1/largo).', level: 14, source: 'subclass', actionType: 'passive', uses: { max: 1, recovery: 'long' } },
      ],
    },
    {
      id: 'fiend',
      name: 'Patrón: El Infernal',
      description: 'Pacto con un señor de los Infiernos.',
      features: [
        { id: 'fi-3', name: 'Bendición del oscuro', description: 'Al reducir a un hostil a 0 PG ganas PG temporales.', level: 3, source: 'subclass', actionType: 'passive' },
        { id: 'fi-6', name: 'Suerte oscura', description: 'Puedes añadir 1d10 a una prueba de característica o salvación (usos limitados).', level: 6, source: 'subclass', actionType: 'special', uses: { max: 1, recovery: 'long' } },
        { id: 'fi-10', name: 'Resiliencia fiendish', description: 'Elige un tipo de daño para resistir tras cada descanso corto.', level: 10, source: 'subclass', requiresChoice: true, choiceHint: 'Tipo de resistencia actual.', actionType: 'passive' },
        { id: 'fi-14', name: 'Golpe de Hades', description: 'Cuando golpeas con un ataque, puedes infligir daño de fuego extra (1/turno, usos).', level: 14, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'great-old-one',
      name: 'Patrón: El Gran Antiguo',
      description: 'Entidad incomprensible y telepatía.',
      features: [
        { id: 'goo-3', name: 'Mente desperdigada', description: 'Telepatía; ventaja vs ser hechizado.', level: 3, source: 'subclass', actionType: 'passive' },
        { id: 'goo-6', name: 'Entropic ward', description: 'Reacción: impones desventaja a un ataque; si falla, ganas ventaja en tu próximo ataque.', level: 6, source: 'subclass', actionType: 'reaction', uses: { max: 1, recovery: 'short' } },
        { id: 'goo-10', name: 'Escudo mental', description: 'Resistencia psíquica; reflejas daño psíquico al atacante.', level: 10, source: 'subclass', actionType: 'passive' },
        { id: 'goo-14', name: 'Trono creativo', description: 'Puedes controlar brevemente a una criatura hechizada de forma más potente.', level: 14, source: 'subclass', actionType: 'action', uses: { max: 1, recovery: 'long' } },
      ],
    },
  ],
  wizard: [
    {
      id: 'abjurer',
      name: 'Abjurador',
      description: 'Escudos mágicos y protección.',
      features: [
        { id: 'abj-3', name: 'Resguardo arcano', description: 'Escudo mágico de PG que se recarga al lanzar abjuraciones.', level: 3, source: 'subclass', actionType: 'passive' },
        { id: 'abj-6', name: 'Proyectar resguardo', description: 'Puedes transferir el resguardo a un aliado como acción.', level: 6, source: 'subclass', actionType: 'action' },
        { id: 'abj-10', name: 'Abjuro mejorado', description: 'Dispel Magic y Counterspell mejorados (bonus al check).', level: 10, source: 'subclass', actionType: 'passive' },
        { id: 'abj-14', name: 'Resistencia a conjuros', description: 'Ventaja en salvaciones contra conjuros; resistencia al daño de conjuros.', level: 14, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'diviner',
      name: 'Adivino',
      description: 'Portentos y visión del futuro.',
      features: [
        { id: 'div-3', name: 'Portento', description: 'Tiras 2d20 tras un descanso largo; puedes sustituir tiradas con esos resultados.', level: 3, source: 'subclass', actionType: 'special', uses: { max: 2, recovery: 'long' } },
        { id: 'div-6', name: 'Vidente experto', description: 'Lanzar adivinación es más barato (espacio de menor nivel 1/largo).', level: 6, source: 'subclass', actionType: 'passive', uses: { max: 1, recovery: 'long' } },
        { id: 'div-10', name: 'Tercer ojo', description: 'Acción: visión especial (invisibilidad, oscuridad, etc.) durante 1 minuto.', level: 10, source: 'subclass', actionType: 'action', uses: { max: 1, recovery: 'long' } },
        { id: 'div-14', name: 'Mayor portento', description: 'Tiras 3d20 en lugar de 2 para Portento.', level: 14, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'evoker',
      name: 'Evocador',
      description: 'Explosiones y control del daño de área.',
      features: [
        { id: 'evo-3', name: 'Esculpir conjuros', description: 'Proteges aliados de tus evocaciones de área.', level: 3, source: 'subclass', actionType: 'passive' },
        { id: 'evo-6', name: 'Evocación potenciado', description: 'Añades mod. de Inteligencia al daño de un conjuro de evocación.', level: 6, source: 'subclass', actionType: 'passive' },
        { id: 'evo-10', name: 'Sobrecanalizar', description: 'Máximas tiradas de daño de un conjuro de evocación de nivel bajo (uso limitado).', level: 10, source: 'subclass', actionType: 'special', uses: { max: 1, recovery: 'long' } },
        { id: 'evo-14', name: 'Evocación maximizada', description: 'Sobrecanalizar funciona con niveles más altos.', level: 14, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'illusionist',
      name: 'Ilusionista',
      description: 'Ilusiones mejoradas y engaño sensorial.',
      features: [
        { id: 'ill-3', name: 'Ilusión mejorada', description: 'Mejoras Minor Illusion; puedes alterar ilusiones con acción adicional.', level: 3, source: 'subclass', actionType: 'bonus' },
        { id: 'ill-6', name: 'Ilusiones maleables', description: 'Cambias la naturaleza de una ilusión que hayas lanzado.', level: 6, source: 'subclass', actionType: 'action' },
        { id: 'ill-10', name: 'Sombra ilusoria', description: 'Creas objetos semi-reales con daño limitado a partir de ilusiones.', level: 10, source: 'subclass', actionType: 'action' },
        { id: 'ill-14', name: 'Realidad ilusoria', description: 'Haces real una parte de una ilusión durante 1 minuto (objeto, no daño).', level: 14, source: 'subclass', actionType: 'bonus', uses: { max: 1, recovery: 'long' } },
      ],
    },
  ],
};

/** Flatten for characterBuilder SUBCLASSES shape */
export function getSubclassesForClass(classId: string): SubclassDef[] {
  return SUBCLASSES_2024[classId] || [];
}
