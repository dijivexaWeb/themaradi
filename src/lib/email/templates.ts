const BASE_STYLE = `
  font-family: Georgia, 'Times New Roman', serif;
  background: #fbf8f1;
  margin: 0;
  padding: 0;
`

const CARD_STYLE = `
  max-width: 560px;
  margin: 32px auto;
  background: #ffffff;
  border: 1px solid #e6dccb;
  border-radius: 16px;
  overflow: hidden;
`

const HEADER_STYLE = `
  background: #0c3327;
  padding: 28px 32px;
  text-align: center;
`

const BODY_STYLE = `
  padding: 32px;
  color: #1f2d27;
`

const FOOTER_STYLE = `
  padding: 20px 32px;
  border-top: 1px solid #f0ebe0;
  text-align: center;
  font-size: 11px;
  color: #adb5ab;
  font-family: -apple-system, sans-serif;
`

function wrap(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="${BASE_STYLE}">
  <div style="${CARD_STYLE}">
    <div style="${HEADER_STYLE}">
      <span style="font-size:14px;letter-spacing:0.2em;color:#c7a76f;text-transform:uppercase;">The Eternal Memory</span>
    </div>
    <div style="${BODY_STYLE}">
      ${content}
    </div>
    <div style="${FOOTER_STYLE}">
      © The Eternal Memory — theeternalmemory.com<br>
      Bu email otomatik olarak gönderilmiştir, yanıtlamayınız.
    </div>
  </div>
</body>
</html>`
}

export function newGuestbookEntryEmail(params: {
  vaultName: string
  authorName: string
  relation: string | null
  message: string
  dashboardUrl: string
}): string {
  return wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0c3327;">Yeni taziye mesajı</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#788177;font-family:-apple-system,sans-serif;">
      <strong>${params.vaultName}</strong> anma sayfasına yeni bir taziye mesajı geldi.
    </p>

    <div style="background:#fbf8f1;border:1px solid #e6dccb;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:13px;color:#c7a76f;font-family:-apple-system,sans-serif;text-transform:uppercase;letter-spacing:0.1em;">
        ${params.authorName}${params.relation ? ` · ${params.relation}` : ''}
      </p>
      <p style="margin:0;font-size:15px;color:#1f2d27;line-height:1.7;">${params.message}</p>
    </div>

    <p style="margin:0 0 20px;font-size:13px;color:#788177;font-family:-apple-system,sans-serif;">
      Mesaj yayınlanmadan önce onayınızı bekliyor.
    </p>

    <a href="${params.dashboardUrl}" style="
      display:inline-block;
      background:#174f35;
      color:#ffffff;
      text-decoration:none;
      padding:12px 24px;
      border-radius:10px;
      font-size:14px;
      font-family:-apple-system,sans-serif;
      font-weight:600;
    ">Mesajı İncele →</a>
  `)
}

export function messageApprovedEmail(params: {
  vaultName: string
  authorName: string
  memorialUrl: string
}): string {
  return wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0c3327;">Mesajınız yayınlandı</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#788177;font-family:-apple-system,sans-serif;">
      Sayın ${params.authorName},
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#1f2d27;line-height:1.7;font-family:-apple-system,sans-serif;">
      <strong>${params.vaultName}</strong> anma sayfasına bıraktığınız taziye mesajı ailesi tarafından onaylandı ve sayfada yayınlandı.
    </p>

    <a href="${params.memorialUrl}" style="
      display:inline-block;
      background:#174f35;
      color:#ffffff;
      text-decoration:none;
      padding:12px 24px;
      border-radius:10px;
      font-size:14px;
      font-family:-apple-system,sans-serif;
      font-weight:600;
    ">Anma Sayfasını Gör →</a>
  `)
}

export function memorialSignupConfirmEmail(params: {
  authorName: string
  vaultName: string
  confirmUrl: string
}): string {
  return wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0c3327;">Başsağlığı dileriz</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#788177;font-family:-apple-system,sans-serif;">
      Sayın ${params.authorName},
    </p>
    <p style="margin:0 0 20px;font-size:15px;color:#1f2d27;line-height:1.7;font-family:-apple-system,sans-serif;">
      <strong>${params.vaultName}</strong> için anma sayfası talebiniz alındı. Bu zor süreçte sevdiklerinizin anısını yaşatmak istemenizi saygıyla karşılıyoruz.
    </p>
    <p style="margin:0 0 28px;font-size:15px;color:#1f2d27;line-height:1.7;font-family:-apple-system,sans-serif;">
      Hesabınızı aktifleştirmek ve anma sayfanızı oluşturmaya başlamak için lütfen aşağıdaki butona tıklayın.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <a href="${params.confirmUrl}" style="
        display:inline-block;
        background:#174f35;
        color:#ffffff;
        text-decoration:none;
        padding:14px 32px;
        border-radius:12px;
        font-size:15px;
        font-family:-apple-system,sans-serif;
        font-weight:600;
        letter-spacing:0.02em;
      ">E-postamı Doğrula →</a>
    </div>

    <p style="margin:0 0 8px;font-size:13px;color:#788177;line-height:1.6;font-family:-apple-system,sans-serif;">
      Bu bağlantı <strong>24 saat</strong> geçerlidir. Eğer bu hesabı siz açmadıysanız bu emaili görmezden gelebilirsiniz.
    </p>
    <p style="margin:0;font-size:12px;color:#adb5ab;font-family:-apple-system,sans-serif;line-height:1.6;">
      Buton çalışmıyorsa bu adresi tarayıcınıza kopyalayın:<br>
      <span style="color:#5a9e7a;word-break:break-all;">${params.confirmUrl}</span>
    </p>
  `)
}

