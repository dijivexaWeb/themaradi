import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

interface Props { params: Promise<{ id: string }> }

export default async function ProfilPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('*').eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const isLocked = vault.status === 'pending_verification'

  async function saveProfile(formData: FormData) {
    'use server'
    const supabase2 = await createClient()
    const { data: { user: u } } = await supabase2.auth.getUser()
    if (!u) return

    const { data: v } = await supabase2.from('vaults').select('status').eq('id', id).eq('owner_id', u.id).single()
    if (!v || v.status === 'pending_verification') return

    await supabase2.from('vaults').update({
      display_name: (formData.get('display_name') as string)?.trim() || vault.display_name,
      tagline: (formData.get('tagline') as string)?.trim() || null,
      birth_date: (formData.get('birth_date') as string) || null,
      death_date: (formData.get('death_date') as string) || null,
      birth_place: (formData.get('birth_place') as string)?.trim() || null,
      death_place: (formData.get('death_place') as string)?.trim() || null,
      cover_photo_url: (formData.get('cover_photo_url') as string)?.trim() || null,
      last_message: (formData.get('last_message') as string)?.trim() || null,
      cemetery_name: (formData.get('cemetery_name') as string)?.trim() || null,
      cemetery_address: (formData.get('cemetery_address') as string)?.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq('id', id).eq('owner_id', u.id)

    revalidatePath(`/dashboard/vault/${id}`)
    revalidatePath(`/dashboard/vault/${id}/profil`)
  }

  const fieldCls = `w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed`

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-300">Kasalarım</Link>
          <span>/</span>
          <Link href={`/dashboard/vault/${id}`} className="hover:text-slate-300">{vault.display_name}</Link>
          <span>/</span>
          <span className="text-slate-300">Kişisel Bilgiler</span>
        </div>

        {isLocked && (
          <div className="mb-5 bg-amber-900/20 border border-amber-500/30 text-amber-400 text-sm rounded-xl px-4 py-3">
            ⏳ Ödeme doğrulandıktan sonra kayıt yapabilirsiniz. Şimdilik bakabilirsiniz.
          </div>
        )}

        <h1 className="text-2xl font-bold text-slate-100 mb-6">Kişisel Bilgiler</h1>

        <form action={saveProfile} className="space-y-5">
          <div className="glass border border-slate-800/60 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300">Temel Bilgiler</h2>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Ad Soyad <span className="text-amber-400">*</span></label>
              <input type="text" name="display_name" defaultValue={vault.display_name} required disabled={isLocked} className={fieldCls} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Kısa Özet (tagline)</label>
              <input type="text" name="tagline" defaultValue={vault.tagline ?? ''} placeholder="Sevgiyle yaşadı, sevgiyle hatırlanıyor." disabled={isLocked} className={fieldCls} />
              <p className="text-xs text-slate-600 mt-1">Anma sayfasının hero bölümünde görünür</p>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Kapak Fotoğrafı URL</label>
              <input type="url" name="cover_photo_url" defaultValue={vault.cover_photo_url ?? ''} placeholder="https://..." disabled={isLocked} className={fieldCls} />
              <p className="text-xs text-slate-600 mt-1">Profil sayfasında ana fotoğraf olarak görünür</p>
            </div>
          </div>

          <div className="glass border border-slate-800/60 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300">Tarih & Yer</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Doğum Tarihi</label>
                <input type="date" name="birth_date" defaultValue={vault.birth_date ?? ''} disabled={isLocked} className={fieldCls} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Vefat Tarihi</label>
                <input type="date" name="death_date" defaultValue={vault.death_date ?? ''} disabled={isLocked} className={fieldCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Doğum Yeri</label>
                <input type="text" name="birth_place" defaultValue={vault.birth_place ?? ''} placeholder="Şehir, Ülke" disabled={isLocked} className={fieldCls} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Vefat Yeri</label>
                <input type="text" name="death_place" defaultValue={vault.death_place ?? ''} placeholder="Şehir, Ülke" disabled={isLocked} className={fieldCls} />
              </div>
            </div>
          </div>

          <div className="glass border border-slate-800/60 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300">Son Mesaj</h2>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Bıraktığı Son Söz</label>
              <textarea name="last_message" rows={4} defaultValue={vault.last_message ?? ''} disabled={isLocked}
                placeholder="Hayatta en kıymetli şeyin sevgi olduğunu öğrendim..."
                className={fieldCls + ' resize-none'} />
              <p className="text-xs text-slate-600 mt-1">Anma sayfasında özel bir bölümde gösterilir</p>
            </div>
          </div>

          <div className="glass border border-slate-800/60 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300">Mezar Bilgileri</h2>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Mezarlık Adı</label>
              <input type="text" name="cemetery_name" defaultValue={vault.cemetery_name ?? ''} placeholder="Üçler Mezarlığı, Tiflis" disabled={isLocked} className={fieldCls} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Mezarlık Adresi</label>
              <input type="text" name="cemetery_address" defaultValue={vault.cemetery_address ?? ''} placeholder="Adres veya konum tarifi" disabled={isLocked} className={fieldCls} />
            </div>
          </div>

          {!isLocked && (
            <button type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              Kaydet
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
