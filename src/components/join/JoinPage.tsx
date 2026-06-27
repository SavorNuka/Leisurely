import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { processInvite, pullFromSupabase } from '../../lib/sync'
import { useAuth } from '../../hooks/useAuth'
import { usePlanStore } from '../../stores/planStore'
import { AuthPage } from '../auth/AuthPage'

export function JoinPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const importState = usePlanStore((s) => s.importState)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !token || status !== 'idle') return
    setStatus('processing')
    processInvite(token, user.id).then(async ({ planId, error }) => {
      if (error) {
        setErrorMsg(error)
        setStatus('error')
        return
      }
      // Load the shared plan into the store immediately — don't wait for syncDown
      try {
        const remote = await pullFromSupabase(user.id, planId ?? undefined)
        if (remote) importState(remote)
      } catch {
        // Best-effort; the plan will load on next auth sync if this fails
      }
      setStatus('done')
      navigate('/plan', { replace: true })
    })
  }, [user, token, status, navigate, importState])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-olive/50">Loading…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-6 space-y-4">
        <div className="text-center">
          <p className="text-base font-serif font-semibold text-olive">You've been invited!</p>
          <p className="text-sm text-olive/60 mt-1">
            Sign in or create an account to accept this invite and join the trip.
          </p>
        </div>
        <AuthPage />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <p className="text-sm font-medium text-red-500">{errorMsg}</p>
        <button
          onClick={() => navigate('/plan')}
          className="text-xs text-sage underline underline-offset-2"
        >
          Go to your plan
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-16">
      <p className="text-sm text-olive/50">Joining trip…</p>
    </div>
  )
}
