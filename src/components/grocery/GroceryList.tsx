import { GroceryItem } from './GroceryItem'
import type { GroceryItem as GroceryItemType } from '../../types'

interface GroceryListProps {
  items: GroceryItemType[]
  onToggle: (id: string) => void
  onAssign?: (id: string, names: string[]) => void
  onRemove?: (id: string) => void
}

export function GroceryList({ items, onToggle, onAssign, onRemove }: GroceryListProps) {
  const unchecked = items.filter((i) => !i.checked)
  const checked = items.filter((i) => i.checked)

  return (
    <div className="bg-white rounded-card shadow-card divide-y divide-olive/10">
      {unchecked.map((item) => (
        <GroceryItem
          key={item.id}
          item={item}
          onToggle={() => onToggle(item.id)}
          onAssign={onAssign ? (names) => onAssign(item.id, names) : undefined}
          onRemove={item.manual && onRemove ? () => onRemove(item.id) : undefined}
        />
      ))}
      {checked.length > 0 && unchecked.length > 0 && (
        <div className="px-3 py-1.5 text-xs font-semibold text-olive/40 uppercase tracking-wide">
          Got it
        </div>
      )}
      {checked.map((item) => (
        <GroceryItem
          key={item.id}
          item={item}
          onToggle={() => onToggle(item.id)}
          onAssign={onAssign ? (names) => onAssign(item.id, names) : undefined}
          onRemove={item.manual && onRemove ? () => onRemove(item.id) : undefined}
        />
      ))}
    </div>
  )
}
