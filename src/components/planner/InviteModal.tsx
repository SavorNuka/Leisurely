import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { sendInvites } from '../../lib/sync'
import { useAuth } from '../../hooks/useAuth'
import { toast } from '../../hooks/useToast'

interface InviteModalProps {
  open: boolean
  onClose: () => void
  planId: string
  planName: string
  planStart?: string
  planEnd?: string
  onConfirm: () => void
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())
}

export function InviteModal({ open, onClose, planId, planName, planStart, planEnd, onConfirm }: InviteModalProps) {
  const { user, displayName } = useAuth()
  const [emailsRaw, setEmailsRaw] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSend() {
    const emails = emailsRaw
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter(Boolean)

    const invalid = emails.filter((e) => !isValidEmail(e))
    if (emails.length === 0) {
      setError('Enter at least one email address.')
      return
    }
    if (invalid.length > 0) {
      setError(`Invalid email${invalid.length > 1 ? 's' : ''}: ${invalid.join(', ')}`)
      return
    }

    setSending(true)
    setError(null)

    const inviterName = displayName ?? 'Someone'
    const { error: sendError } = await sendInvites(
      planId, planName, inviterName, emails,
      planStart && planEnd ? { startDate: planStart, endDate: planEnd } : undefined
    )

    setSending(false)

    if (sendError) {
      setError(sendError)
      return
    }

    toast('Invites sent')
    setSent(true)
  }

  function handleDone() {
    onConfirm()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite people to your trip">
      <div className="space-y-4">
        {sent ? (
          <div className="py-4 text-center space-y-4">
            <div className="h-10 w-10 rounded-full bg-sage/15 flex items-center justify-center mx-auto">
              <svg className="h-5 w-5 text-sage" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 10 8 14 16 6" />
              </svg>
            </div>
            <p className="text-sm font-medium text-olive">Invites sent!</p>
            <p className="text-xs text-olive/60">Your group will receive an email with a link to join <strong>{planName}</strong>.</p>
            <div className="flex justify-center">
              <Button variant="primary" onClick={handleDone}>Done</Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-olive/70">
              Enter email addresses below — one per line or comma-separated. Each person will receive a personal invite to <strong>{planName}</strong>.
            </p>

            <textarea
              autoFocus
              value={emailsRaw}
              onChange={(e) => { setEmailsRaw(e.target.value); setError(null) }}
              placeholder={'family@example.com\nfriend@example.com'}
              rows={4}
              className="w-full rounded-card border border-olive/20 bg-cream px-3 py-2 text-sm text-olive placeholder:text-olive/35 focus:border-sage focus:ring-1 focus:ring-sage focus:outline-none resize-none font-mono"
            />

            {error && <p className="text-xs text-red-500 bg-red-50 rounded-card px-3 py-2">{error}</p>}

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose} disabled={sending}>Cancel</Button>
              <Button variant="primary" onClick={handleSend} disabled={sending || !emailsRaw.trim()}>
                {sending ? 'Sending…' : 'Send invites'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
