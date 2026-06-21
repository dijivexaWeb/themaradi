'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight, BookOpen, Camera, Check, ChevronDown, Clock,
  Database, Heart, Image as ImageIcon, Key, LockKeyhole,
  MapPin, MessageCircle, Phone, Play, QrCode, Server,
  ShieldCheck, Sparkles, Users,
} from 'lucide-react'
import { useLang } from '@/i18n/context'
import { BrandMark } from '@/components/BrandLogo'
import { useReveal } from '@/hooks/useReveal'
import ParticleCanvas from './ParticleCanvas'
import PhoneMockup3D from './PhoneMockup3D'
import RecentMemorialsCarousel, { type RecentMemorial } from './RecentMemorialsCarousel'
import NotableProfilesSection, { type NotableMemorial } from './NotableProfilesSection'
import type { PricingConfig } from '@/lib/pricing'

/* ─── Types ───────────────────────────────────────────────── */
type CurrencyView = {
  symbol: string; memorial: string; vaultSetup: string
  vaultMonthly: string; campaignMemorial: string; campaignVaultMonthly: string
}
function buildCurrencyView(pricing: PricingConfig, lang: string): CurrencyView {
  if (lang === 'tr' && pricing.memorialTry)
    return { symbol: '₺', memorial: pricing.memorialTry, vaultSetup: pricing.vaultSetupTry || pricing.vaultSetup, vaultMonthly: pricing.vaultMonthlyTry || pricing.vaultMonthly, campaignMemorial: pricing.campaignMemorialTry, campaignVaultMonthly: pricing.campaignVaultMonthlyTry }
  if ((lang === 'en' || lang === 'he') && pricing.memorialUsd)
    return { symbol: '$', memorial: pricing.memorialUsd, vaultSetup: pricing.vaultSetupUsd || pricing.vaultSetup, vaultMonthly: pricing.vaultMonthlyUsd || pricing.vaultMonthly, campaignMemorial: pricing.campaignMemorialUsd, campaignVaultMonthly: pricing.campaignVaultMonthlyUsd }
  if (lang === 'ru' && pricing.memorialRub)
    return { symbol: '₽', memorial: pricing.memorialRub, vaultSetup: pricing.vaultSetupRub || pricing.vaultSetup, vaultMonthly: pricing.vaultMonthlyRub || pricing.vaultMonthly, campaignMemorial: pricing.campaignMemorialRub, campaignVaultMonthly: pricing.campaignVaultMonthlyRub }
  return { symbol: '₾', memorial: pricing.memorialPrice, vaultSetup: pricing.vaultSetup, vaultMonthly: pricing.vaultMonthly, campaignMemorial: pricing.campaignMemorial, campaignVaultMonthly: pricing.campaignVaultMonthly }
}

const stepIcons = [QrCode, BookOpen, Users, ShieldCheck] as const
const securityIcons = [LockKeyhole, Database, Server, Key, QrCode, ShieldCheck] as const
const whyIcons = [BookOpen, QrCode, Users, Heart, ShieldCheck, Clock] as const

/* ─── Shared style tokens ─────────────────────────────────── */
const S = {
  gold: '#C9A96E',
  goldBright: '#D8BE8A',
  goldGrad: 'linear-gradient(135deg, #E2C885, #C39E63)',
  text: '#EDE8DD',
  textHead: '#F4F0E6',
  textMuted: 'rgba(237,232,221,.56)',
  textFaint: 'rgba(237,232,221,.38)',
  card: 'rgba(255,255,255,.025)',
  cardBorder: 'rgba(201,169,110,.13)',
  cardBorderHover: 'rgba(201,169,110,.34)',
  serif: 'var(--font-cormorant), Georgia, serif',
  sans: 'var(--font-outfit), system-ui, sans-serif',
}

/* ─── Sub-components ─────────────────────────────────────── */
function GoldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11.5, letterSpacing: '.36em', textTransform: 'uppercase', color: S.gold, fontWeight: 300, marginBottom: 18, fontFamily: S.sans }}>
      {children}
    </div>
  )
}

function SectionHeading({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{ fontFamily: S.serif, fontWeight: 400, fontSize: 'clamp(32px,4.6vw,56px)', lineHeight: 1.06, margin: 0, color: S.textHead, ...style }}>
      {children}
    </h2>
  )
}

function SectionDivider({ delay = 0 }: { delay?: number }) {
  return (
    <div style={{ position: 'relative', height: 1, overflow: 'visible', pointerEvents: 'none', zIndex: 10 }}>
      {/* Base line */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(201,169,110,.18) 20%, rgba(201,169,110,.32) 50%, rgba(201,169,110,.18) 80%, transparent 100%)',
      }} />
      {/* Travelling orb */}
      <div
        className="tem-divider-orb"
        style={{
          position: 'absolute',
          top: -3, left: 0,
          width: 140, height: 7,
          borderRadius: 9999,
          background: 'linear-gradient(90deg, transparent, #dfbd72, #fffbee, #dfbd72, transparent)',
          boxShadow: '0 0 12px 3px rgba(223,189,114,.45), 0 0 28px 6px rgba(223,189,114,.18)',
          animationDelay: `${delay}s`,
        }}
      />
    </div>
  )
}

function DriftBlobs() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div className="tem-animate-driftA" style={{ position: 'absolute', top: '-8%', left: '10%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,.12), rgba(201,169,110,0) 66%)', filter: 'blur(50px)' }} />
      <div className="tem-animate-driftB" style={{ position: 'absolute', bottom: '4%', right: '6%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,82,140,.1), rgba(96,82,140,0) 68%)', filter: 'blur(60px)' }} />
    </div>
  )
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(201,169,110,.68)', marginBottom: 16, fontFamily: S.sans }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {links.map((link) => (
          <Link key={`${link.href}-${link.label}`} href={link.href}
            style={{ color: 'rgba(237,232,221,.52)', textDecoration: 'none', fontSize: 13.5, fontWeight: 300, fontFamily: S.sans, transition: 'color .3s' }}
            onMouseEnter={e => (e.currentTarget.style.color = S.goldBright)}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(237,232,221,.52)')}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────── */
