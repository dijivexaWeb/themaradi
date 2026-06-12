'use client'

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface FormData {
  productType: 'memorial_one_time' | 'vault_setup'
  displayName: string
  senderName: string
  senderEmail: string
  password?: string
  phone: string
  emailConsent: boolean
  phoneConsent: boolean
}

interface Props {
  clientId: string
  formData: FormData
  onError?: (msg: string) => void
}

export default function PayPalCheckoutButton({ clientId, formData, onError }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <PayPalScriptProvider options={{ clientId, currency: 'USD', intent: 'capture' }}>
      <div className={pending ? 'pointer-events-none opacity-60' : ''}>
        <PayPalButtons
          style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 48 }}
          forceReRender={[formData]}
          createOrder={async () => {
            setPending(true)
            const res = await fetch('/api/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData),
            })
            const data = await res.json()
            if (!res.ok || !data.orderId) {
              setPending(false)
              onError?.(data.error ?? 'Sipariş oluşturulamadı')
              throw new Error(data.error ?? 'Sipariş oluşturulamadı')
            }
            sessionStorage.setItem('pp_vault', JSON.stringify({ vaultId: data.vaultId, redirectUrl: data.redirectUrl }))
            return data.orderId as string
          }}
          onApprove={async (data) => {
            try {
              const stored = sessionStorage.getItem('pp_vault')
              const { vaultId, redirectUrl } = stored ? JSON.parse(stored) : {}
              const res = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: data.orderID, vaultId }),
              })
              const result = await res.json()
              if (!res.ok) {
                onError?.(result.error ?? 'Ödeme tahsil edilemedi')
                return
              }
              sessionStorage.removeItem('pp_vault')
              router.push(redirectUrl ?? '/dashboard')
            } catch {
              onError?.('Ödeme doğrulanamadı')
            } finally {
              setPending(false)
            }
          }}
          onError={() => {
            onError?.('PayPal ödeme işlemi başarısız oldu')
            setPending(false)
          }}
          onCancel={() => {
            setPending(false)
          }}
        />
      </div>
    </PayPalScriptProvider>
  )
}
