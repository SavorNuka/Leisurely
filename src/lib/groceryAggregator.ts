import type { Meal, GroceryItem, DayPlan, MealSlotKey } from '../types'

const SLOT_KEYS: MealSlotKey[] = ['breakfast', 'lunch', 'dinner', 'snacks']

export function aggregateIngredients(
  meals: Record<string, Meal>,
  days: DayPlan[],
  existingList: GroceryItem[]
): GroceryItem[] {
  const existingChecked = new Map(
    existingList
      .filter((i) => i.checked)
      .map((i) => [`${i.name.toLowerCase()}|${i.unit}`, true])
  )

  const merged = new Map<string, GroceryItem>()

  for (const day of days) {
    for (const slot of SLOT_KEYS) {
      const mealId = day.slots[slot].mealId
      if (!mealId || !meals[mealId]) continue

      const meal = meals[mealId]
      for (const ingredient of meal.ingredients) {
        const key = `${ingredient.name.toLowerCase()}|${ingredient.unit}`
        const existing = merged.get(key)
        if (existing) {
          existing.quantity += ingredient.quantity * meal.servings
          if (!existing.mealIds.includes(mealId)) {
            existing.mealIds.push(mealId)
          }
          if (meal.assignedTo?.length) {
            const set = new Set(existing.assignedTo ?? [])
            for (const name of meal.assignedTo) set.add(name)
            existing.assignedTo = Array.from(set)
          }
        } else {
          merged.set(key, {
            id: ingredient.id,
            name: ingredient.name,
            quantity: ingredient.quantity * meal.servings,
            unit: ingredient.unit,
            checked: existingChecked.get(key) ?? false,
            mealIds: [mealId],
            assignedTo: meal.assignedTo?.length ? [...meal.assignedTo] : undefined,
          })
        }
      }
    }
  }

  return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name))
}
