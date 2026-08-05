import type { InventoryItem } from '../types/dnd';
import { resolveArmorStats } from '../data/armorCatalog';
import { armorStealthNote } from './equipmentEffects';

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
  'equipo de ladrón': [
    { name: 'Mochila', quantity: 1 },
    { name: 'Bolsa de 1000 bolitas de metal', quantity: 1 },
    { name: 'Cuerda de seda (50 ft)', quantity: 1 },
    { name: 'Campanilla', quantity: 1 },
    { name: 'Linterna de oclusión', quantity: 1 },
    { name: 'Aceite (frascos)', quantity: 2 },
    { name: 'Velas', quantity: 5 },
    { name: 'Yesquero', quantity: 1 },
    { name: 'Raciones (1 día)', quantity: 5 },
    { name: 'Odre', quantity: 1 },
  ],
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .trim();
}

export function expandPackItems(name: string): Omit<InventoryItem, 'id'>[] | null {
  const key = norm(name);

  for (const [packKey, items] of Object.entries(EQUIPMENT_PACKS)) {
    const pk = norm(packKey);
    if (key === pk || key.includes(pk) || pk.includes(key)) return items;
    const short = pk.replace('equipo de ', '');
    if (short && (key.includes(short) || key.endsWith(short))) return items;
  }
  if (/dungeoneer/.test(key)) return EQUIPMENT_PACKS['equipo de dungeoneer'];
  if (/explorer|explorador/.test(key)) return EQUIPMENT_PACKS['equipo de explorador'];
  if (/priest|sacerdote/.test(key)) return EQUIPMENT_PACKS['equipo de sacerdote'];
  if (/diplomat|diplomatico/.test(key)) return EQUIPMENT_PACKS['equipo de diplomático'];
  if (/entertainer|artista/.test(key)) return EQUIPMENT_PACKS['equipo de artista'];
  if (/scholar|erudito/.test(key)) return EQUIPMENT_PACKS['equipo de erudito'];
  if (/burglar|criminal|ladron|thieves'? pack/.test(key)) return EQUIPMENT_PACKS['equipo de ladrón'];
  return null;
}

/** Combos de equipo inicial del tipo "Arma + escudo", "Ballesta + 20 virotes", etc. */
const COMPOSITE_OPTIONS: Record<string, Omit<InventoryItem, 'id'>[]> = {
  'arma marcial + escudo': [
    {
      name: 'Arma marcial (elegir)',
      quantity: 1,
      damage: '1d8',
      damageType: 'cortante',
      equipped: true,
      proficient: true,
    },
    {
      name: 'Escudo',
      quantity: 1,
      armorClass: '2',
      armorDexMod: 'none',
      equipped: true,
      description: '+2 CA',
    },
  ],
  'dos armas marciales': [
    {
      name: 'Arma marcial (1)',
      quantity: 1,
      damage: '1d8',
      damageType: 'cortante',
      equipped: true,
      proficient: true,
    },
    {
      name: 'Arma marcial (2)',
      quantity: 1,
      damage: '1d8',
      damageType: 'cortante',
      equipped: true,
      proficient: true,
    },
  ],
  'dos espadas cortas': [
    {
      name: 'Espada corta',
      quantity: 2,
      damage: '1d6',
      damageType: 'perforante',
      properties: ['ligera', 'sutil'],
      equipped: true,
      proficient: true,
    },
  ],
  'dos armas simples cuerpo a cuerpo': [
    {
      name: 'Arma simple cuerpo a cuerpo (1)',
      quantity: 1,
      damage: '1d6',
      damageType: 'contundente',
      equipped: true,
      proficient: true,
    },
    {
      name: 'Arma simple cuerpo a cuerpo (2)',
      quantity: 1,
      damage: '1d6',
      damageType: 'contundente',
      equipped: true,
      proficient: true,
    },
  ],
  'dos hachas de mano': [
    {
      name: 'Hacha de mano',
      quantity: 2,
      damage: '1d6',
      damageType: 'cortante',
      properties: ['ligera', 'arrojadiza (20/60)'],
      equipped: true,
      proficient: true,
    },
  ],
  'ballesta ligera + 20 virotes': [
    {
      name: 'Ballesta ligera',
      quantity: 1,
      damage: '1d8',
      damageType: 'perforante',
      properties: ['munición (80/320)', 'de carga', 'a dos manos'],
      equipped: true,
      proficient: true,
    },
    { name: 'Virotes', quantity: 20 },
  ],
  'arco corto + 20 flechas': [
    {
      name: 'Arco corto',
      quantity: 1,
      damage: '1d6',
      damageType: 'perforante',
      properties: ['munición (80/320)', 'a dos manos'],
      equipped: true,
      proficient: true,
    },
    { name: 'Flechas', quantity: 20 },
  ],
  'arco largo + 20 flechas': [
    {
      name: 'Arco largo',
      quantity: 1,
      damage: '1d8',
      damageType: 'perforante',
      properties: ['munición (150/600)', 'pesada', 'a dos manos'],
      equipped: true,
      proficient: true,
    },
    { name: 'Flechas', quantity: 20 },
  ],
  'armadura de cuero + arco largo + 20 flechas': [
    {
      name: 'Armadura de cuero',
      quantity: 1,
      armorClass: '11',
      armorDexMod: 'full',
      equipped: true,
    },
    {
      name: 'Arco largo',
      quantity: 1,
      damage: '1d8',
      damageType: 'perforante',
      properties: ['munición (150/600)', 'pesada', 'a dos manos'],
      equipped: true,
      proficient: true,
    },
    { name: 'Flechas', quantity: 20 },
  ],
};

function expandComposite(name: string): Omit<InventoryItem, 'id'>[] | null {
  const key = norm(name);
  // Nunca expandir placeholders genéricos de arma — el wizard debe resolver el arma concreta
  if (/arma marcial|armas marciales|arma simple|armas simples|cualquier arma/i.test(name) &&
      !/espada|hacha|maza|arco|ballesta|estoque|daga|cimitarra/i.test(name)) {
    return null;
  }
  for (const [k, items] of Object.entries(COMPOSITE_OPTIONS)) {
    if (key === norm(k) || key.includes(norm(k)) || norm(k).includes(key)) return items;
  }
  // Generic "X + Y + Z" split for remaining patterns
  if (/\+/.test(name) && !/^\d/.test(name)) {
    const parts = name.split(/\s*\+\s*/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const out: Omit<InventoryItem, 'id'>[] = [];
      for (const part of parts) {
        const sub = expandPackItems(part) || expandComposite(part);
        if (sub) out.push(...sub);
        else {
          // "20 flechas" / "20 virotes"
          const ammo = part.match(/^(\d+)\s+(.+)$/i);
          if (ammo) {
            out.push({ name: ammo[2], quantity: parseInt(ammo[1], 10) });
          } else {
            out.push({
              name: part,
              quantity: 1,
              proficient: /arma|espada|hacha|arco|ballesta|maza|lanza|daga|escudo/i.test(part),
              damage: /arma|espada|hacha|arco|ballesta|maza|lanza|daga/i.test(part)
                ? '1d8'
                : undefined,
              damageType: /arco|ballesta|daga|lanza/i.test(part)
                ? 'perforante'
                : /espada|hacha/i.test(part)
                ? 'cortante'
                : undefined,
              armorClass: /escudo/i.test(part) ? '2' : /armadura|cuero|cota|placa/i.test(part) ? '11' : undefined,
              armorDexMod: /escudo/i.test(part)
                ? 'none'
                : /cuero|acolchada/i.test(part)
                ? 'full'
                : /cota|media/i.test(part)
                ? 'max2'
                : undefined,
              equipped: /arma|escudo|armadura|arco|ballesta/i.test(part),
            });
          }
        }
      }
      return out.length ? out : null;
    }
  }
  return null;
}

/**
 * Expande una opción de equipo inicial (paquete, combo o ítem suelto)
 * a una lista de filas de inventario.
 */
export function expandStartingOption(raw: {
  name?: string;
  quantity?: number;
  description?: string;
  damage?: string;
  damageType?: string;
  properties?: string[];
  armorClass?: string;
  armorDexMod?: InventoryItem['armorDexMod'];
  equipped?: boolean;
  proficient?: boolean | null;
  items?: Omit<InventoryItem, 'id'>[];
}): Omit<InventoryItem, 'id'>[] {
  if (raw.items && raw.items.length) return raw.items.map(enrichArmor);

  let name = (raw.name || '').trim();
  // "Hacha de Mano (x2)" → quantity 2, nombre limpio
  let qty = raw.quantity || 1;
  const x2 = name.match(/^(.*?)\s*\(x\s*(\d+)\)\s*$/i) || name.match(/^(.*?)\s*x\s*(\d+)\s*$/i);
  if (x2) {
    name = x2[1].trim();
    qty = parseInt(x2[2], 10) || qty;
  }

  const pack = expandPackItems(name);
  if (pack) return pack.map(enrichArmor);

  const composite = expandComposite(name);
  if (composite) return composite.map(enrichArmor);

  const base: Omit<InventoryItem, 'id'> = enrichArmor({
    name: name || 'Objeto',
    quantity: 1,
    description: raw.description,
    damage: raw.damage,
    damageType: raw.damageType,
    properties: raw.properties,
    armorClass: raw.armorClass,
    armorDexMod: raw.armorDexMod,
    equipped: raw.equipped,
    proficient: raw.proficient ?? !!raw.damage,
  });

  // Cantidad > 1 → una fila por unidad (armas) o una fila con quantity (munición/consumibles)
  const isAmmo = /flecha|virote|racion|piton|antorcha|vela|dardo/i.test(name);
  if (qty > 1 && !isAmmo) {
    return Array.from({ length: qty }, () => ({ ...base, quantity: 1 }));
  }
  return [{ ...base, quantity: qty }];
}

function enrichArmor(item: Omit<InventoryItem, 'id'>): Omit<InventoryItem, 'id'> {
  const stealth = armorStealthNote(item as InventoryItem);
  let description = item.description;
  if (stealth && !(description || '').toLowerCase().includes('sigilo')) {
    description = description ? `${description}. ${stealth}` : stealth;
  }
  if (item.armorClass) return { ...item, description };
  const stats = resolveArmorStats(item.name, item.description);
  if (!stats) return { ...item, description };
  return {
    ...item,
    description,
    armorClass: stats.armorClass,
    armorDexMod: stats.armorDexMod,
    equipped: item.equipped ?? /armadura|cota|cuero|escudo|placa|coraza/i.test(item.name),
  };
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

/** Human-readable summary of pack / composite contents for UI */
export function packSummary(name: string): string | null {
  const items = expandPackItems(name) || expandComposite(name) || expandStartingOption({ name });
  if (!items || items.length <= 1) {
    // only show summary for multi-item expansions
    const multi = expandPackItems(name) || expandComposite(name);
    if (!multi || multi.length <= 1) return null;
  }
  const multi = expandPackItems(name) || expandComposite(name);
  if (!multi) return null;
  return multi
    .map((i) => (i.quantity && i.quantity > 1 ? `${i.name} ×${i.quantity}` : i.name))
    .join(', ');
}
