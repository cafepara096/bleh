import { useState } from 'react';
import type { Character, InventoryItem } from '../../types/dnd';
import { Plus, Trash2, Package } from 'lucide-react';

interface Props {
  character: Character;
  onUpdate: (inventory: InventoryItem[]) => void;
}

export function InventoryPanel({ character, onUpdate }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, description: '' });

  const addItem = () => {
    if (!newItem.name.trim()) return;
    const item: InventoryItem = {
      id: crypto.randomUUID(),
      name: newItem.name.trim(),
      quantity: newItem.quantity || 1,
      description: newItem.description || undefined,
      equipped: false,
    };
    onUpdate([...character.inventory, item]);
    setNewItem({ name: '', quantity: 1, description: '' });
    setShowAdd(false);
  };

  const removeItem = (id: string) => {
    onUpdate(character.inventory.filter((i) => i.id !== id));
  };

  const toggleEquipped = (id: string) => {
    onUpdate(
      character.inventory.map((i) =>
        i.id === id ? { ...i, equipped: !i.equipped } : i
      )
    );
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) {
      removeItem(id);
      return;
    }
    onUpdate(
      character.inventory.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  };

  return (
    <div className="bg-parchment-100 border-2 border-ink-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          <h3 className="font-bold text-lg">Inventario</h3>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 px-2 py-1 bg-ink-800 text-parchment-50 rounded text-sm hover:bg-ink-700"
        >
          <Plus className="w-4 h-4" /> Añadir
        </button>
      </div>

      {showAdd && (
        <div className="mb-3 p-3 bg-parchment-200 rounded border border-ink-300 space-y-2">
          <input
            type="text"
            placeholder="Nombre del objeto"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="w-full px-2 py-1 border border-ink-400 rounded text-sm"
          />
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })
              }
              className="w-20 px-2 py-1 border border-ink-400 rounded text-sm"
            />
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="flex-1 px-2 py-1 border border-ink-400 rounded text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addItem}
              className="px-3 py-1 bg-green-700 text-white rounded text-sm hover:bg-green-600"
            >
              Guardar
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-3 py-1 bg-ink-300 rounded text-sm hover:bg-ink-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {character.inventory.length === 0 && (
          <p className="text-ink-500 text-sm italic">Sin objetos</p>
        )}
        {character.inventory.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-2 p-2 rounded border ${
              item.equipped
                ? 'bg-amber-50 border-amber-400'
                : 'bg-white border-ink-200'
            }`}
          >
            <button
              onClick={() => toggleEquipped(item.id)}
              className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 ${
                item.equipped ? 'bg-amber-500 border-amber-700' : 'border-ink-400'
              }`}
              title="Equipar / Desequipar"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{item.name}</span>
                {item.damage && (
                  <span className="text-xs bg-red-100 text-red-800 px-1 rounded">
                    {item.damage} {item.damageType}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-ink-600 mt-0.5">{item.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                className="w-12 px-1 py-0.5 border border-ink-300 rounded text-center text-sm"
              />
              <button
                onClick={() => removeItem(item.id)}
                className="p-1 text-red-600 hover:bg-red-100 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Currency */}
      <div className="mt-3 pt-3 border-t border-ink-300 flex flex-wrap gap-3 text-sm">
        {(['pp', 'gp', 'ep', 'sp', 'cp'] as const).map((coin) => (
          <div key={coin} className="flex items-center gap-1">
            <span className="font-bold uppercase text-xs text-ink-600">{coin}</span>
            <span className="font-mono">{character.currency[coin]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
