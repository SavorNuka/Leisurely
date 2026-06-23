import { motion } from 'framer-motion'

interface EmptyStateProps {
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
    >
      <svg
        aria-hidden="true"
        className="mb-4 h-16 w-16 text-sage/50"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="32" y1="56" x2="32" y2="20" />
        <path d="M32 44 C24 40, 18 32, 22 26 C26 20, 32 26, 32 30" />
        <path d="M32 38 C40 34, 46 26, 42 20 C38 14, 32 20, 32 24" />
        <path d="M32 50 C26 48, 20 44, 22 40" />
        <path d="M32 50 C38 48, 44 44, 42 40" />
      </svg>
      <h3 className="font-serif text-xl font-semibold text-olive mb-2">{title}</h3>
      <p className="text-sm text-olive/60 max-w-xs mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 rounded-card bg-sage px-5 py-2.5 text-sm font-medium text-white hover:bg-sage-dark active:scale-[0.97] transform transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  )
}
