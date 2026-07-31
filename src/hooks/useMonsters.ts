import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Monster } from '../types/dnd';
import base from '../data/monsters.json';

const STORAGE_KEY = 'dnd-homebrew-monsters';

export function useMonsters() {
  const [homebrew, setHomebrew] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) setHomebrew(JSON.parse(s));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!loading) localStorage.setItem(STORAGE_KEY, JSON.stringify(homebrew));
  }, [homebrew, loading]);

  const monsters = useMemo(() => {
    const map = new Map<string, Monster>();
    for (const m of base as unknown as Monster[]) map.set(m.id, m);
    for (const m of homebrew) map.set(m.id, m);
    return Array.from(map.values());
  }, [homebrew]);

  const addHomebrew = useCallback((data: Omit<Monster, 'id' | 'homebrew'>) => {
    const m: Monster = { ...data, id: `hb-${crypto.randomUUID()}`, homebrew: true };
    setHomebrew((p) => [...p, m]);
    return m;
  }, []);

  const updateHomebrew = useCallback((m: Monster) => {
    setHomebrew((p) => {
      const i = p.findIndex((x) => x.id === m.id);
      if (i >= 0) {
        const n = [...p];
        n[i] = { ...m, homebrew: true };
        return n;
      }
      return [...p, { ...m, homebrew: true }];
    });
  }, []);

  const deleteHomebrew = useCallback((id: string) => {
    setHomebrew((p) => p.filter((m) => m.id !== id));
  }, []);

  return { monsters, homebrew, loading, addHomebrew, updateHomebrew, deleteHomebrew };
}
