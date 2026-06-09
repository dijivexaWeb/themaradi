'use client'

import { MapPin, Navigation, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'

type CemeteryLocationPickerProps = {
  readonly initialLat: number | null
  readonly initialLng: number | null
  readonly disabled?: boolean
}

const DEFAULT_POSITION = {
  lat: 41.7151,
  lng: 44.8271,
} as const

function normalizeCoordinate(value: number | null): number | null {
  return Number.isFinite(value) ? value : null
}

function formatCoordinate(value: number | null): string {
  return value === null ? '' : value.toFixed(7)
}

function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

export function CemeteryLocationPicker({ initialLat, initialLng, disabled = false }: CemeteryLocationPickerProps) {
  const mapElementRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const markerRef = useRef<import('leaflet').Marker | null>(null)
  const disabledRef = useRef(disabled)
  const [lat, setLat] = useState<number | null>(normalizeCoordinate(initialLat))
  const [lng, setLng] = useState<number | null>(normalizeCoordinate(initialLng))
  const [searchText, setSearchText] = useState('')
  const hasPosition = lat !== null && lng !== null
  const initialCenterRef = useRef({
    lat: normalizeCoordinate(initialLat) ?? DEFAULT_POSITION.lat,
    lng: normalizeCoordinate(initialLng) ?? DEFAULT_POSITION.lng,
    hasPosition: normalizeCoordinate(initialLat) !== null && normalizeCoordinate(initialLng) !== null,
  })

  useEffect(() => {
    disabledRef.current = disabled
  }, [disabled])

  useEffect(() => {
    let cancelled = false

    async function initMap() {
      if (!mapElementRef.current || mapRef.current) return

      const L = await import('leaflet')
      if (cancelled || !mapElementRef.current) return

      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      })

      const initialCenter = initialCenterRef.current
      const map = L.map(mapElementRef.current, {
        center: [initialCenter.lat, initialCenter.lng],
        zoom: initialCenter.hasPosition ? 17 : 12,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 20,
      }).addTo(map)

      if (initialCenter.hasPosition) {
        markerRef.current = L.marker([initialCenter.lat, initialCenter.lng], { icon }).addTo(map)
      }

      map.on('click', (event) => {
        if (disabledRef.current) return

        const nextLat = event.latlng.lat
        const nextLng = event.latlng.lng
        setLat(nextLat)
        setLng(nextLng)

        if (markerRef.current) {
          markerRef.current.setLatLng([nextLat, nextLng])
          return
        }

        markerRef.current = L.marker([nextLat, nextLng], { icon }).addTo(map)
      })

      mapRef.current = map
    }

    void initMap()

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  const searchLocation = () => {
    const query = searchText.trim()
    if (!query) return

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition((position) => {
      const nextLat = position.coords.latitude
      const nextLng = position.coords.longitude
      setLat(nextLat)
      setLng(nextLng)
      mapRef.current?.setView([nextLat, nextLng], 18)
      void import('leaflet').then((L) => {
        if (!mapRef.current) return
        if (markerRef.current) {
          markerRef.current.setLatLng([nextLat, nextLng])
          return
        }
        markerRef.current = L.marker([nextLat, nextLng]).addTo(mapRef.current)
      })
    })
  }

  return (
    <div className="rounded-2xl border border-[#e5dccb] bg-white p-4">
      <input type="hidden" name="cemetery_lat" value={formatCoordinate(lat)} />
      <input type="hidden" name="cemetery_lng" value={formatCoordinate(lng)} />

      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1f2d27]">
        <MapPin className="h-4 w-4 text-[#b08340]" />
        Mezarlık Konumu
      </div>

      <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input
          type="text"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Mezarlık adı veya adres ara..."
          disabled={disabled}
          className="w-full rounded-xl border border-[#e5dccb] bg-[#fbf8f1] px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] disabled:opacity-40"
        />
        <button
          type="button"
          onClick={searchLocation}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e5dccb] px-4 py-3 text-sm font-semibold text-[#174f35] transition hover:bg-[#f5efdf] disabled:opacity-40"
        >
          <Search className="h-4 w-4" />
          Haritada Ara
        </button>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174f35] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#123f2b] disabled:opacity-40"
        >
          <Navigation className="h-4 w-4" />
          Mevcut Konum
        </button>
      </div>

      <div ref={mapElementRef} className="h-[340px] overflow-hidden rounded-2xl border border-[#e5dccb] bg-[#f5efdf]" />

      <div className="mt-3 flex flex-col gap-2 text-xs text-[#788177] sm:flex-row sm:items-center sm:justify-between">
        <p>Haritada mezarın bulunduğu noktaya yakınlaşıp tıklayın. Konum otomatik kaydedilir.</p>
        {hasPosition && (
          <a href={googleMapsUrl(lat, lng)} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#174f35] hover:underline">
            Seçilen noktayı aç
          </a>
        )}
      </div>

      {hasPosition && (
        <div className="mt-2 rounded-xl bg-[#f7f2e9] px-3 py-2 text-xs text-[#5f6d66]">
          Seçilen konum: {formatCoordinate(lat)}, {formatCoordinate(lng)}
        </div>
      )}
    </div>
  )
}
