'use client'

import { useState, useTransition } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { MapPin, Clock, Hash, Info } from 'lucide-react'
import { saveMemorialCemeteryAction } from '../actions'

const MapPicker = dynamic(() => import('./_MapPicker'), { ssr: false, loading: () => (
  <div className="flex h-72 items-center justify-center rounded-2xl border border-[#e5dccb] bg-[#f9f5ec] sm:h-96">
    <p className="text-sm text-[#adb5ab]">Harita yükleniyor…</p>
  </div>
) })

interface Props {
  id: string
  displayName: string
  isLocked: boolean
  hasCemetery: boolean
  initialData: {
    cemetery_name: string
    cemetery_address: string
    cemetery_lat: number | null
    cemetery_lng: number | null
    cemetery_plot: string
    cemetery_row: string
    cemetery_hours: string
    cemetery_note: string
  }
}

export default function MezarClient({ id, displayName, isLocked, initialData }: Props) {
  const [cemeteryName, setCemeteryName] = useState(initialData.cemetery_name)
  const [address, setAddress] = useState(initialData.cemetery_address)
  const [lat, setLat] = useState<number | null>(initialData.cemetery_lat)
  const [lng, setLng] = useState<number | null>(initialData.cemetery_lng)
  const [plot, setPlot] = useState(initialData.cemetery_plot)
  const [row, setRow] = useState(initialData.cemetery_row)
  const [hours, setHours] = useState(initialData.cemetery_hours)
  const [note, setNote] = useState(initialData.cemetery_note)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleMapSelect(selLat: number, selLng: number, nominatimAddress?: string) {
    setLat(selLat)
    setLng(selLng)
    // Eğer adres ve mezarlık adı boşsa nominatim sonucundan doldur
    if (nominatimAddress && !address) {
      setAddress(nominatimAddress.split(',').slice(0, 3).join(',').trim())
    }
    if (nominatimAddress && !cemeteryName) {
      setCemeteryName(nominatimAddress.split(',')[0].trim())
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isLocked) return
    const fd = new FormData()
    fd.append('cemetery_name', cemeteryName)
    fd.append('cemetery_address', address)
    fd.append('cemetery_lat', lat?.toString() ?? '')
    fd.append('cemetery_lng', lng?.toString() ?? '')
    fd.append('cemetery_plot', plot)
    fd.append('cemetery_row', row)
    fd.append('cemetery_hours', hours)
    fd.append('cemetery_note', note)
    startTransition(async () => {
      await saveMemorialCemeteryAction(id, fd)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  const inputCls = 'w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10 disabled:opacity-40'
  const labelCls = 'mb-1.5 block text-xs font-semibold text-[#4a5e55]'

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-5 flex items-center gap-2 text-sm">
          <Link href={`/anma-paneli/${id}`} className="text-[#788177] transition-colors hover:text-[#174f35]">
            {displayName}
          </Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Defin Bilgileri</span>
        </div>

        <div className="mb-6">
          <h1 className="font-serif text-3xl text-[#1f2d27]">Defin Bilgileri</h1>
          <p className="mt-1 text-sm text-[#788177]">
            Mezarlık adı, konumu ve ziyaret saatleri anma sayfasında görüntülenir.
          </p>
        </div>

        {saved && (
          <div className="mb-5 rounded-2xl border border-[#cfe7d3] bg-[#e9f5ec] px-5 py-4 text-sm font-medium text-[#176b3f]">
            ✓ Defin bilgileri kaydedildi.
          </div>
        )}

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra defin bilgilerini girebilirsiniz.
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] shadow-[0_4px_24px_rgba(64,48,24,0.06)] divide-y divide-[#e5dccb]">

          {/* Harita + Konum */}
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#b08340]" />
              <h2 className="font-semibold text-[#1f2d27]">Konum</h2>
            </div>

            {/* Harita */}
            {!isLocked && (
              <div className="mb-5">
                <p className="mb-2 text-xs text-[#788177]">
                  Mezarlığı haritada arayın veya tam noktaya tıklayın — enlem/boylam otomatik dolar.
                </p>
                <MapPicker
                  initialLat={lat}
                  initialLng={lng}
                  onSelect={handleMapSelect}
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Mezarlık Adı</label>
                <input type="text" value={cemeteryName} onChange={e => setCemeteryName(e.target.value)} disabled={isLocked} placeholder="Zincirlikuyu Mezarlığı" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Adres</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} disabled={isLocked} placeholder="Sokak, semt, şehir..." rows={2} className={`${inputCls} resize-none`} />
              </div>

              {/* Enlem / Boylam — haritadan otomatik dolar */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Enlem (Latitude)</label>
                  <input
                    type="number" step="any"
                    value={lat ?? ''}
                    onChange={e => setLat(e.target.value ? parseFloat(e.target.value) : null)}
                    disabled={isLocked}
                    placeholder="41.0082"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Boylam (Longitude)</label>
                  <input
                    type="number" step="any"
                    value={lng ?? ''}
                    onChange={e => setLng(e.target.value ? parseFloat(e.target.value) : null)}
                    disabled={isLocked}
                    placeholder="28.9784"
                    className={inputCls}
                  />
                </div>
              </div>

              {lat && lng && (
                <a
                  href={`https://maps.google.com/?q=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#c7a76f] px-4 py-2 text-xs font-semibold text-[#173d31] transition-colors hover:bg-[#f4eee3]"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Google Haritada Gör →
                </a>
              )}
            </div>
          </div>

          {/* Parsel / Sıra */}
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Hash className="h-4 w-4 text-[#b08340]" />
              <h2 className="font-semibold text-[#1f2d27]">Mezar Bilgileri</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Parsel / Parça No</label>
                <input type="text" value={plot} onChange={e => setPlot(e.target.value)} disabled={isLocked} placeholder="A-12" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Sıra No</label>
                <input type="text" value={row} onChange={e => setRow(e.target.value)} disabled={isLocked} placeholder="7" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Ziyaret bilgileri */}
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#b08340]" />
              <h2 className="font-semibold text-[#1f2d27]">Ziyaret Bilgileri</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Ziyaret Saatleri</label>
                <input type="text" value={hours} onChange={e => setHours(e.target.value)} disabled={isLocked} placeholder="Her gün 08:00 – 18:00" className={inputCls} />
              </div>
              <div>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-[#b08340]" />
                  <label className={`${labelCls} mb-0`}>Ziyaretçi Notu</label>
                </div>
                <textarea value={note} onChange={e => setNote(e.target.value)} disabled={isLocked} placeholder="Mezarlığa ulaşım, otopark, dikkat edilmesi gerekenler..." rows={3} className={`${inputCls} resize-none`} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-6">
            <button
              type="submit"
              disabled={isLocked || isPending}
              className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(23,79,53,0.18)] transition-colors hover:bg-[#123f2b] disabled:opacity-40"
            >
              {isPending ? 'Kaydediliyor…' : 'Defin Bilgilerini Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
