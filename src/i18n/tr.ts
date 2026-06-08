import type { LangDict } from './en'

const tr: LangDict = {
  nav: {
    home: 'Ana sayfa',
    howItWorks: 'Nasıl çalışır',
    features: 'Dijital anıtlar',
    demoProfile: 'Örnek profil',
    pricing: 'Fiyatlar',
    faq: 'SSS',
    login: 'Giriş yap',
    cta: 'Başla',
    openMenu: 'Menüyü aç',
  },

  landing: {
    hero: {
      eyebrow: '',
      h1a: 'Hatıralar Taşta Değil,',
      h1b: 'Zamanda Yaşasın.',
      p: 'Mezar taşına yerleştirilen QR kodlar; sevdiklerinizin hikayelerini, fotoğraflarını ve anlamlarını barındıran dijital anıt sayfalarına açılır.',
      ctaPrimary: 'Nasıl çalışır?',
      ctaSecondary: 'Örnek profili gör',
    },

    profilePreview: {
      heading: 'Dijital Anıt Profili',
      body: 'Sevdiklerinizin hayatına dair her detayın özenle sunulduğu, zengin ve anlamlı dijital anıt sayfaları.',
      cta: 'Örnek Profili Gör',
      profileName: 'Ahmet Yılmaz',
      profileYears: '1940 – 2020',
      profileBio: 'Hayat hikayesi, ailesiyle anıları ve yaşadığı güzel anlar bu zarif dijital profilde korunur.',
      readStory: 'Hayat Hikayesini Oku',
      viewAll: 'Tüm İçeriği Görüntüle',
      statLifeStory: 'Hayat Hikayesi',
      statPhotos: 'Fotoğraflar',
      statVideos: 'Videolar',
      statMemories: '66 Anı',
    },

    quickSteps: [
      {
        title: 'QR plaka yerleştirilir',
        text: 'Kişiye özel, dayanıklı QR plaka üretilir ve mezar taşına ya da anı alanına eklenir. Plaka ömür boyu geçerlidir — URL değişse bile yönlendirme çalışır.',
      },
      {
        title: 'Dijital anıt profili açılır',
        text: 'Hayat hikayesi, fotoğraflar, videolar, ses kayıtları ve mezarlık konumu tek sayfada toplanır. Aile üyeleri içerikleri zaman içinde güncelleyebilir.',
      },
      {
        title: 'Anılar nesillere aktarılır',
        text: 'Ziyaretçiler QR kodu telefona okuttuğunda sayfa açılır; mum yakar, çiçek bırakır, taziye mesajı gönderir. Bildirimler varislerine iletilir.',
      },
    ],

    values: [
      { title: 'Hatıralar Güvende', text: 'Anılarınız dijital ortamda korunur, zamanla kaybolmaz.' },
      { title: 'Anlamlı Ziyaretler', text: 'Her ziyaret, sevdiklerinizle daha derin bir bağ kurmanızı sağlar.' },
      { title: 'Kolay Erişim', text: 'QR kod ile saniyeler içinde zengin dijital anı sayfasına ulaşılır.' },
      { title: 'Yeni Nesillere Miras', text: 'Hikayeleriniz ve değerleriniz gelecek nesillere ilham olur.' },
    ],

    ctaBanner: {
      heading: 'Bir ismi değil, bir hayatı yaşatın.',
      button: 'Bizimle İletişime Geçin',
    },

    whySection: {
      heading: 'Neden The Eternal Memory?',
      sub: 'Bir mezar taşından fazlasını, saygılı ve kalıcı bir dijital anı deneyimine dönüştürür.',
    },

    whyItems: [
      {
        title: 'Hatıraları kalıcı hale getirir',
        text: 'Fotoğraflar, hikayeler, ses ve videolar düzenli bir dijital anı alanında saklanır. Zamanla solar değil, nesiller boyu erişilebilir kalır.',
      },
      {
        title: 'Fiziksel ve dijital dünyayı birleştirir',
        text: 'Mezar taşı üzerindeki QR kod anı sayfasına doğrudan kapı açar. Ziyaretçiler için kolay, aile için anlamlı.',
      },
      {
        title: 'Aile için kolay yönetim',
        text: 'Yetkili aile üyeleri profili zaman içinde güncelleyebilir. Taziye bildirimlerini takip edebilir, içerikleri düzenleyebilir.',
      },
      {
        title: 'İnsana dokunan deneyim',
        text: 'Ziyaretçiler bir isim değil yaşanmış bir hayatla karşılaşır. Mum yakar, çiçek bırakır, dua eder — her etkileşim varislerine bildirim gönderir.',
      },
      {
        title: 'Doğrulanmış, güvenilir profiller',
        text: 'Her Anma Profili kimlik ve vefat belgesiyle doğrulanır. 14 günlük itiraz penceresi ile sahte profil riski sıfıra yaklaşır.',
      },
      {
        title: 'Ömür boyu açık kalma taahhüdü',
        text: 'The Eternal Memory kalıcı çalışmayı taahhüt eder. Anma Profilleri ömür boyu erişilebilir kalır; ek ücret veya yenileme gerekmez. QR plakalar hiçbir zaman geçersiz olmaz.',
      },
    ],

    howItWorksDetailed: {
      heading: 'Nasıl çalışır?',
      sub: 'İki farklı senaryo — her ikisi de aynı platforma çıkar.',
      scenarioA: {
        badge: 'Senaryo A — Yakınınız vefat etti',
        heading: 'Aile oluşturur, hemen yayına girer',
        steps: [
          'Anma Profili formu doldurulur, biyografi ve fotoğraflar eklenir.',
          'Kimlik ve vefat belgesi yüklenir; 24-48 saat içinde admin incelemesi yapılır.',
          '14 günlük itiraz penceresi boyunca profil hazır bekler.',
          'İtiraz yoksa profil yayına girer, QR plaka üretilip gönderilir.',
        ],
        priceLabel: 'Tek seferlik',
        price: '249',
        currency: '₾',
        detailsBtn: 'Detaylar',
      },
      scenarioB: {
        badge: 'Senaryo B — Hayattayken kendiniz kurun',
        heading: 'Yaşam Kasası — miras biriktirin',
        steps: [
          'Yaşam Kasası açılır; fotoğraf, video, ses kaydı ve biyografi eklenir.',
          '3 varis belirlenir. Kasanız gizli kalır, yalnızca siz yönetirsiniz.',
          'Yıllarca anı biriktirirsiniz. Son mesaj bölümünüze varislerinize özel not ekleyebilirsiniz.',
          'Vefat sonrası varislerden en az 2\'si onayladığında kasa otomatik Anma Profili\'ne dönüşür.',
        ],
        priceLabel: '49 ₾ kurulum + QR plaka',
        price: '12,90',
        currency: '₾/ay',
        priceAlt: 'veya 99 ₾/yıl',
        startBtn: 'Başla',
      },
    },

    security: {
      heading: 'Güvenlik altyapısı',
      body: 'Sevdiklerinizin anıları bizim için emanettir. Verileriniz endüstri standardı şifreleme, erişim izolasyonu ve kalıcı yönlendirme altyapısıyla korunur.',
      commitment: 'Ömür boyu açık kalma taahhüdü. Oluşturulan Anma Profilleri kalıcıdır; ek ücret veya yenileme gerekmez. QR plakalar hiçbir zaman geçersiz hale gelmez.',
      readPrivacy: 'Gizlilik politikasını oku',
    },

    securityItems: [
      {
        title: 'TLS 1.3 şifreli iletim',
        text: 'Tarayıcıdan sunucuya tüm veri trafiği TLS 1.3 protokolüyle şifrelenir. Araya girme saldırılarına karşı tam koruma.',
      },
      {
        title: 'Satır bazlı veri izolasyonu',
        text: 'Supabase PostgreSQL Row Level Security (RLS) ile her kullanıcı yalnızca kendi verilerine erişebilir. Diğer profillere hiçbir şekilde ulaşılamaz.',
      },
      {
        title: 'AES-256 medya şifreleme',
        text: 'Fotoğraf, video ve ses kayıtları Cloudflare R2 üzerinde AES-256 ile şifreli depolanır. Doğrulama belgeleri onay sonrası 30 gün içinde kalıcı silinir.',
      },
      {
        title: 'bcrypt şifre karması',
        text: 'Şifreler asla düz metin olarak tutulmaz; bcrypt algoritmasıyla karmalanır. Bir güvenlik ihlalinde bile şifreleriniz okunamaz.',
      },
      {
        title: 'Kalıcı QR yönlendirme',
        text: 'QR plakaya basan URL slug veya alan adından bağımsız bir kimlikle çalışır. Sayfa adresi değişse bile plakalar sonsuza dek geçerli kalır.',
      },
      {
        title: 'Belge doğrulama + itiraz penceresi',
        text: 'Anma Profili başvurularında kimlik ve vefat belgesi zorunludur. 24-48 saat admin incelemesi ve 14 günlük itiraz penceresiyle sahte profil riski en aza indirilir.',
      },
    ],

    pricingSection: {
      heading: 'Fiyatlandırma',
      sub: 'İki ürün, iki ihtiyaç. QR plaka her ikisinde de dahildir.',
      memorialBadge: 'Yakınınız vefat etti',
      memorialTitle: 'Anma Profili',
      memorialPriceLabel: 'tek seferlik',
      memorialFeatures: [
        'Tam dijital anıt profili',
        'Fotoğraf & video galerisi',
        'Mezarlık konumu & Harita',
        'Taziye / mum / çiçek özelliği',
        'QR plaka üretimi ve gönderimi',
        'Kimlik doğrulama + 14 gün itiraz',
        'Ömür boyu erişim',
      ],
      memorialCta: 'Detayları İncele',
      vaultBadgeTop: 'Hayattayken başlayın',
      vaultBadge: 'Kendi mirasınızı kurun',
      vaultTitle: 'Yaşam Kasası',
      vaultPriceMonthly: '₾/ay',
      vaultPriceAlt: 'veya 99 ₾/yıl',
      vaultSetup: '+ 49 ₾ kurulum ücreti (QR plaka dahil)',
      vaultFeatures: [
        'Gizli anı kasası (hayattayken)',
        'Fotoğraf, video, ses kaydı',
        'Son mesaj & kişisel biyografi',
        '3 varis belirleme',
        '2/3 onay → otomatik anıt profili',
        'Aile bildirim sistemi',
        'QR plaka kurulumda dahil',
      ],
      vaultCta: 'Yaşam Kasası Aç',
      viewAll: 'Tüm detaylar için',
      viewAllLink: 'fiyatlandırma sayfasına',
      viewAllSuffix: 'bakın.',
    },

    faqSection: {
      heading: 'Sık sorulan sorular',
      moreQuestions: 'Başka sorunuz mu var?',
      moreQuestionsBody: '7 gün içinde yanıtlıyoruz — genellikle çok daha hızlı.',
      contactLink: 'İletişime geçin',
    },

    faqs: [
      {
        q: 'Anma Profili ile Yaşam Kasası arasındaki fark nedir?',
        a: 'Anma Profili, vefat eden bir yakınınız için aile tarafından oluşturulan tek seferlik (249 ₾) hizmettir. Yaşam Kasası ise hayattayken kendi dijital mirasınızı kurduğunuz, varislerin vefat sonrası yayına aldığı abonelik hizmetidir (49 ₾ kurulum + 12,90 ₾/ay).',
      },
      {
        q: 'QR plakanın ömrü ne kadar?',
        a: 'The Eternal Memory QR kodu slug veya alan adına değil, veritabanındaki benzersiz bir kimliğe bağlıdır. Alan adı değişse bile plaka çalışır. The Eternal Memory ömür boyu açık kalma taahhüdü kapsamındadır; QR plakalar hiçbir zaman geçersiz hale gelmez.',
      },
      {
        q: 'Neden kimlik belgesi istiyorsunuz?',
        a: 'Yaşayan biri adına sahte vefat profili oluşturulmasını önlemek için. Bu kural tüm başvurulara eşit uygulanır. Belgeler doğrulama sonrası 30 gün içinde kalıcı silinir; hiçbir şekilde başka amaçla kullanılmaz.',
      },
      {
        q: 'Platform kapanırsa ne olur?',
        a: 'The Eternal Memory ömür boyu açık kalma taahhüdü vermektedir. Oluşturulan Anma Profilleri kalıcıdır; ek ücret, abonelik veya yenileme gerekmez. QR plakalar hiçbir zaman geçersiz hale gelmez — alan adı veya URL değişse bile yönlendirme çalışır.',
      },
      {
        q: 'Aile üyeleri içerik ekleyebilir mi?',
        a: 'Evet. Yetkili aile üyeleri profil yöneticisi olarak eklenebilir. Fotoğraf, video ve biyografi güncellemesi yapabilirler. Taziye mesajlarını görebilir ve yönetebilirler.',
      },
      {
        q: 'Yaşam Kasası aboneliğini iptal edersem ne olur?',
        a: 'İptal tarihine kadar tüm özellikler aktif kalır. Sonrasında kasa dondurulur — içerikler silinmez. Varisler vefat sonrası aboneliği yeniden açarak kasayı yayına alabilir.',
      },
      {
        q: 'QR plaka fiziksel olarak ne zaman gelir?',
        a: 'Profil onaylandıktan sonra plaka üretimi başlar. Gürcistan ve Türkiye içi teslimatlar 5-10 iş günü, diğer ülkeler 10-20 iş günüdür.',
      },
      {
        q: 'Ödeme hangi para birimiyle yapılıyor?',
        a: 'Gürcistan Larisi (₾/GEL) ile. TBC Pay, BOG Pay, Visa/Mastercard ve banka havalesi kabul edilir. Gürcistan dışından yapılan ödemelerde döviz karşılığı otomatik hesaplanır.',
      },
    ],

    finalCta: {
      heading: 'Sevdiklerinizin anısını yaşatın.',
      sub: 'Hatıraları geleceğe taşıyan dijital anıt deneyimine bugün başlayın.',
      primaryBtn: 'Hemen Başla',
      secondaryBtn: 'Bizimle iletişime geçin',
    },

    footer: {
      tagline: 'Hatıralar taşta değil, sevgiyle emanet edilir.',
      commitment: 'Ömür boyu açık kalma taahhüdü.',
      colPlatform: 'Platform',
      colCorporate: 'Kurumsal',
      colDocs: 'Belgeler',
      colContact: 'İletişim',
      platformLinks: [
        { label: 'Ana sayfa', href: '/' },
        { label: 'Nasıl çalışır', href: '#nasil-calisir' },
        { label: 'Neden The Eternal Memory?', href: '#ozellikler' },
        { label: 'Örnek Profil', href: '/memorial/demo' },
        { label: 'Fiyatlandırma', href: '/pricing' },
        { label: 'SSS', href: '#sss' },
      ],
      corporateLinks: [
        { label: 'Hakkımızda', href: '/contact' },
        { label: 'İletişim', href: '/contact' },
      ],
      docLinks: [
        { label: 'Gizlilik Politikası', href: '/privacy' },
        { label: 'Kullanım Koşulları', href: '/terms' },
        { label: 'Doğrulama Politikası', href: '/legal/verification-policy' },
      ],
      copyright: '© 2026 The Eternal Memory. Tüm hakları saklıdır.',
    },
  },

  pricing: {
    pageTitle: 'Fiyatlandırma — The Eternal Memory',
    nav: {
      home: 'Ana Sayfa',
      demoProfile: 'Örnek Profil',
      contact: 'İletişim',
      askQuestion: 'Soru sor',
    },
    hero: {
      eyebrow: 'Fiyatlandırma',
      h1a: 'İki ürün,',
      h1b: 'iki farklı ihtiyaç.',
      p: 'Vefat eden bir yakınınız için <strong>Anma Profili</strong> ya da hayattayken kendi mirasınızı kurun — <strong>Yaşam Kasası</strong>. Her ikisinde de QR mezar plakası dahildir.',
    },
    memorial: {
      badge: 'Yakınınız vefat etti',
      title: 'Anma Profili',
      price: '249',
      currency: '₾',
      priceLabel: 'tek seferlik',
      priceNote: 'QR plaka üretimi ve gönderimi dahil. Başka ödeme yok.',
      verificationNote: 'Kimlik doğrulama zorunlu. Ödeme sonrası belgeler yüklenir, admin onayıyla profil yayına girer.',
      cta: 'Anma Profili Oluştur',
      features: [
        'Tam dijital anıt profili',
        'Fotoğraf & video galerisi',
        'Yaşam hikayesi ve kronoloji',
        'Taziye / mum / çiçek özelliği',
        'QR plaka üretimi ve gönderimi',
        'Google Haritalar mezarlık entegrasyonu',
        'Kimlik doğrulama süreci',
        '14 günlük itiraz penceresi',
        'Ömür boyu erişim',
      ],
    },
    vault: {
      badge: 'Kendiniz için — hayattayken başlayın',
      badgeLabel: 'Kendi mirasınızı kurun',
      title: 'Yaşam Kasası',
      setupLabel: 'Kurulum ücreti',
      setup: '49',
      setupCurrency: '₾',
      setupNote: 'QR plaka dahil',
      monthlyLabel: 'Sonrasında',
      monthly: '12,90',
      monthlyCurrency: '₾',
      monthlyPeriod: '/ ay',
      annualNote: 'Veya <strong>99 ₾/yıl</strong> ile %36 tasarruf edin.',
      cta: 'Yaşam Kasası Aç',
      features: [
        'Gizli anı kasası (hayattayken)',
        'Fotoğraf, video, ses kaydı',
        'Kişisel biyografi ve kronoloji',
        'Son mesaj bölümü',
        '3 varis belirleme',
        '2/3 onay ile otomatik yayına geçiş',
        'Aile bildirim sistemi',
        'QR plaka (kurulum ücretine dahil)',
        'Ölüm sonrası tam anıt profili',
      ],
    },
    comparison: {
      heading: 'Hangisi size uygun?',
      sub: 'Farklı ihtiyaçlar, farklı ürünler.',
      colStatus: 'Durum',
      colMemorial: 'Anma Profili',
      colVault: 'Yaşam Kasası',
      rows: [
        'Yakınınız yeni vefat etti',
        'Hayattayken miras hazırlamak istiyorsunuz',
        'Hızlı profil, tek ödeme',
        'Yıllarca içerik biriktirmek istiyorsunuz',
        'Varisler ölüm sonrası onaylıyor',
        'Belge doğrulama gerekli',
        'QR plaka dahil',
        'Ömür boyu erişim',
      ],
      rowMemorial: [true, false, true, false, false, true, true, true],
      rowVault: [false, true, false, true, true, false, true, true],
    },
    verification: {
      eyebrow: 'Güvenlik & Doğrulama',
      heading: 'Anma Profili nasıl doğrulanır?',
      sub: 'Sahte profil oluşturulmasını önlemek için belge doğrulama ve itiraz penceresi uyguluyoruz.',
      safetyNote: 'Belgeleriniz güvende. Yüklenen kimlik ve vefat belgeleri yalnızca doğrulama amacıyla kullanılır, onay sonrasında sistemden kalıcı olarak silinir. GDPR ve Gürcistan Kişisel Veri Kanunu uyumlu.',
      steps: [
        {
          num: '01',
          title: 'Profil başvurusu',
          desc: 'Vefat eden kişinin bilgileri girilir. Profil pending_verification durumuna alınır, hemen yayına girmez.',
        },
        {
          num: '02',
          title: 'Belge yükleme',
          desc: 'Başvuru sahibinin kimlik belgesi ve vefat belgesi (nüfus cüzdanı veya resmi vefat belgesi) yüklenir.',
        },
        {
          num: '03',
          title: 'Admin incelemesi',
          desc: 'Belgeler 24–48 saat içinde ekip tarafından incelenir. Şüpheli durumlar ek doğrulama ister.',
        },
        {
          num: '04',
          title: '14 günlük itiraz penceresi',
          desc: 'Onaylanan profil 14 gün boyunca "itiraz" alabilir. Kişi hâlâ yaşıyorsa veya bilgiler yanlışsa bildirilebilir.',
        },
        {
          num: '05',
          title: 'Yayına geçiş',
          desc: 'İtiraz yoksa profil tam yayına girer. QR plaka üretimi başlar ve adresinize gönderilir.',
        },
      ],
    },
    payment: {
      heading: 'Ödeme yöntemleri',
      sub: 'Gürcistan ve Türkiye\'den tüm yaygın yöntemler desteklenir.',
      securityNote: 'Tüm ödemeler SSL şifreli ve güvenli altyapı üzerinden işlenir. Kart bilgileriniz sistemimizde saklanmaz.',
      methods: [
        { name: 'Visa / Mastercard', desc: 'Tüm kredi ve banka kartları' },
        { name: 'TBC Pay', desc: 'TBC Bank online ödeme' },
        { name: 'BOG Pay', desc: 'Bank of Georgia ödeme' },
        { name: 'Banka Havalesi', desc: 'TBC, BOG, Liberty Bank' },
      ],
    },
    faqSection: {
      heading: 'Sık sorulan sorular',
    },
    faqs: [
      {
        q: 'Anma Profili ve Yaşam Kasası arasındaki fark nedir?',
        a: 'Anma Profili, vefat eden biri için aile tarafından oluşturulan tek seferlik profildir. Yaşam Kasası ise yaşayan bir kişinin kendi hayatını kayıt altına alıp varislere devrettiği uzun vadeli kasadır.',
      },
      {
        q: 'Neden kimlik belgesi istiyorsunuz?',
        a: 'Yaşayan biri için sahte vefat profili oluşturulmasını önlemek için. Bu kural herkese uygulanır; belgeler güvenli ortamda saklanır ve doğrulama sonrası sistemden silinir.',
      },
      {
        q: 'QR plaka nasıl ve ne zaman gelir?',
        a: 'Profil onaylandıktan sonra üretim başlar. Gürcistan içi adresler için 5–10 iş günü, yurt dışı için 10–20 iş günü hesaplanmalıdır.',
      },
      {
        q: 'Yaşam Kasası aboneliğini iptal edersem ne olur?',
        a: 'İptal tarihine kadar kasa aktif kalır. Sonrasında kasa dondurulur; vefat sonrası varisler istediklerinde yıllık ücret ödeyerek kasayı yayına alabilir.',
      },
      {
        q: 'Ödeme hangi para birimiyle yapılıyor?',
        a: 'Gürcistan Larisi (₾/GEL) ile. TBC Pay, BOG Pay, Visa/Mastercard ve banka havalesi kabul edilir.',
      },
      {
        q: 'Kişi hâlâ yaşıyor, birisi onun için profil açarsa?',
        a: '14 günlük itiraz penceresinde ilgili kişi "Ben yaşıyorum" bildiriminde bulunabilir. Profil anında askıya alınır ve başvuru sahibi hakkında hukuki süreç başlatılır.',
      },
    ],
    cta: {
      heading: 'Sevdiklerinizin anısını',
      headingAccent: 'yaşatın.',
      sub: 'Önce örnek profili görün, sonra kararınızı verin.',
      demoBtn: 'Örnek Profili Gör',
      contactBtn: 'Soru sor',
    },
    footer: {
      privacy: 'Gizlilik',
      terms: 'Koşullar',
      contact: 'İletişim',
      copyright: '© 2026 The Eternal Memory',
    },
    bulkContact: 'Kurumsal veya toplu sipariş için',
    bulkContactLink: 'bizimle iletişime geçin',
  },

  contact: {
    pageTitle: 'İletişim — The Eternal Memory',
    nav: {
      home: 'Ana Sayfa',
      pricing: 'Fiyatlar',
      demoProfile: 'Örnek Profil',
      start: 'Başla',
    },
    hero: {
      eyebrow: 'İletişim',
      h1a: 'Size nasıl',
      h1b: 'yardımcı olabiliriz?',
      p: 'Anma Profili, Yaşam Kasası veya QR plaka konusunda aklınızdaki her soruyu yanıtlamak için buradayız. Genellikle 24 saat içinde dönüş yapıyoruz.',
    },
    info: {
      phone: 'Telefon',
      email: 'E-posta',
      address: 'Adres',
      hours: 'Çalışma saatleri',
      phoneTag: 'Gürcistan',
      emailTagGeneral: 'Genel',
      emailTagSupport: 'Destek',
      hoursWeekday: 'Pzt–Cum  09:00 – 18:00',
      hoursWeekdayTag: 'GE saati',
      hoursSaturday: 'Cmt  10:00 – 14:00',
      addressLine1: 'Petre Bagrationi Str. 220',
      addressLine2: 'Batumi / Gürcistan',
    },
    form: {
      heading: 'Mesaj gönderin',
      subheading: 'Tüm alanlar zorunludur.',
      nameLabel: 'Ad Soyad',
      namePlaceholder: 'Adınız',
      emailLabel: 'E-posta',
      emailPlaceholder: 'ornek@email.com',
      subjectLabel: 'Konu',
      subjectPlaceholder: 'Seçiniz',
      subjectOptions: [
        'Anma Profili hakkında',
        'Yaşam Kasası hakkında',
        'QR plaka siparişi',
        'Teknik destek',
        'İş birliği / B2B',
        'Diğer',
      ],
      messageLabel: 'Mesajınız',
      messagePlaceholder: 'Nasıl yardımcı olabiliriz?',
      sendBtn: 'Mesaj Gönder',
      sendingBtn: 'Gönderiliyor…',
      successTitle: 'Mesajınız iletildi',
      successBody: 'En kısa sürede geri döneceğiz — genellikle 24 saat içinde.',
    },
    departments: {
      heading: 'Doğrudan departmanlarımıza yazın',
      support: { title: 'Destek', desc: 'Hesap, profil ve teknik sorular.' },
      partnership: { title: 'İş birliği', desc: 'Mezar taşı atölyeleri, cenaze hizmetleri ve B2B.' },
      privacy: { title: 'Gizlilik', desc: 'GDPR ve kişisel veri talepleri.' },
    },
    footer: {
      privacy: 'Gizlilik',
      terms: 'Koşullar',
      pricing: 'Fiyatlar',
      copyright: '© 2026 The Eternal Memory',
    },
  },

  qPages: {
    pending: {
      title: 'Profil hazırlanıyor',
      body: 'Bu QR koda bağlı anıt profili henüz yayına girmedi. Doğrulama süreci tamamlandığında otomatik olarak erişilebilir hale gelecektir.',
      problem: 'Sorun mu var?',
      contactLink: 'Bizimle iletişime geçin',
    },
    notFound: {
      title: 'QR kodu tanınmadı',
      body: 'Bu QR koda ait bir profil bulunamadı. Plakayı doğru okuttuğunuzdan emin olun ya da bizimle iletişime geçin.',
      contactBtn: 'İletişime Geç',
      homeBtn: 'Ana Sayfa',
    },
  },

  cookieBanner: {
    text: 'Oturum yönetimi için zorunlu çerezler kullanıyoruz. QR tarama analitikleri için isteğe bağlı çerezler de mevcuttur.',
    policyLink: 'Çerez Politikası',
    essentialOnly: 'Yalnızca zorunlu',
    acceptAll: 'Tümünü kabul et',
  },

  legal: {
    shell: {
      toc: 'İçindekiler',
      lastUpdated: 'Son güncelleme:',
      privacyLink: 'Gizlilik',
      termsLink: 'Koşullar',
      verificationLink: 'Doğrulama',
      footerPrivacy: 'Gizlilik',
      footerTerms: 'Koşullar',
      footerContact: 'İletişim',
      copyright: '© 2026 The Eternal Memory',
    },

    privacy: {
      eyebrow: 'Hukuki Belge',
      title: 'Gizlilik Politikası',
      date: '7 Haziran 2026 · GDPR · Gürcistan KVK · KVKK uyumlu',
      toc: [
        { id: 'taraflar', label: '1. Veri Sorumlusu' },
        { id: 'toplanan', label: '2. Toplanan Veriler' },
        { id: 'amaclar', label: '3. İşleme Amaçları' },
        { id: 'ozel', label: '4. Özel Nitelikli Veriler' },
        { id: 'saklama', label: '5. Saklama Süreleri' },
        { id: 'guvenlik', label: '6. Güvenlik' },
        { id: 'ucuncu', label: '7. Üçüncü Taraflar' },
        { id: 'transfer', label: '8. Uluslararası Transfer' },
        { id: 'haklar', label: '9. Kullanıcı Hakları' },
        { id: 'cerezler', label: '10. Çerezler' },
        { id: 'cocuklar', label: '11. Çocukların Gizliliği' },
        { id: 'degisiklik', label: '12. Değişiklikler' },
        { id: 'iletisim', label: '13. İletişim' },
      ],
      sections: {
        controller: {
          h: '1. Veri Sorumlusu',
          p1: 'Bu politika, The Eternal Memory ticari unvanıyla faaliyet gösteren ve aşağıdaki adreste kayıtlı veri sorumlusuna aittir:',
          address: 'Petre Bagrationi Str. 220, Batumi, Gürcistan',
          email: 'privacy@theeternalmemory.com',
          tel: '+995 555 511 884',
          p2: 'The Eternal Memory; Gürcistan Kişisel Verilerin Koruma Kanunu (2012, rev. 2024), AB Genel Veri Koruma Tüzüğü (GDPR — 2016/679) ve Türkiye\'de yerleşik kullanıcılar için 6698 sayılı KVKK kapsamında kişisel verilerinizi işler.',
        },
        collected: {
          h: '2. Toplanan Veriler',
          h2a: '2.1 Hesap ve Kimlik Verileri',
          items2a: ['Ad, soyad, e-posta adresi, telefon numarası', 'Şifre (bcrypt karması — düz metin asla saklanmaz)', 'Profil fotoğrafı (isteğe bağlı)'],
          h2b: '2.2 Anma Profili / Vault İçerikleri',
          items2b: ['Vefat eden kişiye ait ad, doğum/vefat tarihi, biyografik bilgiler', 'Fotoğraflar, videolar, ses kayıtları (kullanıcı tarafından yüklenen)', 'Mezarlık adresi ve GPS koordinatları'],
          h2c: '2.3 Doğrulama Belgeleri',
          items2c: ['Başvuru sahibinin nüfus cüzdanı veya pasaportu (yalnızca ön yüz)', 'Resmi vefat belgesi'],
          noteVerification: 'Doğrulama belgeleri, inceleme tamamlandıktan sonra sonuçtan bağımsız olarak 30 gün içinde sistemden kalıcı olarak silinir.',
          h2d: '2.4 Teknik Veriler',
          items2d: ['IP adresi, tarayıcı türü, işletim sistemi', 'QR tarama zaman damgası ve yaklaşık coğrafi bölge', 'Oturum ve kimlik doğrulama çerezleri'],
        },
        purposes: {
          h: '3. İşleme Amaçları',
          items: [
            'Hesap oluşturma, kimlik doğrulama ve dijital kasa yönetimi',
            'QR yönlendirme, anıt profili yayını ve aile bildirim sistemi',
            'Anma Profili başvurularında kimlik ve vefat belgesi doğrulaması',
            'Güvenlik, kötüye kullanım önleme ve yasal yükümlülüklerin yerine getirilmesi',
            'QR tarama analitikleri (anonimleştirilmiş)',
            'Teknik destek ve hata analizi',
          ],
        },
        special: {
          h: '4. Özel Nitelikli Veriler',
          p: 'Vefat belgeleri ve içerebileceği biyometrik görüntüler özel nitelikli kişisel veri kategorisine girmektedir. The Eternal Memory bu belgeleri yalnızca Anma Profili başvurularının kimlik doğrulaması amacıyla işler ve 30 gün içinde kalıcı olarak siler.',
        },
        retention: {
          h: '5. Saklama Süreleri',
          rows: [
            ['Hesap verileri', 'Hesap kapatılana kadar + 2 yıl (yasal yükümlülük)'],
            ['Doğrulama belgeleri', 'İnceleme tamamlanmasından itibaren 30 gün → kalıcı silme'],
            ['Anma Profili içerikleri', 'Ömür boyu (platform çalıştığı sürece)'],
            ['Log kayıtları', '90 gün'],
            ['QR tarama analitikleri', '12 ay (anonimleştirilmiş)'],
          ],
        },
        security: {
          h: '6. Güvenlik',
          items: [
            'TLS 1.3 şifreli veri iletimi',
            'AES-256 medya dosyası şifreleme (Cloudflare R2)',
            'Satır Bazlı Güvenlik (RLS) — her kullanıcı yalnızca kendi verilerine erişir',
            'bcrypt şifre karması',
            'Düzenli güvenlik denetimleri ve sızma testleri',
          ],
        },
        thirdParties: {
          h: '7. Üçüncü Taraflar',
          rows: [
            ['Supabase', 'Veritabanı ve kimlik doğrulama altyapısı', 'AB (Frankfurt)'],
            ['Cloudflare R2', 'Medya dosyası depolama', 'AB/ABD'],
            ['Vercel', 'Web barındırma ve CDN', 'AB/ABD'],
            ['Google Maps', 'Mezarlık konumu gösterimi', 'Google Gizlilik Politikası'],
          ],
          note: 'Hiçbir üçüncü tarafa reklam, analitik veya profil oluşturma amacıyla kişisel verilerinize erişim izni verilmez.',
        },
        transfer: {
          h: '8. Uluslararası Transfer',
          p: 'Bazı hizmet sağlayıcılar verileri Amerika Birleşik Devletleri\'nde depolayabilir. Transfer güvenceleri AB Standart Sözleşme Maddeleri (SCC) esas alınmaktadır. Gürcistan KVK sınır ötesi transfer gereksinimleri tam olarak karşılanmaktadır.',
        },
        rights: {
          h: '9. Kullanıcı Hakları',
          items: [
            'Erişim: hakkınızda hangi verileri tuttuğumuzu öğrenin',
            'Düzeltme: hatalı verilerin düzeltilmesini isteyin',
            'Silme: verilerinizin silinmesini talep edin (silinme hakkı)',
            'Kısıtlama: işlemenin kısıtlanmasını isteyin',
            'Taşınabilirlik: verilerinizi makine tarafından okunabilir formatta alın',
            'İtiraz: meşru menfaate dayalı işlemeye itiraz edin',
            'Şikayet: Gürcistan Kişisel Verilerin Koruma Hizmetine şikayette bulunabilirsiniz',
          ],
          contact: 'Haklarınızı kullanmak için:',
          email: 'privacy@theeternalmemory.com',
          note: '30 gün içinde yanıt veriyoruz.',
        },
        cookies: {
          h: '10. Çerezler',
          p: 'Ayrıntılı bilgi için Çerez Politikamıza bakın.',
        },
        children: {
          h: '11. Çocukların Gizliliği',
          p: 'The Eternal Memory, bilerek 16 yaşın altındaki bireylerden kişisel veri toplamaz. Bir çocuğun kişisel veri sağladığını düşünüyorsanız lütfen privacy@theeternalmemory.com adresinden bizimle iletişime geçin.',
        },
        changes: {
          h: '12. Değişiklikler',
          p: 'Önemli değişiklikler en az 14 gün öncesinden platformda duyurulacaktır. Bildirim sonrası platforma devam etmek yeni politikayı kabul etmek anlamına gelir.',
        },
        contactSection: {
          h: '13. İletişim',
          email: 'privacy@theeternalmemory.com',
          tel: '+995 555 511 884',
          address: 'Petre Bagrationi Str. 220, Batumi, Gürcistan',
        },
      },
    },

    terms: {
      eyebrow: 'Hukuki Belge',
      title: 'Kullanım Koşulları',
      date: '7 Haziran 2026',
      toc: [
        { id: 'taraflar', label: '1. Taraflar ve Kapsam' },
        { id: 'hizmetler', label: '2. Hizmetler' },
        { id: 'hesap', label: '3. Hesap Oluşturma' },
        { id: 'yasak', label: '4. Yasak Kullanımlar' },
        { id: 'dogrulama', label: '5. Doğrulama Süreci' },
        { id: 'odeme', label: '6. Ödeme ve İade' },
        { id: 'icerik', label: '7. İçerik Hakları' },
        { id: 'sorumluluk', label: '8. Sorumluluk Sınırı' },
        { id: 'askiya', label: '9. Hesap Askıya Alma' },
        { id: 'abonelik', label: '10. Abonelik İptali' },
        { id: 'sureklilk', label: '11. Hizmet Sürekliliği Taahhüdü' },
        { id: 'hukuk', label: '12. Uygulanacak Hukuk' },
        { id: 'degisiklik', label: '13. Değişiklikler' },
      ],
      content: {
        parties: {
          h: '1. Taraflar ve Kapsam',
          p1: 'Bu Kullanım Koşulları, The Eternal Memory (Petre Bagrationi Str. 220, Batumi, Gürcistan — bundan böyle "The Eternal Memory", "biz", "bizim") ile platformu kullanan gerçek ya da tüzel kişi ("Kullanıcı", "siz") arasındaki sözleşmeyi oluşturur. Platformu kullanmaya başladığınız anda bu koşulları kabul etmiş sayılırsınız.',
          p2: '18 yaşından küçükseniz platformu kullanamazsınız. Üçüncü bir kişi adına başvuru yapıyorsanız o kişi adına yetkili olduğunuzu beyan edersiniz.',
        },
        services: {
          h: '2. Hizmetler',
          p: 'The Eternal Memory iki temel ürün sunar:',
          memorialH: '2.1 Anma Profili',
          memorialP: 'Vefat eden bir kişi için aile veya yetkili yakın tarafından oluşturulan, tek seferlik ücrete tabi dijital anıt profilidir. Profil; biyografi, fotoğraf, video, mezarlık bilgisi ve QR plaka hizmetini kapsar. Yayına girmeden önce kimlik doğrulama ve 14 günlük itiraz süreci uygulanır.',
          vaultH: '2.2 Yaşam Kasası',
          vaultP: 'Kullanıcının hayattayken kendi dijital mirasını oluşturduğu, aboneliğe dayalı hizmettir. Kullanıcı; fotoğraf, video, ses kaydı, biyografi ve son mesaj ekleyebilir; 3 varis belirleyebilir. Vefat sonrası varislerden en az 2\'si onay verdiğinde vault otomatik olarak herkese açık Anma Profili\'ne dönüşür. Abonelik kurulum ücreti + aylık/yıllık ücretle sunulur.',
        },
        account: {
          h: '3. Hesap Oluşturma',
          items: ['Geçerli e-posta adresi ve güvenli şifre zorunludur.', 'Hesabınızın güvenliğinden siz sorumlusunuz.', 'Verdiğiniz bilgiler doğru ve eksiksiz olmalıdır.', 'Yalnızca bir hesap açabilirsiniz. Yinelenen hesaplar silinir.'],
        },
        prohibited: {
          h: '4. Yasak Kullanımlar',
          items: ['Yaşayan biri için sahte Anma Profili oluşturma', 'Fikri mülkiyet haklarını ihlal eden içerik yükleme', 'Taciz, tehdit veya nefret söylemi', 'Diğer kullanıcıların verilerine erişme veya sisteme sızma girişimi', 'Reklam, spam veya ticari veri kazıma amacıyla platformu kullanma'],
        },
        verificationTerms: {
          h: '5. Doğrulama Süreci',
          p: 'Yaşayan kişiler için sahte profil oluşturulmasını önlemek amacıyla her Anma Profili başvurusunda belge doğrulama zorunludur. Belgeler yalnızca doğrulama için kullanılır ve 30 gün içinde kalıcı olarak silinir. 14 günlük itiraz penceresi zorunludur ve vazgeçilemez.',
        },
        payment: {
          h: '6. Ödeme ve İade',
          items: [
            'Anma Profili ücreti (249 ₾) profil yayına girdikten sonra iade edilmez.',
            'Profil yayına girmeden önce reddedilir veya iptal edilirse tam tutar iade edilir.',
            'Yaşam Kasası kurulum ücreti (49 ₾) iade edilmez.',
            'Aylık/yıllık abonelik bir sonraki faturalama döneminden önce iptal edilebilir. Mevcut dönem için ödenen tutar iade edilmez.',
            'Tüm tutarlar Gürcistan Larisi (₾/GEL) cinsindendir.',
          ],
        },
        content: {
          h: '7. İçerik Hakları',
          p1: 'Yüklediğiniz içeriklerin tüm telif hakları size aittir. The Eternal Memory\'ye hizmetin sağlanması amacıyla içeriklerinizi depolamak, görüntülemek ve yedeklemek için münhasır olmayan lisans verirsiniz.',
          p2: 'The Eternal Memory, yasaları veya bu koşulları ihlal eden içerikleri önceden bildirimde bulunmaksızın kaldırabilir.',
        },
        liability: {
          h: '8. Sorumluluk Sınırı',
          p: 'The Eternal Memory\'nin doğrudan zararlar için toplam sorumluluğu, kullanıcının son 12 ayda ödediği toplam ücretlerle sınırlıdır. Dolaylı, tesadüfi veya sonuç niteliğindeki zararlar için sorumluluk kabul edilmez.',
        },
        suspension: {
          h: '9. Hesap Askıya Alma',
          items: [
            'Sahte veya yanlış profil oluşturma',
            'Yasadışı veya zararlı içerik yükleme',
            'Sistemi kötüye kullanma veya platforma zarar vermeye teşebbüs',
          ],
          p: 'Bu durumlarda hesap önceden bildirimde bulunulmaksızın askıya alınabilir veya kalıcı olarak kapatılabilir.',
        },
        cancellation: {
          h: '10. Abonelik İptali',
          p: 'Yaşam Kasası aboneliğinizi istediğiniz zaman iptal edebilirsiniz. İptal sonrasında kasa dondurulmuş durumda kalır; varisler vefat sonrası yeniden aktive edebilir.',
        },
        continuity: {
          h: '11. Hizmet Sürekliliği Taahhüdü',
          p: 'The Eternal Memory, Anma Profillerinin kalıcı olarak erişilebilir kalmasını taahhüt eder. Hizmetin kapanması durumunda kullanıcılara en az 6 ay önceden bildirimde bulunulur ve veri dışa aktarma imkânı sağlanır.',
        },
        law: {
          h: '12. Uygulanacak Hukuk',
          p: 'Bu koşullar Gürcistan yasalarına tabidir. Herhangi bir anlaşmazlık Batumi, Gürcistan mahkemelerinde çözülecektir.',
        },
        changes: {
          h: '13. Değişiklikler',
          p: 'Önemli değişiklikler yürürlüğe girmeden en az 14 gün önce iletilecektir. Platforma devam etmek kabul anlamına gelir.',
        },
      },
    },

    kvkk: {
      eyebrow: 'KVKK',
      title: 'KVKK Aydınlatma Metni',
      date: '7 Haziran 2026',
      toc: [
        { id: 'sorumluluk', label: '1. Veri Sorumlusu' },
        { id: 'kategoriler', label: '2. İşlenen Veri Kategorileri' },
        { id: 'amaclar', label: '3. İşleme Amaçları' },
        { id: 'haklar', label: '4. Haklarınız' },
      ],
      sections: {
        controller: {
          h: '1. Veri Sorumlusu',
          p: 'The Eternal Memory, dijital anıt profili ve yaşam kasası hizmetleri kapsamında kullanıcı verilerini 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca işlemektedir. Veri sorumlusu: The Eternal Memory — Petre Bagrationi Str. 220, Batumi, Gürcistan. İletişim: privacy@theeternalmemory.com',
        },
        categories: {
          h: '2. İşlenen Veri Kategorileri',
          items: [
            'Kimlik ve iletişim verileri: e-posta, ad soyad, telefon, profil bilgileri ve oturum kayıtları.',
            'Kullanıcı içerikleri: biyografi, fotoğraf, video, ses kaydı, belgeler, varis bilgileri ve ziyaretçi mesajları.',
            'Doğrulama belgeleri: kimlik belgesi ve vefat belgesi (doğrulama sonrası 30 gün içinde silinir).',
          ],
        },
        purposes: {
          h: '3. İşleme Amaçları',
          items: [
            'Hesap oluşturma, kimlik doğrulama ve dijital kasa yönetimi',
            'QR yönlendirme, anıt profili yayını ve aile bildirim sistemi',
            'Güvenlik, kötüye kullanım önleme ve yasal yükümlülüklerin yerine getirilmesi',
            'Teknik destek ve hata analizi',
          ],
        },
        rights: {
          h: '4. KVKK Kapsamındaki Haklarınız',
          p1: 'KVKK Madde 11 kapsamında; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme, silinmesini veya yok edilmesini talep etme, bu işlemlerin aktarıldığı kişilere bildirilmesini isteme, otomatik sistemlerle aleyhinize bir sonucun ortaya çıkmasına itiraz etme ve zarara uğramanız halinde zararın giderilmesini talep etme haklarına sahipsiniz.',
          p2: 'Başvurularınız için:',
          email: 'privacy@theeternalmemory.com',
          note: '— 30 gün içinde yanıtlıyoruz.',
        },
      },
    },

    cookies: {
      eyebrow: 'Hukuki Belge',
      title: 'Çerez Politikası',
      date: '7 Haziran 2026',
      toc: [
        { id: 'zorunlu', label: '1. Zorunlu Çerezler' },
        { id: 'tercihler', label: '2. Yerel Tercihler' },
        { id: 'analitik', label: '3. Analitik' },
        { id: 'kontrol', label: '4. Kontrol' },
      ],
      sections: {
        essential: {
          h: '1. Zorunlu Çerezler',
          p: 'Kimlik doğrulama ve oturum çerezleri; giriş yapma, kontrol paneline erişim ve hesap güvenliği için zorunludur. Bu çerezler devre dışı bırakılamaz.',
        },
        preferences: {
          h: '2. Yerel Tercihler',
          p: 'Dil tercihi, seçilen dilin ziyaretler arasında korunması amacıyla tarayıcının yerel depolama alanında saklanabilir.',
        },
        analytics: {
          h: '3. Analitik',
          p: 'QR taramaları; zaman damgası, cihaz türü ve yaklaşık konum başlığı gibi sınırlı teknik analitik verilerini saklayabilir. Bu veriler anonimleştirilmiş olarak işlenir.',
        },
        control: {
          h: '4. Kontrol',
          p: 'Çerezleri tarayıcı ayarlarından yönetebilirsiniz. Zorunlu çerezlerin engellenmesi giriş yapmanızı veya kontrol paneline erişmenizi engelleyebilir.',
        },
      },
    },

    verification: {
      eyebrow: 'Hukuki Belge',
      title: 'Doğrulama ve İtiraz Politikası',
      date: '7 Haziran 2026',
      toc: [
        { id: 'amac', label: '1. Amaç ve Kapsam' },
        { id: 'neden', label: '2. Neden Doğrulama Gerekiyor?' },
        { id: 'belgeler', label: '3. Gerekli Belgeler' },
        { id: 'surec', label: '4. Doğrulama Süreci' },
        { id: 'itiraz', label: '5. 14 Günlük İtiraz Penceresi' },
        { id: 'nasil', label: '6. İtiraz Nasıl Yapılır?' },
        { id: 'degerlendirme', label: '7. İtirazın Değerlendirilmesi' },
        { id: 'yasayan', label: '8. "Bu Kişi Hâlâ Yaşıyor" Bildirimi' },
        { id: 'sahte', label: '9. Sahte Başvurunun Sonuçları' },
        { id: 'gizlilik', label: '10. Belge Gizliliği' },
        { id: 'itiraz_red', label: '11. İtiraz Reddi ve İtiraz' },
        { id: 'iletisim', label: '12. İletişim' },
      ],
      sections: {
        purpose: {
          h: '1. Amaç ve Kapsam',
          p: 'Bu politika, The Eternal Memory platformunda Anma Profili oluşturulurken uygulanan kimlik doğrulama sürecini, gerekli belgeleri, inceleme adımlarını ve 14 günlük itiraz penceresini açıklamaktadır. Tüm Anma Profili başvuruları bu politika kapsamındadır.',
        },
        why: {
          h: '2. Neden Doğrulama Gerekiyor?',
          p: 'Dijital anıt profillerinde en ciddi risk, yaşayan bir kişi adına sahte bir vefat profili oluşturulmasıdır. Bu durum:',
          items: [
            'İlgili kişinin onuru ve mahremiyetine zarar verebilir,',
            'Aile üyelerinde derin psikolojik travmaya yol açabilir,',
            'Dolandırıcılık, miras usulsüzlüğü veya iftira gibi suçların aracı haline gelebilir.',
          ],
          p2: 'Bu nedenle The Eternal Memory, her Anma Profili başvurusunda belge doğrulama ve itiraz penceresi zorunluluğu getirmektedir. Bu süreç tek taraflı bir şüphe değil; tüm başvurulara eşit şekilde uygulanan bir standart prosedürdür.',
        },
        documents: {
          h: '3. Gerekli Belgeler',
          h2a: '3.1 Başvuru Sahibinin Kimliği',
          items2a: ['Nüfus cüzdanı veya pasaport (ön yüz)'],
          h2b: '3.2 Vefat Kanıtı',
          items2b: ['Resmi vefat belgesi', 'Veya eşdeğer resmi statüdeki bir belge'],
          note: 'Belgeler yalnızca yetkili The Eternal Memory çalışanları tarafından incelenir. Şifreli olarak saklanır ve inceleme sonrasında 30 gün içinde sistemden kalıcı olarak silinir.',
        },
        process: {
          h: '4. Doğrulama Süreci',
          steps: [
            { num: '01', title: 'Başvuru', text: 'Profil formu vefat eden kişinin bilgileriyle doldurulur. Ödeme tamamlanır. Profil pending_verification durumuna alınır.' },
            { num: '02', title: 'Belge Yükleme', text: 'Gerekli belgeler güvenli şekilde yüklenir.' },
            { num: '03', title: 'Admin İncelemesi', text: 'Belgeler 24–48 saat içinde incelenir. Şüpheli durumlar ek doğrulama ister.' },
            { num: '04', title: '14 Günlük Bekleme Süresi', text: 'Onaylanan profil herkese açık hale getirilir ancak 14 gün boyunca "itiraz sürecinde" kalır.' },
            { num: '05', title: 'Yayına Geçiş', text: '14 günün sonunda itiraz yoksa profil tam yayına girer ve QR plaka üretim siparişi oluşturulur.' },
          ],
        },
        objectionWindow: {
          h: '5. 14 Günlük İtiraz Penceresi',
          p: '14 günlük süre boyunca herkes, profilde görünen "Bu Profili Bildir" düğmesi aracılığıyla itiraz iletebilir. İtiraz gerekçeleri:',
          items: [
            'Kişi hâlâ yaşıyor',
            'Yanlış veya yanıltıcı bilgi',
            'Başvurucu yetkili değil',
            'Gizlilik ihlali',
          ],
        },
        howToObject: {
          h: '6. İtiraz Nasıl Yapılır?',
          methods: [
            'Profil sayfasındaki "Bu Profili Bildir" düğmesine tıklayın',
            'E-posta gönderin: privacy@theeternalmemory.com',
            'Telefon: +995 555 511 884',
          ],
          p: 'İtirazda şunlar bulunmalıdır: adınız, profille ilişkiniz, iletişim bilgileriniz ve mümkünse destekleyici belge.',
        },
        evaluation: {
          h: '7. İtirazın Değerlendirilmesi',
          items: [
            'İtiraz alındığında profil anında askıya alınır.',
            'İtiraz 48 saat içinde incelenir.',
            'Geçerliyse: profil silinir, başvurucu bilgilendirilir.',
            'Asılsızsa: profil yayına girer, itiraz eden bilgilendirilir.',
          ],
        },
        stillAlive: {
          h: '8. "Bu Kişi Hâlâ Yaşıyor" Bildirimi',
          p: 'Kişi hayatta olduğunu kanıtlayabilirse (görüntülü görüşme, kimlik belgesi, yüz yüze doğrulama):',
          items: [
            'Profil anında ve kalıcı olarak silinir.',
            'Başvurucu tarafından ödenen ücret iade edilmez.',
            'Başvurucu hakkında hukuki süreç başlatılır.',
          ],
        },
        fakeApplication: {
          h: '9. Sahte Başvurunun Sonuçları',
          items: [
            'Anlık ve kalıcı hesap kapatma',
            'Kullanılan tüm ödeme yöntemlerinin kara listeye alınması',
            'İlgili makamlara bildirim',
            'Gürcistan, AB ve Türk hukuku kapsamında hukuki işlem',
          ],
        },
        confidentiality: {
          h: '10. Belge Gizliliği',
          p: 'Yüklenen tüm belgeler AES-256 şifrelemeyle saklanır. Yalnızca yetkili personel tarafından erişilebilir. İnceleme sonrasında 30 gün içinde sistemden kalıcı olarak silinir. Üçüncü taraflarla hiçbir koşulda paylaşılmaz.',
        },
        appeal: {
          h: '11. İtiraz Reddi ve İtiraz',
          p: 'İtirazınız reddedildiyse privacy@theeternalmemory.com adresine ek kanıtlarla yeniden başvurabilirsiniz. Kararın hatalı olduğunu düşünüyorsanız Gürcistan Kişisel Verilerin Koruma Hizmeti\'ne itiraz edebilirsiniz.',
        },
        contactSection: {
          h: '12. İletişim',
          email: 'privacy@theeternalmemory.com',
          tel: '+995 555 511 884',
          address: 'Petre Bagrationi Str. 220, Batumi, Gürcistan',
        },
      },
    },
  },
}

export default tr
