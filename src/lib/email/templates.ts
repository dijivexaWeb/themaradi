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
  paymentMethod: 'bank_transfer' | 'whatsapp' | string
  amount: number
  adminUrl: string
}): string {
  const productLabel = params.productType === 'memorial_one_time' ? 'Anma Sayfası' : 'Yaşam Kasası'
  const methodLabel = params.paymentMethod === 'whatsapp' ? 'WhatsApp' : 'Banka Havalesi'

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

// ─── Sipariş Durumu Email Şablonları (çok dilli) ────────────────────────────

export type EmailLocale = 'tr' | 'ka' | 'ru' | 'en'

function normalizeEmailLocale(locale: string | null | undefined): EmailLocale {
  return locale === 'tr' || locale === 'ka' || locale === 'ru' || locale === 'en' ? locale : 'en'
}

const ORDER_CREATED_STRINGS: Record<EmailLocale, {
  subject: string; heading: string; greeting: string; body: string
  orderCodeLabel: string; cta: string
}> = {
  tr: {
    subject: 'Siparişiniz oluşturuldu — The Eternal Memory',
    heading: 'Siparişiniz oluşturuldu',
    greeting: 'Merhaba',
    body: 'Hesabınız ve sipariş kaydınız oluşturuldu. Ödeme adımlarını tamamladıktan sonra hesabınıza giriş yaparak anma profili bilgilerini ekleyebilirsiniz.',
    orderCodeLabel: 'Sipariş Kodunuz', cta: 'Ödeme Sayfasına Git →',
  },
  ka: {
    subject: 'თქვენი შეკვეთა შეიქმნა — The Eternal Memory',
    heading: 'თქვენი შეკვეთა შეიქმნა',
    greeting: 'გამარჯობა',
    body: 'თქვენი ანგარიში და შეკვეთა შეიქმნა. გადახდის დასრულების შემდეგ შეგიძლიათ შეხვიდეთ ანგარიშში და დაამატოთ პროფილის ინფორმაცია.',
    orderCodeLabel: 'თქვენი შეკვეთის კოდი', cta: 'გადახდის გვერდზე გადასვლა →',
  },
  ru: {
    subject: 'Ваш заказ оформлен — The Eternal Memory',
    heading: 'Ваш заказ оформлен',
    greeting: 'Здравствуйте',
    body: 'Ваш аккаунт и заказ созданы. После завершения оплаты вы сможете войти в аккаунт и добавить информацию для профиля памяти.',
    orderCodeLabel: 'Код вашего заказа', cta: 'Перейти к оплате →',
  },
  en: {
    subject: 'Your order has been created — The Eternal Memory',
    heading: 'Your order has been created',
    greeting: 'Hello',
    body: 'Your account and order have been created. After completing payment, you can log in to your account and add your memorial profile information.',
    orderCodeLabel: 'Your Order Code', cta: 'Go to Payment Page →',
  },
}

export function orderCreatedEmail(params: {
  recipientName: string
  orderCode: string
  paymentUrl: string
  locale?: string
}): string {
  const s = ORDER_CREATED_STRINGS[normalizeEmailLocale(params.locale)]
  return wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0c3327;">${s.heading}</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#788177;font-family:-apple-system,sans-serif;">
      ${s.greeting} ${params.recipientName},
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#1f2d27;line-height:1.7;font-family:-apple-system,sans-serif;">
      ${s.body}
    </p>

    <div style="background:#fbf8f1;border:1px solid #e6dccb;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:12px;color:#c7a76f;font-family:-apple-system,sans-serif;text-transform:uppercase;letter-spacing:0.1em;">${s.orderCodeLabel}</p>
      <p style="margin:0;font-size:20px;color:#174f35;font-family:monospace;font-weight:700;letter-spacing:0.05em;">${params.orderCode}</p>
    </div>

    <div style="text-align:center;margin:32px 0;">
      <a href="${params.paymentUrl}" style="
        display:inline-block;background:#174f35;color:#ffffff;text-decoration:none;
        padding:14px 32px;border-radius:12px;font-size:15px;font-family:-apple-system,sans-serif;
        font-weight:600;letter-spacing:0.02em;
      ">${s.cta}</a>
    </div>
  `)
}

export function orderCreatedEmailSubject(locale?: string): string {
  return ORDER_CREATED_STRINGS[normalizeEmailLocale(locale)].subject
}

const PAYMENT_VERIFICATION_PENDING_STRINGS: Record<EmailLocale, {
  subject: string; heading: string; greeting: string; body: string
}> = {
  tr: {
    subject: 'Ödeme bildiriminiz alındı — The Eternal Memory',
    heading: 'Ödeme bildiriminiz alındı',
    greeting: 'Merhaba',
    body: 'Ödeme bildiriminiz alınmıştır ve doğrulama sürecine alınmıştır. Kontrol tamamlandığında size tekrar e-posta ile bilgi verilecektir. Bu sırada hesabınıza giriş yaparak anma profili için gerekli bilgileri hazırlamaya başlayabilirsiniz.',
  },
  ka: {
    subject: 'თქვენი გადახდის შეტყობინება მიღებულია — The Eternal Memory',
    heading: 'თქვენი გადახდის შეტყობინება მიღებულია',
    greeting: 'გამარჯობა',
    body: 'თქვენი გადახდის შეტყობინება მიღებულია და გადამოწმების პროცესშია. შემოწმების დასრულების შემდეგ კვლავ მიიღებთ ელფოსტას. ამასობაში შეგიძლიათ შეხვიდეთ ანგარიშში და დაიწყოთ პროფილის ინფორმაციის მომზადება.',
  },
  ru: {
    subject: 'Уведомление об оплате получено — The Eternal Memory',
    heading: 'Уведомление об оплате получено',
    greeting: 'Здравствуйте',
    body: 'Ваше уведомление об оплате получено и передано на проверку. После завершения проверки вам придёт повторное письмо. Тем временем вы можете войти в аккаунт и начать подготовку информации для профиля памяти.',
  },
  en: {
    subject: 'Your payment notification has been received — The Eternal Memory',
    heading: 'Your payment notification has been received',
    greeting: 'Hello',
    body: 'Your payment notification has been received and is under verification. You will receive another email once the check is complete. In the meantime, you can log in to your account and start preparing the information for your memorial profile.',
  },
}

export function paymentVerificationPendingEmail(params: {
  recipientName: string
  orderCode: string
  locale?: string
}): string {
  const s = PAYMENT_VERIFICATION_PENDING_STRINGS[normalizeEmailLocale(params.locale)]
  return wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0c3327;">${s.heading}</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#788177;font-family:-apple-system,sans-serif;">
      ${s.greeting} ${params.recipientName},
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#1f2d27;line-height:1.7;font-family:-apple-system,sans-serif;">
      ${s.body}
    </p>
    <p style="margin:0;font-size:13px;color:#adb5ab;font-family:-apple-system,sans-serif;">
      ${params.orderCode}
    </p>
  `)
}

