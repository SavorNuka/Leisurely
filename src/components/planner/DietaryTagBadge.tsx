import type { DietaryTag } from '../../types'
import { Badge } from '../ui/Badge'

function formatTagLabel(tag: DietaryTag): string {
  if (tag.startsWith('allergy:')) {
    return tag.slice('allergy:'.length).toUpperCase()
  }
  return tag.toUpperCase().replace(/-/g, '-')
}

interface DietaryTagBadgeProps {
  tag: DietaryTag
  onRemove?: () => void
}

export function DietaryTagBadge({ tag, onRemove }: DietaryTagBadgeProps) {
  const isAllergy = tag.startsWith('allergy:')
  const label = formatTagLabel(tag)

  if (onRemove) {
    // In edit forms, keep the removable Badge component with colour variants
    return <Badge label={isAllergy ? `⚠ ${label}` : label} variant={isAllergy ? 'terracotta' : 'sage'} onRemove={onRemove} />
  }

  // Display-only: all-caps micro-label, no colour pills
  return (
    <span
      className={`inline-block font-sans text-[10px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded-sm ${
        isAllergy
          ? 'bg-clay-400/10 text-clay-500'
          : 'bg-sand-200 text-ink-700'
      }`}
    >
      {isAllergy ? `⚠ ${label}` : label}
    </span>
  )
}
