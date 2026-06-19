import { MealSlotCell } from './MealSlotCell'
import { MEAL_SLOT_LABELS, type MealSlotKey, type DayPlan, type DietaryTag } from '../../types'
import { formatDayLabel } from '../../lib/dateUtils'
import { usePlanStore } from '../../stores/planStore'

const SLOTS: MealSlotKey[] = ['breakfast', 'lunch', 'dinner', 'snacks']

const SLOT_HEADER_STYLE: Record<MealSlotKey, string> = {
  breakfast: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
  lunch:     'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
  dinner:    'bg-orange-50 text-orange-700 ring-1 ring-orange-200/60',
  snacks:    'bg-violet-50 text-violet-700 ring-1 ring-violet-200/60',
}

const SLOT_COL_BG: Record<MealSlotKey, string> = {
  breakfast: 'bg-amber-50/25',
  lunch:     'bg-emerald-50/25',
  dinner:    'bg-orange-50/25',
  snacks:    'bg-violet-50/25',
}

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
        {/* Column header row */}
        <div className="grid grid-cols-[140px_repeat(4,1fr)] gap-2 mb-2">
          <div />
          {SLOTS.map((slot) => (
            <div
              key={slot}
              className={`text-center text-xs font-semibold uppercase tracking-wide py-1.5 px-2 rounded-md ${SLOT_HEADER_STYLE[slot]}`}
            >
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
                  <div
                    key={slot}
                    className={`rounded-card transition-opacity ${SLOT_COL_BG[slot]} ${dimmed ? 'opacity-25' : 'opacity-100'}`}
                  >
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
