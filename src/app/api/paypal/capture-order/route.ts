import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { captureOrder } from '@/lib/paypal'

export async function POST(req: NextRequest) {
  try {
    const { orderId, vaultId } = await req.json() as { orderId: string; vaultId: string }

    if (!orderId || !vaultId) {
      return NextResponse.json({ error: 'orderId ve vaultId zorunludur' }, { status: 400 })
    }

    // orderId bu vault'a ait mi doğrula — vault swap saldırısını önler
    const { data: payment } = await service
      .from('payments')
      .select('id')
      .eq('vault_id', vaultId)
      .eq('external_payment_id', orderId)
      .eq('status', 'pending')
      .single()

    if (!payment) {
      return NextResponse.json({ error: 'Geçersiz ödeme isteği' }, { status: 403 })
    }

    const capture = await captureOrder(orderId)

    if (capture.status !== 'COMPLETED') {
      return NextResponse.json({ error: `Ödeme tamamlanamadı: ${capture.status}` }, { status: 400 })
    }

    const service = await createServiceClient()

    await service.from('payments')
      .update({ status: 'paid', paid_at: new Date().toISOString(), payment_method: 'paypal', notes: `PayPal Order: ${orderId}` })
      .eq('vault_id', vaultId)
      .eq('status', 'pending')

    await service.from('vaults')
      .update({ status: 'pending_verification' })
      .eq('id', vaultId)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[paypal/capture-order]', err)
    return NextResponse.json({ error: 'Ödeme tahsil edilemedi' }, { status: 500 })
  }
}
