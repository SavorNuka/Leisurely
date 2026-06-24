import { format, parseISO } from 'date-fns'
import { MealSlotCell } from './MealSlotCell'
import { MEAL_SLOT_LABELS, type MealSlotKey, type DayPlan, type DietaryTag } from '../../types'
import { usePlanStore } from '../../stores/planStore'

const SLOTS: MealSlotKey[] = ['breakfast', 'lunch', 'dinner', 'snacks']

// Row heights: dinner is tallest (hero meal), snacks shortest
const SLOT_ROW_HEIGHT: Record<MealSlotKey, string> = {
  breakfast: 'h-16',
  lunch:     'h-16',
  dinner:    'h-24',
  snacks:    'h-12',
}

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

  // Rotated layout: rows = meal types, columns = days
  // Using inline gridTemplateColumns for dynamic column count
  const colTemplate = `80px repeat(${days.length}, minmax(72px, 1fr))`

  return (
    <div className="relative">
      <div className="overflow-x-auto -mx-4 px-4 scroll-smooth [-webkit-overflow-scrolling:touch]">
        <div className="min-w-[480px] space-y-1">

          {/* Day header row */}
          <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: colTemplate }}>
            <div /> {/* empty corner */}
            {days.map((day, i) => (
              <div key={day.date} className="relative py-2 px-1 text-center overflow-hidden">
                {/* Ghost day numeral — faint watermark behind the label */}
                <span
                  aria-hidden="true"
                  className="font-serif font-light text-[56px] text-ink-900/[0.04] absolute -top-1 right-0 select-none pointer-events-none leading-none"
                >
                  {i + 1}
                </span>
                <span className="font-sans text-[10px] font-semibold text-ink-700 uppercase tracking-wide relative z-10 block leading-tight">
                  {format(parseISO(day.date), 'EEE')}
                </span>
                <span className="font-sans text-[10px] text-ink-400 relative z-10 block">
                  {format(parseISO(day.date), 'MMM d')}
                </span>
              </div>
            ))}
          </div>

          {/* One row per meal type */}
          {SLOTS.map((slot) => (
            <div
              key={slot}
              className={`grid gap-1 ${SLOT_ROW_HEIGHT[slot]}`}
              style={{ gridTemplateColumns: colTemplate }}
            >
              {/* Slot label */}
              <div className="flex items-center pr-1">
                <span
                  className={`text-[9px] font-semibold uppercase tracking-widest py-1 px-1.5 rounded-md leading-tight text-center w-full ${SLOT_HEADER_STYLE[slot]}`}
                  data-tour={slot === 'breakfast' ? 'meal-slot-label' : undefined}
                >
                  {MEAL_SLOT_LABELS[slot]}
                </span>
              </div>

              {/* Day cells for this slot */}
              {days.map((day, dayIndex) => {
                const mealId = day.slots[slot].mealId
                const dimmed = activeFilters.length > 0 && !mealMatchesFilters(mealId, activeFilters)
                const isTourTarget = dayIndex === 0 && slot === 'breakfast'
                return (
                  <div
                    key={day.date}
                    className={`h-full rounded-card transition-opacity ${SLOT_COL_BG[slot]} ${dimmed ? 'opacity-25' : 'opacity-100'}`}
                  >
                    <MealSlotCell date={day.date} slot={slot} mealId={mealId} isTourTarget={isTourTarget} />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Right-edge fade affordance — signals horizontal scroll */}
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-cream to-transparent pointer-events-none z-10"
      />
    </div>
  )
}
