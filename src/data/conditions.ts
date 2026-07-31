/** Estados de D&D 2024 (resumen jugable) + soporte homebrew en la hoja */
export const DND_CONDITIONS: { id: string; name: string; description: string }[] = [
  { id: 'blinded', name: 'Cegado', description: 'No puedes ver. Fallas automáticamente pruebas que requieran vista. Ataques contra ti tienen ventaja; los tuyos tienen desventaja.' },
  { id: 'charmed', name: 'Hechizado', description: 'No puedes atacar al hechicero ni dirigirle efectos dañinos. El hechicero tiene ventaja en pruebas sociales contra ti.' },
  { id: 'deafened', name: 'Ensordecido', description: 'No puedes oír. Fallas automáticamente pruebas que requieran oído.' },
  { id: 'exhaustion', name: 'Agotamiento', description: 'Niveles 1–6 con penalizaciones crecientes (desventaja, velocidad, PG, muerte en 6).' },
  { id: 'frightened', name: 'Asustado', description: 'Desventaja en pruebas y ataques mientras la fuente esté a la vista. No puedes acercarte voluntariamente a la fuente.' },
  { id: 'grappled', name: 'Agarrado', description: 'Velocidad 0. Termina si el agarre se rompe o el agarre queda incapacitado.' },
  { id: 'incapacitated', name: 'Incapacitado', description: 'No puedes realizar acciones ni reacciones.' },
  { id: 'invisible', name: 'Invisible', description: 'No te ven sin magia/sentidos especiales. Ventaja en ataques; ataques contra ti con desventaja.' },
  { id: 'paralyzed', name: 'Paralizado', description: 'Incapacitado, no te mueves ni hablas. Fallas salvaciones de Fue y Des. Ataques contra ti con ventaja; críticos a 5 ft.' },
  { id: 'petrified', name: 'Petrificado', description: 'Transformado en sustancia inerte. Incapacitado, resistencia a todo daño, inmunidad a veneno/enfermedad.' },
  { id: 'poisoned', name: 'Envenenado', description: 'Desventaja en tiradas de ataque y pruebas de característica.' },
  { id: 'prone', name: 'Prono', description: 'Solo puedes arrastrarte o levantarte. Desventaja en ataques. Ataques cuerpo a cuerpo contra ti con ventaja; a distancia con desventaja.' },
  { id: 'restrained', name: 'Apresado', description: 'Velocidad 0. Desventaja en ataques y salvaciones de Des. Ataques contra ti con ventaja.' },
  { id: 'stunned', name: 'Aturdido', description: 'Incapacitado, no te mueves, hablas entrecortado. Fallas salvaciones de Fue y Des. Ataques contra ti con ventaja.' },
  { id: 'unconscious', name: 'Inconsciente', description: 'Incapacitado, sueltas lo que sostienes, caes prono. Fallas salvaciones de Fue/Des. Ataques con ventaja; críticos a 5 ft.' },
];
