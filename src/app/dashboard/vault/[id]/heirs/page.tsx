import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { inviteHeirAction } from '@/lib/actions/heirs'

interface Props { params: Promise<{ id: string }> }

const accessLabels: Record<string, string> = {
  executor: 'Vasiy',
  contributor: 'Katilimci',
  viewer: 'Izleyici',
}

export default async function HeirsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults').select('id, display_name').eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const { data: heirs } = await supabase
    .from('heirs').select('*').eq('vault_id', id).order('created_at', { ascending: true })

  const inviteWithVault = inviteHeirAction.bind(null, id)

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-300">Kasalar</Link>
          <span>/</span>
          <Link href={`/dashboard/vault/${id}`} className="hover:text-slate-300">{vault.display_name}</Link>
          <span>/</span>
          <span className="text-slate-300">Varisler</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-100 mb-6">Varisler ve Yetkililer</h1>

        <div className="glass border border-slate-800/60 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Yeni Varis Davet Et</h2>
          <form action={inviteWithVault} className="space-y-3">
            <input type="email" name="email" placeholder="E-posta adresi *" required
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
            <select name="access_level" required
              className="bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 w-full">
              <option value="executor">Vasiy — Kasayi devralin kisi</option>
              <option value="contributor">Katilimci — Icerik ekleyebilir</option>
              <option value="viewer">Izleyici — Sadece goruntuleme</option>
            </select>
            <button type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Davet Gonder
            </button>
          </form>
        </div>

        {!heirs?.length ? (
          <div className="text-center py-12 text-slate-600">
            <p className="text-sm">Henuz varis eklenmemis</p>
            <p className="text-xs mt-1">Yukaridaki formu kullanarak davet gonderin</p>
          </div>
        ) : (
          <div className="space-y-3">
            {heirs.map((heir) => {
              const isExpired = heir.invitation_expires_at
                ? new Date(heir.invitation_expires_at) < new Date()
                : false
              const statusLabel = heir.accepted_at ? 'Kabul Edildi' : isExpired ? 'Suresi Doldu' : 'Beklemede'
              const statusColor = heir.accepted_at
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : isExpired
                  ? 'text-red-400 bg-red-500/10 border-red-500/20'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/20'

              return (
                <div key={heir.id} className="glass border border-slate-800/60 rounded-xl px-5 py-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-500/30 flex items-center justify-center text-sm font-bold text-amber-400">
                    {heir.heir_email[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-100 truncate">{heir.heir_email}</div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {accessLabels[heir.access_level ?? ''] ?? heir.access_level}
                    </div>
                  </div>
                  <div className={`text-xs px-2.5 py-1 rounded-full border ${statusColor}`}>
                    {statusLabel}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
