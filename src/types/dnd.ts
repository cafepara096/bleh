// ===== Core D&D Types =====

export type AbilityScore = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export const ABILITY_LABELS: Record<AbilityScore, string> = {
  str: 'Fuerza',
  dex: 'Destreza',
  con: 'Constitución',
  int: 'Inteligencia',
  wis: 'Sabiduría',
  cha: 'Carisma',
};

export const SKILLS = [
  { id: 'acrobatics', name: 'Acrobacias', ability: 'dex' as AbilityScore },
  { id: 'animalHandling', name: 'Trato con Animales', ability: 'wis' as AbilityScore },
  { id: 'arcana', name: 'Arcanos', ability: 'int' as AbilityScore },
  { id: 'athletics', name: 'Atletismo', ability: 'str' as AbilityScore },
  { id: 'deception', name: 'Engaño', ability: 'cha' as AbilityScore },
  { id: 'history', name: 'Historia', ability: 'int' as AbilityScore },
  { id: 'insight', name: 'Perspicacia', ability: 'wis' as AbilityScore },
  { id: 'intimidation', name: 'Intimidación', ability: 'cha' as AbilityScore },
  { id: 'investigation', name: 'Investigación', ability: 'int' as AbilityScore },
  { id: 'medicine', name: 'Medicina', ability: 'wis' as AbilityScore },
  { id: 'nature', name: 'Naturaleza', ability: 'int' as AbilityScore },
  { id: 'perception', name: 'Percepción', ability: 'wis' as AbilityScore },
  { id: 'performance', name: 'Interpretación', ability: 'cha' as AbilityScore },
  { id: 'persuasion', name: 'Persuasión', ability: 'cha' as AbilityScore },
  { id: 'religion', name: 'Religión', ability: 'int' as AbilityScore },
  { id: 'sleightOfHand', name: 'Juego de Manos', ability: 'dex' as AbilityScore },
  { id: 'stealth', name: 'Sigilo', ability: 'dex' as AbilityScore },
  { id: 'survival', name: 'Supervivencia', ability: 'wis' as AbilityScore },
] as const;

export type SkillId = typeof SKILLS[number]['id'];

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface SkillProficiency {
  proficient: boolean;
  expertise: boolean;
}

export interface SpellSlot {
  max: number;
  used: number;
}

export interface CharacterFeature {
  id: string;
  name: string;
  description: string;
  source?: string; // class, race, feat, background, homebrew
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  weight?: number;
  description?: string;
  equipped?: boolean;
  damage?: string;
  damageType?: string;
  properties?: string[];
}

export interface Spell {
  id: string;
  name: string;
  level: number; // 0 = cantrip
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  higherLevels?: string;
  damage?: string;
  damageType?: string;
  concentration?: boolean;
  ritual?: boolean;
  classes?: string[];
  homebrew?: boolean;
}

export interface CharacterSpell {
  spellId: string;
  prepared: boolean;
  alwaysPrepared?: boolean;
}

export interface Character {
  id: string;
  name: string;
  playerName?: string;
  race: string;
  class: string;
  subclass?: string;
  background: string;
  alignment?: string;
  level: number;
  experience: number;
  proficiencyBonus: number;

  // Ability scores
  abilityScores: AbilityScores;
  // Saving throw proficiencies
  savingThrows: AbilityScore[];
  // Skill proficiencies
  skills: Partial<Record<SkillId, SkillProficiency>>;

  // Combat
  armorClass: number;
  initiative?: number; // calculated if not set
  speed: number;
  hitPointMax: number;
  hitPointCurrent: number;
  hitPointTemp: number;
  hitDice: string; // e.g. "3d8"
  hitDiceUsed: number;
  deathSaves: {
    successes: number;
    failures: number;
  };

  // Inspiration
  inspiration: boolean;

  // Personality
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;

  // Features & Traits
  features: CharacterFeature[];

  // Spells
  spellcastingAbility?: AbilityScore;
  spellSlots: Record<number, SpellSlot>; // level 1-9
  spells: CharacterSpell[];
  cantripsKnown: string[];

  // Equipment
  inventory: InventoryItem[];
  currency: {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
  };

  // Notes
  notes?: string;
  appearance?: string;
  backstory?: string;

  // Meta
  homebrew?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Monster {
  id: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  armorClass: number;
  hitPoints: string;
  speed: string;
  abilityScores: AbilityScores;
  savingThrows?: string;
  skills?: string;
  damageResistances?: string;
  damageImmunities?: string;
  conditionImmunities?: string;
  senses: string;
  languages: string;
  challengeRating: string;
  proficiencyBonus?: number;
  traits?: { name: string; description: string }[];
  actions?: { name: string; description: string; damage?: string }[];
  legendaryActions?: { name: string; description: string }[];
  homebrew?: boolean;
  description?: string;
}

export interface Item {
  id: string;
  name: string;
  type: string; // weapon, armor, potion, wondrous, etc.
  rarity: string;
  attunement?: boolean;
  description: string;
  damage?: string;
  damageType?: string;
  properties?: string[];
  armorClass?: string;
  weight?: number;
  cost?: string;
  homebrew?: boolean;
}

export type ContentType = 'spell' | 'monster' | 'item' | 'character';
