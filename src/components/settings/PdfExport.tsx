import { useState } from 'react'
import { usePlanStore } from '../../stores/planStore'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import type { PDFExportOptions } from '../../lib/pdf'

type ExportMode = 'both' | 'plan' | 'grocery' | 'mine'

export function PdfExport() {
  const plan = usePlanStore((s) => s.plan)
  const exportState = usePlanStore((s) => s.exportState)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<ExportMode>('both')
  const [myNames, setMyNames] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const { exportToPDF } = await import('../../lib/pdf')
      const names = myNames.split(',').map((s) => s.trim()).filter(Boolean)
      const opts: PDFExportOptions = {
        includePlan: mode !== 'grocery',
        includeGrocery: mode !== 'plan',
        filterAssignees: mode === 'mine' && names.length ? names : undefined,
      }
      exportToPDF(exportState(), opts)
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const MODES: { value: ExportMode; label: string; desc: string }[] = [
    { value: 'both', label: 'Meal plan + grocery list', desc: 'Full export — both sections' },
    { value: 'plan', label: 'Meal plan only', desc: 'Just the day-by-day meal grid' },
    { value: 'grocery', label: 'Grocery list only', desc: 'Just the ingredient list' },
    { value: 'mine', label: 'My assignments only', desc: 'Filter to meals & items assigned to me' },
  ]

  return (
    <>
      <div className="bg-white rounded-card shadow-card p-5 space-y-3">
        <div>
          <h3 className="font-serif text-base font-semibold text-olive mb-1">Export PDF</h3>
          <p className="text-xs text-olive/60">
            {plan
              ? 'Download a beautifully formatted PDF of your meal plan and grocery list — perfect for printing or sharing offline.'
              : 'Add a trip plan first to export a printable PDF.'}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setOpen(true)}
          disabled={!plan}
          className="w-full justify-center"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2h8l4 4v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="7" y1="14" x2="13" y2="14" />
          </svg>
          Download PDF
        </Button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Export options">
        <div className="space-y-4">
          <p className="text-xs text-olive/60">Choose what to include in your PDF export.</p>

          <div className="space-y-2">
            {MODES.map(({ value, label, desc }) => (
              <label key={value} className="flex items-start gap-3 cursor-pointer rounded-card p-3 hover:bg-cream transition-colors">
                <input
                  type="radio"
                  name="export-mode"
                  value={value}
                  checked={mode === value}
                  onChange={() => setMode(value)}
                  className="mt-0.5 text-sage focus:ring-sage"
                />
                <div>
                  <p className="text-sm font-medium text-olive">{label}</p>
                  <p className="text-xs text-olive/50">{desc}</p>
                </div>
              </label>
            ))}
          </div>

          {mode === 'mine' && (
            <div>
              <label className="text-xs font-medium text-olive block mb-1" htmlFor="my-names">
                Your name(s) — comma-separated if part of a group
              </label>
              <input
                id="my-names"
                className="w-full rounded-card border border-olive/20 bg-white px-3 py-1.5 text-sm text-olive placeholder:text-olive/40 focus:border-sage focus:ring-1 focus:ring-sage focus:outline-none"
                placeholder="e.g. Alex, Team A"
                value={myNames}
                onChange={(e) => setMyNames(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleExport} disabled={loading}>
              {loading ? 'Generating…' : 'Export'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
