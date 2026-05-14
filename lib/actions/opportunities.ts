'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { STAGE_META } from '@/types'
import type { DisqualificationReason } from '@/types'

export async function createOpportunity(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const assignedTo = formData.get('assigned_to') as string || user.id

  const { data, error } = await supabase
    .from('opportunities')
    .insert({
      title: formData.get('title') as string,
      company_name: formData.get('company_name') as string,
      sector: formData.get('sector') as string || null,
      website: formData.get('website') as string || null,
      value: formData.get('value') ? Number(formData.get('value')) : null,
      currency: formData.get('currency') as string || 'GHS',
      assigned_to: assignedTo,
      next_action: formData.get('next_action') as string || null,
      next_action_date: formData.get('next_action_date') as string || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Create blank MEDDIC score
  await supabase.from('meddic_scores').insert({ opportunity_id: data.id, score: 0 })

  // Log creation activity
  await supabase.from('activities').insert({
    opportunity_id: data.id,
    user_id: user.id,
    type: 'note',
    title: 'Opportunity created',
    occurred_at: new Date().toISOString(),
  })

  revalidatePath('/pipeline')
  revalidatePath('/opportunities')
  revalidatePath('/dashboard')
  return { data }
}

export async function advanceStage(opportunityId: string, newStage: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (newStage < 1 || newStage > 7) return { error: 'Invalid stage' }

  const { data: opp } = await supabase
    .from('opportunities')
    .select('stage, meddic_scores(*)')
    .eq('id', opportunityId)
    .single()

  // MEDDIC gate: advancing from stage 2 requires score ≥ 4 with Pain + Economic Buyer
  if (opp?.stage === 2 && newStage === 3) {
    const meddic = Array.isArray(opp.meddic_scores) ? opp.meddic_scores[0] : opp.meddic_scores
    if (!meddic || meddic.score < 4 || !meddic.identified_pain || !meddic.economic_buyer_name) {
      return { error: 'MEDDIC score must be ≥4 with Identified Pain and Economic Buyer confirmed before advancing.' }
    }
  }

  const { error } = await supabase
    .from('opportunities')
    .update({ stage: newStage, stage_entered_at: new Date().toISOString(), status: 'active' })
    .eq('id', opportunityId)

  if (error) return { error: error.message }

  await supabase.from('activities').insert({
    opportunity_id: opportunityId,
    user_id: user.id,
    type: 'stage_change',
    title: `Moved to Stage ${newStage}: ${STAGE_META[newStage]?.name}`,
    occurred_at: new Date().toISOString(),
  })

  revalidatePath('/pipeline')
  revalidatePath(`/opportunities/${opportunityId}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateOpportunity(id: string, updates: Record<string, unknown>) {
  const supabase = await createClient()
  const { error } = await supabase.from('opportunities').update(updates).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/pipeline')
  revalidatePath(`/opportunities/${id}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function disqualifyOpportunity(id: string, reason: DisqualificationReason) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('opportunities')
    .update({ status: 'disqualified', disqualification_reason: reason })
    .eq('id', id)

  if (error) return { error: error.message }

  await supabase.from('activities').insert({
    opportunity_id: id,
    user_id: user.id,
    type: 'note',
    title: `Disqualified: ${reason.replace('_', ' ')}`,
    occurred_at: new Date().toISOString(),
  })

  revalidatePath('/pipeline')
  revalidatePath(`/opportunities/${id}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function markWonLost(id: string, outcome: 'won' | 'lost', notes?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('opportunities')
    .update({ status: outcome })
    .eq('id', id)

  if (error) return { error: error.message }

  await supabase.from('activities').insert({
    opportunity_id: id,
    user_id: user.id,
    type: 'note',
    title: `Deal marked as ${outcome.toUpperCase()}`,
    description: notes || null,
    occurred_at: new Date().toISOString(),
  })

  revalidatePath('/pipeline')
  revalidatePath(`/opportunities/${id}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function saveMEDDIC(opportunityId: string, data: Record<string, string>) {
  const supabase = await createClient()

  const filled = [
    data.metrics_evidence,
    data.economic_buyer_name,
    data.decision_criteria,
    data.decision_process,
    data.identified_pain,
    data.champion_name,
  ].filter(Boolean).length

  const { error } = await supabase
    .from('meddic_scores')
    .upsert({
      opportunity_id: opportunityId,
      ...data,
      score: filled,
      updated_at: new Date().toISOString(),
    })

  if (error) return { error: error.message }
  revalidatePath(`/opportunities/${opportunityId}`)
  return { success: true, score: filled }
}

export async function addActivity(opportunityId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('activities').insert({
    opportunity_id: opportunityId,
    user_id: user.id,
    type: formData.get('type') as string,
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    outcome: formData.get('outcome') as string || null,
    occurred_at: formData.get('occurred_at') as string || new Date().toISOString(),
  })

  if (error) return { error: error.message }
  revalidatePath(`/opportunities/${opportunityId}`)
  return { success: true }
}
