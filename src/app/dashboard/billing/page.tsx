import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const plans = [
    {
      name: 'Ucretsiz',
      price: '0',
      currency: 'GEL',
      period: 'aylik',
      features: ['1 kasa', '500 MB depolama', 'Temel anı sayfasi', 'E-posta bildirimi'],
      current: !subscription || subscription.plan_id === 'free',
      available: true,
    },
    {
      name: 'Premium',
      price: '14.99',
      currency: 'GEL',
      period: 'aylik',
      features: ['5 kasa', '10 GB depolama', 'Ozel alan adi', 'QR mezar tasi entegrasyonu', 'Sifreleme'],
      current: subscription?.plan_id === 'premium',
      available: false,
    },
    {
      name: 'Omurboyu',
      price: '299',
      currency: 'GEL',
      period: 'tek seferlik',
      features: ['Sinirsiz kasa', '50 GB depolama', 'Ozel alan adi', 'QR mezar tasi entegrasyonu', 'Sifreleme', 'Oncelikli destek'],
      current: subscription?.plan_id === 'lifetime',
      available: false,
    },
  ]

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Abonelik ve Odeme</h1>
          <p className="text-sm text-slate-500 mt-1">Planınızı yonetin</p>
        </div>

        {subscription && (
          <div className="glass border border-amber-500/20 rounded-2xl p-5 mb-8 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">
                Aktif Plan: {subscription.plan_id}
              </div>
              {subscription.current_period_end && (
                <div className="text-xs text-slate-500">
                  {new Date(subscription.current_period_end).toLocaleDateString('tr-TR')} tarihinde yenilenir
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div key={plan.name} className={`glass border rounded-2xl p-6 flex flex-col ${
              plan.current ? 'border-amber-500/40' : 'border-slate-800/60'
            }`}>
              {plan.current && (
                <div className="text-xs text-amber-400 font-semibold mb-2">Mevcut Plan</div>
              )}
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-100">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-slate-100">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.currency} / {plan.period}</span>
                </div>
              </div>
              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-400">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              {!plan.current && (
                <button disabled={!plan.available}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-amber-500 hover:bg-amber-400 disabled:hover:bg-amber-500 text-white">
                  {plan.available ? 'Plana Gec' : 'Yakinda'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
