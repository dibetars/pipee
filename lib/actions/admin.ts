'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function inviteUser(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as 'admin' | 'bd_rep'

  // Create auth user with a temporary password (user will reset via email)
  const { createClient: createServiceClient } = await import('@supabase/supabase-js')
  const adminClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password: formData.get('password') as string,
    email_confirm: true,
  })

  if (createError) return { error: createError.message }

  const { error: profileError } = await adminClient.from('profiles').insert({
    id: newUser.user.id,
    name,
    role,
  })

  if (profileError) return { error: profileError.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function upsertSectorAction(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const id = formData.get('id') as string | null

  const sectorData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string || null,
    icp_notes: formData.get('icp_notes') as string || null,
    is_priority: formData.get('is_priority') === 'true',
  }

  await (id
    ? supabase.from('sectors').update(sectorData).eq('id', id)
    : supabase.from('sectors').insert(sectorData))

  revalidatePath('/admin')
}
