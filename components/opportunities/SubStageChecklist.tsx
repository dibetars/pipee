'use client'

import { useState, useTransition } from 'react'
import { Check, Loader2, Lock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleSubStage } from '@/lib/actions/opportunities'
import { SUB_STAGES } from '@/types'
import type { SubStageProgress } from '@/types'

interface SubStageChecklistProps {
  opportunityId: string
  stage: number
  completedProgress: SubStageProgress[]
}

export function SubStageChecklist({ opportunityId, stage, completedProgress }: SubStageChecklistProps) {
  const subStages = SUB_STAGES[stage] ?? []

  // Optimistic state: set of completed keys
  const [completedKeys, setCompletedKeys] = useState<Set<string>>(
    () => new Set(completedProgress.map(p => p.sub_stage_key))
  )
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  if (subStages.length === 0) return null

  const totalRequired = subStages.filter(s => s.required).length
  const completedRequired = subStages.filter(s => s.required && completedKeys.has(s.key)).length
  const totalCompleted = subStages.filter(s => completedKeys.has(s.key)).length
  const allRequiredDone = completedRequired === totalRequired
  const pct = subStages.length > 0 ? Math.round((totalCompleted / subStages.length) * 100) : 0

  function handleToggle(key: string, currentlyDone: boolean) {
    // Optimistic update
    setPendingKey(key)
    setError(null)
    const next = new Set(completedKeys)
    if (currentlyDone) { next.delete(key) } else { next.add(key) }
    setCompletedKeys(next)

    startTransition(async () => {
      const result = await toggleSubStage(opportunityId, key, !currentlyDone)
      if (result.error) {
        // Revert
        setCompletedKeys(completedKeys)
        setError(result.error)
      }
      setPendingKey(null)
    })
  }

  return (
    <div>
      {/* Header + progress */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Stage Checklist</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {totalCompleted}/{subStages.length} complete
            {!allRequiredDone && (
              <span className="text-amber-500 ml-2">· {totalRequired - completedRequired} required remaining</span>
            )}
            {allRequiredDone && (
              <span className="text-green-500 ml-2">· All required items done ✓</span>
            )}
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-500">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            allRequiredDone ? 'bg-green-400' : 'bg-indigo-400'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {subStages.map(item => {
          const done = completedKeys.has(item.key)
          const loading = pendingKey === item.key

          return (
            <button
              key={item.key}
              onClick={() => !loading && handleToggle(item.key, done)}
              disabled={loading}
              className={cn(
                'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg border text-left transition-all',
                done
                  ? 'bg-green-50 border-green-200 hover:bg-green-100'
                  : 'bg-white border-slate-200 hover:bg-slate-50',
                loading && 'opacity-60 cursor-wait'
              )}
            >
              {/* Checkbox */}
              <div className={cn(
                'w-4.5 h-4.5 shrink-0 mt-0.5 rounded flex items-center justify-center border transition-colors',
                done ? 'bg-green-500 border-green-500' : 'border-slate-300 bg-white'
              )}>
                {loading
                  ? <Loader2 size={10} className="animate-spin text-gray-400" />
                  : done
                    ? <Check size={10} className="text-white" strokeWidth={3} />
                    : null
                }
              </div>

              {/* Label + description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    'text-sm font-medium',
                    done ? 'text-green-700 line-through decoration-green-400' : 'text-gray-800'
                  )}>
                    {item.label}
                  </span>
                  {item.required && !done && (
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                      <Lock size={9} /> Required
                    </span>
                  )}
                  {item.required && done && (
                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                      ✓ Required
                    </span>
                  )}
                </div>
                <p className={cn(
                  'text-xs mt-0.5',
                  done ? 'text-green-600/70' : 'text-gray-400'
                )}>
                  {item.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Advance hint */}
      {!allRequiredDone && (
        <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Complete all <strong>Required</strong> items above before advancing to Stage {stage + 1}.
        </p>
      )}
    </div>
  )
}
