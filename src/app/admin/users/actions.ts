'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { accountActivatedEmail } from '@/lib/email/templates'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theeternalmemory.com'

const userIdSchema = z.string().uuid()
const roleSchema = z.enum(['user', 'admin', 'moderator'])
const banDurationSchema = z.enum(['24h', '168h', '720h', '876000h'])

type ActionResult = { success: boolean; error?: string }

export async function updateUserRole(
  userId: string,
  role: 'user' | 'admin' | 'moderator'
): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()

  const parsedUserId = userIdSchema.safeParse(userId)
  if (!parsedUserId.success) return { success: false, error: 'Geçersiz kullanıcı ID' }

  const parsedRole = roleSchema.safeParse(role)
  if (!parsedRole.success) return { success: false, error: 'Geçersiz rol' }

  const supabase = await createServiceClient()

  const { data: oldProfile, error: oldProfileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', parsedUserId.data)
    .single()

  if (oldProfileError) return { success: false, error: oldProfileError.message }

  const { error } = await supabase
    .from('profiles')
    .update({ role: parsedRole.data, updated_at: new Date().toISOString() })
    .eq('id', parsedUserId.data)

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'user_role_changed',
    entityType: 'profile',
    entityId: parsedUserId.data,
    oldValue: { role: oldProfile.role },
    newValue: { role: parsedRole.data },
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function banUserAction(formData: FormData): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()

  const parsed = z.object({
    userId: userIdSchema,
    duration: banDurationSchema,
    reason: z.string().trim().min(3).max(500),
  }).safeParse({
    userId: formData.get('user_id'),
    duration: formData.get('duration'),
    reason: formData.get('reason'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Geçersiz ban verisi' }
  }

  if (parsed.data.userId === user.id) {
    return { success: false, error: 'Kendinizi banlayamazsınız' }
  }

  const supabase = await createServiceClient()
  const { data, error } = await supabase.auth.admin.updateUserById(parsed.data.userId, {
    ban_duration: parsed.data.duration,
  })

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'user_banned',
    entityType: 'auth_user',
    entityId: parsed.data.userId,
    newValue: {
      duration: parsed.data.duration,
      reason: parsed.data.reason,
      banned_until: data.user?.banned_until ?? null,
    },
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function confirmUserEmailAction(userId: string): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()

  const parsedUserId = userIdSchema.safeParse(userId)
  if (!parsedUserId.success) return { success: false, error: 'Geçersiz kullanıcı ID' }

  const supabase = await createServiceClient()

  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', parsedUserId.data)
    .single()

  const { error } = await supabase.auth.admin.updateUserById(parsedUserId.data, {
    email_confirm: true,
  })

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'user_email_confirmed',
    entityType: 'auth_user',
    entityId: parsedUserId.data,
    newValue: { email_confirmed_at: new Date().toISOString() },
  })

  if (targetProfile?.email) {
    try {
      await sendEmail({
        to: targetProfile.email,
        subject: 'Hesabınız aktifleştirildi — The Eternal Memory',
        html: accountActivatedEmail({
          authorName: targetProfile.full_name ?? targetProfile.email,
          loginUrl: `${SITE_URL}/giris`,
        }),
      })
    } catch (e) {
      console.error('[confirmUserEmailAction] email error:', e)
    }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function unbanUserAction(userId: string): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()

  const parsedUserId = userIdSchema.safeParse(userId)
  if (!parsedUserId.success) return { success: false, error: 'Geçersiz kullanıcı ID' }

  if (parsedUserId.data === user.id) {
    return { success: false, error: 'Kendi ban durumunuzu değiştiremezsiniz' }
  }

  const supabase = await createServiceClient()
  const { data, error } = await supabase.auth.admin.updateUserById(parsedUserId.data, {
    ban_duration: 'none',
  })

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'user_unbanned',
    entityType: 'auth_user',
    entityId: parsedUserId.data,
    newValue: { banned_until: data.user?.banned_until ?? null },
  })

  revalidatePath('/admin/users')
  return { success: true }
}
