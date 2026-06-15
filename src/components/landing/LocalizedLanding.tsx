'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  Clock,
  Database,
  Heart,
  Image as ImageIcon,
  Key,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  QrCode,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { useLang } from '@/i18n/context'
import { BrandMark } from '@/components/BrandLogo'
import RecentMemorialsCarousel, { type RecentMemorial } from './RecentMemorialsCarousel'
import NotableProfilesSection, { type NotableMemorial } from './NotableProfilesSection'

const stepIcons = [QrCode, BookOpen, Users, ShieldCheck] as const
const stepColors = [
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' },
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
]
const securityIcons = [LockKeyhole, Database, Server, Key, QrCode, ShieldCheck] as const
const valueIcons = [ShieldCheck, Sparkles, QrCode, Users] as const
const whyIcons = [BookOpen, QrCode, Users, Heart, ShieldCheck, Clock] as const
const scenarioAIcons = [BookOpen, ShieldCheck, Clock, QrCode] as const
const scenarioBIcons = [Heart, Users, Camera, ShieldCheck] as const

import type { PricingConfig } from '@/lib/pricing'

type CurrencyView = { symbol: string; memorial: string; vaultSetup: string; vaultMonthly: string; campaignMemorial: string; campaignVaultMonthly: string }

function buildCurrencyView(pricing: PricingConfig, lang: string): CurrencyView {
  if (lang === 'tr' && pricing.memorialTry) {
    return {
      symbol: '₺',
      memorial: pricing.memorialTry,
      vaultSetup: pricing.vaultSetupTry || pricing.vaultSetup,
      vaultMonthly: pricing.vaultMonthlyTry || pricing.vaultMonthly,
      campaignMemorial: pricing.campaignMemorialTry,
      campaignVaultMonthly: pricing.campaignVaultMonthlyTry,
    }
  }
  if (lang === 'en' && pricing.memorialUsd) {
    return {
      symbol: '$',
      memorial: pricing.memorialUsd,
      vaultSetup: pricing.vaultSetupUsd || pricing.vaultSetup,
      vaultMonthly: pricing.vaultMonthlyUsd || pricing.vaultMonthly,
      campaignMemorial: pricing.campaignMemorialUsd,
      campaignVaultMonthly: pricing.campaignVaultMonthlyUsd,
    }
  }
  if (lang === 'ru' && pricing.memorialRub) {
    return {
      symbol: '₽',
      memorial: pricing.memorialRub,
      vaultSetup: pricing.vaultSetupRub || pricing.vaultSetup,
      vaultMonthly: pricing.vaultMonthlyRub || pricing.vaultMonthly,
      campaignMemorial: pricing.campaignMemorialRub,
      campaignVaultMonthly: pricing.campaignVaultMonthlyRub,
    }
  }
  // Default: GEL
  return {
    symbol: '₾',
    memorial: pricing.memorialPrice,
    vaultSetup: pricing.vaultSetup,
    vaultMonthly: pricing.vaultMonthly,
    campaignMemorial: pricing.campaignMemorial,
    campaignVaultMonthly: pricing.campaignVaultMonthly,
  }
}

