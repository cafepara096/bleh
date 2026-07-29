import { useState, useMemo } from 'react';
import type { AbilityScore, AbilityScores, Character } from '../../types/dnd';
import { ABILITY_LABELS } from '../../types/dnd';
import { useClasses } from '../../hooks/useClasses';
import {
  applyLevelUp,
  hitDieNumber,
  isAsiLevel,
  SUBCLASSES,
  toCharacterFeatures,
} from '../../utils/characterBuilder';
import { getModifier, formatModifier } from '../../utils/character';
import { X, TrendingUp } from 'lucide-react';

interface Props {
  character: Character;
  onConfirm: (updated: Character) => void;
  onClose: () => void;
}

const ABILITIES: AbilityScore[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export function LevelUpModal({ character, onConfirm, onClose }: Props) {
  const { classes } = useClasses();
  const classData = classes.find(
    (c) => c.id === character.classId || c.name === character.class
  );
  const newLevel = Math.min(20, character.level + 1);
  const die = hitDieNumber(classData?.hitDie || 'd8');
  const avgHp = Math.floor(die / 2) + 1;
  const conMod = getModifier(character.abilityScores.con);

  const [hpMode, setHpMode] = useState<'avg' | 'roll'>('avg');
  const [rolledHp, setRolledHp] = useState(avgHp);
  const [asi, setAsi] = useState<Partial<AbilityScores>>({});
  const [asiBudget, setAsiBudget] = useState(2); // +2 total or two +1
  const [pickSubclass, setPickSubclass] = useState(false);
  const [subclassId, setSubclassId] = useState(character.subclassId || '');

  const needsAsi = isAsiLevel(newLevel);
  const subclassOptions = classData ? SUBCLASSES[classData.id] || [] : [];
  const subclassLevel =
    classData?.features.find((f) => /subclase|arquetipo|camino|colegio|dominio|juramento|círculo|tradici[oó]n|origen|patr[oó]n/i.test(f.name))?.level || 3;
  const needsSubclass =
    !character.subclass &&
    subclassOptions.length > 0 &&
    newLevel >= subclassLevel;

  const featuresAtLevel = useMemo(() => {
    if (!classData) return [];
    return classData.features.filter((f) => f.level === newLevel);
  }, [classData, newLevel]);

  const hpGain =
    Math.max(1, (hpMode === 'avg' ? avgHp : rolledHp) + conMod);

  const asiSpent = Object.values(asi).reduce((s, v) => s + (v || 0), 0);

  const applyAsiPoint = (ability: AbilityScore, delta: number) => {
    setAsi((prev) => {
      const current = prev[ability] || 0;
      const next = Math.max(0, current + delta);
      const others = Object.entries(prev)
        .filter(([k]) => k !== ability)
        .reduce((s, [, v]) => s + (v || 0), 0);
      if (others + next > asiBudget) return prev;
      if (character.abilityScores[ability] + next > 20) return prev;
      return { ...prev, [ability]: next || undefined };
    });
  };

  const handleConfirm = () => {
    if (needsAsi && asiSpent !== asiBudget) {
      alert(`Debes distribuir exactamente ${asiBudget} puntos de característica.`);
      return;
    }

    let updated = applyLevelUp(character, classData, {
      hpGain,
      asi: needsAsi ? asi : undefined,
    });

    // Subclass pick
    if (needsSubclass && subclassId) {
      const sub = subclassOptions.find((s) => s.id === subclassId);
      if (sub) {
        updated = {
          ...updated,
          subclass: sub.name,
          subclassId: sub.id,
          features: [
            ...updated.features,
            ...toCharacterFeatures(
              sub.features.filter((f) => f.level <= newLevel),
              'subclass'
            ),
          ],
        };
      }
    }

    onConfirm(updated);
  };

  if (character.level >= 20) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-parchment-50 border-2 border-ink-900 rounded-xl p-6 max-w-sm">
          <p className="font-bold">Nivel máximo (20) alcanzado.</p>
          <button onClick={onClose} className="mt-4 w-full py-2 bg-ink-200 rounded-lg">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-parchment-50 border-2 border-ink-900 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-ink-900 text-parchment-50 p-4 flex items-center justify-between sticky top-0">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <h2 className="font-display font-bold text-lg">
              Subir a nivel {newLevel}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-ink-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* HP */}
          <section className="bg-white border border-ink-200 rounded-lg p-3">
            <h3 className="font-bold text-sm mb-2">Puntos de golpe</h3>
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setHpMode('avg')}
                className={`px-3 py-1 rounded text-sm ${
                  hpMode === 'avg' ? 'bg-crimson-600 text-white' : 'bg-ink-100'
                }`}
              >
                Promedio (+{avgHp})
              </button>
              <button
                onClick={() => setHpMode('roll')}
                className={`px-3 py-1 rounded text-sm ${
                  hpMode === 'roll' ? 'bg-crimson-600 text-white' : 'bg-ink-100'
                }`}
              >
                Tirar 1d{die}
              </button>
            </div>
            {hpMode === 'roll' && (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  min={1}
                  max={die}
                  value={rolledHp}
                  onChange={(e) =>
                    setRolledHp(Math.min(die, Math.max(1, parseInt(e.target.value) || 1)))
                  }
                  className="w-16 px-2 py-1 border rounded text-center"
                />
                <button
                  onClick={() => setRolledHp(Math.floor(Math.random() * die) + 1)}
                  className="text-xs px-2 py-1 bg-ink-200 rounded"
                >
                  Aleatorio
                </button>
              </div>
            )}
            <p className="text-sm">
              Ganancia: <strong>+{hpGain}</strong> (dado + mod. Con {formatModifier(conMod)})
              <br />
              PG máximos: {character.hitPointMax} → {character.hitPointMax + hpGain}
            </p>
          </section>

          {/* Features gained */}
          {featuresAtLevel.length > 0 && (
            <section className="bg-white border border-ink-200 rounded-lg p-3">
              <h3 className="font-bold text-sm mb-2">Nuevas características de clase</h3>
              <ul className="space-y-1 text-sm">
                {featuresAtLevel.map((f) => (
                  <li key={f.id}>
                    <strong>{f.name}</strong>
                    <p className="text-ink-600 text-xs">{f.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ASI */}
          {needsAsi && (
            <section className="bg-amber-50 border border-amber-300 rounded-lg p-3">
              <h3 className="font-bold text-sm mb-1">
                Mejora de característica (ASI)
              </h3>
              <p className="text-xs text-ink-600 mb-2">
                Distribuye <strong>{asiBudget}</strong> puntos (+2 a una o +1 a dos). Máximo 20.
                Gastados: {asiSpent}/{asiBudget}
              </p>
              <div className="space-y-1">
                {ABILITIES.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm">
                    <span className="w-24">{ABILITY_LABELS[a]}</span>
                    <span className="w-8 font-mono">{character.abilityScores[a]}</span>
                    <button
                      onClick={() => applyAsiPoint(a, -1)}
                      className="w-7 h-7 bg-ink-200 rounded"
                      disabled={!asi[a]}
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-bold text-green-700">
                      {asi[a] ? `+${asi[a]}` : '0'}
                    </span>
                    <button
                      onClick={() => applyAsiPoint(a, 1)}
                      className="w-7 h-7 bg-ink-200 rounded"
                    >
                      +
                    </button>
                    <span className="text-ink-500 text-xs">
                      → {character.abilityScores[a] + (asi[a] || 0)} (
                      {formatModifier(getModifier(character.abilityScores[a] + (asi[a] || 0)))})
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Subclass */}
          {needsSubclass && (
            <section className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <h3 className="font-bold text-sm mb-2">Elegir subclase</h3>
              <div className="space-y-2">
                {subclassOptions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSubclassId(s.id)}
                    className={`w-full text-left p-2 rounded border-2 text-sm ${
                      subclassId === s.id
                        ? 'border-crimson-600 bg-white'
                        : 'border-ink-200 bg-white/50'
                    }`}
                  >
                    <strong>{s.name}</strong>
                    <p className="text-xs text-ink-600">{s.description}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="text-xs text-ink-500">
            Bonificador de competencia: {character.proficiencyBonus} →{' '}
            {Math.ceil(newLevel / 4) + 1}
          </div>

          <button
            onClick={handleConfirm}
            className="w-full py-3 bg-crimson-600 hover:bg-crimson-700 text-white rounded-lg font-bold"
          >
            Confirmar nivel {newLevel}
          </button>
        </div>
      </div>
    </div>
  );
}
