'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendEmail } from '@/lib/email'
import { paymentVerificationPendingEmail, paymentVerificationPendingEmailSubject } from '@/lib/email/templates'
import { createBogOrder, getBogSettings } from '@/lib/bog'

// Form action olarak kullanıldığı için (void döner) hata durumlarında return
// yerine ödeme sayfasına ?bog=fail ile geri yönlendiriyoruz.
export async function initiateBogPayment(paymentId: string) {
  const service = await createServiceClient()
  const failUrl = `/satin-al/odeme/${paymentId}?bog=fail`

  const { data: payment } = await service
    .from('payments')
    .select('id, order_code, amount, currency, status, order_locale, notes')
    .eq('id', paymentId)
    .maybeSingle()

  if (!payment) redirect(failUrl)

  const settings = await getBogSettings()
  if (!settings.enabled) redirect(failUrl)

  if (payment.currency !== 'GEL' && payment.currency !== 'USD' && payment.currency !== 'EUR' && payment.currency !== 'GBP') {
    redirect(failUrl)
  }

  let bogOrder
  try {
    bogOrder = await createBogOrder({
      paymentId: payment.id,
      orderCode: payment.order_code,
      amount: Number(payment.amount),
      currency: payment.currency,
      description: `The Eternal Memory — ${payment.order_code}`,
      locale: payment.order_locale === 'ka' ? 'ka' : 'en',
    })
  } catch (e) {
    console.error('[initiateBogPayment] BOG sipariş oluşturma hatası:', e)
    redirect(failUrl)
  }

  await service
    .from('payments')
    .update({ external_payment_id: bogOrder.orderId, payment_method: 'bog_card', updated_at: new Date().toISOString() })
    .eq('id', paymentId)

  redirect(bogOrder.redirectUrl)
}

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
