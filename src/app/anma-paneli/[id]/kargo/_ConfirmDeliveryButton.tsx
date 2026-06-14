'use client'

import { useState, useTransition } from 'react'
import { confirmDeliveryAction } from '@/app/admin/actions'
import { useRouter } from 'next/navigation'

export default function ConfirmDeliveryButton({ vaultId }: { vaultId: string }) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const router = useRouter()

  function handleConfirm() {
    startTransition(async () => {
      const result = await confirmDeliveryAction(vaultId)
      if (result?.success) {
        setDone(true)
        router.refresh()
      }
    })
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <p className="text-emerald-700 font-semibold text-sm">✅ Teslimat onaylandı!</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-[#f0f9f4] p-5 text-center space-y-3">
      <p className="text-sm text-[#1f2d27] font-medium">Tabelanızı teslim aldınız mı?</p>
      <p className="text-xs text-slate-500">Onayladıktan sonra ekibimiz bilgilendirilecek.</p>
      <button
        onClick={handleConfirm}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-xl bg-[#174f35] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#0f3a27] disabled:opacity-50"
      >
        {isPending ? 'İşleniyor...' : '✅ Teslim Aldım'}
      </button>
    </div>
  )
}
