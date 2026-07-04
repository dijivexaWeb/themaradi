'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function requireOwner(vaultId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, userId: user!.id }
}

export async function saveOnboardingBasics(vaultId: string, formData: FormData) {
  const { supabase, userId } = await requireOwner(vaultId)

  const displayName = (formData.get('display_name') as string)?.trim()
  const birthDate = (formData.get('birth_date') as string) || null
  const birthDatePrecision = (formData.get('birth_date_precision') as string) || 'day'
  const deathDate = (formData.get('death_date') as string) || null
  const deathDatePrecision = (formData.get('death_date_precision') as string) || 'day'
  const birthPlace = (formData.get('birth_place') as string)?.trim() || null
  const tagline = (formData.get('tagline') as string)?.trim() || null
  const coverPhotoUrl = (formData.get('cover_photo_url') as string)?.trim() || null

  await supabase.from('vaults').update({
    ...(displayName ? { display_name: displayName } : {}),
    birth_date: birthDate,
    birth_date_precision: birthDate ? birthDatePrecision : null,
    death_date: deathDate,
    death_date_precision: deathDate ? deathDatePrecision : null,
    birth_place: birthPlace,
    tagline,
    cover_photo_url: coverPhotoUrl,
    onboarding_step: 2,
  }).eq('id', vaultId).eq('owner_id', userId)

  revalidatePath(`/anma-paneli/${vaultId}/onboarding`)
  redirect(`/anma-paneli/${vaultId}/onboarding?step=2`)
}

export async function saveOnboardingStory(vaultId: string, formData: FormData) {
  const { supabase, userId } = await requireOwner(vaultId)

  const biography = (formData.get('biography') as string)?.trim() || null
  const profession = (formData.get('profession') as string)?.trim() || null

  await supabase.from('vaults').update({
    biography,
    profession,
    onboarding_step: 4,
  }).eq('id', vaultId).eq('owner_id', userId)

  revalidatePath(`/anma-paneli/${vaultId}/onboarding`)
  redirect(`/anma-paneli/${vaultId}/onboarding?step=4`)
}

export async function advanceOnboardingStep(vaultId: string, nextStep: number) {
  const { supabase, userId } = await requireOwner(vaultId)

  await supabase.from('vaults').update({ onboarding_step: nextStep }).eq('id', vaultId).eq('owner_id', userId)

  revalidatePath(`/anma-paneli/${vaultId}/onboarding`)
  redirect(`/anma-paneli/${vaultId}/onboarding?step=${nextStep}`)
}

export async function completeOnboarding(vaultId: string) {
  const { supabase, userId } = await requireOwner(vaultId)

  await supabase.from('vaults').update({
    onboarding_step: 5,
    onboarding_completed_at: new Date().toISOString(),
  }).eq('id', vaultId).eq('owner_id', userId)

  redirect(`/anma-paneli/${vaultId}?onboarding_complete=1`)
}
