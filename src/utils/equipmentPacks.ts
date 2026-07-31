import type { InventoryItem } from '../types/dnd';

/** Expand "Equipo de dungeoneer" etc. into individual inventory items (PHB-style). */
export const EQUIPMENT_PACKS: Record<string, Omit<InventoryItem, 'id'>[]> = {
  'equipo de dungeoneer': [
    { name: 'Mochila', quantity: 1 },
    { name: 'Martillo', quantity: 1, damage: '1d4', damageType: 'contundente', properties: ['ligera'] },
    { name: 'Pitones', quantity: 10 },
    { name: 'Antorchas', quantity: 10 },
    { name: 'Yesquero', quantity: 1 },
    { name: 'Raciones (1 día)', quantity: 10 },
    { name: 'Odre', quantity: 1 },
    { name: 'Cuerda de cáñamo (50 ft)', quantity: 1 },
  ],
  'equipo de explorador': [
    { name: 'Mochila', quantity: 1 },
    { name: 'Saco de dormir', quantity: 1 },
    { name: 'Cubiertos', quantity: 1 },
    { name: 'Yesquero', quantity: 1 },
    { name: 'Antorchas', quantity: 10 },
    { name: 'Raciones (1 día)', quantity: 10 },
    { name: 'Odre', quantity: 1 },
    { name: 'Cuerda de cáñamo (50 ft)', quantity: 1 },
  ],
  'equipo de sacerdote': [
    { name: 'Mochila', quantity: 1 },
    { name: 'Manta', quantity: 1 },
    { name: 'Velas', quantity: 10 },
    { name: 'Yesquero', quantity: 1 },
    { name: 'Caja de limosnas', quantity: 1 },
    { name: 'Incienso', quantity: 2 },
    { name: 'Incensario', quantity: 1 },
    { name: 'Raciones (1 día)', quantity: 2 },
    { name: 'Odre', quantity: 1 },
  ],
  'equipo de diplomático': [
    { name: 'Cofre', quantity: 1 },
    { name: 'Estuches de mapas o pergaminos', quantity: 2 },
    { name: 'Ropa fina', quantity: 1 },
    { name: 'Tinta', quantity: 1 },
    { name: 'Pluma', quantity: 1 },
    { name: 'Lámpara', quantity: 1 },
    { name: 'Aceite (frascos)', quantity: 2 },
    { name: 'Papel (hojas)', quantity: 5 },
    { name: 'Perfume', quantity: 1 },
    { name: 'Cera para sellar', quantity: 1 },
    { name: 'Jabón', quantity: 1 },
  ],
  'equipo de artista': [
    { name: 'Mochila', quantity: 1 },
    { name: 'Saco de dormir', quantity: 1 },
    { name: 'Disfraces', quantity: 2 },
    { name: 'Velas', quantity: 5 },
    { name: 'Raciones (1 día)', quantity: 5 },
    { name: 'Odre', quantity: 1 },
  ],
  'equipo de erudito': [
    { name: 'Mochila', quantity: 1 },
    { name: 'Libro de estudio', quantity: 1 },
    { name: 'Tinta', quantity: 1 },
    { name: 'Pluma', quantity: 1 },
    { name: 'Pergamino (hojas)', quantity: 10 },
    { name: 'Bolsita de arena', quantity: 1 },
    { name: 'Cuchillo pequeño', quantity: 1 },
  ],
  'equipo de criminal': [
    { name: 'Mochila', quantity: 1 },
    { name: 'Pata de cabra', quantity: 1 },
    { name: 'Ropa común con capucha', quantity: 1 },
  ],
};

export function expandPackItems(name: string): Omit<InventoryItem, 'id'>[] | null {
  const key = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .trim();

  for (const [packKey, items] of Object.entries(EQUIPMENT_PACKS)) {
    const pk = packKey.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (key.includes(pk) || pk.includes(key) || key.includes(pk.replace('equipo de ', ''))) {
      return items;
    }
  }
  // English fallbacks
  if (/dungeoneer/.test(key)) return EQUIPMENT_PACKS['equipo de dungeoneer'];
  if (/explorer/.test(key)) return EQUIPMENT_PACKS['equipo de explorador'];
  if (/priest/.test(key)) return EQUIPMENT_PACKS['equipo de sacerdote'];
  if (/diplomat/.test(key)) return EQUIPMENT_PACKS['equipo de diplomático'];
  if (/entertainer|artista/.test(key)) return EQUIPMENT_PACKS['equipo de artista'];
  if (/scholar|erudito/.test(key)) return EQUIPMENT_PACKS['equipo de erudito'];
  if (/burglar|criminal/.test(key)) return EQUIPMENT_PACKS['equipo de criminal'];
  return null;
}

export function toInventoryItems(
  partials: Omit<InventoryItem, 'id'>[],
  opts?: { proficient?: boolean }
): InventoryItem[] {
  return partials.map((p) => ({
    ...p,
    id: crypto.randomUUID(),
    quantity: p.quantity || 1,
    proficient: p.proficient ?? opts?.proficient ?? !!p.damage,
  }));
}

/** Human-readable summary of pack contents for UI */
export function packSummary(name: string): string | null {
  const items = expandPackItems(name);
  if (!items) return null;
  return items
    .map((i) => (i.quantity && i.quantity > 1 ? `${i.name} ×${i.quantity}` : i.name))
    .join(', ');
}
