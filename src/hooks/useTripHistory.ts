import { useState, useEffect, useCallback } from 'react'
import { listSnapshots, loadSnapshot, deleteSnapshot } from '../lib/db'
import { usePlanStore } from '../stores/planStore'
import { useAuth } from './useAuth'
import { deletePlan } from '../lib/sync'
import { toast } from './useToast'
import type { TripStub } from '../types'

export function useTripHistory() {
  const [stubs, setStubs] = useState<TripStub[]>([])
  const [loading, setLoading] = useState(false)
  const planId = usePlanStore((s) => s.plan?.id)
  const saveCurrentAndSwitch = usePlanStore((s) => s.saveCurrentAndSwitch)
  const snapshotCurrent = usePlanStore((s) => s.snapshotCurrent)
  const clearPlan = usePlanStore((s) => s.clearPlan)
  const { user } = useAuth()

  const reload = useCallback(async () => {
    const list = await listSnapshots()
    // Filter out the currently active plan from the saved list
    const activePlanId = usePlanStore.getState().plan?.id
    setStubs(list.filter((s) => s.planId !== activePlanId))
  }, [])

  useEffect(() => {
    reload()
  }, [reload, planId])

  async function switchTo(stub: TripStub) {
    setLoading(true)
    try {
      const targetState = await loadSnapshot(stub.planId)
      if (!targetState) return
      saveCurrentAndSwitch(targetState)
      // Remove the target from snapshots (it's now active)
      await deleteSnapshot(stub.planId)
      await reload()
    } finally {
      setLoading(false)
    }
  }

  async function archiveCurrent() {
    const planId = usePlanStore.getState().plan?.id
    try {
      await snapshotCurrent()
    } catch {
      toast('Could not archive trip — storage may be full', 'error')
      return
    }
    if (planId && user) await deletePlan(planId)
    clearPlan()
    await reload()
  }

  async function deleteTrip(tripPlanId: string) {
    await deleteSnapshot(tripPlanId)
    if (user) await deletePlan(tripPlanId)
    setStubs((prev) => prev.filter((s) => s.planId !== tripPlanId))
  }

  return { stubs, loading, switchTo, archiveCurrent, deleteTrip, reload }
}
