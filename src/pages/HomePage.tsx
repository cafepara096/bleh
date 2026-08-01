import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Swords,
  Scroll,
  Github,
  Crown,
  Shield,
  FileText,
  Save,
} from 'lucide-react';

const sections = [
  {
    to: '/characters',
    icon: Users,
    title: 'Personajes',
    text:
      'Crea y gestiona hojas interactivas: características, PG, combate, inventario (mano/mochila), monedas, estados, conjuros, subclases 2024 y notas de campaña. Exporta JSON (con homebrew opcional) o planilla PDF.',
  },
  {
    to: '/races',
    icon: Crown,
    title: 'Razas',
    text:
      'Catálogo de razas del manual y homebrew. Define rasgos, aumentos de característica, tamaño, velocidad e idiomas. Las razas homebrew se pueden empaquetar al exportar un personaje.',
  },
  {
    to: '/classes',
    icon: Shield,
    title: 'Clases',
    text:
      'Clases y subclases alineadas al manual 2024: progresión de rasgos, espacios de conjuro, tablas (metamagia, maniobras, sobrecarga…), usos limitados y opciones al subir de nivel. Todo editable como homebrew.',
  },
  {
    to: '/spells',
    icon: BookOpen,
    title: 'Conjuros',
    text:
      'Lista de trucos y conjuros con nivel, escuela, tiempo de lanzamiento, alcance y efecto. Añade homebrew y vincúlalos a la hoja; los cambios del catálogo se reflejan en los personajes.',
  },
  {
    to: '/items',
    icon: Scroll,
    title: 'Objetos',
    text:
      'Armas, armaduras y objetos con daño, propiedades, rareza y coste. El inventario de la hoja puede enlazar al catálogo para mantener stats al día. Incluye packs de equipo inicial.',
  },
  {
    to: '/monsters',
    icon: Swords,
    title: 'Monstruos',
    text:
      'Bestiario con CA, PG, características, rasgos, acciones, reacciones, legendarias y variantes. Crea monstruos homebrew completos con el mismo nivel de detalle o clona una ficha base.',
  },
  {
    to: '/pdfs',
    icon: FileText,
    title: 'PDFs',
    text:
      'Biblioteca personal de manuales y notas en PDF (hasta 150 MB por archivo, IndexedDB). Índice, visor embebido, marcadores por página e import/export del vault completo.',
  },
  {
    to: '/campaña',
    icon: Save,
    title: 'Campaña',
    text:
      'Respaldo selectivo de toda la app: personajes, catálogos base o homebrew, monstruos, PDFs y tablas. Marca qué incluir e importa el JSON en otro dispositivo o navegador.',
  },
];

export function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-ink-900 mb-3 px-1">
          D&amp;D Homebrew Vault
        </h1>
        <p className="text-sm sm:text-lg text-ink-600 max-w-2xl mx-auto px-1">
          Compendio personal para D&amp;D (reglas 2024 / 5.5): hojas de personaje,
          catálogos editables, monstruos, PDFs y respaldo de campaña. Los datos viven
          en tu navegador; puedes exportarlos cuando quieras.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {sections.map(({ to, icon: Icon, title, text }) => (
          <Link
            key={to}
            to={to}
            className="group bg-parchment-100 border-2 border-ink-800 rounded-xl p-4 sm:p-6 hover:border-crimson-600 hover:shadow-lg transition-all active:scale-[0.99]"
          >
            <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-crimson-600 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-bold mb-1">{title}</h2>
            <p className="text-ink-600 text-sm leading-relaxed">{text}</p>
          </Link>
        ))}
      </div>

      <div className="bg-ink-900 text-parchment-100 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Github className="w-8 h-8 text-parchment-300 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg mb-1">Datos locales y GitHub</h3>
            <p className="text-parchment-300 text-sm leading-relaxed">
              Personajes, homebrew y PDFs se guardan en este navegador (localStorage /
              IndexedDB). Exporta un personaje con su raza/clase/objetos/conjuros
              homebrew para abrirlo en otro sitio sin errores de referencia. Usa la
              sección <strong className="text-parchment-100">Campaña</strong> para un
              respaldo completo, o versiona los JSON en un repositorio de GitHub para
              compartir con tu mesa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
