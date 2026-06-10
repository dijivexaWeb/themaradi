'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, Loader2, MapPin, X } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Leaflet default marker icon fix for Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Props {
  initialLat?: number | null
  initialLng?: number | null
  onSelect: (lat: number, lng: number, address?: string) => void
}

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
  type: string
}

export default function MapPicker({ initialLat, initialLng, onSelect }: Props) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<NominatimResult[]>([])
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  )

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const defaultCenter: L.LatLngTuple = initialLat && initialLng
      ? [initialLat, initialLng]
      : [39.9, 32.8] // Türkiye merkezi

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: initialLat && initialLng ? 16 : 6,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    // Mevcut konum varsa marker koy
    if (initialLat && initialLng) {
      markerRef.current = L.marker([initialLat, initialLng]).addTo(map)
    }

    // Haritaya tıklanınca marker ekle
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      placeMarker(map, lat, lng)
      onSelect(lat, lng)
      setSelected({ lat, lng })
      setResults([])
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function placeMarker(map: L.Map, lat: number, lng: number) {
    if (markerRef.current) markerRef.current.remove()
    markerRef.current = L.marker([lat, lng]).addTo(map)
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return
    setSearching(true)
    setResults([])
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&accept-language=tr`
      const res = await fetch(url, { headers: { 'User-Agent': 'TheEternalMemory/1.0' } })
      const data: NominatimResult[] = await res.json()
      setResults(data)
    } catch {
      // sessiz hata
    } finally {
      setSearching(false)
    }
  }

  function selectResult(result: NominatimResult) {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    if (!mapRef.current) return
    placeMarker(mapRef.current, lat, lng)
    mapRef.current.setView([lat, lng], 17)
    onSelect(lat, lng, result.display_name)
    setSelected({ lat, lng })
    setResults([])
    setSearchQuery(result.display_name.split(',').slice(0, 2).join(','))
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e5dccb]">
      {/* Arama kutusu */}
      <div className="relative border-b border-[#e5dccb] bg-[#fffdf8] p-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#adb5ab]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Mezarlık adı veya adres ara..."
              className="w-full rounded-xl border border-[#e5dccb] bg-white py-2.5 pl-9 pr-4 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setResults([]) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#adb5ab] hover:text-[#173d31]">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="flex items-center gap-1.5 rounded-xl bg-[#174f35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123f2b] disabled:opacity-60"
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Ara
          </button>
        </div>

        {/* Arama sonuçları */}
        {results.length > 0 && (
          <div className="absolute left-3 right-3 top-full z-[1000] mt-1 overflow-hidden rounded-xl border border-[#e5dccb] bg-white shadow-xl">
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectResult(r)}
                className="flex w-full items-start gap-2 px-4 py-3 text-left text-sm transition hover:bg-[#f5efdf]"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#b08340]" />
                <span className="line-clamp-2 text-[#1f2d27]">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Harita */}
      <div ref={containerRef} className="h-72 w-full sm:h-96" />

      {/* Seçilen konum */}
      <div className="border-t border-[#e5dccb] bg-[#f9f5ec] px-4 py-2.5">
        {selected ? (
          <p className="flex items-center gap-1.5 text-xs text-[#4a5e55]">
            <MapPin className="h-3.5 w-3.5 text-[#174f35]" />
            <span className="font-semibold text-[#174f35]">Seçildi:</span>
            <span className="font-mono">{selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}</span>
          </p>
        ) : (
          <p className="text-xs text-[#adb5ab]">Haritaya tıklayarak veya arama yaparak konum seçin</p>
        )}
      </div>
    </div>
  )
}
