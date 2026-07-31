import { useMemo, useState } from 'react';
import { useMonsters } from '../hooks/useMonsters';
import type { Monster } from '../types/dnd';
import { Search, Plus } from 'lucide-react';

function mod(score: number) {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

export function MonstersPage() {
  const { monsters, addHomebrew, deleteHomebrew } = useMonsters();
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Monster | null>(null);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return monsters.filter(
      (m) =>
        !s ||
        m.name.toLowerCase().includes(s) ||
        (m.nameEn && m.nameEn.toLowerCase().includes(s)) ||
        m.type.toLowerCase().includes(s) ||
        (m.challengeRating || m.challenge || '').includes(s)
    );
  }, [monsters, q]);

  const current = selected
    ? monsters.find((m) => m.id === selected.id) || selected
    : null;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-2 top-2.5 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar monstruo…"
              className="w-full pl-8 pr-2 py-2 border-2 border-ink-300 rounded-lg text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const name = prompt('Nombre del monstruo homebrew');
              if (!name) return;
              const m = addHomebrew({
                name,
                size: 'Mediano',
                type: 'monstruosidad',
                armorClass: 12,
                hitPoints: '10 (3d8)',
                speed: '30 ft',
                abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
                challengeRating: '1/4',
                senses: 'Percepción pasiva 10',
                languages: '—',
                actions: [],
              });
              setSelected(m);
            }}
            className="px-2 bg-crimson-600 text-white rounded-lg"
            title="Añadir homebrew"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-parchment-100 border-2 border-ink-800 rounded-xl max-h-[70vh] overflow-y-auto divide-y divide-ink-200">
          {filtered.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-parchment-200 ${
                current?.id === m.id ? 'bg-parchment-200 border-l-4 border-l-crimson-600' : ''
              }`}
            >
              <span className="font-medium">{m.name}</span>
              {m.nameEn && <span className="text-[10px] text-ink-400 ml-1">({m.nameEn})</span>}
              <span className="block text-[10px] text-ink-500">
                CR {m.challengeRating || m.challenge} · {m.type}
                {m.homebrew ? ' · HB' : ''}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-2">
        {current ? (
          <div className="bg-parchment-100 border-2 border-ink-800 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-display font-bold">
                  {current.name}
                  {current.nameEn && (
                    <span className="text-sm font-normal text-ink-400 ml-2">({current.nameEn})</span>
                  )}
                </h2>
                <p className="text-sm text-ink-600 italic">
                  {current.size} {current.type}, {current.alignment || '—'}
                </p>
              </div>
              {current.homebrew && (
                <button
                  type="button"
                  className="text-xs text-red-700"
                  onClick={() => {
                    if (confirm('¿Eliminar?')) {
                      deleteHomebrew(current.id);
                      setSelected(null);
                    }
                  }}
                >
                  Eliminar
                </button>
              )}
            </div>
            <div className="text-sm space-y-1">
              <p><strong>CA</strong> {current.armorClass} · <strong>PG</strong> {current.hitPoints} · <strong>Vel</strong> {current.speed}</p>
              <div className="grid grid-cols-6 gap-1 text-center text-xs font-mono">
                {(['str','dex','con','int','wis','cha'] as const).map((k) => {
                  const score = current.abilityScores?.[k] ?? 10;
                  return (
                  <div key={k} className="border border-ink-300 rounded p-1 bg-white">
                    <div className="uppercase text-[9px] text-ink-500">{k}</div>
                    <div>{score} ({mod(score)})</div>
                  </div>
                  );
                })}
              </div>
              {(current.savingThrows || current.saves) && <p><strong>Salvaciones:</strong> {current.savingThrows || current.saves}</p>}
              {current.skills && <p><strong>Habilidades:</strong> {current.skills}</p>}
              {current.senses && <p><strong>Sentidos:</strong> {current.senses}</p>}
              {current.languages && <p><strong>Idiomas:</strong> {current.languages}</p>}
              <p><strong>CR</strong> {current.challengeRating || current.challenge}{current.proficiencyBonus != null ? ` · PB +${current.proficiencyBonus}` : ''}</p>
            </div>
            {current.traits && current.traits.length > 0 && (
              <div>
                <h3 className="font-bold text-sm mb-1">Rasgos</h3>
                {current.traits.map((t) => (
                  <p key={t.name} className="text-sm mb-1"><strong>{t.name}.</strong> {t.description}</p>
                ))}
              </div>
            )}
            {current.actions && current.actions.length > 0 && (
              <div>
                <h3 className="font-bold text-sm mb-1">Acciones</h3>
                {current.actions.map((a) => (
                  <p key={a.name} className="text-sm mb-1">
                    <strong>{a.name}.</strong>{' '}
                    {a.attackBonus != null && `+${a.attackBonus} · `}
                    {a.damage && `${a.damage}${a.damageType ? ' ' + a.damageType : ''} · `}
                    {a.description}
                  </p>
                ))}
              </div>
            )}
            {current.legendaryActions && current.legendaryActions.length > 0 && (
              <div>
                <h3 className="font-bold text-sm mb-1">Acciones legendarias</h3>
                {current.legendaryActions.map((a) => (
                  <p key={a.name} className="text-sm mb-1"><strong>{a.name}.</strong> {a.description}</p>
                ))}
              </div>
            )}
            {current.variants && current.variants.length > 0 && (
              <div>
                <h3 className="font-bold text-sm mb-1">Variantes</h3>
                {current.variants.map((v) => (
                  <p key={v.name} className="text-sm mb-1"><strong>{v.name}.</strong> {v.description}</p>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-ink-500 text-sm">Selecciona un monstruo del bestiario.</p>
        )}
      </div>
    </div>
  );
}
