import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: '40px',
          background: '#f4eee3',
          border: '6px solid #c7a76f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 40 40"
          width={120}
          height={120}
          fill="none"
        >
          <path d="M 20 28 C 18 25 18 20.5 20 17 C 22 20.5 22 25 20 28 Z" fill="#173d31" opacity="0.75" transform="rotate(-52, 20, 28)" />
          <path d="M 20 28 C 18 25 18 20.5 20 17 C 22 20.5 22 25 20 28 Z" fill="#173d31" opacity="0.75" transform="rotate(52, 20, 28)" />
          <path d="M 20 28 C 17.5 24 17.5 16 20 12 C 22.5 16 22.5 24 20 28 Z" fill="#173d31" opacity="0.9" transform="rotate(-24, 20, 28)" />
          <path d="M 20 28 C 17.5 24 17.5 16 20 12 C 22.5 16 22.5 24 20 28 Z" fill="#173d31" opacity="0.9" transform="rotate(24, 20, 28)" />
          <path d="M 20 28 C 17 24 17 13 20 8 C 23 13 23 24 20 28 Z" fill="#173d31" />
          <path d="M 20 27 C 19 24 19 16 20 12 C 21 16 21 24 20 27 Z" fill="#c7a76f" opacity="0.85" />
          <path d="M 11 30.5 Q 20 33 29 30.5" stroke="#c7a76f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
