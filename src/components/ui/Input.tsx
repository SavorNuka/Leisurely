import { type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-olive">
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={`rounded-card border border-olive/20 bg-white px-3 py-2 text-sm text-olive placeholder:text-olive/40 focus:border-sage focus:ring-1 focus:ring-sage focus:outline-none ${className}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, id, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-olive">
          {label}
        </label>
      )}
      <textarea
        id={id}
        {...props}
        className={`rounded-card border border-olive/20 bg-white px-3 py-2 text-sm text-olive placeholder:text-olive/40 focus:border-sage focus:ring-1 focus:ring-sage focus:outline-none resize-none ${className}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