export function paymentVerificationPendingEmailSubject(locale?: string): string {
  return PAYMENT_VERIFICATION_PENDING_STRINGS[normalizeEmailLocale(locale)].subject
}

const PAYMENT_CONFIRMED_STRINGS: Record<EmailLocale, {
  subject: string; heading: string; greeting: string; body: string; cta: string
}> = {
  tr: {
    subject: 'Ödemeniz onaylandı — The Eternal Memory',
    heading: 'Ödemeniz onaylandı ✓',
    greeting: 'Merhaba',
    body: 'Ödemeniz onaylandı. Artık hesabınıza giriş yaparak fotoğraf, video, hayat hikayesi ve diğer anma profili bilgilerini tamamlayabilirsiniz.',
    cta: 'Hesabıma Giriş Yap →',
  },
  ka: {
    subject: 'თქვენი გადახდა დადასტურდა — The Eternal Memory',
    heading: 'თქვენი გადახდა დადასტურდა ✓',
    greeting: 'გამარჯობა',
    body: 'თქვენი გადახდა დადასტურდა. ახლა შეგიძლიათ შეხვიდეთ ანგარიშში და დაასრულოთ ფოტოების, ვიდეოს, ცხოვრების ისტორიისა და სხვა პროფილის ინფორმაციის დამატება.',
    cta: 'შესვლა ანგარიშში →',
  },
  ru: {
    subject: 'Ваша оплата подтверждена — The Eternal Memory',
    heading: 'Ваша оплата подтверждена ✓',
    greeting: 'Здравствуйте',
    body: 'Ваша оплата подтверждена. Теперь вы можете войти в аккаунт и завершить добавление фотографий, видео, истории жизни и другой информации для профиля памяти.',
    cta: 'Войти в аккаунт →',
  },
  en: {
    subject: 'Your payment has been confirmed — The Eternal Memory',
    heading: 'Your payment has been confirmed ✓',
    greeting: 'Hello',
    body: 'Your payment has been confirmed. You can now log in to your account and complete adding photos, videos, life story, and other memorial profile information.',
    cta: 'Log In to My Account →',
  },
}

