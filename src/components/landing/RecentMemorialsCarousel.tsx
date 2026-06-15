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
  birth_place: string | null
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
    <section className="border-b border-[#e6dccb] bg-[#fbf8f1] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl shadow-md ring-1 ring-[#d9cebd]">
        <div className="flex flex-col lg:flex-row">

          {/* LEFT — trust panel */}
          <div className="bg-[#fffdf8] px-8 py-10 lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:justify-center xl:w-80">
            {/* Verified badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c8dfd2] bg-[#eef7f2] px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#2d7a4f]" />
              <span className="text-[11px] font-semibold tracking-wide text-[#2d7a4f]">Aile Onaylı</span>
            </div>

            <h2 className="font-serif text-xl leading-snug text-[#173d31] sm:text-2xl">
              {labels.heading}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#665d50]">{labels.sub}</p>

            <Link
              href="/memorial"
              className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-lg border border-[#173d31] px-4 py-2.5 text-xs font-semibold text-[#173d31] transition hover:bg-[#e8f2ec]"
            >
              {labels.viewAll}
            </Link>
          </div>

          {/* RIGHT — dark refined panel */}
          <div className="relative flex-1 overflow-hidden bg-[#0d1f15] px-6 py-10 sm:px-8">
            {/* Dot pattern */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle,#fff_1px,transparent_1px)] [background-size:20px_20px]" />
            {/* Radial glow center */}
            <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(45,122,79,0.12)_0%,transparent_70%)]" />
            {/* Top fade */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#0d1f15] to-transparent" />
            {/* Bottom fade */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0d1f15] to-transparent" />

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
                      className="w-[210px] shrink-0 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:ring-1 hover:ring-[#c7a76f]/60 hover:shadow-[0_4px_24px_rgba(199,167,111,0.22)] sm:w-[220px]"
                    >
                      {/* Photo */}
                      <div className="relative h-[180px] w-full overflow-hidden bg-[#ede8df]">
                        {m.cover_photo_url ? (
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
                      </div>

                      {/* Info */}
                      <div className="p-3.5">
                        <h3 className="font-serif text-sm font-semibold leading-snug text-[#173d31]">
                          {m.display_name}
                        </h3>
                        {years && (
                          <p className="mt-0.5 text-xs text-[#9a7132]">{years}</p>
                        )}
                        {m.tagline && (
                          <p className="mt-1.5 line-clamp-2 text-xs italic leading-5 text-[#665d50]">
                            &ldquo;{m.tagline}&rdquo;
                          </p>
                        )}
                        {m.birth_place && (
                          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#9a7132]">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {m.birth_place}
                          </p>
                        )}
                        <div className="mt-3 flex flex-col gap-1.5">
                          <Link
                            href={`/memorial/${m.slug}`}
                            className="flex items-center justify-center rounded-lg bg-[#173d31] py-2 text-xs font-semibold text-white transition hover:bg-[#0e2820]"
                          >
                            {labels.viewMemories}
                          </Link>
                          <Link
                            href={`/memorial/${m.slug}#taziye`}
                            className="flex items-center justify-center rounded-lg border border-[#c8dfd2] py-2 text-xs font-semibold text-[#2d5c3e] transition hover:bg-[#eef7f2]"
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
