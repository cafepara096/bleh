import { Heart, Shield, Plus, Minus } from 'lucide-react';

interface Props {
  current: number;
  max: number;
  temp: number;
  onHeal: (amount: number) => void;
  onDamage: (amount: number) => void;
  onSetCurrent: (value: number) => void;
  onSetTemp: (value: number) => void;
  editable?: boolean;
}

export function HitPointsTracker({
  current,
  max,
  temp,
  onHeal,
  onDamage,
  onSetCurrent,
  onSetTemp,
  editable = true,
}: Props) {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  const isBloodied = current <= max / 2;
  const isDying = current === 0;

  return (
    <div className="bg-parchment-100 border-2 border-ink-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Heart className={`w-5 h-5 ${isDying ? 'text-red-600' : isBloodied ? 'text-orange-600' : 'text-crimson-600'}`} />
        <h3 className="font-bold text-lg">Puntos de Golpe</h3>
      </div>

      {/* Bar */}
      <div className="relative h-6 bg-ink-200 rounded-full overflow-hidden mb-3 border border-ink-400">
        <div
          className={`absolute inset-y-0 left-0 transition-all duration-300 ${
            isDying ? 'bg-red-700' : isBloodied ? 'bg-orange-500' : 'bg-crimson-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
        {temp > 0 && (
          <div
            className="absolute inset-y-0 bg-blue-400/60"
            style={{ left: `${percentage}%`, width: `${Math.min(100 - percentage, (temp / max) * 100)}%` }}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
          {current} / {max}
          {temp > 0 && ` (+${temp} temp)`}
        </div>
      </div>

      {editable && (
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => onDamage(1)}
            className="flex items-center gap-1 px-2 py-1 bg-red-100 hover:bg-red-200 border border-red-400 rounded text-sm font-medium"
          >
            <Minus className="w-3 h-3" /> 1
          </button>
          <button
            onClick={() => onDamage(5)}
            className="flex items-center gap-1 px-2 py-1 bg-red-100 hover:bg-red-200 border border-red-400 rounded text-sm font-medium"
          >
            <Minus className="w-3 h-3" /> 5
          </button>
          <button
            onClick={() => onHeal(1)}
            className="flex items-center gap-1 px-2 py-1 bg-green-100 hover:bg-green-200 border border-green-400 rounded text-sm font-medium"
          >
            <Plus className="w-3 h-3" /> 1
          </button>
          <button
            onClick={() => onHeal(5)}
            className="flex items-center gap-1 px-2 py-1 bg-green-100 hover:bg-green-200 border border-green-400 rounded text-sm font-medium"
          >
            <Plus className="w-3 h-3" /> 5
          </button>

          <div className="flex items-center gap-1 ml-auto">
            <label className="text-xs text-ink-600">Actual:</label>
            <input
              type="number"
              value={current}
              onChange={(e) => onSetCurrent(parseInt(e.target.value) || 0)}
              className="w-14 px-1 py-0.5 border border-ink-400 rounded text-center text-sm"
            />
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-blue-600" />
            <input
              type="number"
              value={temp}
              onChange={(e) => onSetTemp(parseInt(e.target.value) || 0)}
              className="w-12 px-1 py-0.5 border border-blue-400 rounded text-center text-sm"
              title="PG temporales"
            />
          </div>
        </div>
      )}
    </div>
  );
}
