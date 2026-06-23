import { useState } from 'react'
import { usePlanStore } from '../../stores/planStore'
import { Button } from '../ui/Button'

export function PdfExport() {
  const plan = usePlanStore((s) => s.plan)
  const exportState = usePlanStore((s) => s.exportState)
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const { exportToPDF } = await import('../../lib/pdf')
      exportToPDF(exportState())
    } finally {
      setLoading(false)
    }
  }

  return (
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
        onClick={handleExport}
        disabled={loading || !plan}
        className="w-full justify-center"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2h8l4 4v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="7" y1="14" x2="13" y2="14" />
        </svg>
        {loading ? 'Generating…' : 'Download PDF'}
      </Button>
    </div>
  )
}
