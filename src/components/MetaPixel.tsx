'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

export default function MetaPixel() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    if (!PIXEL_ID) return
    const fbq = (window as any).fbq
    if (!fbq) return

    const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    if (currentPath === lastTrackedPath.current) return
    lastTrackedPath.current = currentPath

    // 1. Track PageView on route change (since default FB snippet runs once, we trigger manually on SPA navigations)
    fbq('track', 'PageView')

    // 2. Track InitiateCheckout on checkout pages
    if (
      pathname.startsWith('/satin-al/kasa') ||
      pathname.startsWith('/satin-al/anma') ||
      pathname.startsWith('/satin-al/aile')
    ) {
      fbq('track', 'InitiateCheckout')
    }

    // 3. Track Purchase on successful redirects (indicated by ?purchased=1)
    if (searchParams?.get('purchased') === '1') {
      let value = 0
      let content_name = 'Purchase'

      if (pathname.includes('/anma-paneli')) {
        content_name = 'Memorial Profile'
        value = 100 // Fallback price in GEL
      } else if (pathname.includes('/dashboard/vault')) {
        content_name = 'Life Vault'
        value = 150 // Fallback setup price in GEL
      } else if (pathname.includes('/aile')) {
        content_name = 'Family Package'
        value = 250 // Fallback family package price in GEL
      }

      fbq('track', 'Purchase', {
        value: value,
        currency: 'GEL',
        content_name: content_name,
      })
    }
  }, [pathname, searchParams])

  if (!PIXEL_ID) return null

  return (
    <>
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}
