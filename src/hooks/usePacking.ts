import { usePlanStore } from '../stores/planStore'
import type { PackingCategory } from '../types'

export function usePacking() {
  const packingList = usePlanStore((s) => s.packingList)
  const addPackingItem = usePlanStore((s) => s.addPackingItem)
  const togglePackingItem = usePlanStore((s) => s.togglePackingItem)
  const removePackingItem = usePlanStore((s) => s.removePackingItem)
  const clearPackedItems = usePlanStore((s) => s.clearPackedItems)

  const packedCount = packingList.filter((i) => i.packed).length

  function byCategory(category: PackingCategory) {
    return packingList.filter((i) => i.category === category)
  }

  return { packingList, packedCount, byCategory, addPackingItem, togglePackingItem, removePackingItem, clearPackedItems }
}
