import { useEffect, useState } from 'react'
import { decodeShareLink, clearShareHash } from '../../lib/shareLink'
import { usePlanStore } from '../../stores/planStore'
import type { AppState } from '../../types'

export function ShareImportBanner() {
  const [pending, setPending] = useState<AppState | null>(null)
  const importState = usePlanStore((s) => s.importState)

  useEffect(() => {
    const decoded = decodeShareLink(window.location.hash)
    if (decoded) {
      setPending(decoded)
      clearShareHash()
    }
  }, [])

  if (!pending) return null

  function accept() {
    importState(pending!)
    setPending(null)
  }

  function dismiss() {
    setPending(null)
  }

  const planName = pending.plan?.name ?? 'Shared plan'

  return (
    <div className="fixed inset-x-0 top-14 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md bg-white rounded-card shadow-card-hover border border-sage/30 p-4 flex gap-3 items-start">
        <div className="flex-shrink-0 mt-0.5">
          <div className="h-8 w-8 rounded-full bg-sage/15 flex items-center justify-center">
            <svg className="h-4 w-4 text-sage" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v8.25A2.25 2.25 0 005.25 18.75h8.25A2.25 2.25 0 0015.75 17V8.75M13.5 6l3-3m0 0l-3-3m3 3H8.25" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-olive">Someone shared a plan with you</p>
          <p className="text-xs text-olive/60 mt-0.5 truncate">"{planName}"</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={accept}
              className="rounded-card bg-sage px-3 py-1.5 text-xs font-medium text-white hover:bg-sage-dark transition-colors"
            >
              Import plan
            </button>
            <button
              onClick={dismiss}
              className="rounded-card bg-olive/10 px-3 py-1.5 text-xs font-medium text-olive hover:bg-olive/20 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
