'use client'

import Link from 'next/link'
import BrandLogo from '@/components/BrandLogo'
import { useLang } from '@/i18n/context'

export default function MemorialsFooter() {
  const { t } = useLang()
  const f = t.pricing.footer

  return (
    <footer className="border-t border-white/10 bg-[#0c2a1e] px-5 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 sm:flex-row sm:justify-between">
        <BrandLogo light />
        <div className="flex flex-wrap justify-center gap-5 text-xs sm:justify-end">
          <Link href="/privacy" className="text-white/60 transition hover:text-white/90">
            {f.privacy}
          </Link>
          <Link href="/terms" className="text-white/60 transition hover:text-white/90">
            {f.terms}
          </Link>
          <Link href="/contact" className="text-white/60 transition hover:text-white/90">
            {f.contact}
          </Link>
        </div>
        <p className="text-xs text-white/40">{f.copyright}</p>
      </div>
    </footer>
  )
}
