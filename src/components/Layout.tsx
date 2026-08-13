import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
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
  ChevronDown,
  Library,
} from 'lucide-react';

const primaryNav = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/characters', label: 'Personajes', icon: Users },
  { to: '/spells', label: 'Conjuros', icon: BookOpen },
  { to: '/items', label: 'Objetos', icon: Scroll },
  { to: '/monsters', label: 'Monstruos', icon: Swords },
  { to: '/pdfs', label: 'PDFs', icon: FileText },
  { to: '/campaña', label: 'Campaña', icon: Save },
];

const rulesLinks = [
  { to: '/races', label: 'Razas', icon: Crown },
  { to: '/classes', label: 'Clases', icon: Shield },
  { to: '/backgrounds', label: 'Trasfondos / orígenes', icon: Scroll },
];

export function Layout() {
  const [rulesOpen, setRulesOpen] = useState(false);
  const [mobileRulesOpen, setMobileRulesOpen] = useState(false);
  const rulesRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const rulesActive = rulesLinks.some((r) => location.pathname.startsWith(r.to));

  useEffect(() => {
    setRulesOpen(false);
    setMobileRulesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rulesRef.current && !rulesRef.current.contains(e.target as Node)) {
        setRulesOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="bg-ink-950 text-parchment-100 border-b-2 border-crimson-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
          <NavLink to="/" className="font-display font-bold text-lg tracking-wide shrink-0">
            D&D <span className="text-crimson-400">Homebrew</span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-wrap justify-end">
            {primaryNav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-crimson-700 text-white'
                      : 'text-parchment-400 hover:text-parchment-50 hover:bg-ink-800'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}

            {/* Reglas dropdown */}
            <div className="relative" ref={rulesRef}>
              <button
                type="button"
                onClick={() => setRulesOpen((o) => !o)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium ${
                  rulesActive
                    ? 'bg-crimson-700 text-white'
                    : 'text-parchment-400 hover:text-parchment-50 hover:bg-ink-800'
                }`}
              >
                <Library className="w-4 h-4" />
                Reglas
                <ChevronDown className={`w-3.5 h-3.5 transition ${rulesOpen ? 'rotate-180' : ''}`} />
              </button>
              {rulesOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-ink-900 border-2 border-ink-700 rounded-xl shadow-xl py-1 z-50">
                  {rulesLinks.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 text-sm ${
                          isActive
                            ? 'bg-crimson-700/50 text-white'
                            : 'text-parchment-300 hover:bg-ink-800 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Tablet scroll nav */}
        <nav className="hidden sm:flex lg:hidden overflow-x-auto scroll-touch border-t border-ink-800 px-2 py-1.5 gap-1">
          {primaryNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
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
          {rulesLinks.map(({ to, label, icon: Icon }) => (
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

      <main className="flex-1 px-3 sm:px-4 py-4 sm:py-6 pb-28 sm:pb-6 max-w-6xl w-full mx-auto">
        <Outlet />
      </main>

      <footer className="hidden sm:block bg-ink-900 text-parchment-400 text-center text-xs py-3 border-t border-ink-800">
        Contenido gestionado vía GitHub · Datos locales en tu navegador · SRD / resúmenes 2024
      </footer>

      {/* Bottom nav — móvil */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-ink-950 border-t-2 border-crimson-700 safe-pb"
        aria-label="Navegación principal"
      >
        <div className="flex overflow-x-auto scroll-touch items-stretch">
          {primaryNav.slice(0, 5).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 min-w-[3.75rem] px-1.5 pt-2 pb-1 text-[10px] font-medium ${
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
                  <span className="truncate max-w-[3.5rem]">{label}</span>
                </>
              )}
            </NavLink>
          ))}
          {/* Reglas expandible en móvil */}
          <button
            type="button"
            onClick={() => setMobileRulesOpen((o) => !o)}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[3.75rem] px-1.5 pt-2 pb-1 text-[10px] font-medium ${
              rulesActive || mobileRulesOpen ? 'text-crimson-400' : 'text-parchment-400'
            }`}
          >
            <span
              className={`p-1.5 rounded-xl ${
                rulesActive || mobileRulesOpen ? 'bg-crimson-700/40 text-crimson-300' : ''
              }`}
            >
              <Library className="w-5 h-5" />
            </span>
            <span>Reglas</span>
          </button>
          {primaryNav.slice(5).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 min-w-[3.75rem] px-1.5 pt-2 pb-1 text-[10px] font-medium ${
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
                  <span className="truncate max-w-[3.5rem]">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
        {mobileRulesOpen && (
          <div className="border-t border-ink-700 bg-ink-900 px-2 py-2 flex flex-wrap gap-1">
            {rulesLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileRulesOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium ${
                    isActive
                      ? 'bg-crimson-700 text-white'
                      : 'bg-ink-800 text-parchment-300'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
}
