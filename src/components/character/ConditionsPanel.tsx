import { useState } from 'react';
import type { Character } from '../../types/dnd';
import { DND_CONDITIONS } from '../../data/conditions';
import { Plus, X } from 'lucide-react';

interface Props {
  character: Character;
  onUpdate: (partial: Partial<Character>) => void;
}

export function ConditionsPanel({ character, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState('');
  const active = character.conditions || [];

  const add = (name: string) => {
    const n = name.trim();
    if (!n || active.includes(n)) return;
    onUpdate({ conditions: [...active, n] });
    setCustom('');
    setOpen(false);
  };
  const remove = (name: string) =>
    onUpdate({ conditions: active.filter((c) => c !== name) });

  return (
    <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-3">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <h3 className="font-bold text-sm">Estados</h3>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 text-xs px-2 py-1 bg-amber-200 border border-amber-500 rounded"
        >
          <Plus className="w-3 h-3" /> Añadir
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {active.length === 0 && (
          <span className="text-xs text-ink-500 italic">Sin estados activos</span>
        )}
        {active.map((c) => (
          <span
            key={c}
            className="inline-flex items-center gap-1 text-xs bg-white border border-amber-400 rounded-full px-2 py-0.5 font-medium"
          >
            {c}
            <button type="button" onClick={() => remove(c)} className="text-red-600 hover:bg-red-50 rounded-full p-0.5">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      {open && (
        <div className="mt-2 border-t border-amber-200 pt-2 space-y-2">
          <div className="flex flex-wrap gap-1">
            {DND_CONDITIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                title={c.description}
                disabled={active.includes(c.name)}
                onClick={() => add(c.name)}
                className="text-[10px] px-1.5 py-0.5 rounded border border-amber-300 bg-white hover:bg-amber-100 disabled:opacity-40"
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Estado homebrew…"
              className="flex-1 text-xs px-2 py-1 border border-ink-300 rounded"
              onKeyDown={(e) => e.key === 'Enter' && add(custom)}
            />
            <button type="button" onClick={() => add(custom)} className="text-xs px-2 py-1 bg-ink-800 text-white rounded">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
