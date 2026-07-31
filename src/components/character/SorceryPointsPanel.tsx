import type { Character } from '../../types/dnd';
import { spCostForSlot, spFromSlot } from '../../utils/spellLimits';
import { Sparkles } from 'lucide-react';

interface Props {
  character: Character;
  onUpdate: (partial: Partial<Character>) => void;
}

export function SorceryPointsPanel({ character, onUpdate }: Props) {
  const isSorcerer =
    character.classId === 'sorcerer' ||
    character.class.toLowerCase().includes('hechic') ||
    character.class.toLowerCase().includes('sorcer');

  if (!isSorcerer && !character.sorceryPoints) return null;

  const max = character.sorceryPoints?.max ?? character.level;
  const current = character.sorceryPoints?.current ?? max;

  const setSP = (next: number) => {
    onUpdate({
      sorceryPoints: {
        max,
        current: Math.max(0, Math.min(max, next)),
      },
    });
  };

  const convertSlotToSP = (level: number) => {
    const slot = character.spellSlots[level];
    if (!slot || slot.used >= slot.max) {
      alert(`No hay espacios de nivel ${level} disponibles.`);
      return;
    }
    const gain = spFromSlot(level);
    const slots = {
      ...character.spellSlots,
      [level]: { ...slot, used: slot.used + 1 },
    };
    onUpdate({
      spellSlots: slots,
      sorceryPoints: {
        max,
        current: Math.min(max, current + gain),
      },
    });
  };

  const convertSPToSlot = (level: number) => {
    const cost = spCostForSlot(level);
    if (current < cost) {
      alert(`Necesitas ${cost} puntos de hechicería para un espacio de nivel ${level}.`);
      return;
    }
    const slot = character.spellSlots[level] || { max: 0, used: 0 };
    // Creating a slot: if at max, temporarily allow +1 max for this conversion (optional)
    // Simpler: reduce used if any used, else increase max by 1 until long rest is complex.
    // PHB: you create a slot that is not recovered on short rest - we add as available by decreasing used or adding to max.
    const slots = { ...character.spellSlots };
    if (slot.used > 0) {
      slots[level] = { ...slot, used: slot.used - 1 };
    } else {
      slots[level] = { max: slot.max + 1, used: 0 };
    }
    onUpdate({
      spellSlots: slots,
      sorceryPoints: { max, current: current - cost },
    });
  };

  const slotLevels = Object.keys(character.spellSlots)
    .map(Number)
    .sort((a, b) => a - b)
    .filter((l) => l >= 1 && l <= 5);

  return (
    <div className="bg-fuchsia-50 border-2 border-fuchsia-400 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-fuchsia-700" />
        <h3 className="font-bold text-sm text-fuchsia-900">Puntos de hechicería (Font of Magic)</h3>
      </div>
      <p className="text-[11px] text-fuchsia-900/80">
        Puedes convertir <strong>espacios de conjuro → SP</strong> y <strong>SP → espacios</strong> (niv. 1–5).
        Máximo de SP = nivel de hechicero. Se recuperan en descanso largo.
      </p>
      <div className="flex items-center gap-3">
        <div className="text-2xl font-mono font-bold text-fuchsia-900">
          {current}/{max}
        </div>
        <button
          type="button"
          onClick={() => setSP(current - 1)}
          className="px-2 py-1 bg-white border border-fuchsia-300 rounded text-sm"
        >
          −1
        </button>
        <button
          type="button"
          onClick={() => setSP(current + 1)}
          className="px-2 py-1 bg-white border border-fuchsia-300 rounded text-sm"
        >
          +1
        </button>
        <button
          type="button"
          onClick={() => setSP(max)}
          className="px-2 py-1 bg-fuchsia-200 border border-fuchsia-400 rounded text-xs"
        >
          Recuperar todos
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="bg-white/80 border border-fuchsia-200 rounded p-2 space-y-1">
          <div className="font-bold text-fuchsia-900">Espacio → SP</div>
          {slotLevels.length === 0 && (
            <p className="text-ink-500">Sin espacios cargados.</p>
          )}
          {slotLevels.map((lv) => (
            <button
              key={`to-sp-${lv}`}
              type="button"
              onClick={() => convertSlotToSP(lv)}
              className="block w-full text-left px-2 py-1 rounded hover:bg-fuchsia-50 border border-transparent hover:border-fuchsia-200"
            >
              Gastar espacio niv. {lv} → +{spFromSlot(lv)} SP
            </button>
          ))}
        </div>
        <div className="bg-white/80 border border-fuchsia-200 rounded p-2 space-y-1">
          <div className="font-bold text-fuchsia-900">SP → Espacio</div>
          {[1, 2, 3, 4, 5].map((lv) => (
            <button
              key={`to-slot-${lv}`}
              type="button"
              onClick={() => convertSPToSlot(lv)}
              className="block w-full text-left px-2 py-1 rounded hover:bg-fuchsia-50 border border-transparent hover:border-fuchsia-200"
            >
              Crear espacio niv. {lv} (cuesta {spCostForSlot(lv)} SP)
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
