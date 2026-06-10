import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Heart, Leaf } from 'lucide-react'
import { getTranslation } from '@/i18n/server'

export default async function DashboardPage() {
  const { t } = await getTranslation()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: area } = await supabase
    .from('vaults')
    .select('id')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (area) redirect(`/dashboard/vault/${area.id}`)

  return (
    <div className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <section className="rounded-3xl border border-[#e5dccb] bg-[#fffdf7]/90 p-8 shadow-[0_24px_80px_rgba(64,48,24,0.08)] sm:p-12">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-[#dfbd72]/40 bg-[#f8efd8] text-[#174f35]">
            <Heart className="h-7 w-7" />
          </div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#b08340]">{t.dashboard.sidebar.myMemorialArea}</p>
          <h1 className="font-serif text-4xl leading-tight text-[#1f2d27] sm:text-5xl">
            {t.dashboard.home.notActiveHeading}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#6f766f]">
            {t.dashboard.home.notActiveBody}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/satin-al" className="inline-flex items-center gap-2 rounded-xl bg-[#174f35] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(23,79,53,0.22)] transition-colors hover:bg-[#123f2b]">
              {t.dashboard.home.selectPackage}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl border border-[#e5dccb] bg-white px-5 py-3 text-sm font-semibold text-[#174f35] transition-colors hover:bg-[#f8efd8]">
              {t.dashboard.home.contactForExemption}
            </Link>
          </div>
        </section>

        <aside className="relative overflow-hidden rounded-3xl border border-[#e5dccb] bg-[#fffaf0] p-8 text-center shadow-[0_24px_80px_rgba(64,48,24,0.08)]">
          <Leaf className="mx-auto h-7 w-7 text-[#b08340]" />
          <h2 className="mx-auto mt-7 max-w-xs font-serif text-2xl leading-snug text-[#1f2d27]">
            {t.dashboard.home.quoteHeading}
          </h2>
          <p className="mx-auto mt-4 max-w-xs text-sm leading-7 text-[#6f766f]">
            {t.dashboard.home.quoteBody}
          </p>
          <div className="relative mx-auto mt-8 h-52 w-56">
            <Image src="/images/landing/cta-candle-olive.png" alt="Anı mumu ve zeytin dalı" fill className="object-contain" />
          </div>
        </aside>
      </div>
    </div>
  )
}
