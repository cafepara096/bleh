import { useState, useEffect, useCallback } from 'react';
import type { Character } from '../types/dnd';
import { createEmptyCharacter } from '../utils/character';
import { exportCharacterWithPrompt, importCharacterBundle } from '../utils/characterBundle';
import sampleCharacter from '../data/sample-character.json';

const STORAGE_KEY = 'dnd-homebrew-characters';

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCharacters(JSON.parse(stored));
      } else {
        // Seed with sample character
        setCharacters([sampleCharacter as Character]);
      }
    } catch {
      setCharacters([sampleCharacter as Character]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Persist whenever characters change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
    }
  }, [characters, loading]);

  const saveCharacter = useCallback((character: Character) => {
    setCharacters(prev => {
      const exists = prev.find(c => c.id === character.id);
      const updated = {
        ...character,
        updatedAt: new Date().toISOString(),
      };
      if (exists) {
        return prev.map(c => (c.id === character.id ? updated : c));
      }
      return [...prev, updated];
    });
  }, []);

  const deleteCharacter = useCallback((id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  }, []);

  const createCharacter = useCallback((name?: string) => {
    const newChar = createEmptyCharacter(name);
    setCharacters(prev => [...prev, newChar]);
    return newChar;
  }, []);

  const getCharacter = useCallback(
    (id: string) => characters.find(c => c.id === id),
    [characters]
  );

  const exportCharacter = useCallback((character: Character) => {
    exportCharacterWithPrompt(character);
  }, []);

  const exportAll = useCallback(() => {
    const dataStr = JSON.stringify(characters, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'characters.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [characters]);

  const importCharacter = useCallback((file: File) => {
    return new Promise<Character>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const character = importCharacterBundle(data);
          saveCharacter(character);
          resolve(character);
        } catch {
          reject(new Error('No se pudo leer el archivo'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });
  }, [saveCharacter]);

  return {
    characters,
    loading,
    saveCharacter,
    deleteCharacter,
    createCharacter,
    getCharacter,
    exportCharacter,
    exportAll,
    importCharacter,
  };
}
