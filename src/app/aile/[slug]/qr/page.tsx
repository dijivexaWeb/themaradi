import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'qrcode'
import { getTranslation } from '@/i18n/server'
import QrDownload from './QrDownload'
import StarField from '../StarField'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function FamilyQrPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { t } = await getTranslation()

  const { data: family } = await supabase
    .from('memorial_families')
    .select('id, name, is_public, slug')
    .eq('slug', slug)
    .single()

  if (!family || !family.is_public) notFound()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternal.memory'
  const pageUrl = `${appUrl}/aile/${slug}`

  // Generate SVG QR code (vector, 512px)
  const svgString = await QRCode.toString(pageUrl, {
    type: 'svg',
    width: 256,
    margin: 3,
    color: { dark: '#ffffff', light: '#0e1e15' },
    errorCorrectionLevel: 'H',
  })

  const fp = t.family_page

  const downloadT = {
    downloadSvg: fp.qrDownloadSvg,
    downloadPng: fp.qrDownloadPng,
    copyLink: fp.qrCopyLink,
    copied: fp.qrCopied,
    scanNote: fp.qrScanNote,
  }

  return (
    <div className="min-h-screen bg-[#080f0b] text-white flex flex-col items-center justify-center px-5 py-16 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1f14] via-[#091a10] to-[#080f0b]" />
      <StarField className="absolute inset-0 w-full h-full pointer-events-none z-[1]" />
      <div className="absolute inset-0 z-[2] pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(46,90,60,0.2) 0%, transparent 70%)'
      }} />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-sm w-full">

        {/* Back link */}
        <Link href={`/aile/${slug}`}
          className="self-start flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {fp.backToPage}
        </Link>

        {/* Title */}
        <div className="text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/25 mb-3">{fp.qrTitle}</p>
          <h1 className="font-serif text-3xl text-white/90 font-light">{family.name}</h1>
        </div>

        {/* QR Code — rendered as inline SVG on dark background */}
        <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm w-full flex justify-center">
          {/* Subtle glow behind QR */}
          <div className="absolute inset-0 rounded-3xl opacity-20"
            style={{ background: 'radial-gradient(ellipse at center, rgba(100,200,130,0.3), transparent 70%)' }} />
          <div
            className="relative z-10 w-64 h-64"
            dangerouslySetInnerHTML={{ __html: svgString }}
          />
        </div>

        {/* URL display */}
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
          <p className="text-[11px] text-white/30 break-all font-mono">{pageUrl}</p>
        </div>

        {/* Download buttons */}
        <QrDownload
          svgString={svgString}
          slug={slug}
          familyName={family.name}
          pageUrl={pageUrl}
          t={downloadT}
        />

        {/* Footer */}
        <p className="text-[10px] text-white/15 text-center mt-4">
          The Eternal Memory — theeternal.memory
        </p>
      </div>
    </div>
  )
}
