import type {
  AbilityScore,
  AbilityScores,
  Character,
  CharacterFeature,
  ClassData,
  InventoryItem,
  RaceData,
  FeatureEntry,
} from '../types/dnd';
import { getModifier, getProficiencyBonus, createEmptyCharacter } from './character';
import startingEquipment from '../data/starting-equipment.json';
import backgroundsData from '../data/backgrounds.json';
import type { BackgroundData } from '../types/dnd';

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

/** Point-buy: total 27 points. Costs from PHB. */
export const POINT_BUY_COST: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};

export function pointBuyTotal(scores: AbilityScores): number {
  return (Object.values(scores) as number[]).reduce(
    (sum, v) => sum + (POINT_BUY_COST[v] ?? 99),
    0
  );
}

export function isValidPointBuy(scores: AbilityScores): boolean {
  const vals = Object.values(scores) as number[];
  if (vals.some((v) => v < 8 || v > 15)) return false;
  return pointBuyTotal(scores) <= 27;
}

/** Parse simple ASI strings like "+2 Destreza" or "+1 a todas" */
export function applyRaceASI(
  base: AbilityScores,
  asiText: string
): AbilityScores {
  const scores = { ...base };
  const lower = asiText.toLowerCase();

  if (lower.includes('todas')) {
    (Object.keys(scores) as AbilityScore[]).forEach((k) => {
      scores[k] = Math.min(20, scores[k] + 1);
    });
    return scores;
  }

  const map: { pattern: RegExp; key: AbilityScore }[] = [
    { pattern: /fuerza|str/i, key: 'str' },
    { pattern: /destreza|dex/i, key: 'dex' },
    { pattern: /constituci[oó]n|con/i, key: 'con' },
    { pattern: /inteligencia|int/i, key: 'int' },
    { pattern: /sabidur[ií]a|wis/i, key: 'wis' },
    { pattern: /carisma|cha/i, key: 'cha' },
  ];

  // Match +N Trait
  const re = /\+(\d+)\s*([^,+]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(asiText)) !== null) {
    const amount = parseInt(m[1], 10);
    const label = m[2].trim();
    for (const { pattern, key } of map) {
      if (pattern.test(label)) {
        scores[key] = Math.min(20, scores[key] + amount);
        break;
      }
    }
  }
  return scores;
}

export function hitDieNumber(hitDie: string): number {
  const m = hitDie.match(/d(\d+)/i);
  return m ? parseInt(m[1], 10) : 8;
}

export function featuresUpToLevel(
  features: FeatureEntry[],
  level: number
): FeatureEntry[] {
  return features.filter((f) => f.level <= level);
}

export function toCharacterFeatures(
  entries: FeatureEntry[],
  source: string
): CharacterFeature[] {
  return entries.map((e) => ({
    id: e.id,
    name: e.name,
    description: e.description,
    source: e.source || source,
  }));
}

export function buildStartingInventory(classId: string): InventoryItem[] {
  const pack = (startingEquipment as Record<string, { fixed: Omit<InventoryItem, 'id'>[] }>)[
    classId
  ];
  if (!pack) return [];
  return pack.fixed.map((item) => ({
    ...item,
    id: crypto.randomUUID(),
    quantity: item.quantity || 1,
  }));
}

export function defaultAC(dex: number, classId?: string): number {
  // Rough defaults when no armor calculated
  if (classId === 'monk' || classId === 'barbarian') {
    return 10 + getModifier(dex); // simplified; real needs wis/con
  }
  return 10 + getModifier(dex);
}

