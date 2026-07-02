'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn, formatCurrency } from '@/lib/utils'
import { STAGE_META, STAGE_COLORS } from '@/types'
import { DealCard } from './DealCard'
import type { Opportunity } from '@/types'

interface KanbanColumnProps {
  stage: number
  opportunities: Opportunity[]
}

export function KanbanColumn({ stage, opportunities }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `stage-${stage}` })
  const meta = STAGE_META[stage]
  const color = STAGE_COLORS[stage]
  // Group totals by currency — never mix currencies into one number
  const byCurrency: Record<string, { total: number; hasEstimate: boolean }> = {}
  for (const o of opportunities) {
    const amount = o.value ?? o.estimated_value ?? 0
    if (!amount) continue
    const cur = o.currency || 'GHS'
    if (!byCurrency[cur]) byCurrency[cur] = { total: 0, hasEstimate: false }
    byCurrency[cur].total += amount
    if (!o.value && o.estimated_value) byCurrency[cur].hasEstimate = true
  }
  const currencyTotals = Object.entries(byCurrency)

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', color)} />
          <span className="text-gray-600 text-xs font-semibold uppercase tracking-wide leading-none">
            {meta?.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {currencyTotals.length > 0 && (
            <span className="text-xs flex items-center gap-1 flex-wrap justify-end">
              {currencyTotals.map(([cur, { total, hasEstimate }]) => (
                <span key={cur} className={hasEstimate ? 'text-amber-500' : 'text-gray-400'}>
                  {hasEstimate && '~'}{formatCurrency(total, cur)}
                </span>
              ))}
            </span>
          )}
          <span className="text-gray-500 text-xs bg-slate-100 rounded-full px-2 py-0.5">
            {opportunities.length}
          </span>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-xl p-2 space-y-2 min-h-[200px] transition-colors',
          isOver ? 'bg-indigo-50 border border-indigo-200' : 'bg-white/60 border border-slate-200'
        )}
      >
        <SortableContext
          items={opportunities.map(o => o.id)}
          strategy={verticalListSortingStrategy}
        >
          {opportunities.map((opp) => (
            <DealCard key={opp.id} opportunity={opp} />
          ))}
        </SortableContext>

        {opportunities.length === 0 && (
          <div className="flex items-center justify-center h-20 text-gray-300 text-xs">
            No deals
          </div>
        )}
      </div>
    </div>
  )
}
