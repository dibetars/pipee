'use client'

import { useState, useTransition } from 'react'
import { Plus, FileText, Loader2 } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Proposal, ProposalStatus } from '@/types'

const STATUS_STYLES: Record<ProposalStatus, string> = {
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  submitted: 'bg-blue-50 text-blue-600 border-blue-200',
  accepted: 'bg-green-50 text-green-600 border-green-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
}

interface ProposalTrackerProps {
  opportunityId: string
  proposals: Proposal[]
}

export function ProposalTracker({ opportunityId, proposals }: ProposalTrackerProps) {
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const { error: e } = await supabase.from('proposals').insert({
        opportunity_id: opportunityId,
        version: proposals.length + 1,
        status: fd.get('status') as string,
        scope: fd.get('scope') as string || null,
        value: fd.get('value') ? Number(fd.get('value')) : null,
        payment_schedule: fd.get('payment_schedule') as string || null,
        notes: fd.get('notes') as string || null,
      })
      if (e) setError(e.message)
      else setShowForm(false)
    })
  }

  const sorted = [...proposals].sort((a, b) => b.version - a.version)

  const inputCls = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Proposals</p>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-500">
          <Plus size={12} /> New Version
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select name="status" className={inputCls}>
                {(['draft', 'submitted', 'accepted', 'rejected'] as ProposalStatus[]).map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Value (GHS)</label>
              <input name="value" type="number" placeholder="e.g. 75000" className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Scope</label>
              <textarea name="scope" rows={2} placeholder="Describe the scope of this proposal"
                className={`${inputCls} resize-none`} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Payment Schedule</label>
              <input name="payment_schedule" placeholder="e.g. 50% upfront, 50% at 3 months" className={inputCls} />
            </div>
          </div>
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 border border-slate-200 text-gray-500 text-sm py-2 rounded-lg hover:text-gray-800 transition-colors">Cancel</button>
            <button type="submit" disabled={isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
              {isPending ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : 'Save'}
            </button>
          </div>
        </form>
      )}

      {sorted.length === 0 && !showForm && (
        <div className="flex flex-col items-center py-8 text-center">
          <FileText size={28} className="text-gray-300 mb-2" />
          <p className="text-gray-400 text-sm">No proposals yet</p>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map(p => (
          <div key={p.id} className="border border-slate-200 rounded-lg p-3 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 text-sm font-medium">v{p.version}</span>
              <span className={cn('text-xs border rounded-full px-2 py-0.5', STATUS_STYLES[p.status])}>
                {p.status}
              </span>
            </div>
            {p.value && <p className="text-green-600 text-sm font-semibold">{formatCurrency(p.value)}</p>}
            {p.scope && <p className="text-gray-500 text-xs mt-1">{p.scope}</p>}
            {p.payment_schedule && <p className="text-gray-400 text-xs mt-1">💳 {p.payment_schedule}</p>}
            <p className="text-gray-300 text-xs mt-2">{formatDate(p.created_at)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
