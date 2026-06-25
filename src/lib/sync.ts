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
  userId: string,
  planId?: string,
  displayName?: string
): Promise<void> {
  if (!isConfigured() || !supabase) return

  await supabase.from('notes').delete().eq('user_id', userId)
  const rows = notes.map((n) => ({
    id: n.id,
    user_id: userId,
    plan_id: planId ?? null,
    text: n.text,
    created_at: n.createdAt,
    author_name: n.authorName ?? displayName ?? null,
  }))
  if (rows.length > 0) {
    await supabase.from('notes').insert(rows)
  }

  const noteIds = notes.map((n) => n.id)
  if (noteIds.length > 0) {
    await supabase.from('note_replies').delete().in('note_id', noteIds)
    const replyRows = notes.flatMap((n) =>
      (n.replies ?? []).map((r) => ({
        id: r.id,
        note_id: n.id,
        user_id: userId,
        text: r.text,
        created_at: r.createdAt,
        author_name: r.authorName ?? displayName ?? null,
      }))
    )
    if (replyRows.length > 0) {
      await supabase.from('note_replies').insert(replyRows)
    }
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

// ── Note likes ────────────────────────────────────────────────────────────────

export async function toggleNoteLike(
  noteId: string,
  userId: string,
  currentlyLiked: boolean
): Promise<void> {
  if (!isConfigured() || !supabase) return
  if (currentlyLiked) {
    await supabase.from('note_likes').delete().eq('note_id', noteId).eq('user_id', userId)
  } else {
    await supabase.from('note_likes').insert({ note_id: noteId, user_id: userId })
  }
}

// ── Plan collaboration ────────────────────────────────────────────────────────

export async function addCollaborator(
  planId: string,
  targetUserId: string,
  invitedBy: string,
  role: 'editor' | 'viewer' = 'editor'
): Promise<{ error: string | null }> {
  if (!isConfigured() || !supabase) return { error: 'Supabase not configured' }
  const { error } = await supabase.from('plan_collaborators').upsert({
    plan_id: planId,
    user_id: targetUserId,
    invited_by: invitedBy,
    role,
  })
  return { error: error?.message ?? null }
}

export async function removeCollaborator(planId: string, targetUserId: string): Promise<void> {
  if (!isConfigured() || !supabase) return
  await supabase.from('plan_collaborators').delete().eq('plan_id', planId).eq('user_id', targetUserId)
}

export async function getCollaborators(
  planId: string
): Promise<Array<{ userId: string; role: string; joinedAt: string }>> {
  if (!isConfigured() || !supabase) return []
  const { data } = await supabase
    .from('plan_collaborators')
    .select('user_id, role, joined_at')
    .eq('plan_id', planId)
  return (data ?? []).map((r: { user_id: string; role: string; joined_at: string }) => ({
    userId: r.user_id,
    role: r.role,
    joinedAt: r.joined_at,
  }))
}

// ── Pull Supabase → local state ───────────────────────────────────────────────

export async function pullFromSupabase(
  userId: string
): Promise<Partial<AppState & { packingList: PackingItem[] }> | null> {
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

  // Pull replies and likes for these notes in parallel
  const noteIds = (notesRes.data ?? []).map((r: { id: string }) => r.id)
  const [repliesRes, likesRes] = await Promise.all([
    noteIds.length > 0
      ? supabase.from('note_replies').select('*').in('note_id', noteIds).order('created_at', { ascending: true })
      : Promise.resolve({ data: [] as unknown[] }),
    noteIds.length > 0
      ? supabase.from('note_likes').select('note_id, user_id').in('note_id', noteIds)
      : Promise.resolve({ data: [] as unknown[] }),
  ])

  const repliesByNoteId: Record<string, Array<{ id: string; text: string; createdAt: string; authorName?: string }>> = {}
  for (const r of repliesRes.data ?? []) {
    const row = r as { id: string; note_id: string; text: string; created_at: string; author_name?: string }
    if (!repliesByNoteId[row.note_id]) repliesByNoteId[row.note_id] = []
    repliesByNoteId[row.note_id].push({ id: row.id, text: row.text, createdAt: row.created_at, authorName: row.author_name ?? undefined })
  }

  const likeCountByNoteId: Record<string, number> = {}
  const likedByMeSet = new Set<string>()
  for (const r of likesRes.data ?? []) {
    const row = r as { note_id: string; user_id: string }
    likeCountByNoteId[row.note_id] = (likeCountByNoteId[row.note_id] ?? 0) + 1
    if (row.user_id === userId) likedByMeSet.add(row.note_id)
  }

  const notes = (notesRes.data ?? []).map((r: { id: string; text: string; created_at: string; author_name?: string }) => ({
    id: r.id,
    text: r.text,
    createdAt: r.created_at,
    likes: likeCountByNoteId[r.id] ?? 0,
    likedByMe: likedByMeSet.has(r.id),
    replies: repliesByNoteId[r.id] ?? [],
    authorName: r.author_name ?? undefined,
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

// ── Invites ───────────────────────────────────────────────────────────────────

export async function sendInvites(
  planId: string,
  planName: string,
  inviterName: string,
  emails: string[],
  planDates?: { startDate: string; endDate: string }
): Promise<{ error: string | null }> {
  if (!isConfigured() || !supabase) return { error: 'Supabase not configured' }
  const { error } = await supabase.functions.invoke('invite-collaborator', {
    body: { planId, planName, inviterName, emails, ...planDates },
  })
  return { error: error?.message ?? null }
}

export async function processInvite(
  token: string,
  userId: string
): Promise<{ planId: string | null; error: string | null }> {
  if (!isConfigured() || !supabase) return { planId: null, error: 'Supabase not configured' }

  const { data: invite, error: fetchError } = await supabase
    .from('plan_invites')
    .select('id, plan_id, expires_at, accepted_at')
    .eq('token', token)
    .single()

  if (fetchError || !invite) return { planId: null, error: 'Invite not found or already used.' }
  if (invite.accepted_at) return { planId: null, error: 'This invite has already been accepted.' }
  if (new Date(invite.expires_at) < new Date()) return { planId: null, error: 'This invite has expired.' }

  await supabase.from('plan_collaborators').upsert({
    plan_id: invite.plan_id,
    user_id: userId,
    invited_by: null,
    role: 'editor',
  })

  await supabase
    .from('plan_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  return { planId: invite.plan_id, error: null }
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
    .on('postgres_changes', { event: '*', schema: 'public', table: 'note_replies' }, onNoteChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'note_likes' }, onNoteChange)
    .subscribe()

  return () => { supabase?.removeChannel(channel) }
}

// ── Collaborator roster with profiles ────────────────────────────────────────

export async function getCollaboratorsWithProfiles(
  planId: string
): Promise<Array<{ userId: string; role: string; joinedAt: string; displayName: string | null }>> {
  if (!isConfigured() || !supabase) return []
  const { data } = await supabase
    .from('plan_collaborators')
    .select('user_id, role, joined_at, profiles(display_name)')
    .eq('plan_id', planId)
  return (data ?? []).map((r) => {
    const profile = r.profiles
    const displayName = Array.isArray(profile)
      ? (profile[0]?.display_name ?? null)
      : (profile as { display_name: string | null } | null)?.display_name ?? null
    return {
      userId: r.user_id as string,
      role: r.role as string,
      joinedAt: r.joined_at as string,
      displayName,
    }
  })
}

export async function getPendingInvites(
  planId: string
): Promise<Array<{ id: string; email: string; expiresAt: string }>> {
  if (!isConfigured() || !supabase) return []
  const { data } = await supabase
    .from('plan_invites')
    .select('id, email, expires_at')
    .eq('plan_id', planId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
  return (data ?? []).map((r: { id: string; email: string; expires_at: string }) => ({
    id: r.id,
    email: r.email,
    expiresAt: r.expires_at,
  }))
}

export async function deleteInvite(inviteId: string): Promise<void> {
  if (!isConfigured() || !supabase) return
  await supabase.from('plan_invites').delete().eq('id', inviteId)
}

export async function updateDisplayName(userId: string, displayName: string): Promise<void> {
  if (!isConfigured() || !supabase) return
  await supabase.from('profiles').upsert({ id: userId, display_name: displayName })
}