export function buildCharacterFromWizard(opts: {
  name: string;
  race: RaceData;
  classData: ClassData;
  subclassName?: string;
  subclassId?: string;
  background: string;
  baseScores: AbilityScores; // before race ASI
  level?: number;
}): Character {
  const level = opts.level ?? 1;
  const scores = applyRaceASI(opts.baseScores, opts.race.abilityScoreIncrease);
  const conMod = getModifier(scores.con);
  const die = hitDieNumber(opts.classData.hitDie);
  // Level 1 HP = max hit die + con
  let hp = die + conMod;
  for (let l = 2; l <= level; l++) {
    hp += Math.max(1, Math.floor(die / 2) + 1 + conMod); // average rounded up
  }

  const raceTraits = toCharacterFeatures(
    featuresUpToLevel(opts.race.traits, level),
    'race'
  );
  const classFeats = toCharacterFeatures(
    featuresUpToLevel(opts.classData.features, level),
    'class'
  );

  // Saving throws from class names
  const saveMap: Record<string, AbilityScore> = {
    fuerza: 'str',
    destreza: 'dex',
    constitución: 'con',
    constitucion: 'con',
    inteligencia: 'int',
    sabiduría: 'wis',
    sabiduria: 'wis',
    carisma: 'cha',
    str: 'str',
    dex: 'dex',
    con: 'con',
    int: 'int',
    wis: 'wis',
    cha: 'cha',
  };
  const savingThrows = opts.classData.savingThrows
    .map((s) => saveMap[s.toLowerCase()])
    .filter(Boolean) as AbilityScore[];

  const inventory = buildStartingInventory(opts.classData.id);

  // Background feature
  const bg = (backgroundsData as BackgroundData[]).find(
    (b) => b.name.toLowerCase() === opts.background.toLowerCase() || b.id === opts.background.toLowerCase()
  );
  if (bg?.feature) {
    classFeats.push({
      id: `bg-${bg.id}`,
      name: bg.feature.name,
      description: bg.feature.description,
      source: 'background',
    });
  }
  // Background equipment as inventory notes
  if (bg?.equipment) {
    for (const eq of bg.equipment) {
      inventory.push({
        id: crypto.randomUUID(),
        name: eq,
        quantity: 1,
        description: 'Equipo de trasfondo',
      });
    }
  }

  const empty = createEmptyCharacter(opts.name);
  const char: Character = {
    ...empty,
    name: opts.name,
    race: opts.race.name,
    raceId: opts.race.id,
    class: opts.classData.name,
    classId: opts.classData.id,
    subclass: opts.subclassName,
    subclassId: opts.subclassId,
    background: opts.background,
    backgroundId: bg?.id,
    level,
    proficiencyBonus: getProficiencyBonus(level),
    abilityScores: scores,
    savingThrows,
    speed: opts.race.speed,
    hitPointMax: Math.max(1, hp),
    hitPointCurrent: Math.max(1, hp),
    hitDice: `${level}${opts.classData.hitDie}`,
    armorClass: defaultAC(scores.dex, opts.classData.id),
    features: [...raceTraits, ...classFeats],
    inventory,
    spellcastingAbility: opts.classData.spellcasting?.ability,
    cantripsKnown: opts.classData.spellcasting?.starterSpellIds || [],
    spells: (opts.classData.spellcasting?.starterSpellIds || []).map((spellId) => ({
      spellId,
      prepared: true,
    })),
    spellSlots: (() => {
      const sc = opts.classData.spellcasting;
      if (!sc) return {};
      // Level 1 full caster: 2 first-level slots; half: 0; pact: 1
      if (sc.type === 'full') return { 1: { max: 2, used: 0 } };
      if (sc.type === 'pact') return { 1: { max: 1, used: 0 } };
      return {};
    })(),
  };
  return char;
}

/** Levels that grant ASI in 5e */
export const ASI_LEVELS = [4, 8, 12, 16, 19];

export function isAsiLevel(level: number): boolean {
  return ASI_LEVELS.includes(level);
}

export function applyLevelUp(
  character: Character,
  classData: ClassData | undefined,
  opts: {
    hpGain: number;
    /** Ability score increases: e.g. { str: 1, dex: 1 } or { str: 2 } */
    asi?: Partial<AbilityScores>;
    newFeatures?: CharacterFeature[];
  }
): Character {
  const newLevel = Math.min(20, character.level + 1);
  const scores = { ...character.abilityScores };
  if (opts.asi) {
    (Object.keys(opts.asi) as AbilityScore[]).forEach((k) => {
      scores[k] = Math.min(20, scores[k] + (opts.asi![k] || 0));
    });
  }

  const features = [...character.features];
  if (opts.newFeatures) {
    for (const f of opts.newFeatures) {
      if (!features.some((x) => x.id === f.id)) features.push(f);
    }
  }

  // Pull class features for the new level if class data present
  if (classData) {
    const atLevel = classData.features.filter((f) => f.level === newLevel);
    for (const f of atLevel) {
      if (!features.some((x) => x.id === f.id)) {
        features.push({
          id: f.id,
          name: f.name,
          description: f.description,
          source: f.source || 'class',
        });
      }
    }
  }

  const hitDie = classData?.hitDie || character.hitDice.replace(/^\d+/, '') || 'd8';
  const dieNum = hitDieNumber(hitDie.startsWith('d') ? hitDie : `d${hitDie}`);

  return {
    ...character,
    level: newLevel,
    proficiencyBonus: getProficiencyBonus(newLevel),
    abilityScores: scores,
    hitPointMax: character.hitPointMax + opts.hpGain,
    hitPointCurrent: character.hitPointCurrent + opts.hpGain,
    hitDice: `${newLevel}d${dieNum}`,
    features,
    updatedAt: new Date().toISOString(),
  };
}

