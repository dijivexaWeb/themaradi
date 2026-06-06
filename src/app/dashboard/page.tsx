import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createVaultAction } from '@/lib/actions/vault'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: vaults }, { data: subscription }] = await Promise.all([
    supabase
      .from('vaults')
      .select('id, display_name, status, slug, created_at, biography')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('subscriptions')
      .select('tier, storage_limit_bytes, storage_used_bytes, status')
      .eq('user_id', user.id)
      .single(),
  ])

  const storageLimit = subscription?.storage_limit_bytes ?? 1073741824
  const storageUsed = subscription?.storage_used_bytes ?? 0
  const storagePercent = Math.min((storageUsed / storageLimit) * 100, 100)

  function formatBytes(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    hidden_vault: { label: 'Gizli', color: 'text-slate-400 bg-white/[0.05] border-white/[0.08]' },
    private_memorial: { label: 'Ozel', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    public_memorial: { label: 'Acik', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-slate-100">Kasalarim</h1>
            <p className="text-sm text-slate-500 mt-0.5">Dijital mirasinizi yonetin</p>
          </div>
          <form action={createVaultAction}>
            <input type="hidden" name="display_name" value="Yeni Kasa" />
            <button type="submit"
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-amber-500/15">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni Kasa
            </button>
          </form>
        </div>

        {/* Storage */}
        <div className="border border-white/[0.06] bg-white/[0.02] rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-300">Depolama</span>
            <span className="text-xs text-slate-500">{formatBytes(storageUsed)} / {formatBytes(storageLimit)}</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all ${storagePercent > 80 ? 'bg-red-500' : 'bg-amber-500'}`}
              style={{ width: `${storagePercent || 0.5}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-600">
              {subscription?.tier === 'yearly' || subscription?.tier === 'lifetime'
                ? 'Premium plan aktif'
                : 'Ucretsiz plan · 1 GB'}
            </p>
            {!subscription?.tier || subscription.tier === 'free' ? (
              <Link href="/dashboard/billing" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                Premium a gec
              </Link>
            ) : null}
          </div>
        </div>

        {/* Vault list */}
        {!vaults || vaults.length === 0 ? (
          <div className="border border-dashed border-white/[0.08] rounded-2xl p-16 text-center">
            <div className="w-14 h-14 bg-white/[0.04] border border-white/[0.08] rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-200 mb-2">Henuz kasa yok</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
              Ilk dijital kasanizi olusturun ve anilarin guvende saklayin.
            </p>
            <form action={createVaultAction}>
              <input type="hidden" name="display_name" value="Benim Kasam" />
              <button type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors">
                Ilk Kasani Olustur
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-2">
            {vaults.map((vault) => {
              const status = statusConfig[vault.status ?? 'hidden_vault']
              return (
                <Link
                  key={vault.id}
                  href={`/dashboard/vault/${vault.id}`}
                  className="flex items-center gap-4 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-amber-500/20 rounded-2xl p-5 transition-all group"
                >
                  <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/15 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-slate-100 group-hover:text-amber-300 transition-colors text-sm">
                        {vault.display_name}
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    {vault.slug ? (
                      <span className="text-xs text-slate-600">themaradi.com/memorial/{vault.slug}</span>
                    ) : (
                      <span className="text-xs text-slate-700">Slug belirlenmemis</span>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-slate-700 group-hover:text-amber-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
