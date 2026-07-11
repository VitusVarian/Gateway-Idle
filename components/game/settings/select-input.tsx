'use client'

import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  label: string
  value: string
}

interface SelectInputProps {
  id: string
  label: string
  description?: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}

export function SelectInput({
  id,
  label,
  description,
  value,
  options,
  onChange,
}: SelectInputProps) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {description ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="relative w-full sm:w-52">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full appearance-none rounded-md border border-border bg-input px-3 py-2 pr-9',
            'text-sm text-foreground shadow-sm',
            'focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40',
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  )
}
