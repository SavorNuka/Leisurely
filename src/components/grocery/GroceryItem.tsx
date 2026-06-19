import type { GroceryItem as GroceryItemType } from '../../types'

interface GroceryItemProps {
  item: GroceryItemType
  onToggle: () => void
}

export function GroceryItem({ item, onToggle }: GroceryItemProps) {
  const qtyLabel = item.unit
    ? `${item.quantity} ${item.unit}`
    : `${item.quantity}`

  return (
    <label className="flex items-center gap-3 py-2.5 px-3 rounded-card hover:bg-olive/5 cursor-pointer transition-colors group">
      <input
        type="checkbox"
        checked={item.checked}
        onChange={onToggle}
        className="h-4 w-4 rounded border-olive/30 text-sage focus:ring-sage"
      />
      <span className={`flex-1 text-sm ${item.checked ? 'line-through text-olive/40' : 'text-olive'}`}>
        {item.name}
      </span>
      <span className={`text-xs tabular-nums ${item.checked ? 'text-olive/30' : 'text-olive/60'}`}>
        {qtyLabel}
      </span>
    </label>
  )
}
