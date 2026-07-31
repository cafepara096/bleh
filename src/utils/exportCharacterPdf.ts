import type { Character } from '../types/dnd';
import { getModifier, formatModifier } from './character';

/** Abre una planilla genérica imprimible (Guardar como PDF del navegador). */
export function exportCharacterPdf(character: Character) {
  const scores = character.abilityScores;
  const ab = (k: keyof typeof scores) =>
    `${scores[k]} (${formatModifier(getModifier(scores[k]))})`;
  const slots = Object.entries(character.spellSlots || {})
    .map(([lv, s]) => `Niv.${lv}: ${s.max - s.used}/${s.max}`)
    .join(' · ');
  const features = (character.features || [])
    .map((f) => `<li><strong>${f.name}</strong> — ${f.description}</li>`)
    .join('');
  const inventory = (character.inventory || [])
    .map((i) => `<li>${i.quantity}× ${i.name}${i.equipped ? ' (equipado)' : ''}${i.damage ? ` [${i.damage}]` : ''}</li>`)
    .join('');
  const spells = (character.spells || [])
    .map((s) => `<li>${s.spellId}${s.prepared ? ' ★' : ''}${s.alwaysPrepared ? ' (siempre)' : ''}</li>`)
    .join('');
  const conditions = (character.conditions || []).join(', ') || '—';

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>${character.name} — hoja D&D</title>
<style>
  body{font-family:Georgia,serif;max-width:800px;margin:24px auto;color:#111;font-size:12px}
  h1{font-size:22px;margin:0} h2{font-size:14px;border-bottom:2px solid #333;margin:16px 0 8px}
  .grid{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}
  .box{border:1px solid #333;padding:6px;text-align:center}
  .row{display:flex;gap:12px;flex-wrap:wrap}
  ul{margin:4px 0;padding-left:18px}
  @media print{body{margin:0}}
</style></head><body>
<h1>${character.name || 'Sin nombre'}</h1>
<p><strong>${character.race}</strong> ${character.class} ${character.subclass ? '('+character.subclass+')' : ''} · Nivel ${character.level}
· Trasfondo: ${character.background || '—'} · Alineamiento: ${character.alignment || '—'}
· PB ${formatModifier(character.proficiencyBonus)}</p>
<div class="row">
  <div class="box">CA <strong>${character.armorClass}</strong></div>
  <div class="box">Ini ${formatModifier(getModifier(scores.dex))}</div>
  <div class="box">Vel ${character.speed} ft</div>
  <div class="box">PG ${character.hitPointCurrent}/${character.hitPointMax}</div>
  <div class="box">HD ${character.hitDice} (usados ${character.hitDiceUsed})</div>
</div>
<h2>Puntuaciones de característica</h2>
<div class="grid">
  <div class="box">FUE<br>${ab('str')}</div>
  <div class="box">DES<br>${ab('dex')}</div>
  <div class="box">CON<br>${ab('con')}</div>
  <div class="box">INT<br>${ab('int')}</div>
  <div class="box">SAB<br>${ab('wis')}</div>
  <div class="box">CAR<br>${ab('cha')}</div>
</div>
<p><strong>Estados:</strong> ${conditions}</p>
<h2>Espacios de conjuro</h2>
<p>${slots || '—'}</p>
${character.sorceryPoints ? `<p><strong>Puntos de hechicería:</strong> ${character.sorceryPoints.current}/${character.sorceryPoints.max}</p>` : ''}
<h2>Rasgos</h2><ul>${features || '<li>—</li>'}</ul>
<h2>Inventario</h2><ul>${inventory || '<li>—</li>'}</ul>
<h2>Conjuros (ids / preparados)</h2><ul>${spells || '<li>—</li>'}</ul>
<h2>Notas</h2>
<pre style="white-space:pre-wrap">${character.notes || ''}</pre>
<script>window.onload=()=>window.print()</script>
</body></html>`;

  const w = window.open('', '_blank');
  if (!w) {
    alert('Permite ventanas emergentes para exportar la hoja.');
    return;
  }
  w.document.write(html);
  w.document.close();
}
