import { NavLink, Outlet } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Swords,
  Scroll,
  Home,
  Shield,
  Crown,
  FileText,
  Save,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/characters', label: 'Personajes', icon: Users },
  { to: '/races', label: 'Razas', icon: Crown },
  { to: '/classes', label: 'Clases', icon: Shield },
  { to: '/spells', label: 'Conjuros', icon: BookOpen },
  { to: '/items', label: 'Objetos', icon: Scroll },
  { to: '/monsters', label: 'Monstruos', icon: Swords },
  { to: '/pdfs', label: 'PDFs', icon: FileText },
  { to: '/campaña', label: 'Campaña', icon: Save },
];

/** Primeros ítems en la barra inferior móvil (los más usados) */
const mobilePrimary = ['/', '/characters', '/spells', '/items', '/monsters'] as const;

export function Layout() {
  const primarySet = new Set<string>(mobilePrimary);
  const mobileNav = [
    ...navItems.filter((n) => primarySet.has(n.to)),
    // "Más" agrupado vía scroll en header secondary — añadimos clases y campaña al final del primary como overflow
    ...navItems.filter((n) => !primarySet.has(n.to)),
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Header */}
      <header className="bg-ink-950 text-parchment-50 border-b-4 border-crimson-700 sticky top-0 z-50 safe-pt">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-crimson-600 rounded-lg flex items-center justify-center font-display font-bold text-lg sm:text-xl shrink-0">
              D&amp;D
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-base sm:text-lg leading-tight truncate">
                Homebrew Vault
              </h1>
              <p className="text-[10px] sm:text-xs text-parchment-400 hidden xs:block sm:block">
                Tu compendio personal
              </p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-wrap justify-end">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-crimson-700 text-white'
                      : 'text-parchment-300 hover:bg-ink-800 hover:text-parchment-50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Tablet: scroll horizontal bajo el header */}
        <nav className="hidden sm:flex lg:hidden overflow-x-auto scroll-touch border-t border-ink-800 px-2 py-1.5 gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-crimson-700 text-white'
                    : 'text-parchment-400 hover:text-parchment-50'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 px-3 sm:px-4 py-4 sm:py-6 pb-24 sm:pb-6 max-w-6xl w-full mx-auto">
        <Outlet />
      </main>

      <footer className="hidden sm:block bg-ink-900 text-parchment-400 text-center text-xs py-3 border-t border-ink-800">
        Contenido gestionado vía GitHub · Datos locales en tu navegador · SRD / resúmenes 2024
      </footer>

      {/* Bottom nav — solo móvil */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-ink-950 border-t-2 border-crimson-700 safe-pb"
        aria-label="Navegación principal"
      >
        <div className="flex overflow-x-auto scroll-touch">
          {mobileNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 min-w-[4.25rem] px-2 pt-2 pb-1 text-[10px] font-medium ${
                  isActive ? 'text-crimson-400' : 'text-parchment-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`p-1.5 rounded-xl ${isActive ? 'bg-crimson-700/40 text-crimson-300' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="truncate max-w-[4rem]">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
