import { STATUS_COLORS, type OpportunityStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<OpportunityStatus, string> = {
  active: 'Active',
  stalled: 'Stalled',
  won: 'Won',
  lost: 'Lost',
  disqualified: 'Disqualified',
}

export function StatusBadge({ status }: { status: OpportunityStatus }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
      STATUS_COLORS[status]
    )}>
      {STATUS_LABELS[status]}
    </span>
  )
}
