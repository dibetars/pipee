'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { STAGE_META } from '@/types'
import type { Opportunity } from '@/types'

interface ConversionChartProps {
  opportunities: Opportunity[]
}

const COLORS = ['#64748b', '#3b82f6', '#8b5cf6', '#f59e0b', '#f97316', '#22c55e', '#10b981']

export function ConversionChart({ opportunities }: ConversionChartProps) {
  const data = [1, 2, 3, 4, 5, 6, 7].map(stage => ({
    stage: `S${stage}`,
    name: STAGE_META[stage]?.name.split(' ')[0],
    count: opportunities.filter(o => o.stage === stage && o.status === 'active').length,
  }))

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Active Deals by Stage</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#6b7280' }}
            itemStyle={{ color: '#111827' }}
            formatter={(value) => [value, 'Deals']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
