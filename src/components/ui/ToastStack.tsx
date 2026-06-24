import { AnimatePresence, motion } from 'framer-motion'
import { useToastStore } from '../../hooks/useToast'

const TYPE_STYLES = {
  success: 'border-l-sage bg-white',
  info: 'border-l-olive/60 bg-white',
  error: 'border-l-red-400 bg-white',
}

export function ToastStack() {
  const toasts = useToastStore((s) => s.toasts)
  const remove = useToastStore((s) => s.remove)

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none md:top-4 md:right-4 left-4 md:left-auto">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`pointer-events-auto flex items-center gap-3 rounded-card shadow-card border-l-4 px-4 py-3 max-w-xs w-full ${TYPE_STYLES[toast.type]}`}
          >
            <span className="flex-1 text-sm text-olive">{toast.message}</span>
            <button
              type="button"
              onClick={() => remove(toast.id)}
              className="shrink-0 text-olive/30 hover:text-olive/60 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                <line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/>
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
