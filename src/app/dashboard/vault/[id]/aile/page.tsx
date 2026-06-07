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

  const fieldCls = `w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500`
  const selectCls = `bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 w-full`

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-300">Kasalarım</Link>
          <span>/</span>
          <Link href={`/dashboard/vault/${id}`} className="hover:text-slate-300">{vault.display_name}</Link>
          <span>/</span>
          <span className="text-slate-300">Aile Ağacı</span>
        </div>

        {isLocked && (
          <div className="mb-5 bg-amber-900/20 border border-amber-500/30 text-amber-400 text-sm rounded-xl px-4 py-3">
            ⏳ Ödeme doğrulandıktan sonra aile üyesi ekleyebilirsiniz.
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-100">Aile Ağacı</h1>
          <span className="text-xs text-slate-500">{members?.length ?? 0} kişi</span>
        </div>

        {!isLocked && (
          <div className="glass border border-slate-800/60 rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Aile Üyesi Ekle</h2>
            <form action={addAction} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Yakınlık <span className="text-amber-400">*</span></label>
                  <select name="relationship" required className={selectCls}>
                    <option value="">Seç...</option>
                    {Object.entries(REL_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Ad Soyad <span className="text-amber-400">*</span></label>
                  <input type="text" name="full_name" required placeholder="Mehmet Yılmaz" className={fieldCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Doğum Tarihi</label>
                  <input type="date" name="birth_date" className={fieldCls} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Durum</label>
                  <select name="is_alive" className={selectCls}>
                    <option value="true">Hayatta</option>
                    <option value="false">Vefat Etti</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Vefat Tarihi (hayatta değilse)</label>
                <input type="date" name="death_date" className={fieldCls} />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Fotoğraf URL (opsiyonel)</label>
                <input type="url" name="photo_url" placeholder="https://..." className={fieldCls} />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Not (opsiyonel)</label>
                <input type="text" name="notes" placeholder="Kısa bir not..." className={fieldCls} />
              </div>

              <button type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Aile Üyesini Ekle
              </button>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {!members?.length ? (
            <div className="glass border border-dashed border-slate-700 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">🌳</div>
              <p className="text-slate-400 text-sm">Henüz aile üyesi eklenmemiş</p>
            </div>
          ) : members.map((m) => {
            const del = deleteFamilyMemberAction.bind(null, m.id, id)
            return (
              <div key={m.id} className="glass border border-slate-800/60 rounded-xl px-5 py-4 flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  {m.photo_url ? (
                    <Image src={m.photo_url} alt={m.full_name} width={40} height={40} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-xl">{REL_ICONS[m.relationship] ?? '👤'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-100 text-sm">{m.full_name}</span>
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                      {REL_LABELS[m.relationship] ?? m.relationship}
                    </span>
                    {!m.is_alive && (
                      <span className="text-xs text-slate-600">†</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {m.birth_date && <span>{new Date(m.birth_date).getFullYear()}</span>}
                    {m.birth_date && !m.is_alive && m.death_date && <span> – {new Date(m.death_date).getFullYear()}</span>}
                    {m.birth_date && m.is_alive && <span> – </span>}
                    {m.notes && <span className="ml-2 italic text-slate-700">{m.notes}</span>}
                  </div>
                </div>
                {!isLocked && (
                  <form action={del}>
                    <button type="submit" className="text-slate-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs">Sil</button>
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
