'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FileText, Loader2, Pencil, Check, X } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { updateProposal } from '@/lib/actions/opportunities'
import { CURRENCIES } from '@/types'
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
  dealCurrency?: string
}

function ProposalCard({
  proposal, opportunityId, dealCurrency, onRefresh,
}: {
  proposal: Proposal
  opportunityId: string
  dealCurrency: string
  onRefresh: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    status: proposal.status,
    value: proposal.value?.toString() ?? '',
    currency: proposal.currency || dealCurrency,
    scope: proposal.scope ?? '',
    payment_schedule: proposal.payment_schedule ?? '',
    notes: proposal.notes ?? '',
  })

  const inputCls = 'w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'

  function handleSave() {
    startTransition(async () => {
      const result = await updateProposal(proposal.id, opportunityId, {
        status: form.status,
        value: form.value ? Number(form.value) : null,
        currency: form.currency,
        scope: form.scope || null,
        payment_schedule: form.payment_schedule || null,
        notes: form.notes || null,
      })
      if (!result.error) { setEditing(false); onRefresh() }
    })
  }

  if (editing) {
    return (
      <div className="border border-indigo-200 rounded-lg p-3 bg-indigo-50/30 space-y-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-700 text-sm font-medium">v{proposal.version}</span>
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5">
              <X size={11} /> Cancel
            </button>
            <button onClick={handleSave} disabled={isPending} className="text-xs text-indigo-600 hover:text-indigo-500 font-medium flex items-center gap-0.5 disabled:opacity-50">
              {isPending ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Save
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as ProposalStatus }))} className={inputCls}>
            {(['draft', 'submitted', 'accepted', 'rejected'] as ProposalStatus[]).map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder="Value" className={inputCls} />
          <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} className={inputCls}>
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.name}</option>)}
          </select>
          <input value={form.payment_schedule} onChange={e => setForm(p => ({ ...p, payment_schedule: e.target.value }))} placeholder="Payment schedule" className={inputCls} />
        </div>
        <textarea value={form.scope} onChange={e => setForm(p => ({ ...p, scope: e.target.value }))} placeholder="Scope" rows={2} className={`${inputCls} resize-none`} />
      </div>
    )
  }

  return (
    <div className="border border-slate-200 rounded-lg p-3 bg-white group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-700 text-sm font-medium">v{proposal.version}</span>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs border rounded-full px-2 py-0.5', STATUS_STYLES[proposal.status])}>
            {proposal.status}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-indigo-500 transition-all p-0.5 rounded"
          >
            <Pencil size={11} />
          </button>
        </div>
      </div>
      {proposal.value && <p className="text-green-600 text-sm font-semibold">{formatCurrency(proposal.value, proposal.currency || dealCurrency)}</p>}
      {proposal.scope && <p className="text-gray-500 text-xs mt-1">{proposal.scope}</p>}
      {proposal.payment_schedule && <p className="text-gray-400 text-xs mt-1">💳 {proposal.payment_schedule}</p>}
      <p className="text-gray-300 text-xs mt-2">{formatDate(proposal.created_at)}</p>
    </div>
  )
}

export function ProposalTracker({ opportunityId, proposals, dealCurrency = 'GHS' }: ProposalTrackerProps) {
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const form = e.currentTarget
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const { error: err } = await supabase.from('proposals').insert({
        opportunity_id: opportunityId,
        version: proposals.length + 1,
        status: fd.get('status') as string,
        scope: fd.get('scope') as string || null,
        value: fd.get('value') ? Number(fd.get('value')) : null,
        currency: fd.get('currency') as string || dealCurrency,
        payment_schedule: fd.get('payment_schedule') as string || null,
        notes: fd.get('notes') as string || null,
      })
      if (err) setError(err.message)
      else { setShowForm(false); form.reset(); router.refresh() }
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
              <label className="block text-xs text-gray-500 mb-1">Value</label>
              <input name="value" type="number" placeholder="e.g. 75000" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Currency</label>
              <select name="currency" defaultValue={dealCurrency} className={inputCls}>
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.symbol} {c.name}</option>
                ))}
              </select>
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
          <ProposalCard
            key={p.id}
            proposal={p}
            opportunityId={opportunityId}
            dealCurrency={dealCurrency}
            onRefresh={() => router.refresh()}
          />
        ))}
      </div>
    </div>
  )
}
