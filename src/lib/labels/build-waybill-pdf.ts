import PDFDocument from 'pdfkit'

export interface WaybillRecord {
  displayName: string
  address: string | null
  phone: string | null
  qrId: string
}

const PAGE_WIDTH = 288 // 4in
const PAGE_HEIGHT = 432 // 6in
const BRAND_DARK = '#0c3327'
const BRAND_CREAM = '#fffdf7'
const BRAND_MUTED = '#6b7280'
const BRAND_GOLD = '#c7a76f'

function labelValue(doc: PDFKit.PDFDocument, y: number, label: string, value: string) {
  doc.font('Helvetica').fontSize(8).fillColor(BRAND_MUTED).text(label.toUpperCase(), 24, y)
  doc.font('Helvetica-Bold').fontSize(13).fillColor(BRAND_DARK).text(value, 24, y + 12, { width: PAGE_WIDTH - 48 })
}

export async function buildWaybillPdf(records: WaybillRecord[]): Promise<Buffer> {
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
    doc.rect(0, 0, PAGE_WIDTH, 6).fill(BRAND_GOLD)

    doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK)
      .text('THE ETERNAL MEMORY', 24, 24)
    doc.font('Helvetica').fontSize(8).fillColor(BRAND_MUTED)
      .text('Kargo Adres Etiketi', 24, 38)

    doc.moveTo(24, 58).lineTo(PAGE_WIDTH - 24, 58).strokeColor(BRAND_GOLD).lineWidth(1).stroke()

    let y = 80
    labelValue(doc, y, 'Alıcı', r.displayName)
    y += 55
    labelValue(doc, y, 'Adres', r.address ?? '—')
    y += 90
    if (r.phone) {
      labelValue(doc, y, 'Telefon', r.phone)
      y += 55
    }

    const refCode = r.qrId.replace('mem-', '').toUpperCase()
    doc.font('Helvetica').fontSize(8).fillColor(BRAND_MUTED)
      .text(`Referans Kod: ${refCode}`, 24, PAGE_HEIGHT - 30)
  }

  doc.end()
  return done
}
