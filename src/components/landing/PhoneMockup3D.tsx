'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'

export default function PhoneMockup3D() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const wrap = wrapRef.current
    const card = cardRef.current
    const glare = glareRef.current
    if (reduce || !wrap || !card) return

    function onMove(e: MouseEvent) {
      const r = wrap!.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      card!.style.transform = `perspective(1200px) rotateY(${(px * 14).toFixed(2)}deg) rotateX(${(-py * 14).toFixed(2)}deg)`
      if (glare) {
        glare.style.background = `radial-gradient(circle at ${((px + 0.5) * 100).toFixed(1)}% ${((py + 0.5) * 100).toFixed(1)}%, rgba(232,201,122,.26), rgba(232,201,122,0) 55%)`
      }
    }
    function onLeave() {
      card!.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg)'
      if (glare) glare.style.background = 'radial-gradient(circle at 50% 30%, rgba(232,201,122,.1), rgba(232,201,122,0) 55%)'
    }

    wrap.addEventListener('mousemove', onMove)
    wrap.addEventListener('mouseleave', onLeave)
    return () => {
      wrap.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      style={{ position: 'relative', perspective: 1200 }}
    >
      {/* Halo */}
      <div className="tem-animate-haloPulse" style={{
        position: 'absolute', inset: -36,
        background: 'radial-gradient(circle, rgba(201,169,110,.18), rgba(201,169,110,0) 64%)',
        filter: 'blur(34px)',
        pointerEvents: 'none',
      }} />

      {/* Float wrapper */}
      <div className="tem-animate-floatY">
        {/* 3D tilt card */}
        <div
          ref={cardRef}
          style={{
            position: 'relative',
            width: 296,
            transformStyle: 'preserve-3d',
            transition: 'transform .55s cubic-bezier(.2,.7,.2,1)',
            willChange: 'transform',
          }}
        >
          {/* Phone shell */}
          <div style={{
            position: 'relative', borderRadius: 46, padding: 11,
            background: 'linear-gradient(160deg, #26262f, #0b0b12)',
            boxShadow: '0 56px 100px -34px rgba(0,0,0,.85), inset 0 1px 1px rgba(255,255,255,.07)',
            border: '1px solid rgba(201,169,110,.2)',
          }}>
            {/* Glare */}
            <div ref={glareRef} style={{
              position: 'absolute', inset: 11, borderRadius: 36,
              zIndex: 5, pointerEvents: 'none',
              background: 'radial-gradient(circle at 50% 30%, rgba(232,201,122,.1), rgba(232,201,122,0) 55%)',
            }} />

            {/* Screen */}
            <div style={{
              borderRadius: 36, overflow: 'hidden',
              background: 'linear-gradient(180deg, #101c16 0%, #0b130f 52%, #0b0b11 100%)',
              padding: '28px 20px 18px',
            }}>
              {/* Header label */}
              <div style={{
                textAlign: 'center',
                fontSize: 9.5, letterSpacing: '.3em', textTransform: 'uppercase',
                color: 'rgba(201,169,110,.62)', marginBottom: 16,
                fontFamily: 'var(--font-outfit), sans-serif',
              }}>
                Sevgiyle Anıyoruz
              </div>

              {/* Profile photo */}
              <div style={{ width: 98, height: 98, borderRadius: '50%', margin: '0 auto 14px', padding: 3, background: 'linear-gradient(135deg, #E2C885, #97794a)' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
                  <Image
                    src="/images/landing/profile-ahmet.png"
                    alt="Ahmet Yılmaz"
                    fill
                    sizes="98px"
                    className="object-cover object-top"
                  />
                </div>
              </div>

              {/* Name & years */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 25, fontWeight: 500, color: '#F4F0E6' }}>
                  Ahmet Yılmaz
                </div>
                <div style={{ fontSize: 11.5, letterSpacing: '.14em', color: '#C9A96E', margin: '4px 0 13px', fontFamily: 'var(--font-outfit), sans-serif' }}>
                  1940 — 2020
                </div>
                <div style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontStyle: 'italic', fontSize: 14.5, lineHeight: 1.45,
                  color: 'rgba(237,232,221,.6)', padding: '0 8px',
                }}>
                  &ldquo;Sevgiyle hatırlanmak, ölümsüzlüğün en güzel hâlidir.&rdquo;
                </div>
              </div>

              {/* Tabs */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                margin: '18px 4px 13px', paddingBottom: 12,
                borderBottom: '1px solid rgba(201,169,110,.12)',
                fontFamily: 'var(--font-outfit), sans-serif',
              }}>
                <span style={{ fontSize: 9.5, color: '#D8BE8A', borderBottom: '1.5px solid #C9A96E', paddingBottom: 4 }}>Hayatı</span>
                <span style={{ fontSize: 9.5, color: 'rgba(237,232,221,.38)' }}>Fotoğraflar</span>
                <span style={{ fontSize: 9.5, color: 'rgba(237,232,221,.38)' }}>Videolar</span>
                <span style={{ fontSize: 9.5, color: 'rgba(237,232,221,.38)' }}>66 Anı</span>
              </div>

              {/* Photo grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 16 }}>
                {[
                  '/images/landing/profile-family-old.png',
                  '/images/landing/profile-family-dinner.png',
                  '/images/landing/profile-family-main.png',
                ].map((src, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 9, overflow: 'hidden', position: 'relative', background: '#101017' }}>
                    <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'linear-gradient(135deg, #E2C885, #C39E63)',
                color: '#14110a', textAlign: 'center',
                fontSize: 12.5, fontWeight: 500,
                padding: 11, borderRadius: 999,
                fontFamily: 'var(--font-outfit), sans-serif',
              }}>
                🕯 Bir mum yak
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
