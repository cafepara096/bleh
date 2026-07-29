import { useState } from 'react';
import type { Character, CharacterFeature } from '../../types/dnd';
import { Plus, Trash2, Sparkles } from 'lucide-react';

interface Props {
  character: Character;
  onUpdate: (features: CharacterFeature[]) => void;
}

export function FeaturesPanel({ character, onUpdate }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newFeature, setNewFeature] = useState({ name: '', description: '', source: 'homebrew' });

  const addFeature = () => {
    if (!newFeature.name.trim()) return;
    const feature: CharacterFeature = {
      id: crypto.randomUUID(),
      name: newFeature.name.trim(),
      description: newFeature.description.trim(),
      source: newFeature.source,
    };
    onUpdate([...character.features, feature]);
    setNewFeature({ name: '', description: '', source: 'homebrew' });
    setShowAdd(false);
  };

  const removeFeature = (id: string) => {
    onUpdate(character.features.filter((f) => f.id !== id));
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
        <div className="mb-3 p-3 bg-parchment-200 rounded border border-ink-300 space-y-2">
          <input
            type="text"
            placeholder="Nombre del rasgo"
            value={newFeature.name}
            onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
            className="w-full px-2 py-1 border border-ink-400 rounded text-sm"
          />
          <textarea
            placeholder="Descripción"
            value={newFeature.description}
            onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
            rows={3}
            className="w-full px-2 py-1 border border-ink-400 rounded text-sm"
          />
          <select
            value={newFeature.source}
            onChange={(e) => setNewFeature({ ...newFeature, source: e.target.value })}
            className="px-2 py-1 border border-ink-400 rounded text-sm"
          >
            <option value="class">Clase</option>
            <option value="subclass">Subclase</option>
            <option value="race">Raza</option>
            <option value="feat">Dote</option>
            <option value="background">Trasfondo</option>
            <option value="homebrew">Homebrew</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={addFeature}
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

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {character.features.length === 0 && (
          <p className="text-ink-500 text-sm italic">Sin rasgos</p>
        )}
        {character.features.map((feature) => (
          <div
            key={feature.id}
            className="p-2 bg-white border border-ink-200 rounded group"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold">{feature.name}</span>
                {feature.source && (
                  <span className="ml-2 text-xs bg-ink-200 text-ink-700 px-1.5 py-0.5 rounded capitalize">
                    {feature.source}
                  </span>
                )}
              </div>
              <button
                onClick={() => removeFeature(feature.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-100 rounded transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-ink-700 mt-1 whitespace-pre-wrap">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
