import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'The Eternal Memory — Where memories never fade.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a120e 0%, #0f1a14 50%, #0b0b12 100%)',
          position: 'relative',
        }}
      >
        {/* Gold glow */}
        <div style={{
          position: 'absolute',
          top: '20%', left: '30%', right: '30%',
          height: 300,
          background: 'radial-gradient(ellipse, rgba(201,169,110,0.15), transparent 70%)',
          filter: 'blur(40px)',
          display: 'flex',
        }} />

        {/* Top line */}
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.6), transparent)',
          display: 'flex',
        }} />

        {/* Logo mark */}
        <div style={{
          fontSize: 48, marginBottom: 24,
          display: 'flex',
        }}>🕊</div>

        {/* Site name */}
        <div style={{
          fontSize: 52,
          fontWeight: 400,
          color: '#F4F0E6',
          letterSpacing: '-0.01em',
          marginBottom: 16,
          display: 'flex',
        }}>
          The Eternal Memory
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 24,
          fontWeight: 300,
          color: '#C9A96E',
          letterSpacing: '0.06em',
          marginBottom: 40,
          display: 'flex',
        }}>
          WHERE MEMORIES NEVER FADE
        </div>

        {/* Divider */}
        <div style={{
          width: 80, height: 1,
          background: 'rgba(201,169,110,0.4)',
          marginBottom: 32,
          display: 'flex',
        }} />

        {/* Description */}
        <div style={{
          fontSize: 18,
          fontWeight: 300,
          color: 'rgba(237,232,221,0.6)',
          textAlign: 'center',
          maxWidth: 700,
          lineHeight: 1.6,
          display: 'flex',
        }}>
          Dijital anma profilleri · QR mezar taşı · Aile mirası
        </div>

        {/* Bottom line */}
        <div style={{
          position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.6), transparent)',
          display: 'flex',
        }} />

        {/* Domain */}
        <div style={{
          position: 'absolute', bottom: 24,
          fontSize: 15, color: 'rgba(201,169,110,0.5)',
          letterSpacing: '0.1em',
          display: 'flex',
        }}>
          theeternalmemory.com
        </div>
      </div>
    ),
    { ...size }
  )
}
