import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { CharactersPage } from './pages/CharactersPage'
import { ItemsPage } from './pages/ItemsPage'
import { SpellsPage } from './pages/SpellsPage'
import { RacesPage } from './pages/RacesPage'
import { ClassesPage } from './pages/ClassesPage'
import { MonstersPage } from './pages/MonstersPage'
import { PdfVaultPage } from './pages/PdfVaultPage'
import { CampaignBackupPage } from './pages/CampaignBackupPage'
import { BackgroundsPage } from './pages/BackgroundsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="characters" element={<CharactersPage />} />
        <Route path="items" element={<ItemsPage />} />
        <Route path="spells" element={<SpellsPage />} />
        <Route path="races" element={<RacesPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="backgrounds" element={<BackgroundsPage />} />
        <Route path="trasfondos" element={<BackgroundsPage />} />
        <Route path="monsters" element={<MonstersPage />} />
        <Route path="pdfs" element={<PdfVaultPage />} />
        <Route path="campaña" element={<CampaignBackupPage />} />
        <Route path="campaign" element={<CampaignBackupPage />} />
      </Route>
    </Routes>
  )
}
