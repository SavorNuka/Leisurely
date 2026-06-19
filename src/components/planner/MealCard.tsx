import type { Meal } from '../../types'
import { DietaryTagBadge } from './DietaryTagBadge'

interface MealCardProps {
  meal: Meal
  onEdit: () => void
  onClear: () => void
  compact?: boolean
}

export function MealCard({ meal, onEdit, onClear, compact = false }: MealCardProps) {
  return (
    <div className="group relative bg-cream rounded-card shadow-card p-2.5 flex flex-col gap-1 min-w-0">
      <div className="flex items-start justify-between gap-1">
        <p className={`font-medium text-olive leading-tight truncate ${compact ? 'text-xs' : 'text-sm'}`}>
          {meal.name}
        </p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shrink-0">
          <button
            onClick={onEdit}
            aria-label="Edit meal"
            className="rounded p-0.5 text-olive/50 hover:text-sage transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11.5 2.5a1.5 1.5 0 012.12 2.12L5 13.24l-3 .76.76-3 8.74-8.5z" />
            </svg>
          </button>
          <button
            onClick={onClear}
            aria-label="Remove meal from slot"
            className="rounded p-0.5 text-olive/50 hover:text-red-500 transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {!compact && meal.notes && (
        <p className="text-xs text-olive/60 line-clamp-2">{meal.notes}</p>
      )}

      {meal.dietaryTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {meal.dietaryTags.slice(0, compact ? 2 : 4).map((tag) => (
            <DietaryTagBadge key={tag} tag={tag} />
          ))}
          {compact && meal.dietaryTags.length > 2 && (
            <span className="text-xs text-olive/40">+{meal.dietaryTags.length - 2}</span>
          )}
        </div>
      )}

      {!compact && (
        <p className="text-xs text-olive/40 mt-0.5">Serves {meal.servings}</p>
      )}
    </div>
  )
}
