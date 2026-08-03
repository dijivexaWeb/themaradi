import PDFDocument from 'pdfkit'

export interface LetterRecord {
  displayName: string
}

const PAGE_WIDTH = 595 // A4
const PAGE_HEIGHT = 842
const BRAND_DARK = '#0c3327'
const BRAND_CREAM = '#fffdf7'
const BRAND_MUTED = '#6b7280'
const BRAND_GOLD = '#c7a76f'
const MARGIN = 64

function letterBody(name: string): string {
  return `Değerli Aile,

${name} adına, anısını yaşatmak amacıyla The Eternal Memory ekibi olarak özel bir anma sayfası hazırladık.

Bu zarfın içinde, sevdiğinizin anısına ithaf edilmiş bir QR mezar plakası bulacaksınız. Bu plaka, telefonunuzun kamerasıyla okutulduğunda, ${name}'in fotoğraflarını, hayat hikayesini ve anılarını içeren kişiye özel dijital sayfasına doğrudan ulaşmanızı sağlar.

Bu sayfayı sahiplenmek ve dilediğiniz şekilde düzenlemek için ekte yer alan kullanıcı adı ve şifre ile theeternalmemory.com adresinden giriş yapmanız yeterlidir. Sayfayı sahiplendiğinizde, fotoğraf, video ve anılarla zenginleştirebilir; sevdiklerinizin de ziyaret edip anılarını paylaşmasına imkân tanıyabilirsiniz.

Sevdiklerimiz, onları tanıyanların kalbinde yaşamaya devam eder. Biz de bu anıyı dijital dünyada, zamanın ve mekânın ötesinde, sonsuza dek yaşatmak için buradayız.

The Eternal Memory'yi tercih ettiğiniz için içtenlikle teşekkür ederiz.

Saygılarımızla,
The Eternal Memory Ekibi`
}

export async function buildLetterPdf(records: LetterRecord[]): Promise<Buffer> {
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

    // Letterhead
    doc.rect(0, 0, PAGE_WIDTH, 4).fill(BRAND_GOLD)
    doc.font('Helvetica-Bold').fontSize(16).fillColor(BRAND_DARK)
      .text('THE ETERNAL MEMORY', MARGIN, 48)
    doc.font('Helvetica').fontSize(9).fillColor(BRAND_MUTED)
      .text('Anıyı sonsuza dek yaşatan dijital anma platformu · theeternalmemory.com', MARGIN, 70)
    doc.moveTo(MARGIN, 96).lineTo(PAGE_WIDTH - MARGIN, 96).strokeColor(BRAND_GOLD).lineWidth(1).stroke()

    // Body
    doc.font('Helvetica').fontSize(11.5).fillColor(BRAND_DARK)
      .text(letterBody(r.displayName), MARGIN, 130, {
        width: PAGE_WIDTH - MARGIN * 2,
        align: 'left',
        lineGap: 5,
      })

    // Footer
    doc.moveTo(MARGIN, PAGE_HEIGHT - 70).lineTo(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 70)
      .strokeColor(BRAND_GOLD).lineWidth(1).stroke()
    doc.font('Helvetica').fontSize(8).fillColor(BRAND_MUTED)
      .text('The Eternal Memory · theeternalmemory.com · destek@theeternalmemory.com', MARGIN, PAGE_HEIGHT - 55, {
        width: PAGE_WIDTH - MARGIN * 2,
        align: 'center',
      })
  }

  doc.end()
  return done
}
