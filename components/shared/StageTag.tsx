import { STAGE_META, STAGE_COLORS } from '@/types'
import { cn } from '@/lib/utils'

interface StageTagProps {
  stage: number
  showName?: boolean
  size?: 'sm' | 'md'
}

export function StageTag({ stage, showName = true, size = 'sm' }: StageTagProps) {
  const meta = STAGE_META[stage]
  const color = STAGE_COLORS[stage] || 'bg-slate-500'

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      `${color}/20`,
    )}>
      <span className={cn('rounded-full', color, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      <span className={cn(color.replace('bg-', 'text-').replace('-500', '-400').replace('-600', '-400'))}>
        {showName ? `${stage}. ${meta?.name ?? 'Unknown'}` : `Stage ${stage}`}
      </span>
    </span>
  )
}
