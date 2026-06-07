import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ count: vaultCount }, { count: pendingHeirs }, { count: pendingMessages }] = await Promise.all([
    supabase.from('vaults').select('*', { count: 'exact', head: true }),
    supabase.from('heirs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('guestbook').select('*', { count: 'exact', head: true }).eq('is_approved', false),
  ])

  const stats = [
    { label: 'Toplam kasa', value: vaultCount ?? 0, tone: 'navy' },
    { label: 'Bekleyen davet', value: pendingHeirs ?? 0, tone: 'teal' },
    { label: 'Moderasyon', value: pendingMessages ?? 0, tone: 'gold' },
  ]

  const queues = [
    {
      title: 'Vefat talebi inceleme',
      desc: 'Belge, itiraz penceresi ve executor onaylari tek akista incelenir.',
      status: 'Taslak',
    },
    {
      title: 'Ziyaretci defteri moderasyonu',
      desc: 'Spam, hakaret ve hassas veri iceren mesajlar yayinlanmadan tutulur.',
      status: 'Hazirlanacak',
    },
    {
      title: 'Partner QR yonetimi',
      desc: 'Mermer atolyesi QR uretimi, eslestirme ve okuma sagligi takip edilir.',
      status: 'Planlandi',
    },
  ]

  return (
    <main className="theme-admin min-h-screen bg-[#f5f7fb] text-slate-950">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl gradient-text">themaradi</Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Dashboard
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors">
                Cikis
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">Operasyon Konsolu</p>
          <h1 className="text-3xl font-bold text-slate-950">Guven, moderasyon ve sureklilik merkezi</h1>
          <p className="text-slate-600 mt-3 max-w-2xl">
            Admin yuzeyi; hassas talepleri, QR sagligini, partner islemlerini ve yayin onaylarini sakin ve denetlenebilir bir akista toplar.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-sm text-slate-500 mb-3">{stat.label}</div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-slate-950">{stat.value}</div>
                <div className={`w-10 h-10 rounded-xl ${
                  stat.tone === 'teal' ? 'bg-teal-50 text-teal-700' :
                  stat.tone === 'gold' ? 'bg-amber-50 text-amber-700' :
                  'bg-slate-100 text-slate-700'
                } flex items-center justify-center`}>
                  <span className="w-2 h-2 rounded-full bg-current" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.4fr_0.8fr] gap-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-950">Operasyon kuyruklari</h2>
              <span className="text-xs text-slate-500">Rol bazli yetki sonraki faz</span>
            </div>
            <div className="space-y-3">
              {queues.map((item) => (
                <div key={item.title} className="border border-slate-200 rounded-xl p-4 hover:border-teal-200 hover:bg-teal-50/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950">{item.title}</h3>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                    <span className="text-xs whitespace-nowrap border border-slate-200 bg-slate-50 rounded-full px-3 py-1 text-slate-600">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="bg-[#123047] text-white rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-200 mb-3">Tasarim ilkesi</p>
            <h2 className="text-xl font-bold mb-4">Hassas urun, sakin arayuz</h2>
            <p className="text-sm text-slate-200 leading-relaxed mb-5">
              Admin panelde parlak pazarlama dili yerine denetim, izlenebilirlik ve karar guveni one cikmali.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-slate-300">Ana renk</span>
                <span className="font-medium">Lacivert</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-slate-300">Aksiyon</span>
                <span className="font-medium">Teal</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-slate-300">Vurgu</span>
                <span className="font-medium">Mat altin</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
