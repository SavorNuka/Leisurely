import { create } from 'zustand'

interface UIStore {
  groceryFilter: string | null
  packingFilter: string | null
  setGroceryFilter: (person: string | null) => void
  setPackingFilter: (person: string | null) => void
}

export const useUIStore = create<UIStore>((set) => ({
  groceryFilter: null,
  packingFilter: null,
  setGroceryFilter: (person) => set({ groceryFilter: person }),
  setPackingFilter: (person) => set({ packingFilter: person }),
}))
