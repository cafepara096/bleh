import { useState, useEffect, useCallback, useMemo } from 'react';
import type { RaceData, FeatureEntry } from '../types/dnd';
import baseRaces from '../data/races.json';

const STORAGE_KEY = 'dnd-homebrew-races';

export function useRaces() {
  const [homebrew, setHomebrew] = useState<RaceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHomebrew(JSON.parse(stored));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!loading) localStorage.setItem(STORAGE_KEY, JSON.stringify(homebrew));
  }, [homebrew, loading]);

  const races: RaceData[] = useMemo(() => {
    const map = new Map((baseRaces as RaceData[]).map((r) => [r.id, r]));
    for (const hb of homebrew) {
      map.set(hb.id, hb);
    }
    return Array.from(map.values());
  }, [homebrew]);

  const addHomebrew = useCallback((data: Omit<RaceData, 'id' | 'homebrew'>) => {
    const race: RaceData = { ...data, id: `hb-${crypto.randomUUID()}`, homebrew: true };
    setHomebrew((prev) => [...prev, race]);
    return race;
  }, []);

  const updateHomebrew = useCallback((race: RaceData) => {
    setHomebrew((prev) => {
      const idx = prev.findIndex((r) => r.id === race.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...race, homebrew: true };
        return next;
      }
      // Override base race as homebrew copy
      return [...prev, { ...race, homebrew: true }];
    });
  }, []);

  const deleteHomebrew = useCallback((id: string) => {
    setHomebrew((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addTrait = useCallback((raceId: string, trait: FeatureEntry) => {
    setHomebrew((prev) => {
      const existing = prev.find((r) => r.id === raceId);
      const base = existing || (baseRaces as RaceData[]).find((r) => r.id === raceId);
      if (!base) return prev;
      const updated: RaceData = {
        ...base,
        id: existing ? raceId : raceId, // keep id for linking
        homebrew: true,
        traits: [...base.traits, trait],
      };
      if (existing) {
        return prev.map((r) => (r.id === raceId ? updated : r));
      }
      return [...prev, updated];
    });
  }, []);

  const removeTrait = useCallback((raceId: string, traitId: string) => {
    setHomebrew((prev) => {
      const existing = prev.find((r) => r.id === raceId);
      const base = existing || (baseRaces as RaceData[]).find((r) => r.id === raceId);
      if (!base) return prev;
      const updated: RaceData = {
        ...base,
        homebrew: true,
        traits: base.traits.filter((t) => t.id !== traitId),
      };
      if (existing) {
        return prev.map((r) => (r.id === raceId ? updated : r));
      }
      return [...prev, updated];
    });
  }, []);

  return { races, homebrew, loading, addHomebrew, updateHomebrew, deleteHomebrew, addTrait, removeTrait };
}
