'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, MapPin, ShieldCheck, Users } from 'lucide-react'

export type RecentMemorial = {
  id: string
  display_name: string
  slug: string
  tagline: string | null
  birth_date: string | null
  death_date: string | null
  cover_photo_url: string | null
  cover_video_url?: string | null
  birth_place: string | null
  family?: { name: string; slug: string } | null
}

type Labels = {
  heading: string
  sub: string
  viewAll: string
  viewMemories: string
  leaveTribute: string
}

export default function RecentMemorialsCarousel({
  memorials,
  labels,
}: {
  memorials: RecentMemorial[]
  labels: Labels
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    const el = scrollRef.current
    el?.addEventListener('scroll', checkScroll)
    return () => {
      window.removeEventListener('resize', checkScroll)
      el?.removeEventListener('scroll', checkScroll)
    }
  }, [memorials])

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -260 : 260, behavior: 'smooth' })
  }

  if (!memorials.length) return null

  return (
    <section style={{ borderTop: '1px solid rgba(201,169,110,.1)', borderBottom: '1px solid rgba(201,169,110,.1)', padding: '32px clamp(20px,4vw,60px)' }}>
      <div style={{ margin: '0 auto', maxWidth: 1240, overflow: 'hidden', borderRadius: 24, boxShadow: '0 0 0 1px rgba(201,169,110,.16)' }}>
        <div className="flex flex-col lg:flex-row">

          {/* LEFT — trust panel */}
          <div style={{ background: 'rgba(255,255,255,.025)', padding: '40px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="lg:w-64 xl:w-80 lg:shrink-0">
            {/* Verified badge */}
            <div style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, border: '1px solid rgba(143,184,158,.3)', background: 'rgba(143,184,158,.07)', padding: '6px 12px', width: 'fit-content' }}>
              <ShieldCheck style={{ width: 14, height: 14, stroke: '#8FB89E', strokeWidth: 1.5 }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', color: '#8FB89E' }}>Aile Onaylı</span>
            </div>

            <h2 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 22, fontWeight: 400, lineHeight: 1.2, color: '#F4F0E6', margin: '0 0 12px' }}>
              {labels.heading}
            </h2>
            <p style={{ fontSize: 13.5, fontWeight: 300, lineHeight: 1.6, color: 'rgba(237,232,221,.56)', margin: 0 }}>{labels.sub}</p>

            <Link
              href="/memorial"
              style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 10, border: '1px solid rgba(201,169,110,.25)', padding: '10px 18px', fontSize: 13, fontWeight: 400, color: '#D8BE8A', textDecoration: 'none' }}
            >
              {labels.viewAll}
            </Link>
          </div>

          {/* RIGHT — dark refined panel */}
          <div className="relative flex-1 overflow-hidden px-6 py-10 sm:px-8" style={{ background: 'linear-gradient(135deg, #0a100c, #07070d)' }}>
            {/* Dot pattern */}
            <div className="pointer-events-none absolute inset-0" style={{ opacity: .05, backgroundImage: 'radial-gradient(circle,rgba(201,169,110,1) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
            {/* Radial glow center */}
            <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%,rgba(201,169,110,0.07) 0%,transparent 70%)' }} />
            {/* Top fade */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-12" style={{ background: 'linear-gradient(180deg,#07070d,transparent)' }} />
            {/* Bottom fade */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12" style={{ background: 'linear-gradient(0deg,#07070d,transparent)' }} />

            <div className="relative">
              {/* Left arrow */}
              <button
                onClick={() => scroll('left')}
                disabled={!canLeft}
                className="absolute -left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 disabled:opacity-0"
                aria-label="Önceki"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Cards */}
              <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto px-2 pb-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {memorials.map((m) => {
                  const birthYear = m.birth_date ? new Date(m.birth_date).getFullYear() : null
                  const deathYear = m.death_date ? new Date(m.death_date).getFullYear() : null
                  const years = birthYear && deathYear
                    ? `${birthYear} – ${deathYear}`
                    : birthYear ? `${birthYear}` : null

                  return (
                    <div
                      key={m.id}
                      className="w-[210px] shrink-0 overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] sm:w-[220px]"
                      style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(201,169,110,.14)', boxShadow: '0 4px 24px rgba(0,0,0,.3)' }}
                    >
                      {/* Photo / Video */}
                      <div className="relative h-[180px] w-full overflow-hidden bg-[#ede8df]">
                        {m.cover_video_url ? (
                          <video
                            src={m.cover_video_url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="h-full w-full object-cover"
                          />
                        ) : m.cover_photo_url ? (
                          <Image
                            src={m.cover_photo_url}
                            alt={m.display_name}
                            fill
                            sizes="220px"
                            className="object-cover object-top transition-transform duration-500 hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Users className="h-14 w-14 text-[#c7b89a]" />
                          </div>
                        )}
                        {/* Bottom gradient on photo */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent" />
                        {/* Verified badge on photo */}
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 backdrop-blur-sm">
                          <ShieldCheck className="h-3 w-3 text-[#2d7a4f]" />
                          <span className="text-[10px] font-semibold text-[#2d7a4f]">Onaylı</span>
                        </div>
                        {/* Family badge */}
                        {m.family && (
                          <Link
                            href={`/aile/${m.family.slug}`}
                            onClick={e => e.stopPropagation()}
                            className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full px-2 py-0.5 backdrop-blur-sm"
                            style={{ background: 'rgba(143,184,158,.88)' }}
                          >
                            <Users className="h-2.5 w-2.5 text-[#0a120e]" />
                            <span className="text-[9.5px] font-semibold text-[#0a120e] max-w-[90px] truncate">{m.family.name}</span>
                          </Link>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3.5">
                        <h3 style={{ fontFamily: 'var(--font-cormorant),Georgia,serif', fontSize: 15, fontWeight: 500, lineHeight: 1.2, color: '#F4F0E6', margin: '0 0 4px' }}>
                          {m.display_name}
                        </h3>
                        {years && (
                          <p style={{ fontSize: 11, color: '#C9A96E', margin: '0 0 6px' }}>{years}</p>
                        )}
                        {m.tagline && (
                          <p style={{ fontSize: 11.5, fontStyle: 'italic', lineHeight: 1.5, color: 'rgba(237,232,221,.5)', margin: '0 0 6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            &ldquo;{m.tagline}&rdquo;
                          </p>
                        )}
                        {m.birth_place && (
                          <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: '#C9A96E', margin: '0 0 8px' }}>
                            <MapPin className="h-3 w-3 shrink-0" />
                            {m.birth_place}
                          </p>
                        )}
                        <div className="mt-3 flex flex-col gap-1.5">
                          <Link
                            href={`/memorial/${m.slug}`}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'linear-gradient(135deg,#E2C885,#C39E63)', padding: '9px', fontSize: 11.5, fontWeight: 500, color: '#14110a', textDecoration: 'none' }}
                          >
                            {labels.viewMemories}
                          </Link>
                          <Link
                            href={`/memorial/${m.slug}#taziye`}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, border: '1px solid rgba(201,169,110,.2)', padding: '8px', fontSize: 11.5, fontWeight: 300, color: '#D8BE8A', textDecoration: 'none' }}
                          >
                            {labels.leaveTribute}
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Right arrow */}
              <button
                onClick={() => scroll('right')}
                disabled={!canRight}
                className="absolute -right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 disabled:opacity-0"
                aria-label="Sonraki"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
