import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePlanStore } from '../../stores/planStore'
import { getCollaboratorsWithProfiles, getPendingInvites, removeCollaborator, deleteInvite } from '../../lib/sync'
import { InviteModal } from '../planner/InviteModal'
import { Button } from '../ui/Button'

function avatarHue(name: string) {
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return sum % 360
}

interface Collab {
  userId: string
  role: string
  joinedAt: string
  displayName: string | null
}

interface Invite {
  id: string
  email: string
  expiresAt: string
}

export function CollaboratorRoster() {
  const { user, isConfigured } = useAuth()
  const plan = usePlanStore((s) => s.plan)
  const [collabs, setCollabs] = useState<Collab[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [inviteOpen, setInviteOpen] = useState(false)

  const reload = useCallback(async () => {
    if (!plan) return
    const [c, i] = await Promise.all([
      getCollaboratorsWithProfiles(plan.id),
      getPendingInvites(plan.id),
    ])
    setCollabs(c)
    setInvites(i)
  }, [plan])

  useEffect(() => { reload() }, [reload])

  if (!isConfigured || !user || !plan) return null

  async function handleRemoveCollab(userId: string) {
    if (!plan) return
    await removeCollaborator(plan.id, userId)
    setCollabs((prev) => prev.filter((c) => c.userId !== userId))
  }

  async function handleDeleteInvite(id: string) {
    await deleteInvite(id)
    setInvites((prev) => prev.filter((i) => i.id !== id))
  }

  if (collabs.length === 0 && invites.length === 0) return null

  return (
    <>
      <div className="bg-white rounded-card shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base font-semibold text-olive">Collaborators</h3>
          <Button variant="ghost" size="sm" onClick={() => setInviteOpen(true)}>+ Invite</Button>
        </div>

        <div className="divide-y divide-olive/10">
          {collabs.map((c, idx) => {
            const label = c.displayName ?? `Member ${idx + 1}`
            const isMe = c.userId === user.id
            const isOwner = c.role === 'owner'
            const hue = avatarHue(label)
            return (
              <div key={c.userId} className="flex items-center gap-3 py-2">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                  style={{ backgroundColor: `hsl(${hue}, 45%, 55%)` }}
                >
                  {label[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-olive truncate">
                    {label}{isMe ? ' (you)' : ''}
                  </p>
                  {!c.displayName && !isMe && (
                    <p className="text-xs text-olive/35">Ask them to set a display name in Settings</p>
                  )}
                </div>
                <span className="text-xs text-olive/40 capitalize shrink-0">{c.role}</span>
                {!isOwner && !isMe && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCollab(c.userId)}
                    className="text-olive/25 hover:text-red-400 transition-colors p-1 rounded shrink-0"
                    aria-label="Remove collaborator"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                      <line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/>
                    </svg>
                  </button>
                )}
              </div>
            )
          })}

          {invites.map((inv) => (
            <div key={inv.id} className="flex items-center gap-3 py-2">
              <div className="h-8 w-8 rounded-full bg-olive/10 flex items-center justify-center shrink-0">
                <span className="text-olive/30 text-xs">·</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-olive/60 truncate">{inv.email}</p>
                <p className="text-xs text-olive/30">Invited (pending)</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteInvite(inv.id)}
                className="text-olive/25 hover:text-red-400 transition-colors p-1 rounded shrink-0"
                aria-label="Cancel invite"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                  <line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {inviteOpen && (
        <InviteModal
          open={inviteOpen}
          onClose={() => { setInviteOpen(false); reload() }}
          planId={plan.id}
          planName={plan.name}
          planStart={plan.startDate ?? undefined}
          planEnd={plan.endDate ?? undefined}
          onConfirm={() => { setInviteOpen(false); reload() }}
        />
      )}
    </>
  )
}
