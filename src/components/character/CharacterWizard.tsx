import { useState, useMemo } from 'react';
import type { AbilityScore, AbilityScores, Character } from '../../types/dnd';
import { ABILITY_LABELS } from '../../types/dnd';
import { useRaces } from '../../hooks/useRaces';
import { useClasses } from '../../hooks/useClasses';
import { useBackgrounds } from '../../hooks/useBackgrounds';
import {
  STANDARD_ARRAY,
  POINT_BUY_COST,
  pointBuyTotal,
  applyRaceASI,
  buildCharacterFromWizard,
  SUBCLASSES,
  countExtraLanguageChoices,
  COMMON_LANGUAGES,
  CLASS_SKILL_OPTIONS,
  ALIGNMENTS,
} from '../../utils/characterBuilder';
import { expandPackItems, packSummary } from '../../utils/equipmentPacks';
import startingEquipment from '../../data/starting-equipment.json';
import type { InventoryItem } from '../../types/dnd';
import { getModifier, formatModifier } from '../../utils/character';
import { formatSpeed } from '../../utils/units';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

const ABILITIES: AbilityScore[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

interface Props {
  onComplete: (character: Character) => void;
  onCancel: () => void;
}

type Step = 'identity' | 'race' | 'class' | 'subclass' | 'abilities' | 'background' | 'skills' | 'choices' | 'equipment' | 'review';

const STEPS: { id: Step; label: string }[] = [
  { id: 'identity', label: 'Nombre' },
  { id: 'race', label: 'Raza' },
  { id: 'class', label: 'Clase' },
  { id: 'subclass', label: 'Subclase' },
  { id: 'abilities', label: 'Atributos' },
  { id: 'background', label: 'Trasfondo' },
  { id: 'skills', label: 'Habilidades' },
  { id: 'choices', label: 'Elecciones' },
  { id: 'equipment', label: 'Equipo' },
  { id: 'review', label: 'Resumen' },
];

export function CharacterWizard({ onComplete, onCancel }: Props) {
  const { races } = useRaces();
  const { classes } = useClasses();
  const { backgrounds } = useBackgrounds();

  const [step, setStep] = useState<Step>('identity');
  const [name, setName] = useState('');
  const [alignment, setAlignment] = useState('');
  const [raceId, setRaceId] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [subclassId, setSubclassId] = useState<string | null>(null);
  const [abilityMode, setAbilityMode] = useState<'array' | 'pointbuy' | 'manual'>('array');
  const [baseScores, setBaseScores] = useState<AbilityScores>({
    str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8,
  });
  const [arrayAssign, setArrayAssign] = useState<Partial<Record<AbilityScore, number>>>({});
  const [background, setBackground] = useState('Soldado');
  const [chosenLanguages, setChosenLanguages] = useState<string[]>([]);
  const [chosenClassSkills, setChosenClassSkills] = useState<string[]>([]);
  const [equipChoices, setEquipChoices] = useState<Record<string, number>>({});

  const race = races.find((r) => r.id === raceId) || null;
  const classData = classes.find((c) => c.id === classId) || null;
  const subclassOptions = classId ? SUBCLASSES[classId] || [] : [];
  const subclass = subclassOptions.find((s) => s.id === subclassId);

  const finalScores = useMemo(() => {
    if (!race) return baseScores;
    let scores = applyRaceASI(baseScores, race.abilityScoreIncrease);
    for (const trait of race.traits) {
      if (trait.abilityBonuses) {
        (Object.keys(trait.abilityBonuses) as (keyof typeof scores)[]).forEach((k) => {
          scores = {
            ...scores,
            [k]: Math.min(20, scores[k] + (trait.abilityBonuses![k] || 0)),
          };
        });
      }
    }
    return scores;
  }, [baseScores, race]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const canNext = (): boolean => {
    switch (step) {
      case 'identity':
        return name.trim().length > 0;
      case 'race':
        return !!raceId;
      case 'class':
        return !!classId;
      case 'subclass':
        return subclassOptions.length === 0 || !!subclassId;
      case 'abilities':
        if (abilityMode === 'pointbuy') return pointBuyTotal(baseScores) <= 27;
        if (abilityMode === 'array') {
          const used = Object.values(arrayAssign);
          return used.length === 6 && new Set(used).size === 6;
        }
        return true;
      case 'background':
        return background.trim().length > 0;
      case 'skills': {
        if (!classId) return true;
        const opt = CLASS_SKILL_OPTIONS[classId];
        if (!opt) return true;
        return chosenClassSkills.length >= opt.count;
      }
      case 'choices': {
        if (!race) return false;
        const bg = backgrounds.find(
          (b) => b.name === background || b.id === background.toLowerCase()
        );
        const need = countExtraLanguageChoices(race, bg?.languages);
        return chosenLanguages.filter(Boolean).length >= need;
      }
      case 'equipment': {
        if (!classId) return true;
        const pack = (startingEquipment as any)[classId];
        if (!pack?.choices?.length) return true;
        return pack.choices.every((c: any) => equipChoices[c.id] !== undefined);
      }
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (step === 'abilities' && abilityMode === 'array') {
      const scores = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 } as AbilityScores;
      ABILITIES.forEach((a) => {
        if (arrayAssign[a] !== undefined) scores[a] = arrayAssign[a]!;
      });
      setBaseScores(scores);
    }
    if (step === 'class') {
      // skip subclass if none
      if ((SUBCLASSES[classId!] || []).length === 0) {
        setStep('abilities');
        return;
      }
    }
    if (step === 'review') {
      finish();
      return;
    }
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next.id);
  };

  const goBack = () => {
    if (stepIndex === 0) {
      onCancel();
      return;
    }
    // skip subclass backward
    if (step === 'abilities' && (SUBCLASSES[classId!] || []).length === 0) {
      setStep('class');
      return;
    }
    setStep(STEPS[stepIndex - 1].id);
  };

  const finish = () => {
    if (!race || !classData) return;
    let scores = baseScores;
    if (abilityMode === 'array') {
      scores = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
      ABILITIES.forEach((a) => {
        if (arrayAssign[a] !== undefined) scores[a] = arrayAssign[a]!;
      });
    }
    const pack = (startingEquipment as any)[classData.id];
    let customInventory: InventoryItem[] | undefined;
    if (pack) {
      const items: InventoryItem[] = [];
      const pushItem = (raw: any) => {
        const expanded = expandPackItems(raw.name || '');
        if (expanded) {
          for (const part of expanded) {
            items.push({
              ...part,
              id: crypto.randomUUID(),
              quantity: part.quantity || 1,
              proficient: !!part.damage,
            });
          }
          return;
        }
        items.push({
          ...raw,
          id: crypto.randomUUID(),
          quantity: raw.quantity || 1,
          proficient: raw.proficient ?? !!raw.damage,
          properties: raw.properties,
        });
      };
      for (const fixed of pack.fixed || []) pushItem(fixed);
      for (const choice of pack.choices || []) {
        const idx = equipChoices[choice.id] ?? 0;
        const opt = choice.options[idx];
        if (opt) pushItem(opt);
      }
      customInventory = items;
    }
    const char = buildCharacterFromWizard({
      name: name.trim(),
      race,
      classData,
      subclassName: subclass?.name,
      subclassId: subclass?.id,
      background: background.trim(),
      baseScores: scores,
      level: 1,
      chosenLanguages: chosenLanguages.filter(Boolean),
      chosenSkills: chosenClassSkills,
      customInventory,
    });
    // Add subclass features if any at level 1-3 that apply at 1... typically 3
    if (subclass) {
      for (const f of subclass.features.filter((x) => x.level <= 1)) {
        char.features.push({
          id: f.id,
          name: f.name,
          description: f.description,
          source: 'subclass',
        });
      }
    }
    if (alignment) char.alignment = alignment;
    onComplete(char);
  };

  const setScore = (ability: AbilityScore, value: number) => {
    setBaseScores((prev) => ({ ...prev, [ability]: Math.min(15, Math.max(8, value)) }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-ink-900 text-parchment-50 rounded-t-xl p-4">
        <h1 className="text-xl font-display font-bold">Crear personaje</h1>
        <div className="flex flex-wrap gap-1 mt-3">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`text-xs px-2 py-1 rounded ${
                i === stepIndex
                  ? 'bg-crimson-600 text-white'
                  : i < stepIndex
                  ? 'bg-ink-700 text-parchment-300'
                  : 'bg-ink-800 text-ink-500'
              }`}
            >
              {i + 1}. {s.label}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-parchment-50 border-2 border-t-0 border-ink-800 rounded-b-xl p-6 min-h-[320px]">
        {step === 'identity' && (
          <div className="space-y-4">
            <p className="text-ink-600 text-sm">¿Cómo se llama tu personaje?</p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del personaje"
              className="w-full text-2xl font-display px-4 py-3 border-2 border-ink-300 rounded-lg focus:border-crimson-600 focus:outline-none"
            />
            <div>
              <label className="block text-sm font-bold mb-1 text-ink-700">Alineamiento</label>
              <select
                value={alignment}
                onChange={(e) => setAlignment(e.target.value)}
                className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg bg-white"
              >
                <option value="">— Opcional —</option>
                {ALIGNMENTS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <p className="text-xs text-ink-500 mt-1">En D&amp;D 2024 el alineamiento es principalmente roleplay.</p>
            </div>
          </div>
        )}

        {step === 'race' && (
          <div className="space-y-3">
            <p className="text-ink-600 text-sm mb-2">Elige una raza (SRD o homebrew).</p>
            <div className="grid gap-2 max-h-80 overflow-y-auto">
              {races.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRaceId(r.id)}
                  className={`text-left p-3 rounded-lg border-2 transition-colors ${
                    raceId === r.id
                      ? 'border-crimson-600 bg-parchment-200'
                      : 'border-ink-200 bg-white hover:border-ink-400'
                  }`}
                >
                  <div className="font-bold flex items-center gap-2">
                    {r.name}
                    {r.homebrew && (
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1 rounded">HB</span>
                    )}
                  </div>
                  <div className="text-xs text-ink-500 mt-1">
                    {r.abilityScoreIncrease} · {formatSpeed(r.speed)} · {r.size}
                  </div>
                  <p className="text-sm text-ink-700 mt-1">{r.description}</p>
                  <div className="text-xs text-ink-600 mt-2">
                    <strong>Idiomas:</strong> {r.languages.join(', ')}
                  </div>
                  {r.traits.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {r.traits.map((tr) => (
                        <li key={tr.id} className="text-xs bg-white/80 border border-ink-100 rounded px-2 py-1">
                          <strong>{tr.name}:</strong> {tr.description}
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'class' && (
          <div className="space-y-3">
            <p className="text-ink-600 text-sm mb-2">Elige una clase. Se aplicarán sus rasgos de nivel 1 y el equipo inicial.</p>
            <div className="grid gap-2 max-h-80 overflow-y-auto">
              {classes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setClassId(c.id);
                    setSubclassId(null);
                    setChosenClassSkills([]);
                  }}
                  className={`text-left p-3 rounded-lg border-2 transition-colors ${
                    classId === c.id
                      ? 'border-crimson-600 bg-parchment-200'
                      : 'border-ink-200 bg-white hover:border-ink-400'
                  }`}
                >
                  <div className="font-bold flex items-center gap-2">
                    {c.name}
                    {c.homebrew && (
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1 rounded">HB</span>
                    )}
                  </div>
                  <div className="text-xs text-ink-500 mt-1">
                    {c.hitDie} · {c.primaryAbility}
                    {c.spellcasting && ' · Lanzador de conjuros'}
                    {' · '}{c.skillChoices}
                  </div>
                  <p className="text-sm text-ink-700 mt-1">{c.description}</p>
                  {classId === c.id && (
                    <div className="mt-2 space-y-1 border-t border-ink-200 pt-2 text-left">
                      <div className="text-[11px] font-bold text-ink-600 uppercase">Al crear (nivel 1)</div>
                      {c.features.filter((f) => f.level <= 1).map((f) => (
                        <div key={f.id} className="text-xs bg-white/90 border border-ink-100 rounded px-2 py-1">
                          <strong>{f.name}</strong>
                          {f.uses && (
                            <span className="ml-1 text-[10px] bg-amber-100 px-1 rounded">
                              {f.uses.max} uso(s)/{f.uses.recovery}
                            </span>
                          )}
                          {f.requiresChoice && (
                            <span className="ml-1 text-[10px] bg-amber-200 px-1 rounded">Requiere elección</span>
                          )}
                          <p className="text-ink-600 mt-0.5">{f.description}</p>
                        </div>
                      ))}
                      {c.features.some((f) => f.level > 1) && (
                        <>
                          <div className="text-[11px] font-bold text-ink-500 uppercase mt-1">Más adelante</div>
                          {c.features.filter((f) => f.level > 1).slice(0, 6).map((f) => (
                            <div key={f.id} className="text-xs text-ink-600">
                              <strong>Niv. {f.level}:</strong> {f.name}
                              {f.requiresChoice ? ' (elección)' : ''}
                            </div>
                          ))}
                        </>
                      )}
                      <div className="text-[11px] text-ink-500 mt-1">
                        Salvaciones: {c.savingThrows.join(', ')} · Armadura: {c.armorProficiencies}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'subclass' && (
          <div className="space-y-3">
            <p className="text-ink-600 text-sm">
              Subclase de {classData?.name}. Algunas se eligen a nivel 1–3; puedes elegirla ahora o más tarde al subir de nivel.
            </p>
            <button
              onClick={() => setSubclassId(null)}
              className={`w-full text-left p-3 rounded-lg border-2 ${
                subclassId === null ? 'border-crimson-600 bg-parchment-200' : 'border-ink-200 bg-white'
              }`}
            >
              <span className="font-medium">Decidir más tarde</span>
            </button>
            {subclassOptions.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubclassId(s.id)}
                className={`w-full text-left p-3 rounded-lg border-2 ${
                  subclassId === s.id ? 'border-crimson-600 bg-parchment-200' : 'border-ink-200 bg-white'
                }`}
              >
                <div className="font-bold">{s.name}</div>
                <p className="text-sm text-ink-600 mt-1">{s.description}</p>
              </button>
            ))}
            {subclassOptions.length === 0 && (
              <p className="text-sm text-ink-500 italic">Esta clase no tiene subclases cargadas aún. Continúa.</p>
            )}
          </div>
        )}

        {step === 'abilities' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['array', 'Array estándar'],
                  ['pointbuy', 'Point buy (27)'],
                  ['manual', 'Manual'],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setAbilityMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    abilityMode === mode ? 'bg-crimson-600 text-white' : 'bg-ink-100 hover:bg-ink-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {abilityMode === 'array' && (
              <div className="space-y-2">
                <p className="text-sm text-ink-600">
                  Asigna {STANDARD_ARRAY.join(', ')} a cada característica.
                </p>
                {ABILITIES.map((a) => {
                  const base = arrayAssign[a];
                  const showFinal = race && base !== undefined;
                  const fin = showFinal ? applyRaceASI({ ...baseScores, [a]: base! }, race!.abilityScoreIncrease)[a] : base;
                  return (
                  <div key={a} className="flex items-center gap-3 flex-wrap">
                    <span className="w-28 font-medium text-sm">
                      {ABILITY_LABELS[a]}
                      {showFinal && fin !== undefined && fin > base! && (
                        <span className="ml-1 text-[10px] bg-green-200 text-green-900 px-1 rounded">+{fin - base!} raza</span>
                      )}
                    </span>
                    <select
                      value={arrayAssign[a] ?? ''}
                      onChange={(e) => {
                        const v = parseInt(e.target.value);
                        setArrayAssign((prev) => {
                          const next = { ...prev };
                          (Object.keys(next) as AbilityScore[]).forEach((k) => {
                            if (next[k] === v) delete next[k];
                          });
                          if (!isNaN(v)) next[a] = v;
                          else delete next[a];
                          return next;
                        });
                        if (!isNaN(v)) {
                          setBaseScores((prev) => ({ ...prev, [a]: v }));
                        }
                      }}
                      className="px-2 py-1 border-2 border-ink-300 rounded"
                    >
                      <option value="">—</option>
                      {STANDARD_ARRAY.map((n) => (
                        <option
                          key={n}
                          value={n}
                          disabled={Object.values(arrayAssign).includes(n) && arrayAssign[a] !== n}
                        >
                          {n} ({formatModifier(getModifier(n))})
                        </option>
                      ))}
                    </select>
                    {showFinal && fin !== undefined && (
                      <span className="text-xs text-ink-600">→ total <strong>{fin}</strong></span>
                    )}
                  </div>
                );})}
              </div>
            )}

            {abilityMode === 'pointbuy' && (
              <div className="space-y-2">
                <p className="text-sm text-ink-600">
                  Puntos usados: <strong>{pointBuyTotal(baseScores)}</strong> / 27
                  {pointBuyTotal(baseScores) > 27 && (
                    <span className="text-red-600 ml-2">¡Excedes el límite!</span>
                  )}
                </p>
                {ABILITIES.map((a) => {
                  const racial = race ? finalScores[a] - baseScores[a] : 0;
                  return (
                  <div key={a} className="flex items-center gap-3">
                    <span className="w-28 font-medium text-sm">
                      {ABILITY_LABELS[a]}
                      {racial > 0 && (
                        <span className="ml-1 text-[10px] bg-green-200 text-green-900 px-1 rounded">+{racial} raza</span>
                      )}
                    </span>
                    <input
                      type="number"
                      min={8}
                      max={15}
                      value={baseScores[a]}
                      onChange={(e) => setScore(a, parseInt(e.target.value) || 8)}
                      className="w-16 px-2 py-1 border-2 border-ink-300 rounded text-center"
                    />
                    <span className="text-sm text-ink-500">
                      base {baseScores[a]} → <strong>{finalScores[a]}</strong> ({formatModifier(getModifier(finalScores[a]))})
                      · coste {POINT_BUY_COST[baseScores[a]] ?? '?'}
                    </span>
                  </div>
                );})}
              </div>
            )}

            {abilityMode === 'manual' && (
              <div className="space-y-2">
                {ABILITIES.map((a) => (
                  <div key={a} className="flex items-center gap-3">
                    <span className="w-28 font-medium text-sm">{ABILITY_LABELS[a]}</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={baseScores[a]}
                      onChange={(e) =>
                        setBaseScores((prev) => ({
                          ...prev,
                          [a]: Math.min(20, Math.max(1, parseInt(e.target.value) || 10)),
                        }))
                      }
                      className="w-16 px-2 py-1 border-2 border-ink-300 rounded text-center"
                    />
                    <span className="text-sm">{formatModifier(getModifier(baseScores[a]))}</span>
                  </div>
                ))}
              </div>
            )}

            {race && (
              <div className="bg-green-50 border border-green-300 rounded-lg p-3 text-sm space-y-2">
                <strong>Origen de los atributos — {race.name}</strong>
                <p className="text-xs text-ink-600">{race.abilityScoreIncrease}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ABILITIES.map((a) => {
                    const racial = finalScores[a] - baseScores[a];
                    return (
                      <div key={a} className="bg-white border border-green-200 rounded p-2 text-center">
                        <div className="text-[10px] uppercase text-ink-500">{ABILITY_LABELS[a]}</div>
                        <div className="font-bold text-lg">{finalScores[a]}</div>
                        <div className="text-[11px] text-ink-600">
                          base {baseScores[a]}
                          {racial > 0 ? (
                            <span className="text-green-700 font-semibold"> +{racial} raza</span>
                          ) : (
                            <span className="text-ink-400"> +0 raza</span>
                          )}
                        </div>
                        <div className="text-xs">{formatModifier(getModifier(finalScores[a]))}</div>
                      </div>
                    );
                  })}
                </div>
                {classData && (
                  <p className="text-xs text-ink-500">
                    Clase <strong>{classData.name}</strong>: no suma atributos fijos al crear (salvo rasgos especiales de subclase/homebrew).
                    Salvaciones: {classData.savingThrows.join(', ')}.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {step === 'background' && (
          <div className="space-y-3">
            <p className="text-sm text-ink-600">Elige un trasfondo. Verás qué otorga (habilidades, idiomas, equipo, rasgo).</p>
            <div className="grid gap-2 max-h-72 overflow-y-auto">
              {backgrounds.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setBackground(bg.name)}
                  className={`text-left p-3 rounded-lg border-2 ${
                    background === bg.name
                      ? 'border-crimson-600 bg-parchment-200'
                      : 'border-ink-200 bg-white hover:border-ink-400'
                  }`}
                >
                  <div className="font-bold flex items-center gap-2">
                    {bg.name}
                    {bg.homebrew && (
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1 rounded">HB</span>
                    )}
                  </div>
                  <p className="text-xs text-ink-600 mt-1">{bg.description}</p>
                  <div className="text-xs mt-2 space-y-0.5 text-ink-700">
                    {bg.skillProficiencies && (
                      <div><strong>Habilidades:</strong> {bg.skillProficiencies.join(', ')}</div>
                    )}
                    {bg.toolProficiencies && (
                      <div><strong>Herramientas:</strong> {bg.toolProficiencies.join(', ')}</div>
                    )}
                    {bg.languages && (
                      <div><strong>Idiomas:</strong> {bg.languages.description}</div>
                    )}
                    {bg.feature && (
                      <div><strong>Rasgo — {bg.feature.name}:</strong> {bg.feature.description}</div>
                    )}
                    {bg.equipment && (
                      <div><strong>Equipo:</strong> {bg.equipment.join(', ')}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <input
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
              placeholder="O escribe un trasfondo libre / homebrew"
            />
          </div>
        )}


        {step === 'skills' && classData && (
          <div className="space-y-3">
            {(() => {
              const opt = CLASS_SKILL_OPTIONS[classData.id];
              if (!opt) {
                return (
                  <p className="text-sm text-ink-500">
                    Esta clase no tiene lista de competencias cargada. Continúa.
                  </p>
                );
              }
              return (
                <>
                  <p className="text-sm text-ink-600">
                    Elige <strong>{opt.count}</strong> habilidad{opt.count > 1 ? 'es' : ''} de clase
                    ({chosenClassSkills.length}/{opt.count}). El trasfondo puede añadir otras.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-80 overflow-y-auto">
                    {opt.skills.map((sk) => {
                      const selected = chosenClassSkills.includes(sk);
                      const full = chosenClassSkills.length >= opt.count && !selected;
                      return (
                        <button
                          key={sk}
                          type="button"
                          disabled={full}
                          onClick={() => {
                            setChosenClassSkills((prev) =>
                              selected ? prev.filter((x) => x !== sk) : [...prev, sk]
                            );
                          }}
                          className={`text-left px-3 py-2 rounded-lg border-2 text-sm ${
                            selected
                              ? 'border-crimson-600 bg-parchment-200'
                              : full
                              ? 'border-ink-100 bg-ink-50 text-ink-400'
                              : 'border-ink-200 bg-white hover:border-ink-400'
                          }`}
                        >
                          {sk}
                        </button>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {step === 'choices' && race && (
          <div className="space-y-4">
            <p className="text-sm text-ink-600">
              Elige las opciones que te otorgan raza y trasfondo (idiomas, etc.).
            </p>
            <div className="bg-white border border-ink-200 rounded-lg p-3 text-sm">
              <strong>Idiomas fijos de la raza:</strong>{' '}
              {race.languages.filter((l) => !/adicional|elección|eleccion/i.test(l)).join(', ') || '—'}
            </div>
            {(() => {
              const bg = backgrounds.find(
                (b) => b.name === background || b.id === background.toLowerCase()
              );
              const need = countExtraLanguageChoices(race, bg?.languages);
              if (need === 0) {
                return (
                  <p className="text-sm text-ink-500 italic">
                    No hay idiomas adicionales a elegir para esta combinación.
                  </p>
                );
              }
              return (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Elige {need} idioma{need > 1 ? 's' : ''} adicional{need > 1 ? 'es' : ''}:
                  </p>
                  {Array.from({ length: need }).map((_, i) => (
                    <select
                      key={i}
                      value={chosenLanguages[i] || ''}
                      onChange={(e) => {
                        const next = [...chosenLanguages];
                        next[i] = e.target.value;
                        setChosenLanguages(next);
                      }}
                      className="w-full px-3 py-2 border-2 border-ink-300 rounded-lg"
                    >
                      <option value="">— Seleccionar —</option>
                      {COMMON_LANGUAGES.map((lang) => (
                        <option
                          key={lang}
                          value={lang}
                          disabled={chosenLanguages.includes(lang) && chosenLanguages[i] !== lang}
                        >
                          {lang}
                        </option>
                      ))}
                    </select>
                  ))}
                  {bg?.languages && (
                    <p className="text-xs text-ink-500">Trasfondo: {bg.languages.description}</p>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {step === 'equipment' && classData && (
          <div className="space-y-4">
            <p className="text-sm text-ink-600">
              Elige el equipo inicial de {classData.name} (opciones del PHB/SRD 5e).
            </p>
            {(() => {
              const pack = (startingEquipment as any)[classData.id];
              if (!pack) {
                return <p className="text-sm text-ink-500">Sin paquete de equipo para esta clase.</p>;
              }
              return (
                <div className="space-y-4">
                  {(pack.fixed || []).length > 0 && (
                    <div className="bg-ink-50 border border-ink-200 rounded-lg p-3 text-sm">
                      <strong>Equipo fijo:</strong>
                      <ul className="list-disc list-inside mt-1 text-ink-700">
                        {pack.fixed.map((it: any, i: number) => (
                          <li key={i}>{it.name}{it.quantity > 1 ? ` ×${it.quantity}` : ''}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(pack.choices || []).map((choice: any) => (
                    <div key={choice.id} className="border-2 border-ink-200 rounded-lg p-3">
                      <div className="font-bold text-sm mb-2">{choice.label}</div>
                      <div className="space-y-2">
                        {choice.options.map((opt: any, idx: number) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setEquipChoices((prev) => ({ ...prev, [choice.id]: idx }))
                            }
                            className={`w-full text-left p-2 rounded border-2 text-sm ${
                              equipChoices[choice.id] === idx
                                ? 'border-crimson-600 bg-parchment-200'
                                : 'border-ink-200 bg-white hover:border-ink-400'
                            }`}
                          >
                            <strong>{opt.name}</strong>
                            {opt.damage && (
                              <span className="text-xs text-red-700 ml-2">
                                {opt.damage} {opt.damageType}
                              </span>
                            )}
                            {opt.description && (
                              <p className="text-xs text-ink-600 mt-0.5">{opt.description}</p>
                            )}
                            {packSummary(opt.name) && (
                              <p className="text-[11px] text-ink-500 mt-1 bg-ink-50 border border-ink-100 rounded px-1.5 py-1">
                                <strong>Contiene:</strong> {packSummary(opt.name)}
                              </p>
                            )}
                            {opt.damage && (
                              <p className="text-[11px] text-red-800 mt-0.5 font-mono">
                                {opt.damage} {opt.damageType || ''}
                                {opt.properties ? ` · ${(opt.properties as string[]).join(', ')}` : ''}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {step === 'review' && race && classData && (
          <div className="space-y-3 text-sm">
            <h2 className="text-xl font-display font-bold">{name}</h2>
            <p>
              {race.name} {classData.name}
              {subclass ? ` (${subclass.name})` : ''} · Nivel 1 · {background}
            </p>
            <p className="text-sm text-ink-700">
              <strong>Idiomas:</strong>{' '}
              {[
                ...race.languages.filter((l) => !/adicional|elección|eleccion/i.test(l)),
                ...chosenLanguages.filter(Boolean),
              ].join(', ') || '—'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {ABILITIES.map((a) => (
                <div key={a} className="bg-white border border-ink-200 rounded p-2 text-center">
                  <div className="text-xs uppercase text-ink-500">{ABILITY_LABELS[a].slice(0, 3)}</div>
                  <div className="font-bold text-lg">{finalScores[a]}</div>
                  <div className="text-xs">{formatModifier(getModifier(finalScores[a]))}</div>
                </div>
              ))}
            </div>
            <p className="text-ink-600">
              Se aplicarán: rasgos raciales, características de clase de nivel 1, equipo inicial de{' '}
              {classData.name}, y conjuros iniciales si la clase los tiene.
            </p>
            <p className="text-ink-500 text-xs">
              Velocidad {formatSpeed(race.speed)} · Dado de golpe {classData.hitDie} · Salvaciones:{' '}
              {classData.savingThrows.join(', ')}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={goBack}
          className="flex items-center gap-1 px-4 py-2 bg-ink-200 hover:bg-ink-300 rounded-lg"
        >
          <ChevronLeft className="w-4 h-4" /> {stepIndex === 0 ? 'Cancelar' : 'Atrás'}
        </button>
        <button
          onClick={goNext}
          disabled={!canNext()}
          className="flex items-center gap-1 px-4 py-2 bg-crimson-600 hover:bg-crimson-700 disabled:opacity-40 text-white rounded-lg font-medium"
        >
          {step === 'review' ? (
            <>
              <Check className="w-4 h-4" /> Crear personaje
            </>
          ) : (
            <>
              Siguiente <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
