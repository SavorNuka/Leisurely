import { usePlanStore } from '../stores/planStore'

export function useGroceryList() {
  const groceryList = usePlanStore((s) => s.groceryList)
  const toggleGroceryItem = usePlanStore((s) => s.toggleGroceryItem)
  const regenerate = usePlanStore((s) => s.regenerateGroceryList)

  return { groceryList, toggleGroceryItem, regenerate }
}
