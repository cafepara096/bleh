import { useState, useEffect, useCallback, useMemo } from 'react';
import type { BackgroundData } from '../types/dnd';
import baseBackgrounds from '../data/backgrounds.json';

const STORAGE_KEY = 'dnd-homebrew-backgrounds';

export function useBackgrounds() {
  const [homebrew, setHomebrew] = useState<BackgroundData[]>([]);
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

  const backgrounds: BackgroundData[] = useMemo(
    () => [...(baseBackgrounds as BackgroundData[]), ...homebrew],
    [homebrew]
  );

  const addHomebrew = useCallback((data: Omit<BackgroundData, 'id' | 'homebrew'>) => {
    const bg: BackgroundData = {
      ...data,
      id: `hb-${crypto.randomUUID()}`,
      homebrew: true,
    };
    setHomebrew((prev) => [...prev, bg]);
    return bg;
  }, []);

  const deleteHomebrew = useCallback((id: string) => {
    setHomebrew((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { backgrounds, homebrew, loading, addHomebrew, deleteHomebrew };
}
