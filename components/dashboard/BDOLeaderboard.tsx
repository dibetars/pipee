import { formatCurrency, initials } from '@/lib/utils'
import type { Opportunity, Profile } from '@/types'

interface BDOLeaderboardProps {
  opportunities: Opportunity[]
  profiles: Profile[]
}

export function BDOLeaderboard({ opportunities, profiles }: BDOLeaderboardProps) {
  const stats = profiles
    .filter(p => p.role === 'bd_rep' && p.is_active)
    .map(p => {
      const myOpps = opportunities.filter(o => o.assigned_to === p.id)
      const won = myOpps.filter(o => o.status === 'won')
      const lost = myOpps.filter(o => o.status === 'lost')
      const active = myOpps.filter(o => o.status === 'active')
      const pipelineValue = active.reduce((sum, o) => sum + (o.value ?? 0), 0)
      const wonValue = won.reduce((sum, o) => sum + (o.value ?? 0), 0)
      const winRate = won.length + lost.length > 0
        ? Math.round((won.length / (won.length + lost.length)) * 100)
        : 0

      return { profile: p, active: active.length, won: won.length, pipelineValue, wonValue, winRate }
    })
    .sort((a, b) => b.wonValue - a.wonValue)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">BDO Performance</p>

      {stats.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-6">No BD reps yet</p>
      )}

      <div className="space-y-3">
        {stats.map(({ profile, active, won, pipelineValue, wonValue, winRate }, i) => (
          <div key={profile.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-gray-400 text-xs w-4 shrink-0">#{i + 1}</span>
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-semibold shrink-0">
              {initials(profile.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 text-sm font-medium truncate">{profile.name}</p>
              <p className="text-gray-400 text-xs">{active} active · {won} won · {winRate}% win rate</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-green-600 text-sm font-semibold">{formatCurrency(wonValue)}</p>
              <p className="text-gray-400 text-xs">{formatCurrency(pipelineValue)} pipeline</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
