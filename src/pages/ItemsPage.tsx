import { useState, useMemo, useRef } from 'react';
import { useItems } from '../hooks/useItems';
import type { Item } from '../types/dnd';
import { formatWeight, dualizeDescription } from '../utils/units';
import {
  Plus,
  Search,
  Download,
  Upload,
  Trash2,
  Scroll,
  X,
} from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  weapon: 'Arma',
  armor: 'Armadura',
  potion: 'Poción',
  wondrous: 'Maravilloso',
  ring: 'Anillo',
  gear: 'Equipo',
  tool: 'Herramienta',
};

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-ink-200 text-ink-800',
  uncommon: 'bg-green-100 text-green-800',
  rare: 'bg-blue-100 text-blue-800',
  'very rare': 'bg-purple-100 text-purple-800',
  legendary: 'bg-amber-100 text-amber-900',
};

const EMPTY_FORM: Omit<Item, 'id'> = {
  name: '',
  type: 'wondrous',
  rarity: 'common',
  description: '',
  homebrew: true,
};

export function ItemsPage() {
  const {
    items,
    loading,
    addHomebrew,
    deleteHomebrew,
    exportHomebrew,
    importHomebrew,
  } = useItems();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState<Item | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const fileRef = useRef<HTMLInputElement>(null);

  const types = useMemo(() => {
    const set = new Set(items.map((i) => i.type));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return items.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.nameEn && item.nameEn.toLowerCase().includes(q)) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [items, query, typeFilter]);

  const handleCreate = () => {
    if (!form.name.trim() || !form.description.trim()) {
      alert('Nombre y descripción son obligatorios');
      return;
    }
    const item = addHomebrew({
      name: form.name.trim(),
      type: form.type,
      rarity: form.rarity,
      description: form.description.trim(),
      damage: form.damage || undefined,
      damageType: form.damageType || undefined,
      properties: form.properties,
      armorClass: form.armorClass || undefined,
      armorDexMod: form.armorDexMod || undefined,
      weight: form.weight,
      cost: form.cost || undefined,
      attunement: form.attunement,
    });
    setShowForm(false);
    setForm(EMPTY_FORM);
    setSelected(item);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const n = await importHomebrew(file);
      alert(`Importados ${n} objetos homebrew`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al importar');
    }
    e.target.value = '';
  };

  if (loading) {
    return <div className="text-center py-16 text-ink-500">Cargando objetos...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-ink-900">Objetos</h1>
          <p className="text-ink-600 text-sm mt-1">
            {items.length} objetos · SRD 5e + homebrew
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setShowForm(true);
              setForm(EMPTY_FORM);
            }}
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
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border-2 border-ink-300 rounded-lg bg-white focus:outline-none focus:border-crimson-600"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              typeFilter === 'all' ? 'bg-crimson-600 text-white' : 'bg-ink-100 hover:bg-ink-200'
            }`}
          >
            Todos
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                typeFilter === t ? 'bg-crimson-600 text-white' : 'bg-ink-100 hover:bg-ink-200'
              }`}
            >
              {TYPE_LABELS[t] || t}
            </button>
          ))}
        </div>
      </div>

      {/* menu-movil-catalogo */}
      <div className="lg:hidden mb-3">
        <label className="block text-xs font-bold text-ink-600 mb-1">Objeto</label>
        <select
          className="w-full px-3 py-2.5 border-2 border-ink-800 rounded-xl bg-parchment-100 text-sm font-medium"
          value={selected?.id || ''}
          onChange={(e) => {
            const it = filtered.find((x) => x.id === e.target.value) || items.find((x) => x.id === e.target.value);
            if (it) setSelected(it);
          }}
        >
          <option value="">— Elegir objeto —</option>
          {filtered.map((it) => (
            <option key={it.id} value={it.id}>
              {it.name}{it.homebrew ? ' (HB)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* List */}
        <div className="hidden lg:block lg:col-span-2 bg-parchment-100 border-2 border-ink-800 rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className={`w-full text-left px-4 py-3 border-b border-ink-200 hover:bg-parchment-200 transition-colors ${
                selected?.id === item.id ? 'bg-parchment-200 border-l-4 border-l-crimson-600' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium flex-1 truncate">
                  {item.name}
                  {item.nameEn && (
                    <span className="ml-1 text-[10px] font-normal text-ink-400">({item.nameEn})</span>
                  )}
                </span>
                {item.homebrew && (
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                    HB
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-ink-500">{TYPE_LABELS[item.type] || item.type}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                    RARITY_COLORS[item.rarity] || 'bg-ink-100'
                  }`}
                >
                  {item.rarity}
                </span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="p-6 text-ink-500 text-sm italic text-center">Sin resultados</p>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-parchment-100 border-2 border-ink-800 rounded-xl p-6">
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-2xl font-display font-bold">
                    {selected.name}
                    {selected.nameEn && (
                      <span className="ml-2 text-sm font-normal text-ink-400">({selected.nameEn})</span>
                    )}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-ink-200 px-2 py-1 rounded">
                      {TYPE_LABELS[selected.type] || selected.type}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded capitalize ${
                        RARITY_COLORS[selected.rarity] || 'bg-ink-100'
                      }`}
                    >
                      {selected.rarity}
                    </span>
                    {selected.attunement && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Requiere sintonización
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

              <p className="text-ink-800 leading-relaxed whitespace-pre-wrap mb-4">
                {dualizeDescription(selected.description)}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {selected.damage && (
                  <div className="bg-white border border-ink-200 rounded-lg p-3">
                    <div className="text-xs text-ink-500 uppercase font-bold">Daño</div>
                    <div className="font-semibold">
                      {selected.damage} {selected.damageType}
                    </div>
                  </div>
                )}
                {selected.armorClass && (
                  <div className="bg-white border border-ink-200 rounded-lg p-3">
                    <div className="text-xs text-ink-500 uppercase font-bold">CA</div>
                    <div className="font-semibold">{selected.armorClass}</div>
                  </div>
                )}
                {selected.weight !== undefined && (
                  <div className="bg-white border border-ink-200 rounded-lg p-3">
                    <div className="text-xs text-ink-500 uppercase font-bold">Peso</div>
                    <div className="font-semibold">{formatWeight(selected.weight)}</div>
                  </div>
                )}
                {selected.cost && (
                  <div className="bg-white border border-ink-200 rounded-lg p-3">
                    <div className="text-xs text-ink-500 uppercase font-bold">Coste</div>
                    <div className="font-semibold">{selected.cost}</div>
                  </div>
                )}
                {selected.properties && selected.properties.length > 0 && (
                  <div className="bg-white border border-ink-200 rounded-lg p-3 col-span-2">
                    <div className="text-xs text-ink-500 uppercase font-bold">Propiedades</div>
                    <div className="font-semibold">{selected.properties.join(', ')}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-parchment-100 border-2 border-dashed border-ink-300 rounded-xl p-12 text-center">
              <Scroll className="w-12 h-12 mx-auto text-ink-400 mb-3" />
              <p className="text-ink-600">Selecciona un objeto para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>

      {/* Homebrew form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 pb-24 sm:p-4 sm:pb-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-parchment-50 border-2 border-ink-900 rounded-xl p-6 w-full max-w-lg max-h-[min(90dvh,calc(100dvh-7rem))] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Nuevo objeto homebrew</h2>
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
                  <label className="block text-sm font-bold mb-1">Tipo</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
                  >
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Rareza</label>
                  <select
                    value={form.rarity}
                    onChange={(e) => setForm({ ...form, rarity: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
                  >
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="very rare">Very Rare</option>
                    <option value="legendary">Legendary</option>
                  </select>
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
                    value={form.damage || ''}
                    onChange={(e) => setForm({ ...form, damage: e.target.value })}
                    placeholder="1d8"
                    className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Tipo de daño</label>
                  <input
                    value={form.damageType || ''}
                    onChange={(e) => setForm({ ...form, damageType: e.target.value })}
                    placeholder="cortante"
                    className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-1">CA base</label>
                  <input
                    value={form.armorClass || ''}
                    onChange={(e) => setForm({ ...form, armorClass: e.target.value })}
                    placeholder="11, 12, 14, 18…"
                    className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Mod. Destreza a la CA</label>
                  <select
                    value={form.armorDexMod || 'none'}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        armorDexMod: e.target.value as 'none' | 'full' | 'max2' | 'max3',
                      })
                    }
                    className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
                  >
                    <option value="none">Ninguno (pesada / escudo)</option>
                    <option value="full">Des completa (ligera)</option>
                    <option value="max2">Des máx. +2 (media)</option>
                    <option value="max3">Des máx. +3</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold mb-1">Coste</label>
                  <input
                    value={form.cost || ''}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    placeholder="50 gp"
                    className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.attunement || false}
                  onChange={(e) => setForm({ ...form, attunement: e.target.checked })}
                />
                Requiere sintonización
              </label>
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
