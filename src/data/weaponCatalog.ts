/** Armas simples y marciales (resumen PHB 2024 / SRD) para elecciones de equipo */
export type WeaponPick = {
  id: string;
  name: string;
  damage: string;
  damageType: string;
  properties?: string[];
  category: 'simple-melee' | 'simple-ranged' | 'martial-melee' | 'martial-ranged';
};

export const SIMPLE_MELEE: WeaponPick[] = [
  { id: 'club', name: 'Garrote', damage: '1d4', damageType: 'contundente', properties: ['ligera'], category: 'simple-melee' },
  { id: 'dagger', name: 'Daga', damage: '1d4', damageType: 'perforante', properties: ['sutil', 'ligera', 'arrojadiza (20/60)'], category: 'simple-melee' },
  { id: 'greatclub', name: 'Garrote grande', damage: '1d8', damageType: 'contundente', properties: ['a dos manos'], category: 'simple-melee' },
  { id: 'handaxe', name: 'Hacha de mano', damage: '1d6', damageType: 'cortante', properties: ['ligera', 'arrojadiza (20/60)'], category: 'simple-melee' },
  { id: 'javelin', name: 'Jabalina', damage: '1d6', damageType: 'perforante', properties: ['arrojadiza (30/120)'], category: 'simple-melee' },
  { id: 'light-hammer', name: 'Martillo ligero', damage: '1d4', damageType: 'contundente', properties: ['ligera', 'arrojadiza (20/60)'], category: 'simple-melee' },
  { id: 'mace', name: 'Maza', damage: '1d6', damageType: 'contundente', category: 'simple-melee' },
  { id: 'quarterstaff', name: 'Bastón', damage: '1d6', damageType: 'contundente', properties: ['versátil (1d8)'], category: 'simple-melee' },
  { id: 'sickle', name: 'Hoz', damage: '1d4', damageType: 'cortante', properties: ['ligera'], category: 'simple-melee' },
  { id: 'spear', name: 'Lanza', damage: '1d6', damageType: 'perforante', properties: ['arrojadiza (20/60)', 'versátil (1d8)'], category: 'simple-melee' },
];

export const SIMPLE_RANGED: WeaponPick[] = [
  { id: 'light-crossbow', name: 'Ballesta ligera', damage: '1d8', damageType: 'perforante', properties: ['munición (80/320)', 'de carga', 'a dos manos'], category: 'simple-ranged' },
  { id: 'dart', name: 'Dardo', damage: '1d4', damageType: 'perforante', properties: ['sutil', 'arrojadiza (20/60)'], category: 'simple-ranged' },
  { id: 'shortbow', name: 'Arco corto', damage: '1d6', damageType: 'perforante', properties: ['munición (80/320)', 'a dos manos'], category: 'simple-ranged' },
  { id: 'sling', name: 'Honda', damage: '1d4', damageType: 'contundente', properties: ['munición (30/120)'], category: 'simple-ranged' },
];

export const MARTIAL_MELEE: WeaponPick[] = [
  { id: 'battleaxe', name: 'Hacha de batalla', damage: '1d8', damageType: 'cortante', properties: ['versátil (1d10)'], category: 'martial-melee' },
  { id: 'flail', name: 'Mayal', damage: '1d8', damageType: 'contundente', category: 'martial-melee' },
  { id: 'glaive', name: 'Guja', damage: '1d10', damageType: 'cortante', properties: ['pesada', 'alcance', 'a dos manos'], category: 'martial-melee' },
  { id: 'greataxe', name: 'Hacha grande', damage: '1d12', damageType: 'cortante', properties: ['pesada', 'a dos manos'], category: 'martial-melee' },
  { id: 'greatsword', name: 'Espada grande', damage: '2d6', damageType: 'cortante', properties: ['pesada', 'a dos manos'], category: 'martial-melee' },
  { id: 'halberd', name: 'Alabarda', damage: '1d10', damageType: 'cortante', properties: ['pesada', 'alcance', 'a dos manos'], category: 'martial-melee' },
  { id: 'lance', name: 'Lanza de caballería', damage: '1d12', damageType: 'perforante', properties: ['alcance', 'especial'], category: 'martial-melee' },
  { id: 'longsword', name: 'Espada larga', damage: '1d8', damageType: 'cortante', properties: ['versátil (1d10)'], category: 'martial-melee' },
  { id: 'maul', name: 'Martillo de guerra grande', damage: '2d6', damageType: 'contundente', properties: ['pesada', 'a dos manos'], category: 'martial-melee' },
  { id: 'morningstar', name: 'Lucero del alba', damage: '1d8', damageType: 'perforante', category: 'martial-melee' },
  { id: 'pike', name: 'Pica', damage: '1d10', damageType: 'perforante', properties: ['pesada', 'alcance', 'a dos manos'], category: 'martial-melee' },
  { id: 'rapier', name: 'Estoque', damage: '1d8', damageType: 'perforante', properties: ['sutil'], category: 'martial-melee' },
  { id: 'scimitar', name: 'Cimitarra', damage: '1d6', damageType: 'cortante', properties: ['sutil', 'ligera'], category: 'martial-melee' },
  { id: 'shortsword', name: 'Espada corta', damage: '1d6', damageType: 'perforante', properties: ['sutil', 'ligera'], category: 'martial-melee' },
  { id: 'trident', name: 'Tridente', damage: '1d6', damageType: 'perforante', properties: ['arrojadiza (20/60)', 'versátil (1d8)'], category: 'martial-melee' },
  { id: 'war-pick', name: 'Pico de guerra', damage: '1d8', damageType: 'perforante', category: 'martial-melee' },
  { id: 'warhammer', name: 'Martillo de guerra', damage: '1d8', damageType: 'contundente', properties: ['versátil (1d10)'], category: 'martial-melee' },
  { id: 'whip', name: 'Látigo', damage: '1d4', damageType: 'cortante', properties: ['sutil', 'alcance'], category: 'martial-melee' },
];

