import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { updateDisplayName } from '../../lib/sync'
import { toast } from '../../hooks/useToast'
import { Button } from '../ui/Button'

export function ProfileCard() {
  const { user, displayName, signOut, isConfigured } = useAuth()
  const [nameInput, setNameInput] = useState(displayName ?? '')
  const [saving, setSaving] = useState(false)

  if (!isConfigured || !user) return null

  async function saveName() {
    if (!user || nameInput.trim() === displayName) return
    setSaving(true)
    try {
      await updateDisplayName(user.id, nameInput.trim())
      toast('Profile updated')
    } catch {
      toast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const initial = (displayName ?? user.email ?? '?')[0].toUpperCase()

  return (
    <div className="bg-white rounded-card shadow-card p-5 space-y-4">
      <h3 className="font-serif text-base font-semibold text-olive">Your Profile</h3>

      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-sage flex items-center justify-center text-cream font-semibold text-sm shrink-0">
          {initial}
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <label className="text-xs text-olive/50 block mb-1" htmlFor="display-name">Display name</label>
            <div className="flex gap-2">
              <input
                id="display-name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveName() }}
                onBlur={saveName}
                placeholder="Your name"
                className="flex-1 rounded-lg border border-olive/20 bg-cream/50 px-3 py-1.5 text-sm text-olive placeholder:text-olive/30 focus:border-sage focus:ring-1 focus:ring-sage focus:outline-none"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={saveName}
                disabled={saving || nameInput.trim() === displayName}
              >
                Save
              </Button>
            </div>
          </div>
          <p className="text-xs text-olive/50">{user.email}</p>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Sign out →
          </Button>
        </div>
      </div>
    </div>
  )
}
