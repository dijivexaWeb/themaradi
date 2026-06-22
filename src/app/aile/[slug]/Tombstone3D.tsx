'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Props {
  displayName: string
  slug: string | null
  coverPhotoUrl: string | null
  years: string
  viewLabel: string
}

export default function Tombstone3D({ displayName, slug, coverPhotoUrl, years, viewLabel }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [glowing, setGlowing] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePos({ x, y })
    setRotate({ x: -(y - 0.5) * 16, y: (x - 0.5) * 16 })
  }

  const href = slug ? `/memorial/${slug}` : '#'

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setGlowing(true)}
      onMouseLeave={() => { setRotate({ x: 0, y: 0 }); setGlowing(false) }}
      style={{ perspective: '900px' }}
      className="relative cursor-pointer w-full"
    >
      <Link href={href} tabIndex={-1} aria-hidden>
        <div
          style={{
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
            transition: glowing ? 'transform 0.08s ease-out' : 'transform 0.6s ease-out',
            transformStyle: 'preserve-3d',
          }}
          className="relative select-none"
        >
          {/* ── Glow halo ── */}
          <div
            className="absolute pointer-events-none transition-opacity duration-500"
            style={{
              inset: '-8px',
              borderRadius: '50% 50% 12px 12px / 35% 35% 12px 12px',
              opacity: glowing ? 0.7 : 0,
              background: `radial-gradient(ellipse at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(60,180,100,0.4) 0%, transparent 65%)`,
              filter: 'blur(16px)',
            }}
          />

          {/* ── Stone body ── */}
          <div
            className="relative overflow-hidden"
            style={{
              borderRadius: '50% 50% 10px 10px / 32% 32% 10px 10px',
              background: 'linear-gradient(170deg, #253b2a 0%, #14201a 25%, #1c2d22 55%, #0e1812 100%)',
              boxShadow: glowing
                ? '0 24px 80px rgba(0,0,0,0.85), 0 0 40px rgba(50,150,80,0.2), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.4)'
                : '0 16px 60px rgba(0,0,0,0.75), 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
              minHeight: '340px',
            }}
          >
            {/* Fine stone grain */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='3' height='3'%3E%3Crect width='1' height='1' fill='%23ffffff' opacity='0.03'/%3E%3C/svg%3E")`,
                opacity: 0.8,
              }} />

            {/* Specular highlight (tracks mouse) */}
            <div
              className="absolute top-0 inset-x-0 pointer-events-none transition-opacity duration-300"
              style={{
                height: '50%',
                background: `radial-gradient(ellipse 80% 60% at ${mousePos.x * 100}% -10%, rgba(255,255,255,0.07) 0%, transparent 70%)`,
                opacity: glowing ? 1 : 0.6,
              }}
            />

            {/* ── Top arch ornament — neutral ── */}
            <div className="flex flex-col items-center pt-7 pb-2 gap-1.5">
              <div className="w-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="w-5 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
            </div>

            {/* ── Photo medallion ── */}
            <div className="flex justify-center mt-1 mb-4">
              <div
                className="relative"
                style={{
                  width: 88, height: 88,
                  borderRadius: '50%',
                  padding: 3,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 100%)',
                  boxShadow: `0 0 0 1px rgba(255,255,255,0.10), 0 6px 24px rgba(0,0,0,0.6), ${glowing ? '0 0 24px rgba(60,180,100,0.3)' : ''}`,
                  transition: 'box-shadow 0.3s ease',
                }}
              >
                {/* Inner ring */}
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{ inset: 5, border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <div className="w-full h-full rounded-full overflow-hidden"
                  style={{ boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.6)' }}>
                  {coverPhotoUrl ? (
                    <Image
                      src={coverPhotoUrl} alt={displayName}
                      width={82} height={82}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-3xl font-serif font-light"
                      style={{ background: 'linear-gradient(135deg, #1a2a1e, #0f1a12)' }}>
                      {displayName?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Decorative rule ── */}
            <div className="mx-6 flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/12" />
              <span className="text-[8px] text-white/15">✦</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/12" />
            </div>

            {/* ── Name & years ── */}
            <div className="px-5 pb-7 text-center flex flex-col items-center gap-1.5">
              <p
                className="font-serif text-sm font-light leading-snug text-white/85 tracking-wide"
                style={{ textShadow: '0 1px 12px rgba(0,0,0,0.9)' }}
              >
                {displayName}
              </p>
              {years && (
                <p className="text-[11px] tracking-[0.22em] text-white/30 font-light mt-0.5">{years}</p>
              )}

              {/* Bottom rule */}
              <div className="mx-4 flex items-center gap-2 mt-2 w-full">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
              </div>

              {/* CTA */}
              <span
                className="mt-2 text-[9px] font-bold tracking-[0.22em] uppercase transition-all duration-300"
                style={{ color: glowing ? 'rgba(100,220,140,0.8)' : 'rgba(255,255,255,0.18)' }}
              >
                {viewLabel}
              </span>
            </div>
          </div>

          {/* ── Ground / pedestal ── */}
          <div className="mx-auto" style={{ width: '75%', height: 10, background: 'linear-gradient(180deg, rgba(20,32,22,0.9), rgba(8,15,11,0.6))', borderRadius: '0 0 6px 6px' }} />
          <div className="mx-auto" style={{ width: '88%', height: 6, background: 'linear-gradient(180deg, rgba(8,15,11,0.4), transparent)', borderRadius: '0 0 4px 4px' }} />
        </div>
      </Link>
    </div>
  )
}
