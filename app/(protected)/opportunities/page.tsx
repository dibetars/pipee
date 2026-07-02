import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopNav } from '@/components/shared/TopNav'
import { BDRepGrid } from '@/components/pipeline/BDRepGrid'

export default async function OpportunitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: opportunities }, { data: sectors }, { data: profiles }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('opportunities').select('*, profiles(*), meddic_scores(score)').order('created_at', { ascending: false }),
    supabase.from('sectors').select('*'),
    supabase.from('profiles').select('*').eq('is_active', true).neq('role', 'admin'),
  ])

  if (!profile) redirect('/login')
  if (profile.role !== 'admin') redirect('/pipeline')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNav title="All Deals" profile={profile} sectors={sectors ?? []} profiles={profiles ?? []} />
      <div className="flex-1 overflow-y-auto">
        <BDRepGrid opportunities={opportunities ?? []} profiles={profiles ?? []} />
      </div>
    </div>
  )
}
