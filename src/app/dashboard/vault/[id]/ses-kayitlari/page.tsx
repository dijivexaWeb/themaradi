import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { addAudioRecordingAction, updateAudioRecordingAction, deleteAudioRecordingAction } from '@/lib/actions/audio'
import PersonHeader from '../_PersonHeader'
import AudioUploadForm from './AudioUploadForm'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}

export default async function SesKayitlariPage({ params, searchParams }: Props) {
  const { id } = await params
  const { edit: editId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults')
    .select('id, display_name, status, product_type, cover_photo_url, birth_date, death_date')
    .eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const { data: recordings } = await supabase
    .from('vault_audio_recordings')
    .select('*')
    .eq('vault_id', id)
    .order('sort_order')

  const isLocked = vault.status === 'pending_verification'
  const addAction = addAudioRecordingAction.bind(null, id)

  const editingRec = editId ? recordings?.find((r) => r.id === editId) : null

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10 disabled:opacity-40`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <PersonHeader vault={vault} sectionLabel="Ses Kayıtları" sectionIcon="🎙️" />

        {isLocked && (
          <div className="mb-6 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra kayıt yapabilirsiniz.
          </div>
        )}

        {/* Edit form */}
        {editingRec && !isLocked && (
          <div className="mb-6 rounded-3xl border border-[#c7a76f]/40 bg-[#fff9ee] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">✏️</span>
                <h2 className="font-semibold text-[#1f2d27]">Kaydı Düzenle</h2>
              </div>
              <Link href={`/dashboard/vault/${id}/ses-kayitlari`} className="text-xs text-[#788177] hover:text-[#174f35]">İptal</Link>
            </div>
            <p className="mb-4 text-xs text-[#788177]">Ses dosyası değiştirilemez. Değiştirmek için kaydı silip yeniden yükleyin.</p>
            <audio controls src={editingRec.audio_url} className="mb-4 h-8 w-full" />
            <form action={updateAudioRecordingAction.bind(null, editingRec.id, id)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Başlık <span className="text-[#dfbd72]">*</span></label>
                  <input type="text" name="title" required defaultValue={editingRec.title} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Seslendiren</label>
                  <input type="text" name="author" defaultValue={editingRec.author ?? ''} placeholder="Kendi sesinden..." className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Görünürlük</label>
                <select name="is_public" defaultValue={editingRec.is_public ? 'true' : 'false'}
                  className="w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] outline-none focus:border-[#174f35]">
                  <option value="false">Gizli</option>
                  <option value="true">Herkese açık</option>
                </select>
              </div>
              <button type="submit"
                className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors">
                Kaydet
              </button>
            </form>
          </div>
        )}

        {/* Mevcut kayıtlar */}
        {(recordings?.length ?? 0) > 0 && (
          <div className="mb-6 rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-5 shadow-[0_4px_24px_rgba(64,48,24,0.05)]">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#1f2d27]">
              <span>🎙️</span> Kayıtlar ({recordings!.length})
            </h2>
            <div className="space-y-3">
              {recordings!.map((rec) => {
                const isEditing = rec.id === editId
                return (
                  <div key={rec.id} className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${isEditing ? 'border-[#c7a76f] bg-[#fff9ee]' : 'border-[#e5dccb] bg-white'}`}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#174f35]/10 text-[#174f35]">
                      🎵
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[#1f2d27]">{rec.title}</div>
                      {rec.author && <div className="text-xs text-[#788177]">{rec.author}</div>}
                      <div className="mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${rec.is_public ? 'bg-[#174f35]/10 text-[#174f35]' : 'bg-[#f5efdf] text-[#788177]'}`}>
                          {rec.is_public ? 'Herkese açık' : 'Gizli'}
                        </span>
                      </div>
                      <audio controls src={rec.audio_url} className="mt-2 h-8 w-full" />
                    </div>
                    {!isLocked && (
                      <div className="flex flex-col gap-2 shrink-0">
                        <Link
                          href={`/dashboard/vault/${id}/ses-kayitlari?edit=${rec.id}`}
                          className="rounded-lg border border-[#e5dccb] bg-white px-3 py-1.5 text-xs font-medium text-[#174f35] transition hover:bg-[#f5efdf] text-center"
                        >
                          Düzenle
                        </Link>
                        <form action={deleteAudioRecordingAction.bind(null, rec.id, id)}>
                          <button type="submit" className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100">
                            Sil
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Yeni kayıt ekle */}
        {!editingRec && (
          <AudioUploadForm vaultId={id} isLocked={isLocked} />
        )}
      </div>
    </div>
  )
}
