import { useState } from 'react';
import type { Character, CharacterFeature } from '../../types/dnd';
import { Plus, Trash2, Sparkles } from 'lucide-react';

interface Props {
  character: Character;
  onUpdate: (features: CharacterFeature[]) => void;
}

export function FeaturesPanel({ character, onUpdate }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newFeature, setNewFeature] = useState({
    name: '',
    description: '',
    source: 'homebrew',
    hasUses: false,
    maxUses: 1,
    recovery: 'short' as 'short' | 'long' | 'dawn' | 'none',
    actionType: '' as '' | 'action' | 'bonus' | 'reaction' | 'special' | 'passive',
  });

  const addFeature = () => {
    if (!newFeature.name.trim()) return;
    const feature: CharacterFeature = {
      id: crypto.randomUUID(),
      name: newFeature.name.trim(),
      description: newFeature.description.trim(),
      source: newFeature.source,
      actionType: newFeature.actionType || undefined,
      uses: newFeature.hasUses
        ? {
            current: newFeature.maxUses,
            max: newFeature.maxUses,
            recovery: newFeature.recovery,
            baseMax: newFeature.maxUses,
          }
        : undefined,
    };
    onUpdate([...character.features, feature]);
    setNewFeature({
      name: '',
      description: '',
      source: 'homebrew',
      hasUses: false,
      maxUses: 1,
      recovery: 'short',
      actionType: '',
    });
    setShowAdd(false);
  };

  const removeFeature = (id: string) => {
    onUpdate(character.features.filter((f) => f.id !== id));
  };

  const spend = (id: string) => {
    onUpdate(
      character.features.map((f) =>
        f.id === id && f.uses && f.uses.current > 0
          ? { ...f, uses: { ...f.uses, current: f.uses.current - 1 } }
          : f
      )
    );
  };

  const restore = (id: string) => {
    onUpdate(
      character.features.map((f) =>
        f.id === id && f.uses && f.uses.current < f.uses.max
          ? { ...f, uses: { ...f.uses, current: f.uses.current + 1 } }
          : f
      )
    );
  };

  return (
    <div className="bg-parchment-100 border-2 border-ink-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-bold text-lg">Rasgos y Características</h3>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 px-2 py-1 bg-ink-800 text-parchment-50 rounded text-sm hover:bg-ink-700"
        >
          <Plus className="w-4 h-4" /> Añadir
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 p-3 bg-white border-2 border-ink-300 rounded-lg space-y-2">
          <input
            placeholder="Nombre"
            value={newFeature.name}
            onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
            className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
          />
          <textarea
            placeholder="Descripción"
            value={newFeature.description}
            onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
          />
          <select
            value={newFeature.actionType}
            onChange={(e) => setNewFeature({ ...newFeature, actionType: e.target.value as any })}
            className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg text-sm"
          >
            <option value="">Tipo de acción</option>
            <option value="action">Acción</option>
            <option value="bonus">Acción adicional</option>
            <option value="reaction">Reacción</option>
            <option value="special">Especial</option>
            <option value="passive">Pasivo</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newFeature.hasUses}
              onChange={(e) => setNewFeature({ ...newFeature, hasUses: e.target.checked })}
            />
            Usos limitados
          </label>
          {newFeature.hasUses && (
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={newFeature.maxUses}
                onChange={(e) =>
                  setNewFeature({ ...newFeature, maxUses: parseInt(e.target.value) || 1 })
                }
                className="w-20 px-2 py-1 border rounded"
              />
              <select
                value={newFeature.recovery}
                onChange={(e) =>
                  setNewFeature({ ...newFeature, recovery: e.target.value as any })
                }
                className="flex-1 px-2 py-1 border rounded text-sm"
              >
                <option value="short">Descanso corto</option>
                <option value="long">Descanso largo</option>
                <option value="dawn">Amanecer</option>
              </select>
            </div>
          )}
          <button
            onClick={addFeature}
            className="w-full py-2 bg-crimson-600 text-white rounded-lg font-medium"
          >
            Crear rasgo
          </button>
        </div>
      )}

      <div className="space-y-2">
        {character.features.map((f) => (
          <div
            key={f.id}
            className="bg-white border border-ink-200 rounded-lg p-3 flex gap-2 group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{f.name}</span>
                {f.source && (
                  <span className="text-[10px] bg-ink-100 px-1.5 rounded capitalize">{f.source}</span>
                )}
                {f.actionType && (
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 rounded">
                    {f.actionType}
                  </span>
                )}
              </div>
              <p className="text-sm text-ink-700 mt-1 whitespace-pre-wrap">{f.description}</p>
            </div>
            {f.uses && (
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <div className="flex flex-wrap gap-1 justify-center max-w-[72px]">
                  {Array.from({ length: f.uses.max }).map((_, i) => {
                    const used = f.uses!.max - f.uses!.current;
                    const isUsed = i < used;
                    return (
                      <button
                        key={i}
                        type="button"
                        title={isUsed ? 'Disponible' : 'Usado'}
                        onClick={() => (isUsed ? restore(f.id) : spend(f.id))}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center text-[10px] font-bold ${
                          isUsed
                            ? 'bg-ink-800 border-ink-900 text-white'
                            : 'bg-white border-ink-600 hover:bg-ink-100'
                        }`}
                      >
                        {isUsed ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>
                <span className="text-[10px] font-mono font-bold">
                  {f.uses.current}/{f.uses.max}
                </span>
                <span className="text-[9px] text-ink-500 uppercase">
                  {f.uses.recovery === 'short'
                    ? 'Desc. corto'
                    : f.uses.recovery === 'long'
                    ? 'Desc. largo'
                    : f.uses.recovery}
                </span>
              </div>
            )}
            <button
              onClick={() => removeFeature(f.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded h-fit"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {character.features.length === 0 && (
          <p className="text-sm text-ink-500 italic text-center py-4">Sin rasgos</p>
        )}
      </div>
    </div>
  );
}
