// Aileler platforma kendi dillerinde teşekkür ediyor — statik, elle yazılmış metinler.
// Hangi dilin kullanılacağı profildeki `nationality` alanından belirlenir
// (hem ülke kodu "TR"/"GE" hem de eski seed verisindeki "Turkish"/"Georgian" formatını destekler).

type QuoteLang = 'tr' | 'ka' | 'en' | 'ru' | 'az' | 'hy' | 'he'

const QUOTES: Record<QuoteLang, string[]> = {
  tr: [
    'Bu platform sayesinde babamızın anısını hem Türkiye\'de hem Gürcistan\'da yaşayan tüm ailemizle paylaşabildik. QR kodu mezar taşına koyduğumuzda gözlerimiz doldu.',
    'Uzakta yaşayan aile bireylerimiz artık fotoğraflarına, sesine ve hikayesine tek bir dokunuşla ulaşabiliyor. Bize bu imkanı verdiği için çok teşekkür ederiz.',
    'Anma sayfasını oluştururken her adımda özenle yönlendirildik. Bugün ailemiz için gerçek bir hazineye dönüştü, emeği geçen herkese minnettarız.',
  ],
  ka: [
    'ამ პლატფორმის წყალობით ჩვენი ახლობლის ფოტოები, ხმა და ისტორია ერთად შევკარით — მადლობას ვუხდით ამ საშუალებისთვის.',
    'შვილიშვილებმაც კი შეძლეს პაპის ისტორიის გაცნობა QR კოდის საშუალებით. ეს ჩვენთვის ფასდაუდებელი საჩუქარია.',
    'სამახსოვრო გვერდის შექმნა მშვიდი და ადვილი პროცესი იყო, ყველა დეტალზე ზრუნავდნენ. გულითადი მადლობა მთელ გუნდს.',
  ],
  en: [
    'This platform let us gather every photo, voice recording and memory of our loved one in one place the whole family can visit, wherever they live. We are deeply grateful.',
    'Even grandchildren who never met him can now hear his voice and read his story through the QR code. What a gift this has been for our family.',
  ],
  ru: [
    'Благодаря этой платформе мы собрали фотографии, голос и историю нашего близкого в одном месте, доступном всей семье, где бы она ни жила. Мы очень благодарны.',
    'Даже внуки, которые его не застали, теперь могут услышать его голос и узнать его историю по QR-коду на памятнике.',
  ],
  az: [
    'Bu platform sayəsində sevdiyimiz insanın fotolarını, səsini və xatirələrini bir yerdə topladıq. Bizə bu imkanı verdiyiniz üçün təşəkkür edirik.',
  ],
  hy: [
    'Այս հարթակի շնորհիվ մեր հարազատի լուսանկարները, ձայնն ու հուշերը հավաքեցինք մեկ տեղում՝ ամբողջ ընտանիքի համար հասանելի։ Անչափ շնորհակալ ենք։',
  ],
  he: [
    'בזכות הפלטפורמה הזו אספנו את התמונות, הקול והזיכרונות של יקירנו במקום אחד שנגיש לכל המשפחה. אנחנו אסירי תודה.',
  ],
}

function detectLang(nationality: string | null | undefined): QuoteLang {
  const v = (nationality ?? '').trim().toLowerCase()
  if (v === 'ge' || v === 'georgian' || v === 'georgia') return 'ka'
  if (v === 'tr' || v === 'turkish' || v === 'turkey' || v === 'türkiye') return 'tr'
  if (v === 'az' || v === 'azerbaijani' || v === 'azerbaijan') return 'az'
  if (v === 'am' || v === 'armenian' || v === 'armenia') return 'hy'
  if (v === 'ru' || v === 'russian' || v === 'russia') return 'ru'
  if (v === 'il' || v === 'israeli' || v === 'israel') return 'he'
  return 'en'
}

// `index`, aynı listede gösterilen kartların (aynı dilde olsalar bile) farklı
// alıntılar almasını sağlar — vault id'ye göre hash almak aynı dilden birkaç
// profili aynı bucket'a düşürüp tekrar yaratabiliyordu.
export function getFamilyThankYouQuote(nationality: string | null | undefined, index: number): string {
  const lang = detectLang(nationality)
  const pool = QUOTES[lang]
  return pool[((index % pool.length) + pool.length) % pool.length]
}
