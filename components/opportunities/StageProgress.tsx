'use client'

import { useState, useTransition } from 'react'
import { Check, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STAGE_META, STAGE_COLORS } from '@/types'
import { advanceStage } from '@/lib/actions/opportunities'
import type { Opportunity } from '@/types'

export function StageProgress({ opportunity }: { opportunity: Opportunity }) {
  const [showModal, setShowModal] = useState(false)
  const [targetStage, setTargetStage] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function openAdvance(stage: number) {
    setTargetStage(stage)
    setError(null)
    setShowModal(true)
  }

  function confirmAdvance() {
    if (!targetStage) return
    startTransition(async () => {
      const result = await advanceStage(opportunity.id, targetStage)
      if (result.error) {
        setError(result.error)
      } else {
        setShowModal(false)
      }
    })
  }

  const currentMeta = STAGE_META[targetStage ?? opportunity.stage]

  return (
    <>
      {/* Stage stepper */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5, 6, 7].map((stage, idx) => {
          const done = opportunity.stage > stage
          const active = opportunity.stage === stage
          const color = STAGE_COLORS[stage]

          return (
            <div key={stage} className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => !done && !active && openAdvance(stage)}
                disabled={done || active || stage > opportunity.stage + 1}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                  done && 'bg-green-50 text-green-600 cursor-default',
                  active && 'bg-indigo-50 text-indigo-600 cursor-default ring-2 ring-indigo-300',
                  !done && !active && stage <= opportunity.stage + 1 && 'bg-slate-100 text-gray-500 hover:bg-slate-200 hover:text-gray-800 cursor-pointer',
                  !done && !active && stage > opportunity.stage + 1 && 'bg-slate-100 text-gray-300 cursor-not-allowed',
                )}
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full border border-current">
                  {done ? <Check size={10} /> : stage}
                </span>
                <span className="hidden sm:block text-center max-w-[70px] leading-tight">
                  {STAGE_META[stage]?.name.split(' ')[0]}
                </span>
              </button>
              {idx < 6 && <ChevronRight size={12} className="text-gray-300 shrink-0" />}
            </div>
          )
        })}
      </div>

      {/* Advance modal */}
      {showModal && targetStage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-xl">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-gray-900 font-semibold">Advance to Stage {targetStage}</h3>
              <p className="text-gray-400 text-sm mt-0.5">{currentMeta?.name}</p>
            </div>
            <div className="px-6 py-5">
              <p className="text-gray-600 text-sm mb-3 font-medium">Exit criteria for Stage {opportunity.stage}:</p>
              <ul className="space-y-2">
                {STAGE_META[opportunity.stage]?.exitCriteria.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
              {error && (
                <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-red-600 text-sm">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-slate-200 text-gray-500 hover:text-gray-800 text-sm font-medium py-2 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={confirmAdvance} disabled={isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                {isPending ? <><Loader2 size={13} className="animate-spin" /> Advancing…</> : 'Confirm Advance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
