'use client'

import { useActionState } from 'react'
import { updateShippingAddressAction } from '../../actions'

export default function ShippingAddressForm({
  vaultId,
  currentAddress,
}: {
  vaultId: string
  currentAddress: string | null
}) {
  const [state, action, pending] = useActionState(updateShippingAddressAction, null)

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="vault_id" value={vaultId} />
      <textarea
        name="shipping_address"
        defaultValue={currentAddress ?? ''}
        rows={4}
        placeholder="Tam kargo adresi: isim, sokak, mahalle, ilçe, şehir, posta kodu, ülke"
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
      />
      {state?.error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">Adres güncellendi.</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
      >
        {pending ? 'Kaydediliyor...' : 'Adresi Kaydet'}
      </button>
    </form>
  )
}
