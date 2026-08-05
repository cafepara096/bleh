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

export interface FeatureUses {
  /** Current remaining uses */
  current: number;
  /** Maximum uses at this level */
  max: number;
  /** short | long | dawn | none */
  recovery: 'short' | 'long' | 'dawn' | 'none';
  /** Base max at the level the feature is gained */
  baseMax?: number;
  /** Extra uses every N character levels (e.g. 1 every level, or 1 every 2 levels) */
  perLevels?: number;
  /** Amount gained each interval */
  gainAmount?: number;
}

export interface PendingChoice {
  id: string;
  featureId: string;
  featureName: string;
  description: string;
  choiceHint?: string;
  levelGained: number;
  source?: string;
  /** Player resolution text once chosen */
  resolution?: string;
}

export interface CharacterFeature {
  id: string;
  name: string;
  description: string;
  source?: string; // class, race, feat, background, homebrew
  /** Limited-use resource (Second Wind, Rage, Channel Divinity…) */
  uses?: FeatureUses;
  /** Suggested action economy for D&D Beyond-style actions list */
  actionType?: 'action' | 'bonus' | 'reaction' | 'special' | 'passive';
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  weight?: number;
  description?: string;
  equipped?: boolean;
  armorClass?: string;
  armorDexMod?: 'none' | 'full' | 'max2' | 'max3';
  damage?: string;
  damageType?: string;
  properties?: string[];
  /** Weapon attack uses proficiency bonus when true (default true for weapons) */
  proficient?: boolean;
  /** Link to items catalog — live stats on character sheet */
  catalogId?: string;
}

export interface Spell {
  id: string;
  name: string;
  /** English name for search / dual label */
  nameEn?: string;
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
  raceId?: string;
  class: string;
  classId?: string;
  subclass?: string;
  subclassId?: string;
  background: string;
  backgroundId?: string;
  /** Chosen languages from race/background */
  languages?: string[];
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
  /** Unresolved choices from level-up / subclass (skill picks, fighting style, etc.) */
  pendingChoices?: PendingChoice[];

  // Spells
  spellcastingAbility?: AbilityScore;
  spellSlots: Record<number, SpellSlot>; // level 1-9
  spells: CharacterSpell[];
  cantripsKnown: string[];
  /** Sorcerer (2024): puntos de hechicería — intercambiables con espacios */
  sorceryPoints?: { current: number; max: number };
  /** Metamagia conocida (ids de METAMAGIC_OPTIONS / homebrew) */
  metamagicKnown?: string[];
  /** Maniobras del Maestro de Batalla conocidas */
  maneuversKnown?: string[];
  /** Último resultado de oleada de magia salvaje (texto) */
  lastWildSurge?: string;

  // Equipment
  inventory: InventoryItem[];
  currency: {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
  };
  /** Monedas ocultas en la UI (siguen en conversiones) */
  disabledCoins?: Array<'cp' | 'sp' | 'ep' | 'gp' | 'pp'>;

  // Notes
  notes?: string;
  /** Estados activos (D&D 2024 + homebrew) */
  conditions?: string[];
  /** Notas de campaña en paneles */
  campaignNotes?: { id: string; title: string; body: string; updatedAt?: string }[];
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
  nameEn?: string;
  size: string;
  type: string;
  alignment?: string;
  armorClass: number;
  hitPoints: string;
  speed: string;
  abilityScores: AbilityScores;
  /** aliases planos opcionales (compat) */
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  savingThrows?: string;
  saves?: string;
  skills?: string;
  damageResistances?: string;
  damageImmunities?: string;
  conditionImmunities?: string;
  senses?: string;
  languages?: string;
  challengeRating: string;
  /** alias */
  challenge?: string;
  proficiencyBonus?: number;
  traits?: { name: string; description: string }[];
  actions?: { name: string; description: string; damage?: string; damageType?: string; attackBonus?: number }[];
  bonusActions?: { name: string; description: string; damage?: string }[];
  reactions?: { name: string; description: string }[];
  legendaryActions?: { name: string; description: string }[];
  variants?: { name: string; description: string }[];
  homebrew?: boolean;
  description?: string;
}

export interface Item {
  id: string;
  name: string;
  /** English name for search / dual label */
  nameEn?: string;
  type: string; // weapon, armor, potion, wondrous, etc.
  rarity: string;
  attunement?: boolean;
  description: string;
  damage?: string;
  damageType?: string;
  properties?: string[];
  armorClass?: string;
  /** Cómo aplica el modificador de Destreza a la CA de esta armadura */
  armorDexMod?: 'none' | 'full' | 'max2' | 'max3';
  weight?: number;
  cost?: string;
  homebrew?: boolean;
}


// ===== Class & Race (structured for future character sheet linking) =====

export interface FeatureEntry {
  id: string;
  name: string;
  description: string;
  /** Level at which this feature is gained (1 for racial traits) */
  level: number;
  /** Optional link to a spell id from the spells catalog */
  spellId?: string;
  source?: string;
  /** Automatic ability score bonuses granted by this feature (applied on character create) */
  abilityBonuses?: Partial<Record<AbilityScore, number>>;
  /** Limited uses definition for catalog features */
  uses?: {
    max: number;
    recovery: 'short' | 'long' | 'dawn' | 'none';
    /** Gain +gainAmount max uses every perLevels levels after the feature level */
    perLevels?: number;
    gainAmount?: number;
  };
  actionType?: 'action' | 'bonus' | 'reaction' | 'special' | 'passive';
  /** If true, level-up should prompt the player to choose something for this feature */
  requiresChoice?: boolean;
  choiceHint?: string;
}

export interface RaceData {
  id: string;
  name: string;
  description: string;
  size: string;
  speed: number; // feet
  abilityScoreIncrease: string;
  languages: string[];
  traits: FeatureEntry[];
  /** Optional spell ids granted by the race */
  spellIds?: string[];
  homebrew?: boolean;
}

export interface ClassData {
  id: string;
  name: string;
  description: string;
  hitDie: string; // e.g. "d10"
  primaryAbility: string;
  savingThrows: string[];
  armorProficiencies: string;
  weaponProficiencies: string;
  toolProficiencies?: string;
  skillChoices: string;
  /** Features keyed by level */
  features: FeatureEntry[];
  /** Spellcasting info if any */
  spellcasting?: {
    ability: AbilityScore;
    type: 'full' | 'half' | 'third' | 'pact';
    /** Cantrip/spell ids often known at level 1 (optional seeds) */
    starterSpellIds?: string[];
  };
  subclasses?: { id: string; name: string; description: string; features: FeatureEntry[] }[];
  homebrew?: boolean;
}


export interface BackgroundData {
  id: string;
  name: string;
  description: string;
  skillProficiencies?: string[];
  toolProficiencies?: string[];
  languages?: { count: number; description: string };
  equipment?: string[];
  feature?: { name: string; description: string };
  originFeat?: { name: string; description: string };
  originFeatChoices?: { id: string; name: string; description: string }[];
  homebrew?: boolean;
}

export type ContentType = 'spell' | 'monster' | 'item' | 'character' | 'race' | 'class' | 'background';
