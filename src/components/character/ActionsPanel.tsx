import type { Character } from '../../types/dnd';
import {
  getModifier,
  formatModifier,
  calculateSkillBonus,
  getSpellAttackBonus,
  getSpellSaveDC,
} from '../../utils/character';
import { useSpells } from '../../hooks/useSpells';
import { Swords, Zap, Shield, Sparkles } from 'lucide-react';

interface Props {
  character: Character;
  onUpdate?: (partial: Partial<Character>) => void;
}

type Bucket = 'action' | 'bonus' | 'reaction' | 'special' | 'passive';

const BUCKET_META: Record<
  Bucket,
  { title: string; color: string; hint: string }
> = {
  action: {
    title: 'Acciones',
    color: 'border-red-400 bg-red-50/50',
    hint: 'Una por turno (Atacar, Lanzar conjuro, Dash, Destrabarse, Esquivar, Ayudar, Esconderse, Buscar, Usar objeto…)',
  },
  bonus: {
    title: 'Acciones adicionales',
    color: 'border-amber-400 bg-amber-50/50',
    hint: 'Si una habilidad, conjuro o rasgo te lo permite (Furia, Segundo aliento, Acción astuta…)',
  },
  reaction: {
    title: 'Reacciones',
    color: 'border-sky-400 bg-sky-50/50',
    hint: 'Una entre tu turno y el siguiente (Ataque de oportunidad, Escudo, Contrahechizo…)',
  },
  special: {
    title: 'Especial / libre',
    color: 'border-purple-400 bg-purple-50/50',
    hint: 'Oleada de acción, usos de rasgos, movimiento, interacción con objetos…',
  },
  passive: {
    title: 'Pasivos',
    color: 'border-ink-300 bg-parchment-100',
    hint: 'Siempre activos: sentidos, resistencias, rasgos continuos',
  },
};

function inferActionType(name: string, description: string, explicit?: string): Bucket {
  if (explicit && explicit in BUCKET_META) return explicit as Bucket;
  const t = (name + ' ' + description).toLowerCase();
  if (/reacci[oó]n|oportunidad|cuando te|cuando eres|contrahechizo|escudo\b/.test(t))
    return 'reaction';
  if (/acci[oó]n adicional|bonus action|como acci[oó]n adicional/.test(t)) return 'bonus';
  if (/pasivo|siempre|permanentemente|no requiere acci[oó]n|ventaja en/.test(t) &&
      !/puedes usar|como acci[oó]n/.test(t))
    return 'passive';
  if (/oleada|segundo aliento|recuperar|usos|una vez por/.test(t)) return 'special';
  if (/como acci[oó]n|puedes usar tu acci[oó]n|ataque/.test(t)) return 'action';
  return 'passive';
}

