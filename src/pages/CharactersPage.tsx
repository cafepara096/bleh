import { useState, useRef } from 'react';
import { useCharacters } from '../hooks/useCharacters';
import { CharacterSheet } from '../components/character/CharacterSheet';
import { CharacterWizard } from '../components/character/CharacterWizard';
import type { Character } from '../types/dnd';
import {
  Plus,
  Upload,
  Download,
  Trash2,
  User,
  Heart,
  Shield,
} from 'lucide-react';
import { formatModifier, getModifier, calculateInitiative } from '../utils/character';

export function CharactersPage() {
  const {
    characters,
    loading,
    saveCharacter,
    deleteCharacter,
    exportCharacter,
    exportAll,
    importCharacter,
  } = useCharacters();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selected = characters.find((c) => c.id === selectedId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-ink-500">Cargando personajes...</div>
      </div>
    );
  }

  if (selected) {
    return (
      <CharacterSheet
        character={selected}
        onSave={saveCharacter}
        onBack={() => setSelectedId(null)}
        onExport={exportCharacter}
      />
    );
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const char = await importCharacter(file);
      setSelectedId(char.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al importar');
    }
    e.target.value = '';
  };

  const handleCreate = () => {
    setShowWizard(true);
  };

  if (showWizard) {
    return (
      <CharacterWizard
        onCancel={() => setShowWizard(false)}
        onComplete={(char) => {
          saveCharacter(char);
          setShowWizard(false);
          setSelectedId(char.id);
        }}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink-900">
          Hojas de Personaje
        </h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={handleCreate}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 bg-crimson-600 hover:bg-crimson-700 text-white rounded-lg font-medium shadow text-sm"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 bg-ink-800 hover:bg-ink-700 text-parchment-50 rounded-lg text-sm"
          >
            <Upload className="w-4 h-4" /> Importar
          </button>
          <button
            onClick={exportAll}
            className="flex-[1_1_100%] sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 bg-ink-200 hover:bg-ink-300 text-ink-900 rounded-lg text-sm"
          >
            <Download className="w-4 h-4" /> <span className="sm:inline">Exportar todos</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {characters.length === 0 ? (
        <div className="text-center py-16 bg-parchment-100 border-2 border-dashed border-ink-300 rounded-xl">
          <User className="w-12 h-12 mx-auto text-ink-400 mb-3" />
          <p className="text-ink-600 mb-4">No tienes personajes todavía</p>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-crimson-600 text-white rounded-lg hover:bg-crimson-700"
          >
            Crear con asistente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              onOpen={() => setSelectedId(char.id)}
              onDelete={() => {
                if (confirm(`¿Eliminar a ${char.name}?`)) {
                  deleteCharacter(char.id);
                }
              }}
              onExport={() => exportCharacter(char)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CharacterCard({
  character,
  onOpen,
  onDelete,
  onExport,
}: {
  character: Character;
  onOpen: () => void;
  onDelete: () => void;
  onExport: () => void;
}) {
  const hpPercent = Math.min(
    100,
    (character.hitPointCurrent / character.hitPointMax) * 100
  );

  return (
    <div
      className="bg-parchment-100 border-2 border-ink-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onOpen}
    >
      <div className="bg-ink-900 text-parchment-50 p-3">
        <h2 className="font-display font-bold text-lg truncate">{character.name}</h2>
        <p className="text-sm text-parchment-300">
          {character.race} {character.class} · Niv. {character.level}
        </p>
      </div>

      <div className="p-3 space-y-3">
        {/* HP bar */}
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-crimson-600 flex-shrink-0" />
          <div className="flex-1 h-3 bg-ink-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-crimson-600 transition-all"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono w-16 text-right">
            {character.hitPointCurrent}/{character.hitPointMax}
          </span>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            <span className="font-bold">{character.armorClass}</span>
          </div>
          <div>
            Inic. <span className="font-bold">{formatModifier(calculateInitiative(character))}</span>
          </div>
          <div>
            STR <span className="font-bold">{formatModifier(getModifier(character.abilityScores.str))}</span>
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onExport}
            className="flex-1 flex items-center justify-center gap-1 py-1 text-xs bg-ink-200 hover:bg-ink-300 rounded"
          >
            <Download className="w-3 h-3" /> Exportar
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-1 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
