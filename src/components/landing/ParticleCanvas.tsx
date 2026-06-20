'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number; r: number; s: number
  dx: number; ph: number; tw: number
  hue: string
}

export default function ParticleCanvas({ count = 56 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId: number
    let w = 0, h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      w = canvas.width = Math.max(1, Math.round(rect.width * dpr))
      h = canvas.height = Math.max(1, Math.round(rect.height * dpr))
    }
    resize()
    window.addEventListener('resize', resize)

    const N = Math.max(0, count)
    const particles: Particle[] = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 1.4 + 0.4) * dpr,
      s: (Math.random() * 0.26 + 0.05) * dpr,
      dx: (Math.random() - 0.5) * 0.16 * dpr,
      ph: Math.random() * 6.28,
      tw: Math.random() * 0.016 + 0.004,
      hue: Math.random() < 0.5 ? '201,169,110' : '232,201,122',
    }))

    function loop() {
      if (!ctx) return
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.y -= p.s
        p.x += Math.sin(p.ph) * 0.22 * dpr + p.dx
        p.ph += p.tw
        if (p.y < -12) { p.y = h + 12; p.x = Math.random() * w }
        if (p.x < -12) p.x = w + 12
        if (p.x > w + 12) p.x = -12
        const a = Math.max(0, 0.36 + Math.sin(p.ph) * 0.32)
        const rr = p.r * 7
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr)
        g.addColorStop(0, `rgba(${p.hue},${a})`)
        g.addColorStop(1, `rgba(${p.hue},0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, rr, 0, 6.2832)
        ctx.fill()
      }
      rafId = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none',
      }}
    />
  )
}
