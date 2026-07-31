import type {
  AbilityScore,
  AbilityScores,
  Character,
  CharacterFeature,
  ClassData,
  InventoryItem,
  RaceData,
  FeatureEntry,
  SkillId,
} from '../types/dnd';
import { SKILLS } from '../types/dnd';
import { getModifier, getProficiencyBonus, createEmptyCharacter } from './character';
import { getFullCasterSlots, getPactSlots, getCasterKindFromClassId } from './spellLimits';
import startingEquipment from '../data/starting-equipment.json';
import backgroundsData from '../data/backgrounds.json';
import type { BackgroundData } from '../types/dnd';


/** Map Spanish skill names from backgrounds/traits to SkillId */
export function mapSkillName(name: string): SkillId | null {
  const n = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  const aliases: Record<string, SkillId> = {
    acrobacias: 'acrobatics',
    'trato con animales': 'animalHandling',
    arcana: 'arcana',
    arcanos: 'arcana',
    atletismo: 'athletics',
    engano: 'deception',
    historia: 'history',
    perspicacia: 'insight',
    intimidacion: 'intimidation',
    investigacion: 'investigation',
    medicina: 'medicine',
    naturaleza: 'nature',
    percepcion: 'perception',
    interpretacion: 'performance',
    persuasion: 'persuasion',
    religion: 'religion',
    'juego de manos': 'sleightOfHand',
    sigilo: 'stealth',
    supervivencia: 'survival',
  };
  if (aliases[n]) return aliases[n];
  const byName = SKILLS.find(
    (s) =>
      s.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') === n || s.id === n
  );
  return byName ? (byName.id as SkillId) : null;
}


export function countExtraLanguageChoices(race: RaceData, bgLanguages?: { count: number }): number {
  let n = bgLanguages?.count || 0;
  for (const lang of race.languages || []) {
    if (/adicional|elección|eleccion|a tu elecci/i.test(lang)) n += 1;
  }
  for (const trait of race.traits || []) {
    if (/idioma adicional|lengua adicional|un idioma a tu/i.test(trait.name + trait.description)) {
      // avoid double-count if already in languages array
      if (!(race.languages || []).some((l) => /adicional|elección|eleccion/i.test(l))) n += 1;
    }
  }
  return n;
}

export const COMMON_LANGUAGES = [
  'Común', 'Élfico', 'Énano', 'Mediano', 'Gnomo', 'Orco', 'Dracónico',
  'Infernal', 'Abisal', 'Celestial', 'Primordial', 'Silvano', 'Goblin',
  'Gigante', 'Infracomún', 'Subcomún',
];


/** PHB skill lists by class id — player picks N from these */
export const CLASS_SKILL_OPTIONS: Record<string, { count: number; skills: string[] }> = {
  barbarian: { count: 2, skills: ['Trato con Animales', 'Atletismo', 'Intimidación', 'Naturaleza', 'Percepción', 'Supervivencia'] },
  bard: { count: 3, skills: ['Acrobacias', 'Arcanos', 'Atletismo', 'Engaño', 'Historia', 'Perspicacia', 'Intimidación', 'Investigación', 'Medicina', 'Naturaleza', 'Percepción', 'Interpretación', 'Persuasión', 'Religión', 'Juego de Manos', 'Sigilo', 'Supervivencia', 'Trato con Animales'] },
  cleric: { count: 2, skills: ['Historia', 'Perspicacia', 'Medicina', 'Persuasión', 'Religión'] },
  druid: { count: 2, skills: ['Arcanos', 'Trato con Animales', 'Perspicacia', 'Medicina', 'Naturaleza', 'Percepción', 'Religión', 'Supervivencia'] },
  fighter: { count: 2, skills: ['Acrobacias', 'Trato con Animales', 'Atletismo', 'Historia', 'Perspicacia', 'Intimidación', 'Percepción', 'Supervivencia'] },
  monk: { count: 2, skills: ['Acrobacias', 'Atletismo', 'Historia', 'Perspicacia', 'Religión', 'Sigilo'] },
  paladin: { count: 2, skills: ['Atletismo', 'Perspicacia', 'Intimidación', 'Medicina', 'Persuasión', 'Religión'] },
  ranger: { count: 3, skills: ['Trato con Animales', 'Atletismo', 'Perspicacia', 'Investigación', 'Naturaleza', 'Percepción', 'Sigilo', 'Supervivencia'] },
  rogue: { count: 4, skills: ['Acrobacias', 'Atletismo', 'Engaño', 'Perspicacia', 'Intimidación', 'Investigación', 'Percepción', 'Interpretación', 'Persuasión', 'Juego de Manos', 'Sigilo'] },
  sorcerer: { count: 2, skills: ['Arcanos', 'Engaño', 'Perspicacia', 'Intimidación', 'Persuasión', 'Religión'] },
  warlock: { count: 2, skills: ['Arcanos', 'Engaño', 'Historia', 'Intimidación', 'Investigación', 'Naturaleza', 'Religión'] },
  wizard: { count: 2, skills: ['Arcanos', 'Historia', 'Perspicacia', 'Investigación', 'Medicina', 'Religión'] },
};

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

