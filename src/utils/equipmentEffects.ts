import type { Character, InventoryItem } from '../types/dnd';

export type EquipmentPenalty = {
  id: string;
  sourceItemId: string;
  sourceName: string;
  /** Qué afecta */
  label: string;
  kind: 'disadvantage' | 'note';
};

/** Efectos automáticos de equipo equipado (PHB: armadura pesada → desventaja en Sigilo, etc.) */
export function getEquippedPenalties(character: Character): EquipmentPenalty[] {
  const out: EquipmentPenalty[] = [];
  for (const item of character.inventory || []) {
    if (!item.equipped) continue;
    const name = item.name || '';
    const desc = (item.description || '').toLowerCase();
    const props = (item.properties || []).map((p) => p.toLowerCase());
    const blob = `${name} ${desc} ${props.join(' ')}`.toLowerCase();

    const isHeavyArmor =
      /cota de mallas|chain mail|f[eé]rrea|splint|placas|plate|anillas|ring mail/i.test(name) ||
      /armadura pesada|desventaja.*sigilo|stealth.*disadvantage/i.test(blob);

    if (isHeavyArmor || /desventaja (en |a )?sigilo|stealth/i.test(desc)) {
      out.push({
        id: `stealth-dis-${item.id}`,
        sourceItemId: item.id,
        sourceName: name,
        label: 'Desventaja en pruebas de Sigilo',
        kind: 'disadvantage',
      });
    }

    // Propiedad o texto explícito
    for (const p of props) {
      if (/desventaja/.test(p)) {
        out.push({
          id: `prop-${item.id}-${p}`,
          sourceItemId: item.id,
          sourceName: name,
          label: p,
          kind: 'disadvantage',
        });
      }
    }
    if (/desventaja en ([^.]+)/i.test(desc)) {
      const m = desc.match(/desventaja en ([^.]+)/i);
      if (m && !isHeavyArmor) {
        out.push({
          id: `desc-${item.id}`,
          sourceItemId: item.id,
          sourceName: name,
          label: `Desventaja en ${m[1].trim()}`,
          kind: 'disadvantage',
        });
      }
    }
  }
  return out;
}

/** Enrich armor items with stealth disadvantage note when heavy */
export function armorStealthNote(item: InventoryItem): string | undefined {
  if (/cota de mallas|chain mail|f[eé]rrea|splint|placas|plate|anillas/i.test(item.name)) {
    return 'Desventaja en pruebas de Sigilo';
  }
  return undefined;
}
