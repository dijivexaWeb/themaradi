'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Check,
  CreditCard,
  Feather,
  FileText,
  Heart,
  HelpCircle,
  Lock,
  MessageCircle,
  QrCode,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { useLang } from '@/i18n/context'
import BrandLogo from '@/components/BrandLogo'

const paymentIcons = [CreditCard, Sparkles, Sparkles, FileText] as const

import type { PricingConfig } from '@/lib/pricing'

export default function PricingClient({ pricing }: { pricing: PricingConfig }) {
  const { t } = useLang()
  const p = t.pricing

  // Live prices from DB — override dict defaults
  const memorialPrice = pricing.memorialPrice
  const vaultSetup = pricing.vaultSetup
  const vaultMonthly = pricing.vaultMonthly
  const hasCampaign = pricing.campaignActive && (pricing.campaignMemorial || pricing.campaignVaultSetup)

  const comparisonRows = p.comparison.rows.map((label, i) => ({
    label,
    memorial: p.comparison.rowMemorial[i],
    vault: p.comparison.rowVault[i],
  }))

  return (
    <div className="min-h-screen bg-[#fbf8f1] text-[#173d31]">

      {/* NAV */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#e6dccb] bg-[#fbf8f1]/92 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <BrandLogo />
          <div className="hidden items-center gap-7 text-sm text-[#4c463c] lg:flex">
            <Link href="/" className="hover:text-[#9a7132]">{p.nav.home}</Link>
            <Link href="/memorial/demo" className="hover:text-[#9a7132]">{p.nav.demoProfile}</Link>
            <Link href="/contact" className="hover:text-[#9a7132]">{p.nav.contact}</Link>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-md border border-[#c7a76f] px-5 py-2.5 text-sm font-semibold text-[#173d31] transition hover:bg-[#f4eee3]"
          >
            {p.nav.askQuestion}
          </Link>
        </div>
      </nav>

      <main className="pt-16">

        {/* HERO */}
        <section className="border-b border-[#e6dccb] px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 flex items-center justify-center gap-3 text-[#b08340]">
              <span className="h-px w-10 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.2em] uppercase">{p.hero.eyebrow}</span>
              <span className="h-px w-10 bg-[#c7a76f]" />
            </div>
            <h1 className="font-serif text-5xl leading-tight text-[#173d31] sm:text-[3.75rem]">
              {p.hero.h1a}<br />
              <span className="text-[#b08340]">{p.hero.h1b}</span>
            </h1>
            <p
              className="mx-auto mt-5 max-w-xl text-base leading-8 text-[#5b5245]"
              dangerouslySetInnerHTML={{ __html: p.hero.p }}
            />
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">

            {/* MEMORIAL PROFILE */}
            <div className="flex flex-col rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-8 shadow-lg shadow-[#4d3d26]/6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e1d5c3] bg-[#f4eee3] text-[#b08340]">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#b08340]">{p.memorial.badge}</p>
                  <h2 className="font-serif text-2xl text-[#173d31]">{p.memorial.title}</h2>
                </div>
              </div>

              <div className="mb-6 rounded-xl border border-[#e1d5c3] bg-[#f7f2e9] p-5">
                {hasCampaign && pricing.campaignLabel && (
                  <div className="mb-3 inline-block rounded-full bg-[#b08340] px-3 py-1 text-xs font-semibold text-white">
                    {pricing.campaignLabel}
                  </div>
                )}
                <div className="flex items-end gap-2">
                  {hasCampaign && pricing.campaignMemorial ? (
                    <>
                      <span className="font-serif text-4xl text-[#8a7a64] line-through">{memorialPrice}</span>
                      <span className="font-serif text-6xl text-[#173d31]">{pricing.campaignMemorial}</span>
                    </>
                  ) : (
                    <span className="font-serif text-6xl text-[#173d31]">{memorialPrice}</span>
                  )}
                  <div className="mb-1.5">
                    <span className="text-2xl font-semibold text-[#b08340]">{p.memorial.currency}</span>
                    <p className="text-sm text-[#8a7a64]">{p.memorial.priceLabel}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-[#665d50]">{p.memorial.priceNote}</p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {p.memorial.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#b08340]" />
                    <span className="text-[#4c463c]">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-[#d4e8dc] bg-[#edf7f1] p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#2d7a53]" />
                <p className="text-sm text-[#2d5c3e]">
                  {p.memorial.verificationNote}
                </p>
              </div>

              <Link
                href="/satin-al/anma"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#c7a76f] px-5 py-3.5 text-sm font-semibold text-[#173d31] transition hover:bg-[#f4eee3]"
              >
                {p.memorial.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* LIFE VAULT */}
            <div className="relative flex flex-col rounded-2xl border-2 border-[#b08340] bg-[#fffdf8] p-8 pt-12 shadow-xl shadow-[#4d3d26]/12 ring-4 ring-[#b08340]/8">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#b08340] px-5 py-1.5 text-xs font-semibold text-white shadow">
                {p.vault.badge}
              </div>

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#c7a76f] bg-[#f4eee3] text-[#b08340]">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#b08340]">{p.vault.badgeLabel}</p>
                  <h2 className="font-serif text-2xl text-[#173d31]">{p.vault.title}</h2>
                </div>
              </div>

              <div className="mb-6 rounded-xl border border-[#c7a76f]/40 bg-[#f7f2e9] p-5">
                <div className="flex items-center gap-5">
                  <div>
                    <p className="text-xs text-[#8a7a64]">{p.vault.setupLabel}</p>
                    <div className="flex items-end gap-1">
                      {hasCampaign && pricing.campaignVaultSetup ? (
                        <>
                          <span className="font-serif text-2xl text-[#8a7a64] line-through">{vaultSetup}</span>
                          <span className="font-serif text-4xl text-[#173d31]">{pricing.campaignVaultSetup}</span>
                        </>
                      ) : (
                        <span className="font-serif text-4xl text-[#173d31]">{vaultSetup}</span>
                      )}
                      <span className="mb-1 text-xl font-semibold text-[#b08340]">{p.vault.setupCurrency}</span>
                    </div>
                    <p className="text-xs text-[#8a7a64]">{p.vault.setupNote}</p>
                  </div>
                  <div className="h-12 w-px bg-[#e1d5c3]" />
                  <div>
                    <p className="text-xs text-[#8a7a64]">{p.vault.monthlyLabel}</p>
                    <div className="flex items-end gap-1">
                      {hasCampaign && pricing.campaignVaultMonthly ? (
                        <>
                          <span className="font-serif text-2xl text-[#8a7a64] line-through">{vaultMonthly}</span>
                          <span className="font-serif text-4xl text-[#173d31]">{pricing.campaignVaultMonthly}</span>
                        </>
                      ) : (
                        <span className="font-serif text-4xl text-[#173d31]">{vaultMonthly}</span>
                      )}
                      <span className="mb-1 text-xl font-semibold text-[#b08340]">{p.vault.monthlyCurrency}</span>
                    </div>
                    <p className="text-xs text-[#8a7a64]">{p.vault.monthlyPeriod}</p>
                  </div>
                </div>
                <div className="mt-3 border-t border-[#e1d5c3] pt-3">
                  <p
                    className="text-sm text-[#665d50]"
                    dangerouslySetInnerHTML={{ __html: p.vault.annualNote }}
                  />
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {p.vault.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#b08340]" />
                    <span className="text-[#4c463c]">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/satin-al/kasa"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#103b2c] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#103b2c]/20 transition hover:bg-[#0b2b20]"
              >
                {p.vault.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-[#8a7a64]">
            {p.bulkContact}{' '}
            <Link href="/contact" className="font-semibold text-[#9a7132] underline-offset-2 hover:underline">
              {p.bulkContactLink}
            </Link>
            .
          </p>
        </section>

        {/* COMPARISON TABLE */}
        <section className="border-y border-[#e6dccb] bg-[#f7f2e9] px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <h2 className="font-serif text-4xl text-[#173d31]">{p.comparison.heading}</h2>
              <p className="mt-3 text-[#665d50]">{p.comparison.sub}</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#e1d5c3] bg-[#fffdf8]">
              <div className="grid grid-cols-3 border-b border-[#e1d5c3] bg-[#f4eee3] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#8a7a64]">
                <span>{p.comparison.colStatus}</span>
                <span className="text-center">{p.comparison.colMemorial}</span>
                <span className="text-center">{p.comparison.colVault}</span>
              </div>

              {comparisonRows.map(({ label, memorial, vault }, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-3 items-center px-6 py-4 ${i < comparisonRows.length - 1 ? 'border-b border-[#e1d5c3]' : ''}`}
                >
                  <span className="text-sm text-[#4c463c]">{label}</span>
                  <div className="flex justify-center">
                    {memorial
                      ? <Check className="h-5 w-5 text-[#2d7a53]" />
                      : <span className="text-xl text-[#d1c4ae]">—</span>}
                  </div>
                  <div className="flex justify-center">
                    {vault
                      ? <Check className="h-5 w-5 text-[#b08340]" />
                      : <span className="text-xl text-[#d1c4ae]">—</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VERIFICATION PROCESS */}
        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <div className="mb-4 flex items-center justify-center gap-2 text-[#2d7a53]">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-widest">{p.verification.eyebrow}</span>
              </div>
              <h2 className="font-serif text-4xl text-[#173d31]">{p.verification.heading}</h2>
              <p className="mx-auto mt-3 max-w-xl text-[#665d50]">
                {p.verification.sub}
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-8 top-0 h-full w-px bg-[#e1d5c3] sm:left-10" />
              <div className="space-y-6">
                {p.verification.steps.map((step) => (
                  <div key={step.num} className="relative flex gap-6 sm:gap-8">
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#c7a76f] bg-[#fbf8f1] sm:h-14 sm:w-14">
                      <span className="font-serif text-sm font-bold text-[#b08340]">{step.num}</span>
                    </div>
                    <div className="pt-2 pb-2">
                      <h3 className="font-serif text-lg text-[#173d31]">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#5b5245]">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex items-start gap-3 rounded-xl border border-[#d4e8dc] bg-[#edf7f1] p-5">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-[#2d7a53]" />
              <div className="text-sm text-[#2d5c3e]">
                {p.verification.safetyNote}
              </div>
            </div>
          </div>
        </section>

        {/* PAYMENT METHODS */}
        <section className="border-t border-[#e6dccb] bg-[#f7f2e9] px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <h2 className="font-serif text-4xl text-[#173d31]">{p.payment.heading}</h2>
              <p className="mt-3 text-[#665d50]">{p.payment.sub}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {p.payment.methods.map((m, i) => {
                const Icon = paymentIcons[i]
                return (
                  <div key={m.name} className="flex items-center gap-4 rounded-xl border border-[#e1d5c3] bg-[#fffdf8] p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e1d5c3] bg-[#f4eee3] text-[#b08340]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-serif text-sm font-semibold text-[#173d31]">{m.name}</div>
                      <div className="text-xs text-[#8a7a64]">{m.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#e1d5c3] bg-[#f4eee3] p-4">
              <Shield className="h-5 w-5 shrink-0 text-[#b08340]" />
              <p className="text-sm text-[#5b5245]">
                {p.payment.securityNote}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <h2 className="font-serif text-4xl text-[#173d31]">{p.faqSection.heading}</h2>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#e1d5c3] bg-[#fffdf8]">
              {p.faqs.map((faq, i) => (
                <div
                  key={i}
                  className={`px-6 py-5 ${i < p.faqs.length - 1 ? 'border-b border-[#e1d5c3]' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#b08340]" />
                    <div>
                      <p className="font-serif text-lg text-[#173d31]">{faq.q}</p>
                      <p className="mt-2 text-sm leading-7 text-[#5b5245]">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-[#0c3327] px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Feather className="mx-auto mb-4 h-8 w-8 text-[#c7a76f]" />
            <h2 className="font-serif text-4xl text-white sm:text-5xl">
              {p.cta.heading}<br />
              <span className="text-[#c7a76f]">{p.cta.headingAccent}</span>
            </h2>
            <p className="mt-5 text-lg text-[#cfc3ad]">
              {p.cta.sub}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/memorial/demo"
                className="inline-flex items-center gap-2 rounded-xl bg-[#c7a76f] px-8 py-3.5 text-sm font-semibold text-[#0c3327] transition hover:bg-[#d4b87c]"
              >
                {p.cta.demoBtn}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-[#c7a76f]/40 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                {p.cta.contactBtn}
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#e6dccb] bg-[#fbf8f1] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-[#8a7a64] sm:flex-row">
          <Link href="/" className="font-serif text-lg text-[#173d31]">The Eternal Memory</Link>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[#173d31]">{p.footer.privacy}</Link>
            <Link href="/terms" className="hover:text-[#173d31]">{p.footer.terms}</Link>
            <Link href="/contact" className="hover:text-[#173d31]">{p.footer.contact}</Link>
          </div>
          <span>{p.footer.copyright}</span>
        </div>
      </footer>

    </div>
  )
}
