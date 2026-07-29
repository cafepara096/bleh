import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { CharactersPage } from './pages/CharactersPage'
import { ItemsPage } from './pages/ItemsPage'
import { SpellsPage } from './pages/SpellsPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="characters" element={<CharactersPage />} />
        <Route path="items" element={<ItemsPage />} />
        <Route path="spells" element={<SpellsPage />} />
        <Route
          path="monsters"
          element={
            <PlaceholderPage
              title="Monstruos"
              description="Bestiario completo con estadísticas y acciones editables."
            />
          }
        />
      </Route>
    </Routes>
  )
}
