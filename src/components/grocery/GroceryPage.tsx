import { useState, useMemo } from 'react'
import { useGroceryList } from '../../hooks/useGroceryList'
import { usePlanStore } from '../../stores/planStore'
import { GroceryList } from './GroceryList'
import { EmptyState } from '../ui/EmptyState'
import { Button } from '../ui/Button'

export function GroceryPage() {
  const plan = usePlanStore((s) => s.plan)
  const updateGroceryItemAssignment = usePlanStore((s) => s.updateGroceryItemAssignment)
  const { groceryList, toggleGroceryItem, regenerate } = useGroceryList()
  const [filterPerson, setFilterPerson] = useState<string | null>(null)

  const allAssignees = useMemo(() => {
    const names = new Set<string>()
    for (const item of groceryList) {
      for (const name of item.assignedTo ?? []) names.add(name)
    }
    return Array.from(names).sort()
  }, [groceryList])

  const visibleItems = useMemo(() => {
    if (!filterPerson) return groceryList
    return groceryList.filter((i) => (i.assignedTo ?? []).includes(filterPerson))
  }, [groceryList, filterPerson])

  if (!plan) {
    return (
      <EmptyState
        title="No trip yet"
        description="Create a trip plan first and add meals to generate your grocery list."
      />
    )
  }

  if (groceryList.length === 0) {
    return (
      <div className="py-6 space-y-4">
        <EmptyState
          title="No ingredients yet"
          description="Add meals with ingredients in your plan and they'll appear here."
          action={{ label: 'Refresh list', onClick: regenerate }}
        />
      </div>
    )
  }

  const checkedCount = groceryList.filter((i) => i.checked).length

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-serif font-semibold text-olive">Grocery List</h2>
          <p className="text-xs text-olive/50">
            {checkedCount}/{groceryList.length} items checked
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={regenerate}>
          Refresh
        </Button>
      </div>

      {/* Filter by person */}
      {allAssignees.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-olive/50">Filter:</span>
          {allAssignees.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setFilterPerson(filterPerson === name ? null : name)}
              className={`rounded-full px-3 py-0.5 text-xs font-medium transition-colors ${
                filterPerson === name
                  ? 'bg-sage text-white'
                  : 'bg-sage/15 text-olive hover:bg-sage/25'
              }`}
            >
              {name}
            </button>
          ))}
          {filterPerson && (
            <button
              type="button"
              onClick={() => setFilterPerson(null)}
              className="text-xs text-olive/40 hover:text-olive transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      <GroceryList
        items={visibleItems}
        onToggle={toggleGroceryItem}
        onAssign={updateGroceryItemAssignment}
      />
    </div>
  )
}
