import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopNav } from '@/components/shared/TopNav'
import { UserManagement } from '@/components/admin/UserManagement'
import { upsertSectorAction } from '@/lib/actions/admin'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: profiles }, { data: sectors }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('profiles').select('*').order('created_at'),
    supabase.from('sectors').select('*').order('name'),
  ])

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNav title="Admin" profile={profile} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-8">

          {/* User Management */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <UserManagement profiles={profiles ?? []} />
          </div>

          {/* Sector Management */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-gray-900 font-semibold">Priority Sectors</h2>
                <p className="text-gray-400 text-sm">Configure Ideal Customer Profile sectors</p>
              </div>
            </div>

            <div className="space-y-2">
              {(sectors ?? []).map(sector => (
                <div key={sector.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${sector.is_priority ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                  <div className="flex-1">
                    <p className="text-gray-800 text-sm font-medium">{sector.name}</p>
                    {sector.description && <p className="text-gray-400 text-xs">{sector.description}</p>}
                  </div>
                  {sector.is_priority && (
                    <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">Priority</span>
                  )}
                </div>
              ))}
            </div>

            {/* Add sector form */}
            <form action={upsertSectorAction} className="mt-4 flex gap-3">
              <input name="name" required placeholder="New sector name"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="submit"
                className="bg-slate-100 border border-slate-200 text-gray-600 hover:text-gray-900 hover:bg-slate-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Add Sector
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