/** Simple subclasses by class id for SRD-ish choices */
export const SUBCLASSES: Record<string, { id: string; name: string; description: string; features: FeatureEntry[] }[]> = {
  fighter: [
    {
      id: "champion",
      name: "Campeón",
      description: "Mejora los aspectos marciales básicos: críticos mejorados y atleta superior.",
      features: [
        { id: "champ-crit", name: "Crítico mejorado", description: "Tus ataques con armas puntúan crítico en 19-20.", level: 3, source: "subclass" },
      ],
    },
  ],
  barbarian: [
    {
      id: "berserker",
      name: "Camino del Berserker",
      description: "Furia que culmina en frenesí violento.",
      features: [
        { id: "berserk-frenzy", name: "Frenesí", description: "Mientras estás en furia, puedes hacer un ataque cuerpo a cuerpo como acción adicional. Sufres un nivel de agotamiento al terminar la furia.", level: 3, source: "subclass" },
      ],
    },
  ],
  rogue: [
    {
      id: "thief",
      name: "Ladrón",
      description: "Especialista en infiltración y uso de objetos.",
      features: [
        { id: "thief-hands", name: "Manos rápidas", description: "Puedes usar Acción astuta para realizar la acción Usar un objeto.", level: 3, source: "subclass" },
      ],
    },
  ],
  wizard: [
    {
      id: "evocation",
      name: "Escuela de Evocación",
      description: "Especialista en magia que crea efectos energéticos potentes.",
      features: [
        { id: "evo-sculpt", name: "Esculpir conjuros", description: "Puedes proteger a criaturas de tus evocaciones de área.", level: 2, source: "subclass" },
      ],
    },
  ],
  cleric: [
    {
      id: "life",
      name: "Dominio de la Vida",
      description: "Enfocado en la curación y la preservación de la vida.",
      features: [
        { id: "life-disciple", name: "Discípulo de la vida", description: "Tus curaciones restauran PG adicionales igual a 2 + el nivel del conjuro.", level: 1, source: "subclass" },
      ],
    },
  ],
  warlock: [
    {
      id: "fiend",
      name: "El Infernal",
      description: "Pacto con un señor de los Nueve Infiernos.",
      features: [
        { id: "fiend-blessing", name: "Bendición del oscuro", description: "Cuando reduces a una criatura hostil a 0 PG, ganas PG temporales iguales a tu mod. de Carisma + nivel de brujo (mín. 1).", level: 1, source: "subclass" },
      ],
    },
  ],
  sorcerer: [
    {
      id: "draconic",
      name: "Linaje Dracónico",
      description: "Magia que fluye de la sangre de dragones.",
      features: [
        { id: "draconic-resilience", name: "Resiliencia dracónica", description: "PG máximos +1 por nivel de hechicero. CA = 13 + Des sin armadura.", level: 1, source: "subclass" },
      ],
    },
  ],
  bard: [
    {
      id: "lore",
      name: "Colegio del Saber",
      description: "Eruditos y maestros del conocimiento.",
      features: [
        { id: "lore-skills", name: "Competencias adicionales", description: "Ganas competencia en 3 habilidades a tu elección.", level: 3, source: "subclass" },
      ],
    },
  ],
  paladin: [
    {
      id: "devotion",
      name: "Juramento de Devoción",
      description: "La justicia, el honor y la protección de los débiles.",
      features: [
        { id: "devotion-channel", name: "Canalizar divinidad: Arma sagrada", description: "Imbuyes tu arma con energía positiva durante 1 minuto (+mod. Carisma al ataque).", level: 3, source: "subclass" },
      ],
    },
  ],
  ranger: [
    {
      id: "hunter",
      name: "Cazador",
      description: "Especialista en abatir amenazas peligrosas.",
      features: [
        { id: "hunter-prey", name: "Presa del cazador", description: "Elige una opción de combate contra tu presa (Coloso, Horda, etc.).", level: 3, source: "subclass" },
      ],
    },
  ],
  monk: [
    {
      id: "open-hand",
      name: "Camino de la Mano Abierta",
      description: "Maestría en artes marciales tradicionales.",
      features: [
        { id: "open-technique", name: "Técnica de mano abierta", description: "Cuando golpeas con Ráfaga de golpes, puedes empujar, derribar o impedir reacciones.", level: 3, source: "subclass" },
      ],
    },
  ],
  druid: [
    {
      id: "land",
      name: "Círculo de la Tierra",
      description: "Guardianes de la magia antigua de terrenos sagrados.",
      features: [
        { id: "land-recovery", name: "Recuperación natural", description: "Durante un descanso corto, recuperas espacios de conjuro (como Recuperación arcana).", level: 2, source: "subclass" },
      ],
    },
  ],
};
