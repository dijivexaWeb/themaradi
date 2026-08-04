import QRCode from 'qrcode'
import { readFileSync } from 'node:fs'
import {
  PAGE_SIZE,
  MARGIN,
  BRAND_DARK,
  BRAND_DARK_EDGE,
  GOLD,
  GOLD_SOFT,
  CREAM,
  LOGO_ICON_PATH,
  LOGO_ICON_RATIO,
  FONT_BOLD_PATH,
  FONT_SEMIBOLD_PATH,
  siteDisplayDomain,
  refCodeOf,
  qrUrlOf,
  LAYOUT,
} from './label-theme'
import type { LabelRecord } from './build-labels-pdf'

let logoBase64Cache: string | null = null
function logoDataUri(): string {
  if (!logoBase64Cache) logoBase64Cache = readFileSync(LOGO_ICON_PATH).toString('base64')
  return `data:image/png;base64,${logoBase64Cache}`
}

let fontFaceCssCache: string | null = null
function fontFaceCss(): string {
  if (!fontFaceCssCache) {
    const bold = readFileSync(FONT_BOLD_PATH).toString('base64')
    const semibold = readFileSync(FONT_SEMIBOLD_PATH).toString('base64')
    fontFaceCssCache = `
      @font-face { font-family: 'Cormorant Garamond'; font-weight: 700; src: url(data:font/ttf;base64,${bold}) format('truetype'); }
      @font-face { font-family: 'Cormorant Garamond'; font-weight: 600; src: url(data:font/ttf;base64,${semibold}) format('truetype'); }
    `
  }
  return fontFaceCssCache
}

function cornerOrnament(x: number, y: number, rotationDeg: number): string {
  const leaves = [
    [4, -1, 0.55],
    [11, -1.5, 0.75],
    [18, -1.5, 0.6],
    [24, -1, 0.4],
  ]
  const leafPaths = leaves
    .map(
      ([lx, ly, s]) =>
        `<path transform="translate(${lx} ${ly}) scale(${s})" fill="${GOLD}" d="M0,0 Q3,-6 0,-11 Q-3,-6 0,0 Z"/>`,
    )
    .join('')
  return `<g transform="translate(${x} ${y}) rotate(${rotationDeg})">
    <path d="M0,0 Q14,2 26,0" stroke="${GOLD}" stroke-width="1" fill="none"/>
    ${leafPaths}
  </g>`
}

function divider(cy: number, width: number): string {
  const cx = PAGE_SIZE / 2
  return `
    <line x1="${cx - width / 2}" y1="${cy}" x2="${cx - 6}" y2="${cy}" stroke="${GOLD}" stroke-width="0.75"/>
    <line x1="${cx + 6}" y1="${cy}" x2="${cx + width / 2}" y2="${cy}" stroke="${GOLD}" stroke-width="0.75"/>
    <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" fill="${GOLD}" transform="rotate(45 ${cx} ${cy})"/>
  `
}

function frameCorners(x: number, y: number, size: number, arm: number): string {
  const pts: [number, number, number, number][] = [
    [x, y + arm, x, y],
    [x, y, x + arm, y],
    [x + size - arm, y, x + size, y],
    [x + size, y, x + size, y + arm],
    [x, y + size - arm, x, y + size],
    [x, y + size, x + arm, y + size],
    [x + size - arm, y + size, x + size, y + size],
    [x + size, y + size - arm, x + size, y + size],
  ]
  return pts
    .map(
      ([x1, y1, x2, y2]) =>
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${GOLD}" stroke-width="1.25"/>`,
    )
    .join('')
}

// crude width estimate for Cormorant Garamond-ish serif, used only to center the header group
function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.52
}

