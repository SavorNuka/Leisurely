import { useState } from 'react'
import { ExportImport } from './ExportImport'
import { usePlan } from '../../hooks/usePlan'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

export function SettingsPage() {
  const { plan, clearPlan } = usePlan()
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <div className="py-6 space-y-5">
      <h2 className="text-lg font-serif font-semibold text-olive">Settings</h2>

      <ExportImport />

      {plan && (
        <div className="bg-white rounded-card shadow-card p-5 space-y-3">
          <div>
            <h3 className="font-serif text-base font-semibold text-olive mb-1">Danger Zone</h3>
            <p className="text-xs text-olive/60">
              Permanently delete your current plan and all meal data.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setConfirmClear(true)}>
            Clear all data
          </Button>
        </div>
      )}

      <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title="Clear all data?">
        <div className="space-y-4">
          <p className="text-sm text-olive/70">
            This will permanently delete your plan, all meals, and your grocery list. Export a backup first if you want to keep the data.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearPlan()
                setConfirmClear(false)
              }}
            >
              Yes, clear everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
