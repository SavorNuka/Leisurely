import { useState } from 'react'
import { differenceInDays, parseISO, format } from 'date-fns'
import { Input } from '../ui/Input'
import { usePlanStore } from '../../stores/planStore'

const MAX_DAYS = 30

export function DateRangePicker() {
  const plan = usePlanStore((s) => s.plan)
  const updateDateRange = usePlanStore((s) => s.updatePlanDateRange)
  const updateName = usePlanStore((s) => s.updatePlanName)
  const [error, setError] = useState<string | null>(null)

  if (!plan) return null

  function handleStartChange(val: string) {
    if (!val || !plan) return
    validate(val, plan.endDate)
  }

  function handleEndChange(val: string) {
    if (!val || !plan) return
    validate(plan.startDate, val)
  }

  function validate(start: string, end: string) {
    const diff = differenceInDays(parseISO(end), parseISO(start))
    if (diff < 0) {
      setError('End date must be after start date')
      return
    }
    if (diff > MAX_DAYS) {
      setError(`Range cannot exceed ${MAX_DAYS} days`)
      return
    }
    setError(null)
    updateDateRange(start, end)
  }

  return (
    <div className="bg-white rounded-card shadow-card p-4 space-y-4" data-tour="date-picker">
      <Input
        id="plan-name"
        label="Trip name"
        defaultValue={plan.name}
        onBlur={(e) => updateName(e.target.value)}
        placeholder="e.g. Tuscany Summer 2026"
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          id="start-date"
          label="Start date"
          type="date"
          defaultValue={plan.startDate}
          onChange={(e) => handleStartChange(e.target.value)}
          className="flex-1"
        />
        <Input
          id="end-date"
          label="End date"
          type="date"
          defaultValue={plan.endDate}
          min={plan.startDate}
          onChange={(e) => handleEndChange(e.target.value)}
          className="flex-1"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Day-pill preview — each day in the range as an animated chip */}
      {plan.days.length > 0 && (
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
        {plan.days.length} day{plan.days.length !== 1 ? 's' : ''} planned
      </p>
    </div>
  )
}
