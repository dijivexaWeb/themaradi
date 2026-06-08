'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: { sitekey: string; theme?: 'light' | 'dark' | 'auto' }
      ) => string
      remove: (widgetId: string) => void
    }
  }
}

export default function TurnstileWidget({ siteKey }: { siteKey: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!siteKey) return
    mountedRef.current = true

    function renderWidget() {
      if (!containerRef.current || !mountedRef.current || !window.turnstile) return
      if (widgetIdRef.current) return
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'auto',
      })
    }

    if (window.turnstile) {
      renderWidget()
    } else {
      const scriptId = 'cf-turnstile-script'
      const existing = document.getElementById(scriptId)
      if (!existing) {
        const script = document.createElement('script')
        script.id = scriptId
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        script.async = true
        script.addEventListener('load', renderWidget)
        document.head.appendChild(script)
      } else {
        // Script already being loaded — poll until available
        const interval = setInterval(() => {
          if (window.turnstile) {
            clearInterval(interval)
            renderWidget()
          }
        }, 100)
        return () => clearInterval(interval)
      }
    }

    return () => {
      mountedRef.current = false
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current) } catch {}
        widgetIdRef.current = null
      }
    }
  }, [siteKey])

  if (!siteKey) return null
  return <div ref={containerRef} className="mt-3" />
}
