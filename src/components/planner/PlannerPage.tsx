import { useState } from 'react'
import { usePlanStore } from '../../stores/planStore'
import { usePlan } from '../../hooks/usePlan'
import { DateRangePicker } from './DateRangePicker'
import { MealGrid } from './MealGrid'
import { EmptyState } from '../ui/EmptyState'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

export function PlannerPage() {
  const plan = usePlanStore((s) => s.plan)
  const { createNewPlan } = usePlan()
  const [newName, setNewName] = useState('')

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <EmptyState
          title="No trip planned yet"
          description="Create your first trip plan and start filling in your meals for each day."
        />
        <div className="w-full max-w-sm mt-4 space-y-3">
          <Input
            id="new-plan-name"
            label="Trip name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Tuscany Summer 2026"
            onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) createNewPlan(newName.trim()) }}
          />
          <Button
            variant="primary"
            className="w-full justify-center"
            onClick={() => createNewPlan(newName.trim() || 'My Trip')}
          >
            Start planning
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-6">
      <DateRangePicker />
      <MealGrid days={plan.days} />
    </div>
  )
}