export function paymentConfirmedEmail(params: {
  recipientName: string
  loginUrl: string
  locale?: string
}): string {
  const s = PAYMENT_CONFIRMED_STRINGS[normalizeEmailLocale(params.locale)]
  return wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0c3327;">${s.heading}</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#788177;font-family:-apple-system,sans-serif;">
      ${s.greeting} ${params.recipientName},
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#1f2d27;line-height:1.7;font-family:-apple-system,sans-serif;">
      ${s.body}
    </p>

    <div style="text-align:center;margin:32px 0;">
      <a href="${params.loginUrl}" style="
        display:inline-block;background:#174f35;color:#ffffff;text-decoration:none;
        padding:14px 32px;border-radius:12px;font-size:15px;font-family:-apple-system,sans-serif;
        font-weight:600;letter-spacing:0.02em;
      ">${s.cta}</a>
    </div>
  `)
}

export function paymentConfirmedEmailSubject(locale?: string): string {
  return PAYMENT_CONFIRMED_STRINGS[normalizeEmailLocale(locale)].subject
}

// ─── Shipping / Kargo Email Templates ───────────────────────────────────────

export function shippingPreparingEmail(params: {
  recipientName: string
  vaultName: string
  shippingAddress: string
}): string {
  return wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0c3327;">📦 Tabelanız Hazırlanıyor</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#788177;font-family:-apple-system,sans-serif;">
      Merhaba <strong>${params.recipientName}</strong>, <strong>${params.vaultName}</strong> için sipariş ettiğiniz QR kod tabelası hazırlanmaya başlandı.
    </p>

    <div style="background:#fbf8f1;border:1px solid #e6dccb;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:12px;color:#c7a76f;font-family:-apple-system,sans-serif;text-transform:uppercase;letter-spacing:0.1em;">Kargo Adresi</p>
      <p style="margin:0;font-size:14px;color:#1f2d27;font-family:-apple-system,sans-serif;line-height:1.7;white-space:pre-wrap;">${params.shippingAddress}</p>
    </div>

    <div style="background:#f0f9f4;border:1px solid #b8e0c8;border-radius:10px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#1a6640;font-family:-apple-system,sans-serif;line-height:1.6;">
        ✅ Sipariş alındı<br>
        🔄 <strong>Hazırlanıyor</strong><br>
        📦 Kargoya verilecek<br>
        🏠 Teslim edilecek
      </p>
    </div>

    <p style="margin:0;font-size:13px;color:#788177;font-family:-apple-system,sans-serif;line-height:1.7;">
      Tabelanız kargoya verildiğinde takip numaranızı içeren bir email daha alacaksınız.
    </p>
  `)
}

