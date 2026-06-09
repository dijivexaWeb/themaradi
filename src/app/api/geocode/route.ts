import type { NextRequest } from 'next/server'

type NominatimPlace = {
  readonly display_name?: string
  readonly lat?: string
  readonly lon?: string
  readonly type?: string
}

type GeocodeResult = {
  readonly label: string
  readonly lat: number
  readonly lng: number
  readonly type: string | null
}

function parsePlace(place: NominatimPlace): GeocodeResult | null {
  const lat = Number(place.lat)
  const lng = Number(place.lon)
  if (!place.display_name || !Number.isFinite(lat) || !Number.isFinite(lng)) return null

  return {
    label: place.display_name,
    lat,
    lng,
    type: place.type ?? null,
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim()
  if (!query || query.length < 3) {
    return Response.json({ results: [] as readonly GeocodeResult[] })
  }

  const searchUrl = new URL('https://nominatim.openstreetmap.org/search')
  searchUrl.searchParams.set('format', 'jsonv2')
  searchUrl.searchParams.set('q', query.slice(0, 160))
  searchUrl.searchParams.set('limit', '6')
  searchUrl.searchParams.set('addressdetails', '0')

  const response = await fetch(searchUrl, {
    headers: {
      Accept: 'application/json',
      Referer: request.nextUrl.origin,
      'User-Agent': 'TheEternalMemory/1.0 (cemetery location picker)',
    },
    next: { revalidate: 60 * 60 * 24 * 7 },
  })

  if (!response.ok) {
    return Response.json({ error: 'Konum araması şu anda çalışmadı.' }, { status: 502 })
  }

  const places = await response.json() as readonly NominatimPlace[]
  return Response.json({
    results: places.map(parsePlace).filter((result): result is GeocodeResult => result !== null),
  })
}
