import { useState } from 'react';
import { useRaces } from '../hooks/useRaces';
import { useSpells } from '../hooks/useSpells';
import type { RaceData, FeatureEntry, AbilityScore } from '../types/dnd';
import { ABILITY_LABELS } from '../types/dnd';
import { dualizeDescription, formatSpeed } from '../utils/units';
import { Plus, Trash2, Users, X, Sparkles } from 'lucide-react';

export function RacesPage() {
  const { races, loading, addHomebrew, deleteHomebrew, addTrait, removeTrait } = useRaces();
  const { spells } = useSpells();
  const [selected, setSelected] = useState<RaceData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showTraitForm, setShowTraitForm] = useState(false);
  const [traitForm, setTraitForm] = useState({
    name: '',
    description: '',
    spellId: '',
    bonusAbility: '' as AbilityScore | '',
    bonusAmount: 1,
  });
  const [form, setForm] = useState({
    name: '',
    description: '',
    size: 'Mediano',
    speed: 30,
    languages: '',
  });

  if (loading) return <div className="text-center py-16 text-ink-500">Cargando razas...</div>;

  const current = selected ? races.find((r) => r.id === selected.id) || selected : null;

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const race = addHomebrew({
      name: form.name.trim(),
      description: form.description.trim() || 'Raza homebrew.',
      size: form.size,
      speed: form.speed,
      abilityScoreIncrease: '—',
      languages: form.languages.split(',').map((s) => s.trim()).filter(Boolean),
      traits: [],
    });
    setShowForm(false);
    setSelected(race);
  };

  const handleAddTrait = () => {
    if (!current || !traitForm.name.trim()) return;
    const abilityBonuses =
      traitForm.bonusAbility && traitForm.bonusAmount
        ? { [traitForm.bonusAbility]: traitForm.bonusAmount }
        : undefined;
    let description = traitForm.description.trim() || '—';
    if (abilityBonuses && traitForm.bonusAbility) {
      const label = ABILITY_LABELS[traitForm.bonusAbility];
      const bonusText = `+${traitForm.bonusAmount} ${label}`;
      if (!description.includes(bonusText)) {
        description = description === '—' ? bonusText : `${description} (${bonusText})`;
      }
    }
    const trait: FeatureEntry = {
      id: `trait-${crypto.randomUUID()}`,
      name: traitForm.name.trim(),
      description,
      level: 1,
      source: 'homebrew',
      spellId: traitForm.spellId || undefined,
      abilityBonuses,
    };
    addTrait(current.id, trait);
    setTraitForm({ name: '', description: '', spellId: '', bonusAbility: '', bonusAmount: 1 });
    setShowTraitForm(false);
    setSelected({ ...current, traits: [...current.traits, trait], homebrew: true });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Razas</h1>
          <p className="text-ink-600 text-sm mt-1">{races.length} razas · SRD 5e + homebrew</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-crimson-600 hover:bg-crimson-700 text-white rounded-lg font-medium"
        >
          <Plus className="w-4 h-4" /> Homebrew
        </button>
      </div>

      {/* menu-movil-catalogo */}
      <div className="lg:hidden mb-3">
        <label className="block text-xs font-bold text-ink-600 mb-1">Raza</label>
        <select
          className="w-full px-3 py-2.5 border-2 border-ink-800 rounded-xl bg-parchment-100 text-sm font-medium"
          value={selected?.id || ''}
          onChange={(e) => {
            const r = races.find((x) => x.id === e.target.value);
            if (r) setSelected(r);
          }}
        >
          <option value="">— Elegir raza —</option>
          {races.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}{r.homebrew ? ' (HB)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="hidden lg:block lg:col-span-2 bg-parchment-100 border-2 border-ink-800 rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto">
          {races.map((race) => (
            <button
              key={race.id}
              onClick={() => setSelected(race)}
              className={`w-full text-left px-4 py-3 border-b border-ink-200 hover:bg-parchment-200 ${
                current?.id === race.id ? 'bg-parchment-200 border-l-4 border-l-crimson-600' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium flex-1">{race.name}</span>
                {race.homebrew && (
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 rounded font-bold">HB</span>
                )}
              </div>
              <div className="text-xs text-ink-500 mt-0.5">
                {race.size} · {formatSpeed(race.speed)}
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {current ? (
            <div className="bg-parchment-100 border-2 border-ink-800 rounded-xl p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold">{current.name}</h2>
                  {current.homebrew && (
                    <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">Homebrew</span>
                  )}
                </div>
                {current.homebrew && current.id.startsWith('hb-') && (
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar ${current.name}?`)) {
                        deleteHomebrew(current.id);
                        setSelected(null);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <p className="text-ink-800 leading-relaxed">{dualizeDescription(current.description)}</p>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white border border-ink-200 rounded-lg p-3">
                  <div className="text-xs text-ink-500 uppercase font-bold">Tamaño</div>
                  <div className="font-semibold">{current.size}</div>
                </div>
                <div className="bg-white border border-ink-200 rounded-lg p-3">
                  <div className="text-xs text-ink-500 uppercase font-bold">Velocidad</div>
                  <div className="font-semibold">{formatSpeed(current.speed)}</div>
                </div>
                <div className="bg-white border border-ink-200 rounded-lg p-3 col-span-2">
                  <div className="text-xs text-ink-500 uppercase font-bold">Aumento de características</div>
                  <div className="font-semibold">{current.abilityScoreIncrease}</div>
                </div>
                <div className="bg-white border border-ink-200 rounded-lg p-3 col-span-2">
                  <div className="text-xs text-ink-500 uppercase font-bold">Idiomas</div>
                  <div className="font-semibold">{current.languages.join(', ')}</div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Rasgos
                  </h3>
                  <button
                    onClick={() => setShowTraitForm(true)}
                    className="text-xs px-2 py-1 bg-ink-800 text-parchment-50 rounded hover:bg-ink-700"
                  >
                    + Rasgo
                  </button>
                </div>
                <div className="space-y-2">
                  {current.traits.map((t) => (
                    <div key={t.id} className="bg-white border border-ink-200 rounded-lg p-3 group">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-semibold">{t.name}</span>
                          {t.spellId && (
                            <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-1.5 rounded">
                              Conjuro: {spells.find((s) => s.id === t.spellId)?.name || t.spellId}
                            </span>
                          )}
                          {t.abilityBonuses &&
                            Object.entries(t.abilityBonuses).map(([ab, amt]) => (
                              <span key={ab} className="ml-2 text-xs bg-green-100 text-green-900 px-1.5 rounded font-bold">
                                +{amt} {ABILITY_LABELS[ab as AbilityScore] || ab}
                              </span>
                            ))}
                        </div>
                        <button
                          onClick={() => {
                            removeTrait(current.id, t.id);
                            setSelected({
                              ...current,
                              traits: current.traits.filter((x) => x.id !== t.id),
                              homebrew: true,
                            });
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Quitar rasgo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm text-ink-700 mt-1">{dualizeDescription(t.description)}</p>
                    </div>
                  ))}
                  {current.traits.length === 0 && (
                    <p className="text-sm text-ink-500 italic">Sin rasgos. Añade alguno.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-parchment-100 border-2 border-dashed border-ink-300 rounded-xl p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-ink-400 mb-3" />
              <p className="text-ink-600">Selecciona una raza</p>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 pb-24 sm:p-4 sm:pb-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-parchment-50 border-2 border-ink-900 rounded-xl p-4 sm:p-6 w-full max-w-md space-y-3 max-h-[min(90dvh,calc(100dvh-7rem))] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Nueva raza homebrew</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg" />
            <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg" />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Tamaño" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="px-3 py-2 border-2 border-ink-300 rounded-lg" />
              <input type="number" placeholder="Velocidad (ft)" value={form.speed} onChange={(e) => setForm({ ...form, speed: parseInt(e.target.value) || 30 })} className="px-3 py-2 border-2 border-ink-300 rounded-lg" />
            </div>
            <input placeholder="Idiomas (separados por coma)" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg" />
            <p className="text-xs text-ink-500">Los aumentos de características se definen después (rasgos / creación de personaje).</p>
            <button onClick={handleCreate} className="w-full py-2 bg-crimson-600 text-white rounded-lg font-medium">Crear</button>
          </div>
        </div>
      )}

      {showTraitForm && current && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 pb-24 sm:p-4 sm:pb-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowTraitForm(false)} />
          <div className="relative bg-parchment-50 border-2 border-ink-900 rounded-xl p-4 sm:p-6 w-full max-w-md space-y-3 max-h-[min(90dvh,calc(100dvh-7rem))] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold">Añadir rasgo a {current.name}</h2>
            <input placeholder="Nombre del rasgo *" value={traitForm.name} onChange={(e) => setTraitForm({ ...traitForm, name: e.target.value })} className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg" />
            <textarea placeholder="Descripción" value={traitForm.description} onChange={(e) => setTraitForm({ ...traitForm, description: e.target.value })} rows={3} className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg" />
            <div>
              <label className="text-sm font-bold">Vincular conjuro (opcional)</label>
              <select value={traitForm.spellId} onChange={(e) => setTraitForm({ ...traitForm, spellId: e.target.value })} className="w-full mt-1 px-3 py-2 border-2 border-ink-300 rounded-lg">
                <option value="">Ninguno</option>
                {spells.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} (niv. {s.level})</option>
                ))}
              </select>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
              <label className="text-sm font-bold block">Bono de característica (opcional)</label>
              <p className="text-xs text-ink-600">Se aplicará automáticamente al crear un personaje con esta raza.</p>
              <div className="flex gap-2">
                <select
                  value={traitForm.bonusAbility}
                  onChange={(e) =>
                    setTraitForm({
                      ...traitForm,
                      bonusAbility: e.target.value as AbilityScore | '',
                    })
                  }
                  className="flex-1 px-3 py-2 border-2 border-ink-300 rounded-lg"
                >
                  <option value="">Sin bono</option>
                  {(Object.keys(ABILITY_LABELS) as AbilityScore[]).map((a) => (
                    <option key={a} value={a}>{ABILITY_LABELS[a]}</option>
                  ))}
                </select>
                <select
                  value={traitForm.bonusAmount}
                  onChange={(e) =>
                    setTraitForm({ ...traitForm, bonusAmount: parseInt(e.target.value) || 1 })
                  }
                  className="w-24 px-3 py-2 border-2 border-ink-300 rounded-lg"
                  disabled={!traitForm.bonusAbility}
                >
                  {[1, 2, 3].map((n) => (
                    <option key={n} value={n}>+{n}</option>
                  ))}
                </select>
              </div>
            </div>
            <button onClick={handleAddTrait} className="w-full py-2 bg-crimson-600 text-white rounded-lg font-medium">Añadir rasgo</button>
          </div>
        </div>
      )}
    </div>
  );
}