export function shippingShippedEmail(params: {
  recipientName: string
  vaultName: string
  trackingNumber: string
  trackingCarrier: string
  shippingAddress: string
}): string {
  return wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0c3327;">🚚 Tabelanız Kargoya Verildi</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#788177;font-family:-apple-system,sans-serif;">
      Merhaba <strong>${params.recipientName}</strong>, <strong>${params.vaultName}</strong> için sipariş ettiğiniz QR kod tabelası kargoya verildi.
    </p>

    <div style="background:#fbf8f1;border:1px solid #e6dccb;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:12px;color:#c7a76f;font-family:-apple-system,sans-serif;text-transform:uppercase;letter-spacing:0.1em;">Kargo Bilgileri</p>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:13px;color:#788177;font-family:-apple-system,sans-serif;">Kargo Firması</span>
        <span style="font-size:13px;color:#1f2d27;font-family:-apple-system,sans-serif;font-weight:600;">${params.trackingCarrier}</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span style="font-size:13px;color:#788177;font-family:-apple-system,sans-serif;">Takip Numarası</span>
        <span style="font-size:15px;color:#174f35;font-family:monospace;font-weight:700;letter-spacing:0.05em;">${params.trackingNumber}</span>
      </div>
    </div>

    <div style="background:#fbf8f1;border:1px solid #e6dccb;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:12px;color:#c7a76f;font-family:-apple-system,sans-serif;text-transform:uppercase;letter-spacing:0.1em;">Teslimat Adresi</p>
      <p style="margin:0;font-size:14px;color:#1f2d27;font-family:-apple-system,sans-serif;line-height:1.7;white-space:pre-wrap;">${params.shippingAddress}</p>
    </div>

    <div style="background:#f0f9f4;border:1px solid #b8e0c8;border-radius:10px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#1a6640;font-family:-apple-system,sans-serif;line-height:1.6;">
        ✅ Sipariş alındı<br>
        ✅ Hazırlandı<br>
        🚚 <strong>Kargoda</strong><br>
        🏠 Teslim edilecek
      </p>
    </div>

    <p style="margin:0;font-size:13px;color:#788177;font-family:-apple-system,sans-serif;line-height:1.7;">
      Tabelanız teslim edildiğinde lütfen <strong>panelinizdeki "Teslim Aldım"</strong> butonuna basın.
    </p>
  `)
}

export function shippingDeliveredEmail(params: {
  recipientName: string
  vaultName: string
  confirmUrl: string
}): string {
  return wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0c3327;">🏠 Tabelanız Teslim Edildi</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#788177;font-family:-apple-system,sans-serif;">
      Merhaba <strong>${params.recipientName}</strong>, <strong>${params.vaultName}</strong> için sipariş ettiğiniz QR kod tabelası teslim edildi olarak işaretlendi.
    </p>

    <p style="margin:0 0 20px;font-size:15px;color:#1f2d27;line-height:1.7;">
      Tabelanızı teslim aldıysanız aşağıdaki butona basarak onaylayın.
    </p>

    <a href="${params.confirmUrl}" style="
      display:inline-block;
      background:#174f35;
      color:#ffffff;
      text-decoration:none;
      padding:14px 32px;
      border-radius:10px;
      font-size:15px;
      font-weight:600;
      font-family:-apple-system,sans-serif;
      margin-bottom:24px;
    ">✅ Teslim Aldım</a>

    <p style="margin:0;font-size:12px;color:#788177;font-family:-apple-system,sans-serif;line-height:1.7;">
      Tabelanızı almadıysanız kargo firmasıyla iletişime geçin ve bize bildirin.
    </p>
  `)
}

export function shippingConfirmedEmail(params: {
  recipientName: string
  vaultName: string
}): string {
  return wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0c3327;">✅ Teslimat Onaylandı</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#788177;font-family:-apple-system,sans-serif;">
      Merhaba <strong>${params.recipientName}</strong>, <strong>${params.vaultName}</strong> QR kod tabelasının teslim alındığını onayladığınız için teşekkür ederiz.
    </p>

    <p style="margin:0 0 20px;font-size:15px;color:#1f2d27;line-height:1.7;">
      QR kodu mezar taşına yerleştirdiğinizde, ziyaretçiler telefonlarıyla okutarak <strong>${params.vaultName}</strong> anma sayfasına ulaşabilecek.
    </p>

    <div style="background:#f0f9f4;border:1px solid #b8e0c8;border-radius:10px;padding:16px;">
      <p style="margin:0;font-size:13px;color:#1a6640;font-family:-apple-system,sans-serif;line-height:1.6;">
        ✅ Sipariş alındı · ✅ Hazırlandı · ✅ Kargoya verildi · ✅ <strong>Teslim alındı</strong>
      </p>
    </div>
  `)
}
