'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown, Globe, Menu, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useLang } from '@/i18n/context'
import { langs, type Lang } from '@/i18n/index'
import { localizedHref, stripLocalePrefix, isLocaleEligible } from '@/lib/i18n/localizedHref'

export default function Nav() {
  const { t, lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  function switchLang(code: Lang) {
    setLang(code)
    const basePath = stripLocalePrefix(pathname)?.rest ?? pathname
    if (isLocaleEligible(basePath)) {
      router.push(localizedHref(basePath, code))
    }
  }

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
    { href: '#nasil-calisir', label: t.nav.howItWorks },
    { href: '/memorial',      label: t.nav.features    },
    { href: '/memorial/demo', label: t.nav.demoProfile },
    { href: '/#fiyatlar',     label: t.nav.pricing     },
    { href: '#sss',           label: t.nav.faq         },
  ]

  const currentLang = langs.find(l => l.code === lang)

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px clamp(20px,4vw,60px)',
        background: 'rgba(7,7,13,.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(201,169,110,.12)',
      }}
    >
      {/* LOGO */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 46, height: 46, flexShrink: 0, overflow: 'hidden',
          borderRadius: '50%',
          backgroundImage: 'url(/images/logo-mark.png)',
          backgroundSize: 'auto 82px',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }} />
        <span style={{
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontSize: 22, fontWeight: 500, letterSpacing: '.02em', color: '#EDE8DD',
        }}>
          The Eternal Memory
        </span>
      </Link>

      {/* DESKTOP LINKS */}
      <div className="hidden lg:flex" style={{ alignItems: 'center', gap: 32 }}>
        {links.map(link => (
          <Link
            key={link.href + link.label}
            href={link.href}
            style={{
              color: 'rgba(237,232,221,.6)', textDecoration: 'none',
              fontSize: 14.5, fontWeight: 300,
              transition: 'color .3s',
              fontFamily: 'var(--font-outfit), system-ui, sans-serif',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#D8BE8A')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(237,232,221,.6)')}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* RIGHT AREA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

        {/* LANGUAGE SWITCHER */}
        <div ref={langRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'none',
              border: '1px solid rgba(237,232,221,.14)',
              borderRadius: 999, color: 'rgba(237,232,221,.75)',
              padding: '8px 13px', cursor: 'pointer',
              fontFamily: 'var(--font-outfit), system-ui, sans-serif',
              fontSize: 12.5, fontWeight: 300, letterSpacing: '.05em',
            }}
          >
            <Globe style={{ width: 13, height: 13, stroke: '#C9A96E', strokeWidth: 1.3 }} />
            {currentLang?.flag ?? lang.toUpperCase()}
            <ChevronDown style={{
              width: 10, height: 10, opacity: .5,
              transform: langOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform .3s',
            }} />
          </button>

          {langOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 46,
              background: 'rgba(13,14,22,.97)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(201,169,110,.18)',
              borderRadius: 14, padding: 8, minWidth: 168,
              boxShadow: '0 24px 50px rgba(0,0,0,.55)',
              zIndex: 100,
            }}>
              <div style={{
                fontSize: 9.5, letterSpacing: '.2em',
                textTransform: 'uppercase', color: 'rgba(201,169,110,.65)',
                padding: '8px 12px 6px',
                fontFamily: 'var(--font-outfit), system-ui, sans-serif',
              }}>
                {langs.length} dil mevcut
              </div>
              {langs.map(l => (
                <button
                  key={l.code}
                  onClick={() => { switchLang(l.code); setLangOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    fontSize: 14, fontWeight: 300,
                    color: lang === l.code ? '#D8BE8A' : 'rgba(237,232,221,.78)',
                    cursor: 'pointer', background: 'none', border: 'none',
                    textAlign: 'left',
                    fontFamily: 'var(--font-outfit), system-ui, sans-serif',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#C9A96E' }}>{l.flag}</span>
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LOGIN */}
        <Link
          href="/login"
          className="hidden sm:block"
          style={{
            color: 'rgba(237,232,221,.6)', textDecoration: 'none',
            fontSize: 14.5, fontWeight: 300, whiteSpace: 'nowrap',
            fontFamily: 'var(--font-outfit), system-ui, sans-serif',
            transition: 'color .3s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#D8BE8A')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(237,232,221,.6)')}
        >
          {t.nav.login}
        </Link>

        {/* CTA */}
        <Link
          href="/#fiyatlar"
          className="tem-goldbtn hidden sm:block"
          style={{
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #E2C885, #C39E63)',
            color: '#14110a', fontWeight: 500, fontSize: 14,
            padding: '11px 22px', borderRadius: 999,
            boxShadow: '0 8px 26px rgba(201,169,110,.22)',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-outfit), system-ui, sans-serif',
          }}
        >
          {t.nav.cta}
        </Link>

        {/* MOBILE HAMBURGER */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: 10,
            border: '1px solid rgba(201,169,110,.2)',
            background: 'rgba(201,169,110,.06)',
            color: '#EDE8DD', cursor: 'pointer',
          }}
          aria-label={t.nav.openMenu}
        >
          {open ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'rgba(7,7,13,.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(201,169,110,.12)',
          padding: '16px clamp(20px,4vw,60px) 24px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {links.map(link => (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                style={{
                  padding: '12px 16px', borderRadius: 10,
                  color: 'rgba(237,232,221,.72)', textDecoration: 'none',
                  fontSize: 15, fontWeight: 300,
                  fontFamily: 'var(--font-outfit), system-ui, sans-serif',
                  transition: 'background .2s, color .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,.06)'; e.currentTarget.style.color = '#D8BE8A' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(237,232,221,.72)' }}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ borderTop: '1px solid rgba(201,169,110,.12)', marginTop: 12, paddingTop: 12, display: 'flex', gap: 10 }}>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                style={{
                  flex: 1, textAlign: 'center', padding: '12px',
                  borderRadius: 12, border: '1px solid rgba(237,232,221,.16)',
                  color: 'rgba(237,232,221,.78)', textDecoration: 'none',
                  fontSize: 14, fontWeight: 300,
                  fontFamily: 'var(--font-outfit), system-ui, sans-serif',
                }}
              >
                {t.nav.login}
              </Link>
              <Link
                href="/#fiyatlar"
                onClick={() => setOpen(false)}
                style={{
                  flex: 1, textAlign: 'center', padding: '12px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #E2C885, #C39E63)',
                  color: '#14110a', textDecoration: 'none',
                  fontSize: 14, fontWeight: 500,
                  fontFamily: 'var(--font-outfit), system-ui, sans-serif',
                }}
              >
                {t.nav.cta}
              </Link>
            </div>
            {/* Mobile lang */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {langs.map(l => (
                <button
                  key={l.code}
                  onClick={() => { switchLang(l.code); setOpen(false) }}
                  style={{
                    padding: '6px 12px', borderRadius: 8,
                    border: lang === l.code
                      ? '1px solid rgba(201,169,110,.5)'
                      : '1px solid rgba(237,232,221,.14)',
                    background: lang === l.code ? 'rgba(201,169,110,.1)' : 'none',
                    color: lang === l.code ? '#D8BE8A' : 'rgba(237,232,221,.55)',
                    fontSize: 12, cursor: 'pointer',
                  }}
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
