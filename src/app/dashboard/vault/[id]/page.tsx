import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

interface Props { params: Promise<{ id: string }> }

export default async function VaultPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('*').eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const [{ count: heirCount }, { count: mediaCount }] = await Promise.all([
    supabase.from('heirs').select('*', { count: 'exact', head: true }).eq('vault_id', id),
    supabase.from('media').select('*', { count: 'exact', head: true }).eq('vault_id', id),
  ])

  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    hidden_vault: { label: 'Gizli Kasa', color: 'text-slate-400 bg-slate-800 border-slate-700', icon: '[gizli]' },
    private_memorial: { label: 'Ozel Ani', color: 'text-indigo-400 bg-amber-500/10 border-amber-500/20', icon: '[ozel]' },
    public_memorial: { label: 'Herkese Acik', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: '[acik]' },
  }
  const status = statusConfig[vault.status ?? 'hidden_vault']

  const tabs = [
    { href: `/dashboard/vault/${id}/biography`, label: 'Biyografi', desc: vault.biography ? 'Duzenlendi' : 'Henuz yok' },
    { href: `/dashboard/vault/${id}/media`, label: 'Medya', desc: `${mediaCount ?? 0} dosya` },
    { href: `/dashboard/vault/${id}/heirs`, label: 'Varisler', desc: `${heirCount ?? 0} kisi` },
    { href: `/dashboard/vault/${id}/settings`, label: 'Ayarlar', desc: 'Kasa yonetimi' },
  ]

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Kasalar</Link>
          <span>/</span>
          <span className="text-slate-300">{vault.display_name}</span>
        </div>

        <div className="glass border border-slate-800/60 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-100">{vault.display_name}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full border ${status.color}`}>{status.label}</span>
          </div>
          {vault.slug && <p className="text-sm text-slate-500">themaradi.com/memorial/{vault.slug}</p>}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/60">
            {[
              { label: 'Medya', value: mediaCount ?? 0 },
              { label: 'Varis', value: heirCount ?? 0 },
              { label: 'Durum', value: status.icon },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-slate-100">{value}</div>
                <div className="text-xs text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {tabs.map((tab) => (
            <Link key={tab.href} href={tab.href}
              className="glass border border-slate-800/60 rounded-2xl p-5 hover:border-amber-500/30 transition-all group flex items-center gap-4">
              <div className="flex-1">
                <div className="font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">{tab.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{tab.desc}</div>
              </div>
              <svg className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {vault.status === 'public_memorial' && vault.slug && (
          <div className="mt-6 glass border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-emerald-400 mb-1">Ani Sayfasi Aktif</div>
              <p className="text-xs text-slate-500">QR kodu okutulduğunda bu sayfaya yonlendirilir</p>
            </div>
            <Link href={`/memorial/${vault.slug}`} target="_blank"
              className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors">
              Onizle
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
