import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { addFamilyMemberAction, updateFamilyMemberAction, deleteFamilyMemberAction } from '@/lib/actions/family'
import FamilyTreeCanvas from '@/components/FamilyTreeCanvas'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string; add?: string }>
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
  const { edit: editId, add: showAdd } = await searchParams
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
  const editMember = editId ? (members ?? []).find(m => m.id === editId) : null

  // Children/daughters available for grandchild parent selection
  const parentCandidates = (members ?? []).filter(m => ['son', 'daughter'].includes(m.relationship))

  const dInputCls = `w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-[#efe7d8] placeholder-white/30 outline-none focus:border-[#c7a76f]/60 focus:ring-1 focus:ring-[#c7a76f]/20`
  const dSelectCls = `w-full rounded-xl border border-white/15 bg-[#0d1412] px-4 py-3 text-sm text-[#efe7d8] outline-none focus:border-[#c7a76f]/60`
  const dLabelCls = `mb-1.5 block text-xs font-semibold text-[#c7a76f]/80`

  return (
    <div className="min-h-screen bg-[#091712] text-[#efe7d8]">

      {/* ── Breadcrumb nav ── */}
      <div className="sticky top-0 z-20 border-b border-white/8 bg-[#091712]/95 px-5 py-4 sm:px-8 backdrop-blur">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="text-[#c7a76f]/60 hover:text-[#c7a76f] transition-colors">Dashboard</Link>
            <span className="text-white/20">/</span>
            <Link href={`/dashboard/vault/${id}`} className="text-[#c7a76f]/60 hover:text-[#c7a76f] transition-colors">{vault.display_name}</Link>
            <span className="text-white/20">/</span>
            <span className="font-semibold text-[#efe7d8]">Aile Bağları</span>
          </div>
          {!isLocked && (
            <Link href="?add=1"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#c7a76f] px-4 py-2 text-xs font-semibold text-[#091712] hover:bg-[#d4b87c] transition-colors">
              + Üye Ekle
            </Link>
          )}
        </div>
      </div>

      <div className="px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-5xl">

          {/* ── Header ── */}
          <div className="mb-9 flex flex-col gap-5 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
            <div>
              <div className="flex items-center justify-center lg:justify-start gap-3 text-[#c7a76f]">
                <span className="h-px w-10 bg-[#c7a76f]" />
                <span className="text-xs tracking-[0.2em] uppercase">Aile Bağları</span>
              </div>
              <h2 className="mt-3 font-serif text-4xl text-white sm:text-5xl">
                Köklerden<br />
                <span className="text-[#c7a76f]">yeni nesillere.</span>
              </h2>
            </div>
          </div>

          {/* ── Add / Edit form ── */}
          {!isLocked && (showAdd || editMember) && (
            <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1412] shadow-2xl shadow-black/30">
              <div className="relative p-5 sm:p-7">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(199,167,111,0.08),transparent_60%)]" />
                <div className="relative">
                  {editMember ? (
                    <>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3 text-[#c7a76f]">
                          <span className="h-px w-6 bg-[#c7a76f]" />
                          <span className="text-xs tracking-[0.2em] uppercase">Düzenle</span>
                        </div>
                        <Link href={pageUrl} className="text-xs text-[#8f9f96] hover:text-[#c7a76f] transition-colors">← İptal</Link>
                      </div>
                      <form action={updateFamilyMemberAction.bind(null, editMember.id, id)} encType="multipart/form-data" className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={dLabelCls}>Yakınlık *</label>
                            <select name="relationship" required className={dSelectCls} defaultValue={editMember.relationship}>
                              {Object.entries(REL_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>{REL_ICONS[v]} {l}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={dLabelCls}>Ad Soyad *</label>
                            <input type="text" name="full_name" required defaultValue={editMember.full_name} className={dInputCls} />
                          </div>
                        </div>
                        {/* Parent selection for grandchildren */}
                        {editMember.relationship === 'grandchild' && parentCandidates.length > 0 && (
                          <div>
                            <label className={dLabelCls}>Ebeveyn (hangi oğul/kızın çocuğu?)</label>
                            <select name="parent_member_id" className={dSelectCls}
                              defaultValue={(editMember as Record<string, unknown>).parent_member_id as string ?? ''}>
                              <option value="">Seçiniz...</option>
                              {parentCandidates.map(p => (
                                <option key={p.id} value={p.id}>{REL_ICONS[p.relationship]} {p.full_name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className={dLabelCls}>Doğum Tarihi</label>
                            <input type="date" name="birth_date" defaultValue={editMember.birth_date ?? ''} className={dInputCls} />
                          </div>
                          <div>
                            <label className={dLabelCls}>Durum</label>
                            <select name="is_alive" defaultValue={editMember.is_alive ? 'true' : 'false'} className={dSelectCls}>
                              <option value="true">Hayatta</option>
                              <option value="false">Vefat Etti</option>
                            </select>
                          </div>
                          <div>
                            <label className={dLabelCls}>Vefat Tarihi</label>
                            <input type="date" name="death_date" defaultValue={editMember.death_date ?? ''} className={dInputCls} />
                          </div>
                        </div>
                        <div>
                          <label className={dLabelCls}>Fotoğraf <span className="text-white/30 font-normal">(boş bırakırsan mevcut kalır)</span></label>
                          <input type="file" name="photo_file" accept="image/*"
                            className="w-full cursor-pointer rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-sm text-[#efe7d8] file:mr-3 file:rounded-lg file:border-0 file:bg-[#c7a76f]/20 file:px-3 file:py-1.5 file:text-[#c7a76f] file:font-medium outline-none mb-2" />
                          <input type="url" name="photo_url" defaultValue={editMember.photo_url ?? ''} placeholder="veya URL..." className={dInputCls} />
                        </div>
                        <div>
                          <label className={dLabelCls}>Not</label>
                          <input type="text" name="notes" defaultValue={editMember.notes ?? ''} placeholder="Kısa bir not..." className={dInputCls} />
                        </div>
                        <button type="submit"
                          className="rounded-xl bg-[#c7a76f] px-6 py-3 text-sm font-semibold text-[#091712] hover:bg-[#d4b87c] transition-colors shadow-lg shadow-black/20">
                          Kaydet
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3 text-[#c7a76f]">
                          <span className="h-px w-6 bg-[#c7a76f]" />
                          <span className="text-xs tracking-[0.2em] uppercase">Yeni Üye Ekle</span>
                        </div>
                        <Link href={pageUrl} className="text-xs text-[#8f9f96] hover:text-[#c7a76f] transition-colors">← Kapat</Link>
                      </div>
                      <form action={addAction} encType="multipart/form-data" className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={dLabelCls}>Yakınlık *</label>
                            <select name="relationship" required className={dSelectCls}>
                              <option value="">Seç...</option>
                              {Object.entries(REL_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>{REL_ICONS[v]} {l}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={dLabelCls}>Ad Soyad *</label>
                            <input type="text" name="full_name" required placeholder="Ad Soyad" className={dInputCls} />
                          </div>
                        </div>
                        {/* Parent selector for grandchildren (always visible if candidates exist) */}
                        {parentCandidates.length > 0 && (
                          <div>
                            <label className={dLabelCls}>Ebeveyn <span className="text-white/30 font-normal">(torun ekliyorsanız seçin)</span></label>
                            <select name="parent_member_id" className={dSelectCls}>
                              <option value="">Seçiniz...</option>
                              {parentCandidates.map(p => (
                                <option key={p.id} value={p.id}>{REL_ICONS[p.relationship]} {p.full_name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className={dLabelCls}>Doğum Tarihi</label>
                            <input type="date" name="birth_date" className={dInputCls} />
                          </div>
                          <div>
                            <label className={dLabelCls}>Durum</label>
                            <select name="is_alive" className={dSelectCls}>
                              <option value="true">Hayatta</option>
                              <option value="false">Vefat Etti</option>
                            </select>
                          </div>
                          <div>
                            <label className={dLabelCls}>Vefat Tarihi</label>
                            <input type="date" name="death_date" className={dInputCls} />
                          </div>
                        </div>
                        <div>
                          <label className={dLabelCls}>Fotoğraf <span className="text-white/30 font-normal">(opsiyonel)</span></label>
                          <input type="file" name="photo_file" accept="image/*"
                            className="w-full cursor-pointer rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-sm text-[#efe7d8] file:mr-3 file:rounded-lg file:border-0 file:bg-[#c7a76f]/20 file:px-3 file:py-1.5 file:text-[#c7a76f] file:font-medium outline-none mb-2" />
                          <input type="url" name="photo_url" placeholder="veya fotoğraf URL'si..." className={dInputCls} />
                        </div>
                        <div>
                          <label className={dLabelCls}>Not <span className="text-white/30 font-normal">(opsiyonel)</span></label>
                          <input type="text" name="notes" placeholder="Kısa bir not..." className={dInputCls} />
                        </div>
                        <button type="submit"
                          className="rounded-xl bg-[#c7a76f] px-6 py-3 text-sm font-semibold text-[#091712] hover:bg-[#d4b87c] transition-colors shadow-lg shadow-black/20">
                          Ekle
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {isLocked && (
            <div className="mb-6 rounded-2xl border border-[#c7a76f]/20 bg-[#c7a76f]/5 px-5 py-4 text-sm text-[#c7a76f]">
              Ödeme doğrulandıktan sonra aile üyesi ekleyebilirsiniz.
            </div>
          )}

          {/* ── Animated family tree ── */}
          {(members?.length ?? 0) === 0 ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1412] shadow-2xl shadow-black/30">
              <div className="py-16 text-center">
                <p className="text-5xl mb-4">🌳</p>
                <p className="font-serif text-xl text-white mb-2">Aile ağacı boş</p>
                <p className="text-sm text-[#8f9f96] max-w-xs mx-auto mb-5">
                  Üye ekle butonuna tıklayarak aile üyelerini ekleyin.
                </p>
                {!isLocked && (
                  <Link href="?add=1"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#c7a76f] px-5 py-3 text-sm font-semibold text-[#091712] hover:bg-[#d4b87c] transition-colors">
                    + İlk üyeyi ekle
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1412] shadow-2xl shadow-black/30">
              <div className="relative p-4 sm:p-6">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(199,167,111,0.10),transparent_45%)]" />
                <div className="relative">
                  <FamilyTreeCanvas
                    vault={{
                      display_name: vault.display_name,
                      cover_photo_url: vault.cover_photo_url,
                      birth_date: vault.birth_date,
                      death_date: vault.death_date,
                    }}
                    members={(members ?? []).map(m => ({
                      id: m.id,
                      full_name: m.full_name,
                      relationship: m.relationship,
                      photo_url: m.photo_url ?? null,
                      birth_date: m.birth_date ?? null,
                      death_date: m.death_date ?? null,
                      is_alive: m.is_alive ?? true,
                      parent_member_id: (m as Record<string, unknown>).parent_member_id as string | null ?? null,
                    }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Member management list ── */}
          {(members?.length ?? 0) > 0 && !isLocked && (
            <div className="mt-8">
              <div className="mb-4 flex items-center gap-3 text-[#c7a76f]">
                <span className="h-px w-8 bg-[#c7a76f]" />
                <span className="text-xs tracking-[0.2em] uppercase">Üye Yönetimi</span>
              </div>
              <div className="space-y-2">
                {(members ?? []).map(m => {
                  const del = deleteFamilyMemberAction.bind(null, m.id, id)
                  const mBirthY = m.birth_date ? new Date(m.birth_date).getFullYear() : null
                  const mDeathY = m.death_date ? new Date(m.death_date).getFullYear() : null
                  const mYears = mBirthY ? `${mBirthY}${!m.is_alive && mDeathY ? ` – ${mDeathY}` : m.is_alive ? ' –' : ''}` : ''
                  return (
                    <div key={m.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-[#0d1412] px-4 py-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#c7a76f]/30 bg-[#f4eee3]">
                        {m.photo_url ? (
                          <Image src={m.photo_url} alt={m.full_name} width={40} height={40} className="h-full w-full object-cover" unoptimized />
                        ) : (
                          <span className="text-lg">{REL_ICONS[m.relationship] ?? '👤'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-serif text-sm text-white">{m.full_name}</div>
                        <div className="text-[11px] text-[#c7a76f]">
                          {REL_LABELS[m.relationship] ?? m.relationship}
                          {mYears && <span className="ml-2 text-[#6e7d75]">{mYears}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Link href={`?edit=${m.id}`} className="text-xs font-semibold text-[#c7a76f] hover:underline">
                          Düzenle
                        </Link>
                        <form action={del}>
                          <button type="submit" className="text-xs font-semibold text-white/30 hover:text-red-400 transition-colors">
                            Kaldır
                          </button>
                        </form>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