export default function LocalizedLanding({ pricing, notableMemorials, recentMemorials }: {
  pricing: PricingConfig; notableMemorials: NotableMemorial[]; recentMemorials: RecentMemorial[]
}) {
  useReveal()
  const { t, lang } = useLang()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [profileTab, setProfileTab] = useState<'photos' | 'videos' | 'bio' | 'timeline' | 'taziye'>('photos')
  const cur = buildCurrencyView(pricing, lang)

  const quickSteps = t.landing.quickSteps
  const securityItems = t.landing.securityItems
  const whyItems = t.landing.whyItems
  const faqs = t.landing.faqs
  const s = t.landing
  const p = s.pricingSection
  const h = s.howItWorksDetailed

  return (
    <div style={{ position: 'relative' }}>
      <DriftBlobs />
      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* ═══ HERO ═══════════════════════════════════════════════ */}
        <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(64px,11vh,140px) clamp(20px,4vw,60px) clamp(70px,9vh,120px)' }}>
          <ParticleCanvas count={56} />
          <div style={{ position: 'relative', zIndex: 3, maxWidth: 1240, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'clamp(40px,5vw,80px)' }}>

            {/* Left copy */}
            <div style={{ flex: '1 1 480px', minWidth: 320 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 34 }}>
                <span style={{ width: 46, height: 1, background: `linear-gradient(90deg, ${S.gold}, transparent)` }} />
                <span style={{ fontSize: 11.5, letterSpacing: '.36em', textTransform: 'uppercase', color: S.gold, fontWeight: 300, fontFamily: S.sans }}>
                  Dijital Anma
                </span>
              </div>

              <h1 style={{ fontFamily: S.serif, fontWeight: 400, fontSize: 'clamp(40px,5.6vw,80px)', lineHeight: 1.04, letterSpacing: '-0.012em', margin: '0 0 30px', color: S.textHead }}>
                <span className="tem-word" style={{ animationDelay: '0ms' }}>{s.hero.h1a}</span>
                {' '}
                <span className="tem-word" style={{ animationDelay: '180ms', display: 'block', fontStyle: 'italic', color: S.goldBright, position: 'relative' }}>
                  {s.hero.h1b}
                  <span style={{ position: 'absolute', left: 1, right: 1, bottom: 0, height: 1, background: `linear-gradient(90deg, rgba(216,190,138,0), rgba(216,190,138,.65), rgba(216,190,138,0))` }} />
                </span>
              </h1>

              <p style={{ fontSize: 'clamp(16px,1.25vw,18px)', fontWeight: 300, lineHeight: 1.75, color: S.textMuted, maxWidth: 540, margin: '0 0 32px', fontFamily: S.sans }}>
                {s.hero.p}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 26 }}>
                <Link href="/#fiyatlar" className="tem-goldbtn" style={{ textDecoration: 'none', background: S.goldGrad, color: '#14110a', fontWeight: 500, fontSize: 15.5, padding: '16px 32px', borderRadius: 999, boxShadow: '0 14px 36px rgba(201,169,110,.26)', fontFamily: S.sans }}>
                  {s.hero.ctaPrimary}
                </Link>
                <Link href="/memorial/demo" className="tem-ghostbtn" style={{ textDecoration: 'none', background: 'none', color: S.text, border: '1px solid rgba(237,232,221,.2)', fontWeight: 300, fontSize: 15.5, padding: '16px 32px', borderRadius: 999, fontFamily: S.sans }}>
                  {s.hero.ctaSecondary}
                </Link>
              </div>

              <p style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(237,232,221,.4)', fontSize: 13.5, fontWeight: 300, fontFamily: S.sans }}>
                <ShieldCheck style={{ width: 15, height: 15, stroke: '#8FB89E', strokeWidth: 1.5, flexShrink: 0 }} />
                {s.hero.trustBadge}
              </p>
            </div>

            {/* Right — 3D Phone */}
            <div style={{ flex: '1 1 340px', minWidth: 300, display: 'flex', justifyContent: 'center' }}>
              <PhoneMockup3D />
            </div>
          </div>
        </section>

        <SectionDivider delay={0} />

        {/* ═══ QR BRIDGE BAND ══════════════════════════════════════ */}
        <section style={{ padding: '0 clamp(20px,4vw,60px) clamp(20px,4vh,40px)' }}>
          <div className="tem-reveal" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 'clamp(18px,3vw,40px)', padding: '26px 32px', borderRadius: 18, background: S.card, border: `1px solid ${S.cardBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 60, borderRadius: '6px 6px 4px 4px', background: 'radial-gradient(120% 100% at 50% 30%, #20202a, #111118)', border: '1px solid rgba(201,169,110,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode style={{ width: 22, height: 22, stroke: S.gold, strokeWidth: 1.3 }} />
              </div>
              <span style={{ fontFamily: S.serif, fontSize: 17, color: 'rgba(237,232,221,.75)' }}>Mezar taşındaki QR kod</span>
            </div>

            <svg width="48" height="14" viewBox="0 0 48 14" fill="none" stroke={S.gold} strokeWidth="1.3" strokeLinecap="round">
              <path d="M2 7h40" strokeDasharray="4 4" className="tem-animate-dash" />
              <path d="M38 2l6 5-6 5" className="tem-animate-arrow-head" />
            </svg>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 60, borderRadius: 10, background: 'linear-gradient(160deg, #1a261f, #101018)', border: '1px solid rgba(201,169,110,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: S.goldGrad }} />
              </div>
              <span style={{ fontFamily: S.serif, fontSize: 17, color: 'rgba(237,232,221,.75)' }}>anıların açıldığı sayfaya götürür</span>
            </div>
          </div>
        </section>

        <SectionDivider delay={0.4} />

        {/* ═══ NASIL ÇALIŞIR — QUICK 4 STEPS ══════════════════════ */}
        <section id="nasil-calisir" style={{ padding: 'clamp(60px,10vh,120px) clamp(20px,4vw,60px)' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto' }}>
            <div className="tem-reveal" style={{ textAlign: 'center', marginBottom: 70 }}>
              <GoldLabel>Nasıl çalışır</GoldLabel>
              <SectionHeading>Kalıcı bir anma profili, dört adımda</SectionHeading>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(232px,1fr))', gap: 26 }}>
              {quickSteps.map((item, i) => {
                const Icon = stepIcons[i]
                return (
                  <div key={i} className={`tem-step tem-reveal tem-card`} style={{ transitionDelay: `${i * 120}ms`, padding: '36px 30px', borderRadius: 18, background: S.card, border: `1px solid ${S.cardBorder}` }}>
                    <div style={{ height: 56, marginBottom: 24, display: 'flex', alignItems: 'center' }}>
                      <Icon style={{ width: 42, height: 42, stroke: S.gold, strokeWidth: 1.3 }} />
                    </div>
                    <div style={{ fontFamily: S.serif, fontSize: 14, letterSpacing: '.22em', color: 'rgba(201,169,110,.68)', marginBottom: 12 }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 style={{ fontFamily: S.serif, fontSize: 23, fontWeight: 500, margin: '0 0 12px', color: S.text }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 1.68, color: S.textMuted, margin: 0, fontFamily: S.sans }}>
                      {item.text}
                    </p>
                    {'cta' in item && item.cta && (
                      <a href="https://theeternalmemory.com/satin-al/anma" style={{ display: 'block', marginTop: 20, textAlign: 'center', padding: '12px', borderRadius: 12, background: S.goldGrad, color: '#14110a', fontSize: 14, fontWeight: 500, textDecoration: 'none', fontFamily: S.sans }}>
                        {item.cta}
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <SectionDivider delay={0.8} />

        {/* ═══ PROFİL PREVİEW ══════════════════════════════════════ */}
        <section id="profil" style={{ padding: 'clamp(60px,10vh,120px) clamp(20px,4vw,60px)' }}>
          <div style={{ maxWidth: 1140, margin: '0 auto' }}>
            <div className="tem-reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
              <GoldLabel>Anma profili</GoldLabel>
              <SectionHeading>{s.profilePreview.heading}</SectionHeading>
            </div>

            <div className="tem-reveal" style={{ borderRadius: 24, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(201,169,110,.16)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', overflow: 'hidden', display: 'flex', flexWrap: 'wrap' }}>
              {/* Left panel */}
              <div style={{ flex: '1 1 280px', minWidth: 260, padding: '46px 38px', background: 'linear-gradient(180deg, rgba(16,28,22,.5), rgba(10,12,18,.2))', borderRight: '1px solid rgba(201,169,110,.1)' }}>
                <div style={{ width: 112, height: 112, borderRadius: '50%', marginBottom: 24, padding: 3, background: S.goldGrad, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
                    <Image src="/images/landing/profile-ahmet.png" alt="Ahmet Yılmaz" fill sizes="112px" className="object-cover object-top" />
                  </div>
                </div>
                <h3 style={{ fontFamily: S.serif, fontSize: 31, fontWeight: 500, margin: 0, color: S.textHead }}>{s.profilePreview.profileName}</h3>
                <div style={{ fontSize: 12.5, letterSpacing: '.12em', color: S.gold, margin: '6px 0 18px', fontFamily: S.sans }}>{s.profilePreview.profileYears}</div>
                <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 1.72, color: S.textMuted, margin: '0 0 26px', fontFamily: S.sans }}>{s.profilePreview.profileBio}</p>
                <div style={{ display: 'flex', gap: 24, paddingTop: 22, borderTop: '1px solid rgba(201,169,110,.1)' }}>
                  {[['6', 'Fotoğraf'], ['3', 'Video'], ['3', 'Taziye']].map(([n, l]) => (
                    <div key={l}>
                      <div style={{ fontFamily: S.serif, fontSize: 27, color: S.goldBright }}>{n}</div>
                      <div style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: S.textFaint, fontFamily: S.sans }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right panel — tabs */}
              <div style={{ flex: '2 1 420px', minWidth: 320, padding: 38 }}>
                {/* Tab bar — yatay kaydırmalı */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(201,169,110,.14)', marginBottom: 30, overflowX: 'auto', scrollbarWidth: 'none' }}>
                  {([
                    ['photos',   'Fotoğraflar'],
                    ['videos',   'Videolar'],
                    ['bio',      'Biyografi'],
                    ['timeline', 'Kronoloji'],
                    ['taziye',   'Taziyeler'],
                  ] as const).map(([tab, label]) => {
                    const active = profileTab === tab
                    return (
                      <button key={tab} onClick={() => setProfileTab(tab)} style={{ flexShrink: 0, padding: '10px 2px', marginRight: 24, cursor: 'pointer', background: 'none', border: 'none', fontFamily: S.sans, fontSize: 12.5, letterSpacing: '.1em', textTransform: 'uppercase', color: active ? S.goldBright : S.textFaint, borderBottom: active ? `2px solid ${S.gold}` : '2px solid transparent', marginBottom: -1, transition: 'color .3s, border-color .3s', whiteSpace: 'nowrap' }}>
                        {label}
                      </button>
                    )
                  })}
                </div>

                {profileTab === 'photos' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                    {[
                      ['/images/landing/profile-family-old.png', '1952'],
                      ['/images/landing/profile-family-dinner.png', '1968'],
                      ['/images/landing/profile-family-main.png', '1981'],
                      ['/images/landing/profile-georgia.png', '1995'],
                      ['/images/landing/profile-family-old.png', '2008'],
                      ['/images/landing/profile-family-dinner.png', '2017'],
                    ].map(([src, year], i) => (
                      <div key={i} style={{ aspectRatio: '1', borderRadius: 12, overflow: 'hidden', position: 'relative', border: '1px solid rgba(201,169,110,.08)' }}>
                        <Image src={src} alt={year} fill sizes="160px" className="object-cover" />
                        <div style={{ position: 'absolute', left: 9, bottom: 9, fontSize: 9, color: 'rgba(201,169,110,.7)', fontFamily: 'monospace' }}>{year}</div>
                      </div>
                    ))}
                  </div>
                )}

                {profileTab === 'videos' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[['Kızının düğünü', '2:41 · 1995 Yazı'], ['Eski hikâyeleri anlatırken', '5:18 · Bir kış akşamı'], ['Sesi — kayıtlı bir mesaj', '1:07 · Ses kaydı']].map(([title, meta]) => (
                      <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, borderRadius: 14, background: S.card, border: `1px solid ${S.cardBorder}` }}>
                        <div style={{ width: 94, height: 60, borderRadius: 10, flexShrink: 0, background: 'radial-gradient(120% 110% at 50% 40%, #1d1d26, #101017)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(226,200,133,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14110a', fontSize: 10 }}>▶</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: S.serif, fontSize: 18, color: S.text }}>{title}</div>
                          <div style={{ fontSize: 11.5, color: S.textFaint, fontFamily: S.sans }}>{meta}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {profileTab === 'bio' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <p style={{ fontFamily: S.serif, fontStyle: 'italic', fontSize: 18, lineHeight: 1.78, color: 'rgba(237,232,221,.72)', margin: 0 }}>
                      "1948 yılında Trabzon'da dünyaya gelen Ahmet Yılmaz, çocukluğunu Karadeniz kıyılarında geçirdi. Öğretmen olarak binlerce öğrenciye ilham kaynağı oldu."
                    </p>
                    <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 1.75, color: S.textMuted, margin: 0, fontFamily: S.sans }}>
                      Emeklilik yıllarında ailesiyle Gürcistan'a taşınan Ahmet Bey, torunlarına anlattığı Karadeniz hikayeleri ve derin bilgeliğiyle herkese ilham verdi. Geride iki çocuk, beş torun ve sayısız güzel anı bıraktı.
                    </p>
                    <div style={{ display: 'flex', gap: 20, paddingTop: 14, borderTop: '1px solid rgba(201,169,110,.1)' }}>
                      {[['Öğretmen', 'Meslek'], ['Trabzon', 'Doğum yeri'], ['Gürcistan', 'Son ikametgah']].map(([val, lbl]) => (
                        <div key={lbl}>
                          <div style={{ fontSize: 13.5, fontWeight: 500, color: S.goldBright, fontFamily: S.sans }}>{val}</div>
                          <div style={{ fontSize: 10.5, color: S.textFaint, fontFamily: S.sans, letterSpacing: '.08em' }}>{lbl}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profileTab === 'timeline' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {[
                      ['1948', 'Trabzon\'da doğdu'],
                      ['1966', 'Öğretmenlik eğitimi için İstanbul\'a taşındı'],
                      ['1972', 'Ayşe Hanım ile evlendi'],
                      ['1975', 'İlk çocuğu Elif dünyaya geldi'],
                      ['1995', 'Tüm aile Gürcistan\'a yerleşti'],
                      ['2023', 'Hayata gözlerini yumdu — anıları yaşıyor'],
                    ].map(([year, event], i, arr) => (
                      <div key={year} style={{ display: 'flex', gap: 18, position: 'relative' }}>
                        {/* Sol çizgi + nokta */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === arr.length - 1 ? S.goldGrad : 'rgba(201,169,110,.35)', border: `1px solid ${S.gold}`, marginTop: 3, flexShrink: 0 }} />
                          {i < arr.length - 1 && <div style={{ width: 1, flex: 1, background: 'rgba(201,169,110,.15)', minHeight: 28 }} />}
                        </div>
                        <div style={{ paddingBottom: i < arr.length - 1 ? 18 : 0 }}>
                          <div style={{ fontSize: 11, letterSpacing: '.12em', color: S.gold, fontFamily: S.sans, marginBottom: 2 }}>{year}</div>
                          <div style={{ fontSize: 14, fontWeight: 300, color: i === arr.length - 1 ? S.text : S.textMuted, fontFamily: S.sans, lineHeight: 1.5 }}>{event}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {profileTab === 'taziye' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      ['F', 'Fatma Hanım', 'Komşusu', '"Yıllar boyunca kapı komşumduydu, her daim güler yüzlüydü."', '3 gün önce'],
                      ['A', 'Ahmet Bey', 'Eski meslektaşı', '"Öğretmenliğini bilen herkes bilir, elleri çok bereket doluydu."', '1 hafta önce'],
                      ['Z', 'Zeynep', 'Torunu', '"Dedem her gece masallar anlatırdı. Bu sayfayı bulduğumda gözyaşlarımı tutamadım."', '2 hafta önce'],
                    ].map(([initial, name, role, quote, date]) => (
                      <div key={name} style={{ padding: '16px 18px', borderRadius: 14, background: S.card, border: `1px solid ${S.cardBorder}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: S.goldGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14110a', fontWeight: 500, fontSize: 12, flexShrink: 0 }}>{initial}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13.5, color: S.text, fontFamily: S.sans }}>{name}</div>
                            <div style={{ fontSize: 11, color: 'rgba(201,169,110,.6)', fontFamily: S.sans }}>{role}</div>
                          </div>
                          <div style={{ fontSize: 10.5, color: S.textFaint, fontFamily: S.sans }}>{date}</div>
                        </div>
                        <p style={{ fontFamily: S.serif, fontStyle: 'italic', fontSize: 15.5, lineHeight: 1.55, color: 'rgba(237,232,221,.65)', margin: 0 }}>{quote}</p>
                      </div>
                    ))}
                  </div>
                )}

                <Link href="/memorial/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24, color: S.gold, fontSize: 14, fontWeight: 300, textDecoration: 'none', fontFamily: S.sans }}>
                  {s.profilePreview.viewAll} <ArrowRight style={{ width: 14, height: 14 }} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider delay={1.2} />

        {/* ═══ ULUSAL MİRAS ════════════════════════════════════════ */}
        <NotableProfilesSection memorials={notableMemorials} />

        <SectionDivider delay={1.6} />

        {/* ═══ SON ANMALAR ════════════════════════════════════════ */}
        <RecentMemorialsCarousel memorials={recentMemorials} labels={t.recentMemorials} />

        <SectionDivider delay={2.0} />

        {/* ═══ NEDEN AILELER SEÇİYOR — 6 KART ════════════════════ */}
        <section id="ozellikler" style={{ padding: 'clamp(64px,11vh,140px) clamp(20px,4vw,60px)' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto' }}>
            <div className="tem-reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
              <GoldLabel>Neden The Eternal Memory</GoldLabel>
              <SectionHeading style={{ maxWidth: 760, margin: '0 auto' }}>
                {s.whySection.heading}
              </SectionHeading>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 24, marginBottom: 40 }}>
              {whyItems.map((item, i) => {
                const Icon = whyIcons[i]
                return (
                  <div key={i} className="tem-reveal tem-card" style={{ transitionDelay: `${(i % 3) * 90}ms`, padding: '38px 34px', borderRadius: 20, background: 'rgba(255,255,255,.03)', border: `1px solid ${S.cardBorder}` }}>
                    <div style={{ width: 50, height: 50, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,169,110,.09)', border: '1px solid rgba(201,169,110,.2)', marginBottom: 24 }}>
                      <Icon style={{ width: 22, height: 22, stroke: S.goldBright, strokeWidth: 1.4 }} />
                    </div>
                    <h3 style={{ fontFamily: S.serif, fontSize: 23, fontWeight: 500, margin: '0 0 12px', color: S.text }}>{item.title}</h3>
                    <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 1.72, color: 'rgba(237,232,221,.53)', margin: 0, fontFamily: S.sans }}>{item.text}</p>
                  </div>
                )
              })}
            </div>

            {/* Security badges */}
            <div className="tem-reveal" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
              {[
                [LockKeyhole, 'Şifreli bağlantı'],
                [ShieldCheck, 'Yetkili erişim'],
                [Database, 'Korumalı medya saklama'],
                [QrCode, 'Kalıcı QR yönlendirme'],
              ].map(([Icon, label], i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 300, color: S.textMuted, border: '1px solid rgba(201,169,110,.14)', borderRadius: 999, padding: '9px 16px', fontFamily: S.sans }}>
                  {/* @ts-ignore */}
                  <Icon style={{ width: 13, height: 13, stroke: S.gold, strokeWidth: 1.5 }} />
                  {label as string}
                </span>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider delay={2.4} />

        {/* ═══ NASIL ÇALIŞIR — DETAYLI 4 ADIM ════════════════════ */}
        <section style={{ padding: 'clamp(60px,10vh,120px) clamp(20px,4vw,60px)', borderTop: `1px solid ${S.cardBorder}`, borderBottom: `1px solid ${S.cardBorder}` }}>
          <div style={{ maxWidth: 1240, margin: '0 auto' }}>
            <div className="tem-reveal" style={{ textAlign: 'center', marginBottom: 70 }}>
              <SectionHeading>{h.heading}</SectionHeading>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, justifyContent: 'center' }}>
              {h.steps4.map((step, i) => (
                <div key={i} className="tem-reveal" style={{ transitionDelay: `${i * 120}ms`, flex: '1 1 220px', minWidth: 200, maxWidth: 320, padding: '0 24px', position: 'relative' }}>
                  {i < 3 && (
                    <div style={{ position: 'absolute', right: 0, top: 55, zIndex: 10, display: 'none' }} className="lg-arrow">
                      <svg width="40" height="18" viewBox="0 0 40 18" fill="none">
                        <line x1="0" y1="9" x2="30" y2="9" stroke={S.gold} strokeWidth="1.5" strokeDasharray="3 2.5" />
                        <polyline points="26,5 32,9 26,13" fill="none" stroke={S.gold} strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  )}
                  <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 20 }}>
                    <Image src={`/images/landing/how-step-${i + 1}.png`} alt={step.title} fill sizes="120px" className="object-contain" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: S.goldGrad, color: '#14110a', fontSize: 13, fontWeight: 700, marginBottom: 12, fontFamily: S.sans }}>
                    {i + 1}
                  </div>
                  <h3 style={{ fontFamily: S.serif, fontSize: 20, fontWeight: 500, margin: '0 0 8px', color: S.text }}>{step.title}</h3>
                  <p style={{ fontSize: 13.5, fontWeight: 300, lineHeight: 1.65, color: S.textMuted, margin: 0, fontFamily: S.sans }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider delay={2.8} />

        {/* ═══ QR MEZAR BANNER ════════════════════════════════════ */}
        <section style={{ padding: 'clamp(20px,4vh,50px) clamp(20px,4vw,60px)' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto' }}>
            <div className="tem-reveal" style={{ position: 'relative', height: 320, borderRadius: 24, overflow: 'hidden' }}>
              <Image src="/images/landing/qr-gravestone-banner.jpg" alt={t.gravestoneQrBanner.heading} fill sizes="(max-width:1280px) 100vw, 1280px" className="object-cover object-center" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(7,7,13,.92) 0%, rgba(7,7,13,.72) 42%, rgba(7,7,13,0) 78%)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 clamp(32px,5vw,72px)' }}>
                <div style={{ maxWidth: 440 }}>
                  <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(24px,3.6vw,42px)', fontWeight: 400, lineHeight: 1.1, margin: '0 0 14px', color: S.textHead }}>
                    {t.gravestoneQrBanner.heading}
                  </h2>
                  <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: S.textMuted, margin: '0 0 28px', fontFamily: S.sans }}>
                    {t.gravestoneQrBanner.body}
                  </p>
                  <Link href="/#fiyatlar" className="tem-goldbtn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', background: S.goldGrad, color: '#14110a', fontWeight: 500, fontSize: 14, padding: '12px 24px', borderRadius: 999, fontFamily: S.sans }}>
                    Hemen başla <ArrowRight style={{ width: 14, height: 14 }} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider delay={3.2} />

        {/* ═══ ARA CTA BANNER ══════════════════════════════════════ */}
        <section style={{ padding: 'clamp(20px,4vh,50px) clamp(20px,4vw,60px)' }}>
          <div className="tem-reveal" style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', borderRadius: 24, overflow: 'hidden', background: 'linear-gradient(120deg, #0e1c15 0%, #0a140e 100%)', border: '1px solid rgba(201,169,110,.18)', padding: 'clamp(40px,6vw,72px) clamp(24px,5vw,72px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 30 }}>
            <div style={{ position: 'absolute', left: -30, top: '50%', transform: 'translateY(-50%)', width: 240, height: 260, opacity: .4, backgroundImage: 'repeating-linear-gradient(120deg, rgba(201,169,110,.16) 0 9px, rgba(201,169,110,.02) 9px 18px)', WebkitMaskImage: 'radial-gradient(circle at 0 50%, #000, transparent 72%)', maskImage: 'radial-gradient(circle at 0 50%, #000, transparent 72%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', maxWidth: 600 }}>
              {/* Flame */}
              <div style={{ width: 16, height: 26, marginBottom: 18, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: -14, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,201,122,.45), rgba(232,201,122,0) 65%)', filter: 'blur(6px)' }} />
                <div className="tem-animate-flame" style={{ position: 'relative', width: 12, height: 20, borderRadius: '50% 50% 50% 50% / 64% 64% 38% 38%', background: 'linear-gradient(180deg, #FFF4D6, #E8C97A 45%, #C9A96E)', boxShadow: '0 0 14px rgba(232,201,122,.7)' }} />
              </div>
              <h2 style={{ fontFamily: S.serif, fontWeight: 400, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.1, margin: '0 0 14px', color: S.textHead }}>{s.ctaBanner.heading}</h2>
              <p style={{ fontSize: 15.5, fontWeight: 300, lineHeight: 1.7, color: S.textMuted, margin: 0, fontFamily: S.sans }}>{s.hero.p}</p>
            </div>
            <Link href="/#fiyatlar" className="tem-goldbtn" style={{ position: 'relative', textDecoration: 'none', flexShrink: 0, background: S.goldGrad, color: '#14110a', fontWeight: 500, fontSize: 15.5, padding: '16px 32px', borderRadius: 999, boxShadow: '0 14px 36px rgba(201,169,110,.28)', fontFamily: S.sans }}>
              {s.ctaBanner.button}
            </Link>
          </div>
        </section>

        <SectionDivider delay={3.6} />

        {/* ═══ GÜVENLİK ════════════════════════════════════════════ */}
        <section style={{ padding: 'clamp(60px,10vh,130px) clamp(20px,4vw,60px)' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gap: 60, gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))' }}>
            <div className="tem-reveal">
              <SectionHeading style={{ fontSize: 'clamp(28px,3.8vw,46px)' }}>{s.security.heading}</SectionHeading>
              <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.72, color: S.textMuted, maxWidth: 400, margin: '20px 0 24px', fontFamily: S.sans }}>{s.security.body}</p>
              <div style={{ borderRadius: 14, border: '1px solid rgba(143,184,158,.25)', background: 'rgba(143,184,158,.07)', padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <ShieldCheck style={{ width: 18, height: 18, stroke: '#8FB89E', strokeWidth: 1.5, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: S.text, fontFamily: S.sans }}>{s.footer.commitment}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 300, color: 'rgba(237,232,221,.5)', lineHeight: 1.5, fontFamily: S.sans }}>{s.security.commitment}</div>
                </div>
              </div>
              <Link href="/privacy" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: S.goldBright, fontSize: 14, fontWeight: 300, textDecoration: 'none', fontFamily: S.sans }}>
                {s.security.readPrivacy} <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 16 }}>
              {securityItems.map((item, i) => {
                const Icon = securityIcons[i]
                return (
                  <div key={i} className="tem-reveal tem-card" style={{ transitionDelay: `${(i % 2) * 80}ms`, padding: '24px 22px', borderRadius: 16, background: S.card, border: `1px solid ${S.cardBorder}` }}>
                    <div style={{ display: 'flex', gap: 14 }}>
                      <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,169,110,.09)', border: '1px solid rgba(201,169,110,.2)' }}>
                        <Icon style={{ width: 20, height: 20, stroke: S.goldBright, strokeWidth: 1.4 }} />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: S.serif, fontSize: 16, fontWeight: 500, margin: '0 0 6px', color: S.text }}>{item.title}</h3>
                        <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.65, color: S.textMuted, margin: 0, fontFamily: S.sans }}>{item.text}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <SectionDivider delay={4.0} />

        {/* ═══ FİYATLAR ════════════════════════════════════════════ */}
        <section id="fiyatlar" style={{ padding: 'clamp(60px,10vh,130px) clamp(20px,4vw,60px)' }}>
          <div style={{ maxWidth: 940, margin: '0 auto' }}>
            <div className="tem-reveal" style={{ textAlign: 'center', marginBottom: 58 }}>
              <GoldLabel>Tek anma planı</GoldLabel>
              <SectionHeading style={{ margin: '0 0 18px' }}>{p.heading}</SectionHeading>
              <p style={{ fontSize: 16.5, fontWeight: 300, color: S.textMuted, maxWidth: 560, margin: '0 auto', fontFamily: S.sans }}>{p.sub}</p>
            </div>

            {/* Gradient border card */}
            <div className="tem-reveal" style={{ position: 'relative', borderRadius: 26, padding: 1.5, background: 'linear-gradient(135deg, rgba(226,200,133,.85), rgba(201,169,110,.2), rgba(226,200,133,.6))', boxShadow: '0 44px 100px -44px rgba(201,169,110,.4)' }}>
              <div className="tem-animate-haloPulse" style={{ position: 'absolute', inset: -3, borderRadius: 28, background: 'linear-gradient(135deg, rgba(226,200,133,.4), transparent 62%)', filter: 'blur(24px)', zIndex: -1 }} />
              <div style={{ borderRadius: 24, background: 'linear-gradient(165deg, #0d1611 0%, #0a0c11 100%)', padding: 'clamp(34px,4vw,54px)', display: 'flex', flexWrap: 'wrap', gap: 46 }}>

                {/* Left — price */}
                <div style={{ flex: '1 1 260px', minWidth: 240 }}>
                  <div style={{ display: 'inline-block', fontSize: 10.5, letterSpacing: '.2em', textTransform: 'uppercase', color: '#14110a', background: S.goldGrad, padding: '7px 14px', borderRadius: 999, marginBottom: 26, fontFamily: S.sans }}>
                    {p.memorialBadge}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
                    {pricing.campaignActive && cur.campaignMemorial ? (
                      <>
                        <span style={{ fontFamily: S.serif, fontSize: 36, color: 'rgba(244,240,230,.38)', textDecoration: 'line-through' }}>{cur.memorial}</span>
                        <span style={{ fontFamily: S.serif, fontSize: 60, fontWeight: 500, color: S.textHead, lineHeight: 1 }}>{cur.campaignMemorial}</span>
                      </>
                    ) : (
                      <span style={{ fontFamily: S.serif, fontSize: 60, fontWeight: 500, color: S.textHead, lineHeight: 1 }}>{cur.memorial}</span>
                    )}
                    <div style={{ marginBottom: 2 }}>
                      <span style={{ fontSize: 21, fontWeight: 600, color: 'rgba(163,201,177,.9)', fontFamily: S.sans }}>{cur.symbol}</span>
                      <p style={{ fontSize: 13, color: 'rgba(163,201,177,.7)', margin: 0, fontFamily: S.sans }}>{p.memorialPriceLabel}</p>
                    </div>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 300, color: 'rgba(201,169,110,.72)', marginBottom: 30, fontFamily: S.sans }}>tek seferlik · QR plaka dahil</div>

                  {/* Guarantee */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 14, background: 'rgba(143,184,158,.07)', border: '1px solid rgba(143,184,158,.2)', marginBottom: 26 }}>
                    <ShieldCheck style={{ width: 20, height: 20, stroke: '#8FB89E', strokeWidth: 1.5, flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: S.text, fontFamily: S.sans }}>{p.memorialGuaranteeBadge}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 300, color: 'rgba(237,232,221,.5)', lineHeight: 1.5, fontFamily: S.sans }}>{p.memorialGuarantee}</div>
                    </div>
                  </div>

                  <Link href="/satin-al/anma" className="tem-goldbtn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', background: S.goldGrad, color: '#14110a', fontWeight: 500, fontSize: 15.5, padding: 17, borderRadius: 14, boxShadow: '0 14px 36px rgba(201,169,110,.28)', marginBottom: 12, fontFamily: S.sans }}>
                    {p.memorialCta}
                  </Link>
                  <Link href="/memorial/demo" className="tem-ghostbtn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', background: 'none', color: 'rgba(237,232,221,.78)', border: '1px solid rgba(237,232,221,.16)', fontWeight: 300, fontSize: 14.5, padding: 14, borderRadius: 14, fontFamily: S.sans }}>
                    {p.demoProfileCta}
                  </Link>
                </div>

                {/* Right — features */}
                <div style={{ flex: '1 1 280px', minWidth: 260, borderLeft: '1px solid rgba(201,169,110,.12)', paddingLeft: 46 }}>
                  <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(201,169,110,.72)', marginBottom: 24, fontFamily: S.sans }}>
                    {p.memorialFeaturesHeading}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
                    {p.memorialFeatures.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 15, fontSize: 13.5, fontWeight: 300, color: 'rgba(237,232,221,.7)', lineHeight: 1.4, fontFamily: S.sans }}>
                        <span style={{ color: S.goldBright, flexShrink: 0 }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                  <p style={{ marginTop: 16, fontSize: 12, fontWeight: 300, color: 'rgba(237,232,221,.4)', fontFamily: S.sans }}>{p.memorialCustomDesignNote}</p>
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(201,169,110,.1)', fontSize: 12.5, fontWeight: 300, color: 'rgba(237,232,221,.44)', lineHeight: 1.6, fontFamily: S.sans }}>
                    🔒 {p.memorialTrustNote}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider delay={4.4} />

        {/* ═══ SSS ════════════════════════════════════════════════ */}
        <section id="sss" style={{ padding: 'clamp(60px,10vh,120px) clamp(20px,4vw,60px)' }}>
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            <div className="tem-reveal" style={{ textAlign: 'center', marginBottom: 52 }}>
              <GoldLabel>Sık sorulan sorular</GoldLabel>
              <SectionHeading>{s.faqSection.heading}</SectionHeading>
            </div>
            <div className="tem-reveal" style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${S.cardBorder}`, background: S.card }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid rgba(201,169,110,.09)' : 'none' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '24px 28px', fontFamily: S.serif, fontSize: 21, color: S.text }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown style={{ width: 18, height: 18, color: S.gold, flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform .3s' }} />
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 28px 26px' }}>
                      <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 1.72, color: S.textMuted, maxWidth: 680, margin: 0, fontFamily: S.sans }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="tem-reveal" style={{ marginTop: 24, textAlign: 'center', fontSize: 14.5, fontWeight: 300, color: S.textMuted, fontFamily: S.sans }}>
              {s.faqSection.moreQuestions}{' '}
              <Link href="/contact" style={{ color: S.goldBright, textDecoration: 'none' }}>
                {s.faqSection.contactLink} →
              </Link>
            </div>
          </div>
        </section>

        <SectionDivider delay={4.8} />

        {/* ═══ FINAL CTA ══════════════════════════════════════════ */}
        <section style={{ padding: '0 clamp(16px,4vw,60px) clamp(72px,9vh,120px)' }}>
          <div className="tem-reveal" style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', borderRadius: 28, overflow: 'hidden', background: 'linear-gradient(160deg, #0f1c15 0%, #0a120e 52%, #0b0b11 100%)', border: '1px solid rgba(201,169,110,.18)', padding: 'clamp(60px,9vw,120px) clamp(24px,5vw,80px)', textAlign: 'center' }}>
            <Image src="/images/landing/final-cta-leaves.png" alt="Final CTA" fill sizes="100vw" className="absolute inset-0 object-cover opacity-25" />
            <div style={{ position: 'absolute', left: '50%', top: '12%', transform: 'translateX(-50%)', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,201,122,.26), rgba(232,201,122,0) 64%)', filter: 'blur(22px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 2 }}>
              {/* Flame */}
              <div style={{ width: 18, height: 30, margin: '0 auto 22px', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,201,122,.45), rgba(232,201,122,0) 65%)', filter: 'blur(6px)' }} />
                <div className="tem-animate-flame" style={{ position: 'relative', width: 14, height: 24, margin: '0 auto', borderRadius: '50% 50% 50% 50% / 64% 64% 38% 38%', background: 'linear-gradient(180deg, #FFF4D6, #E8C97A 45%, #C9A96E)', boxShadow: '0 0 16px rgba(232,201,122,.7)' }} />
              </div>
              <h2 style={{ fontFamily: S.serif, fontWeight: 400, fontSize: 'clamp(30px,4.8vw,60px)', lineHeight: 1.08, margin: '0 auto 22px', maxWidth: 740, color: S.textHead }}>
                {s.finalCta.heading}
              </h2>
              <p style={{ fontSize: 16.5, fontWeight: 300, lineHeight: 1.72, color: S.textMuted, maxWidth: 620, margin: '0 auto 40px', fontFamily: S.sans }}>
                {s.finalCta.sub}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
                <Link href="/#fiyatlar" className="tem-goldbtn" style={{ textDecoration: 'none', background: S.goldGrad, color: '#14110a', fontWeight: 500, fontSize: 15.5, padding: '16px 34px', borderRadius: 999, boxShadow: '0 14px 36px rgba(201,169,110,.28)', fontFamily: S.sans }}>
                  {s.finalCta.primaryBtn}
                </Link>
                <Link href="/contact" className="tem-ghostbtn" style={{ textDecoration: 'none', background: 'none', color: S.text, border: '1px solid rgba(237,232,221,.2)', fontWeight: 300, fontSize: 15.5, padding: '16px 34px', borderRadius: 999, fontFamily: S.sans }}>
                  {s.finalCta.secondaryBtn}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ══════════════════════════════════════════════ */}
        <footer style={{ borderTop: '1px solid rgba(201,169,110,.1)', padding: 'clamp(50px,6vw,76px) clamp(20px,4vw,60px) 40px' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 48, justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 300px', minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ width: 36, height: 36, flexShrink: 0 }}><BrandMark /></div>
                <span style={{ fontFamily: S.serif, fontSize: 21, color: S.text }}>The Eternal Memory</span>
              </div>
              <p style={{ fontSize: 13.5, fontWeight: 300, lineHeight: 1.7, color: 'rgba(237,232,221,.42)', maxWidth: 320, margin: '0 0 16px', fontFamily: S.sans }}>
                {s.footer.tagline}
              </p>
              <div style={{ fontSize: 12.5, fontWeight: 300, color: 'rgba(201,169,110,.58)', fontFamily: S.sans }}>
                {s.footer.commitment}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'clamp(36px,6vw,80px)', flexWrap: 'wrap' }}>
              <FooterColumn title={s.footer.colPlatform} links={s.footer.platformLinks} />
              <FooterColumn title={s.footer.colCorporate} links={s.footer.corporateLinks} />
              <FooterColumn title={s.footer.colDocs} links={s.footer.docLinks} />
              <div>
                <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(201,169,110,.68)', marginBottom: 16, fontFamily: S.sans }}>
                  {s.footer.colContact}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 13.5, fontWeight: 300, color: 'rgba(237,232,221,.52)', fontFamily: S.sans }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MessageCircle style={{ width: 14, height: 14, flexShrink: 0 }} /> support@theeternalmemory.com</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin style={{ width: 14, height: 14, flexShrink: 0 }} /> Georgia</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone style={{ width: 14, height: 14, flexShrink: 0 }} /> +995 555 51 18 84</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ maxWidth: 1240, margin: '40px auto 0', paddingTop: 28, borderTop: '1px solid rgba(201,169,110,.09)', textAlign: 'center', fontSize: 12.5, fontWeight: 300, color: 'rgba(237,232,221,.33)', fontFamily: S.sans }}>
            {s.footer.copyright}
          </div>
        </footer>

      </div>
    </div>
  )
}
