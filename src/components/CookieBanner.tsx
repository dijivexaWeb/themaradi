'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'tm_cookie_consent'

type Consent = 'all' | 'essential'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      // localStorage erişilemez (SSR / private mode)
    }
  }, [])

  function save(choice: Consent) {
    try {
      localStorage.setItem(STORAGE_KEY, choice)
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e6dccb] bg-[#fbf8f1]/97 px-5 py-4 shadow-lg backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-[#4c463c]">
          Oturum yönetimi için zorunlu çerezler kullanıyoruz. QR tarama analitikleri için isteğe bağlı
          çerezler de mevcuttur.{' '}
          <Link href="/cookies" className="font-semibold text-[#9a7132] underline-offset-2 hover:underline">
            Çerez Politikası
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => save('essential')}
            className="rounded-lg border border-[#c7a76f] px-4 py-2 text-sm font-semibold text-[#173d31] transition hover:bg-[#f4eee3]"
          >
            Yalnızca zorunlu
          </button>
          <button
            onClick={() => save('all')}
            className="rounded-lg bg-[#103b2c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b2b20]"
          >
            Tümünü kabul et
          </button>
        </div>
      </div>
    </div>
  )
}
