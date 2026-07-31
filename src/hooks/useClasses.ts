import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ClassData, FeatureEntry } from '../types/dnd';
import { SUBCLASSES } from '../utils/characterBuilder';
import baseClasses from '../data/classes.json';

const STORAGE_KEY = 'dnd-homebrew-classes';

export function useClasses() {
  const [homebrew, setHomebrew] = useState<ClassData[]>([]);
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

  const classes: ClassData[] = useMemo(() => {
    const base = baseClasses as ClassData[];
    const map = new Map<string, ClassData>();
    const attachSubs = (c: ClassData): ClassData => {
      if (c.subclasses && c.subclasses.length > 0) return c;
      const fromTable = SUBCLASSES[c.id];
      if (!fromTable?.length) return c;
      return {
        ...c,
        subclasses: fromTable.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          features: s.features,
        })),
      };
    };
    for (const c of base) map.set(c.id, attachSubs(c));
    for (const hb of homebrew) map.set(hb.id, attachSubs(hb));
    return Array.from(map.values());
  }, [homebrew]);

  const addHomebrew = useCallback((data: Omit<ClassData, 'id' | 'homebrew'>) => {
    const cls: ClassData = { ...data, id: `hb-${crypto.randomUUID()}`, homebrew: true };
    setHomebrew((prev) => [...prev, cls]);
    return cls;
  }, []);

  const updateHomebrew = useCallback((cls: ClassData) => {
    setHomebrew((prev) => {
      const idx = prev.findIndex((c) => c.id === cls.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...cls, homebrew: true };
        return next;
      }
      return [...prev, { ...cls, homebrew: true }];
    });
  }, []);

  const deleteHomebrew = useCallback((id: string) => {
    setHomebrew((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addFeature = useCallback((classId: string, feature: FeatureEntry) => {
    setHomebrew((prev) => {
      const existing = prev.find((c) => c.id === classId);
      const base = existing || (baseClasses as ClassData[]).find((c) => c.id === classId);
      if (!base) return prev;
      const updated: ClassData = {
        ...base,
        homebrew: true,
        features: [...base.features, feature],
      };
      if (existing) return prev.map((c) => (c.id === classId ? updated : c));
      return [...prev, updated];
    });
  }, []);

  const removeFeature = useCallback((classId: string, featureId: string) => {
    setHomebrew((prev) => {
      const existing = prev.find((c) => c.id === classId);
      const base = existing || (baseClasses as ClassData[]).find((c) => c.id === classId);
      if (!base) return prev;
      const updated: ClassData = {
        ...base,
        homebrew: true,
        features: base.features.filter((f) => f.id !== featureId),
      };
      if (existing) return prev.map((c) => (c.id === classId ? updated : c));
      return [...prev, updated];
    });
  }, []);

  const addSpellId = useCallback((classId: string, spellId: string) => {
    setHomebrew((prev) => {
      const existing = prev.find((c) => c.id === classId);
      const base = existing || (baseClasses as ClassData[]).find((c) => c.id === classId);
      if (!base) return prev;
      const sc = base.spellcasting || { ability: 'cha' as const, type: 'full' as const, starterSpellIds: [] };
      const ids = sc.starterSpellIds || [];
      if (ids.includes(spellId)) return prev;
      const updated: ClassData = {
        ...base,
        homebrew: true,
        spellcasting: { ...sc, starterSpellIds: [...ids, spellId] },
      };
      if (existing) return prev.map((c) => (c.id === classId ? updated : c));
      return [...prev, updated];
    });
  }, []);

  const removeSpellId = useCallback((classId: string, spellId: string) => {
    setHomebrew((prev) => {
      const existing = prev.find((c) => c.id === classId);
      const base = existing || (baseClasses as ClassData[]).find((c) => c.id === classId);
      if (!base?.spellcasting?.starterSpellIds) return prev;
      const updated: ClassData = {
        ...base,
        homebrew: true,
        spellcasting: {
          ...base.spellcasting,
          starterSpellIds: base.spellcasting.starterSpellIds.filter((id) => id !== spellId),
        },
      };
      if (existing) return prev.map((c) => (c.id === classId ? updated : c));
      return [...prev, updated];
    });
  }, []);

  return {
    classes,
    homebrew,
    loading,
    addSubclass: (classId: string, sub: NonNullable<ClassData['subclasses']>[0]) => {
      setHomebrew((prev) => {
        const existing = prev.find((c) => c.id === classId);
        const base = existing || (baseClasses as ClassData[]).find((c) => c.id === classId);
        if (!base) return prev;
        const updated: ClassData = {
          ...base,
          homebrew: true,
          subclasses: [...(base.subclasses || []), sub],
        };
        if (existing) return prev.map((c) => (c.id === classId ? updated : c));
        return [...prev, updated];
      });
    },
    addHomebrew,
    updateHomebrew,
    deleteHomebrew,
    addFeature,
    removeFeature,
    addSpellId,
    removeSpellId,
  };
}
