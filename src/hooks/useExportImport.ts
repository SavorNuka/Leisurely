import { useState } from 'react'
import { usePlanStore } from '../stores/planStore'
import { downloadJSON, parseState } from '../lib/exportImport'

export function useExportImport() {
  const exportState = usePlanStore((s) => s.exportState)
  const importState = usePlanStore((s) => s.importState)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)

  function handleExport() {
    downloadJSON(exportState())
  }

  function handleImport(file: File) {
    setImportError(null)
    setImportSuccess(false)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = parseState(e.target?.result as string)
        importState(parsed)
        setImportSuccess(true)
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Import failed')
      }
    }
    reader.readAsText(file)
  }

  return { handleExport, handleImport, importError, importSuccess }
}
