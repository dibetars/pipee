'use client'

import { useState, useTransition } from 'react'
import { Phone, Mail, Users, FileText, ArrowRight, Radio, Plus, Loader2 } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { addActivity } from '@/lib/actions/opportunities'
import type { Activity, ActivityType } from '@/types'

const TYPE_ICONS: Record<ActivityType, React.ReactNode> = {
  call: <Phone size={12} />,
  email: <Mail size={12} />,
  meeting: <Users size={12} />,
  note: <FileText size={12} />,
  stage_change: <ArrowRight size={12} />,
  outreach: <Radio size={12} />,
}

const TYPE_COLORS: Record<ActivityType, string> = {
  call: 'bg-blue-100 text-blue-600',
  email: 'bg-violet-100 text-violet-600',
  meeting: 'bg-amber-100 text-amber-600',
  note: 'bg-slate-100 text-slate-600',
  stage_change: 'bg-green-100 text-green-600',
  outreach: 'bg-orange-100 text-orange-600',
}

interface ActivityFeedProps {
  opportunityId: string
  activities: Activity[]
}

export function ActivityFeed({ opportunityId, activities }: ActivityFeedProps) {
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await addActivity(opportunityId, fd)
      if (result.error) setError(result.error)
      else { setShowForm(false); (e.target as HTMLFormElement).reset() }
    })
  }

  const sorted = [...activities].sort((a, b) =>
    new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
  )

  const inputCls = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Activity</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-500 transition-colors"
        >
          <Plus size={12} /> Log activity
        </button>
      </div>

      {/* Log form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-5 bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select name="type" required className={inputCls}>
                {(['call', 'email', 'meeting', 'note', 'outreach'] as ActivityType[]).map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <input name="occurred_at" type="datetime-local"
                defaultValue={new Date().toISOString().slice(0, 16)}
                className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Title *</label>
            <input name="title" required placeholder="e.g. Intro call with Head of CX" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <textarea name="description" rows={2} placeholder="What happened?" className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Outcome</label>
            <input name="outcome" placeholder="e.g. Prospect requested a demo" className={inputCls} />
          </div>
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 border border-slate-200 text-gray-500 text-sm py-2 rounded-lg hover:text-gray-800 transition-colors">Cancel</button>
            <button type="submit" disabled={isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
              {isPending ? <><Loader2 size={13} className="animate-spin" /> Logging…</> : 'Log'}
            </button>
          </div>
        </form>
      )}

      {/* Timeline */}
      <div className="space-y-3">
        {sorted.map(activity => (
          <div key={activity.id} className="flex gap-3">
            <div className={cn('flex items-center justify-center w-6 h-6 rounded-full shrink-0 mt-0.5', TYPE_COLORS[activity.type])}>
              {TYPE_ICONS[activity.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <p className="text-gray-800 text-sm font-medium">{activity.title}</p>
                <span className="text-gray-400 text-xs shrink-0">{formatDate(activity.occurred_at)}</span>
              </div>
              {activity.description && <p className="text-gray-500 text-xs mt-0.5">{activity.description}</p>}
              {activity.outcome && (
                <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                  <ArrowRight size={10} /> {activity.outcome}
                </p>
              )}
              {activity.profiles && (
                <p className="text-gray-300 text-xs mt-0.5">{activity.profiles.name}</p>
              )}
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <p className="text-gray-300 text-sm text-center py-6">No activity logged yet</p>
        )}
      </div>
    </div>
  )
}
