'use client'

import { AlertTriangle, Info, CheckCircle2, Lock, FileText, DollarSign, Handshake, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Opportunity, MEDDICScore } from '@/types'

interface Notification {
  type: 'info' | 'warning' | 'locked' | 'tip'
  icon: React.ElementType
  message: string
}

function getNotifications(opp: Opportunity, meddic?: MEDDICScore | null): Notification[] {
  const notes: Notification[] = []
  const stage = opp.stage

  // ── Stage-specific guidance ────────────────────────────────────────────────
  if (stage === 1) {
    notes.push({
      type: 'info', icon: Info,
      message: 'Stage 1 — Contact the prospect through at least two channels before advancing.',
    })
    notes.push({
      type: 'locked', icon: Lock,
      message: 'Deal value and proposal pricing are not set at this stage — focus on outreach first.',
    })
  }

  if (stage === 2) {
    notes.push({
      type: 'info', icon: Users,
      message: 'Stage 2 — Fill in the MEDDIC scorecard after each discovery call to track qualification.',
    })
    const score = meddic?.score ?? 0
    if (score < 4) {
      notes.push({
        type: 'warning', icon: AlertTriangle,
        message: `MEDDIC score is ${score}/6. You need ≥4 (including Identified Pain & Economic Buyer) to advance to Stage 3.`,
      })
    }
    if (!meddic?.identified_pain) {
      notes.push({
        type: 'locked', icon: Lock,
        message: 'Identified Pain is required before advancing. Confirm the prospect\'s core business problem.',
      })
    }
    if (!meddic?.economic_buyer_name) {
      notes.push({
        type: 'locked', icon: Lock,
        message: 'Economic Buyer is not yet identified. Find who controls the budget and signs off the deal.',
      })
    }
    notes.push({
      type: 'locked', icon: DollarSign,
      message: 'Proposal pricing cannot be set yet — pricing parameters are only clear from Stage 4 onwards.',
    })
  }

  if (stage === 3) {
    notes.push({
      type: 'info', icon: FileText,
      message: 'Stage 3 — File a Discovery Brief before advancing. The Solutions Lead reviews it before a proposal can be drafted.',
    })
    notes.push({
      type: 'locked', icon: DollarSign,
      message: 'Proposal pricing is not appropriate yet — confirm success criteria and scope in this stage first.',
    })
  }

  if (stage === 4) {
    notes.push({
      type: 'tip', icon: CheckCircle2,
      message: 'Stage 4 — You can now set deal value and begin drafting a proposal. Document stakeholder feedback and resolve technical questions.',
    })
    if (!opp.value) {
      notes.push({
        type: 'warning', icon: DollarSign,
        message: 'Deal value is not set. Update it before drafting the proposal to ensure accurate pipeline reporting.',
      })
    }
  }

  if (stage === 5) {
    notes.push({
      type: 'info', icon: Handshake,
      message: 'Stage 5 — Proposal submitted. Track negotiation progress and update the Proposal Tracker with any revisions.',
    })
    notes.push({
      type: 'tip', icon: Info,
      message: 'Once the prospect confirms the proposal is acceptable in writing, notify Legal/Finance to begin contract drafting.',
    })
  }

  if (stage === 6) {
    notes.push({
      type: 'tip', icon: CheckCircle2,
      message: 'Stage 6 — Issue the contract within 3 working days of acceptance. Upload the signed agreement once received.',
    })
  }

  if (stage === 7) {
    notes.push({
      type: 'tip', icon: CheckCircle2,
      message: 'Stage 7 — Coordinate handover to the Account Manager and initiate client onboarding within 5 days.',
    })
  }

  // ── Status-based alerts ────────────────────────────────────────────────────
  if (opp.status === 'stalled') {
    notes.push({
      type: 'warning', icon: AlertTriangle,
      message: 'This deal is stalled — it\'s been in this stage longer than expected. Log a new activity or schedule a follow-up immediately.',
    })
  }

  return notes
}

const STYLES = {
  info:    { bar: 'bg-blue-50 border-blue-200',    icon: 'text-blue-500',  text: 'text-blue-800'   },
  warning: { bar: 'bg-amber-50 border-amber-200',  icon: 'text-amber-500', text: 'text-amber-800'  },
  locked:  { bar: 'bg-slate-50 border-slate-200',  icon: 'text-slate-400', text: 'text-slate-600'  },
  tip:     { bar: 'bg-green-50 border-green-200',  icon: 'text-green-500', text: 'text-green-800'  },
}

interface StageNotificationsProps {
  opportunity: Opportunity
  meddic?: MEDDICScore | null
}

export function StageNotifications({ opportunity, meddic }: StageNotificationsProps) {
  const notifications = getNotifications(opportunity, meddic)
  if (notifications.length === 0) return null

  return (
    <div className="space-y-2">
      {notifications.map((n, i) => {
        const s = STYLES[n.type]
        const Icon = n.icon
        return (
          <div key={i} className={cn('flex items-start gap-3 rounded-xl border px-4 py-3', s.bar)}>
            <Icon size={15} className={cn('shrink-0 mt-0.5', s.icon)} />
            <p className={cn('text-sm leading-relaxed', s.text)}>{n.message}</p>
          </div>
        )
      })}
    </div>
  )
}
