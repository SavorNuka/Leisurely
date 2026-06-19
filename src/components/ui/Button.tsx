import { type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-sage text-white hover:bg-sage-dark active:bg-sage-dark',
  secondary: 'bg-terracotta text-white hover:bg-terracotta-dark active:bg-terracotta-dark',
  ghost: 'bg-transparent text-olive hover:bg-olive/10 active:bg-olive/20',
  danger: 'bg-red-500 text-white hover:bg-red-600',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1.5 rounded-card font-sans font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  )
}
