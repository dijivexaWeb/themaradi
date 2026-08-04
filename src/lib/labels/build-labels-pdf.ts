import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
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

export interface LabelRecord {
  displayName: string
  qrId: string
  loginUsername: string | null
}

function drawCornerOrnament(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  rotationDeg: number,
) {
  doc.save()
  doc.translate(x, y).rotate(rotationDeg)
  doc.lineWidth(1)
  doc.strokeColor(GOLD).fillColor(GOLD)
  doc.moveTo(0, 0).quadraticCurveTo(14, 2, 26, 0).stroke()
  const leaves: [number, number, number][] = [
    [4, -1, 0.55],
    [11, -1.5, 0.75],
    [18, -1.5, 0.6],
    [24, -1, 0.4],
  ]
  for (const [lx, ly, scale] of leaves) {
    doc.save()
    doc.translate(lx, ly).scale(scale)
    doc.moveTo(0, 0).quadraticCurveTo(3, -6, 0, -11).quadraticCurveTo(-3, -6, 0, 0).fill()
    doc.restore()
  }
  doc.restore()
}

function drawDivider(doc: PDFKit.PDFDocument, cy: number, width: number) {
  const cx = PAGE_SIZE / 2
  doc.strokeColor(GOLD).lineWidth(0.75)
  doc.moveTo(cx - width / 2, cy).lineTo(cx - 6, cy).stroke()
  doc.moveTo(cx + 6, cy).lineTo(cx + width / 2, cy).stroke()
  doc.save()
  doc.translate(cx, cy).rotate(45)
  doc.rect(-2.5, -2.5, 5, 5).fill(GOLD)
  doc.restore()
}

function drawFrameCorners(doc: PDFKit.PDFDocument, x: number, y: number, size: number, arm: number) {
  doc.strokeColor(GOLD).lineWidth(1.25)
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
  for (const [x1, y1, x2, y2] of pts) {
    doc.moveTo(x1, y1).lineTo(x2, y2).stroke()
  }
}

export async function buildLabelsPdf(records: LabelRecord[]): Promise<Buffer> {
  const doc = new PDFDocument({ size: [PAGE_SIZE, PAGE_SIZE], margin: 0 })
  doc.registerFont('Serif-Bold', FONT_BOLD_PATH)
  doc.registerFont('Serif-SemiBold', FONT_SEMIBOLD_PATH)

  const chunks: Buffer[] = []
  doc.on('data', (c) => chunks.push(c))
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })

  const domain = siteDisplayDomain()

  for (let i = 0; i < records.length; i++) {
    const r = records[i]
    if (i > 0) doc.addPage({ size: [PAGE_SIZE, PAGE_SIZE], margin: 0 })

    doc.rect(0, 0, PAGE_SIZE, PAGE_SIZE).fill(BRAND_DARK)
    doc
      .rect(MARGIN, MARGIN, PAGE_SIZE - MARGIN * 2, PAGE_SIZE - MARGIN * 2)
      .lineWidth(0.75)
      .strokeColor(GOLD_SOFT)
      .stroke()

    drawCornerOrnament(doc, MARGIN + 2, MARGIN + 8, 0)
    drawCornerOrnament(doc, PAGE_SIZE - MARGIN - 2, MARGIN + 8, 90)
    drawCornerOrnament(doc, PAGE_SIZE - MARGIN - 2, PAGE_SIZE - MARGIN - 8, 180)
    drawCornerOrnament(doc, MARGIN + 2, PAGE_SIZE - MARGIN - 8, 270)

    // header: logo icon + site address, centered as a pair
    const logoH = LAYOUT.logoSize
    const logoW = logoH * LOGO_ICON_RATIO
    doc.font('Serif-SemiBold').fontSize(11)
    const domainW = doc.widthOfString(domain)
    const groupW = logoW + LAYOUT.headerGap + domainW
    const groupX = (PAGE_SIZE - groupW) / 2
    doc.image(LOGO_ICON_PATH, groupX, LAYOUT.headerY, { width: logoW, height: logoH })
    doc
      .fillColor(GOLD_SOFT)
      .text(domain, groupX + logoW + LAYOUT.headerGap, LAYOUT.headerY + (logoH - 11) / 2 - 1, {
        width: domainW + 2,
        align: 'left',
      })

    // owner name
    doc
      .fillColor(GOLD_SOFT)
      .font('Serif-Bold')
      .fontSize(LAYOUT.nameFontSize)
      .text(r.displayName.toUpperCase(), MARGIN + 8, LAYOUT.nameY, {
        width: PAGE_SIZE - (MARGIN + 8) * 2,
        align: 'center',
        characterSpacing: 0.6,
      })

    drawDivider(doc, LAYOUT.dividerY, LAYOUT.dividerWidth)

    // QR
    const qrUrl = qrUrlOf(r.qrId)
    const qrPng = await QRCode.toBuffer(qrUrl, {
      width: 400,
      margin: 0,
      color: { dark: BRAND_DARK_EDGE, light: CREAM },
      errorCorrectionLevel: 'H',
    })
    const { qrX, qrY, qrSize, framePad, frameArm } = LAYOUT
    doc.rect(qrX - framePad, qrY - framePad, qrSize + framePad * 2, qrSize + framePad * 2).fill(CREAM)
    doc.image(qrPng, qrX, qrY, { width: qrSize, height: qrSize })
    drawFrameCorners(doc, qrX - framePad - 5, qrY - framePad - 5, qrSize + (framePad + 5) * 2, frameArm)

    // footer: customer id (system ref code) — distinguishes profiles printed together
    const refCode = refCodeOf(r.qrId)
    doc
      .fillColor(GOLD)
      .font('Serif-SemiBold')
      .fontSize(LAYOUT.footerFontSize)
      .text(`Müşteri No: ${refCode}`, MARGIN + 8, LAYOUT.footerY, {
        width: PAGE_SIZE - (MARGIN + 8) * 2,
        align: 'center',
        characterSpacing: 0.8,
      })
  }

  doc.end()
  return done
}
