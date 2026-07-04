import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react'
import LandingNav from '@/components/landing/Nav'
import { getTranslation } from '@/i18n/server'
import { buildAlternateLanguages } from '@/lib/i18n/hreflang'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'
const PATH = '/online-taziye-defteri'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation()
  const c = t.seoOnlineTaziyeDefteri
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: `${APP_URL}${PATH}`, languages: buildAlternateLanguages(PATH) },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      url: `${APP_URL}${PATH}`,
      type: 'article',
    },
  }
}

export default async function OnlineTaziyeDefteriPage() {
  const { t } = await getTranslation()
  const c = t.seoOnlineTaziyeDefteri

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: c.breadcrumbHome, item: APP_URL },
      { '@type': 'ListItem', position: 2, name: c.breadcrumbCurrent, item: `${APP_URL}${PATH}` },
    ],
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#07070d', color: '#EDE8DD' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <LandingNav />

      <div className="mx-auto max-w-3xl px-5 pt-16 pb-24 sm:px-8">
        <nav className="mb-8 flex items-center gap-2 text-xs text-[#6a8e78]">
          <Link href="/" className="hover:text-[#c7a76f] transition-colors">{c.breadcrumbHome}</Link>
          <span>/</span>
          <span className="text-[#c7a76f]">{c.breadcrumbCurrent}</span>
        </nav>

        <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">{c.h1}</h1>
        <p className="mt-5 text-base leading-7 text-[#EDE8DD]/70">{c.intro}</p>

        <Link
          href="/satin-al/anma"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#c7a76f] px-6 py-3 text-sm font-semibold text-[#07070d] shadow-[0_8px_24px_rgba(199,167,111,0.25)] transition-colors hover:bg-[#e8d5a8]"
        >
          {c.ctaButton}
          <ArrowRight className="h-4 w-4" />
        </Link>

        <section className="mt-16">
          <h2 className="font-serif text-2xl font-semibold text-[#c7a76f]">{c.howItWorksTitle}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {c.howItWorksSteps.map((step, i) => (
              <div key={step.title} className="rounded-2xl border border-[#243d2e] bg-[#0c1a11] p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c7a76f]/15 text-sm font-bold text-[#c7a76f]">
                  {i + 1}
                </div>
                <p className="mt-3 text-sm font-semibold text-[#EDE8DD]">{step.title}</p>
                <p className="mt-1.5 text-sm leading-6 text-[#EDE8DD]/60">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-2xl font-semibold text-[#c7a76f]">{c.whoForTitle}</h2>
          <ul className="mt-5 space-y-3">
            {c.whoForItems.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[#EDE8DD]/75">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#c7a76f]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-2xl font-semibold text-[#c7a76f]">{c.whatsIncludedTitle}</h2>
          <ul className="mt-5 space-y-3">
            {c.whatsIncludedItems.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[#EDE8DD]/75">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#c7a76f]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 rounded-2xl border border-[#243d2e] bg-[#0c1a11] p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#c7a76f]" />
            <h2 className="font-serif text-xl font-semibold text-[#c7a76f]">{c.privacyTitle}</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#EDE8DD]/70">{c.privacyBody}</p>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-2xl font-semibold text-[#c7a76f]">{c.faqTitle}</h2>
          <div className="mt-5 space-y-3">
            {c.faqItems.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-[#243d2e] bg-[#0c1a11] p-5">
                <summary className="cursor-pointer select-none text-sm font-semibold text-[#EDE8DD] marker:content-none">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm leading-6 text-[#EDE8DD]/65">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-[#c7a76f]/30 bg-gradient-to-b from-[#0c1a11] to-[#080f0b] p-8 text-center">
          <h2 className="font-serif text-2xl font-semibold text-[#EDE8DD]">{c.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#EDE8DD]/70">{c.ctaBody}</p>
          <Link
            href="/satin-al/anma"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#c7a76f] px-6 py-3 text-sm font-semibold text-[#07070d] shadow-[0_8px_24px_rgba(199,167,111,0.25)] transition-colors hover:bg-[#e8d5a8]"
          >
            {c.ctaButton}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  )
}
