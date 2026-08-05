import type { Character, InventoryItem } from '../types/dnd';
import { getModifier } from './character';
import { resolveArmorStats } from '../data/armorCatalog';

export type ArmorDexMode = 'none' | 'full' | 'max2' | 'max3';

export function isShieldItem(item: InventoryItem): boolean {
  const n = (item.name || '').toLowerCase();
  const d = (item.description || '').toLowerCase();
  return n.includes('escudo') || n.includes('shield') || d.includes('escudo');
}

export function isArmorItem(item: InventoryItem): boolean {
  const n = (item.name || '').toLowerCase();
  if (isShieldItem(item)) return false;
  if (/armadura|cota|cuero|placa|malla|peto|brigandina|armor/i.test(n)) return true;
  return !!item.armorClass;
}

/** Interpreta armorClass string + armorDexMod */
export function itemToAC(item: InventoryItem, dexMod: number): number | null {
  if (!isArmorItem(item) && !isShieldItem(item) && !item.armorClass) return null;

  let armorClass = item.armorClass;
  let mode: ArmorDexMode = item.armorDexMod || 'none';

  if (!armorClass || !item.armorDexMod) {
    const resolved = resolveArmorStats(item.name, item.description);
    if (resolved) {
      armorClass = armorClass || resolved.armorClass;
      if (!item.armorDexMod) mode = resolved.armorDexMod;
    }
  }

  const text = (armorClass || item.description || '').trim();
  const numMatch = text.match(/(\d+)/);
  const base = numMatch ? parseInt(numMatch[1], 10) : isShieldItem(item) ? 2 : null;
  if (base == null) return null;

  if (!item.armorDexMod) {
    if (/m[aá]x\.?\s*2|max\s*2/i.test(text)) mode = 'max2';
    else if (/m[aá]x\.?\s*3|max\s*3/i.test(text)) mode = 'max3';
    else if (/des|dex/i.test(text)) mode = 'full';
    else if (isShieldItem(item)) mode = 'none';
  }

  let ac = base;
  if (mode === 'full') ac += dexMod;
  else if (mode === 'max2') ac += Math.min(dexMod, 2);
  else if (mode === 'max3') ac += Math.min(dexMod, 3);

  return ac;
}

export function computeArmorClass(character: Character): number {
  const dex = getModifier(character.abilityScores.dex);
  const con = getModifier(character.abilityScores.con);
  const wis = getModifier(character.abilityScores.wis);
  const equipped = (character.inventory || []).filter((i) => i.equipped);

  let shieldBonus = 0;
  let bestArmor: number | null = null;

  for (const item of equipped) {
    if (isShieldItem(item)) {
      const ac = itemToAC(item, dex);
      shieldBonus = Math.max(shieldBonus, ac ?? 2);
      continue;
    }
    if (!isArmorItem(item)) continue;
    const ac = itemToAC(item, dex);
    if (ac == null) continue;
    bestArmor = bestArmor == null ? ac : Math.max(bestArmor, ac);
  }

  if (bestArmor != null) return bestArmor + shieldBonus;

  const classId = (character.classId || character.class || '').toLowerCase();
  const cname = (character.class || '').toLowerCase();
  if (classId.includes('barb') || cname.includes('bárbar') || cname.includes('barbar')) {
    return 10 + dex + con + shieldBonus;
  }
  if (classId.includes('monk') || cname.includes('monje')) {
    return 10 + dex + wis + shieldBonus;
  }
  return 10 + dex + shieldBonus;
}
