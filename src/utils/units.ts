/** Dual unit helpers: imperial (D&D default) + metric */

const LB_TO_KG = 0.45359237;
const FT_TO_M = 0.3048;

export function formatWeight(lbs: number | undefined | null): string {
  if (lbs === undefined || lbs === null) return '—';
  if (lbs === 0) return '0 lb / 0 kg';
  const kg = lbs * LB_TO_KG;
  const kgStr = kg < 1 ? kg.toFixed(2) : kg < 10 ? kg.toFixed(1) : Math.round(kg).toString();
  const lbStr = Number.isInteger(lbs) ? String(lbs) : lbs.toFixed(1);
  return `${lbStr} lb / ${kgStr} kg`;
}

export function formatDistanceFeet(feet: number | undefined | null): string {
  if (feet === undefined || feet === null) return '—';
  const m = feet * FT_TO_M;
  const mStr = m < 10 ? m.toFixed(1) : Math.round(m).toString();
  return `${feet} ft / ${mStr} m`;
}

/** Format speed like "30 ft / 9,1 m" */
export function formatSpeed(feet: number): string {
  return formatDistanceFeet(feet);
}

/**
 * Try to dual-format distances inside free text descriptions.
 * Replaces patterns like "20 feet", "30 pies", "60 ft" with dual units.
 */
export function dualizeDescription(text: string): string {
  if (!text) return text;

  // English feet
  let out = text.replace(
    /(\d+(?:[.,]\d+)?)\s*(?:feet|foot|ft\.?)\b/gi,
    (_, n) => {
      const feet = parseFloat(String(n).replace(',', '.'));
      const m = feet * FT_TO_M;
      const mStr = m < 10 ? m.toFixed(1).replace('.', ',') : String(Math.round(m));
      return `${feet} ft (${mStr} m)`;
    }
  );

  // Spanish pies
  out = out.replace(
    /(\d+(?:[.,]\d+)?)\s*pies?\b/gi,
    (_, n) => {
      const feet = parseFloat(String(n).replace(',', '.'));
      const m = feet * FT_TO_M;
      const mStr = m < 10 ? m.toFixed(1).replace('.', ',') : String(Math.round(m));
      return `${feet} pies (${mStr} m)`;
    }
  );

  // pounds / libras
  out = out.replace(
    /(\d+(?:[.,]\d+)?)\s*(?:pounds?|lbs?\.?)\b/gi,
    (_, n) => {
      const lbs = parseFloat(String(n).replace(',', '.'));
      const kg = lbs * LB_TO_KG;
      const kgStr = kg < 1 ? kg.toFixed(2) : kg < 10 ? kg.toFixed(1) : String(Math.round(kg));
      return `${lbs} lb (${kgStr} kg)`;
    }
  );

  out = out.replace(
    /(\d+(?:[.,]\d+)?)\s*libras?\b/gi,
    (_, n) => {
      const lbs = parseFloat(String(n).replace(',', '.'));
      const kg = lbs * LB_TO_KG;
      const kgStr = kg < 1 ? kg.toFixed(2) : kg < 10 ? kg.toFixed(1) : String(Math.round(kg));
      return `${lbs} libras (${kgStr} kg)`;
    }
  );

  return out;
}
