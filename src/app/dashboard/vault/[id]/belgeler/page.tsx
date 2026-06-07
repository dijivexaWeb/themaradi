import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { uploadDocumentsAction, deleteDocumentAction } from '@/lib/actions/documents'
import PersonHeader from '../_PersonHeader'

interface Props { params: Promise<{ id: string }> }

const CATEGORIES: Record<string, { label: string; icon: string }> = {
  identity:  { label: 'Kimlik & Nüfus',  icon: '🪪' },
  will:      { label: 'Vasiyet',          icon: '📜' },
  insurance: { label: 'Sigorta',          icon: '🛡️' },
  property:  { label: 'Tapu & Mülk',      icon: '🏠' },
  financial: { label: 'Finansal',         icon: '💳' },
  medical:   { label: 'Sağlık',           icon: '🏥' },
  legal:     { label: 'Hukuki',           icon: '⚖️' },
  other:     { label: 'Diğer',            icon: '📁' },
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileIcon(mime: string | null): string {
  if (!mime) return '📄'
  if (mime === 'application/pdf') return '📕'
  if (mime.startsWith('image/')) return '🖼️'
  if (mime.includes('word')) return '📝'
  if (mime.includes('excel') || mime.includes('spreadsheet')) return '📊'
  if (mime.includes('powerpoint') || mime.includes('presentation')) return '📋'
  return '📄'
}

export default async function BelgelerPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults')
    .select('id, display_name, status, cover_photo_url, birth_date, death_date')
    .eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const { data: documents } = await supabase
    .from('vault_documents').select('*')
    .eq('vault_id', id).order('created_at', { ascending: false })

  const isLocked = vault.status === 'pending_verification'
  const uploadAction = uploadDocumentsAction.bind(null, id)

  const grouped = (documents ?? []).reduce<Record<string, typeof documents>>((acc, doc) => {
    const cat = doc.category ?? 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat]!.push(doc)
    return acc
  }, {})

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
          <span className="font-semibold text-[#22362e]">Belgeler</span>
        </div>

        <PersonHeader vault={vault} sectionLabel="Belgeler" sectionIcon="📂" />

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra belge yükleyebilirsiniz.
          </div>
        )}

        <div className="mb-7">
          <h1 className="font-serif text-3xl text-[#1f2d27] mb-1">Belgeler</h1>
          <p className="text-sm text-[#788177]">
            Ailenize bırakmak istediğiniz önemli belgeleri buraya yükleyin. Yalnızca yetkili kişiler erişebilir.
          </p>
        </div>

        {!isLocked && (
          <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)] mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📤</span>
              <h2 className="font-semibold text-[#1f2d27]">Belge Yükle</h2>
            </div>
            <form action={uploadAction} encType="multipart/form-data" className="space-y-4">
              <div>
                <label className={labelCls}>Dosya Seç <span className="text-[#dfbd72]">*</span></label>
                <input type="file" name="files" multiple required
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.webp,.heic"
                  className="w-full cursor-pointer rounded-xl border border-[#e5dccb] bg-white px-3 py-3 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium outline-none" />
                <p className="mt-1.5 text-xs text-[#adb5ab]">PDF, Word, Excel, PowerPoint, metin, resim — max 25 MB/dosya. Birden fazla dosya seçilebilir.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Kategori</label>
                  <select name="category" defaultValue="other"
                    className="w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] outline-none focus:border-[#174f35]">
                    {Object.entries(CATEGORIES).map(([val, { label, icon }]) => (
                      <option key={val} value={val}>{icon} {label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Açıklama (opsiyonel)</label>
                  <input type="text" name="description" placeholder="Kısa bir not..." className={inputCls} />
                </div>
              </div>
              <button type="submit"
                className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors">
                Belgeleri Yükle
              </button>
            </form>
          </div>
        )}

        {(documents?.length ?? 0) === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#e5dccb] bg-[#fffdf8] py-20 text-center">
            <p className="text-6xl mb-4">📂</p>
            <p className="font-serif text-xl text-[#1f2d27] mb-1">Henüz belge yok</p>
            <p className="text-sm text-[#788177] max-w-xs mx-auto">Kimlik, tapu, sigorta, vasiyet gibi önemli belgelerinizi ailenize bırakın.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(CATEGORIES)
              .filter(([cat]) => grouped[cat]?.length)
              .map(([cat, { label, icon }]) => (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#e5dccb]">
                    <span className="text-lg">{icon}</span>
                    <h2 className="font-semibold text-[#1f2d27] text-sm">{label}</h2>
                    <span className="ml-auto text-xs text-[#adb5ab]">{grouped[cat]!.length} belge</span>
                  </div>
                  <div className="space-y-2">
                    {grouped[cat]!.map((doc) => {
                      const del = deleteDocumentAction.bind(null, doc.id, id)
                      return (
                        <div key={doc.id}
                          className="group flex items-center gap-3 rounded-2xl border border-[#e5dccb] bg-white px-4 py-3.5 hover:border-[#174f35]/20 hover:shadow-sm transition-all">
                          <span className="text-2xl shrink-0">{fileIcon(doc.mime_type)}</span>
                          <div className="flex-1 min-w-0">
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                              className="text-sm font-medium text-[#1f2d27] hover:text-[#174f35] truncate block transition-colors">
                              {doc.file_name}
                            </a>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {doc.description && <span className="text-xs text-[#788177]">{doc.description}</span>}
                              {doc.file_size_bytes && <span className="text-[11px] text-[#adb5ab]">{formatBytes(doc.file_size_bytes)}</span>}
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
                </div>
              ))}
            <p className="text-xs text-[#adb5ab] text-center pt-2">{documents!.length} belge — sadece yetkili kişiler erişebilir</p>
          </div>
        )}
      </div>
    </div>
  )
}
