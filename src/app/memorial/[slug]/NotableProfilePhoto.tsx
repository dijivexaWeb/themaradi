'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

interface Props {
  src: string
  alt: string
  initial: string
}

function DiamondOrnament() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 0 L12.5 9 L9 18 L5.5 9 Z" fill="#dfbd72" opacity="0.95" />
      <path d="M0 9 L9 5.5 L18 9 L9 12.5 Z" fill="#c7a76f" opacity="0.85" />
      <circle cx="9" cy="9" r="2.5" fill="#f5e08a" />
    </svg>
  )
}

export default function NotableProfilePhoto({ src, alt, initial }: Props) {
  const [objectPos, setObjectPos] = useState('center 20%')

  useEffect(() => {
    if (!src) return
    const img = new window.Image()
    img.onload = () => {
      const ratio = img.naturalHeight / img.naturalWidth
      setObjectPos(ratio > 1.2 ? 'center 20%' : 'center center')
    }
    img.src = src
  }, [src])

  return (
    <div className="relative mx-auto" style={{ width: 'fit-content' }}>
      {/* Outer conic-gradient gold ring + glow */}
      <div
        className="m-3 relative rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, #f5e08a 0%, #8b6914 20%, #dfbd72 40%, #f0d060 60%, #8b6914 80%, #f5e08a 100%)',
          padding: '3px',
          boxShadow: '0 0 0 1px rgba(223,189,114,0.3), 0 0 28px rgba(223,189,114,0.55), 0 0 55px rgba(199,167,111,0.25), 0 24px 70px rgba(0,0,0,0.55)',
        }}
      >
        {/* Dark separator */}
        <div className="rounded-full bg-[#091712]" style={{ padding: '2px' }}>
          {/* Inner gradient ring */}
          <div
            className="rounded-full"
            style={{
              background: 'linear-gradient(135deg, #f0d472 0%, #8b6914 35%, #dfbd72 65%, #f0d472 100%)',
              padding: '2px',
            }}
          >
            {src ? (
              <div className="relative h-[200px] w-[200px] overflow-hidden rounded-full bg-[#0c3327] sm:h-[280px] sm:w-[280px]">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  priority
                  sizes="280px"
                  className="object-cover"
                  style={{ objectPosition: objectPos }}
                  unoptimized
                />
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
              </div>
            ) : (
              <div className="flex h-[200px] w-[200px] items-center justify-center rounded-full bg-[#091712] sm:h-[280px] sm:w-[280px]">
                <span className="text-7xl font-bold text-[#c7a76f]/40">{initial}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cardinal diamond ornaments — sit at ring edge */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        <DiamondOrnament />
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rotate-180">
        <DiamondOrnament />
      </div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90">
        <DiamondOrnament />
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 rotate-90">
        <DiamondOrnament />
      </div>

      {/* Diagonal accent dots at 45° positions */}
      {[
        'top-[8%] right-[8%]',
        'top-[8%] left-[8%]',
        'bottom-[8%] right-[8%]',
        'bottom-[8%] left-[8%]',
      ].map((pos) => (
        <div key={pos} className={`absolute ${pos}`}>
          <div className="h-2 w-2 rounded-full bg-[#dfbd72] opacity-70 shadow-[0_0_4px_rgba(223,189,114,0.6)]" />
        </div>
      ))}
    </div>
  )
}
