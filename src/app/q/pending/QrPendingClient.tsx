'use client'

import Link from 'next/link'
import { Clock, Feather, QrCode } from 'lucide-react'
import { useLang } from '@/i18n/context'

export default function QrPendingClient({ code }: { code?: string }) {
  const { t } = useLang()
  const q = t.qPages.pending

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fbf8f1] px-5 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#c7a76f] bg-[#f4eee3] text-[#b08340]">
        <Clock className="h-8 w-8" />
      </div>

      <h1 className="font-serif text-4xl text-[#173d31]">{q.title}</h1>

      <p className="mx-auto mt-4 max-w-sm text-base leading-8 text-[#5b5245]">
        {q.body}
      </p>

      {code && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#e1d5c3] bg-[#f4eee3] px-5 py-3">
          <QrCode className="h-4 w-4 text-[#b08340]" />
          <span className="font-mono text-sm font-semibold tracking-widest text-[#173d31]">{code}</span>
        </div>
      )}

      <p className="mt-6 text-sm text-[#8a7a64]">
        {q.problem}{' '}
        <Link href="/contact" className="font-semibold text-[#9a7132] underline-offset-2 hover:underline">
          {q.contactLink}
        </Link>
      </p>

      <Link href="/" className="mt-10 flex items-center gap-2 text-sm text-[#8a7a64] hover:text-[#173d31]">
        <Feather className="h-4 w-4" />
        The Maradi
      </Link>
    </div>
  )
}
