'use client'

import { updatePaymentStatus } from '../actions'
import { useState } from 'react'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'order_created', label: 'Sipariş Oluşturuldu' },
  { value: 'pending', label: 'Ödeme Bekliyor' },
  { value: 'payment_verification', label: 'Doğrulama Bekliyor' },
  { value: 'paid', label: 'Ödendi' },
  { value: 'info_pending', label: 'Bilgi Bekleniyor' },
  { value: 'profile_preparing', label: 'Profil Hazırlanıyor' },
  { value: 'publish_approval', label: 'Yayın Onayı Bekliyor' },
  { value: 'published', label: 'Yayında' },
  { value: 'completed', label: 'Tamamlandı' },
  { value: 'overdue', label: 'Vadesi Geçmiş' },
  { value: 'failed', label: 'Başarısız' },
  { value: 'refunded', label: 'İade Edildi' },
  { value: 'cancelled', label: 'İptal' },
]

export default function PaymentStatusForm({ paymentId, currentStatus }: { paymentId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value
    const newLabel = STATUS_OPTIONS.find((s) => s.value === newStatus)?.label ?? newStatus
    if (!window.confirm(`Durumu "${newLabel}" olarak değiştir?`)) return
    setLoading(true)
    const result = await updatePaymentStatus(paymentId, newStatus)
    setLoading(false)
    if (result.success) setStatus(newStatus)
    else alert(result.error)
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading}
      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 outline-none focus:border-emerald-400 disabled:opacity-50"
    >
      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
    </select>
  )
}
