import { usePlanStore } from '../../stores/planStore'
import { PRESET_DIETARY_TAGS, type DietaryTag } from '../../types'

function formatPreset(tag: Exclude<DietaryTag, `allergy:${string}`>): string {
  return tag.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('-')
}

export function DietaryFilter() {
  const active = usePlanStore((s) => s.activeDietaryFilters)
  const toggle = usePlanStore((s) => s.toggleDietaryFilter)
  const clear = usePlanStore((s) => s.clearDietaryFilters)

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4">
      <span className="text-xs font-medium text-olive/50 shrink-0">Filter:</span>
      {PRESET_DIETARY_TAGS.map((tag) => {
        const isActive = active.includes(tag)
        return (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              isActive
                ? 'bg-sage text-white'
                : 'bg-olive/10 text-olive/60 hover:bg-olive/20'
            }`}
          >
            {formatPreset(tag)}
          </button>
        )
      })}
      {active.length > 0 && (
        <button
          onClick={clear}
          className="shrink-0 rounded-full px-3 py-1 text-xs font-medium bg-terracotta/15 text-terracotta-dark hover:bg-terracotta/25 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}
