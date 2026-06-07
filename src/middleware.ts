import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  // Only set the cookie if the user has not already set a language preference
  if (!request.cookies.get('tm_lang')) {
    const acceptLang = request.headers.get('accept-language') ?? ''
    const primary = acceptLang.split(',')[0].slice(0, 2).toLowerCase()
    const lang = ['ka', 'tr', 'ru'].includes(primary) ? primary : 'en'
    response.cookies.set('tm_lang', lang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }
  return response
}

export const config = {
  matcher: ['/((?!_next|favicon|images|fonts|api).*)'],
}