export async function buildLabelSvg(record: LabelRecord): Promise<string> {
  const domain = siteDisplayDomain()
  const qrUrl = qrUrlOf(record.qrId)
  const refCode = refCodeOf(record.qrId)

  const qrSvg = await QRCode.toString(qrUrl, {
    type: 'svg',
    margin: 0,
    color: { dark: BRAND_DARK_EDGE, light: CREAM },
    errorCorrectionLevel: 'H',
  })
  // qrcode emits a full <svg width="…" height="…" viewBox="0 0 N N">…</svg> document;
  // nest it as-is and let width/height/x/y on the wrapper rescale + position it.
  const qrInner = qrSvg.replace(/^<\?xml[^>]*\?>\s*/, '').replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
  const qrViewBoxMatch = qrSvg.match(/viewBox="([^"]+)"/)
  const qrViewBox = qrViewBoxMatch ? qrViewBoxMatch[1] : `0 0 ${LAYOUT.qrSize} ${LAYOUT.qrSize}`

  const { qrX, qrY, qrSize, framePad, frameArm } = LAYOUT
  const logoH = LAYOUT.logoSize
  const logoW = logoH * LOGO_ICON_RATIO
  const domainFontSize = 11
  const domainW = estimateTextWidth(domain, domainFontSize)
  const groupW = logoW + LAYOUT.headerGap + domainW
  const groupX = (PAGE_SIZE - groupW) / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PAGE_SIZE}" height="${PAGE_SIZE}" viewBox="0 0 ${PAGE_SIZE} ${PAGE_SIZE}">
  <defs><style>${fontFaceCss()}</style></defs>
  <rect x="0" y="0" width="${PAGE_SIZE}" height="${PAGE_SIZE}" fill="${BRAND_DARK}"/>
  <rect x="${MARGIN}" y="${MARGIN}" width="${PAGE_SIZE - MARGIN * 2}" height="${PAGE_SIZE - MARGIN * 2}" fill="none" stroke="${GOLD_SOFT}" stroke-width="0.75"/>

  ${cornerOrnament(MARGIN + 2, MARGIN + 8, 0)}
  ${cornerOrnament(PAGE_SIZE - MARGIN - 2, MARGIN + 8, 90)}
  ${cornerOrnament(PAGE_SIZE - MARGIN - 2, PAGE_SIZE - MARGIN - 8, 180)}
  ${cornerOrnament(MARGIN + 2, PAGE_SIZE - MARGIN - 8, 270)}

  <image href="${logoDataUri()}" x="${groupX}" y="${LAYOUT.headerY}" width="${logoW}" height="${logoH}"/>
  <text x="${groupX + logoW + LAYOUT.headerGap}" y="${LAYOUT.headerY + logoH / 2 + domainFontSize * 0.35}" font-family="'Cormorant Garamond', serif" font-weight="600" font-size="${domainFontSize}" fill="${GOLD_SOFT}">${escapeXml(domain)}</text>

  <text x="${PAGE_SIZE / 2}" y="${LAYOUT.nameY + LAYOUT.nameFontSize * 0.85}" font-family="'Cormorant Garamond', serif" font-weight="700" font-size="${LAYOUT.nameFontSize}" fill="${GOLD_SOFT}" text-anchor="middle" letter-spacing="0.6">${escapeXml(record.displayName.toUpperCase())}</text>

  ${divider(LAYOUT.dividerY, LAYOUT.dividerWidth)}

  <rect x="${qrX - framePad}" y="${qrY - framePad}" width="${qrSize + framePad * 2}" height="${qrSize + framePad * 2}" fill="${CREAM}"/>
  <svg x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" viewBox="${qrViewBox}">${qrInner}</svg>
  ${frameCorners(qrX - framePad - 5, qrY - framePad - 5, qrSize + (framePad + 5) * 2, frameArm)}

  <text x="${PAGE_SIZE / 2}" y="${LAYOUT.footerY + LAYOUT.footerFontSize}" font-family="'Cormorant Garamond', serif" font-weight="600" font-size="${LAYOUT.footerFontSize}" fill="${GOLD}" text-anchor="middle" letter-spacing="0.8">Müşteri No: ${escapeXml(refCode)}</text>
</svg>`
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
