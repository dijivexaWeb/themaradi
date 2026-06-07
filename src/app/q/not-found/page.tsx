import type { Metadata } from 'next'
import Link from 'next/link'
import { Feather, QrCode } from 'lucide-react'

export const metadata: Metadata = {
  title: 'QR Kodu Bulunamadı — The Maradi',
  robots: { index: false },
}

export default function QrNotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fbf8f1] px-5 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#e1d5c3] bg-[#f4eee3] text-[#b08340]">
        <QrCode className="h-8 w-8" />
      </div>

      <h1 className="font-serif text-4xl text-[#173d31]">QR kodu tanınmadı</h1>

      <p className="mx-auto mt-4 max-w-sm text-base leading-8 text-[#5b5245]">
        Bu QR koda ait bir profil bulunamadı. Plakayı doğru okuttuğunuzdan emin olun
        ya da bizimle iletişime geçin.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-xl bg-[#103b2c] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#0b2b20]"
        >
          İletişime Geç
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[#c7a76f] px-7 py-3 text-sm font-semibold text-[#173d31] transition hover:bg-[#f4eee3]"
        >
          Ana Sayfa
        </Link>
      </div>

      <Link href="/" className="mt-10 flex items-center gap-2 text-sm text-[#8a7a64] hover:text-[#173d31]">
        <Feather className="h-4 w-4" />
        The Maradi
      </Link>
    </div>
  )
}
