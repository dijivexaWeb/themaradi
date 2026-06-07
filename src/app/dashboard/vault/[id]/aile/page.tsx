import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { addFamilyMemberAction, updateFamilyMemberAction, deleteFamilyMemberAction } from '@/lib/actions/family'
import Image from 'next/image'
import PersonHeader from '../_PersonHeader'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}

const REL_LABELS: Record<string, string> = {
  mother: 'Annesi', father: 'Babası', spouse: 'Eşi', son: 'Oğlu',
  daughter: 'Kızı', sibling: 'Kardeşi', grandparent: 'Büyükanne/Büyükbaba',
  grandchild: 'Torunu', other: 'Diğer',
}

const REL_ICONS: Record<string, string> = {
  mother: '👩', father: '👨', spouse: '💑', son: '👦',
  daughter: '👧', sibling: '🧑', grandparent: '👴', grandchild: '🧒', other: '👤',
}

export default async function AilePage({ params, searchParams }: Props) {
  const { id } = await params
  const { edit: editId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults')
    .select('id, display_name, status, cover_photo_url, birth_date, death_date')
    .eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const { data: members } = await supabase
    .from('vault_family_members').select('*')
    .eq('vault_id', id).order('sort_order', { ascending: true })

  const isLocked = vault.status === 'pending_verification'
  const addAction = addFamilyMemberAction.bind(null, id)
  const pageUrl = `/dashboard/vault/${id}/aile`

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`
  const selectCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm mb-5">
          <Link href="/dashboard" className="text-[#788177] hover:text-[#174f35] transition-colors">Anı Alanım</Link>
          <span className="text-[#c8bfb0]">/</span>
          <Link href={`/dashboard/vault/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">{vault.display_name}</Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Aile Bağları</span>
        </div>

        <PersonHeader vault={vault} sectionLabel="Aile Bağları" sectionIcon="🌳" />

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra aile üyesi ekleyebilirsiniz.
          </div>
        )}

        <div className="flex items-end justify-between mb-7">
          <div>
            <h1 className="font-serif text-3xl text-[#1f2d27]">Aile Bağları</h1>
            <p className="text-xs text-[#788177] mt-0.5">{members?.length ?? 0} kişi</p>
          </div>
        </div>

        {/* Add form */}
        {!isLocked && (
          <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)] mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">➕</span>
              <h2 className="font-semibold text-[#1f2d27]">Aile Üyesi Ekle</h2>
            </div>
            <form action={addAction} encType="multipart/form-data" className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Yakınlık <span className="text-[#dfbd72]">*</span></label>
                  <select name="relationship" required className={selectCls}>
                    <option value="">Seç...</option>
                    {Object.entries(REL_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{REL_ICONS[v]} {l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Ad Soyad <span className="text-[#dfbd72]">*</span></label>
                  <input type="text" name="full_name" required placeholder="Ad Soyad" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Doğum Tarihi</label>
                  <input type="date" name="birth_date" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Durum</label>
                  <select name="is_alive" className={selectCls}>
                    <option value="true">Hayatta</option>
                    <option value="false">Vefat Etti</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Vefat Tarihi</label>
                  <input type="date" name="death_date" className={inputCls} />
                </div>
              </div>
              {/* Photo: file upload first, URL as fallback */}
              <div>
                <label className={labelCls}>Fotoğraf Yükle <span className="text-[#adb5ab] font-normal">(opsiyonel)</span></label>
                <input type="file" name="photo_file" accept="image/*"
                  className="w-full cursor-pointer rounded-xl border border-[#e5dccb] bg-white px-3 py-3 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium outline-none mb-2" />
                <input type="url" name="photo_url" placeholder="veya fotoğraf URL'si..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Not (opsiyonel)</label>
                <input type="text" name="notes" placeholder="Kısa bir not..." className={inputCls} />
              </div>
              <button type="submit"
                className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors">
                Ekle
              </button>
            </form>
          </div>
        )}

        {/* Card grid */}
        {!members?.length ? (
          <div className="rounded-3xl border border-dashed border-[#e5dccb] bg-[#fffdf8] py-20 text-center">
            <p className="text-6xl mb-4">🌳</p>
            <p className="font-serif text-xl text-[#1f2d27] mb-1">Aile ağacı boş</p>
            <p className="text-sm text-[#788177] max-w-xs mx-auto">Sevdiklerinizi ekleyerek anma sayfasında aile bağlarını gösterin.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((m) => {
              const del = deleteFamilyMemberAction.bind(null, m.id, id)
              const update = updateFamilyMemberAction.bind(null, m.id, id)
              const birthYear = m.birth_date ? new Date(m.birth_date).getFullYear() : null
              const deathYear = m.death_date ? new Date(m.death_date).getFullYear() : null
              const isEditing = editId === m.id

              return (
                <div key={m.id}>
                  {isEditing ? (
                    /* ── Inline edit form ── */
                    <div className="rounded-2xl border-2 border-[#174f35]/30 bg-[#fffdf8] p-5 shadow-sm">
                      <p className="text-xs font-semibold text-[#174f35] mb-4 flex items-center gap-1.5">
                        <span>✏️</span> Aile Üyesini Düzenle
                      </p>
                      <form action={update} encType="multipart/form-data" className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>Yakınlık <span className="text-[#dfbd72]">*</span></label>
                            <select name="relationship" required className={selectCls} defaultValue={m.relationship}>
                              {Object.entries(REL_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>{REL_ICONS[v]} {l}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={labelCls}>Ad Soyad <span className="text-[#dfbd72]">*</span></label>
                            <input type="text" name="full_name" required defaultValue={m.full_name} className={inputCls} />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className={labelCls}>Doğum Tarihi</label>
                            <input type="date" name="birth_date" defaultValue={m.birth_date ?? ''} className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls}>Durum</label>
                            <select name="is_alive" defaultValue={m.is_alive ? 'true' : 'false'} className={selectCls}>
                              <option value="true">Hayatta</option>
                              <option value="false">Vefat Etti</option>
                            </select>
                          </div>
                          <div>
                            <label className={labelCls}>Vefat Tarihi</label>
                            <input type="date" name="death_date" defaultValue={m.death_date ?? ''} className={inputCls} />
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>Yeni Fotoğraf Yükle <span className="text-[#adb5ab] font-normal">(opsiyonel — boş bırakırsan mevcut kalır)</span></label>
                          <input type="file" name="photo_file" accept="image/*"
                            className="w-full cursor-pointer rounded-xl border border-[#e5dccb] bg-white px-3 py-3 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium outline-none mb-2" />
                          <input type="url" name="photo_url" defaultValue={m.photo_url ?? ''} placeholder="veya URL..." className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Not</label>
                          <input type="text" name="notes" defaultValue={m.notes ?? ''} placeholder="Kısa bir not..." className={inputCls} />
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
                    /* ── Card view ── */
                    <div className="group relative rounded-2xl border border-[#e5dccb] bg-white px-5 py-4 flex items-center gap-4 hover:border-[#174f35]/20 hover:shadow-sm transition-all">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#e5dccb] bg-[#f5efdf]">
                        {m.photo_url ? (
                          <Image src={m.photo_url} alt={m.full_name} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-3xl">
                            {REL_ICONS[m.relationship] ?? '👤'}
                          </div>
                        )}
                        {!m.is_alive && (
                          <div className="absolute inset-0 flex items-end justify-center pb-0.5">
                            <span className="text-[10px] bg-[#f5efdf]/90 rounded-full px-1">†</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1f2d27] text-sm leading-snug">{m.full_name}</p>
                        <p className="text-xs text-[#788177] mt-0.5">{REL_LABELS[m.relationship] ?? m.relationship}</p>
                        {(birthYear || deathYear) && (
                          <p className="text-[11px] text-[#adb5ab] mt-0.5 font-serif">
                            {birthYear ?? '?'}{!m.is_alive && deathYear ? ` – ${deathYear}` : m.is_alive ? ' –' : ''}
                          </p>
                        )}
                        {m.notes && <p className="text-[11px] text-[#adb5ab] mt-1 italic line-clamp-1">{m.notes}</p>}
                      </div>
                      {!isLocked && (
                        <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`?edit=${m.id}`}
                            className="text-xs font-medium text-[#174f35] hover:underline">
                            Düzenle
                          </Link>
                          <span className="text-[#e5dccb]">·</span>
                          <form action={del}>
                            <button type="submit" className="text-xs font-medium text-[#e5dccb] hover:text-red-400 transition-colors">
                              Kaldır
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
