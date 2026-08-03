import PDFDocument from 'pdfkit'

const PAGE_WIDTH = 595 // A4
const PAGE_HEIGHT = 842
const BRAND_DARK = '#0c3327'
const BRAND_CREAM = '#fffdf7'
const BRAND_MUTED = '#6b7280'
const BRAND_GOLD = '#c7a76f'
const MARGIN = 64

const STEPS: { title: string; body: string }[] = [
  {
    title: '1. QR Kodu Okutun',
    body: 'Telefonunuzun kamera uygulamasını açın ve plaka üzerindeki QR kodu kadraja alın. Ekranda beliren bağlantıya dokunun; tarayıcınız otomatik olarak anma sayfasına yönlendirilecektir.',
  },
  {
    title: '2. Giriş Yapın',
    body: 'theeternalmemory.com/login adresine gidin. Size gönderilen zarfta yer alan kullanıcı adı ve şifre ile giriş yapın.',
  },
  {
    title: '3. Sayfayı Sahiplenin',
    body: 'Giriş yaptığınızda ekranda "Sahiplen" butonunu göreceksiniz. Bu butona bastığınızda onay ister — onayladığınızda anma sayfası sizin adınıza aktif hale gelir ve düzenlemeye açılır. Bu adım tek seferliktir, sonrasında geri alınamaz.',
  },
  {
    title: '4. İçeriği Zenginleştirin',
    body: 'Sahiplendikten sonra sevdiğinizin fotoğraflarını, videolarını, hayat hikayesini ve özel anılarını sayfaya ekleyebilirsiniz. Sayfa dilediğiniz zaman düzenlenebilir.',
  },
  {
    title: '5. Paylaşın',
    body: 'Anma sayfasının bağlantısını aile ve yakın çevrenizle paylaşabilir, ziyaretçilerin taziye/anı bırakmasına imkân tanıyabilirsiniz.',
  },
]

export async function buildGuidePdf(): Promise<Buffer> {
  const doc = new PDFDocument({ size: [PAGE_WIDTH, PAGE_HEIGHT], margin: 0 })
  const chunks: Buffer[] = []
  doc.on('data', (c) => chunks.push(c))
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })

  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(BRAND_CREAM)
  doc.rect(0, 0, PAGE_WIDTH, 4).fill(BRAND_GOLD)

  doc.font('Helvetica-Bold').fontSize(16).fillColor(BRAND_DARK)
    .text('THE ETERNAL MEMORY', MARGIN, 48)
  doc.font('Helvetica').fontSize(9).fillColor(BRAND_MUTED)
    .text('theeternalmemory.com', MARGIN, 70)
  doc.moveTo(MARGIN, 96).lineTo(PAGE_WIDTH - MARGIN, 96).strokeColor(BRAND_GOLD).lineWidth(1).stroke()

  doc.font('Helvetica-Bold').fontSize(20).fillColor(BRAND_DARK)
    .text('Kullanım Kılavuzu', MARGIN, 118)
  doc.font('Helvetica').fontSize(10.5).fillColor(BRAND_MUTED)
    .text('Anma sayfanızı sahiplenmek ve düzenlemek için aşağıdaki adımları izleyin.', MARGIN, 148)

  let y = 190
  for (const step of STEPS) {
    doc.font('Helvetica-Bold').fontSize(13).fillColor(BRAND_DARK).text(step.title, MARGIN, y)
    doc.font('Helvetica').fontSize(10.5).fillColor(BRAND_DARK)
      .text(step.body, MARGIN, y + 20, { width: PAGE_WIDTH - MARGIN * 2, lineGap: 3 })
    y += 20 + doc.heightOfString(step.body, { width: PAGE_WIDTH - MARGIN * 2, lineGap: 3 }) + 26
  }

  doc.moveTo(MARGIN, PAGE_HEIGHT - 70).lineTo(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 70)
    .strokeColor(BRAND_GOLD).lineWidth(1).stroke()
  doc.font('Helvetica').fontSize(8).fillColor(BRAND_MUTED)
    .text('Sorularınız için: destek@theeternalmemory.com', MARGIN, PAGE_HEIGHT - 55, {
      width: PAGE_WIDTH - MARGIN * 2,
      align: 'center',
    })

  doc.end()
  return done
}
