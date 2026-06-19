import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { PlannerPage } from './components/planner/PlannerPage'
import { GroceryPage } from './components/grocery/GroceryPage'
import { NotesPage } from './components/notes/NotesPage'
import { PackingPage } from './components/packing/PackingPage'
import { SettingsPage } from './components/settings/SettingsPage'
import { AuthPage } from './components/auth/AuthPage'
import { ShareImportBanner } from './components/ui/ShareImportBanner'

export function App() {
  return (
    <BrowserRouter>
      <ShareImportBanner />
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/plan" replace />} />
          <Route path="/plan" element={<PlannerPage />} />
          <Route path="/grocery" element={<GroceryPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/packing" element={<PackingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App
