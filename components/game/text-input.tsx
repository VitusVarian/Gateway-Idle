'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

/** Labeled text input with inline validation messaging. */
export function TextInput({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: TextInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors',
          'placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring',
          error ? 'border-destructive' : 'border-border hover:border-muted-foreground/50',
          className,
        )}
        {...props}
      />
      {error ? (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="mt-1.5 text-xs font-medium text-destructive"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
