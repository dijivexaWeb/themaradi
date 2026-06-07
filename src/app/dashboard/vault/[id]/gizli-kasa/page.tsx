import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { addMemoryAction, deleteMemoryAction } from '@/lib/actions/memories'

interface Props { params: Promise<{ id: string }> }

export default async function GizliKasaPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('id, display_name, status, product_type').eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  if (vault.product_type === 'memorial_profile') {
    redirect(`/dashboard/vault/${id}`)
  }

  const { data: secrets } = await supabase
    .from('vault_memories')
    .select('*')
    .eq('vault_id', id)
    .eq('is_secret', true)
    .order('created_at', { ascending: false })

  const { data: secretMedia } = await supabase
    .from('media')
    .select('*')
    .eq('vault_id', id)
    .eq('is_public', false)
    .order('created_at', { ascending: false })

  const isLocked = vault.status === 'pending_verification'
  const addAction = addMemoryAction.bind(null, id)

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/dashboard" className="text-[#788177] hover:text-[#174f35] transition-colors">Anı Alanım</Link>
          <span className="text-[#c8bfb0]">/</span>
          <Link href={`/dashboard/vault/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">{vault.display_name}</Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Özel İçerikler</span>
        </div>

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra özel içerik ekleyebilirsiniz.
          </div>
        )}

        <div className="mb-7">
          <h1 className="font-serif text-3xl text-[#1f2d27] mb-3">Özel İçerikler</h1>
          <div className="rounded-2xl border border-[#e5dccb] bg-white px-5 py-4">
            <p className="text-sm text-[#4a5e55] leading-6">
              Bu bölümdeki içerikler <span className="font-semibold text-[#1f2d27]">sadece yetkili kişiler</span> tarafından görülebilir.
              Vasiyet, özel mesajlar, belgeler ve hatıralar buraya eklenebilir. Herkese açık anma sayfasında görünmez.
            </p>
          </div>
        </div>

        {!isLocked && (
          <div className="rounded-3xl border border-[#dfbd72]/40 bg-[#fffdf8] p-6 shadow-[0_16px_50px_rgba(64,48,24,0.06)] mb-7">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🔐</span>
              <h2 className="text-sm font-semibold text-[#1f2d27]">Özel İçerik Ekle</h2>
            </div>
            <form action={addAction} className="space-y-3">
              <input type="hidden" name="is_secret" value="true" />
              <input
                type="text"
                name="title"
                placeholder="Başlık (örn: Vasiyetim, Oğluma Mesaj...)"
                className={inputCls}
              />
              <textarea
                name="content"
                required
                rows={5}
                placeholder="Bu içerik sadece yetkili kişileriniz tarafından görülebilir. Vasiyet, özel mesajlar, sevdiklerinize bıraktığınız notlar..."
                className={inputCls + ' resize-none'}
              />
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="date"
                  name="memory_date"
                  required
                  className="rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors"
                >
                  Özel İçerik Ekle
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xs font-semibold text-[#788177] uppercase tracking-wide">Gizli Notlar & Vasiyetler</h2>
            <span className="text-xs text-[#adb5ab]">{secrets?.length ?? 0} öğe</span>
          </div>

          {!secrets?.length ? (
            <div className="rounded-3xl border border-dashed border-[#e5dccb] bg-[#fffdf8] p-12 text-center">
              <div className="text-4xl mb-3">🔒</div>
              <p className="text-[#788177] text-sm">Henüz özel içerik eklenmemiş</p>
              <p className="text-xs text-[#adb5ab] mt-1">Yetkili kişilerinize bırakmak istediğiniz özel mesajlar burada saklanır</p>
            </div>
          ) : secrets.map((s) => {
            const del = deleteMemoryAction.bind(null, s.id, id)
            return (
              <div key={s.id} className="rounded-2xl border border-[#dfbd72]/30 bg-[#fffdf8] p-5 group hover:border-[#dfbd72]/60 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-[#fff7e6] text-[#725212] border border-[#dfbd72]/40 px-2 py-0.5 rounded-full font-medium">🔐 Gizli</span>
                      {s.title && <h3 className="font-semibold text-[#1f2d27] text-sm">{s.title}</h3>}
                    </div>
                    <p className="text-[#4a5e55] text-sm leading-7 whitespace-pre-wrap">{s.content}</p>
                    {s.memory_date && (
                      <p className="text-xs text-[#adb5ab] mt-2">
                        {new Date(s.memory_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                  {!isLocked && (
                    <form action={del}>
                      <button
                        type="submit"
                        className="text-[#e5dccb] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs font-medium"
                      >
                        Sil
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {(secretMedia?.length ?? 0) > 0 && (
          <div className="mt-7">
            <h2 className="text-xs font-semibold text-[#788177] uppercase tracking-wide mb-3">Gizli Medya</h2>
            <div className="space-y-2">
              {secretMedia?.map((m) => (
                <div key={m.id} className="rounded-2xl border border-[#e5dccb] bg-white px-4 py-3 flex items-center gap-3">
                  <span className="text-lg">{m.media_type === 'image' ? '🖼️' : m.media_type === 'video' ? '🎬' : '📄'}</span>
                  <span className="text-sm text-[#1f2d27] font-medium">{m.original_filename ?? 'Dosya'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
