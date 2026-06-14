'use client'

import { useState, useTransition } from 'react'
import { checkSlugAvailabilityAction, updateMemorialSlugAction } from '../actions'
import { Copy, Check, Download, Link2, QrCode, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Props {
  vaultId: string
  currentSlug: string
  qrId: string
  qrDataUrl: string
  qrUrl: string
  displayName: string
}

export default function QrLinkClient({ vaultId, currentSlug, qrId, qrDataUrl, qrUrl, displayName }: Props) {
  const [slug, setSlug] = useState(currentSlug)
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [copied, setCopied] = useState<'link' | 'qr' | null>(null)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://theeternalmemory.com'

  const memorialUrl = `${baseUrl}/memorial/${slug}`

  function slugify(val: string) {
    return val
      .toLowerCase()
      .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
      .replace(/ö/g, 'o').replace(/ı/g, 'i').replace(/ç/g, 'c')
      .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleSlugChange(raw: string) {
    const val = slugify(raw)
    setSlug(val)
    setSlugStatus('idle')
    if (!val || val === currentSlug) { setSlugStatus('idle'); return }
    if (val.length < 3) { setSlugStatus('invalid'); return }
    setSlugStatus('checking')
    const res = await checkSlugAvailabilityAction(val, vaultId)
    setSlugStatus(res.available ? 'available' : 'taken')
  }

  function handleSave() {
    if (slugStatus !== 'available' && slug !== currentSlug) return
    startTransition(async () => {
      const res = await updateMemorialSlugAction(vaultId, slug)
      setSaveMsg(res.success ? '✓ Kaydedildi' : res.error ?? 'Hata')
      setTimeout(() => setSaveMsg(null), 3000)
    })
  }

  function copyLink(text: string, which: 'link' | 'qr') {
    navigator.clipboard.writeText(text)
    setCopied(which)
    setTimeout(() => setCopied(null), 2000)
  }

  function downloadQr() {
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `qr-${displayName.replace(/\s+/g, '-').toLowerCase()}.png`
    a.click()
  }

  async function downloadSvgQr() {
    const QRCode = (await import('qrcode')).default

    const qrSvgStr: string = await QRCode.toString(qrUrl, {
      type: 'svg',
      margin: 0,
      color: { dark: '#1a1a1a', light: '#ffffff' },
    })

    // Extract viewBox and path elements via simple string parsing
    const viewBox = qrSvgStr.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 37 37'
    const paths = [...qrSvgStr.matchAll(/<path[^>]+\/>/g)].map(m => m[0]).join('\n      ')

    const W = 400
    const qrSize = 280
    const qrX = (W - qrSize) / 2   // 60
    const qrY = 80
    const nameY = 52
    const urlY = qrY + qrSize + 36
    const H = urlY + 48

    function escXml(s: string) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <line x1="40" y1="22" x2="${W - 40}" y2="22" stroke="#c7a76f" stroke-width="1.2"/>
  <text x="${W / 2}" y="${nameY}"
    font-family="Georgia,'Times New Roman',serif"
    font-size="20" font-weight="bold" fill="#173d31" text-anchor="middle">${escXml(displayName)}</text>
  <svg x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" viewBox="${viewBox}">
    ${paths}
  </svg>
  <line x1="40" y1="${urlY - 10}" x2="${W - 40}" y2="${urlY - 10}" stroke="#c7a76f" stroke-width="0.8"/>
  <text x="${W / 2}" y="${urlY + 14}"
    font-family="Arial,Helvetica,sans-serif"
    font-size="13" fill="#7b837d" text-anchor="middle">www.theeternalmemory.com</text>
</svg>`

    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-${displayName.replace(/\s+/g, '-').toLowerCase()}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const statusIcon = {
    idle: null,
    checking: <Loader2 className="h-4 w-4 animate-spin text-[#adb5ab]" />,
    available: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
    taken: <AlertCircle className="h-4 w-4 text-red-500" />,
    invalid: <AlertCircle className="h-4 w-4 text-amber-500" />,
  }

  const statusText = {
    idle: '',
    checking: 'Kontrol ediliyor…',
    available: 'Kullanılabilir',
    taken: 'Bu adres zaten alınmış',
    invalid: 'En az 3 karakter gerekli',
  }

  const canSave = slug !== currentSlug
    ? (slugStatus === 'available')
    : true

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 font-serif text-2xl text-[#173d31]">Link & QR Kod</h1>
      <p className="mb-8 text-sm text-[#7b837d]">{displayName}</p>

      {/* ── SLUG EDİTÖR ─────────────────────────────────────── */}
      <section className="mb-8 rounded-2xl border border-[#e5dccb] bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Link2 className="h-5 w-5 text-[#174f35]" />
          <h2 className="font-semibold text-[#173d31]">Özel Adres (Slug)</h2>
        </div>

        <p className="mb-4 text-sm text-[#7b837d]">
          Anma sayfasının URL'sini özelleştirebilirsiniz. QR kodu etkilenmez — slug değişse bile QR çalışmaya devam eder.
        </p>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#adb5ab] select-none">
            /memorial/
          </span>
          <input
            value={slug}
            onChange={e => handleSlugChange(e.target.value)}
            className="w-full rounded-xl border border-[#e5dccb] bg-[#fbf8f0] py-2.5 pl-[88px] pr-10 text-sm text-[#173d31] outline-none focus:border-[#174f35] focus:ring-1 focus:ring-[#174f35]"
            placeholder="adi-soyadi"
            spellCheck={false}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {statusIcon[slugStatus]}
          </span>
        </div>

        {slugStatus !== 'idle' && (
          <p className={`mt-1.5 text-xs ${slugStatus === 'available' ? 'text-emerald-600' : slugStatus === 'taken' ? 'text-red-500' : 'text-amber-600'}`}>
            {statusText[slugStatus]}
          </p>
        )}

        {slug && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#e5dccb] bg-[#f5f0e8] px-3 py-2">
            <span className="flex-1 truncate text-xs text-[#5a6e65]">{memorialUrl}</span>
            <button onClick={() => copyLink(memorialUrl, 'link')} className="shrink-0 text-[#7b837d] hover:text-[#174f35] transition-colors">
              {copied === 'link' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!canSave || isPending}
            className="rounded-xl bg-[#174f35] px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40 hover:bg-[#0f3826]"
          >
            {isPending ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
          {saveMsg && (
            <span className={`text-sm ${saveMsg.startsWith('✓') ? 'text-emerald-600' : 'text-red-500'}`}>
              {saveMsg}
            </span>
          )}
        </div>
      </section>

      {/* ── QR KOD ─────────────────────────────────────────── */}
      <section className="rounded-2xl border border-[#e5dccb] bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <QrCode className="h-5 w-5 text-[#174f35]" />
          <h2 className="font-semibold text-[#173d31]">QR Kod</h2>
        </div>

        <p className="mb-5 text-sm text-[#7b837d]">
          Bu QR kod kalıcıdır — slug değişse bile aynı anma sayfasına yönlendirir.
          Mezar taşına, baskı materyallerine veya dijital paylaşımlara ekleyebilirsiniz.
        </p>

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          {/* QR Görsel */}
          <div className="shrink-0 rounded-2xl border border-[#e5dccb] bg-[#fffdf7] p-3 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR Kod" width={180} height={180} className="rounded-xl" />
          </div>

          {/* Sağ bilgi + butonlar */}
          <div className="flex-1 space-y-3">
            <div className="rounded-xl border border-[#e5dccb] bg-[#f5f0e8] px-3 py-2">
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-[#adb5ab]">QR Hedef URL</p>
              <div className="flex items-center gap-2">
                <span className="flex-1 truncate text-xs text-[#5a6e65]">{qrUrl}</span>
                <button onClick={() => copyLink(qrUrl, 'qr')} className="shrink-0 text-[#7b837d] hover:text-[#174f35] transition-colors">
                  {copied === 'qr' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#e5dccb] bg-[#f5f0e8] px-3 py-2">
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-[#adb5ab]">QR ID</p>
              <span className="font-mono text-xs text-[#173d31]">{qrId}</span>
            </div>

            {/* İndir butonları */}
            <button
              onClick={downloadQr}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#174f35] px-4 py-2.5 text-sm font-semibold text-[#174f35] transition-colors hover:bg-[#174f35] hover:text-white"
            >
              <Download className="h-4 w-4" />
              QR Kodu İndir (PNG)
            </button>

            <button
              onClick={downloadSvgQr}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#c7a76f] bg-[#fffdf7] px-4 py-2.5 text-sm font-semibold text-[#8a6020] transition-colors hover:bg-[#c7a76f] hover:text-white"
            >
              <Download className="h-4 w-4" />
              Baskı için İndir (SVG Vektörel)
            </button>

            <p className="text-xs text-[#adb5ab]">
              SVG: isim + QR + site adresi, sonsuz çözünürlük — matbaa için ideal.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
