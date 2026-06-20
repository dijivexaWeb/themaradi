'use client'

import { useEffect } from 'react'

export function useReveal() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      document.querySelectorAll('.tem-reveal').forEach(el => el.classList.add('is-visible'))
      document.querySelectorAll('.tem-step').forEach(el => el.classList.add('is-visible'))
      document.querySelectorAll('.tem-word').forEach((el) => {
        const e = el as HTMLElement
        e.style.animation = 'none'
        e.style.opacity = '1'
      })
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -7% 0px' }
    )

    document.querySelectorAll('.tem-reveal, .tem-step').forEach((el) => io.observe(el))

    return () => io.disconnect()
  }, [])
}
