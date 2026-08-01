import { useMemo, useState } from 'react';
import { useMonsters } from '../hooks/useMonsters';
import type { Monster, AbilityScores } from '../types/dnd';
import { Search, Plus, Pencil, X } from 'lucide-react';

function mod(score: number) {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

const emptyScores = (): AbilityScores => ({
  str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
});

type NamedBlock = { name: string; description: string; damage?: string; damageType?: string; attackBonus?: number };

function emptyMonster(): Omit<Monster, 'id' | 'homebrew'> {
  return {
    name: '',
    nameEn: '',
    size: 'Mediano',
    type: 'monstruosidad',
    alignment: 'Sin alineamiento',
    armorClass: 12,
    hitPoints: '10 (3d8)',
    speed: '30 ft',
    abilityScores: emptyScores(),
    savingThrows: '',
    skills: '',
    senses: 'Percepción pasiva 10',
    languages: '—',
    challengeRating: '1/4',
    proficiencyBonus: 2,
    traits: [],
    actions: [],
    bonusActions: [],
    reactions: [],
    legendaryActions: [],
    variants: [],
    description: '',
  };
}

function blocksToText(blocks: NamedBlock[] | undefined): string {
  if (!blocks?.length) return '';
  return blocks
    .map((b) => {
      const meta = [
        b.attackBonus != null ? `ataque+${b.attackBonus}` : '',
        b.damage ? `daño:${b.damage}` : '',
        b.damageType ? `tipo:${b.damageType}` : '',
      ]
        .filter(Boolean)
        .join(' | ');
      return meta ? `${b.name} // ${meta}\n${b.description}` : `${b.name}\n${b.description}`;
    })
    .join('\n\n');
}

function textToBlocks(text: string, withAttack = false): NamedBlock[] {
  return text
    .split(/\n\n+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const lines = chunk.split('\n');
      const header = lines[0] || 'Sin nombre';
      const body = lines.slice(1).join('\n').trim();
      if (!withAttack) return { name: header, description: body };
      const parts = header.split('//').map((s) => s.trim());
      const name = parts[0] || 'Acción';
      let attackBonus: number | undefined;
      let damage: string | undefined;
      let damageType: string | undefined;
      if (parts[1]) {
        for (const bit of parts[1].split('|').map((s) => s.trim())) {
          if (bit.startsWith('ataque')) attackBonus = parseInt(bit.replace(/[^\d+-]/g, ''), 10) || undefined;
          if (bit.startsWith('daño:')) damage = bit.slice(5).trim();
          if (bit.startsWith('tipo:')) damageType = bit.slice(5).trim();
        }
      }
      return { name, description: body, attackBonus, damage, damageType };
    });
}

