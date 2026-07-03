import { PREFIXED_LOCALES } from './localizedHref'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

// Bir sayfa için alternates.languages haritası üretir — sadece dil önek
// kapsamındaki (pazarlama/satış) sayfalarda kullanılmalı.
export function buildAlternateLanguages(path: string): Record<string, string> {
  const normalized = path === '/' ? '' : path
  const languages: Record<string, string> = {
    tr: `${APP_URL}${normalized || '/'}`,
    'x-default': `${APP_URL}${normalized || '/'}`,
  }
  for (const locale of PREFIXED_LOCALES) {
    languages[locale] = `${APP_URL}/${locale}${normalized}`
  }
  return languages
}
