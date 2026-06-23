import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { loadFromDB } from './lib/db'
import { usePlanStore } from './stores/planStore'

async function init() {
  try {
    const saved = await loadFromDB()
    usePlanStore.getState().importState(saved)
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
