import { useState } from 'react';
import type { Character } from '../../types/dnd';
import { DND_CONDITIONS } from '../../data/conditions';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  character: Character;
  onUpdate: (partial: Partial<Character>) => void;
}

export function ConditionsPanel({ character, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [custom, setCustom] = useState('');
  const active = character.conditions || [];

  const add = (name: string) => {
    const n = name.trim();
    if (!n || active.includes(n)) return;
    onUpdate({ conditions: [...active, n] });
    setCustom('');
  };
  const remove = (name: string) =>
    onUpdate({ conditions: active.filter((c) => c !== name) });

  const descFor = (name: string) =>
    DND_CONDITIONS.find((c) => c.name === name)?.description ||
    'Estado homebrew o personalizado.';

  return (
    <div className="bg-amber-50/80 border border-amber-300 rounded-lg px-2 py-1">
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[10px] font-bold uppercase tracking-wide text-amber-900">Estados</span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="p-0.5 bg-amber-200/80 border border-amber-400 rounded"
          title="Añadir estado"
        >
          <Plus className="w-3 h-3" />
        </button>
        {active.length === 0 && (
          <span className="text-[10px] text-ink-500 italic">ninguno</span>
        )}
        {active.map((c) => {
          const isOpen = expanded === c;
          return (
            <span key={c} className="inline-flex flex-col max-w-full">
              <span className="inline-flex items-center gap-0.5 text-[10px] bg-white border border-amber-400 rounded-full pl-1.5 pr-0.5 py-0 font-medium leading-5">
                <button
                  type="button"
                  className="inline-flex items-center gap-0.5 max-w-[8rem] truncate"
                  onClick={() => setExpanded(isOpen ? null : c)}
                >
                  {c}
                  {isOpen ? <ChevronUp className="w-2.5 h-2.5 shrink-0" /> : <ChevronDown className="w-2.5 h-2.5 shrink-0" />}
                </button>
                <button type="button" onClick={() => remove(c)} className="text-red-600 p-0.5 rounded-full hover:bg-red-50">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
              {isOpen && (
                <span className="mt-0.5 text-[10px] text-ink-700 bg-white border border-amber-200 rounded px-1.5 py-1 max-w-[18rem] leading-snug shadow-sm z-10">
                  {descFor(c)}
                </span>
              )}
            </span>
          );
        })}
      </div>
      {open && (
        <div className="mt-1 border-t border-amber-200 pt-1 space-y-1">
          <div className="flex flex-wrap gap-0.5">
            {DND_CONDITIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                title={c.description}
                disabled={active.includes(c.name)}
                onClick={() => add(c.name)}
                className="text-[9px] px-1 py-0.5 rounded border border-amber-300 bg-white hover:bg-amber-100 disabled:opacity-40"
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Homebrew…"
              className="flex-1 text-[11px] px-1.5 py-0.5 border border-ink-300 rounded"
              onKeyDown={(e) => e.key === 'Enter' && add(custom)}
            />
            <button type="button" onClick={() => add(custom)} className="text-[10px] px-1.5 py-0.5 bg-ink-800 text-white rounded">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
