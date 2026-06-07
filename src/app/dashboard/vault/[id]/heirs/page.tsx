import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { inviteHeirAction, revokeHeirAccessAction } from '@/lib/actions/heirs'

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

  const { data: vault } = await supabase.from('vaults').select('id, display_name, status, product_type').eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  // Sadece life_vault'ta varis yönetimi var
  if (vault.product_type === 'memorial_profile') {
    redirect(`/dashboard/vault/${id}`)
  }

  const { data: heirs } = await supabase
    .from('heirs')
    .select('*')
    .eq('vault_id', id)
    .order('created_at', { ascending: true })

  const isLocked = vault.status === 'pending_verification'
  const inviteWithVault = inviteHeirAction.bind(null, id)

  const fieldCls = `w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500`
  const selectCls = `bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 w-full`

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-300">Kasalarım</Link>
          <span>/</span>
          <Link href={`/dashboard/vault/${id}`} className="hover:text-slate-300">{vault.display_name}</Link>
          <span>/</span>
          <span className="text-slate-300">Varisler</span>
        </div>

        {isLocked && (
          <div className="mb-5 bg-amber-900/20 border border-amber-500/30 text-amber-400 text-sm rounded-xl px-4 py-3">
            ⏳ Ödeme doğrulandıktan sonra varis ekleyebilirsiniz.
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Varisler ve Yetkililer</h1>
          <div className="glass border border-slate-700/50 rounded-xl px-4 py-3">
            <p className="text-sm text-slate-400 leading-6">
              Varisler ölümünüzden sonra gizli kasanıza erişebilir ve içerikleri görüntüleyebilir.
              <strong className="text-slate-200"> Vasiy</strong> olarak atanan kişi kasayı devralabilir.
              Davet e-posta ile gönderilir ve onay gerektirir.
            </p>
          </div>
        </div>

        {!isLocked && (
          <div className="glass border border-slate-800/60 rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Yeni Varis Davet Et</h2>
            <form action={inviteWithVault} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Ad Soyad <span className="text-amber-400">*</span></label>
                  <input type="text" name="full_name" required placeholder="Ali Yılmaz" className={fieldCls} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">E-posta <span className="text-amber-400">*</span></label>
                  <input type="email" name="email" required placeholder="varis@email.com" className={fieldCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Yakınlık</label>
                  <select name="relationship" className={selectCls}>
                    <option value="">Seç...</option>
                    {Object.entries(relationshipLabels).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Yetki Seviyesi</label>
                  <select name="access_level" required className={selectCls}>
                    <option value="executor">Vasiy — Devralır</option>
                    <option value="contributor">Katkı Sağlayan</option>
                    <option value="viewer">Sadece Görüntüler</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Telefon (opsiyonel)</label>
                <input type="tel" name="phone" placeholder="+90 555 555 55 55" className={fieldCls} />
              </div>
              <button type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Davet Gönder
              </button>
            </form>
          </div>
        )}

        {!heirs?.length ? (
          <div className="text-center py-12 text-slate-600">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-sm">Henüz varis eklenmemiş</p>
          </div>
        ) : (
          <div className="space-y-3">
            {heirs.map((heir) => {
              const isExpired = heir.invitation_expires_at ? new Date(heir.invitation_expires_at) < new Date() : false
              const statusLabel = heir.accepted_at ? 'Kabul Etti' : isExpired ? 'Süresi Doldu' : 'Davet Gönderildi'
              const statusColor = heir.accepted_at
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : isExpired
                  ? 'text-red-400 bg-red-500/10 border-red-500/20'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
              const revoke = revokeHeirAccessAction.bind(null, heir.id, id)

              return (
                <div key={heir.id} className="glass border border-slate-800/60 rounded-xl px-5 py-4 flex items-center gap-4 group">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-400/20 flex items-center justify-center text-sm font-bold text-amber-400 shrink-0">
                    {(heir.full_name ?? heir.heir_email)[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    {heir.full_name && <div className="text-sm font-medium text-slate-100">{heir.full_name}</div>}
                    <div className="text-xs text-slate-500 truncate">{heir.heir_email}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-600">{accessLabels[heir.access_level ?? ''] ?? heir.access_level}</span>
                      {heir.relationship && (
                        <>
                          <span className="text-slate-700">·</span>
                          <span className="text-[11px] text-slate-600">{relationshipLabels[heir.relationship] ?? heir.relationship}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={`text-xs px-2.5 py-1 rounded-full border shrink-0 ${statusColor}`}>{statusLabel}</div>
                  {!isLocked && (
                    <form action={revoke}>
                      <button type="submit" className="text-slate-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs">Kaldır</button>
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
