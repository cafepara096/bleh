import { NavLink, Outlet } from 'react-router-dom';
import { Users, BookOpen, Swords, Scroll, Home, Shield, Crown, FileText, Save } from 'lucide-react';

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

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-ink-950 text-parchment-50 border-b-4 border-crimson-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-crimson-600 rounded-lg flex items-center justify-center font-display font-bold text-xl">
              D&D
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight">
                Homebrew Vault
              </h1>
              <p className="text-xs text-parchment-400">Tu compendio personal</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
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

        <nav className="lg:hidden flex overflow-x-auto border-t border-ink-800 px-2 py-1 gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
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

      <main className="flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="bg-ink-900 text-parchment-400 text-center text-xs py-3 border-t border-ink-800">
        Contenido gestionado vía GitHub · Datos locales en tu navegador · SRD / resúmenes 2024
      </footer>
    </div>
  );
}
