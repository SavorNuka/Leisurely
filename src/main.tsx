import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { loadFromDB } from './lib/db'
import { usePlanStore } from './stores/planStore'

async function init() {
  try {
    const saved = await loadFromDB()
    if (saved.plan) {
      usePlanStore.getState().importState(saved)
    } else if (saved.notes.length > 0) {
      usePlanStore.setState({ notes: saved.notes })
    }
  } catch (e) {
    console.warn('Failed to load from IndexedDB', e)
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

init()
