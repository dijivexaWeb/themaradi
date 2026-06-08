import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Abonelik ve Ödeme</h1>
          <p className="mt-1 text-sm text-slate-500">Anı alanınızın ödeme durumunu yönetin.</p>
        </div>

        {subscription ? (
          <div className="glass mb-8 flex items-center gap-4 rounded-2xl border border-amber-500/20 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">
                Aktif Plan: {subscription.tier}
              </div>
              {subscription.current_period_end && (
                <div className="text-xs text-slate-500">
                  {new Date(subscription.current_period_end).toLocaleDateString('tr-TR')} tarihinde yenilenir
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-amber-500/20 p-7">
            <h2 className="text-lg font-bold text-slate-100">Aktif ödeme veya muafiyet bulunmuyor</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
              The Eternal Memory’de ücretsiz plan yoktur. Anı alanı satın alma sonrası açılır; özel muafiyetler admin panelinden tanımlanır.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/satin-al" className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-400">
                Paket Seç
              </Link>
              <Link href="/contact" className="rounded-xl border border-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-800/40">
                Muafiyet İçin İletişim
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
