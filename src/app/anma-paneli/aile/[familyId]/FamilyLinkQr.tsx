'use client'

import { useState, useTransition } from 'react'
import { Link2, Copy, Check, Download, ExternalLink, Loader2, QrCode, Pencil, X, Lock } from 'lucide-react'
import { updateFamilySlugAction } from './actions'
import { useLang } from '@/i18n/context'

interface Props {
  familyId: string
  initialSlug: string
  slugLocked: boolean
  appUrl: string
  qrSvg: string
}

// Convert SVG string → base64 data URL for <img> (scales reliably)
function svgToDataUrl(svg: string): string {
  const encoded = encodeURIComponent(svg)
  return `data:image/svg+xml;charset=utf-8,${encoded}`
}

export default function FamilyLinkQr({ familyId, initialSlug, slugLocked, appUrl, qrSvg }: Props) {
  const { t } = useLang()
  const lq = t.familyPanel.linkQr

  const [slug, setSlug] = useState(initialSlug)
  const [slugInput, setSlugInput] = useState(initialSlug)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  const [rawQr, setRawQr] = useState(qrSvg)
  const [qrDataUrl, setQrDataUrl] = useState(() => svgToDataUrl(qrSvg))

  const pageUrl = `${appUrl}/aile/${slug}`

  const handleSaveSlug = () => {
    setError(null)
    startTransition(async () => {
      const result = await updateFamilySlugAction(familyId, slugInput)
      if (!result.ok) { setError(result.error ?? lq.errorGeneric); return }
      setSlug(result.newSlug!)
      setSlugInput(result.newSlug!)
      setEditing(false)
      const newUrl = `${appUrl}/aile/${result.newSlug}`
      try {
        const res = await fetch(`/api/qr-generate?url=${encodeURIComponent(newUrl)}`)
        if (res.ok) {
          const svg = await res.text()
          setRawQr(svg)
          setQrDataUrl(svgToDataUrl(svg))
        }
      } catch { /* keep old QR */ }
    })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleDownloadSvg = () => {
    const blob = new Blob([rawQr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-aile-${slug}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPng = () => {
    const svgWithSize = rawQr
      .replace(/width="[^"]*"/, 'width="1200"')
      .replace(/height="[^"]*"/, 'height="1200"')
    const blob = new Blob([svgWithSize], { type: 'image/svg+xml' })
    const blobUrl = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1200
      canvas.height = 1200
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 1200, 1200)
      ctx.drawImage(img, 0, 0, 1200, 1200)
      canvas.toBlob(pngBlob => {
        if (!pngBlob) return
        const pngUrl = URL.createObjectURL(pngBlob)
        const a = document.createElement('a')
        a.href = pngUrl
        a.download = `qr-aile-${slug}.png`
        a.click()
        URL.revokeObjectURL(pngUrl)
        URL.revokeObjectURL(blobUrl)
      }, 'image/png')
    }
    img.src = blobUrl
  }

  return (
    <div className="rounded-2xl border border-[#e5dccb] bg-white overflow-hidden">
      <div className="flex flex-col sm:flex-row">

        {/* ── Sol: Link ── */}
        <div className="flex-1 p-5 border-b border-[#e5dccb] sm:border-b-0 sm:border-r">
          <div className="mb-3 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-[#174f35]" />
            <h3 className="text-sm font-semibold text-[#1f2d27]">{lq.sectionLink}</h3>
          </div>

          {/* URL bar */}
          <div className="mb-3 flex items-center gap-1.5 rounded-xl border border-[#e5dccb] bg-[#faf6ef] pl-3 pr-1.5 py-1.5">
            <span className="flex-1 text-xs text-[#788177] font-mono truncate min-w-0">{pageUrl}</span>
            <button onClick={handleCopy}
              className="shrink-0 rounded-lg p-1.5 text-[#788177] hover:bg-[#f0ebe0] hover:text-[#174f35] transition-colors">
              {copied ? <Check className="h-3.5 w-3.5 text-[#174f35]" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <a href={`/aile/${slug}`} target="_blank"
              className="shrink-0 rounded-lg p-1.5 text-[#788177] hover:bg-[#f0ebe0] hover:text-[#174f35] transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Slug edit / locked */}
          {slugLocked ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
              <Lock className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-700">{lq.lockedTitle}</p>
                <p className="text-[11px] text-amber-600/80 mt-0.5 leading-4">{lq.lockedDesc}</p>
              </div>
            </div>
          ) : editing ? (
            <div className="space-y-2">
              <div className="flex items-center rounded-xl border border-[#174f35]/40 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#174f35]/10">
                <span className="pl-3 text-xs text-[#adb5ab] whitespace-nowrap font-mono shrink-0">/aile/</span>
                <input
                  value={slugInput}
                  onChange={e => { setSlugInput(e.target.value); setError(null) }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveSlug()
                    if (e.key === 'Escape') { setEditing(false); setSlugInput(slug); setError(null) }
                  }}
                  className="flex-1 py-2.5 pr-3 text-sm text-[#1f2d27] outline-none font-mono bg-transparent"
                  placeholder="aile-adi"
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
              <div className="flex gap-2">
                <button onClick={handleSaveSlug} disabled={isPending || !slugInput.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-[#1c2e25] px-4 py-2 text-xs font-semibold text-white hover:bg-[#132118] disabled:opacity-40 transition-colors">
                  {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  {lq.saveLink}
                </button>
                <button onClick={() => { setEditing(false); setSlugInput(slug); setError(null) }}
                  className="flex items-center gap-1 rounded-xl border border-[#e5dccb] px-3 py-2 text-xs text-[#788177] hover:bg-[#f5efdf] transition-colors">
                  <X className="h-3 w-3" /> {lq.cancelEdit}
                </button>
              </div>
              <p className="text-[11px] text-amber-600/70 leading-4">{lq.lockWarning}</p>
            </div>
          ) : (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-xl border border-[#e5dccb] px-3 py-2 text-xs font-medium text-[#788177] hover:border-[#174f35]/40 hover:text-[#174f35] hover:bg-[#faf6ef] transition-colors">
              <Pencil className="h-3 w-3" />
              {lq.setLink}
            </button>
          )}
        </div>

        {/* ── Sağ: QR ── */}
        <div className="flex flex-col items-center gap-4 p-5 sm:w-64 shrink-0">
          <div className="flex w-full items-center gap-2">
            <QrCode className="h-4 w-4 text-[#174f35]" />
            <h3 className="text-sm font-semibold text-[#1f2d27]">{lq.qrSection}</h3>
          </div>

          {/* QR önizleme */}
          <div className="w-44 h-44 rounded-2xl border border-[#e5dccb] bg-white p-3 shadow-sm overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR" className="w-full h-full object-contain" />
          </div>

          {/* İndir */}
          <div className="flex w-full gap-2">
            <button onClick={handleDownloadSvg}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#e5dccb] bg-[#faf6ef] px-3 py-2.5 text-xs font-semibold text-[#4a5e55] hover:border-[#174f35]/40 hover:bg-[#f0ebe0] transition-colors">
              <Download className="h-3.5 w-3.5" />
              SVG
            </button>
            <button onClick={handleDownloadPng}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1c2e25] px-3 py-2.5 text-xs font-semibold text-white hover:bg-[#132118] transition-colors">
              <Download className="h-3.5 w-3.5" />
              PNG
            </button>
          </div>
          <p className="text-[10px] text-[#adb5ab] text-center leading-4 whitespace-pre-line">{lq.qrNote}</p>
        </div>
      </div>
    </div>
  )
}
