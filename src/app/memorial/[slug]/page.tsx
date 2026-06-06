import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'

interface Props { params: Promise<{ slug: string }> }

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: vault } = await supabase
    .from('vaults')
    .select('display_name, biography, cover_photo_url')
    .eq('slug', slug)
    .eq('status', 'public_memorial')
    .single()

  if (!vault) return { title: 'Ani Sayfasi Bulunamadi' }
  return {
    title: `${vault.display_name} — themaradi`,
    description: vault.biography?.slice(0, 160) ?? `${vault.display_name} ani sayfasi`,
    openGraph: {
      title: vault.display_name,
      description: vault.biography?.slice(0, 160),
      images: vault.cover_photo_url ? [vault.cover_photo_url] : [],
    },
  }
}

export default async function MemorialPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: vault } = await supabase
    .from('vaults').select('*').eq('slug', slug).eq('status', 'public_memorial').single()

  if (!vault) notFound()

  const { data: mediaItems } = await supabase
    .from('media').select('*').eq('vault_id', vault.id).eq('is_public', true).order('sort_order', { ascending: true })

  const { data: messages } = await supabase
    .from('guestbook').select('id, visitor_name, message, created_at')
    .eq('vault_id', vault.id).eq('is_approved', true)
    .order('created_at', { ascending: false }).limit(20)

  const birthYear = vault.birth_date ? new Date(vault.birth_date).getFullYear() : null
  const deathYear = vault.death_date ? new Date(vault.death_date).getFullYear() : null

  return (
    <div className="min-h-screen bg-[#020817] text-slate-100">
      <div className="relative h-72 sm:h-96 bg-slate-900">
        {vault.cover_photo_url ? (
          <Image src={vault.cover_photo_url} alt={vault.display_name} fill className="object-cover opacity-40" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-transparent to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 text-center px-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">{vault.display_name}</h1>
          {(birthYear || deathYear) && (
            <p className="text-slate-400">{birthYear ?? '?'} — {deathYear ?? 'Hala yasiyor'}</p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {vault.biography && (
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-slate-300 mb-4">Hayat Hikayesi</h2>
            <div className="glass border border-slate-800/60 rounded-2xl p-6">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">{vault.biography}</p>
            </div>
          </section>
        )}

        {mediaItems && mediaItems.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-slate-300 mb-4">Fotograflar ve Anilar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mediaItems.filter(m => m.media_type === 'image').map((item) => (
                <div key={item.id} className="aspect-square relative rounded-xl overflow-hidden bg-slate-800">
                  {item.thumb_url && (
                    <Image src={item.thumb_url} alt={item.original_filename ?? ''} fill className="object-cover" />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold text-slate-300 mb-4">Ziyaretci Defteri</h2>
          <GuestbookForm vaultId={vault.id} />
          {messages && messages.length > 0 && (
            <div className="mt-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="glass border border-slate-800/60 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">
                      {msg.visitor_name[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-300">{msg.visitor_name}</span>
                    <span className="text-xs text-slate-600 ml-auto">
                      {new Date(msg.created_at!).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className="text-center py-8 text-xs text-slate-700 border-t border-slate-800/60">
        <a href="/" className="hover:text-slate-500 transition-colors">themaradi.com</a> ile olusturuldu
      </footer>
    </div>
  )
}

function GuestbookForm({ vaultId }: { vaultId: string }) {
  async function submitMessage(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const message = formData.get('message') as string
    if (!name?.trim() || !message?.trim()) return
    await supabase.from('guestbook').insert({
      vault_id: vaultId,
      visitor_name: name.trim().slice(0, 255),
      visitor_email: email?.trim() || null,
      message: message.trim().slice(0, 2000),
    })
  }

  return (
    <form action={submitMessage} className="glass border border-slate-800/60 rounded-2xl p-5 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input type="text" name="name" placeholder="Adiniz *" required maxLength={255}
          className="bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
        <input type="email" name="email" placeholder="E-posta (opsiyonel)"
          className="bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
      </div>
      <textarea name="message" placeholder="Mesajinizi yazin..." required rows={3} maxLength={2000}
        className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none" />
      <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
        Mesaj Gonder
      </button>
      <p className="text-xs text-slate-600">Mesajiniz onaylandiktan sonra yayinlanacak.</p>
    </form>
  )
}
