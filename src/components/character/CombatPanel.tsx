import { useState, useMemo } from 'react';
import type { Character, Spell, CharacterSpell } from '../../types/dnd';
import {
  getModifier,
  formatModifier,
  calculateSkillBonus,
  getSpellSaveDC,
  getSpellAttackBonus,
} from '../../utils/character';
import { useSpells } from '../../hooks/useSpells';
import { SorceryPointsPanel } from './SorceryPointsPanel';
import { FeatureTablesPanel } from './FeatureTablesPanel';
import { useItems } from '../../hooks/useItems';
import { resolveInventoryItem } from '../../utils/catalogResolve';
import { useClasses } from '../../hooks/useClasses';
import {
  getCasterKindFromClassId,
  getCantripLimit,
  getSpellKnownLimit,
  maxSpellLevelAvailable,
  type CasterKind,
} from '../../utils/spellLimits';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import {
  Swords,
  Sparkles,
  Zap,
  BookOpen,
  Plus,
  Trash2,
  Search,
  X,
} from 'lucide-react';

interface Props {
  character: Character;
  onUpdate?: (partial: Partial<Character>) => void;
  sections?: Array<'slots' | 'spells' | 'weapons' | 'features'>;
}

export function CombatPanel({ character, onUpdate, sections }: Props) {
  const show = (s: 'slots' | 'spells' | 'weapons' | 'features') =>
    !sections || sections.includes(s);
  const { spells: catalog } = useSpells();
  const { items: itemCatalog } = useItems();
  const { classes } = useClasses();
  const classData = classes.find(
    (c) => c.id === character.classId || c.name === character.class
  );

  const kind: CasterKind =
    classData?.spellcasting?.type ||
    getCasterKindFromClassId(character.classId) ||
    (character.spellcastingAbility ? 'full' : 'none');

  const strMod = getModifier(character.abilityScores.str);
  const dexMod = getModifier(character.abilityScores.dex);
  const prof = character.proficiencyBonus;
  const spellAbility = character.spellcastingAbility || classData?.spellcasting?.ability;
  const spellMod = spellAbility ? getModifier(character.abilityScores[spellAbility]) : 0;

  const cantripLimit = getCantripLimit(kind, character.level, character.classId);
  const spellLimit = getSpellKnownLimit(kind, character.level, character.classId, spellMod);
  const maxSpellLv = maxSpellLevelAvailable(kind, character.level);

  const [spellEditor, setSpellEditor] = useState<'cantrip' | 'spell' | null>(null);
  const [query, setQuery] = useState('');
  const [upcastLevel, setUpcastLevel] = useState<Record<string, number>>({});

  const weapons = character.inventory
    .map((i) => resolveInventoryItem(i, itemCatalog))
    .filter((i) => i.equipped && !!i.damage);

  const cantripIds = useMemo(() => {
    const fromKnown = character.cantripsKnown || [];
    const fromSpells = character.spells
      .map((cs) => catalog.find((s) => s.id === cs.spellId))
      .filter((s) => s && s.level === 0)
      .map((s) => s!.id);
    return Array.from(new Set([...fromKnown, ...fromSpells]));
  }, [character.cantripsKnown, character.spells, catalog]);

  const leveledSpellEntries = character.spells.filter((cs) => {
    const sp = catalog.find((s) => s.id === cs.spellId);
    return sp && sp.level > 0;
  });

  const cantripList = cantripIds
    .map((id) => catalog.find((s) => s.id === id))
    .filter(Boolean) as Spell[];

  const leveledSpells = leveledSpellEntries
    .map((cs) => {
      const sp = catalog.find((s) => s.id === cs.spellId);
      if (!sp) return null;
      return { ...sp, prepared: cs.prepared };
    })
    .filter(Boolean) as (Spell & { prepared: boolean })[];

  const spellAttack = getSpellAttackBonus(character);
  const spellDC = getSpellSaveDC(character);

  const slotLevels = Object.keys(character.spellSlots)
    .map(Number)
    .sort((a, b) => a - b);

  const updateSlots = (slots: Character['spellSlots']) => {
    onUpdate?.({ spellSlots: slots });
  };

  const useSlot = (level: number) => {
    const slot = character.spellSlots[level];
    if (!slot || slot.used >= slot.max) return;
    updateSlots({
      ...character.spellSlots,
      [level]: { ...slot, used: slot.used + 1 },
    });
  };

  const restoreSlot = (level: number) => {
    const slot = character.spellSlots[level];
    if (!slot || slot.used <= 0) return;
    updateSlots({
      ...character.spellSlots,
      [level]: { ...slot, used: slot.used - 1 },
    });
  };

  const addCantrip = (spellId: string) => {
    if (cantripIds.includes(spellId)) return;
    if (cantripIds.length >= cantripLimit && cantripLimit > 0) {
      alert(`Límite de trucos para tu clase/nivel: ${cantripLimit}`);
      return;
    }
    onUpdate?.({
      cantripsKnown: [...(character.cantripsKnown || []), spellId],
    });
    setSpellEditor(null);
  };

  const removeCantrip = (spellId: string) => {
    onUpdate?.({
      cantripsKnown: (character.cantripsKnown || []).filter((id) => id !== spellId),
      spells: character.spells.filter((s) => s.spellId !== spellId),
    });
  };

  const addSpell = (spellId: string) => {
    if (character.spells.some((s) => s.spellId === spellId)) return;
    const sp = catalog.find((s) => s.id === spellId);
    if (!sp || sp.level === 0) return;
    if (sp.level > maxSpellLv) {
      alert(`A tu nivel solo puedes usar conjuros de hasta nivel ${maxSpellLv}`);
      return;
    }
    if (typeof spellLimit === 'number') {
      const current = leveledSpellEntries.length;
      if (current >= spellLimit) {
        alert(`Límite de conjuros conocidos/preparados: ${spellLimit}`);
        return;
      }
    }
    const entry: CharacterSpell = { spellId, prepared: true };
    onUpdate?.({ spells: [...character.spells, entry] });
    setSpellEditor(null);
  };

  const removeSpell = (spellId: string) => {
    onUpdate?.({
      spells: character.spells.filter((s) => s.spellId !== spellId),
    });
  };

  const togglePrepared = (spellId: string) => {
    onUpdate?.({
      spells: character.spells.map((s) =>
        s.spellId === spellId ? { ...s, prepared: !s.prepared } : s
      ),
    });
  };

  const pickerList = useMemo(() => {
    const q = query.toLowerCase().trim();
    return catalog
      .filter((s) => {
        if (spellEditor === 'cantrip' && s.level !== 0) return false;
        if (spellEditor === 'spell' && s.level === 0) return false;
        if (spellEditor === 'spell' && s.level > maxSpellLv) return false;
        if (!q) return true;
        return (
          s.name.toLowerCase().includes(q) ||
          (s.nameEn && s.nameEn.toLowerCase().includes(q)) ||
          s.school.toLowerCase().includes(q) ||
          (s.homebrew && 'homebrew'.includes(q))
        );
      })
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }, [catalog, spellEditor, query, maxSpellLv]);

  return (
    <div className="space-y-4">
      {/* Spell slots */}
      {show('slots') && <CollapsibleSection
        title="Espacios de conjuro"
        icon={<Zap className="w-4 h-4 text-purple-700" />}
        defaultOpen
        headerClassName="bg-purple-50 border-purple-400"
        badge={slotLevels.length || undefined}
      >
        {slotLevels.length === 0 ? (
          <p className="text-xs text-ink-600">
            {kind === 'none'
              ? 'Esta clase no tiene espacios de conjuro por defecto.'
              : 'Sin espacios cargados. Se asignan al crear/subir de nivel si eres lanzador.'}
          </p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {slotLevels.map((lvl) => {
              const s = character.spellSlots[lvl];
              return (
                <div key={lvl} className="text-center">
                  <div className="text-[10px] uppercase text-ink-500 font-bold">Nivel {lvl}</div>
                  <div className="flex gap-1 my-1 justify-center">
                    {Array.from({ length: s.max }).map((_, i) => (
                      <button
                        key={i}
                        title={i < s.used ? 'Restaurar espacio' : 'Gastar espacio'}
                        onClick={() => (i < s.used ? restoreSlot(lvl) : useSlot(lvl))}
                        className={`w-5 h-5 rounded-full border-2 border-purple-700 transition-colors ${
                          i < s.used ? 'bg-purple-700' : 'bg-white hover:bg-purple-100'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs font-mono font-bold">
                    {s.max - s.used}/{s.max}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {spellDC !== null && (
          <div className="text-xs mt-2 text-purple-900 border-t border-purple-200 pt-2">
            <strong>CD de salvación:</strong> {spellDC} (8 + competencia +{' '}
            {spellAbility?.toUpperCase()})
            {' · '}
            <strong>Ataque de conjuro:</strong> {formatModifier(spellAttack!)} (competencia +{' '}
            {spellAbility?.toUpperCase()})
          </div>
        )}
      </CollapsibleSection>}

      {(show('slots')) && onUpdate && (
        <CollapsibleSection
          title="Hechicería / tablas de subclase"
          defaultOpen
          headerClassName="bg-fuchsia-50 border-fuchsia-400"
        >
          <div className="space-y-1.5">
            <SorceryPointsPanel character={character} onUpdate={onUpdate} />
            <FeatureTablesPanel character={character} onUpdate={onUpdate} />
          </div>
        </CollapsibleSection>
      )}

      {/* Cantrips + leveled spells */}
      {show('spells') && (
      <>
      <CollapsibleSection
        title="Trucos (cantrips)"
        icon={<BookOpen className="w-4 h-4" />}
        defaultOpen
        headerClassName="bg-parchment-100 border-ink-800"
        badge={`${cantripList.length}/${cantripLimit || '—'}`}
      >
        <div className="flex items-center justify-end mb-2">
          <span className="sr-only">Trucos</span>
          {kind !== 'none' && (
            <button
              onClick={() => {
                setQuery('');
                setSpellEditor('cantrip');
              }}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-ink-800 text-parchment-50 rounded hover:bg-ink-700"
            >
              <Plus className="w-3 h-3" /> Añadir / cambiar
            </button>
          )}
        </div>
        {cantripList.length === 0 ? (
          <p className="text-sm text-ink-500 italic">Sin trucos. Añade del catálogo (incluye homebrew).</p>
        ) : (
          <div className="space-y-1.5">
            {cantripList.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-ink-200 rounded p-2 text-sm flex gap-2 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold">
                      {s.name}
                      {s.nameEn && (
                        <span className="ml-1 text-[10px] font-normal text-ink-400">({s.nameEn})</span>
                      )}
                    </span>
                    {s.homebrew && (
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1 rounded">HB</span>
                    )}
                    {s.damage && (
                      <span className="text-xs text-red-700">
                        {s.damage} {s.damageType}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-500">
                    {s.castingTime} · {s.range}
                    {spellAttack !== null && s.damage && (
                      <> · Atq. conjuro {formatModifier(spellAttack)}</>
                    )}
                    {s.concentration && ' · Conc.'}
                  </div>
                </div>
                <button
                  onClick={() => removeCantrip(s.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Quitar truco"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* Leveled spells */}
      <CollapsibleSection
        title="Conjuros"
        icon={<BookOpen className="w-4 h-4" />}
        defaultOpen
        headerClassName="bg-parchment-100 border-ink-800"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <span className="sr-only">Conjuros</span>
            <span className="text-xs font-normal text-ink-500">
              {leveledSpells.length}
              {typeof spellLimit === 'number' ? `/${spellLimit}` : spellLimit === 'prepared' ? ' (preparados)' : ''}
              {maxSpellLv > 0 && ` · máx. niv. ${maxSpellLv}`}
            </span>
          </h3>
          {kind !== 'none' && (
            <button
              onClick={() => {
                setQuery('');
                setSpellEditor('spell');
              }}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-ink-800 text-parchment-50 rounded hover:bg-ink-700"
            >
              <Plus className="w-3 h-3" /> Añadir / cambiar
            </button>
          )}
        </div>
        {leveledSpells.length === 0 ? (
          <p className="text-sm text-ink-500 italic">Sin conjuros de nivel. Añade del catálogo o homebrew.</p>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {leveledSpells.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-ink-200 rounded p-2 text-sm flex gap-2 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold">
                      {s.name}
                      {s.nameEn && (
                        <span className="ml-1 text-[10px] font-normal text-ink-400">({s.nameEn})</span>
                      )}
                    </span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1 rounded">
                      Niv. {s.level}
                    </span>
                    {s.homebrew && (
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1 rounded">HB</span>
                    )}
                    <button
                      onClick={() => togglePrepared(s.id)}
                      className={`text-[10px] px-1.5 rounded ${
                        s.prepared
                          ? 'bg-green-100 text-green-800'
                          : 'bg-ink-100 text-ink-500'
                      }`}
                    >
                      {s.prepared ? 'Preparado' : 'No prep.'}
                    </button>
                    {s.damage && (
                      <span className="text-xs text-red-700">
                        {s.damage} {s.damageType}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-500">
                    {s.castingTime} · {s.range}
                    {s.concentration && ' · Concentración'}
                    {s.ritual && ' · Ritual'}
                  </div>
                  {s.higherLevels && (
                    <div className="mt-1.5 bg-purple-50 border border-purple-200 rounded p-1.5 text-xs space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-purple-900">Lanzar a nivel:</span>
                        <select
                          value={upcastLevel[s.id] ?? s.level}
                          onChange={(e) =>
                            setUpcastLevel((prev) => ({
                              ...prev,
                              [s.id]: parseInt(e.target.value),
                            }))
                          }
                          className="px-1 py-0.5 border border-purple-300 rounded text-xs"
                        >
                          {Array.from({ length: 10 - s.level }, (_, i) => s.level + i)
                            .filter((lv) => lv <= Math.max(s.level, maxSpellLv || 9))
                            .map((lv) => (
                              <option key={lv} value={lv}>
                                {lv}
                              </option>
                            ))}
                        </select>
                        {(upcastLevel[s.id] ?? s.level) > s.level && (
                          <span className="text-purple-800">
                            (usa espacio de niv. {upcastLevel[s.id]})
                          </span>
                        )}
                      </div>
                      <p className="text-purple-900/80">
                        <strong>A niveles superiores:</strong> {s.higherLevels}
                      </p>
                      {s.damage && (upcastLevel[s.id] ?? s.level) > s.level && (
                        <p className="text-[11px] text-ink-600">
                          El daño/efecto mejora según la descripción al usar un espacio más alto.
                          Gasta el espacio del nivel elegido arriba.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeSpell(s.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Quitar conjuro"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-[11px] text-ink-500 mt-2">
          Según tu clase puedes conocer o preparar un número limitado de conjuros. Al descansar largo,
          clases como clérigo/druida/mago suelen cambiar preparados; bardos/hechiceros/brujos cambian
          conocidos con menos frecuencia (reglas de cada clase).
        </p>
      </CollapsibleSection>
      </>
      )}

      {/* Attacks */}
      {show('weapons') && <CollapsibleSection
        title="Ataques y armas"
        icon={<Swords className="w-4 h-4" />}
        defaultOpen
        headerClassName="bg-parchment-100 border-ink-800"
      >
        {weapons.length === 0 ? (
          <p className="text-sm text-ink-500 italic">Sin armas con daño o equipadas en el inventario.</p>
        ) : (
          <div className="space-y-2">
            {weapons.map((w) => {
              const text = w.name + (w.description || '') + (w.properties || []).join(' ');
              const isRanged = /arco|ballesta|dardo|flecha|arrojadiza|jabalina/i.test(text);
              const isFinesse = /sutil|finesse|estoque|daga|cimitarra|espada corta/i.test(text);
              const abilityLabel = isRanged ? 'Des' : isFinesse ? 'Fue o Des' : 'Fue';
              const mod = isRanged || isFinesse ? Math.max(strMod, dexMod) : strMod;
              const atk = mod + prof;
              return (
                <div
                  key={w.id}
                  className="bg-white border border-ink-200 rounded-lg p-2.5 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">
                      {w.name}
                      {'nameEn' in w && (w as { nameEn?: string }).nameEn && (
                        <span className="ml-1 text-[10px] font-normal text-ink-400">
                          ({(w as { nameEn?: string }).nameEn})
                        </span>
                      )}
                    </span>
                    {w.equipped && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 rounded">
                        Equipado
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1.5 text-xs">
                    <span className="bg-ink-100 px-2 py-0.5 rounded">
                      Ataque <strong>{formatModifier(atk)}</strong>
                      <span className="text-ink-500"> = {abilityLabel} {formatModifier(mod)} + comp. {formatModifier(prof)}</span>
                    </span>
                    {w.damage && (
                      <span className="bg-red-50 text-red-900 px-2 py-0.5 rounded">
                        Daño <strong>{w.damage}{mod !== 0 ? formatModifier(mod) : ''}</strong>{' '}
                        {w.damageType}
                        <span className="text-red-700/70"> (dado + {abilityLabel})</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-2 text-xs text-ink-500">
          Desarmado: ataque {formatModifier(strMod + prof)} (Fue+comp) · daño 1{formatModifier(strMod)} contundente
        </p>
      </CollapsibleSection>}

      {/* Features */}
      {show('features') && <CollapsibleSection
        title="Features & Traits"
        icon={<Sparkles className="w-4 h-4" />}
        defaultOpen={false}
        headerClassName="bg-parchment-100 border-ink-800"
      >
        {character.features.length === 0 ? (
          <p className="text-sm text-ink-500 italic">Sin rasgos.</p>
        ) : (
          <div className="space-y-1 max-h-52 overflow-y-auto">
            {character.features.map((f) => (
              <details key={f.id} className="bg-white border border-ink-200 rounded text-sm">
                <summary className="px-2 py-1.5 cursor-pointer font-medium list-none flex items-center gap-2">
                  <span className="flex-1">{f.name}</span>
                  {f.source && (
                    <span className="text-[10px] bg-ink-100 px-1.5 rounded capitalize">{f.source}</span>
                  )}
                </summary>
                <p className="px-2 pb-2 text-xs text-ink-700 whitespace-pre-wrap border-t border-ink-100 pt-1">
                  {f.description}
                </p>
              </details>
            ))}
          </div>
        )}
      </CollapsibleSection>}

      {/* Actions reminder */}
      <CollapsibleSection
        title="Recordatorio de acciones"
        defaultOpen={false}
        headerClassName="bg-ink-900 text-parchment-100 border-ink-700"
      >
        <div className="bg-ink-900 text-parchment-100 rounded-lg text-xs -m-3 p-3">
        <strong className="text-sm">Acciones en combate</strong>
        <ul className="mt-1.5 space-y-1 text-parchment-300 list-disc list-inside">
          <li>
            <strong className="text-parchment-100">Acción:</strong> Atacar, Lanzar conjuro, Dash,
            Destrabarse, Esquivar, Ayudar, Esconderse, Buscar, Usar objeto
          </li>
          <li>
            <strong className="text-parchment-100">Acción adicional:</strong> según clase (Furia,
            Acción astuta, Segundo aliento, etc.)
          </li>
          <li>
            <strong className="text-parchment-100">Reacción:</strong> Ataque de oportunidad, Escudo,
            Contrahechizo…
          </li>
          <li>
            Iniciativa {formatModifier(dexMod)} (Des) · Percepción pasiva{' '}
            {10 + calculateSkillBonus(character, 'perception')}
          </li>
        </ul>
        </div>
      </CollapsibleSection>

      {/* Spell picker modal */}
      {spellEditor && (
        <div className="fixed inset-0 z-50 flex justify-end items-stretch">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSpellEditor(null)} />
          <div className="relative w-full max-w-md bg-parchment-50 border-l-4 border-ink-900 h-full flex flex-col shadow-2xl">
            <div className="bg-ink-900 text-parchment-50 p-3 flex items-center justify-between">
              <h3 className="font-bold">
                {spellEditor === 'cantrip' ? 'Elegir truco' : 'Elegir conjuro'}
              </h3>
              <button onClick={() => setSpellEditor(null)} className="p-1 hover:bg-ink-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 border-b border-ink-200">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar (incluye homebrew)…"
                  className="w-full pl-8 pr-2 py-2 border-2 border-ink-300 rounded-lg text-sm"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-ink-500 mt-1 px-1">
                {spellEditor === 'cantrip'
                  ? `Límite: ${cantripList.length}/${cantripLimit}`
                  : `Límite: ${leveledSpells.length}${typeof spellLimit === 'number' ? `/${spellLimit}` : ''} · hasta niv. ${maxSpellLv}`}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {pickerList.map((s) => {
                const already =
                  spellEditor === 'cantrip'
                    ? cantripIds.includes(s.id)
                    : character.spells.some((x) => x.spellId === s.id);
                return (
                  <button
                    key={s.id}
                    disabled={already}
                    onClick={() =>
                      spellEditor === 'cantrip' ? addCantrip(s.id) : addSpell(s.id)
                    }
                    className={`w-full text-left px-3 py-2 border-b border-ink-100 text-sm ${
                      already
                        ? 'bg-ink-50 text-ink-400 cursor-not-allowed'
                        : 'hover:bg-parchment-200 bg-white'
                    }`}
                  >
                    <div className="font-medium flex items-center gap-2">
                      {s.name}
                      {s.homebrew && (
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-1 rounded">HB</span>
                      )}
                      {already && <span className="text-[10px]">(ya lo tienes)</span>}
                    </div>
                    <div className="text-xs text-ink-500">
                      {s.level === 0 ? 'Truco' : `Nivel ${s.level}`} · {s.school}
                      {s.damage && ` · ${s.damage} ${s.damageType || ''}`}
                    </div>
                  </button>
                );
              })}
              {pickerList.length === 0 && (
                <p className="p-4 text-sm text-ink-500 italic">Sin resultados</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
