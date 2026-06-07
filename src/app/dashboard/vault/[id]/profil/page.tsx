import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { saveVaultProfileAction } from '@/lib/actions/vault'
import Image from 'next/image'
import PersonHeader from '../_PersonHeader'

interface Props { params: Promise<{ id: string }> }

const NAV = [
  { id: 'temel',   icon: '🧍', label: 'Temel Bilgiler' },
  { id: 'foto',    icon: '📸', label: 'Profil Fotoğrafı' },
  { id: 'tarih',   icon: '📅', label: 'Tarih & Yer' },
  { id: 'mesaj',   icon: '💬', label: 'Son Mesaj' },
  { id: 'mezar',   icon: '🪦', label: 'Mezar' },
]

export default async function ProfilPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('*').eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const isLocked = vault.status === 'pending_verification'
  const saveProfile = saveVaultProfileAction.bind(null, id)

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10 disabled:opacity-40`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`
  const sectionCls = `rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)] space-y-4 scroll-mt-6`

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-5">
          <Link href="/dashboard" className="text-[#788177] hover:text-[#174f35] transition-colors">Anı Alanım</Link>
          <span className="text-[#c8bfb0]">/</span>
          <Link href={`/dashboard/vault/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">{vault.display_name}</Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Kişisel Bilgiler</span>
        </div>

        <PersonHeader vault={vault} sectionLabel="Kişisel Bilgiler" sectionIcon="🧍" />

        {isLocked && (
          <div className="mb-6 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra kayıt yapabilirsiniz. Şimdilik bakabilirsiniz.
          </div>
        )}

        {/* Desktop: sidebar + form | Mobile: stacked */}
        <div className="flex gap-8 items-start">

          {/* Left sticky nav — desktop only */}
          <aside className="hidden lg:block w-52 shrink-0 sticky top-8">
            <div className="rounded-2xl border border-[#e5dccb] bg-white p-3 space-y-0.5">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#adb5ab]">Bölümler</p>
              {NAV.map(({ id: navId, icon, label }) => (
                <a
                  key={navId}
                  href={`#${navId}`}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[#4a5e55] transition-colors hover:bg-[#f5efdf] hover:text-[#174f35]"
                >
                  <span className="text-base leading-none">{icon}</span>
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </aside>

          {/* Form */}
          <form action={saveProfile} encType="multipart/form-data" className="flex-1 min-w-0 space-y-5">

            {/* Temel */}
            <section id="temel" className={sectionCls}>
              <div className="flex items-center gap-2 pb-1">
                <span className="text-lg">🧍</span>
                <h2 className="font-semibold text-[#1f2d27]">Temel Bilgiler</h2>
              </div>
              <div>
                <label className={labelCls}>Ad Soyad <span className="text-[#dfbd72]">*</span></label>
                <input type="text" name="display_name" defaultValue={vault.display_name} required disabled={isLocked} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Kısa Özet (tagline)</label>
                <input type="text" name="tagline" defaultValue={vault.tagline ?? ''} placeholder="Sevgiyle yaşadı, sevgiyle hatırlanıyor." disabled={isLocked} className={inputCls} />
                <p className="mt-1 text-xs text-[#adb5ab]">Anma sayfasının hero bölümünde görünür</p>
              </div>
            </section>

            {/* Profil fotoğrafı */}
            <section id="foto" className={sectionCls}>
              <div className="flex items-center gap-2 pb-1">
                <span className="text-lg">📸</span>
                <h2 className="font-semibold text-[#1f2d27]">Profil Fotoğrafı</h2>
              </div>
              <div className="flex gap-5 items-start">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[#e5dccb] bg-[#f5efdf]">
                  {vault.cover_photo_url ? (
                    <Image src={vault.cover_photo_url} alt={vault.display_name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl text-[#c8bfb0]">👤</div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className={labelCls}>Dosya yükle</label>
                    <input type="file" name="cover_photo_file" accept="image/*" disabled={isLocked}
                      className="w-full cursor-pointer rounded-xl border border-[#e5dccb] bg-white px-3 py-2.5 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium outline-none disabled:opacity-40" />
                  </div>
                  <div>
                    <label className={labelCls}>veya fotoğraf URL</label>
                    <input type="url" name="cover_photo_url" defaultValue={vault.cover_photo_url ?? ''} placeholder="https://..." disabled={isLocked} className={inputCls} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#adb5ab]">Dosya seçerseniz URL yerine dosya kullanılır. Otomatik boyutlandırılır.</p>
            </section>

            {/* Tarih & Yer */}
            <section id="tarih" className={sectionCls}>
              <div className="flex items-center gap-2 pb-1">
                <span className="text-lg">📅</span>
                <h2 className="font-semibold text-[#1f2d27]">Tarih & Yer</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Doğum Tarihi</label>
                  <input type="date" name="birth_date" defaultValue={vault.birth_date ?? ''} disabled={isLocked} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Vefat Tarihi</label>
                  <input type="date" name="death_date" defaultValue={vault.death_date ?? ''} disabled={isLocked} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Doğum Yeri</label>
                  <input type="text" name="birth_place" defaultValue={vault.birth_place ?? ''} placeholder="Şehir, Ülke" disabled={isLocked} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Vefat Yeri</label>
                  <input type="text" name="death_place" defaultValue={vault.death_place ?? ''} placeholder="Şehir, Ülke" disabled={isLocked} className={inputCls} />
                </div>
              </div>
            </section>

            {/* Son Mesaj */}
            <section id="mesaj" className={sectionCls}>
              <div className="flex items-center gap-2 pb-1">
                <span className="text-lg">💬</span>
                <h2 className="font-semibold text-[#1f2d27]">Son Mesaj</h2>
              </div>
              <div>
                <label className={labelCls}>Bıraktığı Son Söz</label>
                <textarea name="last_message" rows={4} defaultValue={vault.last_message ?? ''} disabled={isLocked}
                  placeholder="Hayatta en kıymetli şeyin sevgi olduğunu öğrendim..."
                  className={inputCls + ' resize-none'} />
                <p className="mt-1 text-xs text-[#adb5ab]">Anma sayfasında özel bir alıntı bölümünde gösterilir</p>
              </div>
            </section>

            {/* Mezar */}
            <section id="mezar" className={sectionCls}>
              <div className="flex items-center gap-2 pb-1">
                <span className="text-lg">🪦</span>
                <h2 className="font-semibold text-[#1f2d27]">Mezar Bilgileri</h2>
              </div>
              <div>
                <label className={labelCls}>Mezarlık Adı</label>
                <input type="text" name="cemetery_name" defaultValue={vault.cemetery_name ?? ''} placeholder="Üçler Mezarlığı, Tiflis" disabled={isLocked} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mezarlık Adresi</label>
                <input type="text" name="cemetery_address" defaultValue={vault.cemetery_address ?? ''} placeholder="Adres veya konum tarifi" disabled={isLocked} className={inputCls} />
              </div>
            </section>

            {!isLocked && (
              <button type="submit"
                className="w-full rounded-xl bg-[#174f35] py-3.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors">
                Kaydet
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
