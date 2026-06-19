interface BadgeProps {
  label: string
  variant?: 'sage' | 'terracotta' | 'olive'
  onRemove?: () => void
}

const variantClasses = {
  sage: 'bg-sage/15 text-sage-dark',
  terracotta: 'bg-terracotta/15 text-terracotta-dark',
  olive: 'bg-olive/10 text-olive',
}

export function Badge({ label, variant = 'sage', onRemove }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]}`}>
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 focus:outline-none"
          aria-label={`Remove ${label}`}
        >
          <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="currentColor">
            <path d="M6.414 5l2.293-2.293a1 1 0 10-1.414-1.414L5 3.586 2.707 1.293a1 1 0 00-1.414 1.414L3.586 5 1.293 7.293a1 1 0 101.414 1.414L5 6.414l2.293 2.293a1 1 0 001.414-1.414L6.414 5z" />
          </svg>
        </button>
      )}
    </span>
  )
}
