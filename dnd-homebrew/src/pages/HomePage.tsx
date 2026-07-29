import { Link } from 'react-router-dom';
import { Users, BookOpen, Swords, Scroll, Github } from 'lucide-react';

export function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-ink-900 mb-3">
          D&D Homebrew Vault
        </h1>
        <p className="text-lg text-ink-600 max-w-2xl mx-auto">
          Tu propio D&D Beyond personal. Hojas de personaje interactivas, contenido
          editable y homebrew versionado en GitHub.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <Link
          to="/characters"
          className="group bg-parchment-100 border-2 border-ink-800 rounded-xl p-6 hover:border-crimson-600 hover:shadow-lg transition-all"
        >
          <Users className="w-10 h-10 text-crimson-600 mb-3 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-bold mb-1">Hojas de Personaje</h2>
          <p className="text-ink-600 text-sm">
            Crea, edita y gestiona tus personajes con trackers de PG, habilidades,
            inventario y más. Todo interactivo.
          </p>
        </Link>

        <Link
          to="/spells"
          className="group bg-parchment-100 border-2 border-ink-800 rounded-xl p-6 hover:border-crimson-600 hover:shadow-lg transition-all"
        >
          <BookOpen className="w-10 h-10 text-crimson-600 mb-3 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-bold mb-1">Conjuros</h2>
          <p className="text-ink-600 text-sm">
            Consulta y edita conjuros. Añade tus propios hechizos homebrew con daño
            y descripciones personalizadas.
          </p>
        </Link>

        <Link
          to="/monsters"
          className="group bg-parchment-100 border-2 border-ink-800 rounded-xl p-6 hover:border-crimson-600 hover:shadow-lg transition-all"
        >
          <Swords className="w-10 h-10 text-crimson-600 mb-3 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-bold mb-1">Monstruos</h2>
          <p className="text-ink-600 text-sm">
            Bestiario editable. Modifica estadísticas, acciones y crea criaturas
            homebrew para tus campañas.
          </p>
        </Link>

        <Link
          to="/items"
          className="group bg-parchment-100 border-2 border-ink-800 rounded-xl p-6 hover:border-crimson-600 hover:shadow-lg transition-all"
        >
          <Scroll className="w-10 h-10 text-crimson-600 mb-3 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-bold mb-1">Objetos Mágicos</h2>
          <p className="text-ink-600 text-sm">
            Armas, armaduras y objetos maravillosos. Edita propiedades y añade tu
            propio botín homebrew.
          </p>
        </Link>
      </div>

      <div className="bg-ink-900 text-parchment-100 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Github className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg mb-1">Gestión con GitHub</h3>
            <p className="text-parchment-300 text-sm leading-relaxed">
              Los personajes se guardan en tu navegador (localStorage) y puedes
              exportarlos como JSON para versionarlos en un repositorio de GitHub.
              El contenido de conjuros, monstruos y objetos vive en archivos JSON
              del repo: edítalos directamente o desde la interfaz y haz commit.
              Ideal para campañas compartidas con tu mesa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
