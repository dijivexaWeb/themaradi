import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
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

  async function update(formData: FormData) { 'use server'; await updateVaultAction(id, formData) }
  async function del() { 'use server'; await deleteVaultAction(id) }
  async function linkQR(formData: FormData) { 'use server'; await linkQRToVaultAction(id, formData.get('qr_hash') as string) }

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
