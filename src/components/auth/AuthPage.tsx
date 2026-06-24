import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

export function AuthPage() {
  const { signIn, signUp, isConfigured } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [showForgot, setShowForgot] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
        navigate('/plan')
      } else {
        await signUp(email, password, firstName.trim() || undefined)
        setSuccess('Account created! Check your email to confirm, then sign in.')
        setMode('signin')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault()
    if (!supabase || !resetEmail.trim()) return
    setLoading(true)
    setError(null)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail.trim())
      if (resetError) throw resetError
      setSuccess('Check your email for a password reset link.')
      setShowForgot(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-terracotta/15 flex items-center justify-center">
          <svg className="h-6 w-6 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="font-serif text-xl font-semibold text-olive">Supabase not connected</h2>
        <p className="text-sm text-olive/60 max-w-xs">
          Add your <code className="font-mono text-xs bg-olive/10 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and{' '}
          <code className="font-mono text-xs bg-olive/10 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> to{' '}
          <code className="font-mono text-xs bg-olive/10 px-1 py-0.5 rounded">.env.local</code> to enable cloud sync and real-time collaboration.
        </p>
        <p className="text-xs text-olive/40">The app works in local-only mode without credentials.</p>
        <Button variant="ghost" onClick={() => navigate(-1)}>← Go back</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-semibold text-olive">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-olive/60 mt-1">
            {mode === 'signin'
              ? 'Sign in to sync your plan across devices.'
              : 'Start syncing your plan to the cloud.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-card p-6 space-y-4">
          {mode === 'signup' && (
            <Input
              id="first-name"
              label="First name"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Sarah"
            />
          )}
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div>
            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => { setShowForgot(true); setError(null); setSuccess(null) }}
                className="mt-1 text-xs text-olive/50 hover:text-sage transition-colors underline-offset-2 hover:underline"
              >
                Forgot password?
              </button>
            )}
          </div>

          {showForgot && (
            <form onSubmit={handleResetPassword} className="rounded-card bg-cream/70 border border-olive/15 p-3 space-y-2">
              <p className="text-xs text-olive/70 font-medium">Reset your password</p>
              <Input
                id="reset-email"
                label="Your email"
                type="email"
                autoComplete="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <Button type="submit" variant="primary" size="sm" disabled={loading || !resetEmail.trim()}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForgot(false)}>Cancel</Button>
              </div>
            </form>
          )}

          {error && <p className="text-xs text-red-500 bg-red-50 rounded-card px-3 py-2">{error}</p>}
          {success && <p className="text-xs text-sage-dark bg-sage/10 rounded-card px-3 py-2">{success}</p>}

          <Button type="submit" variant="primary" disabled={loading} className="w-full justify-center">
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-olive/60">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setSuccess(null); setShowForgot(false) }}
            className="text-sage hover:text-sage-dark font-medium underline-offset-2 hover:underline"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
