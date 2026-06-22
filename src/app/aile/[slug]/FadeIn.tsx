'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  children: React.ReactNode
  delay?: number      // ms
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
}

export default function FadeIn({ children, delay = 0, direction = 'up', className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const translate = {
    up:    'translateY(24px)',
    down:  'translateY(-24px)',
    left:  'translateX(24px)',
    right: 'translateX(-24px)',
    none:  'none',
  }[direction]

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : translate,
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
