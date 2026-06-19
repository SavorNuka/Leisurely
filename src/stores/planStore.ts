import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Plan, Meal, GroceryItem, MealSlotKey, Note, NoteReply, PackingItem, PackingCategory, DietaryTag, AppState } from '../types'
import { mergeDayPlans } from '../lib/dateUtils'
import { aggregateIngredients } from '../lib/groceryAggregator'
import { savePlan, saveMeals, saveGroceryList, saveNotes, savePackingList, clearPlanFromDB } from '../lib/db'

interface PlanStore extends AppState {
  // Diet filter (client-only, not persisted)
  activeDietaryFilters: DietaryTag[]
  toggleDietaryFilter: (tag: DietaryTag) => void
  clearDietaryFilters: () => void

  // Plan actions
  setPlan: (plan: Plan) => void
  clearPlan: () => void
  updatePlanDateRange: (startDate: string, endDate: string) => void
  updatePlanName: (name: string) => void
  togglePlanVisibility: () => void

  // Meal actions
  addMeal: (meal: Meal) => void
  updateMeal: (id: string, updates: Partial<Meal>) => void
  removeMeal: (id: string) => void

  // Slot actions
  assignMealToSlot: (date: string, slot: MealSlotKey, mealId: string) => void
  clearSlot: (date: string, slot: MealSlotKey) => void

  // Grocery actions
  regenerateGroceryList: () => void
  toggleGroceryItem: (id: string) => void

  // Note actions
  addNote: (text: string) => void
  removeNote: (id: string) => void
  likeNote: (id: string) => void
  addReply: (noteId: string, text: string) => void
  removeReply: (noteId: string, replyId: string) => void

  // Packing actions
  addPackingItem: (text: string, category: PackingCategory) => void
  togglePackingItem: (id: string) => void
  removePackingItem: (id: string) => void
  clearPackedItems: () => void

  // Import/export
  importState: (state: Partial<AppState>) => void
  exportState: () => AppState
}

export const usePlanStore = create<PlanStore>()(
  subscribeWithSelector((set, get) => ({
    plan: null,
    meals: {},
    groceryList: [],
    notes: [],
    packingList: [],
    activeDietaryFilters: [],

    toggleDietaryFilter(tag) {
      set((s) => ({
        activeDietaryFilters: s.activeDietaryFilters.includes(tag)
          ? s.activeDietaryFilters.filter((t) => t !== tag)
          : [...s.activeDietaryFilters, tag],
      }))
    },

    clearDietaryFilters() {
      set({ activeDietaryFilters: [] })
    },

    setPlan(plan) {
      set({ plan })
    },

    clearPlan() {
      set({ plan: null, meals: {}, groceryList: [], packingList: [] })
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
      const updated: Plan = { ...plan, startDate, endDate, days: mergedDays, updatedAt: new Date().toISOString() }
      const newGroceryList = aggregateIngredients(meals, mergedDays, groceryList)
      set({ plan: updated, groceryList: newGroceryList })
    },

    addMeal(meal) {
      set((s) => ({ meals: { ...s.meals, [meal.id]: meal } }))
    },

    updateMeal(id, updates) {
      const { meals } = get()
      if (!meals[id]) return
      set((s) => ({ meals: { ...s.meals, [id]: { ...meals[id], ...updates, updatedAt: new Date().toISOString() } } }))
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
        day.date === date ? { ...day, slots: { ...day.slots, [slot]: { mealId } } } : day
      )
      set({ plan: { ...plan, days, updatedAt: new Date().toISOString() } })
      get().regenerateGroceryList()
    },

    clearSlot(date, slot) {
      const { plan } = get()
      if (!plan) return
      const days = plan.days.map((day) =>
        day.date === date ? { ...day, slots: { ...day.slots, [slot]: { mealId: null } } } : day
      )
      set({ plan: { ...plan, days, updatedAt: new Date().toISOString() } })
      get().regenerateGroceryList()
    },

    regenerateGroceryList() {
      const { meals, plan, groceryList } = get()
      if (!plan) return
      set({ groceryList: aggregateIngredients(meals, plan.days, groceryList) })
    },

    toggleGroceryItem(id) {
      set((s) => ({
        groceryList: s.groceryList.map((item) =>
          item.id === id ? { ...item, checked: !item.checked } : item
        ),
      }))
    },

    addNote(text) {
      const note: Note = { id: crypto.randomUUID(), text: text.trim(), createdAt: new Date().toISOString(), likes: 0, replies: [] }
      set((s) => ({ notes: [note, ...s.notes] }))
    },

    removeNote(id) {
      set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }))
    },

    likeNote(id) {
      set((s) => ({ notes: s.notes.map((n) => n.id === id ? { ...n, likes: (n.likes ?? 0) + 1 } : n) }))
    },

    addReply(noteId, text) {
      const reply: NoteReply = { id: crypto.randomUUID(), text: text.trim(), createdAt: new Date().toISOString() }
      set((s) => ({
        notes: s.notes.map((n) => n.id === noteId ? { ...n, replies: [...(n.replies ?? []), reply] } : n)
      }))
    },

    removeReply(noteId, replyId) {
      set((s) => ({
        notes: s.notes.map((n) => n.id === noteId ? { ...n, replies: (n.replies ?? []).filter((r) => r.id !== replyId) } : n)
      }))
    },

    addPackingItem(text, category) {
      const item: PackingItem = {
        id: crypto.randomUUID(),
        text: text.trim(),
        category,
        packed: false,
        createdAt: new Date().toISOString(),
      }
      set((s) => ({ packingList: [...s.packingList, item] }))
    },

    togglePackingItem(id) {
      set((s) => ({
        packingList: s.packingList.map((item) =>
          item.id === id ? { ...item, packed: !item.packed } : item
        ),
      }))
    },

    removePackingItem(id) {
      set((s) => ({ packingList: s.packingList.filter((item) => item.id !== id) }))
    },

    clearPackedItems() {
      set((s) => ({ packingList: s.packingList.filter((item) => !item.packed) }))
    },

    importState(state) {
      set({
        plan: state.plan ?? null,
        meals: state.meals ?? {},
        groceryList: state.groceryList ?? [],
        notes: (state.notes ?? []).map((n) => ({ ...n, likes: n.likes ?? 0, replies: n.replies ?? [] })),
        packingList: state.packingList ?? [],
      })
    },

    exportState() {
      const { plan, meals, groceryList, notes, packingList } = get()
      return { plan, meals, groceryList, notes, packingList }
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

usePlanStore.subscribe((s) => s.plan, debounce((plan: Plan | null) => { if (plan) savePlan(plan); else clearPlanFromDB() }, 500))
usePlanStore.subscribe((s) => s.meals, debounce((meals: Record<string, Meal>) => saveMeals(meals), 500))
usePlanStore.subscribe((s) => s.groceryList, debounce((list: GroceryItem[]) => saveGroceryList(list), 500))
usePlanStore.subscribe((s) => s.notes, debounce((notes: Note[]) => saveNotes(notes), 500))
usePlanStore.subscribe((s) => s.packingList, debounce((items: PackingItem[]) => savePackingList(items), 500))
