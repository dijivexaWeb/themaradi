import { type NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return new NextResponse('Missing url param', { status: 400 })

  // Only allow internal URLs — block external/phishing QR codes
  try {
    const parsed = new URL(url)
    const ALLOWED_HOSTS = ['localhost', '127.0.0.1']
    if (process.env.NEXT_PUBLIC_APP_URL) {
      ALLOWED_HOSTS.push(new URL(process.env.NEXT_PUBLIC_APP_URL).hostname)
    }
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  } catch {
    return new NextResponse('Invalid url', { status: 400 })
  }

  const svg = await QRCode.toString(url, {
    type: 'svg',
    width: 256,
    margin: 2,
    color: { dark: '#1c2e25', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  })

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
