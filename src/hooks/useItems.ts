import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Item } from '../types/dnd';
import baseItems from '../data/items.json';

const STORAGE_KEY = 'dnd-homebrew-items';

export function useItems() {
  const [homebrew, setHomebrew] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHomebrew(JSON.parse(stored));
      }
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

  const items: Item[] = useMemo(
    () => [...(baseItems as Item[]), ...homebrew],
    [homebrew]
  );

  const saveItem = useCallback((item: Item) => {
    setHomebrew((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => (i.id === item.id ? item : i));
      }
      // If editing a base item, store as homebrew override with same id marked homebrew
      return [...prev, { ...item, homebrew: true }];
    });
  }, []);

  const addHomebrew = useCallback((partial: Omit<Item, 'id' | 'homebrew'>) => {
    const item: Item = {
      ...partial,
      id: `hb-${crypto.randomUUID()}`,
      homebrew: true,
    };
    setHomebrew((prev) => [...prev, item]);
    return item;
  }, []);

  const deleteHomebrew = useCallback((id: string) => {
    setHomebrew((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const getItem = useCallback(
    (id: string) => items.find((i) => i.id === id),
    [items]
  );

  const exportHomebrew = useCallback(() => {
    const dataStr = JSON.stringify(homebrew, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'homebrew-items.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [homebrew]);

  const importHomebrew = useCallback((file: File) => {
    return new Promise<number>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const list: Item[] = Array.isArray(data) ? data : [data];
          const normalized = list.map((item) => ({
            ...item,
            id: item.id || `hb-${crypto.randomUUID()}`,
            homebrew: true,
          }));
          setHomebrew((prev) => {
            const ids = new Set(prev.map((i) => i.id));
            const fresh = normalized.filter((i) => !ids.has(i.id));
            return [...prev, ...fresh];
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
    items,
    homebrew,
    loading,
    saveItem,
    addHomebrew,
    deleteHomebrew,
    getItem,
    exportHomebrew,
    importHomebrew,
  };
}
