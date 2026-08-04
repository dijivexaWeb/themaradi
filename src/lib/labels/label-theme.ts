import path from 'node:path'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theeternalmemory.com'

// 10x10cm @72dpi
export const PAGE_SIZE = Math.round((10 / 2.54) * 72)
export const MARGIN = 14

export const BRAND_DARK = '#0c3327'
export const BRAND_DARK_EDGE = '#0a2a20'
export const GOLD = '#c9a55c'
export const GOLD_SOFT = '#e4cd93'
export const CREAM = '#fdfaf1'

export const ASSETS_DIR = path.join(process.cwd(), 'src/lib/labels/assets')
export const LOGO_ICON_PATH = path.join(ASSETS_DIR, 'logo-icon-gold.png')
// intrinsic pixel size of logo-icon-gold.png, used to keep its aspect ratio
export const LOGO_ICON_RATIO = 456 / 465

export const FONTS_DIR = path.join(process.cwd(), 'src/lib/labels/fonts')
export const FONT_BOLD_PATH = path.join(FONTS_DIR, 'CormorantGaramond-Bold.ttf')
export const FONT_SEMIBOLD_PATH = path.join(FONTS_DIR, 'CormorantGaramond-SemiBold.ttf')

export function siteDisplayDomain(): string {
  let host = SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')
  if (!host.startsWith('www.')) host = `www.${host}`
  return host
}

export function refCodeOf(qrId: string): string {
  return qrId.replace('mem-', '').toUpperCase()
}

export function qrUrlOf(qrId: string): string {
  return `${SITE_URL}/q/${qrId}`
}

// Shared vertical rhythm — both the PDF and SVG renderers place elements
// at these exact coordinates so the two outputs match pixel-for-pixel.
// Budgeted to stay within PAGE_SIZE (283pt / 10cm) so pdfkit never triggers
// an automatic page break — every offset below was checked against that limit.
export const LAYOUT = {
  logoSize: 32,
  headerGap: 8,
  headerY: 22,
  nameY: 60,
  nameFontSize: 14,
  dividerY: 84,
  dividerWidth: 60,
  qrSize: 140,
  qrY: 94,
  get qrX() {
    return (PAGE_SIZE - this.qrSize) / 2
  },
  frameArm: 9,
  framePad: 7,
  footerY: 254,
  footerFontSize: 8.5,
}
