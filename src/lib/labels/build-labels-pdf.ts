import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'

export interface LabelRecord {
  displayName: string
  qrId: string
  loginUsername: string | null
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theeternalmemory.com'
const PAGE_WIDTH = 288 // 4in @72dpi
const PAGE_HEIGHT = 432 // 6in @72dpi
const BRAND_DARK = '#0c3327'
const BRAND_CREAM = '#fffdf7'
const BRAND_MUTED = '#6b7280'

export async function buildLabelsPdf(records: LabelRecord[]): Promise<Buffer> {
  const doc = new PDFDocument({ size: [PAGE_WIDTH, PAGE_HEIGHT], margin: 0 })
  const chunks: Buffer[] = []
  doc.on('data', (c) => chunks.push(c))
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })

  for (let i = 0; i < records.length; i++) {
    const r = records[i]
    if (i > 0) doc.addPage({ size: [PAGE_WIDTH, PAGE_HEIGHT], margin: 0 })

    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(BRAND_CREAM)

    doc
      .fillColor(BRAND_DARK)
      .font('Helvetica-Bold')
      .fontSize(18)
      .text(r.displayName, 20, 30, { width: PAGE_WIDTH - 40, align: 'center' })

    const qrUrl = `${SITE_URL}/q/${r.qrId}`
    const qrPng = await QRCode.toBuffer(qrUrl, {
      width: 220,
      margin: 1,
      color: { dark: BRAND_DARK, light: BRAND_CREAM },
      errorCorrectionLevel: 'H',
    })
    const qrSize = 220
    doc.image(qrPng, (PAGE_WIDTH - qrSize) / 2, 100, { width: qrSize, height: qrSize })

    const refCode = r.qrId.replace('mem-', '').toUpperCase()
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor(BRAND_DARK)
      .text(r.loginUsername ?? '—', 20, PAGE_HEIGHT - 65, { width: PAGE_WIDTH - 40, align: 'center' })
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(BRAND_MUTED)
      .text(`Ref: ${refCode}`, 20, PAGE_HEIGHT - 42, { width: PAGE_WIDTH - 40, align: 'center' })
  }

  doc.end()
  return done
}
