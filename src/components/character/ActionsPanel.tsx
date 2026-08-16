import type { Character } from '../../types/dnd';
import { ABILITY_LABELS } from '../../types/dnd';
import {
  getModifier,
  formatModifier,
  calculateSkillBonus,
  getSpellAttackBonus,
  getSpellSaveDC,
} from '../../utils/character';
import { useSpells } from '../../hooks/useSpells';
import { useItems } from '../../hooks/useItems';
import { resolveInventoryItem } from '../../utils/catalogResolve';
import { Swords, Zap, Shield, Sparkles, BookOpen, List } from 'lucide-react';

interface Props {
  character: Character;
  onUpdate?: (partial: Partial<Character>) => void;
  sections?: Array<'rest' | 'weapons' | 'spells' | 'features' | 'common'>;
}

type Bucket = 'bonus' | 'reaction' | 'special' | 'passive';

const BUCKET_META: Record<Bucket, { title: string; color: string; hint: string }> = {
  bonus: {
    title: 'Acciones adicionales',
    color: 'border-amber-400 bg-amber-50/50',
    hint: 'Si un rasgo o conjuro te lo permite (Furia, Segundo aliento, Acción astuta…)',
  },
  reaction: {
    title: 'Reacciones',
    color: 'border-sky-400 bg-sky-50/50',
    hint: 'Una entre tu turno y el siguiente (Ataque de oportunidad, Escudo…)',
  },
  special: {
    title: 'Especial / recursos',
    color: 'border-purple-400 bg-purple-50/50',
    hint: 'Oleada de acción, usos de rasgos limitados…',
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
  if (
    /pasivo|siempre|permanentemente|no requiere acci[oó]n|ventaja en/.test(t) &&
    !/puedes usar|como acci[oó]n/.test(t)
  )
    return 'passive';
  if (/oleada|segundo aliento|recuperar|usos|una vez por/.test(t)) return 'special';
  if (/como acci[oó]n|puedes usar tu acci[oó]n|ataque/.test(t)) return 'special';
  return 'passive';
}

/** Parse weapon style from name/description/properties */
function weaponAbility(
  name: string,
  description: string | undefined,
  properties: string[] | undefined,
  strMod: number,
  dexMod: number
): { mod: number; label: string; key: 'str' | 'dex' | 'str|dex' } {
  const text = [name, description || '', ...(properties || [])].join(' ').toLowerCase();
  const isRanged =
    /arco|ballesta|dardo|flecha|arrojadiza|jabalina|ranged|distancia/.test(text);
  const isFinesse =
    /sutil|finesse|estoque|daga|cimitarra|espada corta|rapier/.test(text);
  if (isRanged) return { mod: dexMod, label: 'Destreza', key: 'dex' };
  if (isFinesse) {
    if (strMod >= dexMod) return { mod: strMod, label: 'Fuerza', key: 'str|dex' };
    return { mod: dexMod, label: 'Destreza', key: 'str|dex' };
  }
  return { mod: strMod, label: 'Fuerza', key: 'str' };
}

export function ActionsPanel({ character, onUpdate, sections }: Props) {
  const show = (s: 'rest' | 'weapons' | 'spells' | 'features' | 'common') =>
    !sections || sections.includes(s);

  const { spells: catalog } = useSpells();
  const { items: itemCatalog } = useItems();
  const strMod = getModifier(character.abilityScores.str);
  const dexMod = getModifier(character.abilityScores.dex);
  const prof = character.proficiencyBonus;
  const spellAttack = getSpellAttackBonus(character);
  const spellDC = getSpellSaveDC(character);
  const spellAbility = character.spellcastingAbility;
  const spellAbilityLabel = spellAbility ? ABILITY_LABELS[spellAbility] : null;

  const resolvedInventory = character.inventory.map((i) => resolveInventoryItem(i, itemCatalog));
  const weapons = resolvedInventory.filter((i) => i.equipped && !!i.damage);

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
      if (f.uses.recovery === 'short' || f.uses.recovery === 'dawn') {
        return { ...f, uses: { ...f.uses, current: f.uses.max } };
      }
      return f;
    });
    // long rest also restores spell slots + sorcery points
    let spellSlots = character.spellSlots;
    let sorceryPoints = character.sorceryPoints;
    if (recovery === 'long') {
      spellSlots = Object.fromEntries(
        Object.entries(character.spellSlots).map(([k, v]) => [k, { ...v, used: 0 }])
      );
      if (character.sorceryPoints) {
        sorceryPoints = {
          ...character.sorceryPoints,
          current: character.sorceryPoints.max,
        };
      }
    }
    onUpdate({ features, spellSlots, sorceryPoints });
  };

  type FeatureItem = {
    id: string;
    title: string;
    body: string;
    meta?: string;
    featureId?: string;
    uses?: Character['features'][0]['uses'];
  };

  const buckets: Record<Bucket, FeatureItem[]> = {
    bonus: [],
    reaction: [],
    special: [],
    passive: [],
  };

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

  // Spells prepared / cantrips
  const knownSpells = [
    ...character.cantripsKnown.map((id) => catalog.find((s) => s.id === id)),
    ...character.spells
      .filter((cs) => cs.prepared)
      .map((cs) => catalog.find((s) => s.id === cs.spellId)),
  ].filter(Boolean);

  const standardActions = [
    ['Dash', 'Duplicas tu movimiento este turno'],
    ['Destrabarse (Disengage)', 'Tu movimiento no provoca ataques de oportunidad'],
    ['Esquivar (Dodge)', 'Ataques contra ti con desventaja; ventaja en salvaciones de Des'],
    ['Ayudar (Help)', 'Das ventaja a un aliado en una prueba o en el próximo ataque'],
    ['Esconderse (Hide)', 'Prueba de Sigilo para estar oculto'],
    ['Buscar / Usar objeto', 'Buscar algo o interactuar con un objeto'],
  ] as const;

  const renderUses = (
    uses: NonNullable<Character['features'][0]['uses']>,
    featureId: string
  ) => {
    const used = uses.max - uses.current;
    return (
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="flex flex-wrap gap-1 justify-center max-w-[88px]">
          {Array.from({ length: uses.max }).map((_, i) => {
            const isUsed = i < used;
            return (
              <button
                key={i}
                type="button"
                title={isUsed ? 'Marcar como disponible' : 'Marcar como usado'}
                onClick={() => (isUsed ? restoreUse(featureId) : spendUse(featureId))}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center text-[10px] font-bold transition-colors ${
                  isUsed
                    ? 'bg-ink-800 border-ink-900 text-white'
                    : 'bg-white border-ink-600 hover:bg-ink-100 text-transparent'
                }`}
              >
                {isUsed ? '✓' : ''}
              </button>
            );
          })}
        </div>
        <span className="text-[10px] font-mono font-bold">
          {uses.current}/{uses.max}
        </span>
        <span className="text-[9px] text-ink-500 uppercase tracking-wide">
          {uses.recovery === 'short'
            ? 'Desc. corto'
            : uses.recovery === 'long'
            ? 'Desc. largo'
            : uses.recovery === 'dawn'
            ? 'Amanecer'
            : uses.recovery}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {show('rest') && <div className="flex flex-wrap gap-2 text-xs items-center">
        <button
          type="button"
          onClick={() => restoreAllByRecovery('short')}
          className="px-3 py-1.5 bg-ink-200 hover:bg-ink-300 rounded-lg font-medium"
        >
          Descanso corto (usos cortos)
        </button>
        <button
          type="button"
          onClick={() => restoreAllByRecovery('long')}
          className="px-3 py-1.5 bg-green-100 border border-green-400 hover:bg-green-200 rounded-lg font-medium"
        >
          Descanso largo (todo + espacios)
        </button>
        <span className="text-ink-500 self-center">
          Iniciativa {formatModifier(dexMod)} · Percepción pasiva{' '}
          {10 + calculateSkillBonus(character, 'perception')} · CA {character.armorClass}
        </span>
      </div>}

      {/* ===== WEAPONS ===== */}
      {show('weapons') && <section className="border-2 border-red-400 rounded-xl bg-red-50/40 overflow-hidden">
        <div className="px-3 py-2 border-b border-red-200 flex items-center gap-2 bg-red-100/60">
          <Swords className="w-4 h-4 text-red-800" />
          <h3 className="font-bold text-sm uppercase tracking-wide text-red-900">
            Ataques con armas
          </h3>
          <span className="text-[10px] text-red-800/70 flex-1">
            En mano / equipadas · el modificador se calcula con tus puntuaciones
          </span>
        </div>
        <div className="divide-y divide-red-100">
          {weapons.length === 0 && (
            <p className="px-3 py-3 text-sm text-ink-500 italic">
              Sin armas con daño o equipadas. Equipa algo en Inventario → En mano.
            </p>
          )}
          {weapons.map((w) => {
            const ab = weaponAbility(w.name, w.description, w.properties, strMod, dexMod);
            const isProf = w.proficient !== false; // default proficient for weapons
            const atk = ab.mod + (isProf ? prof : 0);
            const dmgBonus = ab.mod;
            return (
              <div key={w.id} className="px-3 py-2.5 bg-white/70">
                <div className="font-semibold text-sm flex flex-wrap items-center gap-2">
                  {w.name}
                  {'nameEn' in w && (w as { nameEn?: string }).nameEn && (
                    <span className="text-[10px] font-normal text-ink-400">
                      ({(w as { nameEn?: string }).nameEn})
                    </span>
                  )}
                  {w.equipped && (
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 rounded">
                      En mano
                    </span>
                  )}
                  {!isProf && (
                    <span className="text-[10px] bg-ink-200 text-ink-700 px-1.5 rounded">
                      Sin competencia
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-2 text-xs">
                  <span className="font-mono bg-white border border-ink-200 px-2 py-0.5 rounded">
                    Ataque <strong>{formatModifier(atk)}</strong>
                    <span className="text-ink-500">
                      {' '}
                      = {ab.label} {formatModifier(ab.mod)}
                      {isProf
                        ? ` + comp. ${formatModifier(prof)}`
                        : ' (sin bonif. de competencia)'}
                    </span>
                  </span>
                  {w.damage && (
                    <span className="font-mono bg-red-50 border border-red-200 text-red-900 px-2 py-0.5 rounded">
                      Daño{' '}
                      <strong>
                        {w.damage}
                        {dmgBonus !== 0 ? formatModifier(dmgBonus) : ''}
                      </strong>
                      {w.damageType ? ` ${w.damageType}` : ''}
                      <span className="text-red-800/70">
                        {' '}
                        ← dado {w.damage}
                        {dmgBonus !== 0
                          ? ` + ${dmgBonus > 0 ? dmgBonus : dmgBonus} (${ab.label})`
                          : ` + 0 (${ab.label})`}
                      </span>
                    </span>
                  )}
                  {w.properties && w.properties.length > 0 && (
                    <span className="text-[10px] text-ink-500">
                      {w.properties.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {/* Unarmed */}
          <div className="px-3 py-2.5 bg-white/50">
            <div className="font-semibold text-sm">Ataque desarmado</div>
            <div className="mt-1.5 flex flex-wrap gap-2 text-xs">
              <span className="font-mono bg-white border border-ink-200 px-2 py-0.5 rounded">
                Ataque <strong>{formatModifier(strMod + prof)}</strong>
                <span className="text-ink-500">
                  {' '}
                  = Fuerza {formatModifier(strMod)} + comp. {formatModifier(prof)}
                </span>
              </span>
              <span className="font-mono bg-red-50 border border-red-200 text-red-900 px-2 py-0.5 rounded">
                Daño <strong>1{formatModifier(strMod)}</strong> contundente
                <span className="text-red-800/70">
                  {' '}
                  ← 1 + {Math.abs(strMod)} (Fuerza)
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>}

      {/* ===== SPELLS ===== */}
      {show('spells') && <section className="border-2 border-purple-400 rounded-xl bg-purple-50/40 overflow-hidden">
        <div className="px-3 py-2 border-b border-purple-200 flex items-center gap-2 bg-purple-100/60">
          <BookOpen className="w-4 h-4 text-purple-800" />
          <h3 className="font-bold text-sm uppercase tracking-wide text-purple-900">
            Conjuros
          </h3>
          <span className="text-[10px] text-purple-800/70 flex-1">
            Preparados y trucos
            {spellAttack !== null && spellAbilityLabel && (
              <>
                {' '}
                · Atq. {formatModifier(spellAttack)} ({spellAbilityLabel} + comp.) · CD{' '}
                {spellDC}
              </>
            )}
          </span>
        </div>
        <div className="divide-y divide-purple-100">
          {knownSpells.length === 0 && (
            <p className="px-3 py-3 text-sm text-ink-500 italic">
              Sin conjuros preparados ni trucos. Gestionálos en la pestaña Combate abajo.
            </p>
          )}
          {knownSpells.map((s) => {
            if (!s) return null;
            const isBonus = /acci[oó]n adicional|bonus action/i.test(s.castingTime);
            const isReaction = /reacci[oó]n/i.test(s.castingTime);
            let meta = `${s.castingTime} · ${s.range}`;
            if (s.damage) {
              meta += ` · ${s.damage}${s.damageType ? ' ' + s.damageType : ''}`;
              if (spellAttack !== null) {
                meta += ` · Atq. ${formatModifier(spellAttack)} (${spellAbilityLabel})`;
              }
            } else if (spellDC !== null) {
              meta += ` · CD ${spellDC} (${spellAbilityLabel})`;
            }
            if (s.higherLevels) meta += ' · Escalable';
            if (s.level > 0) meta += ` · Espacio niv. ${s.level}+`;
            return (
              <div key={s.id} className="px-3 py-2.5 bg-white/70">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm">
                    {s.name}
                    {s.nameEn && (
                      <span className="ml-1 text-[10px] font-normal text-ink-400">({s.nameEn})</span>
                    )}
                  </span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 rounded">
                    {s.level === 0 ? 'Truco' : `Niv. ${s.level}`}
                  </span>
                  {isBonus && (
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 rounded">
                      Acción adicional
                    </span>
                  )}
                  {isReaction && (
                    <span className="text-[10px] bg-sky-100 text-sky-900 px-1.5 rounded">
                      Reacción
                    </span>
                  )}
                  {s.concentration && (
                    <span className="text-[10px] bg-ink-100 px-1.5 rounded">Conc.</span>
                  )}
                </div>
                <p className="text-[11px] text-ink-800 mt-1 font-mono bg-white/80 inline-block px-1.5 py-0.5 rounded border border-ink-100">
                  {meta}
                </p>
              </div>
            );
          })}
        </div>
      </section>}

      {/* ===== FEATURE BUCKETS ===== */}
      {show('features') && (['bonus', 'reaction', 'special', 'passive'] as Bucket[]).map((key) => {
        const items = buckets[key];
        if (items.length === 0) return null;
        const meta = BUCKET_META[key];
        return (
          <section key={key} className={`border-2 rounded-xl ${meta.color} overflow-hidden`}>
            <div className="px-3 py-2 border-b border-black/10 flex items-center gap-2">
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
                        <p className="text-[11px] text-ink-500 mt-1">{item.meta}</p>
                      )}
                    </div>
                    {item.uses && item.featureId && renderUses(item.uses, item.featureId)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* ===== STANDARD ACTIONS (muted) ===== */}
      {show('common') && <section className="border border-ink-200 rounded-xl bg-ink-50/40 overflow-hidden opacity-90">
        <div className="px-3 py-1.5 border-b border-ink-200 flex items-center gap-2 bg-ink-100/50">
          <List className="w-3.5 h-3.5 text-ink-500" />
          <h3 className="font-semibold text-xs uppercase tracking-wide text-ink-600">
            Acciones comunes
          </h3>
          <span className="text-[10px] text-ink-400 flex-1">
            Siempre disponibles (menos prioritarias)
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0">
          {standardActions.map(([title, body]) => (
            <div
              key={title}
              className="px-3 py-1.5 text-xs border-ink-100 sm:border-b sm:odd:border-r"
            >
              <span className="font-medium text-ink-700">{title}</span>
              <span className="text-ink-500"> — {body}</span>
            </div>
          ))}
        </div>
      </section>}

    </div>
  );
}
