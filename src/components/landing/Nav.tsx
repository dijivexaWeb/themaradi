'use client'

import Link from 'next/link'
import { ArrowRight, ChevronDown, Feather, Menu, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useLang } from '@/i18n/context'
import { langs } from '@/i18n/index'

export default function Nav() {
  const { t, lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const links = [
    { href: '/', label: t.nav.home },
    { href: '#nasil-calisir', label: t.nav.howItWorks },
    { href: '#ozellikler', label: t.nav.features },
    { href: '/memorial/demo', label: t.nav.demoProfile },
    { href: '/pricing', label: t.nav.pricing },
    { href: '#sss', label: t.nav.faq },
  ]

  const currentLang = langs.find(l => l.code === lang)

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

        {/* DESKTOP LINKS */}
        <div className="hidden items-center gap-8 text-sm font-medium text-[#4c463c] lg:flex">
          {links.map((link) => (
            <Link key={link.href + link.label} href={link.href} className="transition hover:text-[#9a7132]">
              {link.label}
            </Link>
          ))}
        </div>

        {/* RIGHT AREA */}
        <div className="flex items-center gap-3">
          {/* LANGUAGE SWITCHER */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-[#e1d5c3] bg-[#f4eee3] px-3 py-2 text-xs font-semibold text-[#173d31] transition hover:bg-[#ede5d8]"
            >
              <span>{currentLang?.flag ?? lang.toUpperCase()}</span>
              <ChevronDown className={`h-3 w-3 text-[#9a7132] transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-36 overflow-hidden rounded-xl border border-[#e1d5c3] bg-[#fbf8f1] shadow-lg">
                {langs.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false) }}
                    className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition hover:bg-[#f4eee3] ${lang === l.code ? 'font-semibold text-[#9a7132]' : 'text-[#4c463c]'}`}
                  >
                    <span className="text-xs font-bold text-[#b08340]">{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/pricing"
            className="hidden items-center gap-2 rounded-md bg-[#103b2c] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#103b2c]/15 transition hover:bg-[#0b2b20] sm:inline-flex"
          >
            {t.nav.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* MOBILE HAMBURGER */}
          <button
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e1d5c3] bg-[#f4eee3] text-[#173d31] transition hover:bg-[#ede5d8] lg:hidden"
            aria-label={t.nav.openMenu}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="border-t border-[#e6dccb] bg-[#fbf8f1] px-5 pb-5 pt-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href + link.label}
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
              {t.nav.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {/* Mobile lang switcher */}
            <div className="mt-3 flex gap-2 border-t border-[#e6dccb] pt-3">
              {langs.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setOpen(false) }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${lang === l.code ? 'border-[#b08340] bg-[#f4eee3] text-[#9a7132]' : 'border-[#e1d5c3] text-[#4c463c] hover:bg-[#f4eee3]'}`}
                >
                  {l.flag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
