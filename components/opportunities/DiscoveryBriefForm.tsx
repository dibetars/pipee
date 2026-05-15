'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FileSearch, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { DiscoveryBrief } from '@/types'

interface DiscoveryBriefFormProps {
  opportunityId: string
  brief: DiscoveryBrief | null
  canReview?: boolean
  reviewerName?: string
}

export function DiscoveryBriefForm({ opportunityId, brief, canReview, reviewerName }: DiscoveryBriefFormProps) {
  const [editing, setEditing] = useState(!brief)
  const [form, setForm] = useState({
    context: brief?.context ?? '',
    pain_points: brief?.pain_points ?? '',
    success_criteria: brief?.success_criteria ?? '',
    constraints: brief?.constraints ?? '',
  })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const { error: e } = await supabase.from('discovery_briefs').upsert({
        opportunity_id: opportunityId,
        ...form,
        filed_at: new Date().toISOString(),
      })
      if (e) setError(e.message)
      else { setEditing(false); router.refresh() }
    })
  }

  function handleMarkReviewed() {
    startTransition(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { error: e } = await supabase.from('discovery_briefs')
        .update({ reviewed_by: user?.id })
        .eq('opportunity_id', opportunityId)
      if (!e) router.refresh()
    })
  }

  const fields = [
    { key: 'context' as const, label: 'Prospect Context', placeholder: "Describe the prospect's current operations, size, and background" },
    { key: 'pain_points' as const, label: 'Pain Points', placeholder: 'Document specific pain points and their business cost/impact' },
    { key: 'success_criteria' as const, label: 'Success Criteria', placeholder: "What does success look like at 3 months and 12 months post-deployment?" },
    { key: 'constraints' as const, label: 'Constraints & Considerations', placeholder: 'Technical, budget, timeline, or process constraints' },
  ]

  const textareaCls = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none'

  return (
    <div>
      {brief?.filed_at && !editing && (
        <div className="flex items-center justify-between mb-5 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle size={14} />
            Filed {formatDate(brief.filed_at)}
            {reviewerName && ` · Reviewed by ${reviewerName}`}
          </div>
          <div className="flex gap-2">
            {canReview && !brief.reviewed_by && (
              <button onClick={handleMarkReviewed} className="text-xs text-green-600 hover:text-green-700 font-medium">
                Mark Reviewed
              </button>
            )}
            <button onClick={() => setEditing(true)} className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">
              Edit
            </button>
          </div>
        </div>
      )}

      {!brief && !editing && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <FileSearch size={32} className="text-gray-300 mb-3" />
          <p className="text-gray-600 text-sm font-medium">No Discovery Brief yet</p>
          <p className="text-gray-400 text-xs mt-1 mb-4">Required before advancing to Stage 4</p>
          <button onClick={() => setEditing(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Create Brief
          </button>
        </div>
      )}

      {editing && (
        <div className="space-y-4">
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
              <textarea
                value={form[key]}
                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                rows={3}
                className={textareaCls}
              />
            </div>
          ))}
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <div className="flex gap-3">
            {brief && <button onClick={() => setEditing(false)}
              className="flex-1 border border-slate-200 text-gray-500 hover:text-gray-800 text-sm py-2 rounded-lg transition-colors">Cancel</button>}
            <button onClick={handleSave} disabled={isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
              {isPending ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : 'Save Brief'}
            </button>
          </div>
        </div>
      )}

      {brief && !editing && (
        <div className="space-y-4">
          {fields.map(({ key, label }) => (
            <div key={key}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{brief[key] || '—'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
