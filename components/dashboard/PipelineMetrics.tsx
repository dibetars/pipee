import { TrendingUp, Target, Trophy, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Opportunity } from '@/types'

interface PipelineMetricsProps {
  opportunities: Opportunity[]
}

export function PipelineMetrics({ opportunities }: PipelineMetricsProps) {
  const active = opportunities.filter(o => o.status === 'active')
  const stalled = opportunities.filter(o => o.status === 'stalled')
  const won = opportunities.filter(o => o.status === 'won')
  const lost = opportunities.filter(o => o.status === 'lost')

  const totalPipelineValue = active.reduce((sum, o) => sum + (o.value ?? o.estimated_value ?? 0), 0)
  const hasEstimatesInPipeline = active.some(o => !o.value && o.estimated_value)
  const totalWonValue = won.reduce((sum, o) => sum + (o.value ?? o.estimated_value ?? 0), 0)

  const winRate = won.length + lost.length > 0
    ? Math.round((won.length / (won.length + lost.length)) * 100)
    : 0

  const cards = [
    {
      label: 'Active Pipeline',
      value: `${hasEstimatesInPipeline ? '~' : ''}${formatCurrency(totalPipelineValue)}`,
      sub: `${active.length} active deals${hasEstimatesInPipeline ? ' · incl. estimates' : ''}`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Won This Period',
      value: formatCurrency(totalWonValue),
      sub: `${won.length} deals closed`,
      icon: Trophy,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Win Rate',
      value: `${winRate}%`,
      sub: `${won.length}W / ${lost.length}L`,
      icon: Target,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Stalled Deals',
      value: String(stalled.length),
      sub: 'Need attention',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-xs font-medium">{label}</p>
            <div className={`${bg} p-2 rounded-lg`}>
              <Icon size={14} className={color} />
            </div>
          </div>
          <p className="text-gray-900 text-2xl font-bold">{value}</p>
          <p className="text-gray-400 text-xs mt-1">{sub}</p>
        </div>
      ))}
    </div>
  )
}
