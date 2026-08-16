import { useState } from 'react';
import { useBackgrounds } from '../hooks/useBackgrounds';
import type { BackgroundData } from '../types/dnd';
import { Plus, Trash2, Scroll, X } from 'lucide-react';

const EMPTY = {
  name: '',
  description: '',
  skills: '',
  tools: '',
  languages: '',
  equipment: '',
  featureName: '',
  featureDesc: '',
  originFeatName: '',
  originFeatDesc: '',
};

export function BackgroundsPage() {
  const { backgrounds, loading, addHomebrew, deleteHomebrew } = useBackgrounds();
  const [selected, setSelected] = useState<BackgroundData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);

  if (loading) return <div className="text-center py-16 text-ink-500">Cargando trasfondos…</div>;

  const current = selected
    ? backgrounds.find((b) => b.id === selected.id) || selected
    : null;

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const bg = addHomebrew({
      name: form.name.trim(),
      description: form.description.trim() || 'Trasfondo homebrew.',
      skillProficiencies: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      toolProficiencies: form.tools
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      languages: form.languages.trim()
        ? { count: 1, description: form.languages.trim() }
        : undefined,
      equipment: form.equipment
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      feature:
        form.featureName.trim()
          ? {
              name: form.featureName.trim(),
              description: form.featureDesc.trim() || '—',
            }
          : undefined,
      originFeat:
        form.originFeatName.trim()
          ? {
              name: form.originFeatName.trim(),
              description: form.originFeatDesc.trim() || '—',
            }
          : undefined,
    });
    setShowForm(false);
    setForm(EMPTY);
    setSelected(bg);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Scroll className="w-6 h-6" /> Trasfondos y orígenes
          </h1>
          <p className="text-sm text-ink-600 mt-1">
            PHB 2024 / homebrew. Elige un trasfondo en la creación de personaje o en la hoja; los
            cambios del catálogo se reflejan al reabrir la app.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-crimson-600 hover:bg-crimson-700 text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Homebrew
        </button>
      </div>

      {/* Mobile select */}
      <div className="lg:hidden mb-3">
        <label className="block text-xs font-bold text-ink-600 mb-1">Trasfondo</label>
        <select
          className="w-full px-3 py-2.5 border-2 border-ink-800 rounded-xl bg-parchment-100 text-sm font-medium"
          value={selected?.id || ''}
          onChange={(e) => {
            const b = backgrounds.find((x) => x.id === e.target.value);
            if (b) setSelected(b);
          }}
        >
          <option value="">— Elegir —</option>
          {backgrounds.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
              {b.homebrew ? ' (HB)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="hidden lg:block lg:col-span-2 bg-parchment-100 border-2 border-ink-800 rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto">
          {backgrounds.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelected(b)}
              className={`w-full text-left px-3 py-2.5 border-b border-ink-200 text-sm hover:bg-parchment-200 ${
                current?.id === b.id ? 'bg-parchment-200 border-l-4 border-l-crimson-600' : ''
              }`}
            >
              <span className="font-medium">{b.name}</span>
              {b.homebrew && (
                <span className="ml-1 text-[10px] bg-amber-200 text-amber-900 px-1 rounded">HB</span>
              )}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 bg-white border-2 border-ink-800 rounded-xl p-4 min-h-[16rem]">
          {current ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xl font-display font-bold">{current.name}</h2>
                {current.homebrew && current.id.startsWith('hb-') && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`¿Eliminar ${current.name}?`)) {
                        deleteHomebrew(current.id);
                        setSelected(null);
                      }
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-ink-700 whitespace-pre-wrap">{current.description}</p>
              {current.skillProficiencies && current.skillProficiencies.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase text-ink-500">Habilidades</div>
                  <div className="text-sm">{current.skillProficiencies.join(', ')}</div>
                </div>
              )}
              {current.toolProficiencies && current.toolProficiencies.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase text-ink-500">Herramientas</div>
                  <div className="text-sm">{current.toolProficiencies.join(', ')}</div>
                </div>
              )}
              {current.languages && (
                <div>
                  <div className="text-xs font-bold uppercase text-ink-500">Idiomas</div>
                  <div className="text-sm">{current.languages.description}</div>
                </div>
              )}
              {current.equipment && current.equipment.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase text-ink-500">Equipo</div>
                  <div className="text-sm">{current.equipment.join(', ')}</div>
                </div>
              )}
              {current.feature && (
                <div className="bg-parchment-50 border border-ink-200 rounded-lg p-2">
                  <div className="text-xs font-bold uppercase text-ink-500">Rasgo</div>
                  <div className="font-semibold text-sm">{current.feature.name}</div>
                  <p className="text-sm text-ink-700">{current.feature.description}</p>
                </div>
              )}
              {current.originFeat && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-2">
                  <div className="text-xs font-bold uppercase text-amber-900">Dote de origen</div>
                  <div className="font-semibold text-sm">{current.originFeat.name}</div>
                  <p className="text-sm text-ink-700">{current.originFeat.description}</p>
                </div>
              )}
              {current.originFeatChoices && current.originFeatChoices.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase text-ink-500 mb-1">
                    Dotes de origen disponibles
                  </div>
                  <ul className="space-y-1">
                    {current.originFeatChoices.map((f) => (
                      <li key={f.id} className="text-sm border border-ink-100 rounded px-2 py-1">
                        <strong>{f.name}</strong> — {f.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-ink-500 text-sm">Selecciona un trasfondo de la lista.</p>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 pb-24 sm:p-4 sm:pb-4 bg-black/40">
          <div className="bg-parchment-50 border-2 border-ink-800 rounded-xl max-w-lg w-full max-h-[min(90dvh,calc(100dvh-7rem))] overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Nuevo trasfondo homebrew</h2>
              <button type="button" onClick={() => setShowForm(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {(
                [
                  ['name', 'Nombre *'],
                  ['description', 'Descripción'],
                  ['skills', 'Habilidades (coma)'],
                  ['tools', 'Herramientas (coma)'],
                  ['languages', 'Idiomas'],
                  ['equipment', 'Equipo (coma)'],
                  ['featureName', 'Nombre del rasgo'],
                  ['featureDesc', 'Descripción del rasgo'],
                  ['originFeatName', 'Dote de origen (nombre)'],
                  ['originFeatDesc', 'Dote de origen (descripción)'],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs font-bold mb-0.5">{label}</label>
                  {key === 'description' || key.includes('Desc') ? (
                    <textarea
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-2 py-1.5 border-2 border-ink-300 rounded-lg"
                      rows={2}
                    />
                  ) : (
                    <input
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-2 py-1.5 border-2 border-ink-300 rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={handleCreate}
                className="flex-1 py-2 bg-crimson-600 text-white rounded-lg font-medium"
              >
                Crear
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border-2 border-ink-300 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
