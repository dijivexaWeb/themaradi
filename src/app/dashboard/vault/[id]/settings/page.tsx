import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { updateVaultAction, deleteVaultAction, linkQRToVaultAction } from '@/lib/actions/vault'

interface Props { params: Promise<{ id: string }> }

export default async function SettingsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('*').eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const { data: linkedQRs } = await supabase.from('dynamic_qr').select('qr_hash, activated_at, redirect_count').eq('target_vault_id', id)

  const pub = (vault.pub_settings ?? {}) as Record<string, boolean>

  async function update(formData: FormData) { 'use server'; await updateVaultAction(id, formData) }
  async function del() { 'use server'; await deleteVaultAction(id) }
  async function linkQR(formData: FormData) { 'use server'; await linkQRToVaultAction(id, formData.get('qr_hash') as string) }

  async function savePubSettings(formData: FormData) {
    'use server'
    const sup = await createClient()
    const { data: { user: u } } = await sup.auth.getUser()
    if (!u) return
    const { data: v } = await sup.from('vaults').select('id').eq('id', id).eq('owner_id', u.id).single()
    if (!v) return
    const settings = {
      auto_publish_on_death: formData.get('auto_publish_on_death') === 'on',
      require_heir_approval: formData.get('require_heir_approval') === 'on',
      show_family_tree: formData.get('show_family_tree') === 'on',
      show_memories: formData.get('show_memories') === 'on',
      show_media: formData.get('show_media') === 'on',
      show_biography: formData.get('show_biography') === 'on',
    }
    await sup.from('vaults').update({ pub_settings: settings }).eq('id', id)
    revalidatePath(`/dashboard/vault/${id}/settings`)
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-300">Kasalar</Link>
          <span>/</span>
          <Link href={`/dashboard/vault/${id}`} className="hover:text-slate-300">{vault.display_name}</Link>
          <span>/</span>
          <span className="text-slate-300">Ayarlar</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-6">Kasa Ayarları</h1>

        <div className="glass border border-slate-800/60 rounded-2xl p-6 mb-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Genel Bilgiler</h2>
          <form action={update} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Kasa Adı</label>
              <input type="text" name="display_name" defaultValue={vault.display_name} required
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Doğum Tarihi</label>
                <input type="date" name="birth_date" defaultValue={vault.birth_date ?? ''}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Vefat Tarihi</label>
                <input type="date" name="death_date" defaultValue={vault.death_date ?? ''}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
              </div>
            </div>
            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Kaydet
            </button>
          </form>
        </div>

        <div className="glass border border-slate-800/60 rounded-2xl p-6 mb-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-1">QR Kod Eşleştirme</h2>
          <p className="text-xs text-slate-500 mb-4">Mermer atölyesinden aldığınız QR hash kodunu girerek mezar taşı QR kodunu bu kasaya bağlayın.</p>
          {linkedQRs && linkedQRs.length > 0 && (
            <div className="mb-4 space-y-2">
              {linkedQRs.map((qr) => (
                <div key={qr.qr_hash} className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-4 py-3">
                  <span className="text-lg">📱</span>
                  <div className="flex-1">
                    <div className="text-xs font-mono text-slate-300">{qr.qr_hash}</div>
                    <div className="text-xs text-slate-500">{qr.redirect_count ?? 0} okuma</div>
                  </div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                </div>
              ))}
            </div>
          )}
          <form action={linkQR} className="flex gap-3">
            <input type="text" name="qr_hash" placeholder="QR hash kodu..." required
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-amber-500" />
            <button type="submit" className="bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
              Eşleştir
            </button>
          </form>
        </div>

        {/* pub_settings — post-death publication preferences */}
        <div className="glass border border-slate-800/60 rounded-2xl p-6 mb-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-1">Ölüm Sonrası Yayın Ayarları</h2>
          <p className="text-xs text-slate-500 mb-4">
            Vefatınızdan sonra anma sayfanızın nasıl yayınlanacağını önceden belirleyin.
          </p>
          <form action={savePubSettings} className="space-y-3">
            {([
              ['auto_publish_on_death', 'Ölümümden sonra otomatik olarak yayınla', pub.auto_publish_on_death],
              ['require_heir_approval', 'Yayınlamadan önce varis onayı iste', pub.require_heir_approval !== false],
              ['show_biography', 'Hayat hikayemi göster', pub.show_biography !== false],
              ['show_family_tree', 'Aile ağacımı göster', pub.show_family_tree !== false],
              ['show_memories', 'Anılarımı göster', pub.show_memories !== false],
              ['show_media', 'Fotoğraf ve videolarımı göster', pub.show_media !== false],
            ] as [string, string, boolean][]).map(([name, label, defaultVal]) => (
              <label key={name} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" name={name} defaultChecked={defaultVal}
                    className="sr-only peer" />
                  <div className="w-9 h-5 bg-slate-700 peer-checked:bg-amber-500 rounded-full transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-4" />
                </div>
                <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">{label}</span>
              </label>
            ))}
            <div className="pt-2">
              <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Yayın Ayarlarını Kaydet
              </button>
            </div>
          </form>
        </div>

        <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-red-400 mb-2">Tehlikeli Alan</h2>
          <p className="text-xs text-slate-500 mb-4">
            Kasayı silmek geri alınamaz. Tüm medya, varis bilgileri ve mesajlar kalıcı olarak silinir.
          </p>
          <form action={del}>
            <button type="submit" className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              Kasayı Kalıcı Olarak Sil
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
