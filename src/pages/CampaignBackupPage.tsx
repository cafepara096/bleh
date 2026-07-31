import { useMemo, useState } from 'react';
import { Download, Upload, Save } from 'lucide-react';
import baseItems from '../data/items.json';
import baseSpells from '../data/spells.json';
import baseClasses from '../data/classes.json';
import baseRaces from '../data/races.json';
import baseMonsters from '../data/monsters.json';
import baseBackgrounds from '../data/backgrounds.json';

type CatKey =
  | 'characters'
  | 'items_homebrew'
  | 'items_base'
  | 'spells_homebrew'
  | 'spells_base'
  | 'classes_homebrew'
  | 'classes_base'
  | 'races_homebrew'
  | 'races_base'
  | 'monsters_homebrew'
  | 'monsters_base'
  | 'backgrounds'
  | 'pdfs'
  | 'pdf_marks'
  | 'metamagic'
  | 'maneuvers';

const CATALOG: {
  key: CatKey;
  label: string;
  kind: 'homebrew' | 'base' | 'mixed';
  storageKey?: string;
  baseData?: unknown;
}[] = [
  { key: 'characters', label: 'Personajes', kind: 'homebrew', storageKey: 'dnd-homebrew-characters' },
  { key: 'items_homebrew', label: 'Objetos (homebrew)', kind: 'homebrew', storageKey: 'dnd-homebrew-items' },
  { key: 'items_base', label: 'Objetos (catálogo base)', kind: 'base', baseData: baseItems },
  { key: 'spells_homebrew', label: 'Conjuros (homebrew)', kind: 'homebrew', storageKey: 'dnd-homebrew-spells' },
  { key: 'spells_base', label: 'Conjuros (catálogo base)', kind: 'base', baseData: baseSpells },
  { key: 'classes_homebrew', label: 'Clases (homebrew / overrides)', kind: 'homebrew', storageKey: 'dnd-homebrew-classes' },
  { key: 'classes_base', label: 'Clases (base app)', kind: 'base', baseData: baseClasses },
  { key: 'races_homebrew', label: 'Razas (homebrew)', kind: 'homebrew', storageKey: 'dnd-homebrew-races' },
  { key: 'races_base', label: 'Razas (base app)', kind: 'base', baseData: baseRaces },
  { key: 'monsters_homebrew', label: 'Monstruos (homebrew)', kind: 'homebrew', storageKey: 'dnd-homebrew-monsters' },
  { key: 'monsters_base', label: 'Monstruos (base app)', kind: 'base', baseData: baseMonsters },
  { key: 'backgrounds', label: 'Trasfondos', kind: 'mixed', storageKey: 'dnd-homebrew-backgrounds', baseData: baseBackgrounds },
  { key: 'pdfs', label: 'PDFs del vault', kind: 'homebrew', storageKey: 'dnd-homebrew-pdfs' },
  { key: 'pdf_marks', label: 'Marcadores PDF', kind: 'homebrew', storageKey: 'dnd-homebrew-pdf-marks' },
  { key: 'metamagic', label: 'Tabla metamagia', kind: 'homebrew', storageKey: 'dnd-homebrew-metamagic' },
  { key: 'maneuvers', label: 'Tabla maniobras', kind: 'homebrew', storageKey: 'dnd-homebrew-maneuvers' },
];

