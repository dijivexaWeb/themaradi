'use client'

import { useState, useEffect } from 'react'
import { Download, Copy, Check } from 'lucide-react'

interface Props {
  svgString: string
  slug: string
  familyName: string
  pageUrl: string
  t: {
    downloadSvg: string
    downloadPng: string
    copyLink: string
    copied: string
    scanNote: string
  }
}

export default function QrDownload({ svgString, slug, familyName, pageUrl, t }: Props) {
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleDownloadSvg = () => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-${slug}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPng = async () => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const size = 1024
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, 0, 0, size, size)
      canvas.toBlob(pngBlob => {
        if (!pngBlob) return
        const pngUrl = URL.createObjectURL(pngBlob)
        const a = document.createElement('a')
        a.href = pngUrl
        a.download = `qr-${slug}.png`
        a.click()
        URL.revokeObjectURL(pngUrl)
        URL.revokeObjectURL(url)
      }, 'image/png')
    }
    img.src = url
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-[11px] text-white/30 text-center">{t.scanNote}</p>

      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={handleDownloadSvg}
          className="flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all">
          <Download className="h-4 w-4" />
          {t.downloadSvg}
        </button>
        <button onClick={handleDownloadPng}
          className="flex items-center gap-2 rounded-2xl bg-emerald-800/60 border border-emerald-600/40 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700/60 transition-all">
          <Download className="h-4 w-4" />
          {t.downloadPng}
        </button>
        <button onClick={handleCopy}
          className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/15 px-5 py-3 text-sm font-medium text-white/70 hover:bg-white/10 transition-all">
          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          {copied ? t.copied : t.copyLink}
        </button>
      </div>
    </div>
  )
}
