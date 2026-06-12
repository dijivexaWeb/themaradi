'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock,
  Feather,
  Heart,
  MapPin,
  Navigation,
  PenLine,
  Play,
} from 'lucide-react'
import MemorialInteractions from './MemorialInteractions'
import { langs, type Lang } from '@/i18n'
import { useLang } from '@/i18n/context'
import BrandLogo, { BrandMark } from '@/components/BrandLogo'

const DEATH_DATE = new Date('2020-05-14')
const BIRTH_DATE = new Date('1940-03-22')

function getDaysSince() {
  return Math.floor((Date.now() - DEATH_DATE.getTime()) / (1000 * 60 * 60 * 24))
}

function getYearsLived() {
  return Math.floor((DEATH_DATE.getTime() - BIRTH_DATE.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

const localeByLang: Record<Lang, string> = {
  tr: 'tr-TR',
  ka: 'ka-GE',
  ru: 'ru-RU',
  en: 'en-US',
}

const memorialCopyBase = {
  tr: {
    nav: { home: 'Ana Sayfa', how: 'Nasıl Çalışır', memorials: 'Dijital Anıtlar', contact: 'İletişim', start: 'Başla' },
    hero: {
      imageAlt: 'Anma alanı',
      portraitAlt: 'Ahmet Yılmaz',
      qr: 'QR ile eriş',
      badge: 'Dijital Anıt Profili',
      motto: 'Sevgiyle yaşadı, sevgiyle hatırlanıyor.',
      familyTitle: 'Ailesinden',
      familyNote: 'Saygıyla anıyoruz. Bize bıraktığı sabır, iyilik ve sevgi bugün hâlâ yolumuzu aydınlatıyor. Her duada, her sofrada ve her güzel hatırada bizimle.',
      messageTitle: 'Ondan kalan söz',
      messageNote: 'Hayatta en kıymetli şeyin sevgi olduğunu öğrendim. Birbirinize iyi davranın, kırmadan konuşun ve iyiliğin peşinden gidin.',
      sinceLabel: 'Ebediyete yürüyeli',
      sinceSuffix: 'gün oldu',
      book: 'Anı Defteri',
      explore: 'Anıları Keşfet',
      scroll: 'Kaydır',
      yearsLine: 'yıllık bereketli bir ömür',
    },
    stats: [
      { suffix: 'yıl', label: 'Bereketli bir ömür' },
      { number: '55', suffix: 'yıl', label: 'Evlilik hayatı' },
      { number: '3 evlat', suffix: '7 torun', label: 'Bıraktığı nesil' },
      { number: '2.700+', suffix: 'öğrenci', label: 'Yetiştirdiği canlar' },
    ],
    tabs: ['Hayat Hikayesi', 'Kronoloji', 'Videolar', 'Fotoğraflar', 'Son Mesaj', 'Taziye', 'Ziyaret'],
    story: {
      label: 'Hayat Hikayesi',
      titleA: 'Bir öğretmenin',
      titleB: 'dolu dolu hayatı.',
      paragraphs: [
        "Ahmet Yılmaz, 1940 yılında Konya'nın tarihi dokusunda, mütevazı bir ailenin çocuğu olarak dünyaya geldi. Küçük yaşından itibaren kitaplara ve öğrenmeye olan tutkusu onu çevresindeki çocuklardan ayırıyordu. Mahalle mektebinden aldığı ilk dersler, onda bir ömür boyu sürecek bir ışığı yaktı.",
        "Ankara'da öğretmen okulunu bitirip göreve başladığında henüz on sekiz yaşındaydı. Kalabalık sınıflarda, kırık sıralarda, kömür sobası yanında ders anlatırken hiç şikayet etmedi. \"İnsan ne kadar verirse o kadar zenginleşir\" derdi. Ve gerçekten öyle yaşadı.",
        "1965'te eşi Fatma ile kurduğu yuva, onun için her şeyin merkeziydi. Üç çocuğu ve yedi torunu, onun dünyaya bıraktığı en güzel mirastı. Emekli olduktan sonra bahçe işleriyle, torunlarıyla ve okuduğu kitaplarla geçirdi yıllarını. Her sabah güne dua ile başladı, her akşam şükranla noktaladı.",
      ],
      quote: 'Her sabah okuduğu dua hiç değişmedi. Elli yıl boyunca aynı dua, aynı ses, aynı huzur. O sesin olmadığı sabahları bir türlü dolduramıyorum.',
      relation: 'Eşi - 55 yıl birlikte',
      books: 'Okuduğu kitap',
      teaching: 'Yıl öğretmenlik',
    },
    timelineLabel: 'Yaşam Kronolojisi',
    timelineTitleA: 'Önemli anlara',
    timelineTitleB: 'bir yolculuk.',
    timelineEvents: [
      { year: '1940', title: 'Dünyaya geldi', desc: "Konya'nın tarihi dokusunda, mütevazı bir ailenin çocuğu olarak doğdu. Küçük yaşından itibaren kitap ve öğrenmeye olan aşkıyla dikkat çekti." },
      { year: '1958', title: 'Öğretmenlik yolculuğu başladı', desc: "Ankara'ya taşındı. Öğretmenlik sınavını birincilikle geçti. 'İnsanlara öğretmek, onlara ışık vermektir' derdi." },
      { year: '1965', title: 'Fatma ile hayatını birleştirdi', desc: "55 yıl boyunca birlikte yürüyecekleri yola adım attılar. Ankara'da mütevazı bir düğünle başlayan bu yolculuk ömür boyu sürdü." },
      { year: '1967', title: 'Baba oldu', desc: 'İlk oğlu Hasan dünyaya geldi. Sonraki yıllarda Zeynep ve Ali de aileye katıldı. Üç evlat, yedi torun - en büyük mirası bunlardı.' },
      { year: '1985', title: 'Emekliliğe veda etti', desc: '27 yıl binlerce öğrenci yetiştirdi. Son gün tüm okul veda için toplandı. Gözyaşlarını tutmak kimse için mümkün olmadı.' },
      { year: '2020', title: 'Ebediyete yürüdü', desc: 'Seksen yıllık bereketli bir ömrün ardından, sevdiklerinin ortasında huzurla veda etti. Arkasında sayısız anı ve derin bir sevgi bıraktı.' },
    ],
    videos: { label: 'Video Anılar', titleA: 'Hareket eden', titleB: 'anlar.', featured: 'Öne Çıkan', demo: 'Bu videolar demo amaçlıdır.' },
    videoMemories: ['70. Doğum Günü Kutlaması', 'Torunlarla Son Bayram', 'Gürcistan Tatili', 'Emeklilik Töreni'],
    photos: { label: 'Fotoğraf Arşivi', titleA: 'Donmuş anlar,', titleB: 'canlı hatıralar.', count: 'fotoğraf' },
    photoTitles: ['İlk Aile Fotoğrafı', 'Bayram Sofrası', 'Gürcistan Gezisi', 'Son Aile Fotoğrafı', 'Bahçede Bir Öğleden Sonra', 'Emeklilik Yılları'],
    finalMessage: {
      label: 'Bıraktığı Son Mesaj',
      titleA: 'Hayattayken',
      titleB: 'sevdiklerine bıraktığı satırlar.',
      lines: ['Sevdiklerim,', 'Hayatta en kıymetli şeyin sevgi olduğunu öğrendim. Sahip olduklarınıza değil, yanınızdaki insanlara bakın. Gerçek zenginlik onlardadır.', 'Birbirinize daima iyi davranın. Kırmadan konuşun, elinizden geldiğince yardım edin. Küçük bir iyilik bile koca bir karanlığı aydınlatır.', 'Unutmayın, ben daima sizinleyim. Okuduğunuz her duada, sürdüğünüz her baharatta, paylaştığınız her sofrada yanınızda olacağım.', 'Sevgiyle kalın.'],
      placeDate: 'Konya, 12 Mart 2020',
    },
    voices: { label: 'Seslendirilmiş Anılar', titleA: 'Sesi hâlâ', titleB: 'burada.', demo: 'Demo ses kaydı' },
    voiceMemories: [
      { title: 'Sabah duası', author: "Ahmet Bey'in sesinden" },
      { title: 'Torunlarıma vasiyetim', author: "Ahmet Bey'in sesinden" },
      { title: 'Baba her zaman yanımızdaydı', author: 'Kızı Zeynep anlatıyor' },
    ],
    featured: { label: 'Öne Çıkan Anılar', titleA: 'Sevenlerinin', titleB: 'sözleriyle.' },
    featuredMemories: [
      { quote: 'Sabahları erkenden kalkar, kahvesini içerken okuduğu duayı hiç atlamazdı. O sesin olmadığı sabahları hâlâ özlüyorum.', author: 'Zeynep Yılmaz', relation: 'Kızı' },
      { quote: 'Bize ders değil, hayat öğretti. Tahtaya yazdığı her cümle aslında bir yaşam dersi gibiydi. Onu hiç unutmayacağız.', author: 'Mehmet Arslan', relation: 'Eski öğrencisi' },
      { quote: 'Elimi tuttuğunda dünya duruyordu sanki. O güven başka hiçbir yerde yoktu. Elli beş yıl boyunca hep öyleydi.', author: 'Fatma Yılmaz', relation: 'Eşi' },
    ],
    condolences: [
      { name: 'Ayşe Demir', date: '20 Mayıs 2024', relation: 'Komşusu', text: "Ahmet hocamıza Allah'tan rahmet. Mekanı cennet olsun. O bir insanlık abidesi gibiydi, herkes onu severdi." },
      { name: 'Mehmet Arslan', date: '18 Mayıs 2024', relation: 'Öğrencisi', text: 'Değerli hocam, öğrencilerinizden biri olarak sizi hiç unutmayacağım. Işıklar içinde uyuyun.' },
      { name: 'Fatma Kaya', date: '16 Mayıs 2024', relation: 'Komşusu', text: 'Zarafetiniz ve iyiliğiniz her zaman hatırlanacak. Geride güzel hatıralar bıraktınız.' },
      { name: 'Selim Yıldız', date: '15 Mayıs 2024', relation: 'Akrabası', text: 'Ahmet amcama rahmet, yakınlarına sabır ve güç diliyorum. Mekanı cennet olsun.' },
    ],
    visit: {
      label: 'Ziyaret Bilgisi',
      titleA: 'Mezarda',
      titleB: 'bir ziyaret.',
      imageAlt: 'Ahmet Yılmaz mezarı',
      cemeteryLine: '1940 - 2020 · Üçler Mezarlığı, Konya',
      infoTitle: 'Mezar Bilgileri',
      cemetery: 'Mezarlık',
      plot: 'Ada / Parsel',
      row: 'Sıra / Numara',
      hours: 'Ziyaret Saatleri',
      cemeteryValue: 'Üçler Mezarlığı, Konya',
      plotValue: 'Ada: 245 · Parsel: 18',
      rowValue: 'Sıra: C · Mezar No: 7',
      hoursValue: 'Her gün 08:00 - 19:00',
      noteLabel: 'Not:',
      note: 'Ziyaretçiler için uygun yürüyüş yolları mevcuttur. Ana girişten D kapısına yönelin, C sırasına 50 metre mesafededir.',
      mapTitle: 'Mezarlık konumu',
    },
    footer: {
      motto: 'Hatıralar yaşar, büyük sevgiler sonsuzdur.',
      platform: 'Platform',
      corporate: 'Kurumsal',
      documents: 'Belgeler',
      home: 'Ana Sayfa',
      demo: 'Örnek Profil',
      pricing: 'Fiyatlandırma',
      about: 'Hakkımızda',
      contact: 'İletişim',
      privacy: 'Gizlilik Politikası',
      terms: 'Kullanım Koşulları',
      kvkk: 'KVKK',
      rights: '© 2026 The Eternal Memory. Tüm hakları saklıdır.',
    },
    demoBanner: {
      text: 'Bu bir örnek anma profilidir.',
      cta: 'Profil Oluştur',
      home: 'Ana Sayfa',
    },
    bottomCta: {
      heading: 'Siz de sevdiklerinizi bu şekilde anabilirsiniz.',
      sub: 'Ahmet Yılmaz gibi bir profil birkaç dakikada oluşturulur.',
      primaryBtn: 'Fiyatları Gör',
      secondaryBtn: 'Ana Sayfaya Dön',
    },
  },
  en: {
    nav: { home: 'Home', how: 'How it works', memorials: 'Digital Memorials', contact: 'Contact', start: 'Start' },
    hero: {
      imageAlt: 'Memorial space',
      portraitAlt: 'Ahmet Yilmaz',
      qr: 'Access with QR',
      badge: 'Digital Memorial Profile',
      motto: 'He lived with love and is remembered with love.',
      familyTitle: 'From his family',
      familyNote: 'We remember him with respect. The patience, kindness and love he left us still light our way. He is with us in every prayer, every table and every good memory.',
      messageTitle: 'His words',
      messageNote: 'I learned that the most precious thing in life is love. Be kind to one another, speak without hurting, and follow what is good.',
      sinceLabel: 'Since passing',
      sinceSuffix: 'days',
      book: 'Memory Book',
      explore: 'Explore Memories',
      scroll: 'Scroll',
      yearsLine: 'years of a full and generous life',
    },
    stats: [
      { suffix: 'years', label: 'A full life' },
      { number: '55', suffix: 'years', label: 'Marriage' },
      { number: '3 children', suffix: '7 grandchildren', label: 'The generation he left' },
      { number: '2,700+', suffix: 'students', label: 'Lives he shaped' },
    ],
    tabs: ['Life Story', 'Timeline', 'Videos', 'Photos', 'Final Message', 'Condolences', 'Visit'],
    story: {
      label: 'Life Story',
      titleA: 'The full life',
      titleB: 'of a teacher.',
      paragraphs: [
        'Ahmet Yilmaz was born in 1940 in the historic fabric of Konya, into a modest family. From an early age, his love for books and learning set him apart from the children around him. The first lessons he received in the neighborhood school lit a lifelong light in him.',
        'When he finished teacher training in Ankara and began his duty, he was only eighteen. In crowded classrooms, on broken desks, beside a coal stove, he never complained while teaching. He used to say, "The more a person gives, the richer they become." And he truly lived that way.',
        'The home he built with his wife Fatma in 1965 was the center of everything for him. His three children and seven grandchildren were the most beautiful legacy he left to the world. After retirement, he spent his years gardening, being with his grandchildren, and reading books. Every morning began with prayer, every evening ended with gratitude.',
      ],
      quote: 'The prayer he read every morning never changed. The same prayer, the same voice, the same peace for fifty years. I still cannot fill the mornings without that voice.',
      relation: 'His wife - 55 years together',
      books: 'Books read',
      teaching: 'Years teaching',
    },
    timelineLabel: 'Life Timeline',
    timelineTitleA: 'A journey through',
    timelineTitleB: 'important moments.',
    timelineEvents: [
      { year: '1940', title: 'He was born', desc: 'He was born into a modest family in the historic texture of Konya. From childhood, he stood out with his love of books and learning.' },
      { year: '1958', title: 'His teaching journey began', desc: 'He moved to Ankara and passed the teaching exam at the top of his class. He would say, "Teaching people is giving them light."' },
      { year: '1965', title: 'He married Fatma', desc: 'They stepped onto a road they would walk together for 55 years. What began with a modest wedding in Ankara lasted a lifetime.' },
      { year: '1967', title: 'He became a father', desc: 'His first son Hasan was born. In the following years Zeynep and Ali joined the family. Three children and seven grandchildren became his greatest legacy.' },
      { year: '1985', title: 'He retired from teaching', desc: 'For 27 years he raised thousands of students. On his final day, the whole school gathered to say goodbye. Nobody could hold back their tears.' },
      { year: '2020', title: 'He passed into eternity', desc: 'After an abundant eighty-year life, he said farewell peacefully among his loved ones. He left behind countless memories and deep love.' },
    ],
    videos: { label: 'Video Memories', titleA: 'Moments', titleB: 'in motion.', featured: 'Featured', demo: 'These videos are for demo purposes.' },
    videoMemories: ['70th Birthday Celebration', 'Last Holiday with Grandchildren', 'Georgia Vacation', 'Retirement Ceremony'],
    photos: { label: 'Photo Archive', titleA: 'Frozen moments,', titleB: 'living memories.', count: 'photos' },
    photoTitles: ['First Family Photo', 'Holiday Table', 'Georgia Trip', 'Last Family Photo', 'An Afternoon in the Garden', 'Retirement Years'],
    finalMessage: {
      label: 'Final Message',
      titleA: 'The words he left',
      titleB: 'to his loved ones.',
      lines: ['My loved ones,', 'I learned that the most precious thing in life is love. Look not at what you own, but at the people beside you. True wealth is found in them.', 'Always be kind to one another. Speak without hurting, help as much as you can. Even a small kindness can light up a great darkness.', 'Remember, I am always with you. In every prayer you read, in every spice you use, at every table you share, I will be beside you.', 'Stay with love.'],
      placeDate: 'Konya, March 12, 2020',
    },
    voices: { label: 'Voiced Memories', titleA: 'His voice is', titleB: 'still here.', demo: 'Demo voice recording' },
    voiceMemories: [
      { title: 'Morning prayer', author: "In Ahmet Bey's voice" },
      { title: 'My will to my grandchildren', author: "In Ahmet Bey's voice" },
      { title: 'Father was always with us', author: 'Told by his daughter Zeynep' },
    ],
    featured: { label: 'Featured Memories', titleA: 'In the words', titleB: 'of loved ones.' },
    featuredMemories: [
      { quote: 'He woke early every morning and never skipped the prayer he read while drinking his coffee. I still miss mornings with that voice.', author: 'Zeynep Yilmaz', relation: 'Daughter' },
      { quote: 'He taught us life, not only lessons. Every sentence he wrote on the board was like a life lesson. We will never forget him.', author: 'Mehmet Arslan', relation: 'Former student' },
      { quote: 'When he held my hand, it felt as if the world stopped. That trust existed nowhere else. It was always like that for fifty-five years.', author: 'Fatma Yilmaz', relation: 'Wife' },
    ],
    condolences: [
      { name: 'Ayse Demir', date: 'May 20, 2024', relation: 'Neighbor', text: 'May God have mercy on our teacher Ahmet. May his resting place be heaven. He was a monument of humanity and everyone loved him.' },
      { name: 'Mehmet Arslan', date: 'May 18, 2024', relation: 'Student', text: 'Dear teacher, as one of your students I will never forget you. Rest in light.' },
      { name: 'Fatma Kaya', date: 'May 16, 2024', relation: 'Neighbor', text: 'Your grace and kindness will always be remembered. You left beautiful memories behind.' },
      { name: 'Selim Yildiz', date: 'May 15, 2024', relation: 'Relative', text: 'Mercy to Uncle Ahmet, and patience and strength to his loved ones. May his resting place be heaven.' },
    ],
    visit: {
      label: 'Visit Information',
      titleA: 'A visit',
      titleB: 'at the grave.',
      imageAlt: "Ahmet Yilmaz's grave",
      cemeteryLine: '1940 - 2020 · Ucler Cemetery, Konya',
      infoTitle: 'Grave Information',
      cemetery: 'Cemetery',
      plot: 'Block / Plot',
      row: 'Row / Number',
      hours: 'Visiting Hours',
      cemeteryValue: 'Ucler Cemetery, Konya',
      plotValue: 'Block: 245 · Plot: 18',
      rowValue: 'Row: C · Grave No: 7',
      hoursValue: 'Every day 08:00 - 19:00',
      noteLabel: 'Note:',
      note: 'Suitable walking paths are available for visitors. From the main entrance, head toward Gate D; it is 50 meters from row C.',
      mapTitle: 'Cemetery location',
    },
    footer: {
      motto: 'Memories live; great loves are endless.',
      platform: 'Platform',
      corporate: 'Company',
      documents: 'Documents',
      home: 'Home',
      demo: 'Demo Profile',
      pricing: 'Pricing',
      about: 'About us',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      kvkk: 'KVKK',
      rights: '© 2026 The Eternal Memory. All rights reserved.',
    },
    demoBanner: {
      text: 'This is a demo memorial profile.',
      cta: 'Create a Profile',
      home: 'Home',
    },
    bottomCta: {
      heading: 'You can memorialize your loved ones this way.',
      sub: 'A profile like this takes just minutes to create.',
      primaryBtn: 'See Pricing',
      secondaryBtn: 'Back to Home',
    },
  },
}

const memorialCopy: Record<Lang, typeof memorialCopyBase.tr> = {
  tr: memorialCopyBase.tr,
  en: memorialCopyBase.en,
  ka: {
    ...memorialCopyBase.en,
    nav: { home: 'მთავარი', how: 'როგორ მუშაობს', memorials: 'ციფრული მემორიალები', contact: 'კონტაქტი', start: 'დაწყება' },
    hero: { imageAlt: 'მემორიალური სივრცე', portraitAlt: 'აჰმეთ ილმაზი', qr: 'QR-ით წვდომა', badge: 'ციფრული სამახსოვრო პროფილი', motto: 'სიყვარულით იცხოვრა და სიყვარულით გვახსოვს.', familyTitle: 'ოჯახისგან', familyNote: 'პატივისცემით ვიხსენებთ. მოთმინება, სიკეთე და სიყვარული, რომელიც დაგვიტოვა, დღესაც გვინათებს გზას. ის ჩვენთან არის ყოველ ლოცვაში, სუფრასთან და თბილ მოგონებაში.', messageTitle: 'მისი სიტყვები', messageNote: 'ვისწავლე, რომ ცხოვრებაში ყველაზე ძვირფასი სიყვარულია. იყავით კეთილები ერთმანეთის მიმართ, ილაპარაკეთ ტკივილის გარეშე და მიჰყევით სიკეთეს.', sinceLabel: 'გარდაცვალებიდან', sinceSuffix: 'დღე გავიდა', book: 'მოგონებების წიგნი', explore: 'მოგონებების ნახვა', scroll: 'ჩამოსქროლეთ', yearsLine: 'სავსე და მადლიანი ცხოვრების წელი' },
    stats: [
      { suffix: 'წელი', label: 'მადლიანი ცხოვრება' },
      { number: '55', suffix: 'წელი', label: 'ქორწინება' },
      { number: '3 შვილი', suffix: '7 შვილიშვილი', label: 'დატოვებული თაობა' },
      { number: '2 700+', suffix: 'მოსწავლე', label: 'აღზრდილი ადამიანები' },
    ],
    tabs: ['ცხოვრების ისტორია', 'ქრონოლოგია', 'ვიდეოები', 'ფოტოები', 'ბოლო გზავნილი', 'სამძიმარი', 'მონახულება'],
    story: {
      label: 'ცხოვრების ისტორია',
      titleA: 'მასწავლებლის',
      titleB: 'სავსე ცხოვრება.',
      paragraphs: [
        'აჰმეთ ილმაზი 1940 წელს კონიის ისტორიულ გარემოში, მოკრძალებულ ოჯახში დაიბადა. ბავშვობიდანვე წიგნებისა და სწავლის სიყვარული მას თანატოლებისგან გამოარჩევდა. უბნის სკოლაში მიღებულმა პირველმა გაკვეთილებმა მასში მთელი ცხოვრების სინათლე აანთო.',
        'როცა ანკარაში პედაგოგიური სკოლა დაამთავრა და მუშაობა დაიწყო, მხოლოდ თვრამეტი წლის იყო. ხალხმრავალ კლასებში, ძველ მერხებთან და ქვანახშირის ღუმელთან გაკვეთილების ჩატარებისას არასდროს წუწუნებდა. ამბობდა: "ადამიანი რაც მეტს გასცემს, მით უფრო მდიდრდება." და მართლაც ასე ცხოვრობდა.',
        '1965 წელს ფატმასთან შექმნილი ოჯახი მისთვის ყველაფრის ცენტრი იყო. სამი შვილი და შვიდი შვილიშვილი ის ყველაზე ლამაზი მემკვიდრეობა იყო, რომელიც სამყაროს დაუტოვა. პენსიაზე გასვლის შემდეგ წლები ბაღში, შვილიშვილებთან და წიგნებთან გაატარა. ყოველი დილა ლოცვით იწყებოდა და ყოველი საღამო მადლიერებით სრულდებოდა.',
      ],
      quote: 'მისი დილის ლოცვა არასდროს იცვლებოდა. ორმოცდაათი წელი ერთი და იგივე ლოცვა, ხმა და სიმშვიდე. იმ ხმის გარეშე დილებს დღემდე ვერ ვივსებ.',
      relation: 'მეუღლე - 55 წელი ერთად',
      books: 'წაკითხული წიგნი',
      teaching: 'წელი მასწავლებლად',
    },
    timelineLabel: 'ცხოვრების ქრონოლოგია',
    timelineTitleA: 'მნიშვნელოვან მომენტებში',
    timelineTitleB: 'მოგზაურობა.',
    timelineEvents: [
      { year: '1940', title: 'დაიბადა', desc: 'კონიის ისტორიულ გარემოში, მოკრძალებულ ოჯახში დაიბადა. ბავშვობიდან წიგნებისა და სწავლის სიყვარულით გამოირჩეოდა.' },
      { year: '1958', title: 'მასწავლებლობის გზა დაიწყო', desc: 'ანკარაში გადავიდა და მასწავლებლის გამოცდა საუკეთესო შედეგით ჩააბარა. ამბობდა: "ადამიანებისთვის სწავლება მათთვის სინათლის მიცემაა."' },
      { year: '1965', title: 'ფატმას დაუკავშირა ცხოვრება', desc: 'ისინი გზას დაადგნენ, რომელსაც 55 წელი ერთად გაივლიდნენ. ანკარაში მოკრძალებული ქორწილით დაწყებული ეს მოგზაურობა მთელი ცხოვრება გაგრძელდა.' },
      { year: '1967', title: 'მამა გახდა', desc: 'პირველი შვილი ჰასანი დაიბადა. შემდეგ წლებში ოჯახს ზეინეფი და ალიც შეემატნენ. სამი შვილი და შვიდი შვილიშვილი მისი უდიდესი მემკვიდრეობა იყო.' },
      { year: '1985', title: 'პენსიაზე გავიდა', desc: '27 წლის განმავლობაში ათასობით მოსწავლე აღზარდა. ბოლო დღეს მთელი სკოლა გამოსამშვიდობებლად შეიკრიბა. ცრემლების შეკავება ვერავინ შეძლო.' },
      { year: '2020', title: 'მარადისობას შეუერთდა', desc: 'ოთხმოცწლიანი მადლიანი ცხოვრების შემდეგ საყვარელი ადამიანების გარემოცვაში მშვიდად დაგვემშვიდობა. უამრავი მოგონება და ღრმა სიყვარული დატოვა.' },
    ],
    videos: { label: 'ვიდეო მოგონებები', titleA: 'მოძრავი', titleB: 'მომენტები.', featured: 'რჩეული', demo: 'ეს ვიდეოები დემო მიზნებისთვისაა.' },
    videoMemories: ['70-ე დაბადების დღის აღნიშვნა', 'ბოლო დღესასწაული შვილიშვილებთან', 'საქართველოში მოგზაურობა', 'პენსიაზე გასვლის ცერემონია'],
    photos: { label: 'ფოტო არქივი', titleA: 'გაყინული წამები,', titleB: 'ცოცხალი მოგონებები.', count: 'ფოტო' },
    photoTitles: ['პირველი ოჯახური ფოტო', 'სადღესასწაულო სუფრა', 'საქართველოში მოგზაურობა', 'ბოლო ოჯახური ფოტო', 'შუადღე ბაღში', 'პენსიის წლები'],
    finalMessage: {
      label: 'ბოლო გზავნილი',
      titleA: 'სიცოცხლეში დატოვებული',
      titleB: 'სიტყვები საყვარელებისთვის.',
      lines: ['ჩემო საყვარელებო,', 'ვისწავლე, რომ ცხოვრებაში ყველაზე ძვირფასი სიყვარულია. ნუ უყურებთ იმას, რაც გაქვთ; შეხედეთ ადამიანებს, რომლებიც გვერდით გყავთ. ნამდვილი სიმდიდრე მათშია.', 'ყოველთვის კეთილად მოექეცით ერთმანეთს. ილაპარაკეთ ტკივილის მიყენების გარეშე და დაეხმარეთ, რამდენადაც შეძლებთ. პატარა სიკეთეც დიდ სიბნელეს ანათებს.', 'გახსოვდეთ, მე ყოველთვის თქვენთან ვარ. ყოველ ლოცვაში, ყოველ სურნელში და ყოველ გაზიარებულ სუფრასთან თქვენს გვერდით ვიქნები.', 'სიყვარულით იყავით.'],
      placeDate: 'კონია, 12 მარტი 2020',
    },
    voices: { label: 'ხმოვანი მოგონებები', titleA: 'მისი ხმა', titleB: 'აქ არის.', demo: 'დემო ხმოვანი ჩანაწერი' },
    voiceMemories: [
      { title: 'დილის ლოცვა', author: 'აჰმეთ ბეის ხმით' },
      { title: 'ანდერძი შვილიშვილებს', author: 'აჰმეთ ბეის ხმით' },
      { title: 'მამა ყოველთვის ჩვენთან იყო', author: 'ჰყვება მისი ქალიშვილი ზეინეფი' },
    ],
    featured: { label: 'რჩეული მოგონებები', titleA: 'ახლობლების', titleB: 'სიტყვებით.' },
    featuredMemories: [
      { quote: 'ყოველ დილას ადრე დგებოდა და ყავის სმისას ლოცვას არასდროს ტოვებდა. იმ ხმის გარეშე დილები დღემდე მენატრება.', author: 'ზეინეფ ილმაზი', relation: 'ქალიშვილი' },
      { quote: 'მან მხოლოდ გაკვეთილები კი არა, ცხოვრება გვასწავლა. დაფაზე დაწერილი ყოველი წინადადება ცხოვრების გაკვეთილი იყო.', author: 'მეჰმეთ არსლანი', relation: 'ყოფილი მოსწავლე' },
      { quote: 'როცა ხელს მკიდებდა, თითქოს სამყარო ჩერდებოდა. ასეთი ნდობა სხვაგან არსად იყო. ორმოცდათხუთმეტი წელი ასე გაგრძელდა.', author: 'ფატმა ილმაზი', relation: 'მეუღლე' },
    ],
    condolences: [
      { name: 'აიშე დემირი', date: '20 მაისი 2024', relation: 'მეზობელი', text: 'ღმერთმა შეიწყალოს ჩვენი მასწავლებელი აჰმეთი. ნათელი იყოს მისი სული. ის ადამიანობის მაგალითი იყო და ყველას უყვარდა.' },
      { name: 'მეჰმეთ არსლანი', date: '18 მაისი 2024', relation: 'მოსწავლე', text: 'ძვირფასო მასწავლებელო, როგორც თქვენი ერთ-ერთი მოსწავლე, არასდროს დაგივიწყებთ. ნათელში განისვენეთ.' },
      { name: 'ფატმა ქაია', date: '16 მაისი 2024', relation: 'მეზობელი', text: 'თქვენი სიდინჯე და სიკეთე ყოველთვის გვემახსოვრება. ლამაზი მოგონებები დაგვიტოვეთ.' },
      { name: 'სელიმ ილდიზი', date: '15 მაისი 2024', relation: 'ნათესავი', text: 'ღმერთმა შეიწყალოს აჰმეთ ბიძია, მის ახლობლებს მოთმინებას და ძალას ვუსურვებ.' },
    ],
    visit: { label: 'მონახულების ინფორმაცია', titleA: 'საფლავთან', titleB: 'მონახულება.', imageAlt: 'აჰმეთ ილმაზის საფლავი', cemeteryLine: '1940 - 2020 · უჩლერის სასაფლაო, კონია', infoTitle: 'საფლავის ინფორმაცია', cemetery: 'სასაფლაო', plot: 'უბანი / ნაკვეთი', row: 'რიგი / ნომერი', hours: 'მონახულების საათები', cemeteryValue: 'უჩლერის სასაფლაო, კონია', plotValue: 'უბანი: 245 · ნაკვეთი: 18', rowValue: 'რიგი: C · საფლავი No: 7', hoursValue: 'ყოველდღე 08:00 - 19:00', noteLabel: 'შენიშვნა:', note: 'მნახველებისთვის ხელმისაწვდომია კომფორტული სასეირნო ბილიკები. მთავარი შესასვლელიდან D კარიბჭისკენ გაემართეთ; C რიგამდე 50 მეტრია.', mapTitle: 'სასაფლაოს მდებარეობა' },
    footer: { motto: 'მოგონებები ცოცხლობს, დიდი სიყვარული უსასრულოა.', platform: 'პლატფორმა', corporate: 'კომპანია', documents: 'დოკუმენტები', home: 'მთავარი', demo: 'დემო პროფილი', pricing: 'ფასები', about: 'ჩვენ შესახებ', contact: 'კონტაქტი', privacy: 'კონფიდენციალურობა', terms: 'გამოყენების პირობები', kvkk: 'KVKK', rights: '© 2026 The Eternal Memory. ყველა უფლება დაცულია.' },
    demoBanner: { text: 'ეს სადემონსტრაციო პროფილია.', cta: 'პროფილის შექმნა', home: 'მთავარი' },
    bottomCta: { heading: 'შეგიძლიათ ასე გაიხსენოთ თქვენი საყვარელი ადამიანები.', sub: 'ამ მსგავსი პროფილი რამდენიმე წუთში იქმნება.', primaryBtn: 'ფასების ნახვა', secondaryBtn: 'მთავარ გვერდზე' },
  },
  ru: {
    ...memorialCopyBase.en,
    nav: { home: 'Главная', how: 'Как это работает', memorials: 'Цифровые мемориалы', contact: 'Контакты', start: 'Начать' },
    hero: { imageAlt: 'Мемориальное место', portraitAlt: 'Ахмет Йылмаз', qr: 'Доступ по QR', badge: 'Цифровой мемориальный профиль', motto: 'Он жил с любовью и с любовью вспоминается.', familyTitle: 'От семьи', familyNote: 'Мы вспоминаем его с уважением. Терпение, доброта и любовь, которые он оставил нам, до сих пор освещают наш путь. Он с нами в каждой молитве, за каждым столом и в каждом добром воспоминании.', messageTitle: 'Его слова', messageNote: 'Я понял, что самое ценное в жизни - любовь. Будьте добры друг к другу, говорите не раня и следуйте за добром.', sinceLabel: 'С момента ухода', sinceSuffix: 'дней', book: 'Книга памяти', explore: 'Смотреть воспоминания', scroll: 'Прокрутите', yearsLine: 'лет полной и благословенной жизни' },
    stats: [
      { suffix: 'лет', label: 'Благословенная жизнь' },
      { number: '55', suffix: 'лет', label: 'Брак' },
      { number: '3 детей', suffix: '7 внуков', label: 'Поколение, которое он оставил' },
      { number: '2 700+', suffix: 'учеников', label: 'Люди, которых он воспитал' },
    ],
    tabs: ['История жизни', 'Хронология', 'Видео', 'Фотографии', 'Последнее послание', 'Соболезнования', 'Посещение'],
    story: {
      label: 'История жизни',
      titleA: 'Полная жизнь',
      titleB: 'учителя.',
      paragraphs: [
        'Ахмет Йылмаз родился в 1940 году в исторической Конии, в скромной семье. С раннего детства любовь к книгам и учебе выделяла его среди сверстников. Первые уроки в местной школе зажгли в нем свет на всю жизнь.',
        'Когда он окончил педагогическую школу в Анкаре и начал работать, ему было всего восемнадцать. В переполненных классах, за старыми партами, рядом с угольной печью он никогда не жаловался. Он говорил: "Чем больше человек отдает, тем богаче становится." И действительно так жил.',
        'Дом, который он создал с Фатмой в 1965 году, был для него центром всего. Трое детей и семеро внуков стали самым прекрасным наследием, которое он оставил миру. После выхода на пенсию он проводил годы в саду, с внуками и книгами. Каждое утро начиналось с молитвы, каждый вечер заканчивался благодарностью.',
      ],
      quote: 'Его утренняя молитва никогда не менялась. Одна и та же молитва, один и тот же голос, одно и то же спокойствие на протяжении пятидесяти лет. Я до сих пор не могу заполнить утра без этого голоса.',
      relation: 'Жена - 55 лет вместе',
      books: 'Прочитанные книги',
      teaching: 'Лет преподавания',
    },
    timelineLabel: 'Хронология жизни',
    timelineTitleA: 'Путешествие по',
    timelineTitleB: 'важным моментам.',
    timelineEvents: [
      { year: '1940', title: 'Родился', desc: 'Он родился в скромной семье в исторической Конии. С детства выделялся любовью к книгам и знаниям.' },
      { year: '1958', title: 'Начал путь учителя', desc: 'Переехал в Анкару и с лучшим результатом сдал экзамен на учителя. Он говорил: "Учить людей - значит давать им свет."' },
      { year: '1965', title: 'Связал жизнь с Фатмой', desc: 'Они вступили на путь, который прошли вместе 55 лет. Скромная свадьба в Анкаре стала началом истории на всю жизнь.' },
      { year: '1967', title: 'Стал отцом', desc: 'Родился первый сын Хасан. Позже к семье присоединились Зейнеп и Али. Трое детей и семеро внуков стали его величайшим наследием.' },
      { year: '1985', title: 'Вышел на пенсию', desc: 'За 27 лет он воспитал тысячи учеников. В последний день вся школа собралась попрощаться. Никто не смог сдержать слез.' },
      { year: '2020', title: 'Ушел в вечность', desc: 'После восьмидесяти лет благословенной жизни он мирно попрощался в кругу близких. Он оставил бесчисленные воспоминания и глубокую любовь.' },
    ],
    videos: { label: 'Видео воспоминания', titleA: 'Моменты', titleB: 'в движении.', featured: 'Избранное', demo: 'Эти видео представлены для демонстрации.' },
    videoMemories: ['Празднование 70-летия', 'Последний праздник с внуками', 'Поездка в Грузию', 'Церемония выхода на пенсию'],
    photos: { label: 'Фотоархив', titleA: 'Застывшие мгновения,', titleB: 'живые воспоминания.', count: 'фото' },
    photoTitles: ['Первое семейное фото', 'Праздничный стол', 'Поездка в Грузию', 'Последнее семейное фото', 'Послеобеденное время в саду', 'Годы на пенсии'],
    finalMessage: { label: 'Последнее послание', titleA: 'Слова, оставленные', titleB: 'любимым людям.', lines: ['Мои дорогие,', 'Я понял, что самое ценное в жизни - любовь. Смотрите не на то, чем владеете, а на людей рядом с вами. Настоящее богатство - в них.', 'Всегда относитесь друг к другу с добротой. Говорите, не раня, помогайте, насколько можете. Даже маленькая доброта освещает большую темноту.', 'Помните, я всегда с вами. В каждой молитве, в каждом аромате и за каждым общим столом я буду рядом.', 'Оставайтесь с любовью.'], placeDate: 'Кония, 12 марта 2020' },
    voices: { label: 'Голосовые воспоминания', titleA: 'Его голос', titleB: 'все еще здесь.', demo: 'Демо аудиозапись' },
    voiceMemories: [
      { title: 'Утренняя молитва', author: 'Голосом Ахмет-бея' },
      { title: 'Мое завещание внукам', author: 'Голосом Ахмет-бея' },
      { title: 'Отец всегда был рядом', author: 'Рассказывает дочь Зейнеп' },
    ],
    featured: { label: 'Избранные воспоминания', titleA: 'Словами', titleB: 'близких.' },
    featuredMemories: [
      { quote: 'Он рано вставал и никогда не пропускал молитву за утренним кофе. Я до сих пор скучаю по утрам с этим голосом.', author: 'Зейнеп Йылмаз', relation: 'Дочь' },
      { quote: 'Он учил нас не только предмету, он учил жизни. Каждая фраза на доске была уроком жизни. Мы никогда его не забудем.', author: 'Мехмет Арслан', relation: 'Бывший ученик' },
      { quote: 'Когда он держал меня за руку, казалось, что мир останавливается. Такого доверия не было нигде. Так было все пятьдесят пять лет.', author: 'Фатма Йылмаз', relation: 'Жена' },
    ],
    condolences: [
      { name: 'Айше Демир', date: '20 мая 2024', relation: 'Соседка', text: 'Пусть Бог помилует нашего учителя Ахмета. Пусть его обитель будет раем. Он был примером человечности, его все любили.' },
      { name: 'Мехмет Арслан', date: '18 мая 2024', relation: 'Ученик', text: 'Дорогой учитель, как один из ваших учеников, я никогда вас не забуду. Покойтесь в свете.' },
      { name: 'Фатма Кая', date: '16 мая 2024', relation: 'Соседка', text: 'Ваше благородство и доброта всегда будут помнитьcя. Вы оставили прекрасные воспоминания.' },
      { name: 'Селим Йылдыз', date: '15 мая 2024', relation: 'Родственник', text: 'Милости Ахмету-дяде, а его близким терпения и сил. Пусть его обитель будет раем.' },
    ],
    visit: { label: 'Информация о посещении', titleA: 'Посещение', titleB: 'у могилы.', imageAlt: 'Могила Ахмета Йылмаза', cemeteryLine: '1940 - 2020 · Кладбище Учлер, Кония', infoTitle: 'Информация о могиле', cemetery: 'Кладбище', plot: 'Участок / Парцелла', row: 'Ряд / Номер', hours: 'Часы посещения', cemeteryValue: 'Кладбище Учлер, Кония', plotValue: 'Участок: 245 · Парцелла: 18', rowValue: 'Ряд: C · Могила No: 7', hoursValue: 'Ежедневно 08:00 - 19:00', noteLabel: 'Примечание:', note: 'Для посетителей есть удобные пешеходные дорожки. От главного входа направляйтесь к воротам D; ряд C находится в 50 метрах.', mapTitle: 'Местоположение кладбища' },
    footer: { motto: 'Воспоминания живут, большая любовь бесконечна.', platform: 'Платформа', corporate: 'Компания', documents: 'Документы', home: 'Главная', demo: 'Демо профиль', pricing: 'Цены', about: 'О нас', contact: 'Контакты', privacy: 'Политика конфиденциальности', terms: 'Условия использования', kvkk: 'KVKK', rights: '© 2026 The Eternal Memory. Все права защищены.' },
    demoBanner: { text: 'Это демонстрационный профиль.', cta: 'Создать профиль', home: 'Главная' },
    bottomCta: { heading: 'Вы тоже можете увековечить своих близких.', sub: 'Профиль как этот создаётся за несколько минут.', primaryBtn: 'Смотреть цены', secondaryBtn: 'На главную' },
  },
}
const voiceMemoryBars = [
  {
    title: 'Sabah duasÄ±',
    author: "Ahmet Bey'in sesinden",
    bars: [3, 5, 8, 4, 7, 9, 3, 6, 5, 8, 4, 7, 6, 3, 9, 5, 4, 7, 6, 8],
  },
  {
    title: 'TorunlarÄ±ma vasiyetim',
    author: "Ahmet Bey'in sesinden",
    bars: [5, 3, 7, 9, 4, 6, 8, 3, 5, 7, 4, 6, 3, 8, 5, 7, 9, 4, 6, 5],
  },
  {
    title: 'Baba her zaman yanÄ±mÄ±zdaydÄ±',
    author: 'KÄ±zÄ± Zeynep anlatÄ±yor',
    bars: [4, 7, 5, 3, 8, 6, 4, 7, 5, 3, 6, 8, 4, 5, 7, 3, 6, 8, 5, 4],
  },
]

export default function MemorialPage() {
  const { lang, setLang } = useLang()
  const [selectedTimeline, setSelectedTimeline] = useState(0)
  const copy = memorialCopy[lang]
  const daysSince = getDaysSince()
  const yearsLived = getYearsLived()
  const photos = [
    { src: '/images/landing/memorial-family-old.png', title: copy.photoTitles[0], year: '1968' },
    { src: '/images/landing/memorial-family-dinner.png', title: copy.photoTitles[1], year: '1975' },
    { src: '/images/landing/memorial-georgia.png', title: copy.photoTitles[2], year: '1990' },
    { src: '/images/landing/memorial-family-main.png', title: copy.photoTitles[3], year: '2019' },
    { src: '/images/landing/memorial-hero-cemetery.png', title: copy.photoTitles[4], year: '2005' },
    { src: '/images/landing/memorial-ahmet.png', title: copy.photoTitles[5], year: '2012' },
  ]
  const videoMemories = [
    { thumb: '/images/landing/memorial-family-main.png', title: copy.videoMemories[0], duration: '4:32', featured: true },
    { thumb: '/images/landing/memorial-family-old.png', title: copy.videoMemories[1], duration: '2:15' },
    { thumb: '/images/landing/memorial-georgia.png', title: copy.videoMemories[2], duration: '8:47' },
    { thumb: '/images/landing/memorial-family-dinner.png', title: copy.videoMemories[3], duration: '6:20' },
  ]
  const voiceMemories = voiceMemoryBars.map((item, index) => ({ ...item, ...copy.voiceMemories[index] }))
  const timelineEvents = copy.timelineEvents
  const timelineMedia = [
    '/images/landing/memorial-family-old.png',
    '/images/landing/memorial-family-dinner.png',
    '/images/landing/memorial-georgia.png',
    '/images/landing/memorial-family-main.png',
    '/images/landing/memorial-hero-cemetery.png',
    '/images/landing/memorial-ahmet.png',
  ]
  const selectedEvent = timelineEvents[selectedTimeline]
  const featuredMemories = copy.featuredMemories
  const condolences = copy.condolences
  const journeyUi = {
    tr: { title: 'Zaman Yolculuğu', timeline: 'Zaman Çizgisi', slideshow: 'Slayt Gösterisi', age: 'Yaş Seçimi', years: 'yıllık hikaye', chapter: 'Dönüm noktası', cta: 'Anıları aç' },
    en: { title: 'Time Journey', timeline: 'Timeline', slideshow: 'Slideshow', age: 'Age Selection', years: 'years of story', chapter: 'Milestone', cta: 'Open memories' },
    ka: { title: 'დროის მოგზაურობა', timeline: 'დროის ხაზი', slideshow: 'სლაიდები', age: 'ასაკის არჩევა', years: 'წლის ისტორია', chapter: 'მნიშვნელოვანი ეტაპი', cta: 'მოგონებების ნახვა' },
    ru: { title: 'Путешествие во времени', timeline: 'Линия времени', slideshow: 'Слайд-шоу', age: 'Выбор возраста', years: 'лет истории', chapter: 'Важный этап', cta: 'Открыть воспоминания' },
  }[lang]
  const familyUi = {
    tr: {
      label: 'Aile Bağları',
      titleA: 'Köklerden',
      titleB: 'yeni nesillere.',
      tabTree: 'Aile Ağacı',
      tabClose: 'Yakın Aile',
      generation: 'kuşak',
      protected: 'Bu aile bağı The Eternal Memory ile korunur.',
      people: [
        { name: 'Mehmet Yılmaz', relation: 'Babası', years: '1915 - 1988', initials: 'MY', image: '/images/landing/profile-family-old.png', position: '35% 32%' },
        { name: 'Ayşe Yılmaz', relation: 'Annesi', years: '1918 - 1995', initials: 'AY', image: '/images/landing/profile-family-old.png', position: '68% 34%' },
        { name: 'Ahmet Yılmaz', relation: 'Kendisi', years: '1940 - 2020', initials: 'AY', image: '/images/landing/memorial-ahmet.png', position: '50% 18%', featured: true },
        { name: 'Fatma Yılmaz', relation: 'Eşi', years: '1945 -', initials: 'FY', image: '/images/landing/profile-family-main.png', position: '62% 28%' },
        { name: 'Hasan Yılmaz', relation: 'Oğlu', years: '1966 -', initials: 'HY', image: '/images/landing/profile-family-dinner.png', position: '35% 28%' },
        { name: 'Zeynep Yılmaz', relation: 'Kızı', years: '1968 -', initials: 'ZY', image: '/images/landing/profile-georgia.png', position: '58% 26%' },
        { name: 'Elif Yılmaz', relation: 'Torunu', years: '1995 -', initials: 'EY', image: '/images/landing/profile-family-main.png', position: '34% 30%' },
        { name: 'Kerem Yılmaz', relation: 'Torunu', years: '1998 -', initials: 'KY', image: '/images/landing/profile-georgia.png', position: '42% 28%' },
      ],
    },
    en: {
      label: 'Family Bonds',
      titleA: 'From roots',
      titleB: 'to new generations.',
      tabTree: 'Family Tree',
      tabClose: 'Close Family',
      generation: 'generations',
      protected: 'This family bond is preserved with The Eternal Memory.',
      people: [
        { name: 'Mehmet Yilmaz', relation: 'Father', years: '1915 - 1988', initials: 'MY', image: '/images/landing/profile-family-old.png', position: '35% 32%' },
        { name: 'Ayse Yilmaz', relation: 'Mother', years: '1918 - 1995', initials: 'AY', image: '/images/landing/profile-family-old.png', position: '68% 34%' },
        { name: 'Ahmet Yilmaz', relation: 'Profile', years: '1940 - 2020', initials: 'AY', image: '/images/landing/memorial-ahmet.png', position: '50% 18%', featured: true },
        { name: 'Fatma Yilmaz', relation: 'Wife', years: '1945 -', initials: 'FY', image: '/images/landing/profile-family-main.png', position: '62% 28%' },
        { name: 'Hasan Yilmaz', relation: 'Son', years: '1966 -', initials: 'HY', image: '/images/landing/profile-family-dinner.png', position: '35% 28%' },
        { name: 'Zeynep Yilmaz', relation: 'Daughter', years: '1968 -', initials: 'ZY', image: '/images/landing/profile-georgia.png', position: '58% 26%' },
        { name: 'Elif Yilmaz', relation: 'Granddaughter', years: '1995 -', initials: 'EY', image: '/images/landing/profile-family-main.png', position: '34% 30%' },
        { name: 'Kerem Yilmaz', relation: 'Grandson', years: '1998 -', initials: 'KY', image: '/images/landing/profile-georgia.png', position: '42% 28%' },
      ],
    },
    ka: {
      label: 'ოჯახური კავშირები',
      titleA: 'ფესვებიდან',
      titleB: 'ახალ თაობებამდე.',
      tabTree: 'ოჯახის ხე',
      tabClose: 'ახლო ოჯახი',
      generation: 'თაობა',
      protected: 'ეს ოჯახური კავშირი The Eternal Memory-სთან ინახება.',
      people: [
        { name: 'მეჰმეთ ილმაზი', relation: 'მამა', years: '1915 - 1988', initials: 'MY', image: '/images/landing/profile-family-old.png', position: '35% 32%' },
        { name: 'აიშე ილმაზი', relation: 'დედა', years: '1918 - 1995', initials: 'AY', image: '/images/landing/profile-family-old.png', position: '68% 34%' },
        { name: 'აჰმეთ ილმაზი', relation: 'პროფილი', years: '1940 - 2020', initials: 'AY', image: '/images/landing/memorial-ahmet.png', position: '50% 18%', featured: true },
        { name: 'ფატმა ილმაზი', relation: 'მეუღლე', years: '1945 -', initials: 'FY', image: '/images/landing/profile-family-main.png', position: '62% 28%' },
        { name: 'ჰასან ილმაზი', relation: 'ვაჟი', years: '1966 -', initials: 'HY', image: '/images/landing/profile-family-dinner.png', position: '35% 28%' },
        { name: 'ზეინეფ ილმაზი', relation: 'ქალიშვილი', years: '1968 -', initials: 'ZY', image: '/images/landing/profile-georgia.png', position: '58% 26%' },
        { name: 'ელიფ ილმაზი', relation: 'შვილიშვილი', years: '1995 -', initials: 'EY', image: '/images/landing/profile-family-main.png', position: '34% 30%' },
        { name: 'ქერემ ილმაზი', relation: 'შვილიშვილი', years: '1998 -', initials: 'KY', image: '/images/landing/profile-georgia.png', position: '42% 28%' },
      ],
    },
    ru: {
      label: 'Семейные связи',
      titleA: 'От корней',
      titleB: 'к новым поколениям.',
      tabTree: 'Семейное дерево',
      tabClose: 'Близкая семья',
      generation: 'поколения',
      protected: 'Эта семейная связь сохранена с The Eternal Memory.',
      people: [
        { name: 'Мехмет Йылмаз', relation: 'Отец', years: '1915 - 1988', initials: 'MY', image: '/images/landing/profile-family-old.png', position: '35% 32%' },
        { name: 'Айше Йылмаз', relation: 'Мать', years: '1918 - 1995', initials: 'AY', image: '/images/landing/profile-family-old.png', position: '68% 34%' },
        { name: 'Ахмет Йылмаз', relation: 'Профиль', years: '1940 - 2020', initials: 'AY', image: '/images/landing/memorial-ahmet.png', position: '50% 18%', featured: true },
        { name: 'Фатма Йылмаз', relation: 'Жена', years: '1945 -', initials: 'FY', image: '/images/landing/profile-family-main.png', position: '62% 28%' },
        { name: 'Хасан Йылмаз', relation: 'Сын', years: '1966 -', initials: 'HY', image: '/images/landing/profile-family-dinner.png', position: '35% 28%' },
        { name: 'Зейнеп Йылмаз', relation: 'Дочь', years: '1968 -', initials: 'ZY', image: '/images/landing/profile-georgia.png', position: '58% 26%' },
        { name: 'Элиф Йылмаз', relation: 'Внучка', years: '1995 -', initials: 'EY', image: '/images/landing/profile-family-main.png', position: '34% 30%' },
        { name: 'Керем Йылмаз', relation: 'Внук', years: '1998 -', initials: 'KY', image: '/images/landing/profile-georgia.png', position: '42% 28%' },
      ],
    },
  }[lang]

  return (
    <div className="min-h-screen bg-[#fbf8f1] text-[#173d31]">
      <DemoBanner copy={copy.demoBanner} />
      <MemorialNav lang={lang} setLang={setLang} copy={copy.nav} />

      {/* â"€â"€ HERO â"€â"€ */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-[#0c3327]">
        <Image
          src="/images/landing/memorial-cemetery.png"
          alt={copy.hero.imageAlt}
          fill priority
          sizes="100vw"
          className="object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c3327] via-[#0c3327]/85 to-[#0c3327]/20" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-5 px-5 pt-[108px] pb-12 sm:px-8 sm:pt-[108px] sm:pb-16 lg:grid-cols-[1fr_380px_1fr] lg:gap-10 lg:pt-[108px] lg:pb-20">
          <div className="order-2 rounded-2xl border border-[#c7a76f]/20 bg-[#091712]/55 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-6 lg:order-1">
            <div className="mb-3 flex items-center gap-3 text-[#c7a76f] sm:mb-4">
              <span className="h-px w-8 bg-[#c7a76f] sm:w-10" />
              <span className="text-xs tracking-[0.22em] uppercase">{copy.hero.familyTitle}</span>
            </div>
            <p className="font-serif text-lg leading-8 text-white sm:text-2xl sm:leading-9">
              {copy.hero.familyNote}
            </p>
            <a href="#taziye" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#c7a76f] px-4 py-2.5 text-xs font-semibold text-[#0c3327] transition hover:bg-[#d4b87c] sm:mt-6 sm:px-5 sm:py-3">
              {copy.hero.book}
              <PenLine className="h-4 w-4" />
            </a>
          </div>

          <div className="order-1 text-center lg:order-2">
            <div className="mx-auto mb-4 flex w-fit items-center gap-3 text-[#c7a76f] sm:mb-5">
              <span className="h-px w-8 bg-[#c7a76f] sm:w-10" />
              <span className="text-xs tracking-[0.25em] uppercase">{copy.hero.badge}</span>
              <span className="h-px w-8 bg-[#c7a76f] sm:w-10" />
            </div>

            <div className="relative mx-auto h-[210px] w-[210px] overflow-hidden rounded-full border-[5px] border-[#c7a76f]/35 bg-[#0c3327] shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:h-[310px] sm:w-[310px] sm:border-[6px]">
              <Image
                src="/images/landing/memorial-ahmet.png"
                alt={copy.hero.portraitAlt}
                fill
                priority
                sizes="310px"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/15" />
            </div>

            <h1 className="mt-5 font-serif text-4xl leading-none text-white sm:mt-7 sm:text-6xl">
              {copy.hero.portraitAlt}
            </h1>
            <div className="mt-3 flex items-center justify-center gap-4 font-serif text-lg text-[#efe7d8]/80 sm:text-xl">
              <span>1940</span>
              <Feather className="h-4 w-4 text-[#c7a76f]" />
              <span>2020</span>
            </div>
            <p className="mx-auto mt-3 max-w-sm font-serif text-base italic leading-7 text-[#cfc3ad] sm:text-lg sm:leading-8">
              {copy.hero.motto}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6">
              <div className="rounded-xl border border-[#c7a76f]/25 bg-white/5 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-4">
                <div className="font-serif text-2xl text-white sm:text-3xl">{yearsLived}</div>
                <div className="mt-1 text-xs text-[#c7a76f]">{copy.stats[0].suffix}</div>
              </div>
              <div className="rounded-xl border border-[#c7a76f]/25 bg-white/5 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-4">
                <div className="font-serif text-2xl text-white sm:text-3xl">{daysSince.toLocaleString(localeByLang[lang])}</div>
                <div className="mt-1 text-xs text-[#c7a76f]">{copy.hero.sinceSuffix}</div>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-[#c7a76f]/25 bg-white/5 px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[#c7a76f] backdrop-blur-sm sm:px-4 sm:py-3 sm:text-xs sm:tracking-[0.18em]">
              {copy.hero.sinceLabel}
            </div>
          </div>

          <div className="order-3 rounded-2xl border border-[#c7a76f]/20 bg-[#091712]/55 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-6">
            <div className="mb-3 flex items-center gap-3 text-[#c7a76f] sm:mb-4">
              <span className="h-px w-8 bg-[#c7a76f] sm:w-10" />
              <span className="text-xs tracking-[0.22em] uppercase">{copy.hero.messageTitle}</span>
            </div>
            <div className="font-serif text-5xl leading-none text-[#c7a76f]/35 sm:text-6xl">&quot;</div>
            <p className="mt-1 font-serif text-lg italic leading-8 text-white sm:text-2xl sm:leading-9">
              {copy.hero.messageNote}
            </p>
            <a href="#son-mesaj" className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#c7a76f]/40 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10 sm:mt-6 sm:px-5 sm:py-3">
              {copy.hero.explore}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
          <span className="text-[10px] tracking-[0.2em] text-[#c7a76f]/50 uppercase">{copy.hero.scroll}</span>
          <div className="h-10 w-px bg-gradient-to-b from-[#c7a76f]/50 to-transparent" />
        </div>
      </section>

      {/* â"€â"€ YAÅAM RAKAMLARI â"€â"€ */}
      <section className="bg-[#173d31] px-5 py-0 sm:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-[#2a5a45] sm:grid-cols-4 sm:divide-y-0">
          <LifeStat number={String(yearsLived)} suffix={copy.stats[0].suffix} label={copy.stats[0].label} />
          {copy.stats.slice(1).map((stat) => (
            <LifeStat key={stat.label} number={stat.number ?? ''} suffix={stat.suffix} label={stat.label} />
          ))}
        </div>
      </section>

      {/* â"€â"€ YAPIÅKAN SEKMELER â"€â"€ */}
      <nav id="sekmeler" className="sticky top-[108px] z-40 border-b border-[#e6dccb] bg-[#fbf8f1]/96 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl overflow-x-auto px-5 text-sm text-[#665d50] sm:px-8">
          {['#hikaye', '#kronoloji', '#videolar', '#fotograflar', '#son-mesaj', '#taziye', '#ziyaret'].map((href, index) => (
            <TabLink key={href} href={href} label={copy.tabs[index]} />
          ))}
        </div>
      </nav>

      {/* â"€â"€ BÄ°YOGRAFÄ° â"€â"€ */}
      <section id="hikaye" className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionLabel text={copy.story.label} />
            <h2 className="mt-3 font-serif text-5xl leading-tight text-[#173d31]">
              {copy.story.titleA}<br />
              <span className="text-[#b08340]">{copy.story.titleB}</span>
            </h2>
            <div className="mt-7 space-y-5 text-base leading-8 text-[#4c463c]">
              {copy.story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-6">
            <div className="rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-8 shadow-lg shadow-[#4d3d26]/6">
              <div className="font-serif text-6xl leading-none text-[#c7a76f]">&quot;</div>
              <p className="mt-2 font-serif text-xl italic leading-9 text-[#4c463c]">
                {copy.story.quote}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#e1d5c3]" />
                <div className="text-right">
                  <div className="font-serif text-lg text-[#173d31]">
                    {lang === 'tr' ? 'Fatma Yılmaz' : lang === 'ka' ? 'ფატმა ილმაზი' : lang === 'ru' ? 'Фатма Йылмаз' : 'Fatma Yilmaz'}
                  </div>
                  <div className="text-xs text-[#8a7a64]">{copy.story.relation}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#e1d5c3] bg-[#fffdf8] p-5 text-center">
                <BookOpen className="mx-auto h-7 w-7 text-[#b08340]" />
                <div className="mt-2 font-serif text-3xl text-[#173d31]">500+</div>
                <div className="mt-1 text-xs text-[#665d50]">{copy.story.books}</div>
              </div>
              <div className="rounded-xl border border-[#e1d5c3] bg-[#fffdf8] p-5 text-center">
                <CalendarDays className="mx-auto h-7 w-7 text-[#b08340]" />
                <div className="mt-2 font-serif text-3xl text-[#173d31]">27</div>
                <div className="mt-1 text-xs text-[#665d50]">{copy.story.teaching}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Time journey */}
      <section id="kronoloji" className="border-y border-[#172d25] bg-[#091712] px-5 py-16 text-[#efe7d8] sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <SectionLabel text={copy.timelineLabel} light />
              <h2 className="mt-3 font-serif text-5xl text-white">{journeyUi.title}</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#b8aa93]">
                {copy.timelineTitleA} {copy.timelineTitleB} {yearsLived} {journeyUi.years}.
              </p>
            </div>
            <div className="flex w-full gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1 text-xs font-semibold text-[#cfc3ad] sm:w-auto">
              {[journeyUi.timeline, journeyUi.slideshow, journeyUi.age].map((label, index) => (
                <button
                  key={label}
                  className={`flex-1 rounded-lg px-4 py-2.5 transition sm:flex-none ${
                    index === 0 ? 'bg-[#c7a76f] text-[#091712] shadow-lg shadow-black/20' : 'hover:bg-white/[0.06]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1412] shadow-2xl shadow-black/30">
            <div className="grid lg:grid-cols-[1fr_360px]">
              <div className="relative px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
                <div className="absolute bottom-10 left-[2.15rem] top-10 w-px bg-gradient-to-b from-[#c7a76f]/20 via-[#c7a76f] to-[#c7a76f]/20 sm:left-[3.15rem] lg:left-[3.65rem]" />
                <div className="space-y-7">
                  {timelineEvents.map((event, i) => {
                    const active = selectedTimeline === i

                    return (
                    <article key={event.year} className="relative grid grid-cols-[44px_1fr] gap-4 sm:grid-cols-[56px_1fr]">
                      <div className="relative z-10 flex justify-center pt-1">
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#c7a76f] shadow-[0_0_0_5px_rgba(199,167,111,0.12)] ${active ? 'bg-[#c7a76f]' : 'bg-[#0d1412]'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-[#091712]' : 'bg-[#c7a76f]'}`} />
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedTimeline(i)}
                        className={`grid w-full gap-4 rounded-xl border p-4 text-left transition sm:grid-cols-[1fr_104px] sm:p-5 ${
                          active
                            ? 'border-[#c7a76f]/65 bg-[#c7a76f]/10 shadow-lg shadow-black/20'
                            : 'border-white/8 bg-white/[0.035] hover:border-[#c7a76f]/35 hover:bg-white/[0.055]'
                        }`}
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-serif text-3xl leading-none text-[#c7a76f]">{event.year}</span>
                            <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-widest ${active ? 'border-[#c7a76f]/35 text-[#efe7d8]' : 'border-white/10 text-[#8f9f96]'}`}>
                              {journeyUi.chapter}
                            </span>
                          </div>
                          <h3 className="mt-2 font-serif text-2xl text-white">{event.title}</h3>
                          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#cfc3ad]">{event.desc}</p>
                        </div>
                        <div className="relative min-h-[104px] overflow-hidden rounded-xl border border-[#c7a76f]/25 bg-[#17251f] sm:h-[104px]">
                          <Image
                            src={timelineMedia[i]}
                            alt={event.title}
                            fill
                            sizes="120px"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                        </div>
                      </button>
                    </article>
                    )
                  })}
                </div>
              </div>

              <aside className="border-t border-white/10 bg-[#111b17] p-5 lg:border-l lg:border-t-0 lg:p-6">
                <div className="flex h-full flex-col gap-4">
                <div className="relative h-[320px] overflow-hidden rounded-2xl border border-[#c7a76f]/35 bg-[#0b1210] shadow-2xl shadow-black/30 sm:h-[420px] lg:h-[430px]">
                  <Image
                    key={timelineMedia[selectedTimeline]}
                    src={timelineMedia[selectedTimeline]}
                    alt={selectedEvent.title}
                    fill
                    sizes="360px"
                    className="scale-105 object-cover object-center opacity-90 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#091712] via-[#091712]/25 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="font-serif text-5xl leading-none text-[#c7a76f]">{selectedEvent.year}</p>
                    <h3 className="mt-2 font-serif text-3xl text-white">{selectedEvent.title}</h3>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0d1412] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c7a76f]">{journeyUi.chapter}</p>
                  <p className="mt-3 text-sm leading-7 text-[#cfc3ad]">{selectedEvent.desc}</p>
                  <a href="#fotograflar" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#c7a76f] px-4 py-2.5 text-xs font-semibold text-[#091712] transition hover:bg-[#d4b87c]">
                    {journeyUi.cta}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* â"€â"€ VÄ°DEO ANILAR â"€â"€ */}
      <section id="videolar" className="bg-[#0c3327] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <SectionLabel text={copy.videos.label} light />
            <h2 className="mt-3 font-serif text-5xl text-white">{copy.videos.titleA}<br /><span className="text-[#c7a76f]">{copy.videos.titleB}</span></h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="group relative overflow-hidden rounded-2xl bg-[#173d31]">
              <Image
                src={videoMemories[0].thumb}
                alt={videoMemories[0].title}
                width={760}
                height={480}
                className="h-[340px] w-full object-cover opacity-70 transition duration-500 group-hover:opacity-80 lg:h-[420px]"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-18 w-18 items-center justify-center rounded-full border-2 border-white/60 bg-white/10 backdrop-blur-sm transition hover:scale-110 hover:bg-white/20 cursor-pointer">
                  <Play className="h-8 w-8 fill-white text-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[10px] tracking-widest text-[#c7a76f] uppercase">{copy.videos.featured}</span>
                    <h3 className="font-serif text-xl text-white">{videoMemories[0].title}</h3>
                  </div>
                  <span className="rounded bg-black/50 px-2 py-1 text-xs text-white">{videoMemories[0].duration}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {videoMemories.slice(1).map((video) => (
                <div key={video.title} className="group relative flex-1 overflow-hidden rounded-xl bg-[#173d31]">
                  <Image
                    src={video.thumb}
                    alt={video.title}
                    width={320}
                    height={160}
                    className="h-[118px] w-full object-cover opacity-60 transition group-hover:opacity-75"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/10 backdrop-blur-sm cursor-pointer hover:bg-white/20">
                      <Play className="h-4 w-4 fill-white text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                    <span className="font-serif text-sm text-white drop-shadow">{video.title}</span>
                    <span className="rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">{video.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-[#6b9e86]">{copy.videos.demo}</p>
        </div>
      </section>

      {/* â"€â"€ FOTOÄRAFLAR â"€â"€ */}
      <section id="fotograflar" className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <SectionLabel text={copy.photos.label} />
              <h2 className="mt-3 font-serif text-5xl text-[#173d31]">{copy.photos.titleA}<br /><span className="text-[#b08340]">{copy.photos.titleB}</span></h2>
            </div>
            <span className="hidden text-sm text-[#8a7a64] sm:block">{photos.length} {copy.photos.count}</span>
          </div>

          <div className="columns-2 gap-4 md:columns-3">
            {photos.map((photo, i) => (
              <div key={photo.title} className={`group mb-4 break-inside-avoid overflow-hidden rounded-xl border border-[#e1d5c3] bg-[#fffdf8] ${i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]'}`}>
                <div className="relative h-full w-full overflow-hidden">
                  <Image
                    src={photo.src}
                    alt={photo.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="font-serif text-sm text-white">{photo.title}</p>
                    <p className="text-[11px] text-[#c7a76f]">{photo.year}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â"€â"€ SON MESAJ â"€â"€ */}
      <section id="son-mesaj" className="border-y border-[#e6dccb] bg-[#f7f2e9] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel text={copy.finalMessage.label} />
          <h2 className="mt-3 font-serif text-5xl text-[#173d31]">{copy.finalMessage.titleA}<br />{copy.finalMessage.titleB}</h2>
        </div>

        <div className="relative mx-auto mt-12 max-w-2xl">
          <div className="absolute -top-5 -left-5 font-serif text-[120px] leading-none text-[#c7a76f]/15 select-none">&quot;</div>
          <div className="relative overflow-hidden rounded-2xl border border-[#d7c7ae] bg-[#fffdf6] shadow-2xl shadow-[#4d3d26]/12">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c7a76f]/60 to-transparent" />
            <div className="p-6 sm:p-10 lg:p-14">
              <Feather className="mx-auto mb-6 h-8 w-8 text-[#b08340]/60" />
              <div className="space-y-5 font-serif text-xl italic leading-9 text-[#4c463c]">
                {copy.finalMessage.lines.map((line) => <p key={line}>{line}</p>)}
              </div>

              <div className="mt-10 flex items-center justify-between border-t border-[#e1d5c3] pt-6">
                <div>
                  <div className="font-serif text-2xl text-[#173d31]">{copy.hero.portraitAlt}</div>
                  <div className="mt-1 text-xs text-[#8a7a64]">{copy.finalMessage.placeDate}</div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#c7a76f]/30 bg-[#f4eee3] shadow-inner">
                  <span className="font-serif text-lg text-[#b08340]">AY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* â"€â"€ SESLENDÄ°RÄ°LMÄ°Å ANILAR â"€â"€ */}
      <section className="bg-[#0c3327] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <SectionLabel text={copy.voices.label} light />
            <h2 className="mt-3 font-serif text-5xl text-white">{copy.voices.titleA}<br /><span className="text-[#c7a76f]">{copy.voices.titleB}</span></h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {voiceMemories.map((voice) => (
              <div key={voice.title} className="rounded-2xl border border-[#2a5a45] bg-[#173d31] p-6">
                <div className="flex items-center gap-3">
                  <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#c7a76f] shadow-lg transition hover:bg-[#d4b87c]">
                    <Play className="h-4 w-4 fill-[#0c3327] text-[#0c3327] ml-0.5" />
                  </button>
                  <div>
                    <div className="font-serif text-lg text-white">{voice.title}</div>
                    <div className="text-xs text-[#6b9e86]">{voice.author}</div>
                  </div>
                </div>

                <div className="mt-5 flex h-10 items-end gap-[3px]">
                  {voice.bars.map((height, i) => (
                    <div
                      key={i}
                      className="animate-waveform flex-1 rounded-full bg-[#c7a76f]/60"
                      style={{
                        height: `${height * 10}%`,
                        animationDuration: `${0.6 + (i % 5) * 0.15}s`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="h-0.5 flex-1 rounded-full bg-[#2a5a45]">
                    <div className="h-full w-1/3 rounded-full bg-[#c7a76f]" />
                  </div>
                </div>
                <p className="mt-2 text-right text-xs text-[#6b9e86]">{copy.voices.demo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â"€â"€ Ã–NE Ã‡IKAN ANILAR â"€â"€ */}
      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <SectionLabel text={copy.featured.label} />
            <h2 className="mt-3 font-serif text-5xl text-[#173d31]">{copy.featured.titleA}<br /><span className="text-[#b08340]">{copy.featured.titleB}</span></h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featuredMemories.map((memory) => (
              <div key={memory.author} className="group relative overflow-hidden rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-6 shadow-lg shadow-[#4d3d26]/6 transition hover:shadow-xl hover:shadow-[#4d3d26]/10">
                <div className="absolute top-5 right-6 font-serif text-7xl leading-none text-[#f4eee3] select-none">&quot;</div>
                <Heart className="mb-5 h-6 w-6 text-[#b08340]/60" />
                <p className="relative z-10 font-serif text-lg italic leading-8 text-[#4c463c]">
                  &quot;{memory.quote}&quot;
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-[#e1d5c3] pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4eee3] text-sm font-semibold text-[#b08340]">
                    {memory.author[0]}
                  </div>
                  <div>
                    <div className="font-serif text-base text-[#173d31]">{memory.author}</div>
                    <div className="text-xs text-[#8a7a64]">{memory.relation}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â"€â"€ TAZÄ°YE + Ä°NTERAKSÄ°YON (client) â"€â"€ */}
      <MemorialInteractions condolences={condolences.map((c, i) => ({ ...c, id: `demo-${i}`, reactions: { heart: 0, pray: 0, smile: 0, cry: 0, dove: 0 } }))} />

      <section id="aile-baglari" className="bg-[#091712] px-5 py-12 text-[#efe7d8] sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-7 flex flex-col gap-5 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
            <div>
              <SectionLabel text={familyUi.label} light />
              <h2 className="mt-3 font-serif text-4xl text-white sm:text-5xl">
                {familyUi.titleA}<br />
                <span className="text-[#c7a76f]">{familyUi.titleB}</span>
              </h2>
            </div>
            <div className="mx-auto flex w-full max-w-sm gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1 text-xs font-semibold text-[#cfc3ad] lg:mx-0">
              <button className="flex-1 rounded-lg bg-[#c7a76f] px-4 py-2.5 text-[#091712] shadow-lg shadow-black/20">
                {familyUi.tabTree}
              </button>
              <button className="flex-1 rounded-lg px-4 py-2.5 transition hover:bg-white/[0.06]">
                {familyUi.tabClose}
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1412] shadow-2xl shadow-black/30">
            <div className="relative p-4 sm:p-6 lg:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(199,167,111,0.12),transparent_42%)]" />
              <div className="pointer-events-none absolute inset-x-12 top-[118px] hidden h-px bg-[#c7a76f]/45 lg:block" />
              <div className="pointer-events-none absolute left-1/2 top-[118px] hidden h-[92px] w-px -translate-x-1/2 bg-[#c7a76f]/45 lg:block" />
              <div className="pointer-events-none absolute left-[38%] right-[38%] top-[210px] hidden h-px bg-[#c7a76f]/45 lg:block" />
              <div className="pointer-events-none absolute left-1/2 top-[210px] hidden h-[92px] w-px -translate-x-1/2 bg-[#c7a76f]/45 lg:block" />
              <div className="pointer-events-none absolute left-[31%] right-[31%] top-[302px] hidden h-px bg-[#c7a76f]/45 lg:block" />
              <div className="pointer-events-none absolute left-1/2 top-[302px] hidden h-[92px] w-px -translate-x-1/2 bg-[#c7a76f]/45 lg:block" />
              <div className="pointer-events-none absolute left-[38%] right-[38%] top-[394px] hidden h-px bg-[#c7a76f]/45 lg:block" />

              <div className="relative grid gap-4 lg:hidden">
                <div className="grid grid-cols-2 gap-4">
                  <FamilyCard person={familyUi.people[0]} />
                  <FamilyCard person={familyUi.people[1]} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FamilyCard person={familyUi.people[2]} featured />
                  <FamilyCard person={familyUi.people[3]} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FamilyCard person={familyUi.people[4]} />
                  <FamilyCard person={familyUi.people[5]} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FamilyCard person={familyUi.people[6]} />
                  <FamilyCard person={familyUi.people[7]} />
                </div>
              </div>

              <div className="relative hidden min-h-[530px] lg:block">
                <div className="absolute left-[18%] top-0 w-[145px] -translate-x-1/2">
                  <FamilyCard person={familyUi.people[0]} />
                </div>
                <div className="absolute left-[82%] top-0 w-[145px] -translate-x-1/2">
                  <FamilyCard person={familyUi.people[1]} />
                </div>
                <div className="absolute left-[42%] top-[145px] w-[155px] -translate-x-1/2">
                  <FamilyCard person={familyUi.people[2]} featured />
                </div>
                <div className="absolute left-[62%] top-[145px] w-[145px] -translate-x-1/2">
                  <FamilyCard person={familyUi.people[3]} />
                </div>
                <div className="absolute left-[36%] top-[290px] w-[145px] -translate-x-1/2">
                  <FamilyCard person={familyUi.people[4]} />
                </div>
                <div className="absolute left-[64%] top-[290px] w-[145px] -translate-x-1/2">
                  <FamilyCard person={familyUi.people[5]} />
                </div>
                <div className="absolute left-[42%] top-[435px] w-[145px] -translate-x-1/2">
                  <FamilyCard person={familyUi.people[6]} />
                </div>
                <div className="absolute left-[58%] top-[435px] w-[145px] -translate-x-1/2">
                  <FamilyCard person={familyUi.people[7]} />
                </div>
              </div>

              <div className="relative mt-8 rounded-xl border border-[#c7a76f]/20 bg-[#111b17]/90 px-4 py-3 text-center text-xs text-[#b8aa93] backdrop-blur">
                <span className="font-serif text-[#c7a76f]">4 {familyUi.generation}</span>
                <span className="mx-2 text-white/20">/</span>
                {familyUi.protected}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* â"€â"€ ZÄ°YARET BÄ°LGÄ°SÄ° â"€â"€ */}
      <section id="ziyaret" className="border-t border-[#e6dccb] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <SectionLabel text={copy.visit.label} />
            <h2 className="mt-3 font-serif text-5xl text-[#173d31]">{copy.visit.titleA}<br /><span className="text-[#b08340]">{copy.visit.titleB}</span></h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e1d5c3] shadow-xl shadow-[#4d3d26]/8">
            {/* Mezar fotosu â€" tam geniÅŸlik */}
            <div className="relative h-[280px] w-full sm:h-[340px]">
              <Image
                src="/images/landing/memorial-hero-cemetery.png"
                alt={copy.visit.imageAlt}
                fill
                sizes="100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c3327]/70 via-[#0c3327]/20 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="font-serif text-2xl text-white">{copy.hero.portraitAlt}</p>
                <p className="mt-1 text-sm text-[#c7a76f]">{copy.visit.cemeteryLine}</p>
              </div>
            </div>

            <div className="grid bg-[#fffdf8] lg:grid-cols-[1fr_1.5fr]">
              {/* Mezar bilgileri */}
              <div className="space-y-5 border-b border-[#e1d5c3] p-5 lg:border-b-0 lg:border-r lg:p-7">
                <h3 className="font-serif text-2xl text-[#173d31]">{copy.visit.infoTitle}</h3>

                <div className="space-y-4 text-sm text-[#4c463c]">
                  <InfoRow icon={MapPin} label={copy.visit.cemetery} value={copy.visit.cemeteryValue} />
                  <InfoRow icon={Navigation} label={copy.visit.plot} value={copy.visit.plotValue} />
                  <InfoRow
                    icon={CalendarDays}
                    label={copy.visit.row}
                    value={copy.visit.rowValue}
                  />
                  <InfoRow icon={Clock} label={copy.visit.hours} value={copy.visit.hoursValue} />
                </div>

                <div className="rounded-xl border border-[#e1d5c3] bg-[#f7f2e9] p-4">
                  <p className="text-xs leading-6 text-[#5b5245]">
                    <span className="font-semibold text-[#173d31]">{copy.visit.noteLabel}</span> {copy.visit.note}
                  </p>
                </div>
              </div>

              {/* Harita embed */}
              <div className="relative min-h-[320px] overflow-hidden">
                <iframe
                  src="https://maps.google.com/maps?q=Ucler+Mezarligi+Konya+Turkey&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="h-full w-full border-0"
                  loading="lazy"
                  title={copy.visit.mapTitle}
                  allowFullScreen
                />
                <div className="pointer-events-none absolute inset-0 rounded-br-2xl border border-[#e1d5c3]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="bg-[#0c3327] px-5 pb-16 pt-4 sm:px-8">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[1.35rem] px-6 py-12 text-center text-white shadow-2xl shadow-black/20 sm:px-10">
          <Image src="/images/landing/final-cta-leaves.png" alt="" fill sizes="100vw" className="absolute inset-0 object-cover" />
          <div className="absolute inset-0 bg-[#06291f]/25" />
          <div className="relative z-10">
            <h2 className="font-serif text-3xl sm:text-4xl">{copy.bottomCta.heading}</h2>
            <p className="mt-3 text-base text-[#e8decc] sm:text-lg">{copy.bottomCta.sub}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/#fiyatlar"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#d1a85c] px-7 py-3 text-sm font-semibold text-[#103b2c] shadow-lg shadow-black/10 transition hover:bg-[#e0ba70]"
              >
                {copy.bottomCta.primaryBtn}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d1a85c] bg-[#103b2c]/25 px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#103b2c]/45"
              >
                {copy.bottomCta.secondaryBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MemorialFooter copy={copy.footer} />
    </div>
  )
}

function DemoBanner({ copy }: { copy: { text: string; cta: string; home: string } }) {
  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex h-11 items-center justify-between bg-[#103b2c] px-4 sm:px-8">
      <Link
        href="/"
        className="flex items-center gap-1.5 text-xs font-semibold text-[#c7a76f] transition hover:text-white"
      >
        <ArrowRight className="h-3 w-3 rotate-180" />
        <span>{copy.home}</span>
      </Link>
      <p className="hidden text-xs text-[#b8aa93] sm:block">{copy.text}</p>
      <Link
        href="/#fiyatlar"
        className="flex items-center gap-1.5 rounded-md bg-[#b08340] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#c7944e]"
      >
        {copy.cta}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

function MemorialNav({
  lang,
  setLang,
  copy,
}: {
  lang: Lang
  setLang: (lang: Lang) => void
  copy: typeof memorialCopy.tr.nav
}) {
  return (
    <nav className="fixed inset-x-0 top-11 z-50 border-b border-[#e6dccb]/50 bg-[#fbf8f1]/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <BrandLogo />
        <div className="hidden items-center gap-7 text-sm font-medium text-[#4c463c] lg:flex">
          <Link href="/" className="transition hover:text-[#9a7132]">{copy.home}</Link>
          <Link href="/#nasil-calisir" className="transition hover:text-[#9a7132]">{copy.how}</Link>
          <Link href="/#ozellikler" className="transition hover:text-[#9a7132]">{copy.memorials}</Link>
          <Link href="/contact" className="transition hover:text-[#9a7132]">{copy.contact}</Link>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-[#d7c7ae] bg-white/60 p-1">
          {langs.map((item) => (
            <button
              key={item.code}
              onClick={() => setLang(item.code)}
              className={`rounded px-1.5 py-1 text-xs font-semibold transition sm:px-2.5 ${
                lang === item.code ? 'bg-[#103b2c] text-white' : 'text-[#665d50] hover:bg-[#f4eee3]'
              }`}
              aria-label={item.label}
            >
              {item.flag}
            </button>
          ))}
        </div>
        <Link
          href="/pricing"
          className="hidden items-center gap-2 rounded-md bg-[#103b2c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b2b20] sm:inline-flex"
        >
          {copy.start}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </nav>
  )
}

function LifeStat({ number, suffix, label }: { number: string; suffix: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-6 py-7 text-center">
      <div className="font-serif text-5xl text-white">{number}</div>
      <div className="text-sm font-semibold text-[#c7a76f]">{suffix}</div>
      <div className="mt-1 text-xs text-[#6b9e86]">{label}</div>
    </div>
  )
}

function TabLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="shrink-0 border-b-2 border-transparent px-4 py-4 text-sm transition hover:border-[#b08340] hover:text-[#173d31]"
    >
      {label}
    </a>
  )
}

function SectionLabel({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${light ? 'text-[#c7a76f]' : 'text-[#b08340]'}`}>
      <span className={`h-px w-10 ${light ? 'bg-[#c7a76f]' : 'bg-[#c7a76f]'}`} />
      <span className="text-xs tracking-[0.2em] uppercase">{text}</span>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#b08340]" />
      <div>
        <div className="text-xs text-[#8a7a64]">{label}</div>
        <div className="font-serif text-base text-[#173d31]">{value}</div>
      </div>
    </div>
  )
}

function FamilyCard({
  person,
  featured = false,
}: {
  person: {
    name: string
    relation: string
    years: string
    initials: string
    image?: string
    position?: string
  }
  featured?: boolean
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-[#121b17] p-3 text-center shadow-xl shadow-black/20 ${
        featured ? 'border-[#c7a76f] ring-4 ring-[#c7a76f]/10' : 'border-white/10'
      }`}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-[#c7a76f]/55 bg-[#f4eee3] text-sm font-semibold text-[#173d31] shadow-lg shadow-black/20">
        {person.image ? (
          <Image
            src={person.image}
            alt={person.name}
            width={96}
            height={96}
            className="h-full w-full object-cover"
            style={{ objectPosition: person.position ?? '50% 25%' }}
          />
        ) : (
          person.initials
        )}
      </div>
      <div className="mt-2 font-serif text-sm leading-tight text-white sm:text-base">{person.name}</div>
      <div className="mt-1 text-[11px] uppercase tracking-widest text-[#c7a76f]">{person.relation}</div>
      <div className="mt-1 text-xs text-[#8f9f96]">{person.years}</div>
    </div>
  )
}

function MemorialFooter({ copy }: { copy: typeof memorialCopy.tr.footer }) {
  return (
    <footer className="bg-[#0c3327] px-5 py-12 text-[#efe7d8] sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3 font-serif text-2xl">
            <BrandMark className="h-10 w-10" />
            The Eternal Memory
          </div>
          <p className="mt-4 max-w-xs font-serif text-lg italic leading-7 text-[#cfc3ad]">
            {copy.motto}
          </p>
        </div>
        <FooterCol title={copy.platform} links={[
          { href: '/', label: copy.home },
          { href: '/memorial/demo', label: copy.demo },
          { href: '/#fiyatlar', label: copy.pricing },
        ]} />
        <FooterCol title={copy.corporate} links={[
          { href: '/contact', label: copy.about },
          { href: '/contact', label: copy.contact },
        ]} />
        <FooterCol title={copy.documents} links={[
          { href: '/privacy', label: copy.privacy },
          { href: '/terms', label: copy.terms },
          { href: '/kvkk', label: copy.kvkk },
        ]} />
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-[#b8aa93]">
        {copy.rights}
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="font-serif text-lg">{title}</h3>
      <div className="mt-4 space-y-2">
        {links.map((link) => (
          <Link key={link.href + link.label} href={link.href} className="block text-sm text-[#cfc3ad] transition hover:text-white">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
