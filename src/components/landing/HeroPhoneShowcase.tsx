'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLang } from '@/i18n/context'
import AddedBadge from '@/components/AddedBadge'
import type { RecentMemorial } from './RecentMemorialsCarousel'

export type HeroMemorial = RecentMemorial & { interaction_count?: number }

const S = {
  gold: '#C9A96E',
  goldGrad: 'linear-gradient(135deg, #E2C885, #C39E63)',
  serif: 'var(--font-cormorant), Georgia, serif',
  sans: 'var(--font-outfit), system-ui, sans-serif',
}

function formatYears(birth: string | null, death: string | null) {
  const b = birth ? new Date(birth).getFullYear() : null
  const d = death ? new Date(death).getFullYear() : null
  if (b && d) return `${b} — ${d}`
  if (b) return `${b}`
  return ''
}

function PhoneCard({ memorial, visitLabel, scale = 1, rotate = 0, zIndex = 1, translateY = 0 }: {
  memorial: HeroMemorial
  visitLabel: string
  scale?: number
  rotate?: number
  zIndex?: number
  translateY?: number
}) {
  const years = formatYears(memorial.birth_date, memorial.death_date)
  const count = memorial.interaction_count ?? 0

  return (
    <Link href={`/memorial/${memorial.slug}`} style={{ textDecoration: 'none', display: 'block',
      transform: `scale(${scale}) rotate(${rotate}deg) translateY(${translateY}px)`,
      transformOrigin: 'bottom center',
      zIndex,
      position: 'relative',
      transition: 'transform .3s ease',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = `scale(${scale * 1.04}) rotate(${rotate * 0.5}deg) translateY(${translateY - 6}px)` }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = `scale(${scale}) rotate(${rotate}deg) translateY(${translateY}px)` }}
    >
      {/* Phone shell */}
      <div style={{
        width: 240,
        borderRadius: 36,
        padding: 9,
        background: 'linear-gradient(160deg, #26262f, #0b0b12)',
        boxShadow: zIndex > 1
          ? '0 48px 90px -20px rgba(0,0,0,.9), 0 0 0 1px rgba(201,169,110,.22), inset 0 1px 1px rgba(255,255,255,.07)'
          : '0 28px 60px -20px rgba(0,0,0,.7), 0 0 0 1px rgba(201,169,110,.12)',
      }}>
        {/* Screen */}
        <div style={{
          borderRadius: 28,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #101c16 0%, #0b130f 50%, #0b0b11 100%)',
        }}>
          {/* Cover photo */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1.1' }}>
            {memorial.cover_photo_url ? (
              <Image
                src={memorial.cover_photo_url}
                alt={memorial.display_name}
                fill
                sizes="200px"
                className="object-cover object-top"
                unoptimized
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a2e22, #0e1810)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 40, opacity: 0.3 }}>🕊</span>
              </div>
            )}
            {/* Gradient overlay bottom */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,19,15,1) 0%, rgba(11,19,15,0.3) 50%, transparent 100%)' }} />
            <AddedBadge date={memorial.published_at} className="absolute left-2 top-2 z-10" />
            {/* Name over photo */}
            <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}>
              <div style={{ fontFamily: S.serif, fontSize: 17, fontWeight: 500, color: '#F4F0E6', lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,.6)' }}>
                {memorial.display_name}
              </div>
              {years && (
                <div style={{ fontSize: 10, letterSpacing: '.12em', color: S.gold, marginTop: 3, fontFamily: S.sans }}>
                  {years}
                </div>
              )}
            </div>
          </div>

          {/* Bottom info */}
          <div style={{ padding: '10px 12px 14px' }}>
            {memorial.tagline && (
              <div style={{ fontSize: 10, color: 'rgba(237,232,221,.5)', fontFamily: S.sans, marginBottom: 10, lineHeight: 1.4, fontStyle: 'italic' }}>
                {memorial.tagline}
              </div>
            )}

            {/* Action bar */}
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'rgba(255,255,255,.04)', borderRadius: 8, padding: '6px 4px' }}>
                <span style={{ fontSize: 14 }}>🕯</span>
                <span style={{ fontSize: 9, color: 'rgba(237,232,221,.45)', fontFamily: S.sans }}>{Math.max(12, count)}</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'rgba(255,255,255,.04)', borderRadius: 8, padding: '6px 4px' }}>
                <span style={{ fontSize: 14 }}>🌸</span>
                <span style={{ fontSize: 9, color: 'rgba(237,232,221,.45)', fontFamily: S.sans }}>{Math.max(8, Math.round(count * 0.7))}</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'rgba(255,255,255,.04)', borderRadius: 8, padding: '6px 4px' }}>
                <span style={{ fontSize: 14 }}>🙏</span>
                <span style={{ fontSize: 9, color: 'rgba(237,232,221,.45)', fontFamily: S.sans }}>{Math.max(5, Math.round(count * 0.55))}</span>
              </div>
            </div>

            {/* Visit hint */}
            <div style={{
              marginTop: 8, textAlign: 'center',
              background: S.goldGrad, color: '#14110a',
              fontSize: 10, fontWeight: 600, padding: '7px 0',
              borderRadius: 999, fontFamily: S.sans,
            }}>
              {visitLabel}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function HeroPhoneShowcase({ memorials }: { memorials: HeroMemorial[] }) {
  const { t } = useLang()
  const visitLabel = t.landing.misc.heroVisitCta
  const [left, center, right] = [
    memorials[1] ?? memorials[0],
    memorials[0],
    memorials[2] ?? memorials[0],
  ]

  if (!left) return null

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 0, height: 560 }}>

      {/* Halo glow */}
      <div className="tem-animate-haloPulse" style={{
        position: 'absolute', inset: -40,
        background: 'radial-gradient(circle, rgba(201,169,110,.14), rgba(201,169,110,0) 64%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      {/* Left phone — mobilde gizli */}
      <div className="hidden sm:block" style={{ marginRight: -30 }}>
        <PhoneCard memorial={left} visitLabel={visitLabel} scale={0.78} rotate={-8} zIndex={1} translateY={20} />
      </div>

      {/* Center phone — big, upright, float animation */}
      <div className="tem-animate-floatY" style={{ zIndex: 3, position: 'relative' }}>
        <PhoneCard memorial={center} visitLabel={visitLabel} scale={1} rotate={0} zIndex={3} />
      </div>

      {/* Right phone — mobilde gizli */}
      <div className="hidden sm:block" style={{ marginLeft: -30 }}>
        <PhoneCard memorial={right} visitLabel={visitLabel} scale={0.78} rotate={8} zIndex={1} translateY={20} />
      </div>

      {/* Bottom reflection */}
      <div style={{
        position: 'absolute', bottom: -20, left: '10%', right: '10%', height: 40,
        background: 'radial-gradient(ellipse, rgba(201,169,110,.15), transparent 70%)',
        filter: 'blur(12px)', pointerEvents: 'none',
      }} />
    </div>
  )
}
