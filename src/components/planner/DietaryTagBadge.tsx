import { Badge } from '../ui/Badge'
import type { DietaryTag } from '../../types'

function formatTag(tag: DietaryTag): string {
  if (tag.startsWith('allergy:')) {
    const allergen = tag.slice('allergy:'.length)
    return `Allergy: ${allergen.charAt(0).toUpperCase() + allergen.slice(1)}`
  }
  return tag
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-')
}

interface DietaryTagBadgeProps {
  tag: DietaryTag
  onRemove?: () => void
}

export function DietaryTagBadge({ tag, onRemove }: DietaryTagBadgeProps) {
  const variant = tag.startsWith('allergy:') ? 'terracotta' : 'sage'
  return <Badge label={formatTag(tag)} variant={variant} onRemove={onRemove} />
}
