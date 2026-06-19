import { MealSlotCell } from './MealSlotCell'
import { MEAL_SLOT_LABELS, type MealSlotKey } from '../../types'
import { formatDayLabel } from '../../lib/dateUtils'
import type { DayPlan } from '../../types'

const SLOTS: MealSlotKey[] = ['breakfast', 'lunch', 'dinner', 'snacks']

interface MealGridProps {
  days: DayPlan[]
}

export function MealGrid({ days }: MealGridProps) {
  if (days.length === 0) return null

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="min-w-[600px]">
        {/* Header row */}
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
              {SLOTS.map((slot) => (
                <MealSlotCell
                  key={slot}
                  date={day.date}
                  slot={slot}
                  mealId={day.slots[slot].mealId}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
