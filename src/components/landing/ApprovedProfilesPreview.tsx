'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { RecentMemorial } from './RecentMemorialsCarousel'

const S = {
  gold: '#C9A96E',
  goldBright: '#D8BE8A',
  text: '#EDE8DD',
  textHead: '#F4F0E6',
  textMuted: 'rgba(237,232,221,.56)',
  textFaint: 'rgba(237,232,221,.38)',
  card: 'rgba(255,255,255,.025)',
  cardBorder: 'rgba(201,169,110,.13)',
  serif: 'var(--font-cormorant), Georgia, serif',
  sans: 'var(--font-outfit), system-ui, sans-serif',
}

function formatYears(birth: string | null, death: string | null) {
  const b = birth ? new Date(birth).getFullYear() : null
  const d = death ? new Date(death).getFullYear() : null
  if (b && d) return `${b} – ${d}`
  return d ? `${d}` : ''
}

export default function ApprovedProfilesPreview({
  memorials, heading, viewProfileLabel, priceHint, viewDetailsLabel,
}: {
  memorials: RecentMemorial[]
  heading: string
  viewProfileLabel: string
  priceHint: string
  viewDetailsLabel: string
}) {
  if (!memorials.length) return null

  return (
    <section style={{ padding: 'clamp(28px,5vh,48px) clamp(20px,4vw,60px) clamp(40px,6vh,64px)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div className="tem-reveal" style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontFamily: S.serif, fontWeight: 400, fontSize: 'clamp(26px,3.6vw,40px)', lineHeight: 1.1, margin: 0, color: S.textHead }}>
            {heading}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px,1fr))', gap: 20 }}>
          {memorials.slice(0, 4).map((m, i) => (
            <Link
              key={m.id}
              href={`/memorial/${m.slug}`}
              className="tem-reveal tem-card"
              style={{ transitionDelay: `${i * 90}ms`, textDecoration: 'none', borderRadius: 18, background: S.card, border: `1px solid ${S.cardBorder}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#0a0a10' }}>
                {m.cover_photo_url && (
                  <Image src={m.cover_photo_url} alt={m.display_name} fill sizes="280px" className="object-cover" />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,7,13,.85), transparent 55%)' }} />
                <div style={{ position: 'absolute', left: 14, right: 14, bottom: 12 }}>
                  <div style={{ fontFamily: S.serif, fontSize: 17, color: S.textHead, lineHeight: 1.2 }}>{m.display_name}</div>
                  {formatYears(m.birth_date, m.death_date) && (
                    <div style={{ fontSize: 11, letterSpacing: '.08em', color: S.gold, marginTop: 2, fontFamily: S.sans }}>{formatYears(m.birth_date, m.death_date)}</div>
                  )}
                </div>
              </div>
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                {m.tagline && (
                  <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.6, color: S.textMuted, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {m.tagline}
                  </p>
                )}
                <span style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, color: S.gold, fontSize: 12.5, fontFamily: S.sans }}>
                  {viewProfileLabel} <ArrowRight style={{ width: 12, height: 12 }} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 13.5, fontWeight: 300, color: S.textFaint, margin: '28px auto 0', fontFamily: S.sans }}>
          {priceHint}
        </p>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <Link href="#fiyatlar" style={{ color: S.gold, fontSize: 13.5, fontFamily: S.sans, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {viewDetailsLabel} <ArrowRight style={{ width: 13, height: 13 }} />
          </Link>
        </div>
      </div>
    </section>
  )
}
