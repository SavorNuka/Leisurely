import type { AppState } from '../types'
import { parseState } from './exportImport'

export function encodeShareLink(state: AppState): string {
  const json = JSON.stringify(state)
  const b64 = btoa(unescape(encodeURIComponent(json)))
  const url = new URL(window.location.href)
  url.hash = `share=${b64}`
  return url.toString()
}

export function decodeShareLink(hash: string): AppState | null {
  const match = hash.match(/^#?share=(.+)$/)
  if (!match) return null
  try {
    const json = decodeURIComponent(escape(atob(match[1])))
    return parseState(json)
  } catch {
    return null
  }
}

export function clearShareHash() {
  history.replaceState(null, '', window.location.pathname + window.location.search)
}
