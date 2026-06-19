import { MealSlotCell } from './MealSlotCell'
import { MEAL_SLOT_LABELS, type MealSlotKey, type DayPlan, type DietaryTag } from '../../types'
import { formatDayLabel } from '../../lib/dateUtils'
import { usePlanStore } from '../../stores/planStore'

const SLOTS: MealSlotKey[] = ['breakfast', 'lunch', 'dinner', 'snacks']

interface MealGridProps {
  days: DayPlan[]
}

export function MealGrid({ days }: MealGridProps) {
  const meals = usePlanStore((s) => s.meals)
  const activeFilters = usePlanStore((s) => s.activeDietaryFilters)

  if (days.length === 0) return null

  function mealMatchesFilters(mealId: string | null, filters: DietaryTag[]): boolean {
    if (filters.length === 0) return true
    if (!mealId) return false
    const meal = meals[mealId]
    if (!meal) return false
    return filters.every((f) => meal.dietaryTags.includes(f))
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="min-w-[600px]">
        {/* Header */}
        <div className="grid grid-cols-[140px_repeat(4,1fr)] gap-2 mb-2">
          <div />
          {SLOTS.map((slot) => (
            <div key={slot} className="text-center text-xs font-semibold text-olive/60 uppercase tracking-wide py-1">
              {MEAL_SLOT_LABELS[slot]}
            </div>
          ))}
        </div>

        {/* Day rows */}
        <div className="space-y-2">
          {days.map((day) => (
            <div key={day.date} className="grid grid-cols-[140px_repeat(4,1fr)] gap-2 items-stretch">
              <div className="flex items-center pr-2">
                <span className="text-xs font-medium text-olive/70 leading-tight">
                  {formatDayLabel(day.date)}
                </span>
              </div>
              {SLOTS.map((slot) => {
                const mealId = day.slots[slot].mealId
                const dimmed = activeFilters.length > 0 && !mealMatchesFilters(mealId, activeFilters)
                return (
                  <div key={slot} className={`transition-opacity ${dimmed ? 'opacity-25' : 'opacity-100'}`}>
                    <MealSlotCell date={day.date} slot={slot} mealId={mealId} />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
