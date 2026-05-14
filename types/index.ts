export type UserRole = 'admin' | 'bd_rep'
export type OpportunityStatus = 'active' | 'stalled' | 'won' | 'lost' | 'disqualified'
export type DisqualificationReason = 'NO_FIT' | 'NO_PAIN' | 'NO_BUDGET' | 'NO_AUTHORITY' | 'NO_TIMELINE' | 'COMPETITOR'
export type ContactRole = 'champion' | 'economic_buyer' | 'stakeholder' | 'other'
export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'stage_change' | 'outreach'
export type ProposalStatus = 'draft' | 'submitted' | 'accepted' | 'rejected'
export type OutreachChannel = 'email' | 'linkedin' | 'phone' | 'other'

export interface Profile {
  id: string
  name: string
  role: UserRole
  avatar_url: string | null
  sectors: string[]
  is_active: boolean
  created_at: string
}

export interface Opportunity {
  id: string
  title: string
  company_name: string
  sector: string | null
  website: string | null
  stage: number
  status: OpportunityStatus
  assigned_to: string | null
  value: number | null
  currency: string
  disqualification_reason: DisqualificationReason | null
  next_action: string | null
  next_action_date: string | null
  stage_entered_at: string
  notes: string | null
  created_at: string
  updated_at: string
  // Joined
  profiles?: Profile
  meddic_scores?: MEDDICScore
}

export interface MEDDICScore {
  id: string
  opportunity_id: string
  metrics_evidence: string | null
  economic_buyer_name: string | null
  economic_buyer_title: string | null
  decision_criteria: string | null
  decision_process: string | null
  identified_pain: string | null
  champion_name: string | null
  score: number
  updated_at: string
}

export interface Contact {
  id: string
  opportunity_id: string
  name: string
  title: string | null
  role: ContactRole
  email: string | null
  phone: string | null
  linkedin_url: string | null
  created_at: string
}

export interface Activity {
  id: string
  opportunity_id: string
  user_id: string | null
  type: ActivityType
  title: string
  description: string | null
  outcome: string | null
  occurred_at: string
  created_at: string
  profiles?: Profile
}

export interface DiscoveryBrief {
  id: string
  opportunity_id: string
  context: string | null
  pain_points: string | null
  success_criteria: string | null
  constraints: string | null
  reviewed_by: string | null
  filed_at: string | null
  created_at: string
}

export interface Proposal {
  id: string
  opportunity_id: string
  version: number
  status: ProposalStatus
  scope: string | null
  value: number | null
  currency: string
  payment_schedule: string | null
  submitted_at: string | null
  accepted_at: string | null
  notes: string | null
  created_at: string
}

export interface OutreachEntry {
  id: string
  opportunity_id: string
  channel: OutreachChannel
  attempt_number: number
  outcome: string | null
  occurred_at: string
}

export interface Sector {
  id: string
  name: string
  description: string | null
  icp_notes: string | null
  is_priority: boolean
  created_at: string
}

// Stage metadata from the Krongage BD Framework
export const STAGE_META: Record<number, {
  name: string
  purpose: string
  targetDays: number
  exitCriteria: string[]
}> = {
  1: {
    name: 'Market Targeting & Prospecting',
    purpose: 'Identify and list businesses that match the Ideal Customer Profile',
    targetDays: 7,
    exitCriteria: [
      'Target contacted through at least two channels',
      'Response or expression of interest received',
      'Contact name, role, and channel recorded',
      'Next agreed action and date documented',
    ],
  },
  2: {
    name: 'Lead Qualification',
    purpose: 'Confirm fit, need, authority, and timing (MEDDIC)',
    targetDays: 3,
    exitCriteria: [
      'At least 4 of 6 MEDDIC dimensions satisfied',
      'Identified Pain must be confirmed',
      'Economic Buyer must be identified',
      'Discovery meeting scheduled with named decision-maker',
    ],
  },
  3: {
    name: 'Discovery & Needs Assessment',
    purpose: 'Diagnose the prospect\'s problem in depth',
    targetDays: 7,
    exitCriteria: [
      'Discovery Brief completed and filed',
      'Success criteria agreed with prospect',
      'Demonstration date confirmed in calendar',
    ],
  },
  4: {
    name: 'Solution Design & Demonstration',
    purpose: 'Present a tailored Krongage solution',
    targetDays: 10,
    exitCriteria: [
      'Stakeholder feedback documented',
      'Open technical questions resolved',
      'Prospect confirmed willingness to receive formal proposal',
      'Pricing parameters sufficiently clear to draft proposal',
    ],
  },
  5: {
    name: 'Proposal & Commercial Negotiation',
    purpose: 'Issue pricing and terms; reach agreement',
    targetDays: 17,
    exitCriteria: [
      'Prospect issued written confirmation proposal is acceptable',
      'Final pricing, scope, and term documented',
      'Legal/Finance notified to begin contract drafting',
    ],
  },
  6: {
    name: 'Contracting & Close',
    purpose: 'Sign agreement and prepare for handover',
    targetDays: 10,
    exitCriteria: [
      'Contract issued within 3 working days of acceptance',
      'Signed agreement received from prospect',
      'Handover briefing prepared for Account Manager',
    ],
  },
  7: {
    name: 'Handover, Onboarding & Account Growth',
    purpose: 'Transition to delivery and unlock expansion',
    targetDays: 90,
    exitCriteria: [
      'Formal handover completed to Account Manager',
      'Client onboarding initiated',
      'First 90-day success milestones defined',
    ],
  },
}

export const STAGE_COLORS: Record<number, string> = {
  1: 'bg-slate-500',
  2: 'bg-blue-500',
  3: 'bg-violet-500',
  4: 'bg-amber-500',
  5: 'bg-orange-500',
  6: 'bg-green-500',
  7: 'bg-emerald-600',
}

export const STATUS_COLORS: Record<OpportunityStatus, string> = {
  active: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  stalled: 'bg-red-500/20 text-red-400 border-red-500/30',
  won: 'bg-green-500/20 text-green-400 border-green-500/30',
  lost: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  disqualified: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}
