import { useState } from 'react';
import { useClasses } from '../hooks/useClasses';
import { useSpells } from '../hooks/useSpells';
import type { ClassData, FeatureEntry } from '../types/dnd';
import { FeatureTablesEditor } from '../components/content/FeatureTablesEditor';
import { dualizeDescription } from '../utils/units';
import { Plus, Trash2, Swords, X, Sparkles, BookOpen } from 'lucide-react';

export function ClassesPage() {
  const {classes,
    loading,
    addHomebrew,
    deleteHomebrew,
    addFeature,
    removeFeature,
    addSpellId,
    removeSpellId, updateHomebrew} = useClasses();
  const { spells } = useSpells();
  const [selected, setSelected] = useState<ClassData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showFeatForm, setShowFeatForm] = useState(false);
  const [showSpellPicker, setShowSpellPicker] = useState(false);
  const [featForm, setFeatForm] = useState({
    name: '',
    description: '',
    level: 1,
    hasUses: false,
    maxUses: 1,
    recovery: 'short' as 'short' | 'long' | 'dawn' | 'none',
    perLevels: 0,
    gainAmount: 1,
    actionType: '' as '' | 'action' | 'bonus' | 'reaction' | 'special' | 'passive',
    requiresChoice: false,
    choiceHint: '',
  });
  const [form, setForm] = useState({
    name: '',
    description: '',
    hitDie: 'd8',
    primaryAbility: '',
    savingThrows: '',
    armorProficiencies: '',
    weaponProficiencies: '',
    skillChoices: '',
  });

  if (loading) return <div className="text-center py-16 text-ink-500">Cargando clases...</div>;

  const current = selected ? classes.find((c) => c.id === selected.id) || selected : null;

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const cls = addHomebrew({
      name: form.name.trim(),
      description: form.description.trim() || 'Clase homebrew.',
      hitDie: form.hitDie,
      primaryAbility: form.primaryAbility || '—',
      savingThrows: form.savingThrows.split(',').map((s) => s.trim()).filter(Boolean),
      armorProficiencies: form.armorProficiencies || '—',
      weaponProficiencies: form.weaponProficiencies || '—',
      skillChoices: form.skillChoices || '—',
      features: [],
    });
    setShowForm(false);
    setSelected(cls);
  };

  const handleAddFeature = () => {
    if (!current || !featForm.name.trim()) return;
    const feature: FeatureEntry = {
      id: `feat-${crypto.randomUUID()}`,
      name: featForm.name.trim(),
      description: featForm.description.trim() || '—',
      level: featForm.level,
      source: 'homebrew',
      actionType: featForm.actionType || undefined,
      requiresChoice: featForm.requiresChoice || undefined,
      choiceHint: featForm.choiceHint || undefined,
      uses: featForm.hasUses
        ? {
            max: featForm.maxUses,
            recovery: featForm.recovery,
            perLevels: featForm.perLevels > 0 ? featForm.perLevels : undefined,
            gainAmount: featForm.perLevels > 0 ? featForm.gainAmount : undefined,
          }
        : undefined,
    };
    addFeature(current.id, feature);
    setFeatForm({
      name: '',
      description: '',
      level: 1,
      hasUses: false,
      maxUses: 1,
      recovery: 'short',
      perLevels: 0,
      gainAmount: 1,
      actionType: '',
      requiresChoice: false,
      choiceHint: '',
    });
    setShowFeatForm(false);
    setSelected({ ...current, features: [...current.features, feature], homebrew: true });
  };

  const linkedSpells = current?.spellcasting?.starterSpellIds || [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Clases</h1>
          <p className="text-ink-600 text-sm mt-1">{classes.length} clases · SRD 5e + homebrew</p>
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
        <label className="block text-xs font-bold text-ink-600 mb-1">Clase</label>
        <select
          className="w-full px-3 py-2.5 border-2 border-ink-800 rounded-xl bg-parchment-100 text-sm font-medium"
          value={current?.id || ''}
          onChange={(e) => {
            const c = classes.find((x) => x.id === e.target.value);
            if (c) setSelected(c);
          }}
        >
          <option value="">— Elegir clase —</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}{cls.homebrew ? ' (HB)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="hidden lg:block lg:col-span-2 bg-parchment-100 border-2 border-ink-800 rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto">
          {classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelected(cls)}
              className={`w-full text-left px-4 py-3 border-b border-ink-200 hover:bg-parchment-200 ${
                current?.id === cls.id ? 'bg-parchment-200 border-l-4 border-l-crimson-600' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium flex-1">{cls.name}</span>
                {cls.homebrew && (
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 rounded font-bold">HB</span>
                )}
              </div>
              <div className="text-xs text-ink-500 mt-0.5">
                {cls.hitDie} · {cls.primaryAbility}
                {cls.spellcasting && ' · Conjuros'}
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {current ? (
            <div className="bg-parchment-100 border-2 border-ink-800 rounded-xl p-6 space-y-4 max-h-[75vh] overflow-y-auto">
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
                  <div className="text-xs text-ink-500 uppercase font-bold">Dado de golpe</div>
                  <div className="font-semibold">{current.hitDie}</div>
                </div>
                <div className="bg-white border border-ink-200 rounded-lg p-3">
                  <div className="text-xs text-ink-500 uppercase font-bold">Característica principal</div>
                  <div className="font-semibold">{current.primaryAbility}</div>
                </div>
                <div className="bg-white border border-ink-200 rounded-lg p-3">
                  <div className="text-xs text-ink-500 uppercase font-bold">Salvaciones</div>
                  <div className="font-semibold">{current.savingThrows.join(', ')}</div>
                </div>
                {current.spellcasting && (
                  <div className="bg-white border border-ink-200 rounded-lg p-3">
                    <div className="text-xs text-ink-500 uppercase font-bold">Lanzamiento</div>
                    <div className="font-semibold capitalize">
                      {current.spellcasting.type} ({current.spellcasting.ability.toUpperCase()})
                    </div>
                  </div>
                )}
                <div className="bg-white border border-ink-200 rounded-lg p-3 col-span-2">
                  <div className="text-xs text-ink-500 uppercase font-bold">Armaduras</div>
                  <div className="font-semibold">{current.armorProficiencies}</div>
                </div>
                <div className="bg-white border border-ink-200 rounded-lg p-3 col-span-2">
                  <div className="text-xs text-ink-500 uppercase font-bold">Armas</div>
                  <div className="font-semibold">{current.weaponProficiencies}</div>
                </div>
                <div className="bg-white border border-ink-200 rounded-lg p-3 col-span-2">
                  <div className="text-xs text-ink-500 uppercase font-bold">Habilidades</div>
                  <div className="font-semibold">{current.skillChoices}</div>
                </div>
              </div>

              {/* Features */}

              
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    const name = prompt('Nombre de la subclase homebrew');
                    if (!name || !selected) return;
                    const desc = prompt('Descripción breve') || '';
                    const sub = {
                      id: `hb-sub-${crypto.randomUUID().slice(0, 8)}`,
                      name,
                      description: desc,
                      features: [
                        {
                          id: `hb-f-${crypto.randomUUID().slice(0, 8)}`,
                          name: 'Rasgo inicial',
                          description: 'Describe el rasgo de nivel 3…',
                          level: 3,
                          source: 'homebrew-subclass' as const,
                        },
                      ],
                    };
                    const updated = {
                      ...selected,
                      homebrew: true,
                      subclasses: [...(selected.subclasses || []), sub],
                    };
                    updateHomebrew(updated);
                    setSelected(updated);
                  }}
                  className="text-xs px-2 py-1 bg-purple-700 text-white rounded"
                >
                  + Añadir subclase homebrew
                </button>
                {(selected?.subclasses || []).map((s) => (
                  <div key={s.id} className="mt-2 text-xs">
                    <button
                      type="button"
                      className="text-purple-800 underline"
                      onClick={() => {
                        const fname = prompt('Nombre del nuevo rasgo de subclase');
                        if (!fname || !selected) return;
                        const flvl = parseInt(prompt('Nivel del rasgo', '3') || '3', 10);
                        const fdesc = prompt('Descripción') || '';
                        const feat = {
                          id: `hb-f-${crypto.randomUUID().slice(0, 8)}`,
                          name: fname,
                          description: fdesc,
                          level: flvl || 3,
                          source: 'homebrew-subclass' as const,
                        };
                        const updated = {
                          ...selected,
                          homebrew: true,
                          subclasses: selected.subclasses!.map((ss) =>
                            ss.id === s.id ? { ...ss, features: [...ss.features, feat] } : ss
                          ),
                        };
                        updateHomebrew(updated);
                        setSelected(updated);
                      }}
                    >
                      + Rasgo a {s.name}
                    </button>
                  </div>
                ))}
              </div>

              {current.subclasses && current.subclasses.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-bold mb-2">Subclases (PHB 2024)</h3>
                  <div className="space-y-2">
                    {current.subclasses.map((s) => (
                      <details key={s.id} className="bg-white border border-ink-200 rounded-lg p-3">
                        <summary className="cursor-pointer font-semibold text-sm">{s.name}</summary>
                        <p className="text-xs text-ink-600 mt-1">{s.description}</p>
                        <ul className="mt-2 space-y-1">
                          {s.features.map((f) => (
                            <li key={f.id} className="text-xs border-t border-ink-100 pt-1">
                              <strong>Niv. {f.level} — {f.name}:</strong> {f.description}
                              {f.requiresChoice && (
                                <span className="ml-1 text-amber-800">(requiere elección)</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </details>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Características por nivel
                  </h3>
                  <button
                    onClick={() => setShowFeatForm(true)}
                    className="text-xs px-2 py-1 bg-ink-800 text-parchment-50 rounded hover:bg-ink-700"
                  >
                    + Característica
                  </button>
                </div>
                <div className="space-y-2">
                  {[...current.features]
                    .sort((a, b) => a.level - b.level)
                    .map((f) => (
                      <div key={f.id} className="bg-white border border-ink-200 rounded-lg p-3 group">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs bg-ink-200 px-1.5 py-0.5 rounded mr-2">Niv. {f.level}</span>
                            <span className="font-semibold">{f.name}</span>
                          </div>
                          <button
                            onClick={() => {
                              removeFeature(current.id, f.id);
                              setSelected({
                                ...current,
                                features: current.features.filter((x) => x.id !== f.id),
                                homebrew: true,
                              });
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-sm text-ink-700 mt-1">{dualizeDescription(f.description)}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Linked spells */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Conjuros vinculados
                  </h3>
                  <button
                    onClick={() => setShowSpellPicker(true)}
                    className="text-xs px-2 py-1 bg-ink-800 text-parchment-50 rounded hover:bg-ink-700"
                  >
                    + Conjuro
                  </button>
                </div>
                {linkedSpells.length === 0 ? (
                  <p className="text-sm text-ink-500 italic">Ningún conjuro vinculado. Útil para semillas al crear personajes.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {linkedSpells.map((sid) => {
                      const sp = spells.find((s) => s.id === sid);
                      return (
                        <span
                          key={sid}
                          className="inline-flex items-center gap-1 bg-purple-50 border border-purple-200 text-purple-900 px-2 py-1 rounded text-sm"
                        >
                          {sp?.name || sid}
                          <button
                            onClick={() => {
                              removeSpellId(current.id, sid);
                              setSelected({
                                ...current,
                                homebrew: true,
                                spellcasting: current.spellcasting
                                  ? {
                                      ...current.spellcasting,
                                      starterSpellIds: linkedSpells.filter((x) => x !== sid),
                                    }
                                  : undefined,
                              });
                            }}
                            className="text-red-600 hover:bg-red-100 rounded p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-parchment-100 border-2 border-dashed border-ink-300 rounded-xl p-12 text-center">
              <Swords className="w-12 h-12 mx-auto text-ink-400 mb-3" />
              <p className="text-ink-600">Selecciona una clase</p>
            </div>
          )}
        </div>
      </div>

      {/* Create class modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 pb-24 sm:p-4 sm:pb-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-parchment-50 border-2 border-ink-900 rounded-xl p-6 w-full max-w-md space-y-3 max-h-[min(90dvh,calc(100dvh-7rem))] overflow-y-auto">
            <h2 className="text-xl font-bold">Nueva clase homebrew</h2>
            <input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg" />
            <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg" />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.hitDie} onChange={(e) => setForm({ ...form, hitDie: e.target.value })} className="px-3 py-2 border-2 border-ink-300 rounded-lg">
                {['d6', 'd8', 'd10', 'd12'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <input placeholder="Característica principal" value={form.primaryAbility} onChange={(e) => setForm({ ...form, primaryAbility: e.target.value })} className="px-3 py-2 border-2 border-ink-300 rounded-lg" />
            </div>
            <input placeholder="Salvaciones (coma)" value={form.savingThrows} onChange={(e) => setForm({ ...form, savingThrows: e.target.value })} className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg" />
            <input placeholder="Armaduras" value={form.armorProficiencies} onChange={(e) => setForm({ ...form, armorProficiencies: e.target.value })} className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg" />
            <input placeholder="Armas" value={form.weaponProficiencies} onChange={(e) => setForm({ ...form, weaponProficiencies: e.target.value })} className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg" />
            <input placeholder="Habilidades" value={form.skillChoices} onChange={(e) => setForm({ ...form, skillChoices: e.target.value })} className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg" />
            <button onClick={handleCreate} className="w-full py-2 bg-crimson-600 text-white rounded-lg font-medium">Crear</button>
          </div>
        </div>
      )}

      {showFeatForm && current && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 pb-24 sm:p-4 sm:pb-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFeatForm(false)} />
          <div className="relative bg-parchment-50 border-2 border-ink-900 rounded-xl p-6 w-full max-w-md max-h-[min(90dvh,calc(100dvh-7rem))] overflow-y-auto space-y-3">
            <h2 className="text-xl font-bold">Añadir característica</h2>
            <input placeholder="Nombre *" value={featForm.name} onChange={(e) => setFeatForm({ ...featForm, name: e.target.value })} className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg" />
            <input type="number" min={1} max={20} placeholder="Nivel" value={featForm.level} onChange={(e) => setFeatForm({ ...featForm, level: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg" />
            <textarea placeholder="Descripción" value={featForm.description} onChange={(e) => setFeatForm({ ...featForm, description: e.target.value })} rows={3} className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg" />
            <select
              value={featForm.actionType}
              onChange={(e) => setFeatForm({ ...featForm, actionType: e.target.value as any })}
              className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg text-sm"
            >
              <option value="">Tipo de acción (opcional)</option>
              <option value="action">Acción</option>
              <option value="bonus">Acción adicional</option>
              <option value="reaction">Reacción</option>
              <option value="special">Especial</option>
              <option value="passive">Pasivo</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={featForm.hasUses}
                onChange={(e) => setFeatForm({ ...featForm, hasUses: e.target.checked })}
              />
              Usos limitados
            </label>
            {featForm.hasUses && (
              <div className="bg-ink-50 border border-ink-200 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-bold">Usos base</label>
                    <input
                      type="number"
                      min={1}
                      value={featForm.maxUses}
                      onChange={(e) => setFeatForm({ ...featForm, maxUses: parseInt(e.target.value) || 1 })}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold">Recuperación</label>
                    <select
                      value={featForm.recovery}
                      onChange={(e) => setFeatForm({ ...featForm, recovery: e.target.value as any })}
                      className="w-full px-2 py-1 border rounded"
                    >
                      <option value="short">Descanso corto</option>
                      <option value="long">Descanso largo</option>
                      <option value="dawn">Amanecer</option>
                      <option value="none">No se recupera solo</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-xs font-bold">+ usos cada N niveles</label>
                    <input
                      type="number"
                      min={0}
                      value={featForm.perLevels}
                      onChange={(e) => setFeatForm({ ...featForm, perLevels: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border rounded"
                      placeholder="0 = no escala"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold">Cantidad que suma</label>
                    <input
                      type="number"
                      min={1}
                      value={featForm.gainAmount}
                      onChange={(e) => setFeatForm({ ...featForm, gainAmount: parseInt(e.target.value) || 1 })}
                      className="w-full px-2 py-1 border rounded"
                      disabled={featForm.perLevels <= 0}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-ink-500">
                  Ej. Segundo aliento: 1 uso, descanso corto. Furia: 2 usos, +1 cada ciertos niveles.
                </p>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={featForm.requiresChoice}
                onChange={(e) => setFeatForm({ ...featForm, requiresChoice: e.target.checked })}
              />
              Requiere elección al obtenerse
            </label>
            {featForm.requiresChoice && (
              <input
                placeholder="Pista de elección (estilo de combate, subclase…)"
                value={featForm.choiceHint}
                onChange={(e) => setFeatForm({ ...featForm, choiceHint: e.target.value })}
                className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg text-sm"
              />
            )}
            <button onClick={handleAddFeature} className="w-full py-2 bg-crimson-600 text-white rounded-lg font-medium">Añadir</button>
          </div>
        </div>
      )}

      {showSpellPicker && current && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 pb-24 sm:p-4 sm:pb-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSpellPicker(false)} />
          <div className="relative bg-parchment-50 border-2 border-ink-900 rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-3">Vincular conjuro a {current.name}</h2>
            <div className="space-y-1">
              {spells.map((s) => (
                <button
                  key={s.id}
                  disabled={linkedSpells.includes(s.id)}
                  onClick={() => {
                    addSpellId(current.id, s.id);
                    setSelected({
                      ...current,
                      homebrew: true,
                      spellcasting: {
                        ability: current.spellcasting?.ability || 'cha',
                        type: current.spellcasting?.type || 'full',
                        starterSpellIds: [...linkedSpells, s.id],
                      },
                    });
                  }}
                  className={`w-full text-left px-3 py-2 rounded border text-sm ${
                    linkedSpells.includes(s.id)
                      ? 'bg-ink-100 text-ink-400 cursor-not-allowed'
                      : 'bg-white hover:bg-parchment-200 border-ink-200'
                  }`}
                >
                  {s.name} · niv. {s.level}
                </button>
              ))}
            </div>
            <button onClick={() => setShowSpellPicker(false)} className="mt-4 w-full py-2 bg-ink-200 rounded-lg">Cerrar</button>
          </div>
        </div>
      )}

      <div className="mt-8">
        <FeatureTablesEditor />
      </div>
    </div>
  );
}
