import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { CharactersPage } from './pages/CharactersPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="characters" element={<CharactersPage />} />
        <Route
          path="spells"
          element={
            <PlaceholderPage
              title="Conjuros"
              description="Compendio de conjuros editable con soporte homebrew."
            />
          }
        />
        <Route
          path="monsters"
          element={
            <PlaceholderPage
              title="Monstruos"
              description="Bestiario completo con estadísticas y acciones editables."
            />
          }
        />
        <Route
          path="items"
          element={
            <PlaceholderPage
              title="Objetos"
              description="Armas, armaduras y objetos mágicos personalizables."
            />
          }
        />
      </Route>
    </Routes>
  )
}