export function computeFeatureMaxUses(
  uses: NonNullable<FeatureEntry['uses']>,
  featureLevel: number,
  characterLevel: number
): number {
  let max = uses.max;
  if (uses.perLevels && uses.gainAmount && characterLevel > featureLevel) {
    const steps = Math.floor((characterLevel - featureLevel) / uses.perLevels);
    max += steps * uses.gainAmount;
  }
  return max;
}

export function toCharacterFeatures(
  entries: FeatureEntry[],
  source: string,
  characterLevel = 1
): CharacterFeature[] {
  return entries.map((e) => {
    const feat: CharacterFeature = {
      id: e.id,
      name: e.name,
      description: e.description,
      source: e.source || source,
      actionType: e.actionType,
    };
    if (e.uses) {
      const max = computeFeatureMaxUses(e.uses, e.level, characterLevel);
      feat.uses = {
        current: max,
        max,
        recovery: e.uses.recovery,
        baseMax: e.uses.max,
        perLevels: e.uses.perLevels,
        gainAmount: e.uses.gainAmount,
      };
    }
    return feat;
  });
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
  /** Chosen languages beyond fixed racial ones */
  chosenLanguages?: string[];
  /** Override starting inventory (player equipment choices) */
  customInventory?: InventoryItem[];
  /** Class skill proficiency picks (Spanish or English names) */
  chosenSkills?: string[];
}): Character {
  const level = opts.level ?? 1;
  let scores = applyRaceASI(opts.baseScores, opts.race.abilityScoreIncrease);
  // Trait-level ability bonuses (homebrew / explicit)
  for (const trait of opts.race.traits) {
    if (trait.abilityBonuses) {
      (Object.keys(trait.abilityBonuses) as AbilityScore[]).forEach((k) => {
        const add = trait.abilityBonuses![k] || 0;
        scores[k] = Math.min(20, scores[k] + add);
      });
    }
  }
  const conMod = getModifier(scores.con);
  const die = hitDieNumber(opts.classData.hitDie);
  // Level 1 HP = max hit die + con
  let hp = die + conMod;
  for (let l = 2; l <= level; l++) {
    hp += Math.max(1, Math.floor(die / 2) + 1 + conMod); // average rounded up
  }

  const raceTraits = toCharacterFeatures(featuresUpToLevel(opts.race.traits, level), 'race', level);
  const classFeats = toCharacterFeatures(featuresUpToLevel(opts.classData.features, level), 'class', level);

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

  const inventory = opts.customInventory
    ? opts.customInventory
    : buildStartingInventory(opts.classData.id);

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

  // Skills from background + class choices
  const skills: Character['skills'] = {};
  if (bg?.skillProficiencies) {
    for (const sk of bg.skillProficiencies) {
      const id = mapSkillName(sk);
      if (id) skills[id] = { proficient: true, expertise: false };
    }
  }
  if (opts.chosenSkills) {
    for (const sk of opts.chosenSkills) {
      const id = mapSkillName(sk);
      if (id) skills[id] = { proficient: true, expertise: false };
    }
  }
  // Racial skill traits (e.g. Perception for elves, Intimidation for half-orcs)
  for (const trait of opts.race.traits) {
    const desc = (trait.name + ' ' + trait.description).toLowerCase();
    if (desc.includes('percepción') || desc.includes('percepcion')) {
      skills['perception'] = { proficient: true, expertise: false };
    }
    if (desc.includes('intimidación') || desc.includes('intimidacion')) {
      skills['intimidation'] = { proficient: true, expertise: false };
    }
  }

  // Languages list
  const languages = [
    ...(opts.race.languages || []).filter((l) => !/adicional|elección|eleccion/i.test(l)),
    ...(opts.chosenLanguages || []),
  ];
  if (bg?.languages?.count && !(opts.chosenLanguages && opts.chosenLanguages.length)) {
    languages.push(bg.languages.description);
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
    languages,
    level,
    proficiencyBonus: getProficiencyBonus(level),
    abilityScores: scores,
    savingThrows,
    skills,
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
      const slots: Record<number, { max: number; used: number }> = {};
      const sc = opts.classData.spellcasting;
      if (!sc) return slots;
      // Level 1 full caster: 2 first-level slots; half: 0; pact: 1
      if (sc.type === 'full') {
        slots[1] = { max: 2, used: 0 };
      } else if (sc.type === 'pact') {
        slots[1] = { max: 1, used: 0 };
      }
      return slots;
    })(),
  };
  return char;
}

