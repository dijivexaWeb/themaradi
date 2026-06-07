'use client'

import Link from 'next/link'
import { ArrowRight, Feather, Menu, X } from 'lucide-react'
import { useState } from 'react'

const links = [
  { href: '/', label: 'Ana sayfa' },
  { href: '#nasil-calisir', label: 'Nasıl çalışır' },
  { href: '#ozellikler', label: 'Dijital anıtlar' },
  { href: '/memorial/demo', label: 'Örnek profil' },
  { href: '/pricing', label: 'Fiyatlar' },
  { href: '#sss', label: 'SSS' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#e6dccb] bg-[#fbf8f1]/92 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 text-[#173d31]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c7a76f] bg-[#f4eee3] text-[#9a7132]">
            <Feather className="h-5 w-5" />
          </span>
          <span className="font-serif text-2xl">The Maradi</span>
        </Link>

        {/* DESKTOP LİNKLER */}
        <div className="hidden items-center gap-8 text-sm font-medium text-[#4c463c] lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-[#9a7132]">
              {link.label}
            </Link>
          ))}
        </div>

        {/* SAĞ ALAN */}
        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="hidden items-center gap-2 rounded-md bg-[#103b2c] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#103b2c]/15 transition hover:bg-[#0b2b20] sm:inline-flex"
          >
            Başla
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* MOBİL HAMBURGER */}
          <button
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e1d5c3] bg-[#f4eee3] text-[#173d31] transition hover:bg-[#ede5d8] lg:hidden"
            aria-label="Menüyü aç"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* MOBİL MENÜ */}
      {open && (
        <div className="border-t border-[#e6dccb] bg-[#fbf8f1] px-5 pb-5 pt-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-[#4c463c] transition hover:bg-[#f4eee3] hover:text-[#173d31]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-[#103b2c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b2b20]"
            >
              Başla
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
