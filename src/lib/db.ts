import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Plan, Meal, GroceryItem, Note, PackingItem, AppState, TripStub, Recipe } from '../types'

interface SnapshotRecord {
  planId: string
  name: string
  startDate: string
  endDate: string
  savedAt: string
  state: AppState
}

interface LeisurelyDB extends DBSchema {
  plan: { key: string; value: Plan }
  meals: { key: string; value: Meal; indexes: { 'by-name': string } }
  groceryList: { key: string; value: GroceryItem }
  notes: { key: string; value: Note }
  packingList: { key: string; value: PackingItem }
  meta: { key: string; value: string }
  snapshots: { key: string; value: SnapshotRecord }
  customRecipes: { key: string; value: Recipe }
}

const DB_NAME = 'leisurely-db'
const DB_VERSION = 4

let dbPromise: Promise<IDBPDatabase<LeisurelyDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<LeisurelyDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('plan', { keyPath: 'id' })
          const mealStore = db.createObjectStore('meals', { keyPath: 'id' })
          mealStore.createIndex('by-name', 'name')
          db.createObjectStore('groceryList', { keyPath: 'id' })
          db.createObjectStore('meta')
        }
        if (oldVersion < 2) {
          db.createObjectStore('notes', { keyPath: 'id' })
        }
        if (oldVersion < 3) {
          db.createObjectStore('packingList', { keyPath: 'id' })
        }
        if (oldVersion < 4) {
          db.createObjectStore('snapshots', { keyPath: 'planId' })
          db.createObjectStore('customRecipes', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export async function loadFromDB(): Promise<{
  plan: Plan | null
  meals: Record<string, Meal>
  groceryList: GroceryItem[]
  notes: Note[]
  packingList: PackingItem[]
}> {
  const db = await getDB()
  const activePlanId = await db.get('meta', 'activePlanId')

  let plan: Plan | null = null
  if (activePlanId) {
    plan = (await db.get('plan', activePlanId)) ?? null
  }

  const mealsArr = await db.getAll('meals')
  const meals: Record<string, Meal> = {}
  for (const meal of mealsArr) {
    meals[meal.id] = meal
  }

  const groceryList = await db.getAll('groceryList')
  const notes = await db.getAll('notes')
  const packingList = await db.getAll('packingList')

  return { plan, meals, groceryList, notes, packingList }
}

export async function savePlan(plan: Plan) {
  const db = await getDB()
  const tx = db.transaction(['plan', 'meta'], 'readwrite')
  await tx.objectStore('plan').put(plan)
  await tx.objectStore('meta').put(plan.id, 'activePlanId')
  await tx.done
}

export async function clearPlanFromDB() {
  const db = await getDB()
  const tx = db.transaction(['plan', 'meta'], 'readwrite')
  const activePlanId = await tx.objectStore('meta').get('activePlanId')
  if (activePlanId) {
    await tx.objectStore('plan').delete(activePlanId)
    await tx.objectStore('meta').delete('activePlanId')
  }
  await tx.done
}

export async function saveMeals(meals: Record<string, Meal>) {
  const db = await getDB()
  const tx = db.transaction('meals', 'readwrite')
  await tx.store.clear()
  for (const meal of Object.values(meals)) {
    await tx.store.put(meal)
  }
  await tx.done
}

export async function saveGroceryList(items: GroceryItem[]) {
  const db = await getDB()
  const tx = db.transaction('groceryList', 'readwrite')
  await tx.store.clear()
  for (const item of items) {
    await tx.store.put(item)
  }
  await tx.done
}

export async function saveNotes(notes: Note[]) {
  const db = await getDB()
  const tx = db.transaction('notes', 'readwrite')
  await tx.store.clear()
  for (const note of notes) {
    await tx.store.put(note)
  }
  await tx.done
}

export async function savePackingList(items: PackingItem[]) {
  const db = await getDB()
  const tx = db.transaction('packingList', 'readwrite')
  await tx.store.clear()
  for (const item of items) {
    await tx.store.put(item)
  }
  await tx.done
}

// ── Trip snapshots ─────────────────────────────────────────────────────────────

export async function saveSnapshot(
  planId: string,
  meta: { name: string; startDate: string; endDate: string },
  state: AppState
): Promise<void> {
  const db = await getDB()
  await db.put('snapshots', {
    planId,
    name: meta.name,
    startDate: meta.startDate,
    endDate: meta.endDate,
    savedAt: new Date().toISOString(),
    state,
  })
}

export async function loadSnapshot(planId: string): Promise<AppState | null> {
  const db = await getDB()
  const record = await db.get('snapshots', planId)
  return record?.state ?? null
}

export async function listSnapshots(): Promise<TripStub[]> {
  const db = await getDB()
  const records = await db.getAll('snapshots')
  return records
    .map((r) => ({
      planId: r.planId,
      name: r.name,
      startDate: r.startDate,
      endDate: r.endDate,
      savedAt: r.savedAt,
    }))
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}

export async function deleteSnapshot(planId: string): Promise<void> {
  const db = await getDB()
  await db.delete('snapshots', planId)
}

// ── Custom recipes ─────────────────────────────────────────────────────────────

export async function saveCustomRecipe(recipe: Recipe): Promise<void> {
  const db = await getDB()
  await db.put('customRecipes', recipe)
}

export async function loadCustomRecipes(): Promise<Recipe[]> {
  const db = await getDB()
  return db.getAll('customRecipes')
}

export async function deleteCustomRecipe(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('customRecipes', id)
}
