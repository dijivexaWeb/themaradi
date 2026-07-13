import { PREFIXED_LOCALES } from './localizedHref'
import type { Lang } from '@/i18n'

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

// Verilen dil için o dile ait GERÇEK URL'i döner (tr → öneksiz, diğerleri → /xx önekli).
// generateMetadata()'da canonical, ziyaret edilen dilin kendi URL'ine işaret etsin diye kullanılır.
export function buildCanonical(lang: Lang, path: string): string {
  const normalized = path === '/' ? '' : path
  if (lang === 'tr' || !(PREFIXED_LOCALES as readonly string[]).includes(lang)) {
    return `${APP_URL}${normalized || '/'}`
  }
  return `${APP_URL}/${lang}${normalized}`
}
