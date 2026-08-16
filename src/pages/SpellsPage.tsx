import { useState, useMemo, useRef } from 'react';
import { useSpells } from '../hooks/useSpells';
import type { Spell } from '../types/dnd';
import { dualizeDescription } from '../utils/units';
import {
  Plus,
  Search,
  Download,
  Upload,
  Trash2,
  BookOpen,
  X,
} from 'lucide-react';

const SCHOOL_LABELS: Record<string, string> = {
  abjuration: 'Abjuración',
  conjuration: 'Conjuración',
  divination: 'Adivinación',
  enchantment: 'Encantamiento',
  evocation: 'Evocación',
  illusion: 'Ilusión',
  necromancy: 'Nigromancia',
  transmutation: 'Transmutación',
};

const LEVEL_LABELS = (n: number) => (n === 0 ? 'Truco' : `Nivel ${n}`);

export function SpellsPage() {
  const {
    spells,
    loading,
    addHomebrew,
    deleteHomebrew,
    exportHomebrew,
    importHomebrew,
  } = useSpells();

  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [selected, setSelected] = useState<Spell | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    level: 0,
    school: 'evocation',
    castingTime: '1 acción',
    range: '30 feet',
    components: 'V, S',
    duration: 'Instantáneo',
    description: '',
    damage: '',
    damageType: '',
    higherLevels: '',
    concentration: false,
    ritual: false,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const schools = useMemo(() => {
    const set = new Set(spells.map((s) => s.school));
    return Array.from(set).sort();
  }, [spells]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return spells
      .filter((s) => {
        if (levelFilter !== 'all' && s.level !== levelFilter) return false;
        if (schoolFilter !== 'all' && s.school !== schoolFilter) return false;
        if (!q) return true;
        return (
          s.name.toLowerCase().includes(q) ||
          (s.nameEn && s.nameEn.toLowerCase().includes(q)) ||
          s.description.toLowerCase().includes(q) ||
          s.school.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }, [spells, query, levelFilter, schoolFilter]);

  const handleCreate = () => {
    if (!form.name.trim() || !form.description.trim()) {
      alert('Nombre y descripción son obligatorios');
      return;
    }
    const spell = addHomebrew({
      name: form.name.trim(),
      level: form.level,
      school: form.school,
      castingTime: form.castingTime,
      range: form.range,
      components: form.components,
      duration: form.duration,
      description: form.description.trim(),
      damage: form.damage || undefined,
      damageType: form.damageType || undefined,
      higherLevels: form.higherLevels || undefined,
      concentration: form.concentration || undefined,
      ritual: form.ritual || undefined,
    });
    setShowForm(false);
    setSelected(spell);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const n = await importHomebrew(file);
      alert(`Importados ${n} conjuros homebrew`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al importar');
    }
    e.target.value = '';
  };

  if (loading) {
    return <div className="text-center py-16 text-ink-500">Cargando conjuros...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-ink-900">Conjuros</h1>
          <p className="text-ink-600 text-sm mt-1">
            {spells.length} conjuros · SRD 5e + homebrew
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-crimson-600 hover:bg-crimson-700 text-white rounded-lg font-medium shadow"
          >
            <Plus className="w-4 h-4" /> Homebrew
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-ink-800 hover:bg-ink-700 text-parchment-50 rounded-lg text-sm"
          >
            <Upload className="w-4 h-4" /> Importar
          </button>
          <button
            onClick={exportHomebrew}
            className="flex items-center gap-2 px-3 py-2 bg-ink-200 hover:bg-ink-300 rounded-lg text-sm"
          >
            <Download className="w-4 h-4" /> Exportar HB
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="Buscar conjuro..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border-2 border-ink-300 rounded-lg bg-white focus:outline-none focus:border-crimson-600"
          />
        </div>
        <select
          value={levelFilter === 'all' ? 'all' : String(levelFilter)}
          onChange={(e) =>
            setLevelFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))
          }
          className="px-3 py-2 border-2 border-ink-300 rounded-lg bg-white text-sm"
        >
          <option value="all">Todos los niveles</option>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <option key={n} value={n}>
              {LEVEL_LABELS(n)}
            </option>
          ))}
        </select>
        <select
          value={schoolFilter}
          onChange={(e) => setSchoolFilter(e.target.value)}
          className="px-3 py-2 border-2 border-ink-300 rounded-lg bg-white text-sm"
        >
          <option value="all">Todas las escuelas</option>
          {schools.map((s) => (
            <option key={s} value={s}>
              {SCHOOL_LABELS[s] || s}
            </option>
          ))}
        </select>
      </div>

      {/* menu-movil-catalogo */}
      <div className="lg:hidden mb-3">
        <label className="block text-xs font-bold text-ink-600 mb-1">Conjuro</label>
        <select
          className="w-full px-3 py-2.5 border-2 border-ink-800 rounded-xl bg-parchment-100 text-sm font-medium"
          value={selected?.id || ''}
          onChange={(e) => {
            const s = filtered.find((x) => x.id === e.target.value) || spells.find((x) => x.id === e.target.value);
            if (s) setSelected(s);
          }}
        >
          <option value="">— Elegir conjuro —</option>
          {filtered.map((sp) => (
            <option key={sp.id} value={sp.id}>
              {sp.name}{sp.homebrew ? ' (HB)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="hidden lg:block lg:col-span-2 bg-parchment-100 border-2 border-ink-800 rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto">
          {filtered.map((spell) => (
            <button
              key={spell.id}
              onClick={() => setSelected(spell)}
              className={`w-full text-left px-4 py-3 border-b border-ink-200 hover:bg-parchment-200 transition-colors ${
                selected?.id === spell.id ? 'bg-parchment-200 border-l-4 border-l-crimson-600' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium flex-1 truncate">
                  {spell.name}
                  {spell.nameEn && (
                    <span className="ml-1 text-[10px] font-normal text-ink-400">({spell.nameEn})</span>
                  )}
                </span>
                {spell.homebrew && (
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                    HB
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-ink-500">
                <span>{LEVEL_LABELS(spell.level)}</span>
                <span>·</span>
                <span>{SCHOOL_LABELS[spell.school] || spell.school}</span>
                {spell.damage && (
                  <>
                    <span>·</span>
                    <span className="text-red-700">
                      {spell.damage} {spell.damageType}
                    </span>
                  </>
                )}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="p-6 text-ink-500 text-sm italic text-center">Sin resultados</p>
          )}
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-parchment-100 border-2 border-ink-800 rounded-xl p-6">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h2 className="text-2xl font-display font-bold">
                    {selected.name}
                    {selected.nameEn && (
                      <span className="ml-2 text-sm font-normal text-ink-400">({selected.nameEn})</span>
                    )}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-ink-800 text-parchment-50 px-2 py-1 rounded">
                      {LEVEL_LABELS(selected.level)}
                    </span>
                    <span className="text-xs bg-ink-200 px-2 py-1 rounded">
                      {SCHOOL_LABELS[selected.school] || selected.school}
                    </span>
                    {selected.concentration && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Concentración
                      </span>
                    )}
                    {selected.ritual && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Ritual
                      </span>
                    )}
                    {selected.homebrew && (
                      <span className="text-xs bg-amber-200 text-amber-900 px-2 py-1 rounded font-bold">
                        Homebrew
                      </span>
                    )}
                  </div>
                </div>
                {selected.homebrew && (
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar "${selected.name}"?`)) {
                        deleteHomebrew(selected.id);
                        setSelected(null);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-4 bg-white border border-ink-200 rounded-lg p-3">
                <div>
                  <span className="text-ink-500 text-xs uppercase font-bold">Tiempo</span>
                  <div>{dualizeDescription(selected.castingTime)}</div>
                </div>
                <div>
                  <span className="text-ink-500 text-xs uppercase font-bold">Alcance</span>
                  <div>{dualizeDescription(selected.range)}</div>
                </div>
                <div>
                  <span className="text-ink-500 text-xs uppercase font-bold">Componentes</span>
                  <div>{selected.components}</div>
                </div>
                <div>
                  <span className="text-ink-500 text-xs uppercase font-bold">Duración</span>
                  <div>{dualizeDescription(selected.duration)}</div>
                </div>
              </div>

              <p className="text-ink-800 leading-relaxed whitespace-pre-wrap mb-4">
                {dualizeDescription(selected.description)}
              </p>

              {selected.damage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm mb-2">
                  <strong>Daño:</strong> {selected.damage} {selected.damageType}
                </div>
              )}
              {selected.higherLevels && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                  <strong>A niveles superiores:</strong> {selected.higherLevels}
                </div>
              )}
              {selected.classes && selected.classes.length > 0 && (
                <div className="mt-3 text-xs text-ink-500">
                  Clases: {selected.classes.join(', ')}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-parchment-100 border-2 border-dashed border-ink-300 rounded-xl p-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-ink-400 mb-3" />
              <p className="text-ink-600">Selecciona un conjuro para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 pb-24 sm:p-4 sm:pb-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-parchment-50 border-2 border-ink-900 rounded-xl p-6 w-full max-w-lg max-h-[min(90dvh,calc(100dvh-7rem))] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Nuevo conjuro homebrew</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-ink-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold mb-1">Nombre *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-1">Nivel</label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        {LEVEL_LABELS(n)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Escuela</label>
                  <select
                    value={form.school}
                    onChange={(e) => setForm({ ...form, school: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
                  >
                    {Object.entries(SCHOOL_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-1">Tiempo de lanzamiento</label>
                  <input
                    value={form.castingTime}
                    onChange={(e) => setForm({ ...form, castingTime: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Alcance</label>
                  <input
                    value={form.range}
                    onChange={(e) => setForm({ ...form, range: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-1">Componentes</label>
                  <input
                    value={form.components}
                    onChange={(e) => setForm({ ...form, components: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Duración</label>
                  <input
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Descripción *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-1">Daño</label>
                  <input
                    value={form.damage}
                    onChange={(e) => setForm({ ...form, damage: e.target.value })}
                    placeholder="8d6"
                    className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Tipo de daño</label>
                  <input
                    value={form.damageType}
                    onChange={(e) => setForm({ ...form, damageType: e.target.value })}
                    placeholder="fuego"
                    className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.concentration}
                    onChange={(e) => setForm({ ...form, concentration: e.target.checked })}
                  />
                  Concentración
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.ritual}
                    onChange={(e) => setForm({ ...form, ritual: e.target.checked })}
                  />
                  Ritual
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-2 bg-crimson-600 hover:bg-crimson-700 text-white rounded-lg font-medium"
              >
                Crear
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-ink-200 hover:bg-ink-300 rounded-lg"
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
