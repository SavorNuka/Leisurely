import { useState } from 'react'
import { ExportImport } from './ExportImport'
import { SharePlan } from './SharePlan'
import { PdfExport } from './PdfExport'
import { usePlan } from '../../hooks/usePlan'
import { useTour } from '../tour/TourProvider'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

export function SettingsPage() {
  const { plan, clearPlan } = usePlan()
  const { startTour } = useTour()
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <div className="py-6 space-y-5">
      <h2 className="text-lg font-serif font-semibold text-olive">Settings</h2>

      <SharePlan />
      <PdfExport />
      <ExportImport />

      {/* Tour */}
      <div className="bg-white rounded-card shadow-card p-5 space-y-3">
        <div>
          <h3 className="font-serif text-base font-semibold text-olive mb-1">App Tour</h3>
          <p className="text-xs text-olive/60">
            Get a quick guided walkthrough of every feature in Leisurely.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            localStorage.removeItem('leisurely:tour_seen')
            startTour()
          }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="8" />
            <path d="M10 6v4l2.5 2.5" />
          </svg>
          Take a tour
        </Button>
      </div>

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
