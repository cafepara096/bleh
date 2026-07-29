import { useState, useCallback } from 'react';
import type { Character, AbilityScore, SkillId } from '../../types/dnd';
import { ABILITY_LABELS } from '../../types/dnd';
import {
  getModifier,
  formatModifier,
  calculateSavingThrow,
  calculateInitiative,
  calculatePassivePerception,
  applyDamage,
  heal,
} from '../../utils/character';
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
} from 'lucide-react';

interface Props {
  character: Character;
  onSave: (character: Character) => void;
  onBack: () => void;
  onExport: (character: Character) => void;
}

export function CharacterSheet({ character: initial, onSave, onBack, onExport }: Props) {
  const [character, setCharacter] = useState<Character>(initial);
  const [activeTab, setActiveTab] = useState<'main' | 'inventory' | 'features' | 'notes'>('main');
  const [dirty, setDirty] = useState(false);

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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-ink-900 text-parchment-50 rounded-t-xl p-4 flex flex-wrap items-center gap-4">
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
            className="text-2xl font-display font-bold bg-transparent border-b border-transparent hover:border-parchment-400 focus:border-parchment-300 focus:outline-none w-full"
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
            <input
              value={character.background}
              onChange={(e) => update({ background: e.target.value })}
              placeholder="Trasfondo"
              className="bg-transparent border-b border-transparent hover:border-parchment-500 focus:border-parchment-400 focus:outline-none w-28"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
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
      <div className="bg-parchment-100 border-x-2 border-ink-800 flex">
        {(['main', 'inventory', 'features', 'notes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-crimson-600 text-crimson-700 bg-parchment-50'
                : 'border-transparent text-ink-600 hover:text-ink-900'
            }`}
          >
            {tab === 'main' && 'Principal'}
            {tab === 'inventory' && 'Inventario'}
            {tab === 'features' && 'Rasgos'}
            {tab === 'notes' && 'Notas'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-parchment-50 border-2 border-t-0 border-ink-800 rounded-b-xl p-4">
        {activeTab === 'main' && (
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

              {/* Hit Dice */}
              <div className="bg-parchment-100 border-2 border-ink-800 rounded-lg p-3 shadow-sm flex items-center gap-4">
                <span className="font-bold text-sm">Dados de Golpe:</span>
                <input
                  type="text"
                  value={character.hitDice}
                  onChange={(e) => update({ hitDice: e.target.value })}
                  className="w-20 px-2 py-1 border border-ink-400 rounded text-center"
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
        )}

        {activeTab === 'inventory' && (
          <InventoryPanel
            character={character}
            onUpdate={(inventory) => update({ inventory })}
          />
        )}

        {activeTab === 'features' && (
          <FeaturesPanel
            character={character}
            onUpdate={(features) => update({ features })}
          />
        )}

        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
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
        )}
      </div>
    </div>
  );
}
