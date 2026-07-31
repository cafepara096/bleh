import type { Character } from '../../types/dnd';
import { spCostForSlot, spFromSlot } from '../../utils/spellLimits';
import { useState } from 'react';

interface Props {
  character: Character;
  onUpdate: (partial: Partial<Character>) => void;
}

export function SorceryPointsPanel({ character, onUpdate, }: Props) {
  const [open, setOpen] = useState(false);
  const isSorcerer =
    character.classId === 'sorcerer' ||
    character.class.toLowerCase().includes('hechic') ||
    character.class.toLowerCase().includes('sorcer') ||
    !!character.sorceryPoints;

  if (!isSorcerer) return null;

  const max = character.sorceryPoints?.max ?? character.level;
  const current = character.sorceryPoints?.current ?? max;

  const setSP = (next: number) =>
    onUpdate({ sorceryPoints: { max, current: Math.max(0, Math.min(max, next)) } });

  const convertSlotToSP = (level: number) => {
    const slot = character.spellSlots[level];
    if (!slot || slot.used >= slot.max) return;
    onUpdate({
      spellSlots: {
        ...character.spellSlots,
        [level]: { ...slot, used: slot.used + 1 },
      },
      sorceryPoints: { max, current: Math.min(max, current + spFromSlot(level)) },
    });
  };

  const convertSPToSlot = (level: number) => {
    const cost = spCostForSlot(level);
    if (current < cost) return;
    const slot = character.spellSlots[level] || { max: 0, used: 0 };
    const slots = { ...character.spellSlots };
    if (slot.used > 0) slots[level] = { ...slot, used: slot.used - 1 };
    else slots[level] = { max: slot.max + 1, used: 0 };
    onUpdate({ spellSlots: slots, sorceryPoints: { max, current: current - cost } });
  };

  const slotLevels = Object.keys(character.spellSlots)
    .map(Number)
    .filter((l) => l >= 1 && l <= 5)
    .sort((a, b) => a - b);

  return (
    <div className="bg-fuchsia-50/90 border border-fuchsia-300 rounded-lg px-2.5 py-1.5">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-fuchsia-900">SP</span>
        <span className="font-mono font-bold text-fuchsia-950">
          {current}/{max}
        </span>
        <button type="button" onClick={() => setSP(current - 1)} className="px-1.5 border border-fuchsia-300 rounded bg-white">−</button>
        <button type="button" onClick={() => setSP(current + 1)} className="px-1.5 border border-fuchsia-300 rounded bg-white">+</button>
        <button type="button" onClick={() => setSP(max)} className="px-1.5 border border-fuchsia-300 rounded bg-fuchsia-100 text-[10px]">Full</button>
        <button type="button" onClick={() => setOpen((o) => !o)} className="ml-auto text-[10px] text-fuchsia-800 underline">
          {open ? 'Ocultar conversión' : 'Convertir espacios ↔ SP'}
        </button>
      </div>
      {open && (
        <div className="mt-1.5 flex flex-wrap gap-1 text-[10px] border-t border-fuchsia-200 pt-1.5">
          {slotLevels.map((lv) => (
            <button
              key={`s-${lv}`}
              type="button"
              onClick={() => convertSlotToSP(lv)}
              className="px-1.5 py-0.5 bg-white border border-fuchsia-200 rounded hover:bg-fuchsia-100"
            >
              Esp.{lv}→+{spFromSlot(lv)}SP
            </button>
          ))}
          {[1, 2, 3, 4, 5].map((lv) => (
            <button
              key={`p-${lv}`}
              type="button"
              onClick={() => convertSPToSlot(lv)}
              className="px-1.5 py-0.5 bg-white border border-fuchsia-200 rounded hover:bg-fuchsia-100"
            >
              {spCostForSlot(lv)}SP→Esp.{lv}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
