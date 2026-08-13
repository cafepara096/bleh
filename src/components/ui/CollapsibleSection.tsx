import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  /** Extra classes on outer shell */
  className?: string;
  /** Classes on the colored header bar */
  headerClassName?: string;
  children: ReactNode;
  badge?: string | number;
}

export function CollapsibleSection({
  title,
  icon,
  defaultOpen = true,
  className = '',
  headerClassName = 'bg-parchment-100 border-ink-800',
  children,
  badge,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`border-2 rounded-xl overflow-hidden ${className || headerClassName}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left font-bold text-sm uppercase tracking-wide hover:brightness-95 transition ${headerClassName}`}
      >
        {open ? (
          <ChevronDown className="w-4 h-4 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 shrink-0" />
        )}
        {icon}
        <span className="flex-1">{title}</span>
        {badge !== undefined && badge !== '' && (
          <span className="text-[10px] font-mono normal-case px-1.5 py-0.5 rounded-full bg-white/70 border border-ink-300">
            {badge}
          </span>
        )}
      </button>
      {open && <div className="p-3 border-t border-ink-200/60 bg-white/40">{children}</div>}
    </section>
  );
}
