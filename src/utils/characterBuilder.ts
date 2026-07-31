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
import { getFullCasterSlots, getPactSlots, getCasterKindFromClassId, getSorceryPointsMax } from './spellLimits';
import { SUBCLASSES_2024 } from '../data/subclasses2024';
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

  let sorceryPoints = character.sorceryPoints;
  const isSorcerer =
    classData?.id === 'sorcerer' ||
    character.classId === 'sorcerer' ||
    (character.class || '').toLowerCase().includes('hechic');
  if (isSorcerer) {
    const spMax = getSorceryPointsMax(newLevel);
    sorceryPoints = {
      max: spMax,
      current: Math.min(spMax, (character.sorceryPoints?.current ?? spMax) + Math.max(0, spMax - (character.sorceryPoints?.max ?? 0))),
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
    sorceryPoints,
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

/** @deprecated use SUBCLASSES_2024 — kept as alias for wizard/level-up */
export const SUBCLASSES = Object.fromEntries(
  Object.entries(SUBCLASSES_2024).map(([classId, list]) => [
    classId,
    list.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      features: s.features,
    })),
  ])
) as Record<
  string,
  { id: string; name: string; description: string; features: import('../types/dnd').FeatureEntry[] }[]
>;
