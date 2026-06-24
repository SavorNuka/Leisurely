import { useState } from 'react'
import type { GroceryItem as GroceryItemType } from '../../types'

interface GroceryItemProps {
  item: GroceryItemType
  onToggle: () => void
  onAssign?: (names: string[]) => void
  onRemove?: () => void
}

export function GroceryItem({ item, onToggle, onAssign, onRemove }: GroceryItemProps) {
  const [addingAssignee, setAddingAssignee] = useState(false)
  const [assigneeInput, setAssigneeInput] = useState('')

  const qtyLabel = item.unit ? `${item.quantity} ${item.unit}` : `${item.quantity}`

  function commitAssignee() {
    const val = assigneeInput.trim()
    if (val && onAssign) {
      const current = item.assignedTo ?? []
      if (!current.includes(val)) onAssign([...current, val])
    }
    setAssigneeInput('')
    setAddingAssignee(false)
  }

  function removeAssignee(name: string) {
    if (!onAssign) return
    onAssign((item.assignedTo ?? []).filter((n) => n !== name))
  }

  return (
    <div className="py-2.5 px-3 rounded-card hover:bg-olive/5 transition-colors group">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={item.checked}
          onChange={onToggle}
          className="h-4 w-4 rounded border-olive/30 text-sage focus:ring-sage shrink-0"
        />
        <span className={`flex-1 text-sm ${item.checked ? 'line-through text-olive/40' : 'text-olive'}`}>
          {item.name}
          {item.manual && (
            <span className="ml-1.5 text-xs text-olive/30" title="Manually added">✍</span>
          )}
        </span>
        <span className={`text-xs tabular-nums ${item.checked ? 'text-olive/30' : 'text-olive/60'}`}>
          {qtyLabel}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-olive/25 hover:text-red-400 transition-colors p-1 rounded shrink-0"
            aria-label="Remove item"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
              <line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/>
            </svg>
          </button>
        )}
      </div>

      {/* Assignees row */}
      {onAssign && (
        <div className="ml-7 mt-1 flex flex-wrap items-center gap-1">
          {(item.assignedTo ?? []).map((name) => (
            <span key={name} className="inline-flex items-center gap-1 rounded-full bg-sage/15 px-2 py-0.5 text-xs text-olive/70">
              {name}
              <button
                type="button"
                onClick={() => removeAssignee(name)}
                className="text-olive/30 hover:text-red-400 transition-colors"
                aria-label={`Remove ${name}`}
              >
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                  <line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/>
                </svg>
              </button>
            </span>
          ))}

          {addingAssignee ? (
            <input
              autoFocus
              className="w-24 rounded border border-olive/20 bg-white px-1.5 py-0.5 text-xs text-olive focus:border-sage focus:ring-1 focus:ring-sage focus:outline-none"
              placeholder="Name…"
              value={assigneeInput}
              onChange={(e) => setAssigneeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commitAssignee() }
                if (e.key === 'Escape') { setAddingAssignee(false); setAssigneeInput('') }
              }}
              onBlur={commitAssignee}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAddingAssignee(true)}
              className="text-xs text-olive/30 hover:text-sage transition-colors opacity-0 group-hover:opacity-100"
            >
              + assign
            </button>
          )}
        </div>
      )}
    </div>
  )
}