export const MARTIAL_RANGED: WeaponPick[] = [
  { id: 'blowgun', name: 'Cerbatana', damage: '1', damageType: 'perforante', properties: ['munición (25/100)', 'de carga'], category: 'martial-ranged' },
  { id: 'hand-crossbow', name: 'Ballesta de mano', damage: '1d6', damageType: 'perforante', properties: ['munición (30/120)', 'ligera', 'de carga'], category: 'martial-ranged' },
  { id: 'heavy-crossbow', name: 'Ballesta pesada', damage: '1d10', damageType: 'perforante', properties: ['munición (100/400)', 'pesada', 'de carga', 'a dos manos'], category: 'martial-ranged' },
  { id: 'longbow', name: 'Arco largo', damage: '1d8', damageType: 'perforante', properties: ['munición (150/600)', 'pesada', 'a dos manos'], category: 'martial-ranged' },
  { id: 'net', name: 'Red', damage: '—', damageType: '—', properties: ['especial', 'arrojadiza (5/15)'], category: 'martial-ranged' },
];

export function weaponsForChoice(optionName: string): WeaponPick[] {
  const n = optionName.toLowerCase();
  if (/marcial/.test(n) && /distancia|ranged|a distancia/.test(n)) return MARTIAL_RANGED;
  if (/simple/.test(n) && /distancia|ranged|a distancia/.test(n)) return SIMPLE_RANGED;
  if (/cuerpo a cuerpo|melee/.test(n) && /marcial/.test(n)) return MARTIAL_MELEE;
  if (/cuerpo a cuerpo|melee/.test(n) && /simple/.test(n)) return SIMPLE_MELEE;
  if (/marcial/.test(n)) return [...MARTIAL_MELEE, ...MARTIAL_RANGED];
  if (/simple|cualquier arma simple/.test(n)) return [...SIMPLE_MELEE, ...SIMPLE_RANGED];
  if (/cualquier arma(?! simple)/.test(n)) return [...SIMPLE_MELEE, ...SIMPLE_RANGED, ...MARTIAL_MELEE, ...MARTIAL_RANGED];
  return [];
}

/** Opciones genéricas que requieren elegir arma(s) del catálogo */
export function needsWeaponPick(optionName: string): boolean {
  const n = optionName.toLowerCase();
  // Ya es un arma concreta conocida
  if (
    /espada|hacha grande|hacha de mano|maza|arco|ballesta|estoque|daga|jabalina|bast[oó]n|cimitarra|guja|alabarda|pica|mayal|lucero|tridente|l[aá]tigo|garrote|hoz|honda|dardo|red|cerbatana|martillo de guerra|pico de guerra/i.test(
      n
    ) && !/arma marcial|arma simple|cualquier arma|dos armas/.test(n)
  ) {
    return false;
  }
  return (
    /arma marcial|armas marciales|arma simple|armas simples|cualquier arma|dos armas/i.test(n) &&
    weaponsForChoice(optionName).length > 0
  );
}

/** Cuántas armas hay que elegir (1 o 2) */
export function weaponPickCount(optionName: string): number {
  const n = optionName.toLowerCase();
  if (/dos armas|2 armas|x2/.test(n)) return 2;
  return 1;
}

/** La opción también incluye escudo */
export function optionIncludesShield(optionName: string): boolean {
  return /escudo|shield/i.test(optionName);
}
