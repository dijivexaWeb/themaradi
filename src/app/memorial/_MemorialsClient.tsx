'use client'

import { type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Users, Home } from 'lucide-react'
import { useLang } from '@/i18n/context'
import FilterBar from './_FilterBar'
import MemorialsFooter from './_MemorialsFooter'
import AddedBadge from '@/components/AddedBadge'

export type MemorialItem = {
  id: string
  display_name: string
  slug: string
  tagline: string | null
  birth_date: string | null
  death_date: string | null
  cover_photo_url: string | null
  cover_video_url?: string | null
  birth_place: string | null
  is_notable?: boolean | null
  nationality?: string | null
  notable_sort_order?: number | null
  published_at?: string | null
  family?: { name: string; slug: string } | null
}

function nationalityFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return ''
  return code.toUpperCase().split('').map(c => String.fromCodePoint(c.charCodeAt(0) + 127397)).join('')
}

export default function MemorialsClient({
  memorials,
  notableMemorials = [],
  count,
  currentPage,
  totalPages,
  searchTerm,
  letter,
}: {
  memorials: MemorialItem[]
  notableMemorials?: MemorialItem[]
  count: number
  currentPage: number
  totalPages: number
  searchTerm: string
  letter: string
}) {
  const { t } = useLang()
  const labels = t.memorialsPage

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-16">
        <div className="relative h-[280px] sm:h-[340px]">
          <Image
            src="/images/landing/memorial-hero-cemetery.png"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c2a1e]/75 via-[#0c2a1e]/65 to-[#fbf8f1]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-5 pb-10 text-center">
            <h1 className="font-serif text-3xl font-semibold text-white drop-shadow sm:text-4xl lg:text-5xl">
              {labels.heroHeading}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
              {labels.heroSub}
            </p>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

          {/* SIDEBAR */}
          <FilterBar currentQ={searchTerm} currentLetter={letter} />

          {/* CONTENT */}
          <div className="min-w-0 flex-1">

            {/* NOTABLE / PINNED SECTION */}
            {notableMemorials.length > 0 && (
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-base">🏛</span>
                  <h2 className="font-serif text-base font-semibold text-[#173d31]">Ulusal Miras Profilleri</h2>
                  <div className="h-px flex-1 bg-[#dfbd72]/40" />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {notableMemorials.map((m, idx) => {
                    const birthYear = m.birth_date ? new Date(m.birth_date).getFullYear() : null
                    const deathYear = m.death_date ? new Date(m.death_date).getFullYear() : null
                    const years = birthYear && deathYear ? `${birthYear} – ${deathYear}` : birthYear ? `${birthYear}` : null
                    const flag = nationalityFlag(m.nationality)
                    const order = m.notable_sort_order

                    return (
                      <div
                        key={m.id}
                        className="group relative overflow-hidden rounded-xl border border-[#dfbd72]/60 bg-gradient-to-b from-[#fdf8ee] to-white shadow-sm transition-all hover:border-[#dfbd72] hover:shadow-md"
                      >
                        {/* Stretched main link */}
                        <Link href={`/memorial/${m.slug}`} className="absolute inset-0 z-10" aria-label={m.display_name} />
                        {/* Sıra numarası */}
                        {order != null && (
                          <div className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#dfbd72] text-[10px] font-bold text-[#1a1208]">
                            {order}
                          </div>
                        )}
                        {/* Bayrak */}
                        {flag && (
                          <div className="absolute right-2 top-2 z-10 text-base leading-none">{flag}</div>
                        )}
                        <div className="relative z-[1] h-[170px] w-full overflow-hidden bg-[#ede8df]">
                          {m.cover_photo_url ? (
                            <Image
                              src={m.cover_photo_url}
                              alt={m.display_name}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                              className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Users className="h-12 w-12 text-[#c7b89a]" />
                            </div>
                          )}
                          {m.family && (
                            <Link
                              href={`/aile/${m.family.slug}`}
                              className="absolute bottom-2 left-2 z-20 flex items-center gap-1 rounded-full px-2 py-0.5"
                              style={{ background: 'rgba(143,184,158,.9)', backdropFilter: 'blur(4px)' }}
                            >
                              <Home className="h-2.5 w-2.5 text-[#0a120e]" />
                              <span className="text-[9px] font-semibold text-[#0a120e] max-w-[80px] truncate">{m.family.name}</span>
                            </Link>
                          )}
                        </div>
                        <div className="relative z-[1] p-3.5">
                          <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-[#dfbd72]/20 px-2 py-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-wide text-[#9a7132]">Ulusal Miras</span>
                          </div>
                          <h3 className="font-serif text-sm font-semibold leading-snug text-[#173d31] transition-colors group-hover:text-[#0b6b3a]">
                            {m.display_name}
                          </h3>
                          {years && (
                            <p className="mt-0.5 text-xs font-medium text-[#9a7132]">{years}</p>
                          )}
                          {m.tagline && (
                            <p className="mt-1.5 line-clamp-2 text-xs italic leading-5 text-[#665d50]">
                              &ldquo;{m.tagline}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-6 border-t border-[#e6dccb]" />
              </div>
            )}

            <p className="mb-5 text-sm text-[#7a6f5e]">
              <span className="font-semibold text-[#173d31]">{count}</span>{' '}
              {labels.showing}
            </p>

            {!memorials.length ? (
              <div className="flex flex-col items-center py-24 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f2ec]">
                  <Users className="h-8 w-8 text-[#5a9e72]" />
                </div>
                <p className="text-lg font-semibold">{labels.noResults}</p>
                <p className="mt-2 text-sm text-[#7a6f5e]">{labels.noResultsSub}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {memorials.map((m) => {
                  const birthYear = m.birth_date
                    ? new Date(m.birth_date).getFullYear()
                    : null
                  const deathYear = m.death_date
                    ? new Date(m.death_date).getFullYear()
                    : null
                  const years =
                    birthYear && deathYear
                      ? `${birthYear} – ${deathYear}`
                      : birthYear
                        ? `${birthYear}`
                        : null

                  return (
                    <div
                      key={m.id}
                      className="group relative overflow-hidden rounded-xl border border-[#e6dccb] bg-white shadow-sm transition-all hover:border-[#c8b89a] hover:shadow-md"
                    >
                      {/* Stretched main link */}
                      <Link href={`/memorial/${m.slug}`} className="absolute inset-0 z-10" aria-label={m.display_name} />
                      <div className="relative z-[1] h-[170px] w-full overflow-hidden bg-[#ede8df]">
                        <AddedBadge date={m.published_at} className="absolute left-2 top-2 z-20" />
                        {m.family && (
                          <Link
                            href={`/aile/${m.family.slug}`}
                            className="absolute bottom-2 left-2 z-20 flex items-center gap-1 rounded-full px-2 py-0.5"
                            style={{ background: 'rgba(143,184,158,.9)', backdropFilter: 'blur(4px)' }}
                          >
                            <Home className="h-2.5 w-2.5 text-[#0a120e]" />
                            <span className="text-[9px] font-semibold text-[#0a120e] max-w-[80px] truncate">{m.family.name}</span>
                          </Link>
                        )}
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
                            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Users className="h-12 w-12 text-[#c7b89a]" />
                          </div>
                        )}
                      </div>
                      <div className="relative z-[1] p-3.5">
                        <h3 className="font-serif text-sm font-semibold leading-snug text-[#173d31] transition-colors group-hover:text-[#0b6b3a]">
                          {m.display_name}
                        </h3>
                        {years && (
                          <p className="mt-0.5 text-xs font-medium text-[#9a7132]">
                            {years}
                          </p>
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
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                {currentPage > 1 && (
                  <PaginationLink href={buildHref(searchTerm, letter, currentPage - 1)}>
                    ← {labels.prevPage}
                  </PaginationLink>
                )}
                {buildPageRange(currentPage, totalPages).map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-sm text-[#9a8f7a]">
                      …
                    </span>
                  ) : (
                    <PaginationLink
                      key={p}
                      href={buildHref(searchTerm, letter, p as number)}
                      active={p === currentPage}
                    >
                      {p}
                    </PaginationLink>
                  ),
                )}
                {currentPage < totalPages && (
                  <PaginationLink href={buildHref(searchTerm, letter, currentPage + 1)}>
                    {labels.nextPage} →
                  </PaginationLink>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[#173d31] px-5 py-16 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle,#fff_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative mx-auto max-w-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#e8c97e]/70">
            The Eternal Memory
          </p>
          <h2 className="font-serif text-2xl font-semibold text-[#f5efe2] sm:text-3xl">
            {labels.ctaHeading}
          </h2>
          <Link
            href="/satin-al/anma"
            className="mt-8 inline-flex rounded-xl bg-[#e8c97e] px-8 py-4 text-sm font-bold text-[#1a1208] transition hover:bg-[#d4b56a]"
          >
            {labels.ctaButton}
          </Link>
        </div>
      </section>

      <MemorialsFooter />
    </>
  )
}

function PaginationLink({
  href,
  children,
  active,
}: {
  href: string
  children: ReactNode
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex h-9 min-w-[36px] items-center justify-center rounded-lg px-3 text-sm font-medium transition ${
        active
          ? 'bg-[#173d31] text-white shadow-sm'
          : 'border border-[#e6dccb] bg-white text-[#173d31] hover:bg-[#eef7f2]'
      }`}
    >
      {children}
    </Link>
  )
}

function buildHref(q: string, l: string, page: number): string {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (l) params.set('l', l)
  if (page > 1) params.set('page', String(page))
  const str = params.toString()
  return `/memorial${str ? `?${str}` : ''}`
}

function buildPageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  if (current > 3) pages.push('…')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p)
  }
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}
