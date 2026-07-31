import { useEffect, useState } from 'react';
import {
  METAMAGIC_OPTIONS,
  BATTLE_MASTER_MANEUVERS,
  STORAGE_METAMAGIC,
  STORAGE_MANEUVERS,
  type TableOption,
} from '../../data/featureTables';
import { Plus, Trash2 } from 'lucide-react';

function useEditableTable(storageKey: string, defaults: TableOption[]) {
  const [rows, setRows] = useState<TableOption[]>(defaults);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setRows(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [storageKey]);
  const save = (next: TableOption[]) => {
    setRows(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };
  return { rows, save };
}

export function FeatureTablesEditor() {
  const meta = useEditableTable(STORAGE_METAMAGIC, METAMAGIC_OPTIONS);
  const man = useEditableTable(STORAGE_MANEUVERS, BATTLE_MASTER_MANEUVERS);
  const [tab, setTab] = useState<'meta' | 'man'>('meta');

  const active = tab === 'meta' ? meta : man;

  const updateRow = (id: string, patch: Partial<TableOption>) => {
    active.save(active.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };
  const removeRow = (id: string) => active.save(active.rows.filter((r) => r.id !== id));
  const addRow = () => {
    const id = `hb-${crypto.randomUUID().slice(0, 8)}`;
    active.save([
      ...active.rows,
      { id, name: 'Nueva opción', description: 'Descripción homebrew', cost: tab === 'meta' ? 1 : undefined },
    ]);
  };
  const reset = () => {
    if (!confirm('¿Restaurar tabla por defecto?')) return;
    localStorage.removeItem(tab === 'meta' ? STORAGE_METAMAGIC : STORAGE_MANEUVERS);
    active.save(tab === 'meta' ? METAMAGIC_OPTIONS : BATTLE_MASTER_MANEUVERS);
  };

  return (
    <div className="bg-parchment-100 border-2 border-ink-800 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-bold">Tablas de opciones (homebrew)</h3>
        <button
          type="button"
          onClick={() => setTab('meta')}
          className={`px-2 py-1 text-xs rounded border ${tab === 'meta' ? 'bg-violet-200 border-violet-500' : 'bg-white border-ink-300'}`}
        >
          Metamagia
        </button>
        <button
          type="button"
          onClick={() => setTab('man')}
          className={`px-2 py-1 text-xs rounded border ${tab === 'man' ? 'bg-orange-200 border-orange-500' : 'bg-white border-ink-300'}`}
        >
          Maniobras
        </button>
        <button type="button" onClick={addRow} className="ml-auto flex items-center gap-1 text-xs px-2 py-1 bg-crimson-600 text-white rounded">
          <Plus className="w-3 h-3" /> Añadir
        </button>
        <button type="button" onClick={reset} className="text-xs px-2 py-1 border border-ink-300 rounded bg-white">
          Restaurar defaults
        </button>
      </div>
      <p className="text-xs text-ink-600">
        Estas tablas alimentan la hoja de personaje (combate / subclase). Los cambios se guardan en este navegador.
      </p>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {active.rows.map((r) => (
          <div key={r.id} className="bg-white border border-ink-200 rounded-lg p-2 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
            <input
              value={r.name}
              onChange={(e) => updateRow(r.id, { name: e.target.value })}
              className="sm:col-span-3 px-2 py-1 border border-ink-300 rounded font-semibold"
              placeholder="Nombre"
            />
            {tab === 'meta' && (
              <input
                type="number"
                min={0}
                value={r.cost ?? 1}
                onChange={(e) => updateRow(r.id, { cost: parseInt(e.target.value) || 0 })}
                className="sm:col-span-1 px-2 py-1 border border-ink-300 rounded"
                title="Coste SP"
              />
            )}
            <input
              value={r.description}
              onChange={(e) => updateRow(r.id, { description: e.target.value })}
              className={`${tab === 'meta' ? 'sm:col-span-7' : 'sm:col-span-8'} px-2 py-1 border border-ink-300 rounded`}
              placeholder="Descripción"
            />
            <button type="button" onClick={() => removeRow(r.id)} className="sm:col-span-1 p-1 text-red-600 hover:bg-red-50 rounded flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
