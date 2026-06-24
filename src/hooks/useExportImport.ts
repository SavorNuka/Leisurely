import { usePlanStore } from '../stores/planStore'
import { downloadJSON, parseState } from '../lib/exportImport'
import { toast } from './useToast'

export function useExportImport() {
  const exportState = usePlanStore((s) => s.exportState)
  const importState = usePlanStore((s) => s.importState)

  function handleExport() {
    downloadJSON(exportState())
    toast('Backup saved')
  }

  function handleImport(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = parseState(e.target?.result as string)
        importState(parsed)
        toast('Plan imported')
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Import failed', 'error')
      }
    }
    reader.readAsText(file)
  }

  return { handleExport, handleImport }
}
