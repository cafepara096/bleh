import type { AbilityScore, AbilityScores, Character, SkillId } from '../types/dnd';
import { SKILLS } from '../types/dnd';

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

export function calculateSkillBonus(
  character: Character,
  skillId: SkillId
): number {
  const skill = SKILLS.find(s => s.id === skillId);
  if (!skill) return 0;

  const abilityMod = getModifier(character.abilityScores[skill.ability]);
  const proficiency = character.skills[skillId];

  let bonus = abilityMod;
  if (proficiency?.proficient) {
    bonus += character.proficiencyBonus;
  }
  if (proficiency?.expertise) {
    bonus += character.proficiencyBonus;
  }
  return bonus;
}

export function calculateSavingThrow(
  character: Character,
  ability: AbilityScore
): number {
  const mod = getModifier(character.abilityScores[ability]);
  const proficient = character.savingThrows.includes(ability);
  return mod + (proficient ? character.proficiencyBonus : 0);
}

export function calculateInitiative(character: Character): number {
  if (character.initiative !== undefined) return character.initiative;
  return getModifier(character.abilityScores.dex);
}

export function calculatePassivePerception(character: Character): number {
  return 10 + calculateSkillBonus(character, 'perception');
}

export function getSpellSaveDC(character: Character): number | null {
  if (!character.spellcastingAbility) return null;
  const mod = getModifier(character.abilityScores[character.spellcastingAbility]);
  return 8 + character.proficiencyBonus + mod;
}

export function getSpellAttackBonus(character: Character): number | null {
  if (!character.spellcastingAbility) return null;
  const mod = getModifier(character.abilityScores[character.spellcastingAbility]);
  return character.proficiencyBonus + mod;
}

export function createEmptyCharacter(name = 'Nuevo Personaje'): Character {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    race: '',
    class: '',
    background: '',
    level: 1,
    experience: 0,
    proficiencyBonus: 2,
    abilityScores: {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10,
    },
    savingThrows: [],
    skills: {},
    armorClass: 10,
    speed: 30,
    hitPointMax: 8,
    hitPointCurrent: 8,
    hitPointTemp: 0,
    hitDice: '1d8',
    hitDiceUsed: 0,
    deathSaves: { successes: 0, failures: 0 },
    inspiration: false,
    features: [],
    spellSlots: {},
    spells: [],
    cantripsKnown: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    createdAt: now,
    updatedAt: now,
  };
}

export function levelUp(character: Character): Character {
  const newLevel = Math.min(20, character.level + 1);
  return {
    ...character,
    level: newLevel,
    proficiencyBonus: getProficiencyBonus(newLevel),
    updatedAt: new Date().toISOString(),
  };
}

export function applyDamage(character: Character, amount: number): Character {
  let current = character.hitPointCurrent;
  let temp = character.hitPointTemp;

  if (temp > 0) {
    if (amount <= temp) {
      temp -= amount;
      amount = 0;
    } else {
      amount -= temp;
      temp = 0;
    }
  }

  current = Math.max(0, current - amount);

  return {
    ...character,
    hitPointCurrent: current,
    hitPointTemp: temp,
    updatedAt: new Date().toISOString(),
  };
}

export function heal(character: Character, amount: number): Character {
  return {
    ...character,
    hitPointCurrent: Math.min(character.hitPointMax, character.hitPointCurrent + amount),
    updatedAt: new Date().toISOString(),
  };
}

export function totalCurrencyInGP(currency: Character['currency']): number {
  return (
    currency.pp * 10 +
    currency.gp +
    currency.ep * 0.5 +
    currency.sp * 0.1 +
    currency.cp * 0.01
  );
}
