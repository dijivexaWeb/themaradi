'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface BulkImportRow {
  full_name: string
  birth_date: string | null
  death_date: string | null
  address: string | null
  national_id: string | null
  phone: string | null
  cemetery_name: string | null
}

export interface BulkImportRowResult {
  full_name: string
  success: boolean
  login_username?: string
  password?: string
  vaultId?: string
  error?: string
}

const CLAIM_EMAIL_DOMAIN = 'claim.theeternalmemory.com'
const CONCURRENCY = 15
const MAX_ROWS = 1500

function usernamePart(str: string): string {
  return str
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, '')
    .trim().replace(/\s+/g, '.')
}

function vaultSlugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

function randomSuffix(n = 8): string {
  return Math.random().toString(36).slice(2, 2 + n)
}

function randomPassword(): string {
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `TEM-${digits}`
}

export async function createBulkImportBatch(
  rows: BulkImportRow[],
  sourceFilename: string
): Promise<{ success: boolean; batchId?: string; results?: BulkImportRowResult[]; error?: string }> {
  const { user, profile } = await requireAdmin()

  if (!rows.length) return { success: false, error: 'Kayıt listesi boş.' }
  if (rows.length > MAX_ROWS) {
    return { success: false, error: `Tek seferde en fazla ${MAX_ROWS} kayıt yüklenebilir.` }
  }
  for (const row of rows) {
    if (!row.full_name?.trim()) {
      return { success: false, error: 'Ad soyad boş olan satır(lar) var — yükleme öncesi listeyi tekrar kontrol et.' }
    }
  }

  const supabase = await createServiceClient()

  const { data: batch, error: batchError } = await supabase
    .from('bulk_import_batches')
    .insert({
      uploaded_by: user.id,
      source_filename: sourceFilename,
      total_rows: rows.length,
    })
    .select('id')
    .single()

  if (batchError || !batch) {
    return { success: false, error: batchError?.message ?? 'Batch oluşturulamadı.' }
  }
  const batchId = batch.id

  const { data: existing } = await supabase
    .from('vaults')
    .select('login_username')
    .not('login_username', 'is', null)

  const usedUsernames = new Set((existing ?? []).map((r) => r.login_username as string))

  function nextUsername(fullName: string): string {
    const base = usernamePart(fullName) || 'kullanici'
    if (!usedUsernames.has(base)) {
      usedUsernames.add(base)
      return base
    }
    let i = 2
    while (usedUsernames.has(`${base}${i}`)) i++
    const candidate = `${base}${i}`
    usedUsernames.add(candidate)
    return candidate
  }

  const results: BulkImportRowResult[] = new Array(rows.length)

  async function processRow(row: BulkImportRow, index: number) {
    const username = nextUsername(row.full_name)
    const password = randomPassword()
    const email = `${username}@${CLAIM_EMAIL_DOMAIN}`

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      results[index] = { full_name: row.full_name, success: false, error: authError?.message ?? 'Hesap oluşturulamadı.' }
      return
    }
    const newUserId = authData.user.id

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: newUserId,
      full_name: row.full_name.trim(),
      email,
      phone: row.phone || null,
      role: 'user',
    }, { onConflict: 'id' })

    if (profileError) {
      await supabase.auth.admin.deleteUser(newUserId)
      results[index] = { full_name: row.full_name, success: false, error: profileError.message }
      return
    }

    const slug = `${vaultSlugify(row.full_name)}-${randomSuffix()}`
    const { data: vault, error: vaultError } = await supabase.from('vaults').insert({
      owner_id: newUserId,
      display_name: row.full_name.trim(),
      slug,
      status: 'unclaimed',
      vault_origin: 'bulk_import',
      product_type: 'memorial_profile',
      birth_date: row.birth_date,
      death_date: row.death_date,
      national_id: row.national_id,
      phone: row.phone,
      shipping_address: row.address,
      cemetery_name: row.cemetery_name,
      login_username: username,
      bulk_batch_id: batchId,
      hide_objection: true,
    }).select('id').single()

    if (vaultError || !vault) {
      await supabase.auth.admin.deleteUser(newUserId)
      results[index] = { full_name: row.full_name, success: false, error: vaultError?.message ?? 'Profil oluşturulamadı.' }
      return
    }

    results[index] = {
      full_name: row.full_name,
      success: true,
      login_username: username,
      password,
      vaultId: vault.id,
    }
  }

  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    const chunk = rows.slice(i, i + CONCURRENCY)
    await Promise.all(chunk.map((row, j) => processRow(row, i + j)))
  }

  const createdCount = results.filter((r) => r.success).length

  await supabase
    .from('bulk_import_batches')
    .update({ created_count: createdCount })
    .eq('id', batch.id)

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'bulk_import_created',
    entityType: 'bulk_import_batch',
    entityId: batch.id,
    newValue: { total_rows: rows.length, created_count: createdCount, source_filename: sourceFilename },
  })

  revalidatePath('/admin/bulk-import')
  revalidatePath('/admin/memorials')

  return { success: true, batchId: batch.id, results }
}

// ─── Takip ekranı ───────────────────────────────────────────────────────────

const PRINT_FLAGS = ['qr_label_printed', 'waybill_printed', 'letter_printed', 'guide_printed'] as const
export type PrintFlag = (typeof PRINT_FLAGS)[number]

export async function setBulkPrintFlag(
  vaultId: string,
  field: PrintFlag,
  value: boolean
): Promise<{ success: boolean; error?: string }> {
  const { user, profile } = await requireAdmin()
  if (!PRINT_FLAGS.includes(field)) return { success: false, error: 'Geçersiz alan.' }

  const supabase = await createServiceClient()
  const { error } = await supabase.from('vaults').update({ [field]: value }).eq('id', vaultId)
  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: value ? 'bulk_import_flag_set' : 'bulk_import_flag_unset',
    entityType: 'vault',
    entityId: vaultId,
    newValue: { field, value },
  })

  revalidatePath('/admin/bulk-import/takip')
  return { success: true }
}

export async function adminPublishBulkVault(vaultId: string): Promise<{ success: boolean; error?: string }> {
  const { user, profile } = await requireAdmin()
  const supabase = await createServiceClient()

  const { data: vault } = await supabase
    .from('vaults')
    .select('status, vault_origin')
    .eq('id', vaultId)
    .single()

  if (!vault || vault.vault_origin !== 'bulk_import' || vault.status !== 'unclaimed') {
    return { success: false, error: 'Bu profil sahiplenilmeyi bekliyor durumda değil.' }
  }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('vaults')
    .update({ status: 'public_memorial', claimed_at: now, published_at: now })
    .eq('id', vaultId)

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'bulk_import_admin_published',
    entityType: 'vault',
    entityId: vaultId,
  })

  revalidatePath('/admin/bulk-import/takip')
  revalidatePath('/admin/memorials')
  return { success: true }
}
