import type { Character, Spell } from '../types/dnd';

/**
 * Aplica beneficios de dotes/rasgos que otorgan conjuros o espacios (PHB 2024).
 * - Iniciado en la magia: 2 trucos + 1 conjuro N1 (siempre preparado); no da espacios extra
 *   (se lanza 1/día sin espacio; si ya tienes espacios, puedes usarlos).
 * - Rasgos con "aprendes el conjuro X" / spellIds en descripción se enlazan si hay match en catálogo.
 */
export function applyFeatureSpellGrants(
  character: Character,
  spellCatalog: Spell[]
): Character {
  let cantripsKnown = [...(character.cantripsKnown || [])];
  let spells = [...(character.spells || [])];
  let spellSlots = { ...(character.spellSlots || {}) };
  let spellcastingAbility = character.spellcastingAbility;
  let changed = false;

  const known = new Set([...cantripsKnown, ...spells.map((s) => s.spellId)]);

  const addSpell = (id: string, always = true) => {
    if (known.has(id)) return;
    const meta = spellCatalog.find((s) => s.id === id);
    if (meta && meta.level === 0) cantripsKnown.push(id);
    else spells.push({ spellId: id, prepared: true, alwaysPrepared: always });
    known.add(id);
    changed = true;
  };

  for (const f of character.features || []) {
    const blob = `${f.name} ${f.description}`.toLowerCase();

    // Magic Initiate / Iniciado en la magia
    if (/iniciado en la magia|magic initiate/i.test(f.name)) {
      if (!spellcastingAbility) {
        spellcastingAbility = 'int'; // default; player can change
        changed = true;
      }
      // Mark feature uses: 1/long for the leveled spell without slot
      if (!f.uses) {
        f.uses = { current: 1, max: 1, recovery: 'long' };
        changed = true;
      }
    }

    // Explicit spell names in description: "aprendes X" matching catalog names
    for (const sp of spellCatalog) {
      const n = sp.name.toLowerCase();
      if (n.length < 4) continue;
      if (
        new RegExp(
          `(aprendes|obtienes|conoces|puedes lanzar|conjuro)\\s+[«"]?${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
          'i'
        ).test(blob) ||
        (blob.includes(n) && /aprendes el conjuro|conoces el truco|cantrip|truco/i.test(blob))
      ) {
        addSpell(sp.id, true);
      }
    }

    // Features that grant pact/slots text
    if (/ganas\s+(\d+)\s+espacio/i.test(blob) || /espacios de conjuro de nivel\s+(\d+)/i.test(blob)) {
      const m = blob.match(/ganas\s+(\d+)\s+espacio.*?nivel\s+(\d+)/i)
        || blob.match(/(\d+)\s+espacios? de conjuro de nivel\s+(\d+)/i);
      if (m) {
        const max = parseInt(m[1], 10);
        const level = parseInt(m[2], 10);
        const cur = spellSlots[level] || { max: 0, used: 0 };
        if (cur.max < max) {
          spellSlots[level] = { max, used: cur.used };
          changed = true;
        }
      }
    }
  }

  if (!changed) return character;
  return {
    ...character,
    cantripsKnown,
    spells,
    spellSlots,
    spellcastingAbility,
    features: [...character.features],
  };
}
