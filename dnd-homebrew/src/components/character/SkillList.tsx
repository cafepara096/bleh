import { SKILLS, type SkillId, type Character } from '../../types/dnd';
import { calculateSkillBonus, formatModifier } from '../../utils/character';

interface Props {
  character: Character;
  onToggleProficiency: (skillId: SkillId, field: 'proficient' | 'expertise') => void;
  editable?: boolean;
}

export function SkillList({ character, onToggleProficiency, editable = true }: Props) {
  return (
    <div className="bg-parchment-100 border-2 border-ink-800 rounded-lg p-3 shadow-sm">
      <h3 className="font-bold text-sm mb-2 border-b border-ink-300 pb-1">Habilidades</h3>
      <div className="space-y-0.5 max-h-80 overflow-y-auto">
        {SKILLS.map((skill) => {
          const bonus = calculateSkillBonus(character, skill.id);
          const prof = character.skills[skill.id];
          const isProficient = prof?.proficient ?? false;
          const hasExpertise = prof?.expertise ?? false;

          return (
            <div
              key={skill.id}
              className="flex items-center gap-2 text-sm hover:bg-parchment-200 rounded px-1 py-0.5"
            >
              {editable ? (
                <>
                  <button
                    onClick={() => onToggleProficiency(skill.id, 'proficient')}
                    className={`w-3.5 h-3.5 rounded-full border-2 border-ink-700 flex-shrink-0 ${
                      isProficient ? 'bg-ink-800' : 'bg-transparent'
                    }`}
                    title="Competencia"
                  />
                  <button
                    onClick={() => onToggleProficiency(skill.id, 'expertise')}
                    className={`w-3.5 h-3.5 rounded border border-ink-600 flex-shrink-0 text-[8px] font-bold ${
                      hasExpertise ? 'bg-amber-400 text-ink-900' : 'bg-transparent text-transparent'
                    }`}
                    title="Pericia"
                  >
                    E
                  </button>
                </>
              ) : (
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 border-ink-700 flex-shrink-0 ${
                    isProficient ? 'bg-ink-800' : 'bg-transparent'
                  }`}
                />
              )}
              <span className={`flex-1 ${isProficient ? 'font-semibold' : ''}`}>
                {skill.name}
                <span className="text-ink-500 text-xs ml-1">
                  ({skill.ability.toUpperCase()})
                </span>
              </span>
              <span
                className={`font-mono font-bold w-8 text-right ${
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
  );
}
