import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { PREFIXED_LOCALES, isLocaleEligible, stripLocalePrefix } from '@/lib/i18n/localizedHref'

// Country code → language mapping (Vercel provides x-vercel-ip-country)
const COUNTRY_LANG: Record<string, string> = {
  GE: 'ka',
  TR: 'tr',
  IL: 'he',
  AM: 'hy',
  AZ: 'az',
  RU: 'ru', UA: 'ru', BY: 'ru',
  KZ: 'ru', UZ: 'ru', KG: 'ru', TJ: 'ru', TM: 'ru', MD: 'ru',
}

function detectLangFromRequest(request: NextRequest): string | null {
  // 1) Vercel geo header (IP-based, most reliable)
  const country = request.headers.get('x-vercel-ip-country')?.toUpperCase()
  if (country && COUNTRY_LANG[country]) return COUNTRY_LANG[country]

  // 2) Accept-Language browser header
  const acceptLang = request.headers.get('accept-language') ?? ''
  const primary = acceptLang.split(',')[0]?.split(';')[0]?.trim().slice(0, 2).toLowerCase()
  if (primary === 'ka') return 'ka'
  if (primary === 'tr') return 'tr'
  if (primary === 'ru') return 'ru'
  if (primary === 'hy') return 'hy'
  if (primary === 'az') return 'az'
  if (primary === 'he') return 'he'

  return null
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // /api ve /admin: dil mantığı tamamen atlanır.
  if (pathname.startsWith('/api') || pathname.startsWith('/admin')) {
    const adminResponse = await updateSession(request)
    if (pathname.startsWith('/admin')) {
      adminResponse.headers.set('Cache-Control', 'no-store, no-cache')
    }
    return adminResponse
  }

  const prefixed = stripLocalePrefix(pathname)

  // Önekli bir yol geldi ve gerçekten önek kapsamındaki bir sayfaysa: içeride
  // öneksiz path'e rewrite et, tm_lang cookie'sini senkronla.
  if (prefixed && isLocaleEligible(prefixed.rest)) {
    const url = request.nextUrl.clone()
    url.pathname = prefixed.rest
    // x-tm-locale, REQUEST header'larına eklenmeli ki generateMetadata()/getTranslation()
    // headers() ile bu isteğin gerçek dilini okuyabilsin — tm_lang cookie'si sadece
    // SONRAKİ istekler için geçerli olur, bu rewrite'ın kendi SSR render'ında henüz yok.
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-tm-locale', prefixed.locale)
    const rewritten = NextResponse.rewrite(url, { request: { headers: requestHeaders } })
    rewritten.cookies.set('tm_lang', prefixed.locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
    return rewritten
  }

  const response = await updateSession(request)

  // İlk ziyaret (tm_lang cookie yok) + önek kapsamındaki bir sayfa: tespit
  // edilen dil tr değilse ilgili önekli URL'e yönlendir. tr veya tespit
  // edilemezse TR öneksiz kalır — mevcut indekslenmiş URL'ler bozulmaz.
  if (!request.cookies.get('tm_lang') && isLocaleEligible(pathname)) {
    const lang = detectLangFromRequest(request)
    if (lang && lang !== 'tr' && (PREFIXED_LOCALES as readonly string[]).includes(lang)) {
      const url = request.nextUrl.clone()
      url.pathname = `/${lang}${pathname === '/' ? '' : pathname}`
      const redirected = NextResponse.redirect(url)
      redirected.cookies.set('tm_lang', lang, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      })
      return redirected
    }
    response.cookies.set('tm_lang', lang ?? 'en', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|otf)$).*)',
  ],
}
