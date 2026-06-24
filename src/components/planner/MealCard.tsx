import type { Meal } from '../../types'
import { DietaryTagBadge } from './DietaryTagBadge'
import { usePlanStore } from '../../stores/planStore'

interface MealCardProps {
  meal: Meal
  onEdit: () => void
  onClear: () => void
  compact?: boolean
}

export function MealCard({ meal, onEdit, onClear, compact = false }: MealCardProps) {
  const updateMeal = usePlanStore((s) => s.updateMeal)
  const regenerateGroceryList = usePlanStore((s) => s.regenerateGroceryList)

  function changeServings(delta: number) {
    const next = Math.max(1, Math.min(50, meal.servings + delta))
    updateMeal(meal.id, { servings: next })
    regenerateGroceryList()
  }

  return (
    <div className="group relative bg-sand-50 rounded-card shadow-card hover:shadow-card-hover transition-shadow duration-200 p-2.5 flex flex-col gap-1 min-w-0 h-full border-l-[3px] border-l-transparent">
      <div className="flex items-start justify-between gap-1">
        <p className={`font-sans font-medium text-ink-900 leading-tight truncate ${compact ? 'text-xs' : 'text-sm'}`}>
          {meal.name}
        </p>
        {/* Controls always visible at low opacity, full on hover */}
        <div className="flex gap-1 opacity-30 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shrink-0">
          <button
            onClick={onEdit}
            aria-label="Edit meal"
            className="rounded p-0.5 text-ink-400 hover:text-ink-900 transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11.5 2.5a1.5 1.5 0 012.12 2.12L5 13.24l-3 .76.76-3 8.74-8.5z" />
            </svg>
          </button>
          <button
            onClick={onClear}
            aria-label="Remove meal from slot"
            className="rounded p-0.5 text-ink-400 hover:text-red-500 transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {!compact && meal.notes && (
        <p className="text-xs text-ink-400 line-clamp-2">{meal.notes}</p>
      )}

      {meal.dietaryTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {meal.dietaryTags.slice(0, compact ? 2 : 4).map((tag) => (
            <DietaryTagBadge key={tag} tag={tag} />
          ))}
          {compact && meal.dietaryTags.length > 2 && (
            <span className="text-[10px] text-ink-400">+{meal.dietaryTags.length - 2}</span>
          )}
        </div>
      )}

      {!compact && (
        <div className="flex items-center gap-1.5 mt-0.5">
          <button
            type="button"
            onClick={() => changeServings(-1)}
            disabled={meal.servings <= 1}
            aria-label="Decrease servings"
            className="h-4 w-4 rounded text-ink-400 hover:text-ink-900 hover:bg-ink-900/10 flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed shrink-0 transition-colors"
          >
            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <line x1="2" y1="5" x2="8" y2="5"/>
            </svg>
          </button>
          <span className="text-[10px] text-ink-400 font-sans">Serves {meal.servings}</span>
          <button
            type="button"
            onClick={() => changeServings(1)}
            disabled={meal.servings >= 50}
            aria-label="Increase servings"
            className="h-4 w-4 rounded text-ink-400 hover:text-ink-900 hover:bg-ink-900/10 flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed shrink-0 transition-colors"
          >
            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <line x1="5" y1="2" x2="5" y2="8"/><line x1="2" y1="5" x2="8" y2="5"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
