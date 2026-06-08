'use client'

import Link from 'next/link'
import { useLang } from '@/i18n/context'
import BrandLogo from '@/components/BrandLogo'

export interface TocItem {
  id: string
  label: string
}

export default function LegalPage({
  eyebrow,
  title,
  date,
  toc,
  children,
}: {
  eyebrow: string
  title: string
  date: string
  toc: TocItem[]
  children: React.ReactNode
}) {
  const { t } = useLang()
  const s = t.legal.shell

  return (
    <div className="min-h-screen bg-[#fbf8f1] text-[#173d31]">

      <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#e6dccb] bg-[#fbf8f1]/92 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <BrandLogo />
          <div className="hidden items-center gap-6 text-sm text-[#4c463c] lg:flex">
            <Link href="/privacy" className="hover:text-[#9a7132]">{s.privacyLink}</Link>
            <Link href="/terms" className="hover:text-[#9a7132]">{s.termsLink}</Link>
            <Link href="/legal/verification-policy" className="hover:text-[#9a7132]">{s.verificationLink}</Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-5 pt-24 pb-20 sm:px-8 lg:grid lg:grid-cols-[220px_1fr] lg:gap-14">

        {/* TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#8a7a64]">{s.toc}</p>
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block rounded-lg px-3 py-1.5 text-sm text-[#5b5245] transition hover:bg-[#f4eee3] hover:text-[#173d31]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </aside>

        {/* CONTENT */}
        <main>
          <div className="mb-10 border-b border-[#e6dccb] pb-8">
            <div className="mb-3 flex items-center gap-3 text-[#b08340]">
              <span className="h-px w-8 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.2em] uppercase">{eyebrow}</span>
            </div>
            <h1 className="font-serif text-4xl text-[#173d31]">{title}</h1>
            <p className="mt-2 text-sm text-[#8a7a64]">{s.lastUpdated} {date}</p>
          </div>

          <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-[#173d31] prose-a:text-[#9a7132] prose-strong:text-[#173d31] prose-li:text-[#4c463c] prose-p:text-[#4c463c] prose-p:leading-7">
            {children}
          </div>
        </main>
      </div>

      <footer className="border-t border-[#e6dccb] bg-[#fbf8f1] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-[#8a7a64] sm:flex-row">
          <Link href="/" className="font-serif text-lg text-[#173d31]">The Eternal Memory</Link>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[#173d31]">{s.footerPrivacy}</Link>
            <Link href="/terms" className="hover:text-[#173d31]">{s.footerTerms}</Link>
            <Link href="/contact" className="hover:text-[#173d31]">{s.footerContact}</Link>
          </div>
          <span>{s.copyright}</span>
        </div>
      </footer>
    </div>
  )
}
