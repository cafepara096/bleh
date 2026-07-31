export const ALIGNMENTS: { id: string; name: string; description: string }[] = [
  {
    id: 'lg',
    name: 'Legal bueno',
    description:
      'Actúa con honor y compasión. Respeta la ley y la tradición cuando sirven al bien; protege a los inocentes.',
  },
  {
    id: 'ng',
    name: 'Neutral bueno',
    description:
      'Hace el bien sin atarse a códigos estrictos ni al caos. Ayuda a quien puede, priorizando el resultado justo.',
  },
  {
    id: 'cg',
    name: 'Caótico bueno',
    description:
      'Sigue su conciencia y la libertad por encima de la ley. Se opone a la tiranía y actúa según el corazón.',
  },
  {
    id: 'ln',
    name: 'Legal neutral',
    description:
      'Valora el orden, la tradición o un código personal por encima del bien o el mal absolutos.',
  },
  {
    id: 'n',
    name: 'Neutral',
    description:
      'Equilibrio o pragmatismo: evita extremos. Actúa según la situación más que por ideales fijos.',
  },
  {
    id: 'cn',
    name: 'Caótico neutral',
    description:
      'Libertad ante todo. Impredecible, evita que le digan qué hacer; no busca el mal ni el bien sistemático.',
  },
  {
    id: 'le',
    name: 'Legal maligno',
    description:
      'Usa la ley, jerarquías y planes para dominar u oprimir. El orden sirve a su ambición o crueldad.',
  },
  {
    id: 'ne',
    name: 'Neutral maligno',
    description:
      'Egoísta y dañino sin necesidad de caos ni de leyes. Hace lo que le beneficia, sin remordimientos.',
  },
  {
    id: 'ce',
    name: 'Caótico maligno',
    description:
      'Destrucción, odio o capricho violento. Rechaza reglas y disfruta del sufrimiento ajeno.',
  },
  {
    id: 'none',
    name: 'Sin alineamiento',
    description:
      'Sin postura moral definida (constructos, algunos seres o elección de roleplay). En 2024 es opcional.',
  },
];

export function getAlignmentInfo(name: string | undefined) {
  if (!name) return null;
  return ALIGNMENTS.find((a) => a.name === name) || null;
}
