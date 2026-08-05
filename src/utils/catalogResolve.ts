import type { InventoryItem, Item, Spell } from '../types/dnd';

/**
 * Merge a character inventory row with the live catalog entry (if linked).
 * Character keeps quantity, equipped, proficient; stats come from catalog when catalogId is set.
 */
export function resolveInventoryItem(
  item: InventoryItem,
  catalog: Item[]
): InventoryItem & { nameEn?: string } {
  if (!item.catalogId) {
    // try match by name for legacy items
    const byName = catalog.find(
      (c) => c.name.toLowerCase() === item.name.toLowerCase()
    );
    if (!byName) return item;
    return {
      ...item,
      name: byName.name,
      description: byName.description || item.description,
      damage: byName.damage ?? item.damage,
      damageType: byName.damageType ?? item.damageType,
      properties: byName.properties ?? item.properties,
      armorClass: byName.armorClass ?? item.armorClass,
      armorDexMod: byName.armorDexMod ?? item.armorDexMod,
      weight: byName.weight ?? item.weight,
      nameEn: byName.nameEn,
      catalogId: byName.id,
    };
  }
  const cat = catalog.find((c) => c.id === item.catalogId);
  if (!cat) return item;
  return {
    ...item,
    name: cat.name,
    description: cat.description || item.description,
    damage: cat.damage ?? item.damage,
    damageType: cat.damageType ?? item.damageType,
    properties: cat.properties ?? item.properties,
    armorClass: cat.armorClass ?? item.armorClass,
    armorDexMod: cat.armorDexMod ?? item.armorDexMod,
    weight: cat.weight ?? item.weight,
    nameEn: cat.nameEn,
  };
}

export function resolveSpell(
  spellId: string,
  catalog: Spell[]
): Spell | undefined {
  return catalog.find((s) => s.id === spellId);
}
