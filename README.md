# D&D Homebrew Vault

Sitio personal estilo D&D Beyond con **hojas de personaje interactivas**, contenido editable y gestión mediante repositorios de GitHub.

## Características actuales

### Hojas de personaje interactivas
- Puntuaciones de característica editables con modificadores automáticos
- Tracker de puntos de golpe (daño / curación / PG temporales)
- Tiradas de muerte interactivas
- Lista de habilidades con competencia y pericia
- Tiradas de salvación
- Inventario completo (añadir, equipar, cantidades)
- Rasgos y características (con soporte homebrew)
- Notas de personalidad, apariencia e historia
- Inspiración, CA, iniciativa, velocidad, percepción pasiva
- Botón de Descanso Largo
- Guardado automático en localStorage
- Exportar / importar personajes como JSON (ideal para GitHub)

### Próximamente
- Compendio de conjuros editable
- Bestiario de monstruos
- Objetos mágicos
- Constructor de personajes guiado
- Sincronización directa con repositorio GitHub

## Cómo empezar

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build para producción (GitHub Pages)
npm run build
```

El build genera la carpeta `dist/`. Puedes desplegarla en GitHub Pages activando la opción en Settings → Pages → Deploy from branch (carpeta `/docs` o `gh-pages`).

## Flujo con GitHub

1. Los personajes se guardan en el navegador.
2. Usa **Exportar** para descargar el JSON de un personaje (o de todos).
3. Sube esos archivos a un repositorio (por ejemplo `characters/kael.json`).
4. Para compartir con tu mesa: clona el repo o descarga los JSON e **Importa** en la web.

El contenido de reglas (conjuros, monstruos, objetos) vivirá en `/src/data/*.json` y se podrá editar tanto desde la interfaz como directamente en el repo.

## Estructura

```
src/
├── components/character/   → Componentes de la hoja de personaje
├── data/                   → JSON de ejemplo y futuros datos SRD
├── hooks/                  → useCharacters (persistencia)
├── pages/                  → Vistas
├── types/                  → Tipos TypeScript de D&D
└── utils/                  → Cálculos (modificadores, PG, etc.)
```

## Licencia de contenido

Compatible con el **System Reference Document 5.1** (OGL). El homebrew que crees es tuyo.
