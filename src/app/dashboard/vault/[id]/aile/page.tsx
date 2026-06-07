import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { addFamilyMemberAction, deleteFamilyMemberAction } from '@/lib/actions/family'
import Image from 'next/image'

interface Props { params: Promise<{ id: string }> }

const REL_LABELS: Record<string, string> = {
  mother: 'Annesi', father: 'Babası', spouse: 'Eşi', son: 'Oğlu',
  daughter: 'Kızı', sibling: 'Kardeşi', grandparent: 'Büyükanne/Büyükbaba',
  grandchild: 'Torunu', other: 'Diğer',
}

const REL_ICONS: Record<string, string> = {
  mother: '👩', father: '👨', spouse: '💑', son: '👦',
  daughter: '👧', sibling: '🧑', grandparent: '👴', grandchild: '🧒', other: '👤',
}

export default async function AilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('id, display_name, status').eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const { data: members } = await supabase
    .from('vault_family_members')
    .select('*')
    .eq('vault_id', id)
    .order('sort_order', { ascending: true })

  const isLocked = vault.status === 'pending_verification'
  const addAction = addFamilyMemberAction.bind(null, id)

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`
  const selectCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/dashboard" className="text-[#788177] hover:text-[#174f35] transition-colors">Anı Alanım</Link>
          <span className="text-[#c8bfb0]">/</span>
          <Link href={`/dashboard/vault/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">{vault.display_name}</Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Aile Bağları</span>
        </div>

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra aile üyesi ekleyebilirsiniz.
          </div>
        )}

        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="font-serif text-3xl text-[#1f2d27]">Aile Bağları</h1>
            <p className="text-xs text-[#788177] mt-0.5">{members?.length ?? 0} kişi</p>
          </div>
        </div>

        {!isLocked && (
          <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_16px_50px_rgba(64,48,24,0.06)] mb-7">
            <h2 className="text-sm font-semibold text-[#1f2d27] mb-4">Aile Üyesi Ekle</h2>
            <form action={addAction} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Yakınlık <span className="text-[#dfbd72]">*</span></label>
                  <select name="relationship" required className={selectCls}>
                    <option value="">Seç...</option>
                    {Object.entries(REL_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Ad Soyad <span className="text-[#dfbd72]">*</span></label>
                  <input type="text" name="full_name" required placeholder="Mehmet Yılmaz" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
              </div>

              <div>
                <label className={labelCls}>Vefat Tarihi (hayatta değilse)</label>
                <input type="date" name="death_date" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Fotoğraf URL (opsiyonel)</label>
                <input type="url" name="photo_url" placeholder="https://..." className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Not (opsiyonel)</label>
                <input type="text" name="notes" placeholder="Kısa bir not..." className={inputCls} />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors"
              >
                Aile Üyesini Ekle
              </button>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {!members?.length ? (
            <div className="rounded-3xl border border-dashed border-[#e5dccb] bg-[#fffdf8] p-14 text-center">
              <div className="text-4xl mb-3">🌳</div>
              <p className="text-[#788177] text-sm">Henüz aile üyesi eklenmemiş</p>
              <p className="text-xs text-[#adb5ab] mt-1">Sevdiklerinizi ekleyerek aile ağacını oluşturun</p>
            </div>
          ) : members.map((m) => {
            const del = deleteFamilyMemberAction.bind(null, m.id, id)
            return (
              <div key={m.id} className="rounded-2xl border border-[#e5dccb] bg-white px-5 py-4 flex items-center gap-4 group hover:border-[#174f35]/20 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#f5efdf] border border-[#e5dccb] flex items-center justify-center overflow-hidden shrink-0">
                  {m.photo_url ? (
                    <Image src={m.photo_url} alt={m.full_name} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <span className="text-xl">{REL_ICONS[m.relationship] ?? '👤'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#1f2d27] text-sm">{m.full_name}</span>
                    <span className="text-xs bg-[#f5efdf] text-[#4a5e55] px-2 py-0.5 rounded-full border border-[#e5dccb]">
                      {REL_LABELS[m.relationship] ?? m.relationship}
                    </span>
                    {!m.is_alive && (
                      <span className="text-xs text-[#adb5ab]">†</span>
                    )}
                  </div>
                  <div className="text-xs text-[#adb5ab] mt-0.5">
                    {m.birth_date && <span>{new Date(m.birth_date).getFullYear()}</span>}
                    {m.birth_date && !m.is_alive && m.death_date && <span> – {new Date(m.death_date).getFullYear()}</span>}
                    {m.birth_date && m.is_alive && <span> – </span>}
                    {m.notes && <span className="ml-2 italic text-[#788177]">{m.notes}</span>}
                  </div>
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
            )
          })}
        </div>
      </div>
    </div>
  )
}
