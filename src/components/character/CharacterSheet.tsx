import { useState, useCallback, useEffect } from 'react';
import type { Character, AbilityScore, SkillId } from '../../types/dnd';
import { ABILITY_LABELS } from '../../types/dnd';
import {
  formatModifier,
  calculateSavingThrow,
  calculateInitiative,
  calculatePassivePerception,
  applyDamage,
  heal,
} from '../../utils/character';
import { formatSpeed } from '../../utils/units';
import { AbilityScoreBox } from './AbilityScoreBox';
import { HitPointsTracker } from './HitPointsTracker';
import { DeathSaves } from './DeathSaves';
import { SkillList } from './SkillList';
import { InventoryPanel } from './InventoryPanel';
import { FeaturesPanel } from './FeaturesPanel';
import {
  Save,
  Download,
  ArrowLeft,
  Dices,
  Shield,
  Zap,
  Star,
  TrendingUp,
  AlertCircle,
  X,
} from 'lucide-react';
import { LevelUpModal } from './LevelUpModal';
import { SubclassPanel } from './SubclassPanel';
import { SorceryPointsPanel } from './SorceryPointsPanel';
import { FeatureTablesPanel } from './FeatureTablesPanel';
import { ConditionsPanel } from './ConditionsPanel';
import { CampaignNotesPanel } from './CampaignNotesPanel';
import { exportCharacterPdf } from '../../utils/exportCharacterPdf';
import { ALIGNMENTS, getAlignmentInfo } from '../../utils/alignments';
import { CombatPanel } from './CombatPanel';
import { ActionsPanel } from './ActionsPanel';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { computeArmorClass } from '../../utils/armorClass';
import { syncFeatureUsesFromCatalog, syncSpellsFromCatalog } from '../../utils/syncCharacterCatalog';
import { applyFeatureSpellGrants } from '../../utils/featureSpellGrants';
import { getEquippedPenalties } from '../../utils/equipmentEffects';
import { useClasses } from '../../hooks/useClasses';
import { useRaces } from '../../hooks/useRaces';
import { useSpells } from '../../hooks/useSpells';
import { useBackgrounds } from '../../hooks/useBackgrounds';

interface Props {
  character: Character;
  onSave: (character: Character) => void;
  onBack: () => void;
  onExport: (character: Character) => void;
}

