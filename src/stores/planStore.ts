import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Plan, Meal, GroceryItem, MealSlotKey, Note, AppState } from '../types'
import { mergeDayPlans } from '../lib/dateUtils'
import { aggregateIngredients } from '../lib/groceryAggregator'
import { savePlan, saveMeals, saveGroceryList, saveNotes, clearPlanFromDB } from '../lib/db'

interface PlanStore extends AppState {
  setPlan: (plan: Plan) => void
  clearPlan: () => void
  updatePlanDateRange: (startDate: string, endDate: string) => void
  updatePlanName: (name: string) => void
  togglePlanVisibility: () => void

  addMeal: (meal: Meal) => void
  updateMeal: (id: string, updates: Partial<Meal>) => void
  removeMeal: (id: string) => void

  assignMealToSlot: (date: string, slot: MealSlotKey, mealId: string) => void
  clearSlot: (date: string, slot: MealSlotKey) => void

  regenerateGroceryList: () => void
  toggleGroceryItem: (id: string) => void

  addNote: (text: string) => void
  removeNote: (id: string) => void

  importState: (state: AppState) => void
  exportState: () => AppState
}

export const usePlanStore = create<PlanStore>()(
  subscribeWithSelector((set, get) => ({
    plan: null,
    meals: {},
    groceryList: [],
    notes: [],

    setPlan(plan) {
      set({ plan })
    },

    clearPlan() {
      set({ plan: null, meals: {}, groceryList: [] })
      clearPlanFromDB()
    },

    updatePlanName(name) {
      const { plan } = get()
      if (!plan) return
      set({ plan: { ...plan, name, updatedAt: new Date().toISOString() } })
    },

    togglePlanVisibility() {
      const { plan } = get()
      if (!plan) return
      set({ plan: { ...plan, isPublic: !plan.isPublic, updatedAt: new Date().toISOString() } })
    },

    updatePlanDateRange(startDate, endDate) {
      const { plan, meals, groceryList } = get()
      if (!plan) return
      const mergedDays = mergeDayPlans(plan.days, startDate, endDate)
      const updated: Plan = {
        ...plan,
        startDate,
        endDate,
        days: mergedDays,
        updatedAt: new Date().toISOString(),
      }
      const newGroceryList = aggregateIngredients(meals, mergedDays, groceryList)
      set({ plan: updated, groceryList: newGroceryList })
    },

    addMeal(meal) {
      set((s) => ({ meals: { ...s.meals, [meal.id]: meal } }))
    },

    updateMeal(id, updates) {
      const { meals } = get()
      if (!meals[id]) return
      const updated = { ...meals[id], ...updates, updatedAt: new Date().toISOString() }
      set((s) => ({ meals: { ...s.meals, [id]: updated } }))
    },

    removeMeal(id) {
      const { meals, plan } = get()
      const newMeals = { ...meals }
      delete newMeals[id]

      const newDays = plan
        ? plan.days.map((day) => ({
            ...day,
            slots: Object.fromEntries(
              Object.entries(day.slots).map(([slot, cell]) => [
                slot,
                cell.mealId === id ? { mealId: null } : cell,
              ])
            ) as Plan['days'][0]['slots'],
          }))
        : plan

      const newPlan = plan && newDays ? { ...plan, days: newDays } : plan
      set({ meals: newMeals, plan: newPlan })
      get().regenerateGroceryList()
    },

    assignMealToSlot(date, slot, mealId) {
      const { plan } = get()
      if (!plan) return
      const days = plan.days.map((day) =>
        day.date === date
          ? { ...day, slots: { ...day.slots, [slot]: { mealId } } }
          : day
      )
      set({ plan: { ...plan, days, updatedAt: new Date().toISOString() } })
      get().regenerateGroceryList()
    },

    clearSlot(date, slot) {
      const { plan } = get()
      if (!plan) return
      const days = plan.days.map((day) =>
        day.date === date
          ? { ...day, slots: { ...day.slots, [slot]: { mealId: null } } }
          : day
      )
      set({ plan: { ...plan, days, updatedAt: new Date().toISOString() } })
      get().regenerateGroceryList()
    },

    regenerateGroceryList() {
      const { meals, plan, groceryList } = get()
      if (!plan) return
      const newList = aggregateIngredients(meals, plan.days, groceryList)
      set({ groceryList: newList })
    },

    toggleGroceryItem(id) {
      set((s) => ({
        groceryList: s.groceryList.map((item) =>
          item.id === id ? { ...item, checked: !item.checked } : item
        ),
      }))
    },

    addNote(text) {
      const note: Note = {
        id: crypto.randomUUID(),
        text: text.trim(),
        createdAt: new Date().toISOString(),
      }
      set((s) => ({ notes: [note, ...s.notes] }))
    },

    removeNote(id) {
      set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }))
    },

    importState(state) {
      set({
        plan: state.plan,
        meals: state.meals,
        groceryList: state.groceryList,
        notes: state.notes ?? [],
      })
    },

    exportState() {
      const { plan, meals, groceryList, notes } = get()
      return { plan, meals, groceryList, notes }
    },
  }))
)

function debounce<T extends unknown[]>(fn: (...args: T) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: T) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

const persistPlan = debounce((plan: Plan | null) => {
  if (plan) savePlan(plan)
  else clearPlanFromDB()
}, 500)

const persistMeals = debounce((meals: Record<string, Meal>) => {
  saveMeals(meals)
}, 500)

const persistGrocery = debounce((list: GroceryItem[]) => {
  saveGroceryList(list)
}, 500)

const persistNotes = debounce((notes: Note[]) => {
  saveNotes(notes)
}, 500)

usePlanStore.subscribe((s) => s.plan, persistPlan)
usePlanStore.subscribe((s) => s.meals, persistMeals)
usePlanStore.subscribe((s) => s.groceryList, persistGrocery)
usePlanStore.subscribe((s) => s.notes, persistNotes)
