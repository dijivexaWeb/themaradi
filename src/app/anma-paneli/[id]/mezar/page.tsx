import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { saveMemorialCemeteryAction } from '../actions'
import { MapPin, Clock, Hash, Info } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

export default async function MemorialMezarPage({ params, searchParams }: Props) {
  const { id } = await params
  const { saved } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select(
      'id, display_name, status, cemetery_name, cemetery_address, cemetery_lat, cemetery_lng, cemetery_plot, cemetery_row, cemetery_hours, cemetery_note',
    )
    .eq('id', id)
    .eq('owner_id', user.id)
    .eq('product_type', 'memorial_profile')
    .single()
  if (!vault) notFound()

  const isLocked = vault.status === 'pending_verification'
  const hasCemetery = !!(vault.cemetery_name || vault.cemetery_lat)
  const saveAction = saveMemorialCemeteryAction.bind(null, id)

  const inputCls =
    'w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10 disabled:opacity-40'
  const labelCls = 'mb-1.5 block text-xs font-semibold text-[#4a5e55]'

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-5 flex items-center gap-2 text-sm">
          <Link href={`/anma-paneli/${id}`} className="text-[#788177] transition-colors hover:text-[#174f35]">
            {vault.display_name}
          </Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Defin Bilgileri</span>
        </div>

        <div className="mb-6">
          <h1 className="font-serif text-3xl text-[#1f2d27]">Defin Bilgileri</h1>
          <p className="mt-1 text-sm text-[#788177]">
            Mezarlık adı, konumu ve ziyaret saatleri anma sayfasında görüntülenir.
          </p>
        </div>

        {saved && (
          <div className="mb-5 rounded-2xl border border-[#cfe7d3] bg-[#e9f5ec] px-5 py-4 text-sm font-medium text-[#176b3f]">
            ✓ Defin bilgileri kaydedildi.
          </div>
        )}

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra defin bilgilerini girebilirsiniz.
          </div>
        )}

        <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] shadow-[0_4px_24px_rgba(64,48,24,0.06)]">
          <form action={saveAction} className="divide-y divide-[#e5dccb]">
            {/* Mezarlık adı ve adresi */}
            <div className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#b08340]" />
                <h2 className="font-semibold text-[#1f2d27]">Konum</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Mezarlık Adı</label>
                  <input
                    type="text"
                    name="cemetery_name"
                    defaultValue={vault.cemetery_name ?? ''}
                    disabled={isLocked}
                    placeholder="Zincirlikuyu Mezarlığı"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Adres</label>
                  <textarea
                    name="cemetery_address"
                    defaultValue={vault.cemetery_address ?? ''}
                    disabled={isLocked}
                    placeholder="Sokak, semt, şehir..."
                    rows={2}
                    className={`${inputCls} resize-none`}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Enlem (Latitude)</label>
                    <input
                      type="number"
                      name="cemetery_lat"
                      step="any"
                      defaultValue={vault.cemetery_lat ?? ''}
                      disabled={isLocked}
                      placeholder="41.0082"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Boylam (Longitude)</label>
                    <input
                      type="number"
                      name="cemetery_lng"
                      step="any"
                      defaultValue={vault.cemetery_lng ?? ''}
                      disabled={isLocked}
                      placeholder="28.9784"
                      className={inputCls}
                    />
                  </div>
                </div>
                {vault.cemetery_lat && vault.cemetery_lng && (
                  <a
                    href={`https://maps.google.com/?q=${vault.cemetery_lat},${vault.cemetery_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#c7a76f] px-4 py-2 text-xs font-semibold text-[#173d31] transition-colors hover:bg-[#f4eee3]"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Google Haritada Gör →
                  </a>
                )}
              </div>
            </div>

            {/* Parsel / Sıra */}
            <div className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Hash className="h-4 w-4 text-[#b08340]" />
                <h2 className="font-semibold text-[#1f2d27]">Mezar Bilgileri</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Parsel / Parça No</label>
                  <input
                    type="text"
                    name="cemetery_plot"
                    defaultValue={vault.cemetery_plot ?? ''}
                    disabled={isLocked}
                    placeholder="A-12"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Sıra No</label>
                  <input
                    type="text"
                    name="cemetery_row"
                    defaultValue={vault.cemetery_row ?? ''}
                    disabled={isLocked}
                    placeholder="7"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Ziyaret saatleri ve not */}
            <div className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#b08340]" />
                <h2 className="font-semibold text-[#1f2d27]">Ziyaret Bilgileri</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Ziyaret Saatleri</label>
                  <input
                    type="text"
                    name="cemetery_hours"
                    defaultValue={vault.cemetery_hours ?? ''}
                    disabled={isLocked}
                    placeholder="Her gün 08:00 – 18:00"
                    className={inputCls}
                  />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-[#b08340]" />
                    <label className={`${labelCls} mb-0`}>Ziyaretçi Notu</label>
                  </div>
                  <textarea
                    name="cemetery_note"
                    defaultValue={vault.cemetery_note ?? ''}
                    disabled={isLocked}
                    placeholder="Mezarlığa ulaşım, otopark, dikkat edilmesi gerekenler..."
                    rows={3}
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-6">
              <button
                type="submit"
                disabled={isLocked}
                className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(23,79,53,0.18)] transition-colors hover:bg-[#123f2b] disabled:opacity-40"
              >
                Defin Bilgilerini Kaydet
              </button>
              {hasCemetery && (
                <span className="flex items-center gap-1.5 text-xs text-[#174f35]">
                  <MapPin className="h-3.5 w-3.5" />
                  Konum tanımlı
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
