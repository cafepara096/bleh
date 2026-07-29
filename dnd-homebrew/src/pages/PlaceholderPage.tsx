import { Construction } from 'lucide-react';

interface Props {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: Props) {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <Construction className="w-16 h-16 mx-auto text-ink-400 mb-4" />
      <h1 className="text-2xl font-display font-bold mb-2">{title}</h1>
      <p className="text-ink-600 mb-4">{description}</p>
      <p className="text-sm text-ink-500">
        Esta sección se completará en la siguiente fase. Las hojas de personaje
        ya están completamente funcionales.
      </p>
    </div>
  );
}
