import type { Character } from '../../types/dnd';
import { useClasses } from '../../hooks/useClasses';
import { Crown } from 'lucide-react';
import { WILD_MAGIC_SURGE } from '../../data/featureTables';
import { useState } from 'react';

interface Props {
  character: Character;
  onUpdate?: (partial: Partial<Character>) => void;
}

export function SubclassPanel({ character, onUpdate }: Props) {
  const { classes } = useClasses();
  const [showWildTable, setShowWildTable] = useState(true);
  const classData = classes.find(
    (c) => c.id === character.classId || c.name === character.class
  );
  const sub =
    classData?.subclasses?.find((s) => s.id === character.subclassId) ||
    classData?.subclasses?.find((s) => s.name === character.subclass);

  const subclassFeatures = character.features.filter(
    (f) => f.source === 'subclass' || f.source === 'homebrew-subclass'
  );

  // Upcoming features not yet on character
  const upcoming =
    sub?.features.filter(
      (f) =>
        f.level > character.level &&
        !character.features.some((cf) => cf.id === f.id)
    ) || [];

  const spend = (id: string) => {
    if (!onUpdate) return;
    onUpdate({
      features: character.features.map((f) =>
        f.id === id && f.uses && f.uses.current > 0
          ? { ...f, uses: { ...f.uses, current: f.uses.current - 1 } }
          : f
      ),
    });
  };
  const restore = (id: string) => {
    if (!onUpdate) return;
    onUpdate({
      features: character.features.map((f) =>
        f.id === id && f.uses && f.uses.current < f.uses.max
          ? { ...f, uses: { ...f.uses, current: f.uses.current + 1 } }
          : f
      ),
    });
  };

  if (!character.subclass && !sub) {
    return (
      <div className="bg-parchment-100 border-2 border-dashed border-ink-300 rounded-xl p-4 text-sm text-ink-500">
        Sin subclase. Se elige normalmente al nivel 3 (o la que indique tu clase/homebrew).
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-purple-50 border-2 border-purple-400 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Crown className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg text-purple-950">
              {character.subclass || sub?.name}
            </h3>
            <p className="text-xs text-purple-900/80 mt-0.5">
              {classData?.name} · Subclase
            </p>
            {sub?.description && (
              <p className="text-sm text-ink-700 mt-2">{sub.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-parchment-100 border-2 border-ink-800 rounded-xl p-3">
        <h4 className="font-bold text-sm mb-2">Rasgos de subclase obtenidos</h4>
        {subclassFeatures.length === 0 ? (
          <p className="text-sm text-ink-500 italic">
            Aún no hay rasgos de subclase en la hoja. Al subir de nivel se añadirán automáticamente.
          </p>
        ) : (
          <div className="space-y-2">
            {subclassFeatures.map((f) => (
              <div
                key={f.id}
                className="bg-white border border-ink-200 rounded-lg p-2.5 flex gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{f.name}</div>
                  <p className="text-xs text-ink-600 mt-0.5 whitespace-pre-wrap">
                    {f.description}
                  </p>
                  {f.actionType && (
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 rounded mt-1 inline-block">
                      {f.actionType}
                    </span>
                  )}
                </div>
                {f.uses && (
                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                    <div className="flex flex-wrap gap-0.5 max-w-[72px] justify-center">
                      {Array.from({ length: f.uses.max }).map((_, i) => {
                        const used = f.uses!.max - f.uses!.current;
                        const isUsed = i < used;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => (isUsed ? restore(f.id) : spend(f.id))}
                            className={`w-5 h-5 rounded border-2 text-[10px] font-bold ${
                              isUsed
                                ? 'bg-ink-800 border-ink-900 text-white'
                                : 'bg-white border-ink-600'
                            }`}
                          >
                            {isUsed ? '✓' : ''}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-[10px] font-mono">
                      {f.uses.current}/{f.uses.max}
                    </span>
                    <span className="text-[9px] text-ink-500 uppercase">
                      {f.uses.recovery}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>


      {(character.subclassId === 'wild-magic' ||
        (character.subclass || '').toLowerCase().includes('magia salvaje')) && (
        <div className="bg-pink-50 border-2 border-pink-400 rounded-xl p-3">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h4 className="font-bold text-sm text-pink-950">Tabla de oleada / sobrecarga de magia salvaje</h4>
            <button
              type="button"
              onClick={() => setShowWildTable((v) => !v)}
              className="text-[10px] underline text-pink-800"
            >
              {showWildTable ? 'Ocultar' : 'Mostrar'}
            </button>
            {onUpdate && (
              <button
                type="button"
                onClick={() => {
                  const entry = WILD_MAGIC_SURGE[Math.floor(Math.random() * WILD_MAGIC_SURGE.length)];
                  const text = `${entry.roll}: ${entry.effect}`;
                  const sp = character.sorceryPoints;
                  let gain = 0;
                  if (character.level >= 6 && sp) {
                    gain = 1 + Math.floor(Math.random() * 4);
                  }
                  onUpdate({
                    lastWildSurge: text,
                    ...(sp
                      ? {
                          sorceryPoints: {
                            max: sp.max,
                            current: Math.min(sp.max, sp.current + gain),
                          },
                        }
                      : {}),
                  });
                }}
                className="px-2 py-0.5 bg-pink-200 border border-pink-500 rounded text-[10px] font-bold"
              >
                Tirar oleada
              </button>
            )}
          </div>
          {character.lastWildSurge && (
            <p className="text-xs bg-white border border-pink-200 rounded px-2 py-1 mb-2">
              <strong>Última oleada:</strong> {character.lastWildSurge}
            </p>
          )}
          {showWildTable && (
            <div className="max-h-64 overflow-y-auto text-[10px] space-y-0.5 bg-white/80 border border-pink-100 rounded p-2">
              {WILD_MAGIC_SURGE.map((e) => (
                <div key={e.roll} className="flex gap-2 border-b border-pink-50 py-0.5">
                  <span className="font-mono shrink-0 w-12 text-pink-900">{e.roll}</span>
                  <span className="text-ink-700">{e.effect}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-pink-900/80 mt-2">
            <strong>Sobrecarga de caos (niv. 18):</strong> gasta 5 SP para forzar una oleada tras un conjuro.
            <strong> Doblegar suerte (niv. 6):</strong> reacción + 2 SP → ±1d4 a una tirada a 60 ft.
          </p>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="bg-ink-50 border border-ink-200 rounded-xl p-3">
          <h4 className="font-bold text-sm mb-2 text-ink-600">Próximos rasgos de subclase</h4>
          <ul className="space-y-1.5">
            {upcoming.map((f) => (
              <li key={f.id} className="text-xs text-ink-600">
                <strong className="text-ink-800">Niv. {f.level} — {f.name}:</strong>{' '}
                {f.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
