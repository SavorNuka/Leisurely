import { useRef } from 'react'
import { useExportImport } from '../../hooks/useExportImport'
import { Button } from '../ui/Button'

export function ExportImport() {
  const { handleExport, handleImport } = useExportImport()
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="bg-white rounded-card shadow-card p-5 space-y-5">
      <div>
        <h3 className="font-serif text-base font-semibold text-olive mb-1">Backup & Restore</h3>
        <p className="text-xs text-olive/60">
          Export your plan as a JSON file to keep a backup or share with someone. Import to restore a previous plan.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="primary" onClick={handleExport} className="flex-1 justify-center">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3v10M6 9l4 4 4-4" />
            <path d="M3 15v1a2 2 0 002 2h10a2 2 0 002-2v-1" />
          </svg>
          Export JSON
        </Button>
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="flex-1 justify-center">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 17V7M6 11l4-4 4 4" />
            <path d="M3 15v1a2 2 0 002 2h10a2 2 0 002-2v-1" />
          </svg>
          Import JSON
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
      </div>

    </div>
  )
}
