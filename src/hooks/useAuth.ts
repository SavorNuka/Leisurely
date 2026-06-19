import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, isConfigured } from '../lib/supabase'
import { usePlanStore } from '../stores/planStore'
import { pullFromSupabase, pushPlan, pushNotes, pushPackingList, subscribeToRealtime } from '../lib/sync'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const importState = usePlanStore((s) => s.importState)

  const syncDown = useCallback(async (userId: string) => {
    setSyncing(true)
    try {
      const remote = await pullFromSupabase(userId)
      if (remote) importState(remote)
    } catch (e) {
      console.warn('Supabase sync failed', e)
    } finally {
      setSyncing(false)
    }
  }, [importState])

  useEffect(() => {
    if (!isConfigured() || !supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      setLoading(false)
      if (u) syncDown(u.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) syncDown(u.id)
    })

    return () => subscription.unsubscribe()
  }, [syncDown])

  // Real-time: re-pull on remote changes
  useEffect(() => {
    if (!user || !isConfigured()) return
    const plan = usePlanStore.getState().plan
    if (!plan) return

    const unsub = subscribeToRealtime(
      plan.id,
      user.id,
      () => syncDown(user.id),
      () => syncDown(user.id),
      () => syncDown(user.id),
      () => syncDown(user.id),
    )
    return unsub
  }, [user, syncDown])

  async function signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase not configured — add credentials to .env.local')
    const result = await supabase.auth.signInWithPassword({ email, password })
    if (result.error) throw result.error
    return result
  }

  async function signUp(email: string, password: string) {
    if (!supabase) throw new Error('Supabase not configured — add credentials to .env.local')
    const result = await supabase.auth.signUp({ email, password })
    if (result.error) throw result.error
    return result
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
  }

  async function pushNow() {
    if (!user) return
    const state = usePlanStore.getState().exportState()
    await pushPlan(state, user.id)
    await pushNotes(state.notes, user.id)
    if (state.plan) {
      await pushPackingList(state.packingList, state.plan.id, user.id)
    }
  }

  return { user, loading, syncing, isConfigured: isConfigured(), signIn, signUp, signOut, pushNow }
}
