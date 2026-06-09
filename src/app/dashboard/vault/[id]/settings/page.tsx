import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { updateVaultAction, deleteVaultAction, linkQRToVaultAction } from '@/lib/actions/vault'
import PersonHeader from '../_PersonHeader'

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

  async function saveSlug(formData: FormData): Promise<void> {
    'use server'
    const sup = await createClient()
    const { data: { user: u } } = await sup.auth.getUser()
    if (!u) return
    const { data: v } = await sup.from('vaults').select('id').eq('id', id).eq('owner_id', u.id).single()
    if (!v) return

    const raw = (formData.get('slug') as string)?.trim().toLowerCase()
    if (!raw) return
    const cleaned = raw
      .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
      .replace(/ö/g, 'o').replace(/ı/g, 'i').replace(/ç/g, 'c')
      .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      .substring(0, 60)
    if (cleaned.length < 3) return

    const { data: existing } = await sup.from('vaults').select('id').eq('slug', cleaned).neq('id', id).maybeSingle()
    if (existing) return

    await sup.from('vaults').update({ slug: cleaned }).eq('id', id)
    revalidatePath(`/dashboard/vault/${id}/settings`)
  }

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

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`
  const sectionHeadCls = `flex items-center gap-2 text-base font-semibold text-[#1f2d27] mb-1`
  const cardCls = `rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)]`

  const navItems = [
    { href: '#slug',    icon: '🔗', label: 'Sayfa Adresi' },
    { href: '#genel',   icon: '🧍', label: 'Genel Bilgiler' },
    { href: '#qr',      icon: '📱', label: 'QR Kod' },
    { href: '#yayin',   icon: '📢', label: 'Yayın Ayarları' },
    { href: '#tehlike', icon: '⚠️', label: 'Tehlikeli Alan' },
  ]

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm mb-5">
          <Link href="/dashboard" className="text-[#788177] hover:text-[#174f35] transition-colors">Anı Alanım</Link>
          <span className="text-[#c8bfb0]">/</span>
          <Link href={`/dashboard/vault/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">{vault.display_name}</Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Ayarlar</span>
        </div>

        <PersonHeader vault={vault} sectionLabel="Ayarlar" sectionIcon="⚙️" />

        <div className="flex gap-8 items-start">
          {/* Sidebar nav */}
          <nav className="hidden lg:block w-48 shrink-0 sticky top-8">
            <p className="text-[10px] font-semibold text-[#adb5ab] uppercase tracking-widest mb-3 px-3">Ayarlar</p>
            <ul className="space-y-0.5">
              {navItems.map(({ href, icon, label }) => (
                <li key={href}>
                  <a href={href}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[#4a5e55] hover:bg-[#f5efdf] hover:text-[#1f2d27] transition-colors">
                    <span className="text-base w-5 text-center">{icon}</span>
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Sayfa adresi */}
            <div id="slug" className={`${cardCls} scroll-mt-6`}>
              <div className={sectionHeadCls}>
                <span>🔗</span> Sayfa Adresi
              </div>
              <p className="text-xs text-[#788177] mb-5">
                Anma sayfanızın herkese açık URL&apos;i. Kısa, akılda kalıcı bir adres seçin.
              </p>
              {vault.slug && (
                <div className="mb-4 rounded-xl border border-[#174f35]/20 bg-[#f0fdf4] px-4 py-3 flex items-center gap-3">
                  <span className="text-[#174f35]">🔗</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#788177] mb-0.5">Mevcut adres</p>
                    <p className="text-sm font-mono text-[#174f35] truncate">theeternalmemory.com/ani-alanim/{vault.slug}</p>
                  </div>
                  <Link href={`/ani-alanim/${vault.slug}`} target="_blank"
                    className="text-xs text-[#788177] hover:text-[#174f35] transition-colors shrink-0">
                    Görüntüle →
                  </Link>
                </div>
              )}
              <form action={saveSlug} className="flex gap-3 items-start">
                <div className="flex-1">
                  <div className="flex items-center rounded-xl border border-[#e5dccb] bg-white overflow-hidden focus-within:border-[#174f35] focus-within:ring-2 focus-within:ring-[#174f35]/10 transition-all">
                    <span className="text-xs text-[#adb5ab] pl-3 pr-1 shrink-0 hidden sm:block">.../ani-alanim/</span>
                    <input type="text" name="slug" defaultValue={vault.slug ?? ''} placeholder="ahmet-yilmaz"
                      pattern="[a-z0-9-]+" minLength={3} maxLength={60}
                      className="flex-1 bg-transparent text-[#1f2d27] placeholder-[#adb5ab] px-3 py-3 text-sm focus:outline-none font-mono" />
                  </div>
                  <p className="text-xs text-[#adb5ab] mt-1.5">Sadece küçük harf, rakam ve tire ( - ) kullanın</p>
                </div>
                <button type="submit"
                  className="rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm font-medium text-[#4a5e55] hover:bg-[#f5efdf] transition-colors shrink-0">
                  Kaydet
                </button>
              </form>
            </div>

            {/* Genel bilgiler */}
            <div id="genel" className={`${cardCls} scroll-mt-6`}>
              <div className={sectionHeadCls}>
                <span>🧍</span> Genel Bilgiler
              </div>
              <form action={update} className="space-y-4 mt-4">
                <div>
                  <label className={labelCls}>Anı Alanı Adı</label>
                  <input type="text" name="display_name" defaultValue={vault.display_name} required className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Doğum Tarihi</label>
                    <input type="date" name="birth_date" defaultValue={vault.birth_date ?? ''} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Vefat Tarihi</label>
                    <input type="date" name="death_date" defaultValue={vault.death_date ?? ''} className={inputCls} />
                  </div>
                </div>
                <button type="submit"
                  className="rounded-xl bg-[#174f35] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors">
                  Kaydet
                </button>
              </form>
            </div>

            {/* QR Kod */}
            <div id="qr" className={`${cardCls} scroll-mt-6`}>
              <div className={sectionHeadCls}>
                <span>📱</span> QR Kod Eşleştirme
              </div>
              <p className="text-xs text-[#788177] mt-1 mb-4">
                Mermer atölyesinden aldığınız QR hash kodunu girerek mezar taşı QR kodunu bu anı alanına bağlayın.
              </p>
              {linkedQRs && linkedQRs.length > 0 && (
                <div className="mb-4 space-y-2">
                  {linkedQRs.map((qr) => (
                    <div key={qr.qr_hash} className="flex items-center gap-3 rounded-xl border border-[#e5dccb] bg-white px-4 py-3">
                      <span className="text-lg">📱</span>
                      <div className="flex-1">
                        <div className="text-xs font-mono text-[#1f2d27]">{qr.qr_hash}</div>
                        <div className="text-xs text-[#788177]">{qr.redirect_count ?? 0} okuma</div>
                      </div>
                      <div className="w-2 h-2 bg-[#174f35] rounded-full" />
                    </div>
                  ))}
                </div>
              )}
              <form action={linkQR} className="flex gap-3">
                <input type="text" name="qr_hash" placeholder="QR hash kodu..." required
                  className="flex-1 rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] font-mono outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10" />
                <button type="submit"
                  className="rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm font-medium text-[#4a5e55] hover:bg-[#f5efdf] transition-colors shrink-0">
                  Eşleştir
                </button>
              </form>
            </div>

            {/* Yayın ayarları */}
            <div id="yayin" className={`${cardCls} scroll-mt-6`}>
              <div className={sectionHeadCls}>
                <span>📢</span> Ölüm Sonrası Yayın Ayarları
              </div>
              <p className="text-xs text-[#788177] mt-1 mb-5">
                Vefatınızdan sonra anma sayfanızın nasıl yayınlanacağını önceden belirleyin.
              </p>
              <form action={savePubSettings} className="space-y-3">
                {([
                  ['auto_publish_on_death',  'Ölümümden sonra otomatik olarak yayınla',   pub.auto_publish_on_death],
                  ['require_heir_approval',  'Yayınlamadan önce yetkili onayı iste',       pub.require_heir_approval !== false],
                  ['show_biography',         'Hayat hikayemi göster',                      pub.show_biography !== false],
                  ['show_family_tree',       'Aile bağlarımı göster',                      pub.show_family_tree !== false],
                  ['show_memories',          'Anılarımı göster',                           pub.show_memories !== false],
                  ['show_media',             'Fotoğraf ve videolarımı göster',             pub.show_media !== false],
                ] as [string, string, boolean][]).map(([name, label, defaultVal]) => (
                  <label key={name} className="flex items-center gap-3 cursor-pointer group py-1">
                    <div className="relative shrink-0">
                      <input type="checkbox" name={name} defaultChecked={defaultVal} className="sr-only peer" />
                      <div className="w-9 h-5 bg-[#e5dccb] peer-checked:bg-[#174f35] rounded-full transition-colors" />
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-4 shadow-sm" />
                    </div>
                    <span className="text-sm text-[#4a5e55] group-hover:text-[#1f2d27] transition-colors">{label}</span>
                  </label>
                ))}
                <div className="pt-2">
                  <button type="submit"
                    className="rounded-xl bg-[#174f35] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors">
                    Yayın Ayarlarını Kaydet
                  </button>
                </div>
              </form>
            </div>

            {/* Tehlikeli alan */}
            <div id="tehlike" className="rounded-3xl border border-red-200 bg-red-50/50 p-6 scroll-mt-6">
              <div className="flex items-center gap-2 text-base font-semibold text-red-600 mb-2">
                <span>⚠️</span> Tehlikeli Alan
              </div>
              <p className="text-xs text-[#788177] mb-4">
                Anı alanını silmek geri alınamaz. Tüm medya, yetkili kişi bilgileri ve mesajlar kalıcı olarak silinir.
              </p>
              <form action={del}>
                <button type="submit"
                  className="rounded-xl border border-red-200 bg-white text-red-500 text-sm font-medium px-5 py-2.5 hover:bg-red-50 transition-colors">
                  Anı Alanını Kalıcı Olarak Sil
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