export function ActionsPanel({ character, onUpdate }: Props) {
  const { spells: catalog } = useSpells();
  const strMod = getModifier(character.abilityScores.str);
  const dexMod = getModifier(character.abilityScores.dex);
  const prof = character.proficiencyBonus;
  const spellAttack = getSpellAttackBonus(character);
  const spellDC = getSpellSaveDC(character);

  const weapons = character.inventory.filter((i) => i.damage || i.equipped);

  const spendUse = (featureId: string) => {
    if (!onUpdate) return;
    const features = character.features.map((f) => {
      if (f.id !== featureId || !f.uses || f.uses.current <= 0) return f;
      return { ...f, uses: { ...f.uses, current: f.uses.current - 1 } };
    });
    onUpdate({ features });
  };

  const restoreUse = (featureId: string) => {
    if (!onUpdate) return;
    const features = character.features.map((f) => {
      if (f.id !== featureId || !f.uses || f.uses.current >= f.uses.max) return f;
      return { ...f, uses: { ...f.uses, current: f.uses.current + 1 } };
    });
    onUpdate({ features });
  };

  const restoreAllByRecovery = (recovery: 'short' | 'long') => {
    if (!onUpdate) return;
    const features = character.features.map((f) => {
      if (!f.uses) return f;
      if (recovery === 'long') {
        return { ...f, uses: { ...f.uses, current: f.uses.max } };
      }
      // short rest: only short
      if (f.uses.recovery === 'short') {
        return { ...f, uses: { ...f.uses, current: f.uses.max } };
      }
      return f;
    });
    // also restore short-rest spell slots? skip
    onUpdate({ features });
  };

  const buckets: Record<Bucket, { id: string; title: string; body: string; meta?: string; featureId?: string; uses?: Character['features'][0]['uses'] }[]> = {
    action: [],
    bonus: [],
    reaction: [],
    special: [],
    passive: [],
  };

  // Standard attacks
  for (const w of weapons) {
    const text = w.name + (w.description || '');
    const isRanged = /arco|ballesta|dardo|flecha|arrojadiza|jabalina/i.test(text);
    const isFinesse = /sutil|finesse|estoque|daga|cimitarra|espada corta/i.test(text);
    const mod = isRanged || isFinesse ? Math.max(strMod, dexMod) : strMod;
    const abilityLabel = isRanged ? 'Des' : isFinesse ? 'Fue/Des' : 'Fue';
    buckets.action.push({
      id: `atk-${w.id}`,
      title: w.name,
      body: `Ataque con arma${w.equipped ? ' (equipada)' : ''}`,
      meta: `Ataque ${formatModifier(mod + prof)} (${abilityLabel} ${formatModifier(mod)} + comp. ${formatModifier(prof)})${
        w.damage
          ? ` · Daño ${w.damage}${mod ? formatModifier(mod) : ''} ${w.damageType || ''}`
          : ''
      }`,
    });
  }

  // Unarmed
  buckets.action.push({
    id: 'unarmed',
    title: 'Ataque desarmado',
    body: 'Golpe cuerpo a cuerpo',
    meta: `Ataque ${formatModifier(strMod + prof)} · Daño 1${formatModifier(strMod)} contundente`,
  });

  // Generic actions (DDB style always available)
  for (const [title, body] of [
    ['Dash', 'Duplicas tu movimiento este turno'],
    ['Destrabarse (Disengage)', 'Tu movimiento no provoca ataques de oportunidad'],
    ['Esquivar (Dodge)', 'Ataques contra ti con desventaja; ventaja en salvaciones de Des'],
    ['Ayudar (Help)', 'Das ventaja a un aliado en una prueba o en el próximo ataque'],
    ['Esconderse (Hide)', 'Prueba de Sigilo para estar oculto'],
    ['Buscar / Usar objeto', 'Buscar algo o interactuar con un objeto'],
  ] as const) {
    buckets.action.push({ id: title, title, body, meta: 'Acción estándar' });
  }

  // Spells as actions (prepared / cantrips)
  const known = [
    ...character.cantripsKnown.map((id) => catalog.find((s) => s.id === id)),
    ...character.spells
      .filter((cs) => cs.prepared)
      .map((cs) => catalog.find((s) => s.id === cs.spellId)),
  ].filter(Boolean);

  for (const s of known) {
    if (!s) continue;
    const isBonus = /acci[oó]n adicional|bonus action/i.test(s.castingTime);
    const isReaction = /reacci[oó]n/i.test(s.castingTime);
    const bucket: Bucket = isReaction ? 'reaction' : isBonus ? 'bonus' : 'action';
    let meta = `${s.castingTime} · ${s.range}`;
    if (s.damage) {
      meta += ` · ${s.damage} ${s.damageType || ''}`;
      if (spellAttack !== null) meta += ` · Atq. ${formatModifier(spellAttack)}`;
    }
    if (spellDC !== null && !s.damage) meta += ` · CD ${spellDC}`;
    if (s.higherLevels) meta += ` · Escalable`;
    if (s.level > 0) meta += ` · Espacio niv. ${s.level}+`;
    buckets[bucket].push({
      id: `spell-${s.id}`,
      title: s.name,
      body: s.level === 0 ? 'Truco' : `Conjuro nivel ${s.level}${s.concentration ? ' · Concentración' : ''}`,
      meta,
    });
  }

  // Features
  for (const f of character.features) {
    const bucket = inferActionType(f.name, f.description, f.actionType);
    buckets[bucket].push({
      id: f.id,
      title: f.name,
      body: f.description,
      meta: f.source ? `Fuente: ${f.source}` : undefined,
      featureId: f.id,
      uses: f.uses,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => restoreAllByRecovery('short')}
          className="px-3 py-1.5 bg-ink-200 hover:bg-ink-300 rounded-lg font-medium"
        >
          Descanso corto (recuperar usos)
        </button>
        <button
          type="button"
          onClick={() => restoreAllByRecovery('long')}
          className="px-3 py-1.5 bg-green-100 border border-green-400 hover:bg-green-200 rounded-lg font-medium"
        >
          Descanso largo (todo)
        </button>
        <span className="text-ink-500 self-center">
          Iniciativa {formatModifier(dexMod)} · Percepción pasiva{' '}
          {10 + calculateSkillBonus(character, 'perception')} · CA {character.armorClass}
        </span>
      </div>

      {(['action', 'bonus', 'reaction', 'special', 'passive'] as Bucket[]).map((key) => {
        const items = buckets[key];
        if (items.length === 0) return null;
        const meta = BUCKET_META[key];
        return (
          <section key={key} className={`border-2 rounded-xl ${meta.color} overflow-hidden`}>
            <div className="px-3 py-2 border-b border-black/10 flex items-center gap-2">
              {key === 'action' && <Swords className="w-4 h-4" />}
              {key === 'bonus' && <Zap className="w-4 h-4" />}
              {key === 'reaction' && <Shield className="w-4 h-4" />}
              {(key === 'special' || key === 'passive') && <Sparkles className="w-4 h-4" />}
              <h3 className="font-bold text-sm uppercase tracking-wide">{meta.title}</h3>
              <span className="text-[10px] text-ink-500 flex-1">{meta.hint}</span>
            </div>
            <div className="divide-y divide-black/5">
              {items.map((item) => (
                <div key={item.id} className="px-3 py-2.5 bg-white/60 hover:bg-white/90">
                  <div className="flex flex-wrap items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{item.title}</div>
                      <p className="text-xs text-ink-600 mt-0.5 line-clamp-3">{item.body}</p>
                      {item.meta && (
                        <p className="text-[11px] text-ink-800 mt-1 font-mono bg-white/80 inline-block px-1.5 py-0.5 rounded border border-ink-100">
                          {item.meta}
                        </p>
                      )}
                    </div>
                    {item.uses && (
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="flex gap-0.5">
                          {Array.from({ length: item.uses.max }).map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              title={i < item.uses!.max - item.uses!.current ? 'Restaurar' : 'Gastar'}
                              onClick={() => {
                                const used = item.uses!.max - item.uses!.current;
                                if (i < used) restoreUse(item.featureId!);
                                else spendUse(item.featureId!);
                              }}
                              className={`w-4 h-4 rounded-full border-2 border-ink-700 ${
                                i < item.uses!.max - item.uses!.current
                                  ? 'bg-ink-700'
                                  : 'bg-white hover:bg-ink-100'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono">
                          {item.uses.current}/{item.uses.max}
                        </span>
                        <span className="text-[9px] text-ink-500 uppercase">
                          {item.uses.recovery === 'short'
                            ? 'Corto'
                            : item.uses.recovery === 'long'
                            ? 'Largo'
                            : item.uses.recovery}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
