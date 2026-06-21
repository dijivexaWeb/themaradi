import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { addMemoryAction, updateMemoryAction, deleteMemoryAction } from '@/lib/actions/memories'
import PersonHeader from '../_PersonHeader'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}

export default async function GizliKasaPage({ params, searchParams }: Props) {
  const { id } = await params
  const { edit: editId } = await searchParams
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

  const { data: secrets } = await supabase
    .from('vault_memories').select('*')
    .eq('vault_id', id).eq('is_secret', true).eq('section', 'general')
    .order('created_at', { ascending: false })

  const { data: secretMedia } = await supabase
    .from('media').select('*')
    .eq('vault_id', id).eq('is_public', false)
    .order('created_at', { ascending: false })

  const isLocked = vault.status === 'pending_verification'
  const pageUrl = `/dashboard/vault/${id}/gizli-kasa`
  const addAction = addMemoryAction.bind(null, id, pageUrl)

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <PersonHeader vault={vault} sectionLabel="Özel İçerikler" sectionIcon="🔐" />

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra özel içerik ekleyebilirsiniz.
          </div>
        )}

        <div className="mb-7">
          <h1 className="font-serif text-3xl text-[#1f2d27] mb-1">Özel İçerikler</h1>
          <p className="text-sm text-[#788177]">
            Bu bölümdeki içerikler <span className="font-semibold text-[#1f2d27]">sadece yetkili kişiler</span> tarafından görülebilir.
            Herkese açık anma sayfasında görünmez.
          </p>
        </div>

        {!isLocked && (
          <div className="rounded-3xl border border-[#dfbd72]/40 bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)] mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🔐</span>
              <h2 className="font-semibold text-[#1f2d27]">Özel İçerik Ekle</h2>
            </div>
            <form action={addAction} className="space-y-4">
              <input type="hidden" name="is_secret" value="true" />
              <div>
                <label className={labelCls}>Başlık (opsiyonel)</label>
                <input type="text" name="title" placeholder="Vasiyetim, Oğluma Mesaj..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>İçerik <span className="text-[#dfbd72]">*</span></label>
                <textarea name="content" required rows={5}
                  placeholder="Bu içerik sadece yetkili kişileriniz tarafından görülebilir..."
                  className={inputCls + ' resize-none'} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Tarih <span className="text-[#dfbd72]">*</span></label>
                  <input type="date" name="memory_date" required className={inputCls} />
                  <p className="mt-1 text-xs text-[#adb5ab]">Tarih seçilmeden kaydedilmez</p>
                </div>
              </div>
              <button type="submit"
                className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors">
                Özel İçerik Ekle
              </button>
            </form>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-[#788177] uppercase tracking-wide">Gizli Notlar & Vasiyetler</h2>
          <span className="text-xs text-[#adb5ab]">{secrets?.length ?? 0} öğe</span>
        </div>

        {!secrets?.length ? (
          <div className="rounded-3xl border border-dashed border-[#e5dccb] bg-[#fffdf8] py-20 text-center">
            <p className="text-6xl mb-4">🔒</p>
            <p className="font-serif text-xl text-[#1f2d27] mb-1">Henüz özel içerik yok</p>
            <p className="text-sm text-[#788177] max-w-xs mx-auto">Yetkili kişilerinize bırakmak istediğiniz mesajlar burada saklanır.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {secrets.map((s) => {
              const del = deleteMemoryAction.bind(null, s.id, id)
              const update = updateMemoryAction.bind(null, s.id, id, pageUrl)
              const isEditing = editId === s.id

              return (
                <div key={s.id}>
                  {isEditing ? (
                    /* ── Inline edit form ── */
                    <div className="rounded-2xl border-2 border-[#174f35]/30 bg-[#fffdf8] p-5 shadow-sm">
                      <p className="text-xs font-semibold text-[#174f35] mb-4 flex items-center gap-1.5">
                        <span>✏️</span> İçeriği Düzenle
                      </p>
                      <form action={update} className="space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>Başlık</label>
                            <input type="text" name="title" defaultValue={s.title ?? ''} className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls}>Tarih <span className="text-[#dfbd72]">*</span></label>
                            <input type="date" name="memory_date" required defaultValue={s.memory_date ?? ''} className={inputCls} />
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>İçerik <span className="text-[#dfbd72]">*</span></label>
                          <textarea name="content" required rows={5}
                            defaultValue={s.content ?? ''}
                            className={inputCls + ' resize-none'} />
                        </div>
                        <div className="flex items-center gap-3 pt-1">
                          <button type="submit"
                            className="rounded-xl bg-[#174f35] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#123f2b] transition-colors">
                            Kaydet
                          </button>
                          <Link href={pageUrl}
                            className="rounded-xl border border-[#e5dccb] px-5 py-2.5 text-sm font-medium text-[#788177] hover:bg-[#f5efdf] transition-colors">
                            İptal
                          </Link>
                        </div>
                      </form>
                    </div>
                  ) : (
                    /* ── Read view ── */
                    <div className="group rounded-2xl border border-[#dfbd72]/30 bg-[#fffdf8] p-5 hover:border-[#dfbd72]/60 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className="text-xs bg-[#fff7e6] text-[#725212] border border-[#dfbd72]/40 px-2 py-0.5 rounded-full font-medium">🔐 Gizli</span>
                            {s.title && <h3 className="font-semibold text-[#1f2d27] text-sm">{s.title}</h3>}
                          </div>
                          {s.memory_date && (
                            <p className="text-xs font-semibold text-[#dfbd72] tracking-wide mb-2">
                              {new Date(s.memory_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          )}
                          <p className="text-[#4a5e55] text-sm leading-7 whitespace-pre-wrap">{s.content}</p>
                        </div>
                        {!isLocked && (
                          <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`?edit=${s.id}`}
                              className="text-xs font-medium text-[#174f35] hover:underline">
                              Düzenle
                            </Link>
                            <span className="text-[#e5dccb]">·</span>
                            <form action={del}>
                              <button type="submit" className="text-xs font-medium text-[#e5dccb] hover:text-red-400 transition-colors">
                                Sil
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {(secretMedia?.length ?? 0) > 0 && (
          <div className="mt-8">
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
