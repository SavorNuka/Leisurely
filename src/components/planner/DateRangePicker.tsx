import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Input } from '../ui/Input'
import { usePlanStore } from '../../stores/planStore'
import { DateRangeCalendar } from './DateRangeCalendar'

const MAX_DAYS = 30

export function DateRangePicker() {
  const plan = usePlanStore((s) => s.plan)
  const updateDateRange = usePlanStore((s) => s.updatePlanDateRange)
  const updateName = usePlanStore((s) => s.updatePlanName)
  const [error, setError] = useState<string | null>(null)

  if (!plan) return null

  return (
    <div className="space-y-4" data-tour="date-picker">
      <div className="bg-white rounded-card shadow-card p-4">
        <Input
          id="plan-name"
          label="Trip name"
          defaultValue={plan.name}
          onBlur={(e) => updateName(e.target.value)}
          placeholder="e.g. Tuscany Summer 2026"
        />
      </div>

      <DateRangeCalendar
        startDate={plan.startDate}
        endDate={plan.endDate}
        onRangeChange={(start, end) => updateDateRange(start, end)}
        onError={(msg) => setError(msg)}
        maxDays={MAX_DAYS}
      />

      {error && <p className="text-xs text-red-500 px-1">{error}</p>}

      {(plan.days?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {plan.days.map((day, i) => (
            <span
              key={day.date}
              className="animate-slide-up font-sans text-[10px] font-medium px-2.5 py-1 rounded-full bg-saffron-400/10 text-ink-700 border border-saffron-400/30"
              style={{ animationDelay: `${i * 18}ms`, animationFillMode: 'both' }}
            >
              {format(parseISO(day.date), 'MMM d')}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-olive/50">
        {plan.days?.length ?? 0} day{(plan.days?.length ?? 0) !== 1 ? 's' : ''} planned
      </p>
    </div>
  )
}
