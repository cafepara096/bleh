import type { Character, ClassData, RaceData, Spell } from '../types/dnd';
import {
  toCharacterFeatures,
  featuresUpToLevel,
  computeFeatureMaxUses,
} from './characterBuilder';

/** Añade usos/actionType desde el catálogo de clase/raza/subclase si faltan en la hoja */
export function syncFeatureUsesFromCatalog(
  character: Character,
  classData?: ClassData | null,
  raceData?: RaceData | null
): Character {
  const catalogFeats = [
    ...(classData ? featuresUpToLevel(classData.features || [], character.level) : []),
    ...(raceData ? featuresUpToLevel(raceData.traits || [], character.level) : []),
    ...(classData?.subclasses || [])
      .filter((s) => s.id === character.subclassId || s.name === character.subclass)
      .flatMap((s) => featuresUpToLevel(s.features || [], character.level)),
  ];

  const byId = new Map(catalogFeats.map((f) => [f.id, f]));
  const byName = new Map(catalogFeats.map((f) => [f.name.toLowerCase(), f]));

  let changed = false;
  const features = character.features.map((cf) => {
    const entry = byId.get(cf.id) || byName.get(cf.name.toLowerCase());
    if (!entry) return cf;
    let next = { ...cf };
    if (!cf.uses && entry.uses) {
      const max = computeFeatureMaxUses(entry.uses, entry.level, character.level);
      next.uses = {
        current: max,
        max,
        recovery: entry.uses.recovery,
        baseMax: entry.uses.max,
        perLevels: entry.uses.perLevels,
        gainAmount: entry.uses.gainAmount,
      };
      changed = true;
    }
    if (!cf.actionType && entry.actionType) {
      next.actionType = entry.actionType;
      changed = true;
    }
    return next;
  });

  // Añadir rasgos del catálogo con usos o homebrew que aún no estén
  for (const entry of catalogFeats) {
    if (
      features.some(
        (f) => f.id === entry.id || f.name.toLowerCase() === entry.name.toLowerCase()
      )
    )
      continue;
    if (classData?.homebrew || raceData?.homebrew || entry.uses) {
      features.push(...toCharacterFeatures([entry], entry.source || 'class', character.level));
      changed = true;
    }
  }

  return changed ? { ...character, features } : character;
}

/** Incorpora spellIds de raza y starterSpellIds de clase a la hoja */
export function syncSpellsFromCatalog(
  character: Character,
  classData?: ClassData | null,
  raceData?: RaceData | null,
  spellCatalog?: Spell[]
): Character {
  const toAdd = [
    ...(raceData?.spellIds || []),
    ...(classData?.spellcasting?.starterSpellIds || []),
  ];
  if (!toAdd.length) return character;

  const known = new Set([
    ...(character.cantripsKnown || []),
    ...(character.spells || []).map((s) => s.spellId),
  ]);

  let cantripsKnown = [...(character.cantripsKnown || [])];
  let spells = [...(character.spells || [])];
  let changed = false;

  for (const id of toAdd) {
    if (known.has(id)) continue;
    const meta = spellCatalog?.find((s) => s.id === id);
    if (meta && meta.level === 0) cantripsKnown.push(id);
    else spells.push({ spellId: id, prepared: true, alwaysPrepared: true });
    known.add(id);
    changed = true;
  }

  return changed ? { ...character, cantripsKnown, spells } : character;
}
