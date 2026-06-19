import { usePlanStore } from '../stores/planStore'
import { generateDayPlans } from '../lib/dateUtils'
import type { Plan } from '../types'
import { format, addDays } from 'date-fns'

export function usePlan() {
  const store = usePlanStore()

  function createNewPlan(name: string) {
    const startDate = format(new Date(), 'yyyy-MM-dd')
    const endDate = format(addDays(new Date(), 6), 'yyyy-MM-dd')
    const plan: Plan = {
      id: crypto.randomUUID(),
      name,
      startDate,
      endDate,
      days: generateDayPlans(startDate, endDate),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    store.setPlan(plan)
  }

  return {
    plan: store.plan,
    createNewPlan,
    clearPlan: store.clearPlan,
    updateDateRange: store.updatePlanDateRange,
    updateName: store.updatePlanName,
    assignMeal: store.assignMealToSlot,
    clearSlot: store.clearSlot,
  }
}
