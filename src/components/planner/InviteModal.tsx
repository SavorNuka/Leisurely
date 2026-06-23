import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { sendInvites } from '../../lib/sync'
import { useAuth } from '../../hooks/useAuth'

interface InviteModalProps {
  open: boolean
  onClose: () => void
  planId: string
  planName: string
  onConfirm: () => void
}

export function InviteModal({ open, onClose, planId, planName, onConfirm }: InviteModalProps) {
  const { user, displayName } = useAuth()
  const [emailsRaw, setEmailsRaw] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSend() {
    const emails = emailsRaw
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter((e) => e.includes('@'))

    if (emails.length === 0) {
      setError('Enter at least one valid email address.')
      return
    }

    setSending(true)
    setError(null)

    const inviterName = displayName ?? user?.email ?? 'Someone'
    const { error: sendError } = await sendInvites(planId, planName, inviterName, emails)

    setSending(false)

    if (sendError) {
      setError(sendError)
      return
    }

    setSent(true)
    setTimeout(() => {
      onConfirm()
      onClose()
    }, 1500)
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite people to your trip">
      <div className="space-y-4">
        {sent ? (
          <div className="py-4 text-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-sage/15 flex items-center justify-center mx-auto">
              <svg className="h-5 w-5 text-sage" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 10 8 14 16 6" />
              </svg>
            </div>
            <p className="text-sm font-medium text-olive">Invites sent!</p>
            <p className="text-xs text-olive/60">Your group will receive an email with a link to join.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-olive/70">
              Enter email addresses below — one per line or comma-separated. Each person will receive a personal invite to <strong>{planName}</strong>.
            </p>

            <textarea
              autoFocus
              value={emailsRaw}
              onChange={(e) => setEmailsRaw(e.target.value)}
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