export function vaultSignupConfirmEmail(params: {
  authorName: string
  confirmUrl: string
}): string {
  return wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0c3327;">E-postanızı doğrulayın</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#788177;font-family:-apple-system,sans-serif;">
      Sayın ${params.authorName},
    </p>
    <p style="margin:0 0 28px;font-size:15px;color:#1f2d27;line-height:1.7;font-family:-apple-system,sans-serif;">
      The Eternal Memory'e hoş geldiniz. Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <a href="${params.confirmUrl}" style="
        display:inline-block;
        background:#174f35;
        color:#ffffff;
        text-decoration:none;
        padding:14px 32px;
        border-radius:12px;
        font-size:15px;
        font-family:-apple-system,sans-serif;
        font-weight:600;
        letter-spacing:0.02em;
      ">E-postamı Doğrula →</a>
    </div>

    <p style="margin:0 0 8px;font-size:13px;color:#788177;line-height:1.6;font-family:-apple-system,sans-serif;">
      Bu bağlantı <strong>24 saat</strong> geçerlidir.
    </p>
    <p style="margin:0;font-size:12px;color:#adb5ab;font-family:-apple-system,sans-serif;line-height:1.6;">
      Buton çalışmıyorsa bu adresi tarayıcınıza kopyalayın:<br>
      <span style="color:#5a9e7a;word-break:break-all;">${params.confirmUrl}</span>
    </p>
  `)
}

export function condolenceReceivedEmail(params: {
  vaultName: string
  authorName: string
  memorialUrl: string
}): string {
  return wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0c3327;">Taziye mesajınız alındı</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#788177;font-family:-apple-system,sans-serif;">
      Sayın ${params.authorName},
    </p>
    <p style="margin:0 0 20px;font-size:15px;color:#1f2d27;line-height:1.7;font-family:-apple-system,sans-serif;">
      <strong>${params.vaultName}</strong> anma sayfasına bıraktığınız taziye mesajı tarafımıza ulaştı.
      Aile onayının ardından sayfada yayınlanacaktır.
    </p>
    <p style="margin:0 0 28px;font-size:15px;color:#1f2d27;line-height:1.7;font-family:-apple-system,sans-serif;">
      Bu zor günde destek olduğunuz için teşekkür ederiz. Paylaştığınız her söz, anının yaşatılmasına katkı sağlar.
    </p>

    <a href="${params.memorialUrl}" style="
      display:inline-block;
      background:#174f35;
      color:#ffffff;
      text-decoration:none;
      padding:12px 24px;
      border-radius:10px;
      font-size:14px;
      font-family:-apple-system,sans-serif;
      font-weight:600;
    ">Anma Sayfasını Gör →</a>

    <p style="margin:28px 0 0;font-size:12px;color:#adb5ab;font-family:-apple-system,sans-serif;line-height:1.6;">
      Mesajınız onaylandığında ayrıca bildirim gönderilecektir.
    </p>
  `)
}

