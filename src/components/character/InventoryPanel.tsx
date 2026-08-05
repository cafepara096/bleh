import { useState } from 'react';
import type { Character, InventoryItem } from '../../types/dnd';
import { useItems } from '../../hooks/useItems';
import { resolveInventoryItem } from '../../utils/catalogResolve';
import { ItemPicker } from '../content/ItemPicker';
import { totalCurrencyInGP } from '../../utils/character';
import {
  Plus,
  Trash2,
  Package,
  BookOpen,
  Hand,
  ArrowDownToLine,
  ArrowUpToLine,
  Coins,
  ArrowLeftRight,
  Minus,
} from 'lucide-react';

interface Props {
  character: Character;
  onUpdate: (partial: Partial<Character>) => void;
}

type AddTarget = 'hand' | 'backpack';

const COIN_META: Record<
  keyof Character['currency'],
  { label: string; full: string; color: string; toCp: number }
> = {
  pp: { label: 'pp', full: 'Platino', color: 'bg-slate-200 text-slate-900 border-slate-400', toCp: 1000 },
  gp: { label: 'po', full: 'Oro', color: 'bg-amber-100 text-amber-900 border-amber-400', toCp: 100 },
  ep: { label: 'pe', full: 'Electrum', color: 'bg-cyan-100 text-cyan-900 border-cyan-400', toCp: 50 },
  sp: { label: 'sp', full: 'Plata', color: 'bg-gray-100 text-gray-800 border-gray-400', toCp: 10 },
  cp: { label: 'pc', full: 'Cobre', color: 'bg-orange-100 text-orange-900 border-orange-400', toCp: 1 },
};

const COIN_ORDER: (keyof Character['currency'])[] = ['pp', 'gp', 'ep', 'sp', 'cp'];