export function CharacterSheet({ character: initial, onSave, onBack, onExport }: Props) {
  const [character, setCharacter] = useState<Character>(initial);
  const [activeTab, setActiveTab] = useState<'main' | 'combat' | 'inventory' | 'features' | 'subclass' | 'notes'>('main');
  const [dirty, setDirty] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showPendingChoices, setShowPendingChoices] = useState(false);
  const [pendingDrafts, setPendingDrafts] = useState<Record<string, string>>({});
  const { classes } = useClasses();
  const { races } = useRaces();
  const { spells: spellCatalog } = useSpells();
  const { backgrounds } = useBackgrounds();

  // Usos de rasgos (Oleada de acción, etc.) + conjuros de raza/clase homebrew
  useEffect(() => {
    const classData =
      classes.find((c) => c.id === character.classId || c.name === character.class) || null;
    const raceData =
      races.find((r) => r.id === character.raceId || r.name === character.race) || null;
    let next = syncFeatureUsesFromCatalog(character, classData, raceData);
    next = syncSpellsFromCatalog(next, classData, raceData, spellCatalog);
    next = applyFeatureSpellGrants(next, spellCatalog);
    if (next !== character) {
      setCharacter(next);
      setDirty(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes, races, spellCatalog, character.classId, character.raceId, character.level, character.class, character.race]);


  // CA automática según armadura/escudo en mano (equipado)
  useEffect(() => {
    const ac = computeArmorClass(character);
    if (ac !== character.armorClass) {
      setCharacter((c) => ({ ...c, armorClass: ac }));
      setDirty(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    character.inventory,
    character.abilityScores.dex,
    character.abilityScores.con,
    character.abilityScores.wis,
    character.classId,
    character.class,
  ]);


  const unresolvedPending = (character.pendingChoices || []).filter((p) => !p.resolution);

  const resolvePending = () => {
    const remaining = [];
    let features = [...character.features];
    const notes: string[] = [];
    for (const p of character.pendingChoices || []) {
      if (p.resolution) continue;
      const answer = (pendingDrafts[p.id] || '').trim();
      if (answer) {
        notes.push(`${p.featureName}: ${answer}`);
        features = features.map((f) =>
          f.id === p.featureId || f.name === p.featureName
            ? { ...f, description: `${f.description}\n\nElección: ${answer}` }
            : f
        );
      } else {
        remaining.push(p);
      }
    }
    update({
      features,
      pendingChoices: remaining,
      notes: notes.length
        ? [character.notes || '', '— Elecciones pendientes resueltas —', ...notes]
            .filter(Boolean)
            .join('\n')
        : character.notes,
    });
    setPendingDrafts({});
    if (remaining.length === 0) setShowPendingChoices(false);
  };


  const update = useCallback((partial: Partial<Character>) => {
    setCharacter((prev) => ({ ...prev, ...partial }));
    setDirty(true);
  }, []);

  const handleSave = () => {
    onSave(character);
    setDirty(false);
  };

  const setAbility = (ability: AbilityScore, value: number) => {
    update({
      abilityScores: { ...character.abilityScores, [ability]: value },
    });
  };

  const toggleSavingThrow = (ability: AbilityScore) => {
    const current = character.savingThrows;
    const next = current.includes(ability)
      ? current.filter((a) => a !== ability)
      : [...current, ability];
    update({ savingThrows: next });
  };

  const toggleSkill = (skillId: SkillId, field: 'proficient' | 'expertise') => {
    const current = character.skills[skillId] || { proficient: false, expertise: false };
    let next = { ...current };

    if (field === 'proficient') {
      next.proficient = !current.proficient;
      if (!next.proficient) next.expertise = false;
    } else {
      next.expertise = !current.expertise;
      if (next.expertise) next.proficient = true;
    }

    update({
      skills: { ...character.skills, [skillId]: next },
    });
  };

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="bg-ink-900 text-parchment-50 rounded-t-xl p-3 sm:p-4 flex flex-wrap items-center gap-2 sm:gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-ink-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={character.name}
            onChange={(e) => update({ name: e.target.value })}
            className="text-xl sm:text-2xl font-display font-bold bg-transparent border-b border-transparent hover:border-parchment-400 focus:border-parchment-300 focus:outline-none w-full"
          />
          <div className="flex flex-wrap gap-2 mt-1 text-sm text-parchment-300">
            <input
              value={character.race}
              onChange={(e) => update({ race: e.target.value })}
              placeholder="Raza"
              className="bg-transparent border-b border-transparent hover:border-parchment-500 focus:border-parchment-400 focus:outline-none w-24"
            />
            <span>•</span>
            <input
              value={character.class}
              onChange={(e) => update({ class: e.target.value })}
              placeholder="Clase"
              className="bg-transparent border-b border-transparent hover:border-parchment-500 focus:border-parchment-400 focus:outline-none w-28"
            />
            {character.subclass && (
              <>
                <span>({character.subclass})</span>
              </>
            )}
            <span>•</span>
            <span>Nivel</span>
            <input
              type="number"
              min={1}
              max={20}
              value={character.level}
              onChange={(e) =>
                update({
                  level: Math.min(20, Math.max(1, parseInt(e.target.value) || 1)),
                  proficiencyBonus: Math.ceil((parseInt(e.target.value) || 1) / 4) + 1,
                })
              }
              className="w-12 bg-transparent border-b border-transparent hover:border-parchment-500 focus:border-parchment-400 focus:outline-none text-center"
            />
            <span>•</span>
            <select
              value={
                backgrounds.some((b) => b.name === character.background || b.id === character.backgroundId)
                  ? (backgrounds.find((b) => b.name === character.background || b.id === character.backgroundId)?.name || character.background)
                  : character.background || ''
              }
              onChange={(e) => {
                const name = e.target.value;
                const bg = backgrounds.find((b) => b.name === name);
                update({
                  background: name,
                  backgroundId: bg?.id,
                });
              }}
              className="bg-ink-900/40 border border-parchment-600/40 rounded px-1 py-0.5 text-sm max-w-[9rem]"
              title="Trasfondo (catálogo + homebrew)"
            >
              <option value="">Trasfondo…</option>
              {backgrounds.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}{b.homebrew ? ' (HB)' : ''}
                </option>
              ))}
              {character.background &&
                !backgrounds.some((b) => b.name === character.background) && (
                  <option value={character.background}>{character.background} (custom)</option>
                )}
            </select>
            {character.alignment && (
              <>
                <span>•</span>
                <span className="text-parchment-400">{character.alignment}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">

          {unresolvedPending.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setPendingDrafts({});
                setShowPendingChoices(true);
              }}
              className="flex items-center gap-1 px-2 py-1 bg-amber-500 hover:bg-amber-400 text-ink-900 rounded-lg text-xs font-bold animate-pulse"
              title="Hay elecciones de subida de nivel sin resolver"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Faltan características a seleccionar ({unresolvedPending.length})
            </button>
          )}

          {dirty && (
            <span className="text-xs text-amber-400 animate-pulse">Sin guardar</span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-2 bg-green-700 hover:bg-green-600 rounded-lg text-sm font-medium"
          >
            <Save className="w-4 h-4" /> Guardar
          </button>
          <button
            onClick={() => setShowLevelUp(true)}
            className="flex items-center gap-1 px-3 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium"
          >
            <TrendingUp className="w-4 h-4" /> Subir nivel
          </button>
            <button
              type="button"
              onClick={() => exportCharacterPdf(character)}
              className="text-xs px-2 py-1 border border-parchment-400 rounded hover:bg-ink-800"
            >
              Exportar PDF</button>
          <button
            onClick={() => onExport(character)}
            className="flex items-center gap-1 px-3 py-2 bg-ink-700 hover:bg-ink-600 rounded-lg text-sm"
          >
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </div>

      {/* Combat Stats Bar */}
      <div className="bg-parchment-200 border-x-2 border-ink-800 p-3 flex flex-wrap gap-4 justify-center items-center">
        <div className="flex items-center gap-2 bg-white border-2 border-ink-800 rounded-lg px-3 py-2">
          <Shield className="w-5 h-5 text-ink-700" />
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-ink-600">CA</div>
            <input
              type="number"
              value={character.armorClass}
              onChange={(e) => update({ armorClass: parseInt(e.target.value) || 10 })}
              title="Se actualiza al equipar armadura/escudo; puedes sobrescribir"
              className="w-12 text-xl font-bold text-center bg-transparent focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white border-2 border-ink-800 rounded-lg px-3 py-2">
          <Zap className="w-5 h-5 text-ink-700" />
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-ink-600">Iniciativa</div>
            <div className="text-xl font-bold">
              {formatModifier(calculateInitiative(character))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white border-2 border-ink-800 rounded-lg px-3 py-2">
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-ink-600">Velocidad</div>
            <div className="flex items-baseline gap-0.5">
              <input
                type="number"
                value={character.speed}
                onChange={(e) => update({ speed: parseInt(e.target.value) || 30 })}
                className="w-12 text-xl font-bold text-center bg-transparent focus:outline-none"
              />
              <span className="text-xs">ft</span>
            </div>
            <div className="text-[10px] text-ink-500 text-center">{formatSpeed(character.speed)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white border-2 border-ink-800 rounded-lg px-3 py-2">
          <Dices className="w-5 h-5 text-ink-700" />
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-ink-600">Bonif. Comp.</div>
            <div className="text-xl font-bold">
              {formatModifier(character.proficiencyBonus)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white border-2 border-ink-800 rounded-lg px-3 py-2">
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-ink-600">Percepción Pasiva</div>
            <div className="text-xl font-bold">
              {calculatePassivePerception(character)}
            </div>
          </div>
        </div>

        <button
          onClick={() => update({ inspiration: !character.inspiration })}
          className={`flex items-center gap-2 border-2 rounded-lg px-3 py-2 transition-colors ${
            character.inspiration
              ? 'bg-amber-200 border-amber-600'
              : 'bg-white border-ink-800'
          }`}
        >
          <Star
            className={`w-5 h-5 ${
              character.inspiration ? 'fill-amber-500 text-amber-600' : 'text-ink-400'
            }`}
          />
          <span className="text-sm font-medium">Inspiración</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-parchment-100 border-x-2 border-ink-800 flex overflow-x-auto scroll-touch sticky top-[3.25rem] sm:top-0 z-20 sm:static">
        {(['main', 'combat', 'inventory', 'features', 'subclass', 'notes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === tab
                ? 'border-crimson-600 text-crimson-700 bg-parchment-50'
                : 'border-transparent text-ink-600 hover:text-ink-900'
            }`}
          >
            {tab === 'main' && 'Principal'}
            {tab === 'combat' && 'Combate'}
            {tab === 'inventory' && 'Inventario'}
            {tab === 'features' && 'Rasgos'}
            {tab === 'subclass' && 'Subclase'}
            {tab === 'notes' && 'Notas'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-parchment-50 border-2 border-t-0 border-ink-800 rounded-b-xl p-3 sm:p-4">
        {activeTab === 'main' && (
          <>
          <div className="mb-4 space-y-1">
            <ConditionsPanel character={character} onUpdate={(partial) => update(partial)} />
            {(() => {
              const pens = getEquippedPenalties(character);
              if (!pens.length) return null;
              return (
                <div className="flex flex-wrap gap-1">
                  {pens.map((pen) => (
                    <span
                      key={pen.id}
                      className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-300"
                      title={`Por llevar equipado: ${pen.sourceName}. Se quita al guardar el objeto.`}
                    >
                      ⚠ {pen.label}
                      <span className="opacity-70"> ({pen.sourceName})</span>
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Ability Scores */}
            <div className="lg:col-span-2 flex lg:flex-col flex-wrap gap-2 justify-center">
              {(Object.keys(ABILITY_LABELS) as AbilityScore[]).map((ability) => (
                <AbilityScoreBox
                  key={ability}
                  ability={ability}
                  score={character.abilityScores[ability]}
                  onChange={(v) => setAbility(ability, v)}
                  editable
                />
              ))}
            </div>

            {/* Center column */}
            <div className="lg:col-span-6 space-y-4">
              <HitPointsTracker
                current={character.hitPointCurrent}
                max={character.hitPointMax}
                temp={character.hitPointTemp}
                onHeal={(amt) => setCharacter(heal(character, amt))}
                onDamage={(amt) => setCharacter(applyDamage(character, amt))}
                onSetCurrent={(v) => update({ hitPointCurrent: v })}
                onSetTemp={(v) => update({ hitPointTemp: v })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DeathSaves
                  successes={character.deathSaves.successes}
                  failures={character.deathSaves.failures}
                  onChange={(s, f) =>
                    update({ deathSaves: { successes: s, failures: f } })
                  }
                />

                {/* Saving Throws */}
                <div className="bg-parchment-100 border-2 border-ink-800 rounded-lg p-3 shadow-sm">
                  <h3 className="font-bold text-sm mb-2 border-b border-ink-300 pb-1">
                    Tiradas de Salvación
                  </h3>
                  <div className="space-y-1">
                    {(Object.keys(ABILITY_LABELS) as AbilityScore[]).map((ability) => {
                      const bonus = calculateSavingThrow(character, ability);
                      const proficient = character.savingThrows.includes(ability);
                      return (
                        <div
                          key={ability}
                          className="flex items-center gap-2 text-sm"
                        >
                          <button
                            onClick={() => toggleSavingThrow(ability)}
                            className={`w-3.5 h-3.5 rounded-full border-2 border-ink-700 ${
                              proficient ? 'bg-ink-800' : 'bg-transparent'
                            }`}
                          />
                          <span className={proficient ? 'font-semibold' : ''}>
                            {ABILITY_LABELS[ability]}
                          </span>
                          <span
                            className={`ml-auto font-mono font-bold ${
                              bonus >= 0 ? 'text-green-700' : 'text-red-700'
                            }`}
                          >
                            {formatModifier(bonus)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Hit Dice (HD) — no confundir con el bonus de ataque */}
              <div className="bg-parchment-100 border-2 border-ink-800 rounded-lg p-3 shadow-sm flex flex-wrap items-center gap-3">
                <div>
                  <span className="font-bold text-sm block">HD (dados de golpe)</span>
                  <span className="text-[10px] text-ink-500">Vida al subir de nivel / curar en descansos — no es el bonus de ataque</span>
                </div>
                <input
                  type="text"
                  value={character.hitDice}
                  onChange={(e) => update({ hitDice: e.target.value })}
                  className="w-20 px-2 py-1 border border-ink-400 rounded text-center"
                  title="Ej: 3d10"
                />
                <span className="text-sm text-ink-600">
                  Usados:
                  <input
                    type="number"
                    min={0}
                    value={character.hitDiceUsed}
                    onChange={(e) =>
                      update({ hitDiceUsed: parseInt(e.target.value) || 0 })
                    }
                    className="w-12 ml-1 px-1 border border-ink-400 rounded text-center"
                  />
                </span>
                <button
                  onClick={() =>
                    update({
                      hitPointMax: character.hitPointMax,
                      // quick full heal helper
                      hitPointCurrent: character.hitPointMax,
                      hitDiceUsed: 0,
                      deathSaves: { successes: 0, failures: 0 },
                    })
                  }
                  className="ml-auto text-xs px-2 py-1 bg-green-100 border border-green-400 rounded hover:bg-green-200"
                >
                  Descanso Largo
                </button>
              </div>

              {/* Spell slots on main — interactive */}
              <div className="bg-purple-50 border-2 border-purple-400 rounded-lg p-3">
                <div className="text-xs font-bold uppercase text-purple-800 mb-2">
                  Espacios de conjuro
                  {character.spellcastingAbility && (
                    <span className="ml-2 font-normal normal-case text-purple-700">
                      (caract. {character.spellcastingAbility.toUpperCase()})
                    </span>
                  )}
                </div>
                {Object.keys(character.spellSlots).length === 0 ? (
                  <p className="text-xs text-ink-500">
                    Sin espacios. Los lanzadores los obtienen al crear o subir de nivel.
                    También puedes gestionarlos en la pestaña Combate.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {Object.keys(character.spellSlots)
                      .map(Number)
                      .sort((a, b) => a - b)
                      .map((lvl) => {
                        const s = character.spellSlots[lvl];
                        return (
                          <div key={lvl} className="text-center">
                            <div className="text-[10px] uppercase text-ink-500 font-bold">Niv. {lvl}</div>
                            <div className="flex gap-1 my-1 justify-center">
                              {Array.from({ length: s.max }).map((_, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  title={i < s.used ? 'Restaurar' : 'Gastar'}
                                  onClick={() => {
                                    const slots = { ...character.spellSlots };
                                    const cur = { ...slots[lvl] };
                                    if (i < cur.used) cur.used = Math.max(0, cur.used - 1);
                                    else if (cur.used < cur.max) cur.used += 1;
                                    slots[lvl] = cur;
                                    update({ spellSlots: slots });
                                  }}
                                  className={`w-5 h-5 rounded-full border-2 border-purple-700 ${
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
              </div>

              {/* Languages */}
              {(character.languages && character.languages.length > 0) && (
                <div className="bg-parchment-100 border-2 border-ink-800 rounded-lg p-3 shadow-sm">
                  <div className="text-xs font-bold uppercase text-ink-600 mb-1">Idiomas</div>
                  <p className="text-sm">{character.languages.join(', ')}</p>
                </div>
              )}

              {/* Features & Traits */}
              <div className="bg-parchment-100 border-2 border-ink-800 rounded-lg p-3 shadow-sm">
                <div className="text-xs font-bold uppercase text-ink-600 mb-2">Features &amp; Traits</div>
                {character.features.length === 0 ? (
                  <p className="text-xs text-ink-500 italic">Sin rasgos</p>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {character.features.map((f) => (
                      <details key={f.id} className="bg-white border border-ink-200 rounded text-xs">
                        <summary className="px-2 py-1.5 cursor-pointer font-medium flex items-center gap-2">
                          <span className="flex-1">{f.name}</span>
                          {f.source && (
                            <span className="text-[10px] bg-ink-100 px-1.5 rounded capitalize">{f.source}</span>
                          )}
                        </summary>
                        <p className="px-2 pb-2 text-ink-700 whitespace-pre-wrap border-t border-ink-100 pt-1">
                          {f.description}
                        </p>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="lg:col-span-4">
              <SkillList
                character={character}
                onToggleProficiency={toggleSkill}
                editable
              />
            </div>
          </div>
          </>
        )}

        {activeTab === 'combat' && (
          <div className="space-y-3">
            <CollapsibleSection
              title="Rasgos y descansos"
              defaultOpen
              headerClassName="bg-amber-50 border-amber-400"
            >
              <ActionsPanel
                character={character}
                onUpdate={(partial) => update(partial)}
                sections={['rest', 'features']}
              />
            </CollapsibleSection>
            <CollapsibleSection
              title="Espacios, hechicería y conjuros"
              defaultOpen
              headerClassName="bg-purple-50 border-purple-400"
            >
              <CombatPanel
                character={character}
                onUpdate={(partial) => update(partial)}
                sections={['slots', 'spells']}
              />
            </CollapsibleSection>
            <CollapsibleSection
              title="Armas y ataques"
              defaultOpen
              headerClassName="bg-red-50 border-red-400"
            >
              <ActionsPanel
                character={character}
                onUpdate={(partial) => update(partial)}
                sections={['weapons']}
              />
            </CollapsibleSection>
            <CollapsibleSection
              title="Acciones comunes"
              defaultOpen={false}
              headerClassName="bg-ink-100 border-ink-400"
            >
              <ActionsPanel
                character={character}
                onUpdate={(partial) => update(partial)}
                sections={['common']}
              />
            </CollapsibleSection>
          </div>
        )}

        {activeTab === 'inventory' && (
          <InventoryPanel
            character={character}
            onUpdate={(partial) => update(partial)}
          />
        )}

        {activeTab === 'features' && (
          <FeaturesPanel
            character={character}
            onUpdate={(features) => update({ features })}
          />
        )}

        {activeTab === 'subclass' && (
          <div className="space-y-4">
            <SubclassPanel character={character} onUpdate={(partial) => update(partial)} />
            <SorceryPointsPanel character={character} onUpdate={(partial) => update(partial)} />
            <FeatureTablesPanel character={character} onUpdate={(partial) => update(partial)} />
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            <CampaignNotesPanel character={character} onUpdate={(partial) => update(partial)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold mb-1">Alineamiento</label>
                <select
                  value={character.alignment || ''}
                  onChange={(e) => update({ alignment: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg bg-white"
                >
                  <option value="">— Elegir —</option>
                  {ALIGNMENTS.map((a) => (
                    <option key={a.id} value={a.name}>{a.name}</option>
                  ))}
                </select>
                {getAlignmentInfo(character.alignment) && (
                  <p className="text-xs text-ink-600 mt-1.5 bg-parchment-100 border border-ink-200 rounded px-2 py-1.5">
                    {getAlignmentInfo(character.alignment)!.description}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Rasgos de Personalidad</label>
                <textarea
                  value={character.personalityTraits || ''}
                  onChange={(e) => update({ personalityTraits: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Ideales</label>
                <textarea
                  value={character.ideals || ''}
                  onChange={(e) => update({ ideals: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Vínculos</label>
                <textarea
                  value={character.bonds || ''}
                  onChange={(e) => update({ bonds: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Defectos</label>
                <textarea
                  value={character.flaws || ''}
                  onChange={(e) => update({ flaws: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg bg-white"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold mb-1">Apariencia</label>
                <textarea
                  value={character.appearance || ''}
                  onChange={(e) => update({ appearance: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Historia</label>
                <textarea
                  value={character.backstory || ''}
                  onChange={(e) => update({ backstory: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Notas de sesión</label>
                <textarea
                  value={character.notes || ''}
                  onChange={(e) => update({ notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>
          </div>
        )}
      </div>


      {showPendingChoices && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 pb-24 sm:p-4 sm:pb-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPendingChoices(false)} />
          <div className="relative bg-parchment-50 border-2 border-ink-900 rounded-xl p-5 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Características por seleccionar
              </h2>
              <button type="button" onClick={() => setShowPendingChoices(false)} className="p-1 hover:bg-ink-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-ink-600">
              Estas opciones se desbloquean al subir de nivel. Elige y anota qué tomas; se guardará en el rasgo correspondiente.
            </p>
            {unresolvedPending.map((p) => (
              <div key={p.id} className="bg-white border-2 border-amber-300 rounded-lg p-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm">{p.featureName}</strong>
                  <span className="text-[10px] bg-ink-100 px-1.5 rounded">Nivel {p.levelGained}</span>
                  {p.source && (
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 rounded capitalize">{p.source}</span>
                  )}
                </div>
                <p className="text-xs text-ink-700 whitespace-pre-wrap">{p.description}</p>
                {p.choiceHint && (
                  <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    {p.choiceHint}
                  </p>
                )}
                <input
                  type="text"
                  placeholder="Tu elección…"
                  value={pendingDrafts[p.id] || ''}
                  onChange={(e) =>
                    setPendingDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))
                  }
                  className="w-full px-2 py-1.5 border-2 border-ink-300 rounded-lg text-sm"
                />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={resolvePending}
                className="flex-1 py-2 bg-crimson-600 hover:bg-crimson-700 text-white rounded-lg font-medium"
              >
                Guardar elecciones
              </button>
              <button
                type="button"
                onClick={() => setShowPendingChoices(false)}
                className="px-4 py-2 bg-ink-200 hover:bg-ink-300 rounded-lg"
              >
                Más tarde
              </button>
            </div>
          </div>
        </div>
      )}

      {showLevelUp && (
        <LevelUpModal
          character={character}
          onClose={() => setShowLevelUp(false)}
          onConfirm={(updated) => {
            setCharacter(updated);
            setDirty(true);
            setShowLevelUp(false);
          }}
        />
      )}
    </div>
  );
}