export default function LocalizedLanding({ pricing, notableMemorials, recentMemorials }: { pricing: PricingConfig; notableMemorials: NotableMemorial[]; recentMemorials: RecentMemorial[] }) {
  const { t, lang } = useLang()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const cur = buildCurrencyView(pricing, lang)

  const quickSteps = t.landing.quickSteps
  const securityItems = t.landing.securityItems
  const values = t.landing.values
  const whyItems = t.landing.whyItems
  const faqs = t.landing.faqs
  const s = t.landing
  const p = s.pricingSection
  const h = s.howItWorksDetailed

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#e6dccb] bg-[#fbf8f1] px-5 pt-20 sm:px-8 lg:pt-20">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#fbf8f1_0%,#fbf8f1_38%,rgba(251,248,241,0.72)_58%,rgba(251,248,241,0)_78%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="relative z-10 max-w-2xl py-8 lg:py-16">
            <div className="mb-5 flex items-center gap-3 text-[#b08340]">
              <span className="h-px w-24 bg-[#c7a76f]" />
              <Sparkles className="h-4 w-4" />
            </div>
            <h1 className="font-serif text-5xl leading-[0.98] text-[#173d31] sm:text-6xl lg:text-[74px]">
              {s.hero.h1a}
              <span className="block font-semibold">{s.hero.h1b}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#4c463c] sm:text-lg">
              {s.hero.p}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="#nasil-calisir" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#103b2c] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#103b2c]/20 transition hover:bg-[#0b2b20]">
                {s.hero.ctaPrimary}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/memorial/demo" className="inline-flex items-center justify-center gap-2 rounded-md border border-[#c7a76f] bg-white px-6 py-3.5 text-sm font-semibold text-[#173d31] shadow-sm transition hover:bg-[#f8f1e6]">
                {s.hero.ctaSecondary}
                <Users className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-[#7a6e63]">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#5a8f72]" />
              {s.hero.trustBadge}
            </p>
          </div>
          <div className="relative -mr-5 min-h-[360px] sm:-mr-8 lg:min-h-[560px]">
            <Image
              src="/images/landing/hero-memorial-qr.png"
              alt="Mezar taşı üzerinde QR kod ve yanında telefonda dijital anıt profili"
              fill
              priority
              sizes="(min-width: 1024px) 62vw, 100vw"
              className="object-cover object-center lg:rounded-bl-[2rem]"
            />
            <div className="absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(90deg,#fbf8f1_0%,rgba(251,248,241,0.82)_42%,rgba(251,248,241,0)_100%)]" />
          </div>
        </div>
      </section>

      {/* QUICK 3 STEPS */}
      <section id="nasil-calisir" className="border-b border-[#e6dccb] bg-[#fbf8f1] px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {quickSteps.map((item, index) => {
            const Icon = stepIcons[index]
            const color = stepColors[index]
            return (
              <div key={index} className="rounded-lg border border-[#e1d5c3] bg-[#fffdf8] p-6 shadow-sm flex flex-col">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border ${color.border} ${color.bg} ${color.text}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-[#b08340]">{String(index + 1).padStart(2, '0')}</div>
                    <h3 className="mt-1 font-serif text-xl text-[#173d31]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#665d50]">{item.text}</p>
                  </div>
                </div>
                {'cta' in item && item.cta && (
                  <a
                    href="https://theeternalmemory.com/satin-al/anma"
                    className="mt-4 block w-full rounded-lg bg-[#173d31] py-2.5 text-center text-sm font-semibold text-white hover:bg-[#1f5040] transition-colors"
                  >
                    {item.cta}
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* PROFILE PREVIEW */}
      <section className="border-b border-[#e6dccb] bg-[#fbf8f1] px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-7 lg:grid-cols-[0.28fr_0.72fr]">
          <div className="lg:pl-2">
            <h2 className="font-serif text-3xl text-[#173d31] sm:text-4xl">{s.profilePreview.heading}</h2>
            <div className="mt-3 flex items-center gap-3 text-[#b08340]">
              <span className="h-px w-16 bg-[#c7a76f]" />
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#5b5245]">
              {s.profilePreview.body}
            </p>
            <Link href="/memorial/demo" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#9a7132]">
              {s.profilePreview.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-lg border border-[#e1d5c3] bg-white/92 p-4 shadow-xl shadow-[#4d3d26]/10">
            <div className="grid gap-5 lg:grid-cols-[170px_1fr_1.45fr]">
              <Image
                src="/images/landing/profile-ahmet.png"
                alt="Ahmet Yılmaz dijital anıt profil fotoğrafı"
                width={340}
                height={340}
                className="h-[190px] w-full rounded-md object-cover object-top lg:h-full"
              />
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-[#173d31]">{s.profilePreview.profileName}</h3>
                  <p className="mt-1 text-xs text-[#8a7a64]">{s.profilePreview.profileYears}</p>
                  <p className="mt-4 text-sm leading-6 text-[#5b5245]">
                    {s.profilePreview.profileBio}
                  </p>
                </div>
                <Link href="/memorial/demo" className="mt-4 inline-flex w-fit items-center justify-center rounded-md border border-[#c7a76f] px-4 py-2 text-xs font-semibold text-[#173d31] transition hover:bg-[#f8f1e6]">
                  {s.profilePreview.readStory}
                </Link>
              </div>
              <div className="border-t border-[#eee4d5] pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <div className="grid grid-cols-4 gap-2 text-center text-xs text-[#5b5245]">
                  {[
                    { icon: BookOpen, label: s.profilePreview.statLifeStory },
                    { icon: ImageIcon, label: s.profilePreview.statPhotos },
                    { icon: Play, label: s.profilePreview.statVideos },
                    { icon: Heart, label: s.profilePreview.statMemories },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="rounded-md border border-[#e1d5c3] bg-[#fbf8f1] px-3 py-3 text-center">
                      <Icon className="mx-auto h-5 w-5 text-[#9a7132]" />
                      <div className="mt-2 text-xs font-semibold text-[#173d31]">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-4 gap-3">
                  {[
                    ['/images/landing/profile-family-old.png', 'Eski aile fotoğrafı'],
                    ['/images/landing/profile-family-dinner.png', 'Aile sofrasında anı'],
                    ['/images/landing/profile-family-main.png', 'Aile portresi'],
                    ['/images/landing/profile-georgia.png', 'Anı yeri'],
                  ].map(([src, alt]) => (
                    <Image key={src} src={src} alt={alt} width={190} height={130} className="h-20 rounded-md object-cover shadow-sm" />
                  ))}
                </div>
                <Link href="/memorial/demo" className="mx-auto mt-5 inline-flex items-center justify-center gap-2 rounded-md border border-[#c7a76f] px-6 py-2 text-xs font-semibold text-[#173d31] transition hover:bg-[#f8f1e6]">
                  {s.profilePreview.viewAll}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ULUSAL MİRAS */}
      <NotableProfilesSection memorials={notableMemorials} />

      {/* RECENT PUBLIC MEMORIALS */}
      <RecentMemorialsCarousel
        memorials={recentMemorials}
        labels={t.recentMemorials}
      />

      {/* 4 VALUES + CTA BAND */}
      <section className="border-y border-[#e6dccb] bg-[#fbf8f1] px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 rounded-lg bg-[#fffdf8] px-4 py-5 md:grid-cols-4 md:gap-0">
            {values.map((item, index) => {
              const Icon = valueIcons[index]
              return (
                <div key={index} className={`flex items-center gap-4 px-3 ${index > 0 ? 'md:border-l md:border-[#d7c7ae]' : ''}`}>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#e1d5c3] bg-[#f4eee3] text-[#8a682e]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-[#173d31]">{item.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-[#665d50]">{item.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="relative mt-6 overflow-hidden rounded-lg bg-[#103b2c] px-6 py-8 text-center text-white shadow-xl shadow-[#103b2c]/15">
            <Image src="/images/landing/cta-candle-olive.png" alt="Mum ve zeytin dallarıyla anma atmosferi" fill sizes="100vw" className="absolute inset-0 object-cover" />
            <div className="absolute inset-0 bg-[#06291f]/35" />
            <div className="relative z-10">
              <h2 className="font-serif text-2xl sm:text-3xl">{s.ctaBanner.heading}</h2>
              <Link href="/#fiyatlar" className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-[#d1a85c] px-7 py-3 text-sm font-semibold text-[#103b2c] shadow-lg shadow-black/10 transition hover:bg-[#e0ba70]">
                {s.ctaBanner.button} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY THE MARADI */}
      <section id="ozellikler" className="bg-[#fbf8f1] px-5 py-16 sm:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-serif text-4xl text-[#173d31] sm:text-5xl">{s.whySection.heading}</h2>
          <p className="mt-4 leading-7 text-[#665d50]">{s.whySection.sub}</p>
        </div>
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {whyItems.map((item, index) => {
            const Icon = whyIcons[index]
            return (
              <div key={index} className="rounded-lg border border-[#e1d5c3] bg-[#fffdf8] p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e1d5c3] bg-[#f4eee3] text-[#8a682e]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-serif text-lg text-[#173d31]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#665d50]">{item.text}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* HOW IT WORKS — 4 STEPS */}
      <section id="nasil-calisir" className="border-y border-[#e6dccb] bg-[#f7f2e9] px-5 py-14 sm:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="font-serif text-4xl text-[#173d31] sm:text-5xl">{h.heading}</h2>
        </div>
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-6 sm:grid sm:grid-cols-2 sm:gap-5 lg:flex lg:flex-row lg:items-start lg:gap-0">
            {h.steps4.map((step, i) => {
              const isLast = i === 3
              return (
                <div key={i} className="relative flex flex-1 flex-col px-3">
                  {/* Dashed arrow — at image center height */}
                  {!isLast && (
                    <div className="absolute right-0 top-[60px] z-10 hidden -translate-y-1/2 translate-x-1/2 lg:block">
                      <svg width="40" height="18" viewBox="0 0 40 18" fill="none">
                        <line x1="0" y1="9" x2="30" y2="9" stroke="#c7a76f" strokeWidth="1.5" strokeDasharray="3 2.5"/>
                        <polyline points="26,5 32,9 26,13" fill="none" stroke="#c7a76f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  {/* Image left + text right */}
                  <div className="flex items-start gap-4">
                    {/* Illustration — no background box */}
                    <div className="relative h-[120px] w-[120px] shrink-0">
                      <Image
                        src={`/images/landing/how-step-${i + 1}.png`}
                        alt={step.title}
                        fill
                        sizes="120px"
                        className="object-contain object-center"
                      />
                    </div>
                    {/* Number + title + desc */}
                    <div className="flex-1 pt-1">
                      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#173d31] text-xs font-bold text-white shadow">
                        {i + 1}
                      </div>
                      <h3 className="text-[15px] font-bold leading-snug text-[#173d31]">{step.title}</h3>
                      <p className="mt-1.5 text-xs leading-5 text-[#665d50]">{step.desc}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* GRAVESTONE QR BANNER */}
      <section className="border-b border-[#e6dccb] bg-[#faf7f0] px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative h-[260px] overflow-hidden rounded-2xl sm:h-[320px] lg:h-[380px]">
            <Image
              src="/images/landing/qr-gravestone-banner.jpg"
              alt="Mezar taşındaki QR kod ile dijital anma profiline geçiş"
              fill
              sizes="(max-width:1280px) 100vw, 1280px"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#faf7f0]/90 from-20% via-[#faf7f0]/45 via-48% to-transparent" />
            <div className="absolute inset-0 flex items-center px-8 sm:px-12">
              <div className="max-w-[260px] sm:max-w-sm lg:max-w-md">
                <h2 className="font-serif text-2xl leading-snug text-[#173d31] sm:text-3xl lg:text-4xl">
                  {t.gravestoneQrBanner.heading}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#5b5245] sm:text-base">
                  {t.gravestoneQrBanner.body}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY INFRASTRUCTURE */}
      <section className="bg-[#fbf8f1] px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.5fr_1fr]">
          <div>
            <h2 className="font-serif text-4xl text-[#173d31]">{s.security.heading}</h2>
            <p className="mt-4 max-w-md leading-7 text-[#5b5245]">
              {s.security.body}
            </p>
            <div className="mt-6 rounded-xl border border-[#d4e8dc] bg-[#edf7f1] p-4 text-sm text-[#2d5c3e]">
              <strong>Ömür boyu açık kalma taahhüdü.</strong> {s.security.commitment}
            </div>
            <Link href="/privacy" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#9a7132]">
              {s.security.readPrivacy} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {securityItems.map((item, index) => {
              const Icon = securityIcons[index]
              return (
                <div key={index} className="rounded-lg border border-[#e1d5c3] bg-[#fffdf8] p-5 shadow-sm">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#e1d5c3] bg-[#f4eee3] text-[#9a7132]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base text-[#173d31]">{item.title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-[#665d50]">{item.text}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="fiyatlar" className="border-y border-[#e6dccb] bg-[#f7f2e9] px-5 py-16 sm:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-serif text-4xl text-[#173d31] sm:text-5xl">{p.heading}</h2>
          <p className="mt-4 leading-7 text-[#665d50]">{p.sub}</p>
        </div>

        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/10">
          <div className="flex flex-col lg:flex-row">

            {/* LEFT — dark green price panel */}
            <div className="flex flex-col justify-between bg-[#103b2c] px-8 py-10 lg:w-72 lg:shrink-0 xl:w-80">
              <div>
                <span className="inline-block rounded-full border border-[#2d7a4f]/50 bg-[#0b2b20] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7ecf9e]">
                  {p.memorialBadge}
                </span>
                <h3 className="mt-3 font-serif text-2xl text-white">{p.memorialTitle}</h3>

                <div className="mt-6 flex items-end gap-2">
                  {pricing.campaignActive && cur.campaignMemorial ? (
                    <>
                      <span className="font-serif text-3xl text-white/40 line-through">{cur.memorial}</span>
                      <span className="font-serif text-5xl font-bold text-white">{cur.campaignMemorial}</span>
                    </>
                  ) : (
                    <span className="font-serif text-5xl font-bold text-white">{cur.memorial}</span>
                  )}
                  <div className="mb-1.5">
                    <span className="text-xl font-semibold text-[#a3c9b1]">{cur.symbol}</span>
                    <p className="text-xs text-[#a3c9b1]">{p.memorialPriceLabel}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                {/* Guarantee */}
                <div className="rounded-xl border border-[#2d7a4f]/40 bg-[#0b2b20] px-4 py-3.5">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#7ecf9e]" />
                    <div>
                      <p className="text-sm font-semibold text-[#7ecf9e]">{p.memorialGuaranteeBadge}</p>
                      <p className="mt-0.5 text-xs leading-5 text-[#a3c9b1]">{p.memorialGuarantee}</p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/satin-al/anma"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e8c97e] py-3.5 text-sm font-bold text-[#1a1208] shadow-lg transition hover:bg-[#d4b56a]"
                >
                  {p.memorialCta} <ArrowRight className="h-4 w-4" />
                </Link>

                {/* Demo link */}
                <a
                  href="/memorial/demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#2d7a4f]/50 bg-[#0b2b20] py-3 text-sm font-semibold text-[#7ecf9e] transition hover:border-[#7ecf9e]/60 hover:bg-[#0e3322]"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  {p.demoProfileCta}
                </a>
              </div>
            </div>

            {/* RIGHT — features panel */}
            <div className="flex-1 bg-white px-8 py-10">
              <p className="mb-5 text-xs font-bold uppercase tracking-wider text-[#8a7a64]">{p.memorialFeaturesHeading}</p>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {p.memorialFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#4c463c]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2d7a4f]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[11px] text-[#8a7a64]">{p.memorialCustomDesignNote}</p>

              {/* Trust note */}
              <div className="mt-6 rounded-xl border border-[#d4e8dc] bg-[#edf7f1] px-4 py-3.5">
                <p className="text-xs leading-5 text-[#2d5c3e]">
                  🔒 {p.memorialTrustNote}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section id="sss" className="bg-[#fbf8f1] px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[0.65fr_1fr]">
          <div>
            <Image
              src="/images/landing/hero-family-memory.png"
              alt="Aile anıları ve dijital anıt deneyimi"
              width={760}
              height={500}
              className="h-[320px] rounded-lg object-cover shadow-xl shadow-[#4d3d26]/12"
            />
            <div className="mt-6 rounded-xl border border-[#d4e8dc] bg-[#edf7f1] p-5">
              <p className="font-serif text-lg text-[#173d31]">{s.faqSection.moreQuestions}</p>
              <p className="mt-2 text-sm text-[#5b5245]">{s.faqSection.moreQuestionsBody}</p>
              <Link href="/contact" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2d7a53]">
                {s.faqSection.contactLink} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div>
            <h2 className="mb-6 font-serif text-4xl text-[#173d31]">{s.faqSection.heading}</h2>
            <div className="overflow-hidden rounded-2xl border border-[#e1d5c3] bg-[#fffdf8]">
              {faqs.map((faq, i) => (
                <div key={i} className={i < faqs.length - 1 ? 'border-b border-[#e1d5c3]' : ''}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-[#f7f2e9]"
                  >
                    <span className="font-serif text-lg text-[#173d31]">{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[#b08340] transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="border-t border-[#e1d5c3] bg-[#f7f2e9] px-6 py-4">
                      <p className="text-sm leading-7 text-[#5b5245]">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#fbf8f1] px-5 pb-16 sm:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.35rem] px-6 py-10 text-center text-white shadow-2xl shadow-[#103b2c]/20 sm:px-10">
          <Image src="/images/landing/final-cta-leaves.png" alt="Koyu yeşil fonda altın yapraklı The Eternal Memory iletişim alanı" fill sizes="100vw" className="absolute inset-0 object-cover" />
          <div className="absolute inset-0 bg-[#06291f]/10" />
          <div className="relative z-10 mx-auto max-w-3xl">
            <h2 className="font-serif text-3xl sm:text-4xl">{s.finalCta.heading}</h2>
            <p className="mt-3 text-lg text-[#e8decc]">{s.finalCta.sub}</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/#fiyatlar" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#d1a85c] px-7 py-3 text-sm font-semibold text-[#103b2c] shadow-lg shadow-black/10 transition hover:bg-[#e0ba70]">
                {s.finalCta.primaryBtn} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d1a85c] bg-[#103b2c]/25 px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#103b2c]/45">
                {s.finalCta.secondaryBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0c3327] px-5 py-12 text-[#efe7d8] sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3 font-serif text-2xl">
              <BrandMark className="h-10 w-10" />
              The Eternal Memory
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#cfc3ad]">{s.footer.tagline}</p>
            <p className="mt-4 text-xs text-[#8a7a64]">{s.footer.commitment}</p>
          </div>
          <FooterColumn title={s.footer.colPlatform} links={s.footer.platformLinks} />
          <FooterColumn title={s.footer.colCorporate} links={s.footer.corporateLinks} />
          <FooterColumn title={s.footer.colDocs} links={s.footer.docLinks} />
          <div>
            <h3 className="font-serif text-lg">{s.footer.colContact}</h3>
            <div className="mt-4 space-y-3 text-sm text-[#cfc3ad]">
              <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> support@theeternalmemory.com</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Georgia</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +995 555 51 18 84</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Türkiye</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +90 537 882 67 47</div>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-[#b8aa93]">
          {s.footer.copyright}
        </div>
      </footer>
    </>
  )
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="font-serif text-lg">{title}</h3>
      <div className="mt-4 space-y-2">
        {links.map((link) => (
          <Link key={`${link.href}-${link.label}`} href={link.href} className="block text-sm text-[#cfc3ad] transition hover:text-white">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
