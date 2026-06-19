import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { PlannerPage } from './components/planner/PlannerPage'
import { GroceryPage } from './components/grocery/GroceryPage'
import { NotesPage } from './components/notes/NotesPage'
import { SettingsPage } from './components/settings/SettingsPage'

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/plan" replace />} />
          <Route path="/plan" element={<PlannerPage />} />
          <Route path="/grocery" element={<GroceryPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App