export function InventoryPanel({ character, onUpdate }: Props) {
  const { items } = useItems();
  const displayInventory = character.inventory.map((i) => resolveInventoryItem(i, items));
  const [showPicker, setShowPicker] = useState(false);
  const [addTarget, setAddTarget] = useState<AddTarget>('backpack');
  const [showManual, setShowManual] = useState(false);
  const [manualTarget, setManualTarget] = useState<AddTarget>('backpack');
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    description: '',
    damage: '',
    damageType: '',
    properties: '',
    proficient: true,
  });

  const [coinAmounts, setCoinAmounts] = useState<Record<string, string>>({
    pp: '',
    gp: '',
    ep: '',
    sp: '',
    cp: '',
  });
  const [convertFrom, setConvertFrom] = useState<keyof Character['currency']>('gp');
  const [convertTo, setConvertTo] = useState<keyof Character['currency']>('sp');
  const [convertAmount, setConvertAmount] = useState('');

  const inHand = displayInventory.filter((i) => i.equipped);
  const inBackpack = displayInventory.filter((i) => !i.equipped);

  const setInventory = (inventory: InventoryItem[]) => {
    onUpdate({ inventory });
  };

  const addFromCatalog = (item: InventoryItem) => {
    const equipped = addTarget === 'hand';
    setInventory([...character.inventory, { ...item, equipped }]);
  };

  const addManual = () => {
    if (!newItem.name.trim()) return;
    const props = newItem.properties
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const item: InventoryItem = {
      id: crypto.randomUUID(),
      name: newItem.name.trim(),
      quantity: newItem.quantity || 1,
      description: newItem.description || undefined,
      equipped: manualTarget === 'hand',
      damage: newItem.damage.trim() || undefined,
      damageType: newItem.damageType.trim() || undefined,
      properties: props.length ? props : undefined,
      proficient: newItem.proficient,
    };
    setInventory([...character.inventory, item]);
    setNewItem({
      name: '',
      quantity: 1,
      description: '',
      damage: '',
      damageType: '',
      properties: '',
      proficient: true,
    });
    setShowManual(false);
  };

  const removeItem = (id: string) => {
    setInventory(character.inventory.filter((i) => i.id !== id));
  };

  const moveToHand = (id: string) => {
    setInventory(
      character.inventory.map((i) => (i.id === id ? { ...i, equipped: true } : i))
    );
  };

  const toggleProf = (id: string) => {
    setInventory(
      character.inventory.map((i) =>
        i.id === id ? { ...i, proficient: !(i.proficient !== false) } : i
      )
    );
  };

  const moveToBackpack = (id: string) => {
    setInventory(
      character.inventory.map((i) => (i.id === id ? { ...i, equipped: false } : i))
    );
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) {
      removeItem(id);
      return;
    }
    setInventory(
      character.inventory.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  };

  const setCurrency = (currency: Character['currency']) => {
    onUpdate({ currency });
  };

  const adjustCoin = (coin: keyof Character['currency'], delta: number) => {
    const next = { ...character.currency };
    next[coin] = Math.max(0, (next[coin] || 0) + delta);
    setCurrency(next);
  };

  const applyCoinInput = (coin: keyof Character['currency'], mode: 'add' | 'sub') => {
    const raw = coinAmounts[coin];
    const n = parseInt(raw, 10);
    if (!n || n < 1) return;
    adjustCoin(coin, mode === 'add' ? n : -n);
    setCoinAmounts((prev) => ({ ...prev, [coin]: '' }));
  };

  const convertCoins = () => {
    const amount = parseInt(convertAmount, 10);
    if (!amount || amount < 1) return;
    if (convertFrom === convertTo) return;

    const fromRate = COIN_META[convertFrom].toCp;
    const toRate = COIN_META[convertTo].toCp;
    const have = character.currency[convertFrom] || 0;
    if (have < amount) {
      alert(`No tienes suficientes ${COIN_META[convertFrom].full.toLowerCase()}.`);
      return;
    }

    const totalCp = amount * fromRate;
    const received = Math.floor(totalCp / toRate);
    if (received < 1) {
      alert('La cantidad es demasiado pequeña para convertir a esa moneda.');
      return;
    }

    const next = { ...character.currency };
    next[convertFrom] = have - amount;
    next[convertTo] = (next[convertTo] || 0) + received;
    setCurrency(next);
    setConvertAmount('');
  };

  const optimizeUp = () => {
    let cp =
      (character.currency.pp || 0) * 1000 +
      (character.currency.gp || 0) * 100 +
      (character.currency.ep || 0) * 50 +
      (character.currency.sp || 0) * 10 +
      (character.currency.cp || 0);

    const pp = Math.floor(cp / 1000);
    cp %= 1000;
    const gp = Math.floor(cp / 100);
    cp %= 100;
    const sp = Math.floor(cp / 10);
    const copper = cp % 10;

    setCurrency({ pp, gp, ep: 0, sp, cp: copper });
  };

  const renderItemRow = (item: InventoryItem, section: 'hand' | 'backpack') => (
    <div
      key={item.id}
      className={`flex items-start gap-2 p-2 rounded border ${
        section === 'hand'
          ? 'bg-amber-50 border-amber-400'
          : 'bg-white border-ink-200'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium truncate">
            {item.name}
            {'nameEn' in item && (item as { nameEn?: string }).nameEn && (
              <span className="ml-1 text-[10px] font-normal text-ink-400">
                ({(item as { nameEn?: string }).nameEn})
              </span>
            )}
          </span>
          {item.damage && (
            <span className="text-xs bg-red-100 text-red-800 px-1 rounded">
              {item.damage} {item.damageType}
            </span>
          )}
          {item.damage && (
            <button
              type="button"
              onClick={() => toggleProf(item.id)}
              className={`text-[10px] px-1.5 rounded border ${
                item.proficient !== false
                  ? 'bg-green-100 border-green-400 text-green-900'
                  : 'bg-ink-100 border-ink-300 text-ink-600'
              }`}
              title="Alternar competencia con el arma"
            >
              {item.proficient !== false ? 'Comp. sí' : 'Comp. no'}
            </button>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-ink-600 mt-0.5 line-clamp-2">{item.description}</p>
        )}
        {item.properties && item.properties.length > 0 && (
          <p className="text-[10px] text-ink-500 mt-0.5">{item.properties.join(', ')}</p>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <input
          type="number"
          min={1}
          value={item.quantity}
          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
          className="w-12 px-1 py-0.5 border border-ink-300 rounded text-center text-sm"
          title="Cantidad"
        />
        {section === 'backpack' ? (
          <button
            onClick={() => moveToHand(item.id)}
            className="p-1 text-amber-700 hover:bg-amber-100 rounded"
            title="Pasar a la mano"
          >
            <ArrowUpToLine className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => moveToBackpack(item.id)}
            className="p-1 text-ink-600 hover:bg-ink-100 rounded"
            title="Guardar en la mochila"
          >
            <ArrowDownToLine className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => removeItem(item.id)}
          className="p-1 text-red-600 hover:bg-red-100 rounded"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const openCatalog = (target: AddTarget) => {
    setAddTarget(target);
    setShowPicker(true);
  };

  const openManual = (target: AddTarget) => {
    setManualTarget(target);
    setShowManual(true);
  };

  return (
    <div className="space-y-4">
      <div className="bg-parchment-100 border-2 border-ink-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-lg">Monedas</h3>
          </div>
          <div className="text-sm text-ink-600">
            Total ≈ <strong className="font-mono">{totalCurrencyInGP(character.currency).toFixed(2)}</strong> po
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-3">
          {COIN_ORDER.map((coin) => {
            const meta = COIN_META[coin];
            const disabled = (character.disabledCoins || []).includes(coin);
            return (
              <div
                key={coin}
                className={`rounded-lg border-2 p-2 ${meta.color} ${disabled ? 'opacity-45' : ''}`}
              >
                <div className="flex items-center justify-between mb-1 gap-1">
                  <span className="text-xs font-bold uppercase" title={meta.full}>
                    {meta.label}
                  </span>
                  <button
                    type="button"
                    title={disabled ? 'Mostrar moneda' : 'Ocultar moneda'}
                    onClick={() => {
                      const set = new Set(character.disabledCoins || []);
                      if (set.has(coin)) set.delete(coin);
                      else set.add(coin);
                      onUpdate({
                        disabledCoins: Array.from(set) as NonNullable<Character['disabledCoins']>,
                      });
                    }}
                    className="text-[9px] leading-none px-1 py-0.5 rounded border border-ink-400/60 bg-white/80 hover:bg-white"
                  >
                    {disabled ? 'on' : 'off'}
                  </button>
                </div>
                <div className="text-xl font-mono font-bold text-center mb-1.5">
                  {character.currency[coin] || 0}
                </div>
                <div className="flex gap-1">
                  <input
                    type="number"
                    min={1}
                    placeholder="±"
                    value={coinAmounts[coin]}
                    onChange={(e) =>
                      setCoinAmounts((prev) => ({ ...prev, [coin]: e.target.value }))
                    }
                    className="w-full min-w-0 px-1 py-0.5 border border-ink-300 rounded text-center text-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => applyCoinInput(coin, 'add')}
                    className="p-1 bg-green-600 text-white rounded hover:bg-green-500"
                    title="Sumar"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCoinInput(coin, 'sub')}
                    className="p-1 bg-red-600 text-white rounded hover:bg-red-500"
                    title="Restar"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-ink-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2 text-sm font-bold">
            <ArrowLeftRight className="w-4 h-4" />
            Convertir monedas
          </div>
          <div className="flex flex-wrap items-end gap-2 text-sm">
            <div>
              <label className="block text-[10px] uppercase text-ink-500 font-bold mb-0.5">
                Cantidad
              </label>
              <input
                type="number"
                min={1}
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                className="w-24 px-2 py-1.5 border-2 border-ink-300 rounded-lg"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-ink-500 font-bold mb-0.5">
                De
              </label>
              <select
                value={convertFrom}
                onChange={(e) =>
                  setConvertFrom(e.target.value as keyof Character['currency'])
                }
                className="px-2 py-1.5 border-2 border-ink-300 rounded-lg"
              >
                {COIN_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {COIN_META[c].full} ({COIN_META[c].label})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase text-ink-500 font-bold mb-0.5">
                A
              </label>
              <select
                value={convertTo}
                onChange={(e) =>
                  setConvertTo(e.target.value as keyof Character['currency'])
                }
                className="px-2 py-1.5 border-2 border-ink-300 rounded-lg"
              >
                {COIN_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {COIN_META[c].full} ({COIN_META[c].label})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={convertCoins}
              className="px-3 py-1.5 bg-ink-800 text-parchment-50 rounded-lg hover:bg-ink-700 font-medium"
            >
              Convertir
            </button>
            <button
              type="button"
              onClick={optimizeUp}
              className="px-3 py-1.5 bg-amber-100 border border-amber-400 rounded-lg hover:bg-amber-200 text-xs"
              title="Agrupa cobres/platas en monedas mayores"
            >
              Agrupar a monedas mayores
            </button>
          </div>
          <p className="text-[11px] text-ink-500 mt-2">
            Cambios: 1 pp (platino) = 10 po · 1 po = 2 pe = 10 sp = 100 pc · 1 pe = 5 sp · 1 sp = 10 pc
          </p>
        </div>
      </div>

      <div className="bg-parchment-100 border-2 border-ink-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5" />
          <h3 className="font-bold text-lg">Inventario</h3>
        </div>

        {showManual && (
          <div className="mb-4 p-3 bg-parchment-200 rounded border border-ink-300 space-y-2">
            <div className="text-xs font-bold text-ink-600">
              Añadir objeto manual →{' '}
              {manualTarget === 'hand' ? 'En mano' : 'Mochila'}
            </div>
            <input
              type="text"
              placeholder="Nombre del objeto"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full px-2 py-1 border border-ink-400 rounded text-sm"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })
                }
                className="w-20 px-2 py-1 border border-ink-400 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Descripción (opcional)"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="flex-1 px-2 py-1 border border-ink-400 rounded text-sm"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Daño (1d8)"
                value={newItem.damage}
                onChange={(e) => setNewItem({ ...newItem, damage: e.target.value })}
                className="px-2 py-1 border border-ink-400 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Tipo (cortante)"
                value={newItem.damageType}
                onChange={(e) => setNewItem({ ...newItem, damageType: e.target.value })}
                className="px-2 py-1 border border-ink-400 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Props (sutil, ligera)"
                value={newItem.properties}
                onChange={(e) => setNewItem({ ...newItem, properties: e.target.value })}
                className="px-2 py-1 border border-ink-400 rounded text-sm col-span-2"
              />
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={newItem.proficient}
                onChange={(e) => setNewItem({ ...newItem, proficient: e.target.checked })}
              />
              Competente con este arma (suma bonif. de competencia al ataque)
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={addManual}
                className="px-3 py-1 bg-green-700 text-white rounded text-sm hover:bg-green-600"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowManual(false)}
                className="px-3 py-1 bg-ink-300 rounded text-sm hover:bg-ink-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="border-2 border-amber-400 rounded-xl overflow-hidden bg-amber-50/40">
            <div className="px-3 py-2 bg-amber-100 border-b border-amber-300 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Hand className="w-4 h-4 text-amber-800" />
                <h4 className="font-bold text-sm uppercase tracking-wide text-amber-900">
                  En mano
                </h4>
                <span className="text-xs text-amber-800/70">({inHand.length})</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openCatalog('hand')}
                  className="flex items-center gap-1 px-2 py-1 bg-crimson-600 text-white rounded text-xs hover:bg-crimson-700"
                >
                  <BookOpen className="w-3 h-3" /> Catálogo
                </button>
                <button
                  onClick={() => openManual('hand')}
                  className="flex items-center gap-1 px-2 py-1 bg-ink-800 text-parchment-50 rounded text-xs hover:bg-ink-700"
                >
                  <Plus className="w-3 h-3" /> Manual
                </button>
              </div>
            </div>
            <div className="p-2 space-y-2 max-h-72 overflow-y-auto min-h-[80px]">
              {inHand.length === 0 && (
                <p className="text-ink-500 text-sm italic p-2">
                  Nada en mano. Equipa armas, escudos u objetos listos para usar.
                </p>
              )}
              {inHand.map((item) => renderItemRow(item, 'hand'))}
            </div>
          </section>

          <section className="border-2 border-ink-300 rounded-xl overflow-hidden bg-white/50">
            <div className="px-3 py-2 bg-ink-100 border-b border-ink-300 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-ink-700" />
                <h4 className="font-bold text-sm uppercase tracking-wide text-ink-800">
                  Mochila
                </h4>
                <span className="text-xs text-ink-500">({inBackpack.length})</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openCatalog('backpack')}
                  className="flex items-center gap-1 px-2 py-1 bg-crimson-600 text-white rounded text-xs hover:bg-crimson-700"
                >
                  <BookOpen className="w-3 h-3" /> Catálogo
                </button>
                <button
                  onClick={() => openManual('backpack')}
                  className="flex items-center gap-1 px-2 py-1 bg-ink-800 text-parchment-50 rounded text-xs hover:bg-ink-700"
                >
                  <Plus className="w-3 h-3" /> Manual
                </button>
              </div>
            </div>
            <div className="p-2 space-y-2 max-h-72 overflow-y-auto min-h-[80px]">
              {inBackpack.length === 0 && (
                <p className="text-ink-500 text-sm italic p-2">
                  Mochila vacía. Añade del catálogo o crea objetos homebrew.
                </p>
              )}
              {inBackpack.map((item) => renderItemRow(item, 'backpack'))}
            </div>
          </section>
        </div>

        <p className="text-[11px] text-ink-500 mt-3">
          Usa ↑ para pasar de la mochila a la mano y ↓ para guardar. Los objetos «en mano»
          aparecen en Combate / Acciones si tienen daño o están equipados.
        </p>
      </div>

      {showPicker && (
        <ItemPicker
          items={items}
          onSelect={addFromCatalog}
          onClose={() => setShowPicker(false)}
          addLabel={
            addTarget === 'hand' ? 'Añadir a la mano' : 'Añadir a la mochila'
          }
        />
      )}
    </div>
  );
}
