import { useState, useRef } from 'react'
import { usePlanStore } from '../../stores/planStore'
import { usePlan } from '../../hooks/usePlan'
import { useAuth } from '../../hooks/useAuth'
import { useExportImport } from '../../hooks/useExportImport'
import { useTripHistory } from '../../hooks/useTripHistory'
import { DateRangePicker } from './DateRangePicker'
import { MealGrid } from './MealGrid'
import { DietaryFilter } from './DietaryFilter'
import { InviteModal } from './InviteModal'
import { TripSwitcher } from './TripSwitcher'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'

export function PlannerPage() {
  const plan = usePlanStore((s) => s.plan)
  const { createNewPlan } = usePlan()
  const { user, displayName } = useAuth()
  const { handleImport } = useExportImport()
  const [newName, setNewName] = useState('')
  const [joinToken, setJoinToken] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { stubs } = useTripHistory()

  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const greetingLine = displayName ? `${timeGreeting}, ${displayName}` : timeGreeting

  function handleCreate() {
    createNewPlan(newName.trim() || 'My Trip')
  }

  function handleCreateWithInvite() {
    const id = createNewPlan(newName.trim() || 'My Trip')
    setPendingPlanId(id)
    setInviteOpen(true)
  }

  function closeInvite() {
    setInviteOpen(false)
    setPendingPlanId(null)
  }

  const invitePlanId = pendingPlanId ?? plan?.id
  const invitePlanName = plan?.name ?? (newName.trim() || 'My Trip')

  return (
    <>
      {!plan ? (
        <div className="py-8 space-y-6">
          {user && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-base font-serif font-medium text-olive/70"
            >
              {greetingLine} 🌿
            </motion.p>
          )}

          {stubs.length > 0 && (
            <div className="flex items-center gap-3">
              <TripSwitcher trigger="button" />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Start a new trip */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: 0.05 }}
              className="bg-white rounded-card shadow-card p-5 space-y-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">✈️</span>
                <h3 className="font-serif font-semibold text-olive">Start a new trip</h3>
              </div>
              <Input
                id="new-plan-name"
                label="Trip name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Tuscany Summer 2026"
                onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) handleCreate() }}
              />
              <div className="flex flex-col gap-2">
                <Button variant="primary" className="w-full justify-center" onClick={handleCreate}>
                  Create trip
                </Button>
                {user && (
                  <Button variant="ghost" className="w-full justify-center" onClick={handleCreateWithInvite}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.97 5.97 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.97 5.97 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                    </svg>
                    Plan with others
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Join a trip */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: 0.1 }}
              className="bg-white rounded-card shadow-card p-5 space-y-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">🤝</span>
                <h3 className="font-serif font-semibold text-olive">Join a trip</h3>
              </div>
              <Input
                id="join-token"
                label="Invite link or code"
                value={joinToken}
                onChange={(e) => setJoinToken(e.target.value)}
                placeholder="Paste invite link or short code"
              />
              <Button
                variant="secondary"
                className="w-full justify-center"
                disabled={!joinToken.trim()}
                onClick={() => {
                  const token = joinToken.trim().split('/').pop() ?? joinToken.trim()
                  window.location.href = `/join/${encodeURIComponent(token)}`
                }}
              >
                Join trip
              </Button>
            </motion.div>

            {/* Import a plan */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: 0.15 }}
              className="bg-white rounded-card shadow-card p-5 space-y-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">📂</span>
                <h3 className="font-serif font-semibold text-olive">Import a plan</h3>
              </div>
              <p className="text-xs text-olive/60 leading-relaxed">
                Restore a previously exported JSON backup to pick up where you left off.
              </p>
              <Button
                variant="ghost"
                className="w-full justify-center"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 17V7M6 11l4-4 4 4" />
                  <path d="M3 15v1a2 2 0 002 2h10a2 2 0 002-2v-1" />
                </svg>
                Choose JSON file
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImport(file)
                  e.target.value = ''
                }}
              />
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 py-6">
          <div className="flex items-center justify-between">
            {user && (
              <p className="text-sm font-serif font-medium text-olive/60">{greetingLine} 🌿</p>
            )}
            <TripSwitcher trigger="link" />
          </div>
          <DateRangePicker />
          <DietaryFilter />
          <MealGrid days={plan.days} />
        </div>
      )}

      {inviteOpen && invitePlanId && (
        <InviteModal
          open={inviteOpen}
          onClose={closeInvite}
          planId={invitePlanId}
          planName={invitePlanName}
          onConfirm={closeInvite}
        />
      )}
    </>
  )
}
