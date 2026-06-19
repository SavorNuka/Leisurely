import { useState } from 'react'
import { MealCard } from './MealCard'
import { AddMealModal } from './AddMealModal'
import { usePlanStore } from '../../stores/planStore'
import type { MealSlotKey } from '../../types'

interface MealSlotCellProps {
  date: string
  slot: MealSlotKey
  mealId: string | null
}

export function MealSlotCell({ date, slot, mealId }: MealSlotCellProps) {
  const meals = usePlanStore((s) => s.meals)
  const clearSlot = usePlanStore((s) => s.clearSlot)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const meal = mealId ? meals[mealId] : null

  if (meal) {
    return (
      <>
        <MealCard
          meal={meal}
          compact
          onEdit={() => setEditOpen(true)}
          onClear={() => clearSlot(date, slot)}
        />
        {editOpen && (
          <AddMealModal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            date={date}
            slot={slot}
            editingMeal={meal}
          />
        )}
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setAddOpen(true)}
        className="flex h-full min-h-[64px] w-full items-center justify-center rounded-card border-2 border-dashed border-olive/15 text-olive/30 hover:border-sage/40 hover:text-sage/60 hover:bg-sage/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
        aria-label={`Add ${slot} for ${date}`}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
          <line x1="10" y1="4" x2="10" y2="16" />
          <line x1="4" y1="10" x2="16" y2="10" />
        </svg>
      </button>
      {addOpen && (
        <AddMealModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          date={date}
          slot={slot}
        />
      )}
    </>
  )
}
