'use client'

import Image from 'next/image'
import { Star } from 'lucide-react'

export type TestimonialMemorial = {
  id: string
  display_name: string
  slug: string
  cover_photo_url: string | null
  tagline: string | null
  birth_place: string | null
}

const S = {
  gold: '#C9A96E',
  goldBright: '#D8BE8A',
  text: '#EDE8DD',
  textHead: '#F4F0E6',
  textMuted: 'rgba(237,232,221,.56)',
  card: 'rgba(255,255,255,.025)',
  cardBorder: 'rgba(201,169,110,.13)',
  serif: 'var(--font-cormorant), Georgia, serif',
  sans: 'var(--font-outfit), system-ui, sans-serif',
}

export default function TestimonialSection({ memorials, heading }: { memorials: TestimonialMemorial[]; heading: string }) {
  if (!memorials.length) return null

  return (
    <section style={{ padding: 'clamp(20px,4vh,44px) clamp(20px,4vw,60px) clamp(48px,7vh,80px)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div className="tem-reveal" style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: S.serif, fontWeight: 400, fontSize: 'clamp(26px,3.6vw,40px)', lineHeight: 1.1, margin: 0, color: S.textHead }}>
            {heading}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 20 }}>
          {memorials.map((m, i) => (
            <div
              key={m.id}
              className="tem-reveal tem-card"
              style={{ transitionDelay: `${i * 100}ms`, padding: '28px 24px', borderRadius: 18, background: S.card, border: `1px solid ${S.cardBorder}`, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
            >
              <div style={{ width: 64, height: 64, borderRadius: '50%', marginBottom: 16, position: 'relative', overflow: 'hidden', border: `1.5px solid ${S.gold}` }}>
                {m.cover_photo_url ? (
                  <Image src={m.cover_photo_url} alt={m.display_name} fill sizes="64px" className="object-cover object-top" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,169,110,.12)', fontFamily: S.serif, fontSize: 22, color: S.goldBright }}>
                    {m.display_name.charAt(0)}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} style={{ width: 13, height: 13, fill: S.gold, stroke: S.gold }} />
                ))}
              </div>

              {m.tagline && (
                <p style={{ fontFamily: S.serif, fontStyle: 'italic', fontSize: 15, lineHeight: 1.6, color: 'rgba(237,232,221,.75)', margin: '0 0 16px' }}>
                  "{m.tagline}"
                </p>
              )}

              <div style={{ fontSize: 13.5, fontWeight: 500, color: S.text, fontFamily: S.sans, marginTop: 'auto' }}>
                — {m.display_name}{m.birth_place ? `, ${m.birth_place}` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
