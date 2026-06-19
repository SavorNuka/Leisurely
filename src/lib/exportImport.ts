import type { AppState } from '../types'

export function serializeState(state: AppState): string {
  return JSON.stringify(state, null, 2)
}

export function parseState(json: string): AppState {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Invalid JSON file')
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('plan' in parsed) ||
    !('meals' in parsed) ||
    !('groceryList' in parsed)
  ) {
    throw new Error('Invalid Leisurely backup file: missing required keys')
  }

  const s = parsed as Record<string, unknown>

  if (s.meals !== null && typeof s.meals !== 'object') {
    throw new Error('Invalid backup: meals must be an object')
  }
  if (!Array.isArray(s.groceryList)) {
    throw new Error('Invalid backup: groceryList must be an array')
  }

  // notes is optional for backwards compatibility with Phase 1 exports
  if (!Array.isArray(s.notes)) {
    s.notes = []
  }

  return parsed as AppState
}

export function downloadJSON(state: AppState, filename = 'leisurely-backup.json') {
  const blob = new Blob([serializeState(state)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
