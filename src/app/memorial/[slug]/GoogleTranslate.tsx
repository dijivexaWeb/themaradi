'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: { translate?: { TranslateElement?: new (opts: object, id: string) => void } }
  }
}

export default function GoogleTranslate() {
  useEffect(() => {
    // Hide Google Translate banner + body offset
    const style = document.createElement('style')
    style.id = 'gt-hide'
    style.textContent = `
      .goog-te-banner-frame { display: none !important; }
      .skiptranslate { display: none !important; }
      body { top: 0 !important; }
      #google_translate_element { display: none !important; }
      .goog-text-highlight { background: none !important; box-shadow: none !important; }
      font { background: transparent !important; }
    `
    if (!document.getElementById('gt-hide')) {
      document.head.appendChild(style)
    }

    window.googleTranslateElementInit = () => {
      new window.google!.translate!.TranslateElement!({
        pageLanguage: 'tr',
        includedLanguages: 'tr,ka,ru,en,hy',
        autoDisplay: false,
      }, 'google_translate_element')
    }

    if (!document.getElementById('gt-script')) {
      const script = document.createElement('script')
      script.id = 'gt-script'
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.head.appendChild(script)
    }
  }, [])

  return <div id="google_translate_element" />
}
