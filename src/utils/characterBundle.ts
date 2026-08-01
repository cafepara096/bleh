import type { Character, RaceData, ClassData, Item, Spell } from '../types/dnd';

const KEYS = {
  races: 'dnd-homebrew-races',
  classes: 'dnd-homebrew-classes',
  items: 'dnd-homebrew-items',
  spells: 'dnd-homebrew-spells',
  backgrounds: 'dnd-homebrew-backgrounds',
} as const;

function readArr<T>(key: string): T[] {
  try {
    const s = localStorage.getItem(key);
    if (!s) return [];
    const d = JSON.parse(s);
    return Array.isArray(d) ? d : [];
  } catch {
    return [];
  }
}

function writeArrMerge<T extends { id: string }>(key: string, incoming: T[]) {
  if (!incoming?.length) return 0;
  const existing = readArr<T>(key);
  const map = new Map(existing.map((x) => [x.id, x]));
  let n = 0;
  for (const item of incoming) {
    if (!item?.id) continue;
    if (!map.has(item.id)) n++;
    map.set(item.id, item);
  }
  localStorage.setItem(key, JSON.stringify(Array.from(map.values())));
  return n;
}

export type HomebrewPack = {
  races: RaceData[];
  classes: ClassData[];
  items: Item[];
  spells: Spell[];
  backgrounds: unknown[];
};

/** Recolecta homebrew local relacionado con el personaje */
export function collectHomebrewForCharacter(character: Character): HomebrewPack {
  const races = readArr<RaceData>(KEYS.races).filter(
    (r) =>
      r.id === character.raceId ||
      r.name === character.race ||
      (r.homebrew && (r.id === character.raceId || r.name === character.race))
  );
  const classes = readArr<ClassData>(KEYS.classes).filter(
    (c) =>
      c.id === character.classId ||
      c.name === character.class ||
      c.subclasses?.some((s) => s.id === character.subclassId || s.name === character.subclass)
  );

  const invIds = new Set(
    (character.inventory || [])
      .map((i) => (i as { catalogId?: string }).catalogId || i.id)
      .filter(Boolean) as string[]
  );
  const finalItems = readArr<Item>(KEYS.items).filter((it) => invIds.has(it.id));

  const spellIds = new Set((character.spells || []).map((s) => s.spellId));
  const spells = readArr<Spell>(KEYS.spells).filter((s) => spellIds.has(s.id));

  const backgrounds = readArr<{ id: string; name: string; homebrew?: boolean }>(KEYS.backgrounds).filter(
    (b) => b.id === character.backgroundId || b.name === character.background
  );

  return {
    races,
    classes,
    items: finalItems,
    spells,
    backgrounds,
  };
}

export type CharacterBundle = {
  version: 2;
  type: 'dnd-character-bundle';
  character: Character;
  homebrew?: Partial<HomebrewPack>;
  exportedAt: string;
};

export function describePack(pack: HomebrewPack): string {
  const parts: string[] = [];
  if (pack.races.length) parts.push(`${pack.races.length} raza(s)`);
  if (pack.classes.length) parts.push(`${pack.classes.length} clase(s)`);
  if (pack.items.length) parts.push(`${pack.items.length} objeto(s)`);
  if (pack.spells.length) parts.push(`${pack.spells.length} conjuro(s)`);
  if (pack.backgrounds.length) parts.push(`${pack.backgrounds.length} trasfondo(s)`);
  return parts.join(', ') || 'ninguno';
}

