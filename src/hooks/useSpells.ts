import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Spell } from '../types/dnd';
import baseSpells from '../data/spells.json';

const STORAGE_KEY = 'dnd-homebrew-spells';

export function useSpells() {
  const [homebrew, setHomebrew] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHomebrew(JSON.parse(stored));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(homebrew));
    }
  }, [homebrew, loading]);

  const spells: Spell[] = useMemo(
    () => [...(baseSpells as Spell[]), ...homebrew],
    [homebrew]
  );

  const addHomebrew = useCallback((partial: Omit<Spell, 'id' | 'homebrew'>) => {
    const spell: Spell = {
      ...partial,
      id: `hb-${crypto.randomUUID()}`,
      homebrew: true,
    };
    setHomebrew((prev) => [...prev, spell]);
    return spell;
  }, []);

  const deleteHomebrew = useCallback((id: string) => {
    setHomebrew((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const exportHomebrew = useCallback(() => {
    const dataStr = JSON.stringify(homebrew, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'homebrew-spells.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [homebrew]);

  const importHomebrew = useCallback((file: File) => {
    return new Promise<number>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const list: Spell[] = Array.isArray(data) ? data : [data];
          const normalized = list.map((s) => ({
            ...s,
            id: s.id || `hb-${crypto.randomUUID()}`,
            homebrew: true as const,
          }));
          setHomebrew((prev) => {
            const ids = new Set(prev.map((x) => x.id));
            return [...prev, ...normalized.filter((x) => !ids.has(x.id))];
          });
          resolve(normalized.length);
        } catch {
          reject(new Error('Archivo JSON inválido'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });
  }, []);

  return {
    spells,
    homebrew,
    loading,
    addHomebrew,
    deleteHomebrew,
    exportHomebrew,
    importHomebrew,
  };
}
