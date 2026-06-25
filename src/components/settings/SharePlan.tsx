import { useState } from 'react'
import { usePlanStore } from '../../stores/planStore'
import { encodeShareLink } from '../../lib/shareLink'
import { Button } from '../ui/Button'
import { toast } from '../../hooks/useToast'
import { InviteModal } from '../planner/InviteModal'
import { isConfigured } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export function SharePlan() {
  const plan = usePlanStore((s) => s.plan)
  const toggleVisibility = usePlanStore((s) => s.togglePlanVisibility)
  const exportState = usePlanStore((s) => s.exportState)
  const [confirmPublic, setConfirmPublic] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const { user } = useAuth()

  function handleCopy() {
    const link = encodeShareLink(exportState())
    navigator.clipboard.writeText(link).then(() => toast('Link copied!'))
  }

  function handleToggle() {
    if (!plan?.isPublic) {
      setConfirmPublic(true)
    } else {
      toggleVisibility()
    }
  }

  const showEmailInvite = isConfigured() && !!user && !!plan

  return (
    <div className="bg-white rounded-card shadow-card p-5 space-y-4">
      <div>
        <h3 className="font-serif text-base font-semibold text-olive mb-1">Share Plan</h3>
        <p className="text-xs text-olive/60">
          {plan
            ? 'Invite people by email or generate a share link.'
            : 'Create a trip plan to share it.'}
        </p>
      </div>

      {plan ? (
        <>
          {/* Section A — Email invite (primary) */}
          {showEmailInvite && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-olive">Invite by email</p>
              <p className="text-xs text-olive/60 leading-relaxed">
                Each person gets a personal, short invite link. They'll be prompted to sign in or create a free account.
              </p>
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => setInviteOpen(true)}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 5.5A1.5 1.5 0 014 4h12a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0116 16H4a1.5 1.5 0 01-1.5-1.5v-9z" />
                  <path d="M2.5 6l7.5 5 7.5-5" />
                </svg>
                Send invitation email
              </Button>
            </div>
          )}

          {/* Divider */}
          {showEmailInvite && (
            <div className="border-t border-olive/10" />
          )}

          {/* Section B — Copy link (secondary) */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-olive">
              {showEmailInvite ? 'Or copy a share link' : 'Copy a share link'}
            </p>
            <p className="text-xs text-olive/60 leading-relaxed">
              Self-contained link — works without an account, but produces a very long URL.
            </p>

            {confirmPublic ? (
              <div className="rounded-card border border-terracotta/30 bg-terracotta/5 p-3 space-y-2">
                <p className="text-xs text-olive font-medium">Make this plan visible to anyone with the link?</p>
                <p className="text-xs text-olive/60">Your meal plan and grocery list will be readable by anyone who has the share link.</p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="primary" onClick={() => { toggleVisibility(); setConfirmPublic(false) }}>Make public</Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmPublic(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-olive">
                    {plan.isPublic ? 'Public' : 'Private'}
                  </p>
                  <p className="text-xs text-olive/50 mt-0.5">
                    {plan.isPublic
                      ? 'This plan is marked as shareable.'
                      : 'Mark as public before sharing.'}
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={plan.isPublic}
                  aria-label={plan.isPublic ? 'Make plan private' : 'Make plan public'}
                  onClick={handleToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 ${plan.isPublic ? 'bg-sage' : 'bg-olive/20'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${plan.isPublic ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </label>
            )}

            <Button
              variant="ghost"
              onClick={handleCopy}
              disabled={!plan.isPublic}
              className="w-full justify-center"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v8.25A2.25 2.25 0 005.25 18.75h8.25A2.25 2.25 0 0015.75 17V8.75M13.5 6l3-3m0 0l-3-3m3 3H8.25" />
              </svg>
              Copy import link
            </Button>

            {!plan.isPublic && (
              <p className="text-xs text-olive/40 text-center">Toggle the plan to Public first.</p>
            )}
          </div>
        </>
      ) : (
        <Button variant="ghost" disabled className="w-full justify-center opacity-40 cursor-not-allowed">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v8.25A2.25 2.25 0 005.25 18.75h8.25A2.25 2.25 0 0015.75 17V8.75M13.5 6l3-3m0 0l-3-3m3 3H8.25" />
          </svg>
          Copy import link
        </Button>
      )}

      {inviteOpen && plan && (
        <InviteModal
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          planId={plan.id}
          planName={plan.name}
          planStart={plan.startDate ?? undefined}
          planEnd={plan.endDate ?? undefined}
          onConfirm={() => setInviteOpen(false)}
        />
      )}
    </div>
  )
}
