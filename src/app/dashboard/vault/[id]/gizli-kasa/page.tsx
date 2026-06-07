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

  // Sadece life_vault'ta gizli kasa var
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

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-300">Kasalarım</Link>
          <span>/</span>
          <Link href={`/dashboard/vault/${id}`} className="hover:text-slate-300">{vault.display_name}</Link>
          <span>/</span>
          <span className="text-slate-300">Gizli Kasa</span>
        </div>

        {isLocked && (
          <div className="mb-5 bg-amber-900/20 border border-amber-500/30 text-amber-400 text-sm rounded-xl px-4 py-3">
            ⏳ Ödeme doğrulandıktan sonra gizli kasaya içerik ekleyebilirsiniz.
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔐</span>
            <h1 className="text-2xl font-bold text-slate-100">Gizli Kasa</h1>
          </div>
          <div className="glass border border-slate-700/50 rounded-xl px-4 py-3">
            <p className="text-sm text-slate-400 leading-6">
              Bu bölümdeki içerikler <strong className="text-slate-200">sadece varisleriniz</strong> tarafından görülebilir.
              Vasiyet, özel mesajlar, belgeler ve hatıralar buraya eklenebilir. Herkese açık anma sayfasında görünmez.
            </p>
          </div>
        </div>

        {!isLocked && (
          <div className="glass border border-amber-500/15 bg-amber-500/5 rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-amber-400 mb-4">Gizli İçerik Ekle</h2>
            <form action={addAction} className="space-y-3">
              <input type="hidden" name="is_secret" value="true" />
              <input type="text" name="title" placeholder="Başlık (örn: Vasiyetim, Oğluma Mesaj...)"
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
              <textarea name="content" required rows={5}
                placeholder="Bu içerik sadece varisleriniz tarafından görülebilir. Vasiyet, özel mesajlar, sevdiklerinize bıraktığınız notlar..."
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 resize-none" />
              <div className="flex items-center gap-3">
                <input type="date" name="memory_date"
                  className="bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
                <button type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  Gizli Kasaya Ekle
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Gizli Notlar & Vasiyetler</h2>
            <span className="text-xs text-slate-600">{secrets?.length ?? 0} öğe</span>
          </div>

          {!secrets?.length ? (
            <div className="glass border border-dashed border-slate-700 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-2">🔒</div>
              <p className="text-slate-500 text-sm">Henüz gizli içerik eklenmemiş</p>
              <p className="text-slate-700 text-xs mt-1">Varislerinize bırakmak istediğiniz özel mesajlar burada saklanır</p>
            </div>
          ) : secrets.map((s) => {
            const del = deleteMemoryAction.bind(null, s.id, id)
            return (
              <div key={s.id} className="glass border border-amber-500/15 bg-amber-500/5 rounded-2xl p-5 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">🔐 Gizli</span>
                      {s.title && <h3 className="font-semibold text-slate-200 text-sm">{s.title}</h3>}
                    </div>
                    <p className="text-slate-300 text-sm leading-7 whitespace-pre-wrap">{s.content}</p>
                    {s.memory_date && (
                      <p className="text-xs text-slate-600 mt-2">{new Date(s.memory_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    )}
                  </div>
                  {!isLocked && (
                    <form action={del}>
                      <button type="submit" className="text-slate-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs">Sil</button>
                    </form>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {(secretMedia?.length ?? 0) > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Gizli Medya</h2>
            <div className="space-y-2">
              {secretMedia?.map((m) => (
                <div key={m.id} className="glass border border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-lg">{m.media_type === 'image' ? '🖼️' : m.media_type === 'video' ? '🎬' : '📄'}</span>
                  <span className="text-sm text-slate-300">{m.original_filename ?? 'Dosya'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
