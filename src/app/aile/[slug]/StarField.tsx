'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  r: number
  opacity: number
  speed: number
  phase: number
  twinkleSpeed: number
  shootX?: number
  shootY?: number
  shooting?: boolean
  shootProgress?: number
}

export default function StarField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    let stars: Star[] = []
    let shootingStars: Star[] = []
    let lastShoot = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      initStars()
    }

    const initStars = () => {
      const count = Math.floor((canvas.width * canvas.height) / 4000)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.3 + 0.05,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.008 + 0.003,
      }))
    }

    const addShootingStar = () => {
      const startX = Math.random() * canvas.width * 0.8
      const startY = Math.random() * canvas.height * 0.4
      shootingStars.push({
        x: startX,
        y: startY,
        r: 1.5,
        opacity: 1,
        speed: 4 + Math.random() * 3,
        phase: 0,
        twinkleSpeed: 0,
        shootX: startX + (80 + Math.random() * 120),
        shootY: startY + (40 + Math.random() * 60),
        shooting: true,
        shootProgress: 0,
      })
    }

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 1

      // Regular stars
      for (const star of stars) {
        star.phase += star.twinkleSpeed
        const opacity = star.opacity * (0.6 + 0.4 * Math.sin(star.phase))
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${opacity})`
        ctx.fill()
      }

      // Shooting stars
      const now = Date.now()
      if (now - lastShoot > 2500 + Math.random() * 3000) {
        addShootingStar()
        lastShoot = now
      }

      shootingStars = shootingStars.filter(s => (s.shootProgress ?? 0) < 1)
      for (const s of shootingStars) {
        s.shootProgress = (s.shootProgress ?? 0) + 0.025
        const p = s.shootProgress
        const cx = s.x + (s.shootX! - s.x) * p
        const cy = s.y + (s.shootY! - s.y) * p
        const fade = p < 0.5 ? p * 2 : (1 - p) * 2
        const tailLen = 60

        const angle = Math.atan2(s.shootY! - s.y, s.shootX! - s.x)
        const grad = ctx.createLinearGradient(
          cx - Math.cos(angle) * tailLen, cy - Math.sin(angle) * tailLen,
          cx, cy
        )
        grad.addColorStop(0, `rgba(255,255,255,0)`)
        grad.addColorStop(1, `rgba(255,255,255,${fade * 0.8})`)

        ctx.beginPath()
        ctx.moveTo(cx - Math.cos(angle) * tailLen, cy - Math.sin(angle) * tailLen)
        ctx.lineTo(cx, cy)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Head glow
        ctx.beginPath()
        ctx.arc(cx, cy, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${fade})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    draw()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className ?? 'absolute inset-0 w-full h-full pointer-events-none'}
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
