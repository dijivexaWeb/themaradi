import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { inviteHeirAction, revokeHeirAccessAction } from '@/lib/actions/heirs'
import PersonHeader from '../_PersonHeader'

interface Props { params: Promise<{ id: string }> }

const accessLabels: Record<string, string> = {
  executor: 'Vasiy (Devralan)',
  contributor: 'Katkı Sağlayan',
  viewer: 'Sadece Görüntüleyen',
}

const relationshipLabels: Record<string, string> = {
  spouse: 'Eşi', son: 'Oğlu', daughter: 'Kızı', parent: 'Ebeveyni',
  sibling: 'Kardeşi', relative: 'Akrabası', friend: 'Arkadaşı',
  legal_representative: 'Yasal Temsilcisi', other: 'Diğer',
}

export default async function HeirsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults')
    .select('id, display_name, status, product_type, cover_photo_url, birth_date, death_date')
    .eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  if (vault.product_type === 'memorial_profile') {
    redirect(`/dashboard/vault/${id}`)
  }

  const { data: heirs } = await supabase
    .from('heirs').select('*')
    .eq('vault_id', id).order('created_at', { ascending: true })

  const isLocked = vault.status === 'pending_verification'
  const inviteWithVault = inviteHeirAction.bind(null, id)

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`
  const selectCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm mb-5">
          <Link href="/dashboard" className="text-[#788177] hover:text-[#174f35] transition-colors">Anı Alanım</Link>
          <span className="text-[#c8bfb0]">/</span>
          <Link href={`/dashboard/vault/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">{vault.display_name}</Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Yetkili Kişiler</span>
        </div>

        <PersonHeader vault={vault} sectionLabel="Yetkili Kişiler" sectionIcon="👥" />

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra yetkili kişi ekleyebilirsiniz.
          </div>
        )}

        <div className="mb-7">
          <h1 className="font-serif text-3xl text-[#1f2d27] mb-1">Yetkili Kişiler</h1>
          <p className="text-sm text-[#788177]">
            Yetkili kişiler özel içeriklerinize erişebilir.
            <span className="font-semibold text-[#1f2d27]"> Vasiy</span> olarak atanan kişi anı alanını devralabilir.
          </p>
        </div>

        {!isLocked && (
          <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)] mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">✉️</span>
              <h2 className="font-semibold text-[#1f2d27]">Yeni Yetkili Davet Et</h2>
            </div>
            <form action={inviteWithVault} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Ad Soyad <span className="text-[#dfbd72]">*</span></label>
                  <input type="text" name="full_name" required placeholder="Ali Yılmaz" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>E-posta <span className="text-[#dfbd72]">*</span></label>
                  <input type="email" name="email" required placeholder="varis@email.com" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Yakınlık</label>
                  <select name="relationship" className={selectCls}>
                    <option value="">Seç...</option>
                    {Object.entries(relationshipLabels).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Yetki Seviyesi <span className="text-[#dfbd72]">*</span></label>
                  <select name="access_level" required className={selectCls}>
                    <option value="executor">Vasiy — Devralır</option>
                    <option value="contributor">Katkı Sağlayan</option>
                    <option value="viewer">Sadece Görüntüler</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Telefon (opsiyonel)</label>
                <input type="tel" name="phone" placeholder="+90 555 555 55 55" className={inputCls} />
              </div>
              <button type="submit"
                className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors">
                Davet Gönder
              </button>
            </form>
          </div>
        )}

        {!heirs?.length ? (
          <div className="rounded-3xl border border-dashed border-[#e5dccb] bg-[#fffdf8] py-20 text-center">
            <p className="text-6xl mb-4">👥</p>
            <p className="font-serif text-xl text-[#1f2d27] mb-1">Henüz yetkili kişi yok</p>
            <p className="text-sm text-[#788177] max-w-xs mx-auto">Güvendiğiniz kişileri davet ederek içeriklerinize erişim verin.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {heirs.map((heir) => {
              const isExpired = heir.invitation_expires_at ? new Date(heir.invitation_expires_at) < new Date() : false
              const statusLabel = heir.accepted_at ? 'Kabul Etti' : isExpired ? 'Süresi Doldu' : 'Davet Gönderildi'
              const statusColor = heir.accepted_at
                ? 'text-[#174f35] bg-[#f0fdf4] border-[#174f35]/20'
                : isExpired
                  ? 'text-red-600 bg-red-50 border-red-200'
                  : 'text-[#725212] bg-[#fff7e6] border-[#dfbd72]/50'
              const revoke = revokeHeirAccessAction.bind(null, heir.id, id)

              return (
                <div key={heir.id}
                  className="group rounded-2xl border border-[#e5dccb] bg-white px-5 py-4 flex items-center gap-4 hover:border-[#174f35]/20 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-full bg-[#174f35]/10 flex items-center justify-center text-sm font-bold text-[#174f35] shrink-0">
                    {(heir.full_name ?? heir.heir_email)[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    {heir.full_name && <div className="text-sm font-semibold text-[#1f2d27]">{heir.full_name}</div>}
                    <div className="text-xs text-[#788177] truncate">{heir.heir_email}</div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-[#adb5ab]">{accessLabels[heir.access_level ?? ''] ?? heir.access_level}</span>
                      {heir.relationship && (
                        <>
                          <span className="text-[#e5dccb]">·</span>
                          <span className="text-[11px] text-[#adb5ab]">{relationshipLabels[heir.relationship] ?? heir.relationship}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={`text-xs px-2.5 py-1 rounded-full border shrink-0 font-medium ${statusColor}`}>{statusLabel}</div>
                  {!isLocked && (
                    <form action={revoke}>
                      <button type="submit"
                        className="text-[#e5dccb] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs font-medium">
                        Kaldır
                      </button>
                    </form>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
