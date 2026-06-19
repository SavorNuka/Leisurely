import { supabase, isConfigured } from './supabase'
import type { AppState, GroceryItem, PackingCategory, PackingItem } from '../types'

type RealtimeUnsub = () => void

// ── Push local state → Supabase ───────────────────────────────────────────────

export async function pushPlan(
  state: AppState,
  userId: string
): Promise<void> {
  if (!isConfigured() || !supabase || !state.plan) return
  const { plan, meals, groceryList } = state

  // Upsert plan row
  await supabase.from('plans').upsert({
    id: plan.id,
    user_id: userId,
    name: plan.name,
    start_date: plan.startDate,
    end_date: plan.endDate,
    is_public: plan.isPublic,
    days: plan.days,
    updated_at: plan.updatedAt,
    created_at: plan.createdAt,
  })

  // Upsert all meals
  const mealRows = Object.values(meals).map((m) => ({
    id: m.id,
    plan_id: plan.id,
    user_id: userId,
    data: m,
    updated_at: m.updatedAt,
    created_at: m.createdAt,
  }))
  if (mealRows.length > 0) {
    await supabase.from('meals').upsert(mealRows)
  }

  // Replace grocery items
  await supabase.from('grocery_items').delete().eq('plan_id', plan.id)
  const groceryRows = groceryList.map((g) => ({
    id: g.id,
    plan_id: plan.id,
    user_id: userId,
    data: g,
  }))
  if (groceryRows.length > 0) {
    await supabase.from('grocery_items').insert(groceryRows)
  }
}

export async function pushNotes(
  notes: AppState['notes'],
  userId: string
): Promise<void> {
  if (!isConfigured() || !supabase) return
  await supabase.from('notes').delete().eq('user_id', userId)
  const rows = notes.map((n) => ({
    id: n.id,
    user_id: userId,
    text: n.text,
    created_at: n.createdAt,
  }))
  if (rows.length > 0) {
    await supabase.from('notes').insert(rows)
  }
}

export async function pushPackingList(
  items: PackingItem[],
  planId: string,
  userId: string
): Promise<void> {
  if (!isConfigured() || !supabase) return
  await supabase.from('packing_items').delete().eq('plan_id', planId).eq('user_id', userId)
  const rows = items.map((p) => ({
    id: p.id,
    plan_id: planId,
    user_id: userId,
    text: p.text,
    category: p.category,
    packed: p.packed,
    created_at: p.createdAt,
  }))
  if (rows.length > 0) {
    await supabase.from('packing_items').insert(rows)
  }
}

// ── Pull Supabase → local state ───────────────────────────────────────────────

export async function pullFromSupabase(userId: string): Promise<Partial<AppState & { packingList: PackingItem[] }> | null> {
  if (!isConfigured() || !supabase) return null

  const [plansRes, mealsRes, groceryRes, notesRes] = await Promise.all([
    supabase.from('plans').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(1),
    supabase.from('meals').select('*').eq('user_id', userId),
    supabase.from('grocery_items').select('*').eq('user_id', userId),
    supabase.from('notes').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ])

  if (plansRes.error || !plansRes.data?.length) return null
  const planRow = plansRes.data[0]

  const plan = {
    id: planRow.id,
    name: planRow.name,
    startDate: planRow.start_date,
    endDate: planRow.end_date,
    isPublic: planRow.is_public,
    days: planRow.days,
    createdAt: planRow.created_at,
    updatedAt: planRow.updated_at,
  }

  const meals: AppState['meals'] = {}
  for (const row of mealsRes.data ?? []) {
    meals[row.data.id] = row.data
  }

  const groceryList = (groceryRes.data ?? []).map((r: { data: GroceryItem }) => r.data)

  const notes = (notesRes.data ?? []).map((r: { id: string; text: string; created_at: string }) => ({
    id: r.id,
    text: r.text,
    createdAt: r.created_at,
  }))

  const packingRes = await supabase
    .from('packing_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  const packingList = (packingRes.data ?? []).map((r: {
    id: string; text: string; category: string; packed: boolean; created_at: string
  }) => ({
    id: r.id,
    text: r.text,
    category: r.category as PackingCategory,
    packed: r.packed,
    createdAt: r.created_at,
  }))

  return { plan, meals, groceryList, notes, packingList }
}

// ── Realtime subscriptions ────────────────────────────────────────────────────

export function subscribeToRealtime(
  planId: string,
  userId: string,
  onPlanChange: () => void,
  onMealChange: () => void,
  onGroceryChange: () => void,
  onNoteChange: () => void
): RealtimeUnsub {
  if (!isConfigured() || !supabase) return () => {}

  const channel = supabase
    .channel(`leisurely:${planId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'plans', filter: `id=eq.${planId}` }, onPlanChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'meals', filter: `plan_id=eq.${planId}` }, onMealChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'grocery_items', filter: `plan_id=eq.${planId}` }, onGroceryChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${userId}` }, onNoteChange)
    .subscribe()

  return () => { supabase?.removeChannel(channel) }
}
