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
  { top: '8%',  left: '4%',  size: 2, delay: 0 },
  { top: '15%', left: '12%', size: 3, delay: 0.8 },
  { top: '5%',  left: '22%', size: 1.5, delay: 1.6 },
  { top: '20%', left: '35%', size: 2, delay: 0.4 },
  { top: '10%', left: '48%', size: 3, delay: 2.1 },
  { top: '18%', left: '62%', size: 1.5, delay: 0.9 },
  { top: '6%',  left: '75%', size: 2, delay: 1.4 },
  { top: '14%', left: '85%', size: 3, delay: 0.2 },
  { top: '22%', left: '93%', size: 1.5, delay: 1.8 },
  { top: '78%', left: '7%',  size: 2, delay: 1.2 },
  { top: '85%', left: '18%', size: 1.5, delay: 0.6 },
  { top: '72%', left: '30%', size: 3, delay: 1.9 },
  { top: '88%', left: '45%', size: 2, delay: 0.3 },
  { top: '75%', left: '58%', size: 1.5, delay: 2.4 },
  { top: '82%', left: '70%', size: 3, delay: 0.7 },
  { top: '70%', left: '82%', size: 2, delay: 1.5 },
  { top: '90%', left: '91%', size: 1.5, delay: 1.0 },
  { top: '40%', left: '2%',  size: 1.5, delay: 2.2 },
  { top: '55%', left: '97%', size: 2, delay: 0.5 },
  { top: '35%', left: '52%', size: 1.5, delay: 1.7 },
]

export default function NotableProfilesSection({ memorials }: { memorials: NotableMemorial[] }) {
  const { t } = useLang()
  const s = t.notableSection

  if (!memorials.length) return null

  return (
    <section className="relative overflow-hidden border-y border-[#1a3d2a] bg-[#080f0b] py-10 px-5 sm:px-8">

      {/* CSS star animation */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50%       { opacity: 0.7;  transform: scale(1.3); }
        }
      `}</style>

      {/* Stars */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="pointer-events-none absolute rounded-full bg-[#c7a76f]"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animation: `twinkle ${2.5 + (i % 3) * 0.5}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* Subtle radial glow centre */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(183,140,80,0.07)_0%,transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl">

        {/* Header — compact, one line */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-[#c7a76f] text-sm">✦</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c7a76f]">
              {s.eyebrow}
            </span>
            <span className="text-[#c7a76f] text-sm">✦</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-[#c7a76f]/40 to-transparent" />
          <h2 className="font-serif text-base text-white/80 italic">{s.heading}</h2>
        </div>

        {/* Cards — horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-4"
          style={{ scrollbarWidth: 'none' }}>
          {memorials.map((m) => {
            const birthYear = m.birth_date ? new Date(m.birth_date).getFullYear() : null
            const deathYear = m.death_date ? new Date(m.death_date).getFullYear() : null
            const years = birthYear && deathYear ? `${birthYear} – ${deathYear}` : birthYear ? `${birthYear}` : null

            return (
              <Link
                key={m.id}
                href={`/memorial/${m.slug}`}
                className="group relative flex w-[200px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#2a4a35] bg-[#0d1f15] transition-all duration-300 hover:border-[#c7a76f]/50 hover:shadow-[0_0_20px_rgba(199,167,111,0.12)] sm:w-auto"
              >
                {/* Photo */}
                <div className="relative h-[140px] w-full overflow-hidden bg-[#111d14]">
                  {m.cover_photo_url ? (
                    <Image
                      src={m.cover_photo_url}
                      alt={m.display_name}
                      fill
                      sizes="(max-width: 640px) 200px, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Users className="h-10 w-10 text-[#2a4a35]" />
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f15]/80 to-transparent" />

                  {/* Flag badge */}
                  {m.nationality && (
                    <div className="absolute bottom-2 right-2">
                      <img
                        src={`https://flagcdn.com/20x15/${m.nationality.toLowerCase()}.png`}
                        alt={m.nationality}
                        className="rounded-sm opacity-90 shadow-md"
                        width={20}
                        height={15}
                      />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1.5 p-3.5">
                  <div>
                    <h3 className="font-serif text-sm font-semibold leading-snug text-white group-hover:text-[#e8d5a8] transition-colors">
                      {m.display_name}
                    </h3>
                    {years && (
                      <p className="mt-0.5 text-[11px] text-[#c7a76f] font-medium">{years}</p>
                    )}
                  </div>

                  {(m.tagline || m.notable_subtitle) && (
                    <p className="line-clamp-2 text-[11px] italic leading-5 text-[#7a9e8a]">
                      {m.tagline || m.notable_subtitle}
                    </p>
                  )}

                  <div className="mt-auto pt-2 border-t border-[#1e3828]">
                    <span className="flex items-center justify-between text-[11px] font-semibold text-[#c7a76f] group-hover:text-[#e8d5a8] transition-colors">
                      {s.visit}
                      <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Footer line */}
        <div className="mt-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c7a76f]/30" />
          <p className="text-[10px] text-[#4a6a55] tracking-[0.15em] uppercase">{s.sub}</p>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c7a76f]/30" />
        </div>

      </div>
    </section>
  )
}
