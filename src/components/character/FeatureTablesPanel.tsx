import { useMemo, useState, useEffect } from 'react';
import type { Character } from '../../types/dnd';
import {
  METAMAGIC_OPTIONS,
  BATTLE_MASTER_MANEUVERS,
  WILD_MAGIC_SURGE,
  STORAGE_METAMAGIC,
  STORAGE_MANEUVERS,
  type TableOption,
} from '../../data/featureTables';

interface Props {
  character: Character;
  onUpdate: (partial: Partial<Character>) => void;
}

function loadTable(key: string, fallback: TableOption[]): TableOption[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as TableOption[];
  } catch { /* ignore */ }
  return fallback;
}

export function FeatureTablesPanel({ character, onUpdate }: Props) {
  const [metaCatalog, setMetaCatalog] = useState<TableOption[]>(METAMAGIC_OPTIONS);
  const [manCatalog, setManCatalog] = useState<TableOption[]>(BATTLE_MASTER_MANEUVERS);
  const [metaOpen, setMetaOpen] = useState(false);
  const [manOpen, setManOpen] = useState(false);
  const [wildOpen, setWildOpen] = useState(true);
  const [pickMeta, setPickMeta] = useState(false);
  const [pickMan, setPickMan] = useState(false);

  useEffect(() => {
    setMetaCatalog(loadTable(STORAGE_METAMAGIC, METAMAGIC_OPTIONS));
    setManCatalog(loadTable(STORAGE_MANEUVERS, BATTLE_MASTER_MANEUVERS));
  }, []);

  const isSorcerer =
    character.classId === 'sorcerer' ||
    character.class.toLowerCase().includes('hechic') ||
    !!character.sorceryPoints;
  const isBattleMaster =
    character.subclassId === 'battle-master' ||
    (character.subclass || '').toLowerCase().includes('maestro de batalla') ||
    (character.subclass || '').toLowerCase().includes('battle master');
  const isWildMagic =
    character.subclassId === 'wild-magic' ||
    (character.subclass || '').toLowerCase().includes('magia salvaje') ||
    (character.subclass || '').toLowerCase().includes('wild magic');

  const knownMeta = character.metamagicKnown || [];
  const knownMan = character.maneuversKnown || [];
  const sp = character.sorceryPoints?.current ?? 0;
  const spMax = character.sorceryPoints?.max ?? character.level;

  const knownMetaOptions = useMemo(
    () => metaCatalog.filter((m) => knownMeta.includes(m.id)),
    [metaCatalog, knownMeta]
  );
  const knownManOptions = useMemo(
    () => manCatalog.filter((m) => knownMan.includes(m.id)),
    [manCatalog, knownMan]
  );

  const spendSP = (cost: number) => {
    if (sp < cost) {
      alert(`Necesitas ${cost} SP (tienes ${sp}).`);
      return false;
    }
    onUpdate({
      sorceryPoints: { max: spMax, current: sp - cost },
    });
    return true;
  };

  const useMetamagic = (opt: TableOption) => {
    const cost = opt.cost ?? 1;
    if (!spendSP(cost)) return;
    // just spent — user tracks the spell effect
  };

  const toggleMetaKnown = (id: string) => {
    const set = new Set(knownMeta);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onUpdate({ metamagicKnown: Array.from(set) });
  };

  const toggleManKnown = (id: string) => {
    const set = new Set(knownMan);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onUpdate({ maneuversKnown: Array.from(set) });
  };

  const rollWildSurge = () => {
    const entry = WILD_MAGIC_SURGE[Math.floor(Math.random() * WILD_MAGIC_SURGE.length)];
    const text = `${entry.roll}: ${entry.effect}`;
    onUpdate({ lastWildSurge: text });
    // Bendición del caos: recover 1d4 SP if wild magic
    if (isWildMagic && character.level >= 6 && character.sorceryPoints) {
      const gain = 1 + Math.floor(Math.random() * 4);
      onUpdate({
        lastWildSurge: text,
        sorceryPoints: {
          max: spMax,
          current: Math.min(spMax, sp + gain),
        },
      });
    }
  };

  if (!isSorcerer && !isBattleMaster && !isWildMagic) return null;

  return (
    <div className="space-y-1.5">
      {/* Metamagia */}
      {isSorcerer && (
        <div className="bg-violet-50 border border-violet-300 rounded-lg px-2.5 py-1.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-violet-900">Metamagia</span>
            <span className="text-violet-800/80">
              {knownMetaOptions.length} conocida{knownMetaOptions.length === 1 ? '' : 's'}
            </span>
            <button type="button" onClick={() => setMetaOpen((o) => !o)} className="underline text-violet-800">
              {metaOpen ? 'Ocultar' : 'Usar'}
            </button>
            <button type="button" onClick={() => setPickMeta((o) => !o)} className="underline text-violet-700 text-[10px]">
              {pickMeta ? 'Cerrar elección' : 'Elegir/editar conocidas'}
            </button>
          </div>
          {metaOpen && (
            <div className="mt-1 space-y-1 border-t border-violet-200 pt-1">
              {knownMetaOptions.length === 0 && (
                <p className="text-[10px] text-ink-500">Aún no elegiste metamagias. Usa “Elegir/editar conocidas”.</p>
              )}
              {knownMetaOptions.map((m) => (
                <div key={m.id} className="flex gap-2 items-start bg-white/80 rounded px-1.5 py-1 border border-violet-100">
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold">{m.name}</span>
                    <span className="text-violet-800 ml-1">({m.cost ?? 1} SP)</span>
                    <p className="text-[10px] text-ink-600">{m.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => useMetamagic(m)}
                    className="shrink-0 px-1.5 py-0.5 bg-violet-200 border border-violet-400 rounded text-[10px] font-bold"
                  >
                    Usar
                  </button>
                </div>
              ))}
            </div>
          )}
          {pickMeta && (
            <div className="mt-1 max-h-40 overflow-y-auto space-y-0.5 border-t border-violet-200 pt-1">
              {metaCatalog.map((m) => (
                <label key={m.id} className="flex gap-2 items-start text-[10px] cursor-pointer hover:bg-violet-100/50 rounded px-1">
                  <input
                    type="checkbox"
                    checked={knownMeta.includes(m.id)}
                    onChange={() => toggleMetaKnown(m.id)}
                    className="mt-0.5"
                  />
                  <span>
                    <strong>{m.name}</strong> ({m.cost ?? 1} SP) — {m.description}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Maniobras */}
      {isBattleMaster && (
        <div className="bg-orange-50 border border-orange-300 rounded-lg px-2.5 py-1.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-orange-900">Maniobras</span>
            <span className="text-orange-800/80">{knownManOptions.length} conocidas</span>
            <button type="button" onClick={() => setManOpen((o) => !o)} className="underline text-orange-800">
              {manOpen ? 'Ocultar' : 'Lista'}
            </button>
            <button type="button" onClick={() => setPickMan((o) => !o)} className="underline text-orange-700 text-[10px]">
              {pickMan ? 'Cerrar' : 'Elegir conocidas'}
            </button>
          </div>
          {manOpen && (
            <ul className="mt-1 space-y-1 border-t border-orange-200 pt-1">
              {knownManOptions.map((m) => (
                <li key={m.id} className="bg-white/80 rounded px-1.5 py-1 border border-orange-100">
                  <strong>{m.name}</strong>
                  <p className="text-[10px] text-ink-600">{m.description}</p>
                </li>
              ))}
              {knownManOptions.length === 0 && (
                <p className="text-[10px] text-ink-500">Elige maniobras conocidas.</p>
              )}
            </ul>
          )}
          {pickMan && (
            <div className="mt-1 max-h-40 overflow-y-auto space-y-0.5 border-t border-orange-200 pt-1">
              {manCatalog.map((m) => (
                <label key={m.id} className="flex gap-2 items-start text-[10px] cursor-pointer hover:bg-orange-100/50 rounded px-1">
                  <input
                    type="checkbox"
                    checked={knownMan.includes(m.id)}
                    onChange={() => toggleManKnown(m.id)}
                    className="mt-0.5"
                  />
                  <span>
                    <strong>{m.name}</strong> — {m.description}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Magia salvaje */}
      {isWildMagic && (
        <div className="bg-pink-50 border border-pink-300 rounded-lg px-2.5 py-1.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-pink-900">Oleada / sobrecarga de magia salvaje</span>
            <button
              type="button"
              onClick={rollWildSurge}
              className="px-1.5 py-0.5 bg-pink-200 border border-pink-400 rounded font-bold text-[10px]"
            >
              Tirar oleada
            </button>
            <button type="button" onClick={() => setWildOpen((o) => !o)} className="underline text-pink-800 text-[10px]">
              {wildOpen ? 'Ocultar tabla' : 'Ver tabla'}
            </button>
          </div>
          {character.lastWildSurge && (
            <p className="mt-1 text-[11px] bg-white/90 border border-pink-200 rounded px-1.5 py-1">
              <strong>Última:</strong> {character.lastWildSurge}
            </p>
          )}
          {wildOpen && (
            <div className="mt-1 max-h-36 overflow-y-auto text-[10px] border-t border-pink-200 pt-1 space-y-0.5">
              {WILD_MAGIC_SURGE.map((e) => (
                <div key={e.roll} className="flex gap-1">
                  <span className="font-mono shrink-0 w-10">{e.roll}</span>
                  <span className="text-ink-600">{e.effect}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-pink-900/70 mt-1">
            Doblegar suerte (niv. 6+): reacción + 2 SP para ±1d4 a la tirada de una criatura a 60 ft.
          </p>
        </div>
      )}
    </div>
  );
}
