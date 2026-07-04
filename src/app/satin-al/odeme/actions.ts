'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendEmail } from '@/lib/email'
import { paymentVerificationPendingEmail, paymentVerificationPendingEmailSubject } from '@/lib/email/templates'

export async function markPaymentSubmitted(paymentId: string, redirectQuery: string) {
  const service = await createServiceClient()

  const { data: payment } = await service
    .from('payments')
    .select('status, order_code, order_locale, user_id')
    .eq('id', paymentId)
    .maybeSingle()

  if (payment && payment.status === 'pending') {
    await service
      .from('payments')
      .update({ status: 'payment_verification', updated_at: new Date().toISOString() })
      .eq('id', paymentId)

    const { data: profile } = await service
      .from('profiles')
      .select('email, full_name')
      .eq('id', payment.user_id)
      .maybeSingle()

    if (profile?.email) {
      try {
        await sendEmail({
          to: profile.email,
          subject: paymentVerificationPendingEmailSubject(payment.order_locale),
          html: paymentVerificationPendingEmail({
            recipientName: profile.full_name ?? '',
            orderCode: payment.order_code,
            locale: payment.order_locale,
          }),
        })
      } catch (e) {
        console.error('[markPaymentSubmitted] payment verification email error:', e)
      }
    }
  }

  revalidatePath(`/satin-al/odeme/${paymentId}`)
  redirect(`/satin-al/odeme/${paymentId}${redirectQuery}`)
}
