import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { confirmDeliveryAction } from '@/app/admin/actions'
import ConfirmDeliveryButton from './_ConfirmDeliveryButton'

const STATUS_STEPS = [
  { key: 'pending',   label: 'Sipariş Alındı',        icon: '✅' },
  { key: 'preparing', label: 'Hazırlanıyor',            icon: '🔄' },
  { key: 'ready',     label: 'Hazır / Paketlendi',     icon: '📫' },
  { key: 'shipped',   label: 'Kargoya Verildi',        icon: '🚚' },
  { key: 'delivered', label: 'Teslim Edildi',           icon: '🏠' },
  { key: 'confirmed', label: 'Teslim Alındı',          icon: '✅' },
]

const STATUS_ORDER = ['pending', 'preparing', 'ready', 'shipped', 'delivered', 'confirmed']

export default async function KargoTakipPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ confirm?: string }>
}) {
  const { id } = await params
  const { confirm } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, display_name, shipping_address, shipping_status, tracking_number, tracking_carrier, shipped_at, delivered_at, shipping_confirmed_at')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!vault) notFound()

  // "Teslim Aldım" link'inden gelen otomatik onay
  if (confirm === '1' && vault.shipping_status === 'delivered') {
    await confirmDeliveryAction(id)
    redirect(`/anma-paneli/${id}/kargo?confirmed=1`)
  }

  if (!vault.shipping_address) {
    return (
      <div className="px-6 py-12 max-w-xl mx-auto text-center">
        <p className="text-4xl mb-4">📦</p>
        <h1 className="font-serif text-2xl text-[#173d31] mb-3">QR Tabela</h1>
        <p className="text-[#5b5245] text-sm leading-7">
          Bu anma profili için kargo adresi henüz girilmemiş. Lütfen ekibimizle iletişime geçin.
        </p>
      </div>
    )
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(vault.shipping_status ?? 'pending')

  return (
    <div className="px-6 py-10 max-w-2xl mx-auto">
      <h1 className="font-serif text-2xl text-[#173d31] mb-1">📦 QR Tabela Kargo Durumu</h1>
      <p className="text-sm text-[#5b5245] mb-8">{vault.display_name}</p>

      {/* Durum adımları */}
      <div className="mb-8 space-y-2">
        {STATUS_STEPS.map((step, i) => {
          const isDone = i <= currentStatusIndex
          const isCurrent = i === currentStatusIndex
          return (
            <div
              key={step.key}
              className={`flex items-center gap-4 rounded-xl border px-5 py-3 transition-all ${
                isCurrent
                  ? 'border-[#174f35] bg-[#f0f9f4] font-semibold text-[#174f35]'
                  : isDone
                  ? 'border-[#e1d5c3] bg-[#fffdf8] text-[#4a5a50]'
                  : 'border-slate-100 bg-white text-slate-400'
              }`}
            >
              <span className="text-xl w-8 text-center">{isDone ? '✅' : step.icon}</span>
              <span className="text-sm">{step.label}</span>
              {isCurrent && (
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-[#174f35] text-white rounded-full px-2 py-0.5">
                  Şu an
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Kargo bilgisi */}
      {vault.tracking_number && (
        <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-5 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-3">Kargo Bilgileri</p>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Kargo Firması</span>
            <span className="font-semibold text-slate-800">{vault.tracking_carrier ?? '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Takip Numarası</span>
            <span className="font-mono font-bold text-orange-800 text-base">{vault.tracking_number}</span>
          </div>
          {vault.shipped_at && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Kargoya Verildi</span>
              <span className="text-slate-700">{new Date(vault.shipped_at).toLocaleDateString('tr-TR')}</span>
            </div>
          )}
        </div>
      )}

      {/* Teslimat adresi */}
      <div className="mb-6 rounded-xl border border-[#e1d5c3] bg-[#fffdf8] p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-[#c7a76f] mb-3">Kargo Adresi</p>
        <p className="text-sm text-[#1f2d27] leading-7 whitespace-pre-wrap">{vault.shipping_address}</p>
      </div>

      {/* Teslim Aldım butonu */}
      {vault.shipping_status === 'delivered' && (
        <ConfirmDeliveryButton vaultId={id} />
      )}

      {vault.shipping_status === 'confirmed' && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <p className="text-emerald-700 font-semibold text-sm">✅ Teslimat onaylandı!</p>
          <p className="text-emerald-600 text-xs mt-1">
            QR kodu mezar taşına yerleştirdiğinizde ziyaretçiler okutarak anma sayfasına ulaşabilir.
          </p>
        </div>
      )}
    </div>
  )
}
