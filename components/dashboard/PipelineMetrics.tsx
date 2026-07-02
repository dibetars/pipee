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

  // Group by currency to avoid mixing GHS + USD totals
  function groupByCurrency(opps: Opportunity[]) {
    const map: Record<string, { total: number; hasEstimate: boolean }> = {}
    for (const o of opps) {
      const amount = o.value ?? o.estimated_value ?? 0
      if (!amount) continue
      const cur = o.currency || 'GHS'
      if (!map[cur]) map[cur] = { total: 0, hasEstimate: false }
      map[cur].total += amount
      if (!o.value && o.estimated_value) map[cur].hasEstimate = true
    }
    return Object.entries(map)
  }

  const activeByCurrency = groupByCurrency(active)
  const wonByCurrency    = groupByCurrency(won)
  const hasEstimatesInPipeline = activeByCurrency.some(([, v]) => v.hasEstimate)

  const winRate = won.length + lost.length > 0
    ? Math.round((won.length / (won.length + lost.length)) * 100)
    : 0

  const cards = [
    {
      label: 'Active Pipeline',
      currencies: activeByCurrency,
      sub: `${active.length} active deal${active.length !== 1 ? 's' : ''}${hasEstimatesInPipeline ? ' · incl. estimates' : ''}`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Won This Period',
      currencies: wonByCurrency,
      sub: `${won.length} deal${won.length !== 1 ? 's' : ''} closed`,
      icon: Trophy,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Win Rate',
      currencies: null,
      plainValue: `${winRate}%`,
      sub: `${won.length}W / ${lost.length}L`,
      icon: Target,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Stalled Deals',
      currencies: null,
      plainValue: String(stalled.length),
      sub: 'Need attention',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, currencies, plainValue, sub, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-xs font-medium">{label}</p>
            <div className={`${bg} p-2 rounded-lg`}>
              <Icon size={14} className={color} />
            </div>
          </div>
          {currencies && currencies.length > 0 ? (
            <div className="space-y-0.5">
              {currencies.map(([cur, { total, hasEstimate }]) => (
                <p key={cur} className="text-gray-900 text-xl font-bold leading-tight">
                  {hasEstimate && <span className="text-amber-500">~</span>}
                  {formatCurrency(total, cur)}
                </p>
              ))}
            </div>
          ) : currencies && currencies.length === 0 ? (
            <p className="text-gray-900 text-2xl font-bold">—</p>
          ) : (
            <p className="text-gray-900 text-2xl font-bold">{plainValue}</p>
          )}
          <p className="text-gray-400 text-xs mt-1">{sub}</p>
        </div>
      ))}
    </div>
  )
}
