import { getModifier, formatModifier } from '../../utils/character';
import type { AbilityScore } from '../../types/dnd';
import { ABILITY_LABELS } from '../../types/dnd';

interface Props {
  ability: AbilityScore;
  score: number;
  onChange?: (value: number) => void;
  editable?: boolean;
}

export function AbilityScoreBox({ ability, score, onChange, editable = false }: Props) {
  const mod = getModifier(score);

  return (
    <div className="flex flex-col items-center bg-parchment-100 border-2 border-ink-800 rounded-lg p-2 w-20 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-700">
        {ABILITY_LABELS[ability].slice(0, 3)}
      </div>
      {editable ? (
        <input
          type="number"
          min={1}
          max={30}
          value={score}
          onChange={(e) => onChange?.(parseInt(e.target.value) || 10)}
          className="w-12 text-center text-2xl font-bold bg-transparent border-b border-ink-400 focus:outline-none focus:border-crimson-600"
        />
      ) : (
        <div className="text-2xl font-bold">{score}</div>
      )}
      <div
        className={`mt-1 w-10 h-8 flex items-center justify-center rounded-full border-2 border-ink-800 text-sm font-bold ${
          mod >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        {formatModifier(mod)}
      </div>
    </div>
  );
}
