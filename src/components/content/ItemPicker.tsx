import { useState, useMemo } from 'react';
import type { Item, InventoryItem } from '../../types/dnd';
import { formatWeight, dualizeDescription } from '../../utils/units';
import { X, Search, Plus } from 'lucide-react';

interface Props {
  items: Item[];
  onSelect: (item: InventoryItem) => void;
  onClose: () => void;
  /** Label for the add button (e.g. "Añadir a la mochila") */
  addLabel?: string;
}

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

export function ItemPicker({ items, onSelect, onClose, addLabel }: Props) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState(1);

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
        item.description.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
      );
    });
  }, [items, query, typeFilter]);

  const handleAdd = () => {
    if (!selected) return;
    const inv: InventoryItem = {
      id: crypto.randomUUID(),
      catalogId: selected.id,
      name: selected.name,
      quantity: quantity || 1,
      weight: selected.weight,
      description: selected.description,
      damage: selected.damage,
      damageType: selected.damageType,
      properties: selected.properties,
      armorClass: selected.armorClass,
      armorDexMod: selected.armorDexMod,
      equipped: false,
      proficient: !!selected.damage,
    };
    onSelect(inv);
    setSelected(null);
    setQuantity(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end items-stretch">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-parchment-50 border-l-4 border-ink-900 shadow-2xl flex flex-col h-full max-h-[100dvh] pb-[env(safe-area-inset-bottom)] animate-slide-in">
        {/* Header */}
        <div className="bg-ink-900 text-parchment-50 p-4 flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Catálogo de Objetos</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-ink-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & filters */}
        <div className="p-3 border-b border-ink-200 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Buscar objeto..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border-2 border-ink-300 rounded-lg text-sm bg-white focus:outline-none focus:border-crimson-600"
              autoFocus
            />
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2 py-1 rounded text-xs font-medium ${
                typeFilter === 'all'
                  ? 'bg-crimson-600 text-white'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              Todos
            </button>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  typeFilter === t
                    ? 'bg-crimson-600 text-white'
                    : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                }`}
              >
                {TYPE_LABELS[t] || t}
              </button>
            ))}
          </div>
        </div>

        {/* List + detail */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="p-4 text-ink-500 text-sm italic">Sin resultados</p>
            )}
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className={`w-full text-left px-4 py-2.5 border-b border-ink-100 hover:bg-parchment-200 transition-colors ${
                  selected?.id === item.id ? 'bg-parchment-200 border-l-4 border-l-crimson-600' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm flex-1 truncate">
                    {item.name}
                    {item.nameEn && (
                      <span className="ml-1 text-[10px] font-normal text-ink-400">({item.nameEn})</span>
                    )}
                  </span>
                  {item.homebrew && (
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-1 rounded">HB</span>
                  )}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                      RARITY_COLORS[item.rarity] || 'bg-ink-100'
                    }`}
                  >
                    {item.rarity}
                  </span>
                </div>
                <div className="text-xs text-ink-500 mt-0.5">
                  {TYPE_LABELS[item.type] || item.type}
                  {item.damage && ` · ${item.damage} ${item.damageType || ''}`}
                  {item.armorClass && ` · CA ${item.armorClass}`}
                </div>
              </button>
            ))}
          </div>

          {/* Selected detail */}
          {selected && (
            <div className="border-t-2 border-ink-800 bg-white p-4 space-y-3 max-h-[40%] overflow-y-auto">
              <div>
                <h3 className="font-bold text-lg">{selected.name}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-xs bg-ink-100 px-1.5 py-0.5 rounded">
                    {TYPE_LABELS[selected.type] || selected.type}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded capitalize ${
                      RARITY_COLORS[selected.rarity] || 'bg-ink-100'
                    }`}
                  >
                    {selected.rarity}
                  </span>
                  {selected.attunement && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                      Sintonización
                    </span>
                  )}
                  {selected.cost && selected.cost !== '—' && (
                    <span className="text-xs bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded">
                      {selected.cost}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-ink-700 whitespace-pre-wrap leading-relaxed">
                {dualizeDescription(selected.description)}
              </p>

              {(selected.damage || selected.armorClass || selected.properties?.length) && (
                <div className="text-xs space-y-1 bg-parchment-100 p-2 rounded border border-ink-200">
                  {selected.damage && (
                    <div>
                      <strong>Daño:</strong> {selected.damage} {selected.damageType}
                    </div>
                  )}
                  {selected.armorClass && (
                    <div>
                      <strong>CA:</strong> {selected.armorClass}
                    </div>
                  )}
                  {selected.properties && selected.properties.length > 0 && (
                    <div>
                      <strong>Propiedades:</strong> {selected.properties.join(', ')}
                    </div>
                  )}
                  {selected.weight !== undefined && (
                    <div>
                      <strong>Peso:</strong> {formatWeight(selected.weight)}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 sticky bottom-0 bg-white pt-2 pb-2 sm:pb-0">
                <label className="text-sm font-medium">Cantidad:</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 border-2 border-ink-300 rounded text-center text-sm"
                />
                <button
                  onClick={handleAdd}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white rounded-lg text-sm font-medium"
                >
                  <Plus className="w-4 h-4" /> {addLabel || 'Añadir al inventario'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
