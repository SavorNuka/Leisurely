import { useState } from 'react'
import type { GroceryItem as GroceryItemType } from '../../types'
import { GROCERY_CATEGORY_ORDER, GROCERY_CATEGORY_LABELS, GROCERY_CATEGORY_EMOJI } from '../../types'
import { GroceryItem } from './GroceryItem'

interface GroceryCategoryListProps {
  items: GroceryItemType[]
  onToggle: (id: string) => void
  onAssign?: (id: string, names: string[]) => void
  onRemove?: (id: string) => void
}

interface CategoryGroupProps {
  category: string
  label: string
  emoji: string
  items: GroceryItemType[]
  onToggle: (id: string) => void
  onAssign?: (id: string, names: string[]) => void
  onRemove?: (id: string) => void
}

function CategoryGroup({ category, label, emoji, items, onToggle, onAssign, onRemove }: CategoryGroupProps) {
  const unchecked = items.filter((i) => !i.checked)
  const checked = items.filter((i) => i.checked)
  const allDone = unchecked.length === 0 && checked.length > 0
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden">
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 bg-cream/60 hover:bg-cream transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base leading-none" aria-hidden="true">{emoji}</span>
          <span className="text-xs font-semibold text-olive/70 uppercase tracking-wide">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-olive/40 tabular-nums">
            {allDone ? `${checked.length} done` : `${unchecked.length}/${items.length}`}
          </span>
          <svg
            className={`h-3 w-3 text-olive/40 transition-transform ${collapsed ? '' : 'rotate-90'}`}
            fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round"
          >
            <path d="M4 2l4 4-4 4"/>
          </svg>
        </div>
      </button>

      {!collapsed && (
        <div className="divide-y divide-olive/10" data-category={category}>
          {unchecked.map((item, i) => (
            <div
              key={item.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 35}ms`, animationFillMode: 'both' }}
            >
              <GroceryItem
                item={item}
                onToggle={() => onToggle(item.id)}
                onAssign={onAssign ? (names) => onAssign(item.id, names) : undefined}
                onRemove={item.manual && onRemove ? () => onRemove(item.id) : undefined}
              />
            </div>
          ))}
          {checked.length > 0 && unchecked.length > 0 && (
            <div className="px-3 py-1 text-xs font-semibold text-olive/30 uppercase tracking-wide bg-olive/[0.02]">
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
      )}
    </div>
  )
}

export function GroceryCategoryList({ items, onToggle, onAssign, onRemove }: GroceryCategoryListProps) {
  return (
    <div className="space-y-3">
      {GROCERY_CATEGORY_ORDER.map((category) => {
        const group = items.filter((i) => (i.category ?? 'other') === category)
        if (group.length === 0) return null
        return (
          <CategoryGroup
            key={category}
            category={category}
            label={GROCERY_CATEGORY_LABELS[category]}
            emoji={GROCERY_CATEGORY_EMOJI[category]}
            items={group}
            onToggle={onToggle}
            onAssign={onAssign}
            onRemove={onRemove}
          />
        )
      })}
    </div>
  )
}
