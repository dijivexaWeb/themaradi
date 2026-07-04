'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import MetaPixel from './MetaPixel'

const STORAGE_KEY = 'tm_cookie_consent'
export const CONSENT_CHANGED_EVENT = 'tm-cookie-consent-changed'

export default function AnalyticsConsentGate() {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    function check() {
      try {
        setConsented(window.localStorage.getItem(STORAGE_KEY) === 'all')
      } catch {
        setConsented(false)
      }
    }
    check()
    window.addEventListener(CONSENT_CHANGED_EVENT, check)
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, check)
  }, [])

  if (!consented) return null

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-LX3BRV79MJ"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-LX3BRV79MJ');
      `}</Script>
      <MetaPixel />
    </>
  )
}
