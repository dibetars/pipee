import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TopNav } from '@/components/shared/TopNav'
import { StageTag } from '@/components/shared/StageTag'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { StageProgress } from '@/components/opportunities/StageProgress'
import { SubStageChecklist } from '@/components/opportunities/SubStageChecklist'
import { MEDDICScorecard } from '@/components/opportunities/MEDDICScorecard'
import { ActivityFeed } from '@/components/opportunities/ActivityFeed'
import { DiscoveryBriefForm } from '@/components/opportunities/DiscoveryBriefForm'
import { ProposalTracker } from '@/components/opportunities/ProposalTracker'
import { StageNotifications } from '@/components/opportunities/StageNotifications'
import { EditDealButton } from '@/components/opportunities/EditDealButton'
import { ContactsSection } from '@/components/opportunities/ContactsSection'
import { DealOutcomeBar } from '@/components/opportunities/DealOutcomeBar'
import { formatCurrency, formatDate, isStalled, daysSinceStageEntry } from '@/lib/utils'
import { STAGE_META } from '@/types'
import { AlertTriangle, Globe, Building2, Calendar, DollarSign } from 'lucide-react'

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: opp },
    { data: profile },
    { data: meddic },
    { data: activities },
    { data: brief },
    { data: proposals },
    { data: contacts },
    { data: sectors },
    { data: profiles },
    { data: subStageProgress },
  ] = await Promise.all([
    supabase.from('opportunities').select('*, profiles(*)').eq('id', id).single(),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('meddic_scores').select('*').eq('opportunity_id', id).single(),
    supabase.from('activities').select('*, profiles(name)').eq('opportunity_id', id).order('occurred_at', { ascending: false }),
    supabase.from('discovery_briefs').select('*').eq('opportunity_id', id).single(),
    supabase.from('proposals').select('*').eq('opportunity_id', id).order('version'),
    supabase.from('contacts').select('*').eq('opportunity_id', id),
    supabase.from('sectors').select('*'),
    supabase.from('profiles').select('*').eq('is_active', true),
    supabase.from('sub_stage_progress').select('*').eq('opportunity_id', id),
  ])

  if (!opp || !profile) notFound()

  const stalled = isStalled(opp.stage, opp.stage_entered_at)
  const daysInStage = daysSinceStageEntry(opp.stage_entered_at)
  const stageMeta = STAGE_META[opp.stage]

  const cardCls = 'bg-white border border-slate-200 rounded-xl p-5 shadow-sm'

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNav title={opp.company_name} profile={profile} sectors={sectors ?? []} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                  <Link href="/pipeline" className="hover:text-indigo-600 transition-colors">Pipeline</Link>
                  <span>/</span>
                  <span>{opp.company_name}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{opp.title}</h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <StageTag stage={opp.stage} />
                  <StatusBadge status={opp.status} />
                  {stalled && (
                    <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                      <AlertTriangle size={11} /> Stalled ({daysInStage}d in stage)
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                <DealOutcomeBar opportunityId={id} currentStatus={opp.status} />
                <EditDealButton
                  opportunity={opp}
                  profiles={profiles ?? []}
                  sectors={sectors ?? []}
                  currentUserRole={profile.role}
                />
                {(opp.value || opp.estimated_value) && (
                  <div className="text-right">
                    {opp.value ? (
                      <p className="text-green-600 text-xl font-bold">{formatCurrency(opp.value, opp.currency)}</p>
                    ) : (
                      <p className="text-amber-500 text-xl font-bold">~{formatCurrency(opp.estimated_value, opp.currency)}</p>
                    )}
                    <p className="text-gray-400 text-xs">{opp.value ? 'Deal Value' : 'Estimated Value'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stage notifications */}
          <div className="mb-4">
            <StageNotifications opportunity={opp} meddic={meddic} />
          </div>

          {/* Stage progress + sub-stage checklist */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Stage Progress</p>
              <StageProgress opportunity={opp} completedProgress={subStageProgress ?? []} />
              {stageMeta && (
                <p className="text-gray-400 text-xs mt-3">{stageMeta.purpose}</p>
              )}
            </div>
            <div className="border-t border-slate-100 pt-4">
              <SubStageChecklist
                opportunityId={id}
                stage={opp.stage}
                completedProgress={subStageProgress ?? []}
              />
            </div>
          </div>

          {/* Meta cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                <Building2 size={11} /> Company
              </div>
              <p className="text-gray-800 text-sm font-medium">{opp.company_name}</p>
              {opp.sector && <p className="text-gray-400 text-xs">{opp.sector}</p>}
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                <DollarSign size={11} /> Value
              </div>
              {opp.value ? (
                <p className="text-green-600 text-sm font-semibold">{formatCurrency(opp.value, opp.currency)}</p>
              ) : opp.estimated_value ? (
                <>
                  <p className="text-amber-600 text-sm font-semibold">~{formatCurrency(opp.estimated_value, opp.currency)}</p>
                  <p className="text-gray-400 text-xs">estimated</p>
                </>
              ) : (
                <p className="text-gray-400 text-sm font-medium">TBD</p>
              )}
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                <Calendar size={11} /> Next Action
              </div>
              <p className="text-gray-800 text-sm">{opp.next_action ?? '—'}</p>
              {opp.next_action_date && <p className="text-gray-400 text-xs">{formatDate(opp.next_action_date)}</p>}
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                <Globe size={11} /> Website
              </div>
              {opp.website
                ? <a href={opp.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm hover:underline truncate block">{opp.website}</a>
                : <p className="text-gray-400 text-sm">—</p>
              }
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: MEDDIC + Contacts */}
            <div className="lg:col-span-1 space-y-6">
              <div className={cardCls}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">MEDDIC Score</p>
                <MEDDICScorecard opportunityId={id} score={meddic ?? null} />
              </div>

              <div className={cardCls}>
                <ContactsSection opportunityId={id} initialContacts={contacts ?? []} />
              </div>
            </div>

            {/* Right column: Activity + Brief + Proposals */}
            <div className="lg:col-span-2 space-y-6">
              <div className={cardCls}>
                <ActivityFeed opportunityId={id} activities={activities ?? []} />
              </div>

              <div className={cardCls}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Discovery Brief</p>
                <DiscoveryBriefForm
                  opportunityId={id}
                  brief={brief ?? null}
                  canReview={profile.role === 'admin'}
                />
              </div>

              <div className={cardCls}>
                <ProposalTracker opportunityId={id} proposals={proposals ?? []} dealCurrency={opp.currency} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

