export type AllergyTag = `allergy:${string}`

export type DietaryTag =
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'halal'
  | 'kosher'
  | AllergyTag

export const PRESET_DIETARY_TAGS: Exclude<DietaryTag, AllergyTag>[] = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'halal',
  'kosher',
]

export type MealSlotKey = 'breakfast' | 'lunch' | 'dinner' | 'snacks'

export const MEAL_SLOT_LABELS: Record<MealSlotKey, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
}

export interface GroceryItem {
  id: string
  name: string
  quantity: number
  unit: string
  checked: boolean
  mealIds: string[]
}

export interface Meal {
  id: string
  name: string
  notes: string
  servings: number
  dietaryTags: DietaryTag[]
  ingredients: GroceryItem[]
  createdAt: string
  updatedAt: string
}

export interface MealSlot {
  mealId: string | null
}

export interface DayPlan {
  date: string
  slots: Record<MealSlotKey, MealSlot>
}

export interface Plan {
  id: string
  name: string
  startDate: string
  endDate: string
  days: DayPlan[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface NoteReply {
  id: string
  text: string
  createdAt: string
}

export interface Note {
  id: string
  text: string
  createdAt: string
  likes: number
  replies: NoteReply[]
}

export type PackingCategory = 'clothes' | 'toiletries' | 'documents' | 'kitchen' | 'misc'

export const PACKING_CATEGORY_LABELS: Record<PackingCategory, string> = {
  clothes: 'Clothes',
  toiletries: 'Toiletries',
  documents: 'Documents',
  kitchen: 'Kitchen & Food',
  misc: 'Misc',
}

export const PACKING_CATEGORY_EMOJI: Record<PackingCategory, string> = {
  clothes: '👕',
  toiletries: '🧴',
  documents: '📄',
  kitchen: '🍳',
  misc: '📦',
}

export interface PackingItem {
  id: string
  text: string
  category: PackingCategory
  packed: boolean
  createdAt: string
}

export interface AppState {
  plan: Plan | null
  meals: Record<string, Meal>
  groceryList: GroceryItem[]
  notes: Note[]
  packingList: PackingItem[]
}

// Recipe (from local JSON database)
export interface Recipe {
  id: string
  name: string
  description: string
  servings: number
  dietaryTags: DietaryTag[]
  ingredients: Omit<GroceryItem, 'checked' | 'mealIds'>[]
}
