/**
 * Approximate D&D 5e (SRD) limits for known/prepared spells.
 * Simplified for the app — full multiclass tables not included.
 */

export type CasterKind = 'full' | 'half' | 'third' | 'pact' | 'none';

/** Cantrips known by level for full casters (bard, cleric, druid, sorcerer, warlock, wizard) */
const FULL_CANTRIPS = [0, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
/** Sorcerer/Warlock cantrips slightly different at low levels — use shared table */

const HALF_CANTRIPS = [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]; // ranger/paladin from 2

/** Spells known (sorcerer-like fixed known) by level — full spontaneous */
const FULL_SPELLS_KNOWN = [
  0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22,
];

/** Wizard prepares Int mod + level; we use a soft max for UI */
const WIZARD_PREPARE_BASE = (level: number, intMod: number) =>
  Math.max(1, level + intMod);

/** Warlock spells known */
const PACT_SPELLS_KNOWN = [
  0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15,
];
const PACT_CANTRIPS = [0, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];

/** Half caster spells known (ranger) — simplified */
const HALF_SPELLS_KNOWN = [
  0, 0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
];

export function getCasterKindFromClassId(classId?: string): CasterKind {
  if (!classId) return 'none';
  const full = ['bard', 'cleric', 'druid', 'sorcerer', 'wizard'];
  const half = ['paladin', 'ranger'];
  const pact = ['warlock'];
  if (full.includes(classId)) return 'full';
  if (half.includes(classId)) return 'half';
  if (pact.includes(classId)) return 'pact';
  // homebrew with spellcasting will pass type from class data
  return 'none';
}

export function getCantripLimit(
  kind: CasterKind,
  level: number,
  classId?: string
): number {
  const lv = Math.min(20, Math.max(0, level));
  if (kind === 'none') return 0;
  if (kind === 'pact') return PACT_CANTRIPS[lv] ?? 4;
  if (kind === 'half') return HALF_CANTRIPS[lv] ?? 3;
  if (classId === 'wizard') {
    // Wizard: 3 at 1, +1 at 4 and 10
    if (lv >= 10) return 5;
    if (lv >= 4) return 4;
    return 3;
  }
  return FULL_CANTRIPS[lv] ?? 4;
}

export function getSpellKnownLimit(
  kind: CasterKind,
  level: number,
  classId?: string,
  abilityMod = 0
): number | 'prepared' {
  const lv = Math.min(20, Math.max(0, level));
  if (kind === 'none') return 0;
  if (kind === 'pact') return PACT_SPELLS_KNOWN[lv] ?? 15;
  if (kind === 'half') return HALF_SPELLS_KNOWN[lv] ?? 11;
  // Cleric/Druid/Paladin prepare; Wizard prepares
  if (classId === 'cleric' || classId === 'druid' || classId === 'paladin') {
    return 'prepared';
  }
  if (classId === 'wizard') {
    return WIZARD_PREPARE_BASE(lv, abilityMod);
  }
  // Bard, sorcerer: known list
  return FULL_SPELLS_KNOWN[lv] ?? 22;
}

/** Max spell level available by character level (full caster) */
export function maxSpellLevelAvailable(kind: CasterKind, level: number): number {
  if (kind === 'none') return 0;
  if (kind === 'pact') {
    if (level >= 9) return 5;
    if (level >= 7) return 4;
    if (level >= 5) return 3;
    if (level >= 3) return 2;
    return 1;
  }
  if (kind === 'half') {
    if (level >= 17) return 5;
    if (level >= 13) return 4;
    if (level >= 9) return 3;
    if (level >= 5) return 2;
    if (level >= 2) return 1;
    return 0;
  }
  // full
  if (level >= 17) return 9;
  if (level >= 15) return 8;
  if (level >= 13) return 7;
  if (level >= 11) return 6;
  if (level >= 9) return 5;
  if (level >= 7) return 4;
  if (level >= 5) return 3;
  if (level >= 3) return 2;
  if (level >= 1) return 1;
  return 0;
}

/** Spell slots by level for full casters (SRD table simplified) */
export function getFullCasterSlots(level: number): Record<number, number> {
  const table: Record<number, number[]> = {
    // index 0 unused; values are max slots for spell levels 1-9
    1: [2],
    2: [3],
    3: [4, 2],
    4: [4, 3],
    5: [4, 3, 2],
    6: [4, 3, 3],
    7: [4, 3, 3, 1],
    8: [4, 3, 3, 2],
    9: [4, 3, 3, 3, 1],
    10: [4, 3, 3, 3, 2],
    11: [4, 3, 3, 3, 2, 1],
    12: [4, 3, 3, 3, 2, 1],
    13: [4, 3, 3, 3, 2, 1, 1],
    14: [4, 3, 3, 3, 2, 1, 1],
    15: [4, 3, 3, 3, 2, 1, 1, 1],
    16: [4, 3, 3, 3, 2, 1, 1, 1],
    17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
    18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
    19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
    20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
  };
  const row = table[Math.min(20, Math.max(1, level))] || [2];
  const slots: Record<number, number> = {};
  row.forEach((max, i) => {
    slots[i + 1] = max;
  });
  return slots;
}

export function getPactSlots(level: number): { level: number; count: number } {
  if (level >= 17) return { level: 5, count: 4 };
  if (level >= 11) return { level: 5, count: 3 };
  if (level >= 9) return { level: 5, count: 2 };
  if (level >= 7) return { level: 4, count: 2 };
  if (level >= 5) return { level: 3, count: 2 };
  if (level >= 3) return { level: 2, count: 2 };
  if (level >= 2) return { level: 1, count: 2 };
  return { level: 1, count: 1 };
}
