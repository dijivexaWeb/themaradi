'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fetchPricingConfig } from '@/lib/pricing'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 50)
}

export async function purchaseMemorialAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const displayName = (formData.get('display_name') as string)?.trim()
  const senderName = (formData.get('sender_name') as string)?.trim()
  const senderEmail = (formData.get('sender_email') as string)?.trim().toLowerCase()

  if (!displayName) return { error: 'Anma profili sahibinin adı zorunludur' }
  if (!senderName) return { error: 'Ad Soyad zorunludur' }
  if (!senderEmail || !senderEmail.includes('@')) return { error: 'Geçerli bir e-posta girin' }

  const pricing = await fetchPricingConfig()
  const amount = pricing.campaignActive && pricing.campaignMemorial
    ? Number(pricing.campaignMemorial)
    : Number(pricing.memorialPrice)

  const baseSlug = slugify(displayName)
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  const { data: vault, error: vaultErr } = await supabase.from('vaults').insert({
    owner_id: user.id,
    display_name: displayName,
    slug,
    status: 'pending_verification',
    product_type: 'memorial_profile',
    vault_origin: 'family',
  }).select('id').single()

  if (vaultErr || !vault) return { error: 'Vault oluşturulamadı: ' + vaultErr?.message }

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 3)

  await supabase.from('payments').insert({
    vault_id: vault.id,
    user_id: user.id,
    amount,
    currency: 'GEL',
    product_type: 'memorial_one_time',
    status: 'pending',
    payment_method: 'bank_transfer',
    due_date: dueDate.toISOString().split('T')[0],
    notes: `Gönderen: ${senderName} <${senderEmail}>`,
  })

  redirect(`/dashboard/vault/${vault.id}?purchased=1`)
}

export async function purchaseVaultAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const displayName = (formData.get('display_name') as string)?.trim()
  const senderName = (formData.get('sender_name') as string)?.trim()
  const senderEmail = (formData.get('sender_email') as string)?.trim().toLowerCase()

  if (!displayName) return { error: 'Kasa adı zorunludur' }
  if (!senderName) return { error: 'Ad Soyad zorunludur' }
  if (!senderEmail || !senderEmail.includes('@')) return { error: 'Geçerli bir e-posta girin' }

  const pricing = await fetchPricingConfig()
  const setupAmount = pricing.campaignActive && pricing.campaignVaultSetup
    ? Number(pricing.campaignVaultSetup)
    : Number(pricing.vaultSetup)

  const baseSlug = slugify(displayName)
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  const { data: vault, error: vaultErr } = await supabase.from('vaults').insert({
    owner_id: user.id,
    display_name: displayName,
    slug,
    status: 'pending_verification',
    product_type: 'life_vault',
    vault_origin: 'self',
  }).select('id').single()

  if (vaultErr || !vault) return { error: 'Vault oluşturulamadı: ' + vaultErr?.message }

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 3)

  await supabase.from('payments').insert({
    vault_id: vault.id,
    user_id: user.id,
    amount: setupAmount,
    currency: 'GEL',
    product_type: 'vault_setup',
    status: 'pending',
    payment_method: 'bank_transfer',
    due_date: dueDate.toISOString().split('T')[0],
    notes: `Gönderen: ${senderName} <${senderEmail}>`,
  })

  redirect(`/dashboard/vault/${vault.id}?purchased=1`)
}
