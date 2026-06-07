'use client'

import { updatePaymentStatus } from '../actions'
import { useState } from 'react'

const STATUSES = ['pending', 'paid', 'overdue', 'failed', 'refunded', 'cancelled']

export default function PaymentStatusForm({ paymentId, currentStatus }: { paymentId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value
    if (!window.confirm(`Durumu "${newStatus}" olarak değiştir?`)) return
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
      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  )
}
