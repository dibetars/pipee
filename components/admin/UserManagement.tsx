'use client'

import { useState, useTransition } from 'react'
import { Plus, UserCheck, UserX, Loader2 } from 'lucide-react'
import { inviteUser, toggleUserActive } from '@/lib/actions/admin'
import { initials } from '@/lib/utils'
import type { Profile } from '@/types'

interface UserManagementProps {
  profiles: Profile[]
}

export function UserManagement({ profiles }: UserManagementProps) {
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await inviteUser(fd)
      if (result.error) setError(result.error)
      else { setShowForm(false); (e.target as HTMLFormElement).reset() }
    })
  }

  function handleToggle(userId: string, isActive: boolean) {
    setLoadingId(userId)
    startTransition(async () => {
      await toggleUserActive(userId, isActive)
      setLoadingId(null)
    })
  }

  const bdReps = profiles.filter(p => p.role === 'bd_rep')
  const admins = profiles.filter(p => p.role === 'admin')

  const inputCls = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-gray-900 font-semibold">Team Members</h2>
          <p className="text-gray-400 text-sm">{bdReps.length}/3 BD reps configured</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={bdReps.length >= 3}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={14} /> Add BD Rep
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleInvite} className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 space-y-4">
          <h3 className="text-gray-800 font-medium">Add New BD Rep</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Full Name *</label>
              <input name="name" required placeholder="e.g. Kwame Mensah" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email *</label>
              <input name="email" type="email" required placeholder="kwame@krontiva.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Temporary Password *</label>
              <input name="password" type="password" required placeholder="••••••••" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Role</label>
              <input name="role" value="bd_rep" readOnly
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-gray-400 cursor-not-allowed" />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 border border-slate-200 text-gray-500 hover:text-gray-800 text-sm py-2 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
              {isPending ? <><Loader2 size={13} className="animate-spin" /> Creating…</> : 'Create User'}
            </button>
          </div>
        </form>
      )}

      {/* Admins */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Administrators</p>
        <div className="space-y-2">
          {admins.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm text-white font-semibold shrink-0">
                {initials(p.name)}
              </div>
              <div className="flex-1">
                <p className="text-gray-800 text-sm font-medium">{p.name}</p>
                <p className="text-gray-400 text-xs capitalize">{p.role.replace('_', ' ')}</p>
              </div>
              <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">Admin</span>
            </div>
          ))}
        </div>
      </div>

      {/* BD Reps */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">BD Reps ({bdReps.length}/3)</p>
        <div className="space-y-2">
          {bdReps.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${p.is_active ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                {initials(p.name)}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${p.is_active ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                  {p.name}
                </p>
                <p className="text-gray-400 text-xs">BD Representative</p>
              </div>
              <button
                onClick={() => handleToggle(p.id, !p.is_active)}
                disabled={loadingId === p.id}
                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors disabled:opacity-50 ${
                  p.is_active
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-green-600 hover:bg-green-50'
                }`}
              >
                {loadingId === p.id
                  ? <Loader2 size={12} className="animate-spin" />
                  : p.is_active
                    ? <><UserX size={12} /> Deactivate</>
                    : <><UserCheck size={12} /> Activate</>
                }
              </button>
            </div>
          ))}
          {bdReps.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-sm">
              No BD reps added yet. Add up to 3 above.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
