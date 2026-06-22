'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLang } from '@/i18n/context'

const S = {
  gold: '#C9A96E',
  goldBright: '#D8BE8A',
  serif: 'var(--font-cormorant), Georgia, serif',
  sans: 'var(--font-outfit), system-ui, sans-serif',
  textMuted: 'rgba(237,232,221,.56)',
  card: 'rgba(255,255,255,.025)',
  cardBorder: 'rgba(201,169,110,.13)',
}

export default function TeamSection() {
  const { t } = useLang()
  const tm = t.landing.team

  return (
    <section style={{ padding: 'clamp(60px,9vh,110px) clamp(20px,4vw,60px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Label + Heading */}
        <div className="tem-reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11.5, letterSpacing: '.36em', textTransform: 'uppercase', color: S.gold, fontWeight: 300, marginBottom: 16, fontFamily: S.sans }}>
            {tm.label}
          </div>
          <h2 style={{ fontFamily: S.serif, fontWeight: 400, fontSize: 'clamp(30px,4vw,50px)', lineHeight: 1.08, margin: '0 0 20px', color: '#F4F0E6' }}>
            {tm.heading}
          </h2>
          <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.7, color: S.textMuted, maxWidth: 560, margin: '0 auto', fontFamily: S.sans }}>
            {tm.intro}
          </p>
        </div>

        {/* Founder quote */}
        <div className="tem-reveal" style={{
          maxWidth: 680, margin: '0 auto 56px',
          padding: '28px 36px',
          borderRadius: 18,
          background: S.card,
          border: `1px solid ${S.cardBorder}`,
          textAlign: 'center',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', left: 0, top: '20%', bottom: '20%',
            width: 3, borderRadius: 2,
            background: `linear-gradient(to bottom, transparent, ${S.gold}, transparent)`,
          }} />
          <p style={{
            fontFamily: S.serif, fontStyle: 'italic',
            fontSize: 'clamp(17px,1.6vw,21px)', lineHeight: 1.6,
            color: '#F4F0E6', margin: '0 0 14px',
          }}>
            {tm.quote}
          </p>
          <p style={{ fontSize: 13, color: S.gold, fontFamily: S.sans, fontWeight: 300, margin: 0, letterSpacing: '.04em' }}>
            {tm.quoteAuthor}
          </p>
        </div>

        {/* Team grid — 2 cols mobile, 5 cols desktop */}
        <div className="tem-reveal grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-5">
          {tm.members.map((member, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              textAlign: 'center', gap: 12,
              padding: '24px 12px',
              borderRadius: 16,
              background: S.card,
              border: `1px solid rgba(201,169,110,${i === 0 ? '.25' : '.1'})`,
            }}>
              {/* Photo */}
              <div style={{
                width: 72, height: 72,
                borderRadius: '50%',
                overflow: 'hidden',
                border: `2px solid rgba(201,169,110,${i === 0 ? '.5' : '.2'})`,
                background: 'rgba(201,169,110,.06)',
                position: 'relative',
                flexShrink: 0,
              }}>
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="72px"
                    className="object-cover object-top"
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,.35)" strokeWidth="1.2">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Name & role */}
              <div>
                <div style={{ fontFamily: S.serif, fontSize: 15, fontWeight: 500, color: '#F4F0E6', marginBottom: 4, lineHeight: 1.3 }}>
                  {member.name}
                </div>
                <div style={{ fontSize: 11.5, color: S.gold, fontFamily: S.sans, fontWeight: 300, letterSpacing: '.03em' }}>
                  {member.role}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Read story link */}
        <div className="tem-reveal" style={{ textAlign: 'center', marginTop: 36 }}>
          <Link href="/about" style={{
            fontSize: 14.5, color: S.goldBright, fontFamily: S.sans,
            fontWeight: 300, textDecoration: 'none', letterSpacing: '.04em',
            borderBottom: `1px solid rgba(216,190,138,.3)`, paddingBottom: 2,
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#F4F0E6')}
            onMouseLeave={e => (e.currentTarget.style.color = S.goldBright)}
          >
            {tm.readStory}
          </Link>
        </div>

      </div>
    </section>
  )
}
