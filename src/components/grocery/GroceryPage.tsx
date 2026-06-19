import { useGroceryList } from '../../hooks/useGroceryList'
import { usePlanStore } from '../../stores/planStore'
import { GroceryList } from './GroceryList'
import { EmptyState } from '../ui/EmptyState'
import { Button } from '../ui/Button'

export function GroceryPage() {
  const plan = usePlanStore((s) => s.plan)
  const { groceryList, toggleGroceryItem, regenerate } = useGroceryList()

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
      <GroceryList items={groceryList} onToggle={toggleGroceryItem} />
    </div>
  )
}
