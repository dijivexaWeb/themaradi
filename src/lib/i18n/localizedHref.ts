import type { Lang } from '@/i18n'

// tr önek almaz (varsayılan/kanonik pazar). Diğer 6 dil için önek eklenir.
export const PREFIXED_LOCALES = ['en', 'ka', 'ru', 'az', 'hy', 'he'] as const

// Sadece pazarlama/satış sayfaları dil öneki kapsamına giriyor — dinamik anı
// sayfaları (aile/[slug], memorial/[slug], q/[code], preview/[id] vb.) her
// dilde aynı URL'de kalır (gereksiz SEO şişkinliği yaratmamak için).
// proxy.ts ve sitemap.ts bu fonksiyonu paylaşır — tek doğruluk kaynağı.
const ELIGIBLE_PREFIXES = ['/pricing', '/about', '/contact', '/miras', '/satin-al', '/dijital-ani-sayfasi']

export function isLocaleEligible(pathname: string): boolean {
  if (pathname === '/') return true
  return ELIGIBLE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function stripLocalePrefix(pathname: string): { locale: Lang; rest: string } | null {
  for (const locale of PREFIXED_LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      const rest = pathname.slice(locale.length + 1) || '/'
      return { locale: locale as Lang, rest }
    }
  }
  return null
}

// Bir taban path'i (önek olmadan) verilen dile göre öneklendirir. Sadece
// isLocaleEligible(path) true olan sayfalar için anlamlıdır.
export function localizedHref(path: string, lang: Lang): string {
  if (lang === 'tr') return path
  const normalized = path === '/' ? '' : path
  return `/${lang}${normalized}`
}