export function adminNewRegistrationEmail(params: {
  senderName: string
  senderEmail: string
  phone: string
  productType: 'memorial_one_time' | 'vault_setup' | string
  vaultName: string
  paymentMethod: 'bank_transfer' | 'paypal' | string
  amount: number
  adminUrl: string
}): string {
  const productLabel = params.productType === 'memorial_one_time' ? 'Anma Sayfası' : 'Yaşam Kasası'
  const methodLabel = params.paymentMethod === 'paypal' ? 'PayPal' : 'Banka Havalesi'

  return wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0c3327;">🔔 Yeni kayıt — onay bekliyor</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#788177;font-family:-apple-system,sans-serif;">
      Sisteme yeni bir kayıt geldi. Ödeme doğrulandıktan sonra hesabı aktifleştirebilirsiniz.
    </p>

    <div style="background:#fbf8f1;border:1px solid #e6dccb;border-radius:12px;padding:20px;margin-bottom:24px;font-family:-apple-system,sans-serif;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:6px 0;color:#788177;width:40%;">İsim</td><td style="padding:6px 0;color:#1f2d27;font-weight:600;">${params.senderName}</td></tr>
        <tr><td style="padding:6px 0;color:#788177;">E-posta</td><td style="padding:6px 0;color:#1f2d27;">${params.senderEmail}</td></tr>
        <tr><td style="padding:6px 0;color:#788177;">Telefon</td><td style="padding:6px 0;color:#1f2d27;">${params.phone}</td></tr>
        <tr><td style="padding:6px 0;color:#788177;">Ürün</td><td style="padding:6px 0;color:#1f2d27;">${productLabel}</td></tr>
        <tr><td style="padding:6px 0;color:#788177;">Hesap Adı</td><td style="padding:6px 0;color:#1f2d27;">${params.vaultName}</td></tr>
        <tr><td style="padding:6px 0;color:#788177;">Ödeme Yöntemi</td><td style="padding:6px 0;color:#1f2d27;">${methodLabel}</td></tr>
        <tr><td style="padding:6px 0;color:#788177;">Tutar</td><td style="padding:6px 0;color:#174f35;font-weight:700;">${params.amount} ₾</td></tr>
      </table>
    </div>

    <a href="${params.adminUrl}" style="
      display:inline-block;
      background:#174f35;
      color:#ffffff;
      text-decoration:none;
      padding:12px 24px;
      border-radius:10px;
      font-size:14px;
      font-family:-apple-system,sans-serif;
      font-weight:600;
    ">Admin Paneline Git →</a>

    <p style="margin:20px 0 0;font-size:12px;color:#adb5ab;font-family:-apple-system,sans-serif;line-height:1.6;">
      Veya bu adresi tarayıcınıza kopyalayın:<br>
      <a href="${params.adminUrl}" style="color:#5a9e7a;word-break:break-all;">${params.adminUrl}</a>
    </p>
  `)
}

export function accountActivatedEmail(params: {
  authorName: string
  loginUrl: string
}): string {
  return wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0c3327;">Hesabınız aktifleştirildi ✓</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#788177;font-family:-apple-system,sans-serif;">
      Sayın ${params.authorName},
    </p>
    <p style="margin:0 0 20px;font-size:15px;color:#1f2d27;line-height:1.7;font-family:-apple-system,sans-serif;">
      The Eternal Memory hesabınız ekibimiz tarafından onaylandı ve aktifleştirildi. Artık giriş yapabilirsiniz.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <a href="${params.loginUrl}" style="
        display:inline-block;
        background:#174f35;
        color:#ffffff;
        text-decoration:none;
        padding:14px 32px;
        border-radius:12px;
        font-size:15px;
        font-family:-apple-system,sans-serif;
        font-weight:600;
        letter-spacing:0.02em;
      ">Giriş Yap →</a>
    </div>

    <p style="margin:0;font-size:13px;color:#788177;line-height:1.6;font-family:-apple-system,sans-serif;">
      Herhangi bir sorunuz için bize ulaşabilirsiniz.
    </p>
  `)
}

export function testEmail(toName: string): string {
  return wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0c3327;">Test emaili</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#1f2d27;font-family:-apple-system,sans-serif;">
      Merhaba ${toName},
    </p>
    <p style="margin:0;font-size:15px;color:#788177;font-family:-apple-system,sans-serif;line-height:1.7;">
      Email sistemi başarıyla yapılandırıldı. Bu mesaj The Eternal Memory admin panelinden gönderilmiştir.
    </p>
  `)
}
