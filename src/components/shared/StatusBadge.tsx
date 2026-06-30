import { cn } from '@/lib/utils'
import { STATUS_CONFIG, type FolioStatus } from '@/types'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'

const ICONS = {
  complete: CheckCircle2,
  incomplete: AlertCircle,
  pending: Clock,
}

interface StatusBadgeProps {
  status: FolioStatus
  size?: 'sm' | 'md'
  className?: string
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = ICONS[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        config.color,
        config.bg,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {config.label}
    </span>
  )
}
