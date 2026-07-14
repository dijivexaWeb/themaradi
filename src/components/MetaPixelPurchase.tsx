'use client'

import { useEffect } from 'react'

// Ödeme kesin olarak onaylandığında (kartla anında ya da banka havalesi admin
// onayından sonra bu sayfaya tekrar gelindiğinde) Facebook Pixel'e GERÇEK bir
// Purchase event'i gönderir. localStorage ile sipariş başına tek sefer ateşlenir
// — sayfa yenilense/tekrar ziyaret edilse bile sahte/tekrarlı satış sayılmaz.
export default function MetaPixelPurchase({
  paymentId,
  amount,
  currency,
  contentName,
}: {
  paymentId: string
  amount: number
  currency: string
  contentName: string
}) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const key = `fb_purchase_tracked_${paymentId}`
    if (localStorage.getItem(key)) return

    // MetaPixel'in <Script strategy="afterInteractive"> etiketi bu component'ten
    // sonra çalışabiliyor — fbq henüz tanımlı olmayabilir, kısa süre yoklayarak bekliyoruz.
    let attempts = 0
    const timer = setInterval(() => {
      attempts++
      const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq
      if (typeof fbq === 'function') {
        clearInterval(timer)
        fbq('track', 'Purchase', {
          value: amount,
          currency,
          content_name: contentName,
          content_ids: [paymentId],
          content_type: 'product',
        })
        localStorage.setItem(key, '1')
      } else if (attempts >= 20) {
        clearInterval(timer)
      }
    }, 250)

    return () => clearInterval(timer)
  }, [paymentId, amount, currency, contentName])

  return null
}