function readStorage(key: string): unknown {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function CampaignBackupPage() {
  const [selected, setSelected] = useState<Record<CatKey, boolean>>(() => {
    const init = {} as Record<CatKey, boolean>;
    for (const c of CATALOG) init[c.key] = c.kind !== 'base';
    return init;
  });

  const counts = useMemo(() => {
    const out: Record<string, string> = {};
    for (const c of CATALOG) {
      if (c.storageKey) {
        const data = readStorage(c.storageKey);
        const n = Array.isArray(data) ? data.length : data ? 1 : 0;
        out[c.key] = `${n} en navegador`;
      }
      if (c.baseData && Array.isArray(c.baseData)) {
        out[c.key] = (out[c.key] ? out[c.key] + ' · ' : '') + `${c.baseData.length} base`;
      }
    }
    return out;
  }, []);

  const toggle = (key: CatKey) => setSelected((s) => ({ ...s, [key]: !s[key] }));
  const toggleAll = (value: boolean) => {
    const next = {} as Record<CatKey, boolean>;
    for (const c of CATALOG) next[c.key] = value;
    setSelected(next);
  };

  const exportSelected = () => {
    const payload: Record<string, unknown> = {
      version: 1,
      app: 'dnd-homebrew',
      exportedAt: new Date().toISOString(),
      categories: {},
    };
    const cats = payload.categories as Record<string, unknown>;
    for (const c of CATALOG) {
      if (!selected[c.key]) continue;
      const entry: { storage?: unknown; base?: unknown; storageKey?: string } = {};
      if (c.storageKey) {
        entry.storage = readStorage(c.storageKey);
        entry.storageKey = c.storageKey;
      }
      if (c.baseData && (c.kind === 'base' || c.kind === 'mixed')) {
        entry.base = c.baseData;
      }
      cats[c.key] = entry;
    }
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dnd-campaña-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = (file: File) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(String(r.result));
        const cats = data.categories || {};
        let applied = 0;
        for (const c of CATALOG) {
          const entry = cats[c.key];
          if (!entry || !c.storageKey) continue;
          if (entry.storage != null) {
            localStorage.setItem(c.storageKey, JSON.stringify(entry.storage));
            applied++;
          }
        }
        alert(`Importados ${applied} bloques a localStorage. Recarga la página para verlos.`);
      } catch {
        alert('JSON inválido');
      }
    };
    r.readAsText(file);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-display font-bold flex items-center gap-2">
          <Save className="w-5 h-5" /> Guardar campaña
        </h2>
      </div>
      <p className="text-sm text-ink-600">
        Elige qué incluir en el archivo. <strong>Homebrew</strong> sale de tu navegador;
        <strong> base</strong> es el contenido empaquetado de la app (referencia).
        Al importar, solo se escriben datos de almacenamiento local (no reemplaza el código base).
      </p>
      <div className="flex gap-2 text-xs">
        <button type="button" onClick={() => toggleAll(true)} className="px-2 py-1 border rounded bg-white">
          Marcar todo
        </button>
        <button type="button" onClick={() => toggleAll(false)} className="px-2 py-1 border rounded bg-white">
          Desmarcar todo
        </button>
        <button type="button" onClick={exportSelected} className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-crimson-600 text-white rounded-lg">
          <Download className="w-3.5 h-3.5" /> Exportar selección
        </button>
        <label className="flex items-center gap-1 px-3 py-1.5 border border-ink-300 rounded-lg bg-white cursor-pointer">
          <Upload className="w-3.5 h-3.5" /> Importar JSON
          <input type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
        </label>
      </div>
      <div className="bg-parchment-100 border-2 border-ink-800 rounded-xl divide-y divide-ink-200">
        {CATALOG.map((c) => (
          <label key={c.key} className="flex items-start gap-3 px-3 py-2.5 hover:bg-parchment-50 cursor-pointer">
            <input
              type="checkbox"
              checked={!!selected[c.key]}
              onChange={() => toggle(c.key)}
              className="mt-1"
            />
            <span className="flex-1 text-sm">
              <span className="font-medium">{c.label}</span>
              <span
                className={`ml-2 text-[10px] px-1.5 rounded ${
                  c.kind === 'homebrew'
                    ? 'bg-purple-100 text-purple-900'
                    : c.kind === 'base'
                    ? 'bg-ink-100 text-ink-700'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {c.kind}
              </span>
              <span className="block text-[11px] text-ink-500">{counts[c.key]}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