/** Levels that grant ASI in 5e */
export const ASI_LEVELS = [4, 8, 12, 16, 19];

export function isAsiLevel(level: number): boolean {
  return ASI_LEVELS.includes(level);
}

export function refreshFeatureUses(
  features: CharacterFeature[],
  classData: ClassData | undefined,
  level: number
): CharacterFeature[] {
  return features.map((f) => {
    if (!f.uses) return f;
    const entry = classData?.features.find((x) => x.id === f.id);
    if (entry?.uses) {
      const max = computeFeatureMaxUses(entry.uses, entry.level, level);
      return {
        ...f,
        uses: {
          ...f.uses,
          max,
          current: Math.min(f.uses.current + Math.max(0, max - f.uses.max), max),
        },
      };
    }
    // homebrew: scale with stored perLevels
    if (f.uses.perLevels && f.uses.gainAmount && f.uses.baseMax !== undefined) {
      // approximate: baseMax + floor((level-1)/perLevels)*gainAmount
      const max =
        (f.uses.baseMax || f.uses.max) +
        Math.floor(Math.max(0, level - 1) / f.uses.perLevels) * f.uses.gainAmount;
      return {
        ...f,
        uses: {
          ...f.uses,
          max,
          current: Math.min(f.uses.current + Math.max(0, max - f.uses.max), max),
        },
      };
    }
    return f;
  });
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

  const refreshed = refreshFeatureUses(features, classData, newLevel);

  // Spell slots scale with level (5e / 5.5 tables)
  let spellSlots = { ...character.spellSlots };
  const kind =
    classData?.spellcasting?.type ||
    getCasterKindFromClassId(classData?.id || character.classId) ||
    (character.spellcastingAbility ? 'full' : 'none');

  if (kind === 'full' || kind === 'half' || kind === 'third') {
    // half/third casters lag behind; approximate with delayed full table
    let casterLevel = newLevel;
    if (kind === 'half') casterLevel = Math.max(0, Math.floor((newLevel - 1) / 2) * 1 + (newLevel >= 2 ? 1 : 0));
    // simpler half: floor(level/2) from level 2
    if (kind === 'half') casterLevel = newLevel < 2 ? 0 : Math.floor(newLevel / 2);
    if (kind === 'third') casterLevel = newLevel < 3 ? 0 : Math.floor(newLevel / 3);
    if (casterLevel > 0) {
      const table = getFullCasterSlots(casterLevel);
      const next: Record<number, { max: number; used: number }> = {};
      for (const [lvlStr, max] of Object.entries(table)) {
        const lvl = Number(lvlStr);
        const prev = spellSlots[lvl];
        next[lvl] = {
          max,
          used: prev ? Math.min(prev.used, max) : 0,
        };
      }
      spellSlots = next;
    }
  } else if (kind === 'pact') {
    const pact = getPactSlots(newLevel);
    // Warlock: all slots same level
    const prevUsed = Object.values(spellSlots).reduce((s, v) => s + (v?.used || 0), 0);
    spellSlots = {
      [pact.level]: {
        max: pact.count,
        used: Math.min(prevUsed, pact.count),
      },
    };
  }

  return {
    ...character,
    level: newLevel,
    proficiencyBonus: getProficiencyBonus(newLevel),
    abilityScores: scores,
    hitPointMax: character.hitPointMax + opts.hpGain,
    hitPointCurrent: character.hitPointCurrent + opts.hpGain,
    hitDice: `${newLevel}d${dieNum}`,
    features: refreshed,
    spellSlots,
    updatedAt: new Date().toISOString(),
  };
}