/** Pregunta qué homebrew incluir y descarga el JSON */
export function exportCharacterWithPrompt(character: Character) {
  const pack = collectHomebrewForCharacter(character);
  const hasAny =
    pack.races.length +
      pack.classes.length +
      pack.items.length +
      pack.spells.length +
      pack.backgrounds.length >
    0;

  let homebrew: Partial<HomebrewPack> | undefined;
  if (hasAny) {
    const ok = confirm(
      `Este personaje usa o tiene disponible contenido homebrew local:\n` +
        `· ${describePack(pack)}\n\n` +
        `¿Incluir ese contenido en el archivo de exportación?\n` +
        `(Así al importarlo en otro navegador se cargará automáticamente en Razas, Clases, Objetos y Conjuros.)`
    );
    if (ok) {
      homebrew = {};
      if (pack.races.length && confirm(`¿Incluir raza(s) homebrew? (${pack.races.map((r) => r.name).join(', ')})`))
        homebrew.races = pack.races;
      if (pack.classes.length && confirm(`¿Incluir clase(s)/subclase homebrew? (${pack.classes.map((c) => c.name).join(', ')})`))
        homebrew.classes = pack.classes;
      if (pack.items.length && confirm(`¿Incluir objeto(s) del catálogo homebrew usados en el inventario? (${pack.items.length})`))
        homebrew.items = pack.items;
      if (pack.spells.length && confirm(`¿Incluir conjuro(s) homebrew del personaje? (${pack.spells.length})`))
        homebrew.spells = pack.spells;
      if (pack.backgrounds.length && confirm(`¿Incluir trasfondo(s) homebrew? (${pack.backgrounds.map((b) => (b as { name: string }).name).join(', ')})`))
        homebrew.backgrounds = pack.backgrounds;
      if (
        !homebrew.races?.length &&
        !homebrew.classes?.length &&
        !homebrew.items?.length &&
        !homebrew.spells?.length &&
        !homebrew.backgrounds?.length
      ) {
        homebrew = undefined;
      }
    }
  }

  const bundle: CharacterBundle = {
    version: 2,
    type: 'dnd-character-bundle',
    character,
    homebrew,
    exportedAt: new Date().toISOString(),
  };

  const dataStr = JSON.stringify(bundle, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${character.name.replace(/\s+/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Importa personaje (+ homebrew embebido) y fusiona catálogos */
export function importCharacterBundle(data: unknown): Character {
  let character: Character;
  let homebrew: Partial<HomebrewPack> | undefined;

  if (data && typeof data === 'object' && (data as CharacterBundle).type === 'dnd-character-bundle') {
    const b = data as CharacterBundle;
    character = b.character;
    homebrew = b.homebrew;
  } else if (data && typeof data === 'object' && (data as Character).name && (data as Character).abilityScores) {
    character = data as Character;
    // legacy: optional top-level homebrew
    homebrew = (data as { homebrew?: Partial<HomebrewPack> }).homebrew;
  } else {
    throw new Error('Archivo de personaje inválido');
  }

  if (homebrew) {
    const summary: string[] = [];
    if (homebrew.races?.length) summary.push(`${homebrew.races.length} raza(s)`);
    if (homebrew.classes?.length) summary.push(`${homebrew.classes.length} clase(s)`);
    if (homebrew.items?.length) summary.push(`${homebrew.items.length} objeto(s)`);
    if (homebrew.spells?.length) summary.push(`${homebrew.spells.length} conjuro(s)`);
    if (homebrew.backgrounds?.length) summary.push(`${homebrew.backgrounds.length} trasfondo(s)`);
    if (summary.length) {
      const ok = confirm(
        `El archivo incluye contenido homebrew:\n· ${summary.join(', ')}\n\n` +
          `¿Guardarlo en esta app (Razas / Clases / Objetos / Conjuros)?\n` +
          `Así el personaje no perderá referencias al abrirlo.`
      );
      if (ok) {
        if (homebrew.races) writeArrMerge(KEYS.races, homebrew.races);
        if (homebrew.classes) writeArrMerge(KEYS.classes, homebrew.classes);
        if (homebrew.items) writeArrMerge(KEYS.items, homebrew.items);
        if (homebrew.spells) writeArrMerge(KEYS.spells, homebrew.spells);
        if (homebrew.backgrounds)
          writeArrMerge(KEYS.backgrounds, homebrew.backgrounds as { id: string }[]);
      }
    }
  }

  return {
    ...character,
    id: character.id || crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
  };
}
