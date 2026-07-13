import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyBogCallbackSignature } from '@/lib/bog'
import { sendEmail } from '@/lib/email'
import { paymentConfirmedEmail, paymentConfirmedEmailSubject } from '@/lib/email/templates'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theeternalmemory.com'

// BOG server-to-server callback. İmza doğrulaması RAW body üzerinde yapılmalı —
// JSON.parse'tan önce. https://api.bog.ge/docs/en/payments/standard-process/callback
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('Callback-Signature')

  if (!verifyBogCallbackSignature(rawBody, signature)) {
    console.error('[bog/callback] imza doğrulaması başarısız')
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  let payload: { body?: { order_id?: string; order_status?: { key?: string } } }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const bogOrderId = payload.body?.order_id
  const statusKey = payload.body?.order_status?.key
  if (!bogOrderId) return NextResponse.json({ error: 'missing order_id' }, { status: 400 })

  // Sadece kesin başarı durumunda işleme alıyoruz — diğer statülerde (processing,
  // rejected vb.) sipariş "pending" kalır, kullanıcı tekrar deneyebilir.
  if (statusKey !== 'completed') {
    return NextResponse.json({ received: true, status: statusKey })
  }

  const supabase = await createServiceClient()

  const { data: payment } = await supabase
    .from('payments')
    .select('id, status, user_id, order_locale')
    .eq('external_payment_id', bogOrderId)
    .maybeSingle()

  if (!payment) {
    console.error('[bog/callback] eşleşen ödeme bulunamadı, bog_order_id:', bogOrderId)
    return NextResponse.json({ error: 'payment not found' }, { status: 404 })
  }

  if (payment.status !== 'paid') {
    await supabase
      .from('payments')
      .update({ status: 'paid', paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', payment.id)

    if (payment.user_id) {
      try {
        const { data: customerProfile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', payment.user_id)
          .maybeSingle()

        if (customerProfile?.email) {
          await sendEmail({
            to: customerProfile.email,
            subject: paymentConfirmedEmailSubject(payment.order_locale),
            html: paymentConfirmedEmail({
              recipientName: customerProfile.full_name ?? '',
              loginUrl: `${SITE_URL}/login`,
              locale: payment.order_locale,
            }),
          })
        }
      } catch (e) {
        console.error('[bog/callback] onay maili hatası:', e)
      }
    }
  }

  return NextResponse.json({ received: true })
}
