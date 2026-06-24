import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Capture the event as early as possible (before React mounts)
let _prompt: BeforeInstallPromptEvent | null = null
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    _prompt = e as BeforeInstallPromptEvent
  })
}

export function usePWAInstall() {
  const [canPrompt, setCanPrompt] = useState(!!_prompt)
  const [installed, setInstalled] = useState(false)

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const isIOS = /iPhone|iPad|iPod/.test(ua)
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone === true))

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      _prompt = e as BeforeInstallPromptEvent
      setCanPrompt(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => { _prompt = null; setCanPrompt(false); setInstalled(true) })
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function install() {
    if (!_prompt) return
    await _prompt.prompt()
    const { outcome } = await _prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    _prompt = null
    setCanPrompt(false)
  }

  return { canPrompt, install, isStandalone, isIOS, installed }
}
