import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, isConfigured } from '../lib/supabase'
import { usePlanStore, localDirtyAt } from '../stores/planStore'
import { pullFromSupabase, pushPlan, pushNotes, pushPackingList, subscribeToRealtime } from '../lib/sync'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const importState = usePlanStore((s) => s.importState)
  const planId = usePlanStore((s) => s.plan?.id ?? null)

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single()
    if (data?.display_name) setDisplayName(data.display_name)
  }, [])

  const syncDown = useCallback(async (userId: string) => {
    setSyncing(true)
    try {
      const remote = await pullFromSupabase(userId)
      if (remote) {
        const dirtyAt = localDirtyAt
        const remoteUpdated = remote.plan?.updatedAt ?? null
        // Only import remote state when there are no uncommitted local changes
        // (localDirtyAt is null after every importState call), OR when the remote
        // plan is strictly newer than our last local mutation (a collaborator pushed
        // after we last edited). This prevents a navigating useAuth() mount from
        // wiping a freshly-added meal that hasn't been pushed to Supabase yet.
        if (!dirtyAt || (remoteUpdated && remoteUpdated > dirtyAt)) {
          importState(remote)
        }
      }
      await fetchProfile(userId)
    } catch (e) {
      console.warn('Supabase sync failed', e)
    } finally {
      setSyncing(false)
    }
  }, [importState, fetchProfile])

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
      if (!u) setDisplayName(null)
      if (u) syncDown(u.id)
    })

    return () => subscription.unsubscribe()
  }, [syncDown])

  // Real-time: re-pull on remote changes.
  // planId is a reactive Zustand selector so this effect re-runs once the plan
  // loads (which happens asynchronously after syncDown completes).
  useEffect(() => {
    if (!user || !isConfigured() || !planId) return

    const unsub = subscribeToRealtime(
      planId,
      user.id,
      () => syncDown(user.id),
      () => syncDown(user.id),
      () => syncDown(user.id),
      () => syncDown(user.id),
    )
    return unsub
  }, [user, syncDown, planId])

  async function signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase not configured — add credentials to .env.local')
    const result = await supabase.auth.signInWithPassword({ email, password })
    if (result.error) throw result.error
    return result
  }

  async function signUp(email: string, password: string, firstName?: string) {
    if (!supabase) throw new Error('Supabase not configured — add credentials to .env.local')
    const result = await supabase.auth.signUp({
      email,
      password,
      options: firstName ? { data: { first_name: firstName } } : undefined,
    })
    if (result.error) throw result.error
    if (result.data.user && firstName) {
      setDisplayName(firstName)
      await supabase.from('profiles').upsert({ id: result.data.user.id, display_name: firstName })
    }
    return result
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setDisplayName(null)
  }

  async function pushNow() {
    if (!user) return
    const state = usePlanStore.getState().exportState()
    await pushPlan(state, user.id)
    await pushNotes(state.notes, user.id, state.plan?.id, displayName ?? undefined)
    if (state.plan) {
      await pushPackingList(state.packingList, state.plan.id, user.id)
    }
  }

  return { user, displayName, loading, syncing, isConfigured: isConfigured(), signIn, signUp, signOut, pushNow }
}
