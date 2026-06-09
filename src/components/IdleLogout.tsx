'use client'

import { useEffect, useRef } from 'react'

type IdleLogoutProps = {
  readonly timeoutMs?: number
  readonly signoutPath: string
  readonly redirectPath: string
}

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'] as const

export default function IdleLogout({
  timeoutMs = DEFAULT_TIMEOUT_MS,
  signoutPath,
  redirectPath,
}: IdleLogoutProps) {
  const timerRef = useRef<number | null>(null)
  const signingOutRef = useRef(false)

  useEffect(() => {
    async function signOut() {
      if (signingOutRef.current) return
      signingOutRef.current = true

      try {
        await fetch(signoutPath, {
          method: 'POST',
          credentials: 'same-origin',
        })
      } finally {
        window.location.assign(redirectPath)
      }
    }

    function resetTimer() {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        void signOut()
      }, timeoutMs)
    }

    resetTimer()
    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, resetTimer, { passive: true })
    }

    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, resetTimer)
      }
    }
  }, [redirectPath, signoutPath, timeoutMs])

  return null
}