export function MonstersPage() {
  const { monsters, addHomebrew, updateHomebrew, deleteHomebrew } = useMonsters();
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Monster | null>(null);
  const [editing, setEditing] = useState<null | { mode: 'create' | 'edit'; data: Omit<Monster, 'id' | 'homebrew'>; id?: string }>(null);

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

  const openCreate = () => setEditing({ mode: 'create', data: emptyMonster() });
  const openEdit = (m: Monster) =>
    setEditing({
      mode: 'edit',
      id: m.id,
      data: {
        name: m.name,
        nameEn: m.nameEn || '',
        size: m.size,
        type: m.type,
        alignment: m.alignment || '',
        armorClass: m.armorClass,
        hitPoints: m.hitPoints,
        speed: m.speed,
        abilityScores: { ...m.abilityScores },
        savingThrows: m.savingThrows || m.saves || '',
        skills: m.skills || '',
        damageResistances: m.damageResistances || '',
        damageImmunities: m.damageImmunities || '',
        conditionImmunities: m.conditionImmunities || '',
        senses: m.senses || '',
        languages: m.languages || '',
        challengeRating: m.challengeRating || m.challenge || '1',
        proficiencyBonus: m.proficiencyBonus,
        traits: m.traits || [],
        actions: m.actions || [],
        bonusActions: m.bonusActions || [],
        reactions: m.reactions || [],
        legendaryActions: m.legendaryActions || [],
        variants: m.variants || [],
        description: m.description || '',
      },
    });

  const saveEditor = () => {
    if (!editing) return;
    const d = editing.data;
    if (!d.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    if (editing.mode === 'create') {
      const m = addHomebrew(d);
      setSelected(m);
    } else if (editing.id) {
      const m: Monster = { ...d, id: editing.id, homebrew: true };
      updateHomebrew(m);
      setSelected(m);
    }
    setEditing(null);
  };

  const setField = <K extends keyof Omit<Monster, 'id' | 'homebrew'>>(key: K, value: Omit<Monster, 'id' | 'homebrew'>[K]) => {
    if (!editing) return;
    setEditing({ ...editing, data: { ...editing.data, [key]: value } });
  };

  const setScore = (k: keyof AbilityScores, v: number) => {
    if (!editing) return;
    setEditing({
      ...editing,
      data: {
        ...editing.data,
        abilityScores: { ...editing.data.abilityScores, [k]: v },
      },
    });
  };

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
            onClick={openCreate}
            className="px-2 bg-crimson-600 text-white rounded-lg"
            title="Añadir monstruo homebrew completo"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-parchment-100 border-2 border-ink-800 rounded-xl max-h-[40vh] md:max-h-[70vh] overflow-y-auto divide-y divide-ink-200">
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
        {editing ? (
          <div className="bg-parchment-100 border-2 border-ink-800 rounded-xl p-3 sm:p-4 space-y-3 max-h-[70vh] md:max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-bold">
                {editing.mode === 'create' ? 'Nuevo monstruo homebrew' : 'Editar monstruo'}
              </h2>
              <button type="button" onClick={() => setEditing(null)} className="p-1 hover:bg-ink-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <label className="block">Nombre *
                <input className="w-full border border-ink-300 rounded px-2 py-1" value={editing.data.name}
                  onChange={(e) => setField('name', e.target.value)} />
              </label>
              <label className="block">Nombre EN
                <input className="w-full border border-ink-300 rounded px-2 py-1" value={editing.data.nameEn || ''}
                  onChange={(e) => setField('nameEn', e.target.value)} />
              </label>
              <label className="block">Tamaño
                <select className="w-full border border-ink-300 rounded px-2 py-1" value={editing.data.size}
                  onChange={(e) => setField('size', e.target.value)}>
                  {['Diminuto','Pequeño','Mediano','Grande','Enorme','Gargantuesco'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="block">Tipo
                <input className="w-full border border-ink-300 rounded px-2 py-1" value={editing.data.type}
                  onChange={(e) => setField('type', e.target.value)} placeholder="bestia, dragón…" />
              </label>
              <label className="block">Alineamiento
                <input className="w-full border border-ink-300 rounded px-2 py-1" value={editing.data.alignment || ''}
                  onChange={(e) => setField('alignment', e.target.value)} />
              </label>
              <label className="block">CR
                <input className="w-full border border-ink-300 rounded px-2 py-1" value={editing.data.challengeRating}
                  onChange={(e) => setField('challengeRating', e.target.value)} />
              </label>
              <label className="block">CA
                <input type="number" className="w-full border border-ink-300 rounded px-2 py-1" value={editing.data.armorClass}
                  onChange={(e) => setField('armorClass', parseInt(e.target.value) || 0)} />
              </label>
              <label className="block">PG
                <input className="w-full border border-ink-300 rounded px-2 py-1" value={editing.data.hitPoints}
                  onChange={(e) => setField('hitPoints', e.target.value)} placeholder="22 (5d8)" />
              </label>
              <label className="block sm:col-span-2">Velocidad
                <input className="w-full border border-ink-300 rounded px-2 py-1" value={editing.data.speed}
                  onChange={(e) => setField('speed', e.target.value)} placeholder="30 ft, volar 60 ft" />
              </label>
            </div>

            <div>
              <div className="text-xs font-bold mb-1">Puntuaciones</div>
              <div className="grid grid-cols-6 gap-1">
                {(['str','dex','con','int','wis','cha'] as const).map((k) => (
                  <label key={k} className="text-center text-[10px] uppercase">
                    {k}
                    <input
                      type="number"
                      min={1}
                      max={30}
                      className="w-full border border-ink-300 rounded px-1 py-1 text-sm text-center"
                      value={editing.data.abilityScores[k]}
                      onChange={(e) => setScore(k, parseInt(e.target.value) || 10)}
                    />
                    <span className="text-ink-500">{mod(editing.data.abilityScores[k])}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <label className="block">Salvaciones
                <input className="w-full border border-ink-300 rounded px-2 py-1" value={editing.data.savingThrows || ''}
                  onChange={(e) => setField('savingThrows', e.target.value)} />
              </label>
              <label className="block">Habilidades
                <input className="w-full border border-ink-300 rounded px-2 py-1" value={editing.data.skills || ''}
                  onChange={(e) => setField('skills', e.target.value)} />
              </label>
              <label className="block">Resistencias
                <input className="w-full border border-ink-300 rounded px-2 py-1" value={editing.data.damageResistances || ''}
                  onChange={(e) => setField('damageResistances', e.target.value)} />
              </label>
              <label className="block">Inmunidades daño
                <input className="w-full border border-ink-300 rounded px-2 py-1" value={editing.data.damageImmunities || ''}
                  onChange={(e) => setField('damageImmunities', e.target.value)} />
              </label>
              <label className="block">Inmunidades estado
                <input className="w-full border border-ink-300 rounded px-2 py-1" value={editing.data.conditionImmunities || ''}
                  onChange={(e) => setField('conditionImmunities', e.target.value)} />
              </label>
              <label className="block">PB
                <input type="number" className="w-full border border-ink-300 rounded px-2 py-1" value={editing.data.proficiencyBonus ?? 2}
                  onChange={(e) => setField('proficiencyBonus', parseInt(e.target.value) || 0)} />
              </label>
              <label className="block sm:col-span-2">Sentidos
                <input className="w-full border border-ink-300 rounded px-2 py-1" value={editing.data.senses || ''}
                  onChange={(e) => setField('senses', e.target.value)} />
              </label>
              <label className="block sm:col-span-2">Idiomas
                <input className="w-full border border-ink-300 rounded px-2 py-1" value={editing.data.languages || ''}
                  onChange={(e) => setField('languages', e.target.value)} />
              </label>
            </div>

            <label className="block text-sm">Descripción general
              <textarea className="w-full border border-ink-300 rounded px-2 py-1" rows={2}
                value={editing.data.description || ''}
                onChange={(e) => setField('description', e.target.value)} />
            </label>

            <p className="text-[11px] text-ink-500">
              Bloques: separa cada rasgo/acción con una línea en blanco. Primera línea = nombre.
              En acciones puedes usar: <code className="bg-white px-1 rounded">Mordisco // ataque+5 | daño:1d8+3 | tipo:perforante</code>
            </p>

            <label className="block text-sm">Rasgos
              <textarea className="w-full border border-ink-300 rounded px-2 py-1 font-mono text-xs" rows={3}
                value={blocksToText(editing.data.traits)}
                onChange={(e) => setField('traits', textToBlocks(e.target.value))} />
            </label>
            <label className="block text-sm">Acciones
              <textarea className="w-full border border-ink-300 rounded px-2 py-1 font-mono text-xs" rows={4}
                value={blocksToText(editing.data.actions)}
                onChange={(e) => setField('actions', textToBlocks(e.target.value, true))} />
            </label>
            <label className="block text-sm">Acciones adicionales
              <textarea className="w-full border border-ink-300 rounded px-2 py-1 font-mono text-xs" rows={2}
                value={blocksToText(editing.data.bonusActions)}
                onChange={(e) => setField('bonusActions', textToBlocks(e.target.value))} />
            </label>
            <label className="block text-sm">Reacciones
              <textarea className="w-full border border-ink-300 rounded px-2 py-1 font-mono text-xs" rows={2}
                value={blocksToText(editing.data.reactions)}
                onChange={(e) => setField('reactions', textToBlocks(e.target.value))} />
            </label>
            <label className="block text-sm">Acciones legendarias
              <textarea className="w-full border border-ink-300 rounded px-2 py-1 font-mono text-xs" rows={2}
                value={blocksToText(editing.data.legendaryActions)}
                onChange={(e) => setField('legendaryActions', textToBlocks(e.target.value))} />
            </label>
            <label className="block text-sm">Variantes
              <textarea className="w-full border border-ink-300 rounded px-2 py-1 font-mono text-xs" rows={2}
                value={blocksToText(editing.data.variants)}
                onChange={(e) => setField('variants', textToBlocks(e.target.value))} />
            </label>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={saveEditor} className="flex-1 py-2 bg-crimson-600 text-white rounded-lg font-medium">
                Guardar monstruo
              </button>
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 bg-ink-200 rounded-lg">
                Cancelar
              </button>
            </div>
          </div>
        ) : current ? (
          <div className="bg-parchment-100 border-2 border-ink-800 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-start gap-2">
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
              <div className="flex gap-2">
                {current.homebrew && (
                  <>
                    <button type="button" onClick={() => openEdit(current)} className="text-xs flex items-center gap-1 px-2 py-1 border border-ink-300 rounded bg-white">
                      <Pencil className="w-3 h-3" /> Editar
                    </button>
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
                  </>
                )}
                {!current.homebrew && (
                  <button
                    type="button"
                    onClick={() => {
                      const { id: _id, homebrew: _hb, ...rest } = current;
                      setEditing({ mode: 'create', data: { ...rest, name: `${current.name} (HB)` } });
                    }}
                    className="text-xs flex items-center gap-1 px-2 py-1 border border-ink-300 rounded bg-white"
                    title="Crear copia homebrew editable"
                  >
                    <Pencil className="w-3 h-3" /> Clonar HB
                  </button>
                )}
              </div>
            </div>
            {current.description && <p className="text-sm text-ink-700">{current.description}</p>}
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
              {current.damageResistances && <p><strong>Resistencias:</strong> {current.damageResistances}</p>}
              {current.damageImmunities && <p><strong>Inmunidades (daño):</strong> {current.damageImmunities}</p>}
              {current.conditionImmunities && <p><strong>Inmunidades (estado):</strong> {current.conditionImmunities}</p>}
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
            {current.bonusActions && current.bonusActions.length > 0 && (
              <div>
                <h3 className="font-bold text-sm mb-1">Acciones adicionales</h3>
                {current.bonusActions.map((a) => (
                  <p key={a.name} className="text-sm mb-1"><strong>{a.name}.</strong> {a.description}</p>
                ))}
              </div>
            )}
            {current.reactions && current.reactions.length > 0 && (
              <div>
                <h3 className="font-bold text-sm mb-1">Reacciones</h3>
                {current.reactions.map((a) => (
                  <p key={a.name} className="text-sm mb-1"><strong>{a.name}.</strong> {a.description}</p>
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
          <p className="text-ink-500 text-sm">Selecciona un monstruo o crea uno homebrew con el botón +.</p>
        )}
      </div>
    </div>
  );
}
