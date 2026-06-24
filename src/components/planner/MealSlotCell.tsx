import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MealCard } from './MealCard'
import { AddMealModal } from './AddMealModal'
import { usePlanStore } from '../../stores/planStore'
import type { MealSlotKey } from '../../types'

interface MealSlotCellProps {
  date: string
  slot: MealSlotKey
  mealId: string | null
  isTourTarget?: boolean
}

export function MealSlotCell({ date, slot, mealId, isTourTarget }: MealSlotCellProps) {
  const meals = usePlanStore((s) => s.meals)
  const clearSlot = usePlanStore((s) => s.clearSlot)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const meal = mealId ? meals[mealId] : null

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {meal ? (
          <motion.div
            key="meal"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
            className="h-full"
          >
            <MealCard
              meal={meal}
              compact
              onEdit={() => setEditOpen(true)}
              onClear={() => clearSlot(date, slot)}
            />
          </motion.div>
        ) : (
          <motion.button
            key="add"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={() => setAddOpen(true)}
            className="flex h-full min-h-0 w-full items-center justify-center rounded-card border-2 border-dashed border-sand-300 text-sand-300 hover:border-saffron-400/60 hover:text-saffron-400 hover:bg-saffron-400/5 transition-colors focus:outline-none"
            aria-label={`Add ${slot} for ${date}`}
            {...(isTourTarget ? { 'data-tour': 'meal-slot' } : {})}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
              <line x1="10" y1="4" x2="10" y2="16" />
              <line x1="4" y1="10" x2="16" y2="10" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {addOpen && (
        <AddMealModal open={addOpen} onClose={() => setAddOpen(false)} date={date} slot={slot} />
      )}
      {editOpen && meal && (
        <AddMealModal open={editOpen} onClose={() => setEditOpen(false)} date={date} slot={slot} editingMeal={meal} />
      )}
    </>
  )
}
