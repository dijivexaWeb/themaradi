import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { addMemoryAction, updateMemoryAction, deleteMemoryAction } from '@/lib/actions/memories'
import { deleteDocumentAction } from '@/lib/actions/documents'
import PersonHeader from '../_PersonHeader'
import DocumentUploadForm from '../belgeler/DocumentUploadForm'
import { createPresignedReadUrl } from '@/lib/r2'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}

export default async function VasiyetPage({ params, searchParams }: Props) {
  const { id } = await params
  const { edit: editId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults')
    .select('id, display_name, status, product_type, cover_photo_url, birth_date, death_date')
    .eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  if (vault.product_type === 'memorial_profile') redirect(`/dashboard/vault/${id}`)

  const [{ data: notes }, { data: rawDocs }] = await Promise.all([
    supabase.from('vault_memories').select('*')
      .eq('vault_id', id).eq('is_secret', true).eq('section', 'vasiyet')
      .order('created_at', { ascending: false }),
    supabase.from('vault_documents').select('*')
      .eq('vault_id', id).eq('category', 'will')
      .order('created_at', { ascending: false }),
  ])

  const docs = rawDocs
    ? await Promise.all(
        rawDocs.map(async (doc) => {
          let fileUrl = doc.file_url
          if (doc.file_key && doc.storage_bucket) {
            try {
              fileUrl = await createPresignedReadUrl(doc.storage_bucket, doc.file_key, 3600)
            } catch (err) {
              console.error('Error generating will doc URL:', err)
            }
          }
          return { ...doc, file_url: fileUrl }
        })
      )
    : []

  const isLocked = vault.status === 'pending_verification'
  const pageUrl = `/dashboard/vault/${id}/vasiyet`
  const addNote = addMemoryAction.bind(null, id, pageUrl)

  const today = new Date().toISOString().split('T')[0]

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm mb-5">
          <Link href="/dashboard" className="text-[#788177] hover:text-[#174f35] transition-colors">Anı Alanım</Link>
          <span className="text-[#c8bfb0]">/</span>
          <Link href={`/dashboard/vault/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">{vault.display_name}</Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Vasiyetname</span>
        </div>

        <PersonHeader vault={vault} sectionLabel="Vasiyetname" sectionIcon="📜" />

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra vasiyetname ekleyebilirsiniz.
          </div>
        )}

        <div className="mb-7">
          <h1 className="font-serif text-3xl text-[#1f2d27] mb-1">Vasiyetname</h1>
          <p className="text-sm text-[#788177]">
            Yazılı vasiyetname ve belgeleriniz <span className="font-semibold text-[#1f2d27]">sadece yetkili kişiler</span> tarafından görülebilir.
          </p>
        </div>

        {/* ── Yazılı Vasiyetname ── */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">✍️</span>
            <h2 className="font-semibold text-[#1f2d27]">Yazılı Vasiyetler</h2>
            <span className="ml-auto text-xs text-[#adb5ab]">{notes?.length ?? 0} not</span>
          </div>

          {!isLocked && (
            <div className="rounded-3xl border border-[#dfbd72]/40 bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)] mb-5">
              <form action={addNote} className="space-y-4">
                <input type="hidden" name="is_secret" value="true" />
                <input type="hidden" name="section" value="vasiyet" />
                <input type="hidden" name="memory_date" value={today} />

                <div>
                  <label className={labelCls}>Başlık (opsiyonel)</label>
                  <input type="text" name="title" placeholder="Gayrimenkul vasiyeti, Oğluma mesaj..." className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Vasiyetname Metni <span className="text-[#dfbd72]">*</span></label>
                  <textarea name="content" required rows={6}
                    placeholder="Vasiyetinizi buraya yazın. Bu içerik yalnızca yetkili kişiler tarafından görülebilir..."
                    className={inputCls + ' resize-none'} />
                </div>
                <button type="submit"
                  className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors">
                  Kaydet
                </button>
              </form>
            </div>
          )}

          {!notes?.length ? (
            <div className="rounded-3xl border border-dashed border-[#e5dccb] bg-[#fffdf8] py-12 text-center">
              <p className="text-4xl mb-3">📝</p>
              <p className="font-serif text-lg text-[#1f2d27] mb-1">Yazılı vasiyetname yok</p>
              <p className="text-sm text-[#788177] max-w-xs mx-auto">Yetkili kişilerinize bırakmak istediğiniz notlar burada saklanır.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((n) => {
                const del = deleteMemoryAction.bind(null, n.id, id)
                const update = updateMemoryAction.bind(null, n.id, id, pageUrl)
                const isEditing = editId === n.id

                return (
                  <div key={n.id}>
                    {isEditing ? (
                      /* ── Inline edit form ── */
                      <div className="rounded-2xl border-2 border-[#174f35]/30 bg-[#fffdf8] p-5 shadow-sm">
                        <p className="text-xs font-semibold text-[#174f35] mb-4 flex items-center gap-1.5">
                          <span>✏️</span> Vasiyeti Düzenle
                        </p>
                        <form action={update} className="space-y-3">
                          <div>
                            <label className={labelCls}>Başlık</label>
                            <input type="text" name="title" defaultValue={n.title ?? ''} className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls}>Vasiyetname Metni <span className="text-[#dfbd72]">*</span></label>
                            <textarea name="content" required rows={6}
                              defaultValue={n.content ?? ''}
                              className={inputCls + ' resize-none'} />
                          </div>
                          <input type="hidden" name="memory_date" value={n.memory_date ?? today} />
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
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs bg-[#fff7e6] text-[#725212] border border-[#dfbd72]/40 px-2 py-0.5 rounded-full font-medium">📜 Vasiyet</span>
                              {n.title && <h3 className="font-semibold text-[#1f2d27] text-sm">{n.title}</h3>}
                            </div>
                            <p className="text-xs text-[#dfbd72] font-semibold mb-2">
                              {new Date(n.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <p className="text-[#4a5e55] text-sm leading-7 whitespace-pre-wrap">{n.content}</p>
                          </div>
                          {!isLocked && (
                            <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link href={`?edit=${n.id}`}
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
        </div>

        {/* ── Vasiyet Belgeleri ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">📎</span>
            <h2 className="font-semibold text-[#1f2d27]">Vasiyet Belgeleri</h2>
            <span className="ml-auto text-xs text-[#adb5ab]">{docs?.length ?? 0} belge</span>
          </div>

          {!isLocked && (
            <DocumentUploadForm
              vaultId={id}
              categories={{ will: { label: 'Vasiyet', icon: '📜' } }}
              defaultCategory="will"
            />
          )}

          {!docs?.length ? (
            <div className="rounded-3xl border border-dashed border-[#e5dccb] bg-[#fffdf8] py-12 text-center">
              <p className="text-4xl mb-3">📂</p>
              <p className="font-serif text-lg text-[#1f2d27] mb-1">Vasiyet belgesi yok</p>
              <p className="text-sm text-[#788177] max-w-xs mx-auto">Notarizeli vasiyet, el yazılı belge gibi dosyaları buraya yükleyin.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {docs.map((doc) => {
                const del = deleteDocumentAction.bind(null, doc.id, id)
                return (
                  <div key={doc.id}
                    className="group flex items-center gap-3 rounded-2xl border border-[#e5dccb] bg-white px-4 py-3.5 hover:border-[#174f35]/20 hover:shadow-sm transition-all">
                    <span className="text-2xl shrink-0">📕</span>
                    <div className="flex-1 min-w-0">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-medium text-[#1f2d27] hover:text-[#174f35] truncate block transition-colors">
                        {doc.file_name}
                      </a>
                      <div className="flex items-center gap-2 mt-0.5">
                        {doc.description && <span className="text-xs text-[#788177]">{doc.description}</span>}
                        <span className="text-[11px] text-[#adb5ab]">{new Date(doc.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-medium text-[#174f35] hover:underline">İndir</a>
                      {!isLocked && (
                        <form action={del}>
                          <button type="submit" className="text-xs font-medium text-[#e5dccb] hover:text-red-400 transition-colors">Sil</button>
                        </form>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
