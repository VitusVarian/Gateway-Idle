import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type CalloutTone = 'info' | 'success' | 'error'

const config: Record<
  CalloutTone,
  { icon: typeof Info; className: string; role: 'status' | 'alert' }
> = {
  info: {
    icon: Info,
    className: 'border-secondary/40 bg-secondary/10 text-secondary',
    role: 'status',
  },
  success: {
    icon: CheckCircle2,
    className: 'border-success/40 bg-success/10 text-success',
    role: 'status',
  },
  error: {
    icon: AlertTriangle,
    className: 'border-destructive/40 bg-destructive/10 text-destructive',
    role: 'alert',
  },
}

export function InfoCallout({
  tone = 'info',
  children,
  className,
}: {
  tone?: CalloutTone
  children: React.ReactNode
  className?: string
}) {
  const { icon: Icon, className: toneClass, role } = config[tone]
  return (
    <div
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      className={cn(
        'flex items-start gap-2 rounded-md border px-3 py-2 text-sm',
        toneClass,
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="leading-relaxed">{children}</div>
    </div>
  )
}
