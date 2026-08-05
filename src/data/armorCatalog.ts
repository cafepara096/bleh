/** Stats de armaduras comunes para CA automática */
export type ArmorInfo = {
  name: string;
  armorClass: string;
  armorDexMod: 'none' | 'full' | 'max2' | 'max3';
  match: RegExp;
};

export const ARMOR_CATALOG: ArmorInfo[] = [
  { name: 'Acolchada', armorClass: '11', armorDexMod: 'full', match: /acolchada|padded/i },
  { name: 'Cuero', armorClass: '11', armorDexMod: 'full', match: /cuero(?!.*tachonado)|leather(?!.*stud)/i },
  { name: 'Cuero tachonado', armorClass: '12', armorDexMod: 'full', match: /tachonado|studded/i },
  { name: 'Pieles', armorClass: '12', armorDexMod: 'max2', match: /pieles|hide/i },
  { name: 'Camisote de mallas', armorClass: '13', armorDexMod: 'max2', match: /camisote|chain shirt/i },
  { name: 'Cota de escamas', armorClass: '14', armorDexMod: 'max2', match: /escamas|scale/i },
  { name: 'Coraza', armorClass: '14', armorDexMod: 'max2', match: /coraza|breastplate/i },
  { name: 'Semicota', armorClass: '15', armorDexMod: 'max2', match: /semicota|half plate/i },
  { name: 'Cota de anillas', armorClass: '14', armorDexMod: 'none', match: /anillas|ring mail/i },
  { name: 'Cota de mallas', armorClass: '16', armorDexMod: 'none', match: /cota de mallas|chain mail/i },
  { name: 'Férrea', armorClass: '17', armorDexMod: 'none', match: /f[eé]rrea|splint/i },
  { name: 'Placas', armorClass: '18', armorDexMod: 'none', match: /placas|plate/i },
  { name: 'Escudo', armorClass: '2', armorDexMod: 'none', match: /escudo|shield/i },
];

export function resolveArmorStats(
  name: string,
  description?: string
): { armorClass: string; armorDexMod: 'none' | 'full' | 'max2' | 'max3' } | null {
  const text = `${name} ${description || ''}`;
  for (const a of ARMOR_CATALOG) {
    if (a.match.test(name) || a.match.test(text)) {
      return { armorClass: a.armorClass, armorDexMod: a.armorDexMod };
    }
  }
  // Parse "CA 16" / "CA 11 + Des" from description
  const m = text.match(/CA\s*(\d+)\s*(\+\s*Des(?:\s*\(m[aá]x\.?\s*(\d+)\))?)?/i);
  if (m) {
    const base = m[1];
    if (!m[2]) return { armorClass: base, armorDexMod: 'none' };
    if (m[3] === '2') return { armorClass: base, armorDexMod: 'max2' };
    if (m[3] === '3') return { armorClass: base, armorDexMod: 'max3' };
    return { armorClass: base, armorDexMod: 'full' };
  }
  const plus = text.match(/\+?\s*(\d+)\s*CA/i);
  if (plus && /escudo/i.test(name)) return { armorClass: plus[1], armorDexMod: 'none' };
  return null;
}
