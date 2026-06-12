import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Country code → language mapping
// Priority: Vercel geo header (IP-based) → Accept-Language → 'en'
const COUNTRY_LANG: Record<string, string> = {
  // Georgian
  GE: 'ka',
  // Turkish
  TR: 'tr',
  // Russian-speaking region (CIS)
  RU: 'ru', AZ: 'ru', UA: 'ru', AM: 'ru', BY: 'ru',
  KZ: 'ru', UZ: 'ru', KG: 'ru', TJ: 'ru', TM: 'ru',
  MD: 'ru',
}

function detectLangFromRequest(request: NextRequest): string | null {
  // 1) Vercel geo header (most reliable — IP-based)
  const country = request.headers.get('x-vercel-ip-country')?.toUpperCase()
  if (country && COUNTRY_LANG[country]) return COUNTRY_LANG[country]

  // 2) Accept-Language header (browser preference)
  const acceptLang = request.headers.get('accept-language') ?? ''
  const primary = acceptLang.split(',')[0]?.split(';')[0]?.trim().slice(0, 2).toLowerCase()
  if (primary === 'ka') return 'ka'
  if (primary === 'tr') return 'tr'
  if (primary === 'ru') return 'ru'

  return null
}

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // Admin paths: no caching
  if (request.nextUrl.pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache')
  }

  // Only set language cookie if user hasn't manually chosen one yet
  if (!request.cookies.get('tm_lang')) {
    const lang = detectLangFromRequest(request) ?? 'en'
    response.cookies.set('tm_lang', lang, {
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
