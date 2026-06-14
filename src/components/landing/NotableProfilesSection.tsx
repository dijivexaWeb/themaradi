'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { useLang } from '@/i18n/context'

export type NotableMemorial = {
  id: string
  display_name: string
  slug: string
  tagline: string | null
  birth_date: string | null
  death_date: string | null
  cover_photo_url: string | null
  nationality: string | null
  notable_subtitle: string | null
}

// Fixed star positions — no random, no hydration issues
const STARS = [
  { top: '8%',  left: '4%',  size: 2,   delay: 0   },
  { top: '15%', left: '12%', size: 3,   delay: 0.8 },
  { top: '5%',  left: '22%', size: 1.5, delay: 1.6 },
  { top: '20%', left: '35%', size: 2,   delay: 0.4 },
  { top: '10%', left: '48%', size: 3,   delay: 2.1 },
  { top: '18%', left: '62%', size: 1.5, delay: 0.9 },
  { top: '6%',  left: '75%', size: 2,   delay: 1.4 },
  { top: '14%', left: '85%', size: 3,   delay: 0.2 },
  { top: '22%', left: '93%', size: 1.5, delay: 1.8 },
  { top: '78%', left: '7%',  size: 2,   delay: 1.2 },
  { top: '85%', left: '18%', size: 1.5, delay: 0.6 },
  { top: '72%', left: '30%', size: 3,   delay: 1.9 },
  { top: '88%', left: '45%', size: 2,   delay: 0.3 },
  { top: '75%', left: '58%', size: 1.5, delay: 2.4 },
  { top: '82%', left: '70%', size: 3,   delay: 0.7 },
  { top: '70%', left: '82%', size: 2,   delay: 1.5 },
  { top: '90%', left: '91%', size: 1.5, delay: 1.0 },
  { top: '40%', left: '2%',  size: 1.5, delay: 2.2 },
  { top: '55%', left: '97%', size: 2,   delay: 0.5 },
  { top: '35%', left: '52%', size: 1.5, delay: 1.7 },
]

export default function NotableProfilesSection({ memorials }: { memorials: NotableMemorial[] }) {
  const { t } = useLang()
  const s = t.notableSection

  if (!memorials.length) return null

  return (
    <section className="relative overflow-hidden border-y border-[#1a3d2a] bg-[#080f0b] py-9 px-5 sm:px-8">

      {/* CSS star animation */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50%       { opacity: 0.65; transform: scale(1.4); }
        }
      `}</style>

      {/* Stars */}
      {STARS.map((star, i) => (
        <span
          key={i}
          className="pointer-events-none absolute rounded-full bg-[#c7a76f]"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animation: `twinkle ${2.5 + (i % 3) * 0.5}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}

      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(183,140,80,0.06)_0%,transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl">

        {/* Header — one compact line */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#c7a76f]">✦</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c7a76f]">
              {s.eyebrow}
            </span>
            <span className="text-[#c7a76f]">✦</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-[#c7a76f]/50 to-transparent" />
          <h2 className="font-serif text-sm italic text-white/60 hidden sm:block">{s.heading}</h2>
        </div>

        {/* Cards */}
        <div
          className="flex gap-2.5 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 sm:overflow-visible lg:grid-cols-5 xl:grid-cols-6"
          style={{ scrollbarWidth: 'none' }}
        >
          {memorials.map((m, idx) => {
            const birthYear = m.birth_date ? new Date(m.birth_date).getFullYear() : null
            const deathYear = m.death_date ? new Date(m.death_date).getFullYear() : null
            const years = birthYear && deathYear
              ? `${birthYear} – ${deathYear}`
              : birthYear ? `${birthYear}` : null

            return (
              <Link
                key={m.id}
                href={`/memorial/${m.slug}`}
                className="group relative flex w-[128px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#243d2e] bg-[#0c1a11] transition-all duration-300 hover:border-[#c7a76f]/60 hover:shadow-[0_0_18px_rgba(199,167,111,0.14)] sm:w-auto"
              >
                {/* Photo — tall portrait */}
                <div className="relative w-full overflow-hidden bg-[#111d14]" style={{ height: '260px' }}>
                  {m.cover_photo_url ? (
                    <Image
                      src={m.cover_photo_url}
                      alt={m.display_name}
                      fill
                      priority={idx < 4}
                      sizes="(max-width: 640px) 128px, (max-width: 1024px) 25vw, 17vw"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Users className="h-10 w-10 text-[#2a4a35]" />
                    </div>
                  )}

                  {/* Bottom gradient — name overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080f0b] via-[#080f0b]/30 to-transparent" />

                  {/* Name + years overlaid on photo bottom */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-8">
                    <h3 className="font-serif text-[13px] font-semibold leading-tight text-white drop-shadow">
                      {m.display_name}
                    </h3>
                    {years && (
                      <p className="mt-0.5 text-[11px] font-medium text-[#c7a76f]">{years}</p>
                    )}
                  </div>

                  {/* Flag badge top-right */}
                  {m.nationality && (
                    <div className="absolute right-2 top-2">
                      <img
                        src={`https://flagcdn.com/24x18/${m.nationality.toLowerCase()}.png`}
                        alt={m.nationality}
                        className="rounded-sm shadow-lg opacity-90"
                        width={24}
                        height={18}
                      />
                    </div>
                  )}
                </div>

                {/* Tagline + CTA */}
                <div className="flex flex-1 flex-col px-3 py-2.5 gap-2">
                  {(m.tagline || m.notable_subtitle) && (
                    <p className="line-clamp-2 text-[10px] italic leading-4 text-[#6a8e78]">
                      {m.tagline || m.notable_subtitle}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-wide text-[#c7a76f] group-hover:text-[#e8d5a8] transition-colors">
                      {s.visit}
                    </span>
                    <span className="text-[#c7a76f] text-[10px] transition-transform group-hover:translate-x-0.5">→</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c7a76f]/25" />
          <p className="text-[9px] text-[#3a5a45] tracking-[0.18em] uppercase">{s.sub}</p>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c7a76f]/25" />
        </div>

      </div>
    </section>
  )
}