/** Simple subclasses by class id for SRD-ish choices */
/** Subclases PHB 2024 (nombres ES + resumen; desbloqueo típico nivel 3 salvo indicación) */

export { ALIGNMENTS } from './alignments';
// re-export names for convenience
export const ALIGNMENT_NAMES = [
  'Legal bueno', 'Neutral bueno', 'Caótico bueno',
  'Legal neutral', 'Neutral', 'Caótico neutral',
  'Legal maligno', 'Neutral maligno', 'Caótico maligno',
  'Sin alineamiento',
] as const;

export const SUBCLASSES: Record<string, { id: string; name: string; description: string; features: FeatureEntry[] }[]> = {
  barbarian: [
    {
      id: 'berserker',
      name: 'Senda del Berserker',
      description: 'Furia que culmina en frenesí violento (2024).',
      features: [
        { id: 'berserk-frenzy', name: 'Frenesí', description: 'Mientras estás en furia puedes hacer un ataque cuerpo a cuerpo como acción adicional; al terminar la furia sufres un nivel de agotamiento (según tu mesa/reglas 2024).', level: 3, source: 'subclass', actionType: 'bonus' },
      ],
    },
    {
      id: 'wild-heart',
      name: 'Senda del Corazón Salvaje',
      description: 'Vínculo animal y poderes tótem (antes Senda del Tótem; 2024).',
      features: [
        { id: 'wild-heart-3', name: 'Aspecto animal', description: 'Elige un aspecto animal que otorga un beneficio pasivo o en furia.', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Elige el aspecto animal (oso, águila, lobo, etc.).', actionType: 'passive' },
      ],
    },
    {
      id: 'world-tree',
      name: 'Senda del Árbol del Mundo',
      description: 'Conexión con Yggdrasil: teletransporte y protección (2024).',
      features: [
        { id: 'world-tree-3', name: 'Raíces del Árbol del Mundo', description: 'Mientras estás en furia, ganas opciones de anclar o moverte por raíces místicas.', level: 3, source: 'subclass', actionType: 'bonus' },
      ],
    },
    {
      id: 'zealot',
      name: 'Senda del Zelote',
      description: 'Furia sagrada alimentada por un dios o ideal (2024).',
      features: [
        { id: 'zealot-3', name: 'Furia divina', description: 'Mientras estás en furia, tu arma inflige daño radiante o necrótico extra.', level: 3, source: 'subclass', actionType: 'passive' },
      ],
    },
  ],
  bard: [
    {
      id: 'dance',
      name: 'Colegio de la Danza',
      description: 'Performance marcial y movilidad (2024).',
      features: [
        { id: 'dance-3', name: 'Derviche inspirado', description: 'Usas la danza para potenciar movimiento y ataques fluidos.', level: 3, source: 'subclass', actionType: 'bonus' },
      ],
    },
    {
      id: 'glamour',
      name: 'Colegio del Glamour',
      description: 'Magia feérica de asombro y mando (2024).',
      features: [
        { id: 'glamour-3', name: 'Manto de inspiración', description: 'Repartes inspiración con un toque de glamour feérico.', level: 3, source: 'subclass', actionType: 'bonus' },
      ],
    },
    {
      id: 'lore',
      name: 'Colegio del Saber',
      description: 'Erudición, secretos y corte de palabras (2024).',
      features: [
        { id: 'lore-3', name: 'Competencias adicionales', description: 'Ganas competencia en 3 habilidades a tu elección.', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Indica las 3 habilidades.', actionType: 'passive' },
      ],
    },
    {
      id: 'valor',
      name: 'Colegio del Valor',
      description: 'Bardo de batalla: armas, armadura media y combos (2024).',
      features: [
        { id: 'valor-3', name: 'Entrenamiento de combate', description: 'Competencia con armadura media, escudos y armas marciales.', level: 3, source: 'subclass', actionType: 'passive' },
      ],
    },
  ],
  cleric: [
    {
      id: 'life',
      name: 'Dominio de la Vida',
      description: 'Curación potenciada y preservación (2024; dominio desde nivel 3 en PHB 2024).',
      features: [
        { id: 'life-3', name: 'Discípulo de la vida', description: 'Tus curaciones restauran PG adicionales (2 + nivel del conjuro).', level: 3, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'light',
      name: 'Dominio de la Luz',
      description: 'Fuego sagrado y revelación (2024).',
      features: [
        { id: 'light-3', name: 'Destello protector', description: 'Canalizas luz para imponer desventaja a un ataque o cegar temporalmente.', level: 3, source: 'subclass', actionType: 'reaction' },
      ],
    },
    {
      id: 'trickery',
      name: 'Dominio de la Travesura',
      description: 'Engaño, duplicados y sigilo divino (2024).',
      features: [
        { id: 'trickery-3', name: 'Bendición del embaucador', description: 'Otorgan ventaja en Sigilo a un aliado como acción.', level: 3, source: 'subclass', actionType: 'action' },
      ],
    },
    {
      id: 'war',
      name: 'Dominio de la Guerra',
      description: 'Clérigo marcial y golpes guiados (2024).',
      features: [
        { id: 'war-3', name: 'Sacerdote de guerra', description: 'Cuando usas la acción Atacar, puedes hacer un arma extra como acción adicional un número limitado de veces.', level: 3, source: 'subclass', actionType: 'bonus', uses: { max: 1, recovery: 'short' } },
      ],
    },
  ],
  druid: [
    {
      id: 'land',
      name: 'Círculo de la Tierra',
      description: 'Magia de terrenos y recuperación de espacios (2024).',
      features: [
        { id: 'land-3', name: 'Recuperación natural', description: 'En un descanso corto recuperas espacios de conjuro (como Recuperación arcana).', level: 3, source: 'subclass', actionType: 'special' },
      ],
    },
    {
      id: 'moon',
      name: 'Círculo de la Luna',
      description: 'Formas salvajes de combate potentes (2024).',
      features: [
        { id: 'moon-3', name: 'Forma de combate', description: 'Puedes adoptar formas más peligrosas y atacar mejor en forma salvaje.', level: 3, source: 'subclass', actionType: 'bonus' },
      ],
    },
    {
      id: 'sea',
      name: 'Círculo del Mar',
      description: 'Oleaje, frío y poderes oceánicos (2024).',
      features: [
        { id: 'sea-3', name: 'Furia de las mareas', description: 'Opciones de daño de frío/rayo y movilidad acuática.', level: 3, source: 'subclass', actionType: 'bonus' },
      ],
    },
    {
      id: 'stars',
      name: 'Círculo de las Estrellas',
      description: 'Constelaciones y forma de estrellas (2024).',
      features: [
        { id: 'stars-3', name: 'Mapa estelar', description: 'Elige una constelación que altera tu forma o conjuros.', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Elige constelación: Arquero, Cáliz o Dragón (u homebrew).', actionType: 'bonus' },
      ],
    },
  ],
  fighter: [
    {
      id: 'battle-master',
      name: 'Maestro de Batalla',
      description: 'Maniobras y dados de superioridad (2024).',
      features: [
        { id: 'bm-3', name: 'Maniobras', description: 'Aprendes maniobras y ganas dados de superioridad. Elige 3 maniobras iniciales.', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Anota las 3 maniobras elegidas.', actionType: 'special', uses: { max: 4, recovery: 'short' } },
      ],
    },
    {
      id: 'champion',
      name: 'Campeón',
      description: 'Críticos mejorados y atleta superior (2024).',
      features: [
        { id: 'champ-3', name: 'Crítico mejorado', description: 'Tus ataques con armas puntúan crítico en 19–20.', level: 3, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'eldritch-knight',
      name: 'Caballero Arcano',
      description: 'Combate con magia de mago limitada (2024).',
      features: [
        { id: 'ek-3', name: 'Lanzamiento de conjuros', description: 'Ganas conjuros de mago (trucos y espacios). Elige trucos y conjuros conocidos.', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Indica trucos y conjuros de mago elegidos.', actionType: 'passive' },
      ],
    },
    {
      id: 'psi-warrior',
      name: 'Guerrero Psi',
      description: 'Telequinesia y escudos psiónicos (2024).',
      features: [
        { id: 'psi-3', name: 'Poder psiónico', description: 'Ganas dados de energía psiónica para potenciar ataques o defensa.', level: 3, source: 'subclass', actionType: 'special', uses: { max: 4, recovery: 'long' } },
      ],
    },
  ],
  monk: [
    {
      id: 'mercy',
      name: 'Guerrero de la Misericordia',
      description: 'Toques que curan o dañan (2024).',
      features: [
        { id: 'mercy-3', name: 'Mano de la misericordia', description: 'Puedes gastar focos para curar o infligir daño necrótico con un toque.', level: 3, source: 'subclass', actionType: 'bonus' },
      ],
    },
    {
      id: 'elements',
      name: 'Guerrero de los Elementos',
      description: 'Puños y técnicas elementales (2024).',
      features: [
        { id: 'elements-3', name: 'Sintonía elemental', description: 'Imbuyes golpes con daño elemental a tu elección.', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Elige el elemento preferido (fuego, frío, rayo, etc.).', actionType: 'bonus' },
      ],
    },
    {
      id: 'open-hand',
      name: 'Guerrero de la Mano Abierta',
      description: 'Técnicas clásicas de empujar, derribar e impedir (2024).',
      features: [
        { id: 'open-3', name: 'Técnica de mano abierta', description: 'Al golpear con Ráfaga de golpes puedes empujar, derribar o impedir reacciones.', level: 3, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'shadow',
      name: 'Guerrero de la Sombra',
      description: 'Sigilo, oscuridad y teletransporte sombrío (2024).',
      features: [
        { id: 'shadow-3', name: 'Artes de la sombra', description: 'Conjuros menores de oscuridad/silencio y movimiento entre sombras.', level: 3, source: 'subclass', actionType: 'action' },
      ],
    },
  ],
  paladin: [
    {
      id: 'devotion',
      name: 'Juramento de Devoción',
      description: 'Justicia, honestidad y arma sagrada (2024).',
      features: [
        { id: 'devotion-3', name: 'Canalizar divinidad: Arma sagrada', description: 'Imbuyes tu arma (+mod. Carisma al ataque) durante 1 minuto.', level: 3, source: 'subclass', actionType: 'action' },
      ],
    },
    {
      id: 'glory',
      name: 'Juramento de Gloria',
      description: 'Hazañas heroicas y presencia atlética (2024).',
      features: [
        { id: 'glory-3', name: 'Presencia inspiradora', description: 'Canalizas divinidad para potenciar atletismo o velocidad de aliados.', level: 3, source: 'subclass', actionType: 'action' },
      ],
    },
    {
      id: 'ancients',
      name: 'Juramento de los Ancestros',
      description: 'Luz primordial contra la oscuridad (2024).',
      features: [
        { id: 'ancients-3', name: 'Canalizar divinidad: Ira de la naturaleza', description: 'Enredas enemigos con enredaderas espectrales.', level: 3, source: 'subclass', actionType: 'action' },
      ],
    },
    {
      id: 'vengeance',
      name: 'Juramento de Venganza',
      description: 'Cazar villanos sin descanso (2024).',
      features: [
        { id: 'vengeance-3', name: 'Canalizar divinidad: Voto de enemistad', description: 'Ventaja en ataques contra una criatura marcada.', level: 3, source: 'subclass', actionType: 'bonus' },
      ],
    },
  ],
  ranger: [
    {
      id: 'beast-master',
      name: 'Maestro de Bestias',
      description: 'Compañero animal leal (2024).',
      features: [
        { id: 'bm-ranger-3', name: 'Compañero primigenio', description: 'Ganas un compañero bestia. Elige el tipo de compañero.', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Elige el compañero (bestia de la tierra, mar o cielo).', actionType: 'passive' },
      ],
    },
    {
      id: 'fey-wanderer',
      name: 'Errante Feérico',
      description: 'Encanto y magia del Reino Feérico (2024).',
      features: [
        { id: 'fey-3', name: 'Regalos feéricos', description: 'Bonus a Carisma y opciones de teletransporte corto o daño psíquico.', level: 3, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'gloom-stalker',
      name: 'Acechador de la Penumbra',
      description: 'Emboscadas en oscuridad (2024).',
      features: [
        { id: 'gloom-3', name: 'Emboscada umbría', description: 'En el primer turno de combate ganas velocidad y un ataque extra.', level: 3, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'hunter',
      name: 'Cazador',
      description: 'Tácticas contra amenazas peligrosas (2024).',
      features: [
        { id: 'hunter-3', name: 'Presa del cazador', description: 'Elige una opción de combate (coloso, horda, etc.).', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Elige la opción de Presa del cazador.', actionType: 'passive' },
      ],
    },
  ],
  rogue: [
    {
      id: 'arcane-trickster',
      name: 'Bribón Arcano',
      description: 'Magia de mago e ilusiones sutiles (2024).',
      features: [
        { id: 'at-3', name: 'Lanzamiento de conjuros', description: 'Ganas trucos y conjuros de mago. Elige tus conjuros iniciales.', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Indica trucos y conjuros elegidos.', actionType: 'passive' },
      ],
    },
    {
      id: 'assassin',
      name: 'Asesino',
      description: 'Identidades falsas y golpes letales (2024).',
      features: [
        { id: 'assassin-3', name: 'Asesinar', description: 'Ventaja contra criaturas que no han actuado; críticos en sorpresa.', level: 3, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'soulknife',
      name: 'Cuchilla del Alma',
      description: 'Hojas psíquicas y dados psiónicos (2024).',
      features: [
        { id: 'soul-3', name: 'Hojas psíquicas', description: 'Manifestas armas de energía psíquica; ganas dados psiónicos.', level: 3, source: 'subclass', actionType: 'special' },
      ],
    },
    {
      id: 'thief',
      name: 'Ladrón',
      description: 'Manos rápidas y uso de objetos (2024).',
      features: [
        { id: 'thief-3', name: 'Manos rápidas', description: 'Puedes usar Acción astuta para Usar un objeto.', level: 3, source: 'subclass', actionType: 'bonus' },
      ],
    },
  ],
  sorcerer: [
    {
      id: 'aberrant',
      name: 'Hechicería Aberrante',
      description: 'Poderes telepáticos del Vacío (2024).',
      features: [
        { id: 'aberrant-3', name: 'Telepatía psiónica', description: 'Comunicación telepática y conjuros psiónicos bonus.', level: 3, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'clockwork',
      name: 'Hechicería de Mecanismos',
      description: 'Orden del Plano Mecanus (2024).',
      features: [
        { id: 'clock-3', name: 'Restaurar equilibrio', description: 'Puedes anular ventaja o desventaja en una tirada cercana.', level: 3, source: 'subclass', actionType: 'reaction', uses: { max: 1, recovery: 'long' } },
      ],
    },
    {
      id: 'draconic',
      name: 'Hechicería Dracónica',
      description: 'Sangre de dragón: resiliencia y afinidad elemental (2024).',
      features: [
        { id: 'draconic-3', name: 'Linaje dracónico', description: 'Elige un tipo de dragón; CA y PG mejorados; afinidad de daño.', level: 3, source: 'subclass', requiresChoice: true, choiceHint: 'Elige el color/tipo de dragón ancestral.', actionType: 'passive' },
      ],
    },
    {
      id: 'wild-magic',
      name: 'Magia Salvaje',
      description: 'Oleadas impredecibles de magia (2024).',
      features: [
        { id: 'wild-3', name: 'Oleada de magia salvaje', description: 'Al lanzar conjuros de hechicero puede activarse una oleada aleatoria.', level: 3, source: 'subclass', actionType: 'passive' },
      ],
    },
  ],
  warlock: [
    {
      id: 'archfey',
      name: 'Patrón: El Archifeérico',
      description: 'Señor feérico del engaño y el encanto (2024).',
      features: [
        { id: 'archfey-3', name: 'Presencia feérica', description: 'Puedes encantar o asustar en un área corta.', level: 3, source: 'subclass', actionType: 'action', uses: { max: 1, recovery: 'short' } },
      ],
    },
    {
      id: 'celestial',
      name: 'Patrón: El Celestial',
      description: 'Ser de los planos superiores y curación (2024).',
      features: [
        { id: 'celestial-3', name: 'Luz sanadora', description: 'Dados de curación que puedes repartir a criaturas cercanas.', level: 3, source: 'subclass', actionType: 'bonus' },
      ],
    },
    {
      id: 'fiend',
      name: 'Patrón: El Infernal',
      description: 'Pacto con un señor de los Nueve Infiernos (2024).',
      features: [
        { id: 'fiend-3', name: 'Bendición del oscuro', description: 'Al reducir a un hostil a 0 PG ganas PG temporales.', level: 3, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'great-old-one',
      name: 'Patrón: El Gran Antiguo',
      description: 'Entidad incomprensible y telepatía (2024).',
      features: [
        { id: 'goo-3', name: 'Mente desperdigada', description: 'Telepatía y resistencia a ser encantado.', level: 3, source: 'subclass', actionType: 'passive' },
      ],
    },
  ],
  wizard: [
    {
      id: 'abjurer',
      name: 'Abjurador',
      description: 'Escudos mágicos y protección (2024).',
      features: [
        { id: 'abj-3', name: 'Resguardo arcano', description: 'Ganas un escudo mágico de PG que se recarga con abjuraciones.', level: 3, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'diviner',
      name: 'Adivino',
      description: 'Portentos y visión del futuro (2024).',
      features: [
        { id: 'div-3', name: 'Portento', description: 'Tiras 2d20 al descanso largo y puedes sustituir tiradas con esos resultados.', level: 3, source: 'subclass', actionType: 'special', uses: { max: 2, recovery: 'long' } },
      ],
    },
    {
      id: 'evoker',
      name: 'Evocador',
      description: 'Explosiones potentes y esculpir conjuros (2024).',
      features: [
        { id: 'evo-3', name: 'Esculpir conjuros', description: 'Proteges aliados de tus evocaciones de área.', level: 3, source: 'subclass', actionType: 'passive' },
      ],
    },
    {
      id: 'illusionist',
      name: 'Ilusionista',
      description: 'Ilusiones mejoradas y engaño sensorial (2024).',
      features: [
        { id: 'illu-3', name: 'Ilusión mejorada', description: 'Mejoras Minor Illusion y puedes alterar ilusiones con una acción adicional.', level: 3, source: 'subclass', actionType: 'bonus' },
      ],
    },
  ],
};
