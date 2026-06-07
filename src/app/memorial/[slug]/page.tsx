import type { Metadata } from 'next'
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
  Mic,
  Navigation,
  PenLine,
  Play,
  QrCode,
  Users,
} from 'lucide-react'
import MemorialInteractions from './MemorialInteractions'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Ahmet Yılmaz — The Maradi',
  description: 'Ahmet Yılmaz için hazırlanmış dijital anıt profili. 1940–2020.',
}

const DEATH_DATE = new Date('2020-05-14')
const BIRTH_DATE = new Date('1940-03-22')

function getDaysSince() {
  return Math.floor((Date.now() - DEATH_DATE.getTime()) / (1000 * 60 * 60 * 24))
}

function getYearsLived() {
  return Math.floor((DEATH_DATE.getTime() - BIRTH_DATE.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

const timelineEvents = [
  {
    year: '1940',
    title: 'Dünyaya geldi',
    desc: "Konya'nın tarihi dokusunda, mütevazı bir ailenin çocuğu olarak doğdu. Küçük yaşından itibaren kitap ve öğrenmeye olan aşkıyla dikkat çekti.",
  },
  {
    year: '1958',
    title: 'Öğretmenlik yolculuğu başladı',
    desc: "Ankara'ya taşındı. Öğretmenlik sınavını birincilikle geçti. 'İnsanlara öğretmek, onlara ışık vermektir' derdi.",
  },
  {
    year: '1965',
    title: 'Fatma ile hayatını birleştirdi',
    desc: "55 yıl boyunca birlikte yürüyecekleri yola adım attılar. Ankara'da mütevazı bir düğünle başlayan bu yolculuk ömür boyu sürdü.",
  },
  {
    year: '1967',
    title: 'Baba oldu',
    desc: 'İlk oğlu Hasan dünyaya geldi. Sonraki yıllarda Zeynep ve Ali de aileye katıldı. Üç evlat, yedi torun — en büyük mirası bunlardı.',
  },
  {
    year: '1985',
    title: 'Emekliliğe veda etti',
    desc: '27 yıl binlerce öğrenci yetiştirdi. Son gün tüm okul veda için toplandı. Gözyaşlarını tutmak kimse için mümkün olmadı.',
  },
  {
    year: '2020',
    title: 'Ebediyete yürüdü',
    desc: 'Seksen yıllık bereketli bir ömrün ardından, sevdiklerinin ortasında huzurla veda etti. Arkasında sayısız anı ve derin bir sevgi bıraktı.',
  },
]

const photos = [
  { src: '/images/landing/memorial-family-old.png', title: 'İlk Aile Fotoğrafı', year: '1968' },
  { src: '/images/landing/memorial-family-dinner.png', title: 'Bayram Sofrası', year: '1975' },
  { src: '/images/landing/memorial-georgia.png', title: 'Gürcistan Gezisi', year: '1990' },
  { src: '/images/landing/memorial-family-main.png', title: 'Son Aile Fotoğrafı', year: '2019' },
  { src: '/images/landing/memorial-hero-cemetery.png', title: 'Bahçede Bir Öğleden Sonra', year: '2005' },
  { src: '/images/landing/memorial-ahmet.png', title: 'Emeklilik Yılları', year: '2012' },
]

const videoMemories = [
  { thumb: '/images/landing/memorial-family-main.png', title: '70. Doğum Günü Kutlaması', duration: '4:32', featured: true },
  { thumb: '/images/landing/memorial-family-old.png', title: 'Torunlarla Son Bayram', duration: '2:15' },
  { thumb: '/images/landing/memorial-georgia.png', title: 'Gürcistan Tatili', duration: '8:47' },
  { thumb: '/images/landing/memorial-family-dinner.png', title: 'Emeklilik Töreni', duration: '6:20' },
]

const voiceMemories = [
  {
    title: 'Sabah duası',
    author: "Ahmet Bey'in sesinden",
    bars: [3, 5, 8, 4, 7, 9, 3, 6, 5, 8, 4, 7, 6, 3, 9, 5, 4, 7, 6, 8],
  },
  {
    title: 'Torunlarıma vasiyetim',
    author: "Ahmet Bey'in sesinden",
    bars: [5, 3, 7, 9, 4, 6, 8, 3, 5, 7, 4, 6, 3, 8, 5, 7, 9, 4, 6, 5],
  },
  {
    title: 'Baba her zaman yanımızdaydı',
    author: 'Kızı Zeynep anlatıyor',
    bars: [4, 7, 5, 3, 8, 6, 4, 7, 5, 3, 6, 8, 4, 5, 7, 3, 6, 8, 5, 4],
  },
]

const featuredMemories = [
  {
    quote: 'Sabahları erkenden kalkar, kahvesini içerken okuduğu duayı hiç atlamazdı. O sesin olmadığı sabahları hâlâ özlüyorum.',
    author: 'Zeynep Yılmaz',
    relation: 'Kızı',
  },
  {
    quote: 'Bize ders değil, hayat öğretti. Tahtaya yazdığı her cümle aslında bir yaşam dersi gibiydi. Onu hiç unutmayacağız.',
    author: 'Mehmet Arslan',
    relation: 'Eski öğrencisi',
  },
  {
    quote: 'Elimi tuttuğunda dünya duruyordu sanki. O güven başka hiçbir yerde yoktu. Elli beş yıl boyunca hep öyleydi.',
    author: 'Fatma Yılmaz',
    relation: 'Eşi',
  },
]

const condolences = [
  { name: 'Ayşe Demir', date: '20 Mayıs 2024', relation: 'Komşusu', text: "Ahmet hocamıza Allah'tan rahmet. Mekanı cennet olsun. O bir insanlık abidesi gibiydi, herkes onu severdi." },
  { name: 'Mehmet Arslan', date: '18 Mayıs 2024', relation: 'Öğrencisi', text: 'Değerli hocam, öğrencilerinizden biri olarak sizi hiç unutmayacağım. Işıklar içinde uyuyun.' },
  { name: 'Fatma Kaya', date: '16 Mayıs 2024', relation: 'Komşusu', text: 'Zarafetiniz ve iyiliğiniz her zaman hatırlanacak. Geride güzel hatıralar bıraktınız.' },
  { name: 'Selim Yıldız', date: '15 Mayıs 2024', relation: 'Akrabası', text: 'Ahmet amcama rahmet, yakınlarına sabır ve güç diliyorum. Mekanı cennet olsun.' },
]

export default function MemorialPage() {
  const daysSince = getDaysSince()
  const yearsLived = getYearsLived()

  return (
    <div className="min-h-screen bg-[#fbf8f1] text-[#173d31]">
      <MemorialNav />

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-[#0c3327]">
        <Image
          src="/images/landing/memorial-cemetery.png"
          alt="Anma alanı"
          fill priority
          sizes="100vw"
          className="object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c3327] via-[#0c3327]/85 to-[#0c3327]/20" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pt-20 pb-16 sm:px-8 lg:grid-cols-[1fr_400px] lg:pt-0 lg:pb-0">
          <div>
            {/* Mobil portre — sadece küçük ekranlarda */}
            <div className="mb-8 flex justify-start lg:hidden">
              <div className="relative overflow-hidden rounded-2xl border-4 border-[#c7a76f]/30 shadow-2xl shadow-black/40">
                <Image
                  src="/images/landing/memorial-ahmet.png"
                  alt="Ahmet Yılmaz"
                  width={240}
                  height={310}
                  className="h-[270px] w-[200px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c3327]/60 to-transparent" />
                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                  <div className="flex items-center gap-1.5 rounded-full border border-[#c7a76f]/40 bg-[#fbf8f1]/90 px-3 py-1.5 shadow">
                    <QrCode className="h-3.5 w-3.5 text-[#173d31]" />
                    <span className="text-[10px] text-[#665d50]">QR ile eriş</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-5 flex items-center gap-3 text-[#c7a76f]">
              <span className="h-px w-14 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.25em] uppercase">Dijital Anıt Profili</span>
            </div>

            <h1 className="font-serif text-[52px] leading-[0.9] text-white sm:text-[72px] lg:text-[108px]">
              Ahmet
              <span className="block text-[#c7a76f]">Yılmaz</span>
            </h1>

            <div className="mt-5 flex items-center gap-4 font-serif text-2xl text-[#efe7d8]/80">
              <span>1940</span>
              <Feather className="h-4 w-4 text-[#c7a76f]" />
              <span>2020</span>
            </div>

            <p className="mt-5 max-w-sm font-serif text-xl italic leading-8 text-[#cfc3ad]">
              Sevgiyle yaşadı, sevgiyle hatırlanıyor.
            </p>

            <div className="mt-8 inline-flex flex-col gap-1 rounded-xl border border-[#c7a76f]/25 bg-white/5 px-6 py-4 backdrop-blur-sm">
              <span className="text-[10px] tracking-[0.2em] text-[#c7a76f] uppercase">Ebediyete yürüyeli</span>
              <span className="font-serif text-[40px] leading-none text-white sm:text-[52px]">
                {daysSince.toLocaleString('tr-TR')}
              </span>
              <span className="text-sm text-[#cfc3ad]">gün oldu</span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#taziye" className="inline-flex items-center gap-2 rounded-md bg-[#c7a76f] px-6 py-3 text-sm font-semibold text-[#0c3327] transition hover:bg-[#d4b87c]">
                Anı Defteri
                <PenLine className="h-4 w-4" />
              </a>
              <a href="#fotograflar" className="inline-flex items-center gap-2 rounded-md border border-[#c7a76f]/40 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10">
                Anıları Keşfet
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative overflow-hidden rounded-2xl border-4 border-[#c7a76f]/20 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
              <Image
                src="/images/landing/memorial-ahmet.png"
                alt="Ahmet Yılmaz"
                width={400}
                height={540}
                className="h-[540px] w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c3327]/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <div>
                  <p className="font-serif text-lg text-white">Ahmet Yılmaz</p>
                  <p className="text-xs text-[#c7a76f]">{yearsLived} yıllık bereketli bir ömür</p>
                </div>
                <div className="flex flex-col items-center rounded-xl border border-[#c7a76f]/30 bg-[#fbf8f1]/90 p-2.5 shadow-xl">
                  <QrCode className="h-8 w-8 text-[#173d31]" />
                  <span className="mt-1 text-[9px] text-[#665d50]">QR ile eriş</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="text-[10px] tracking-[0.2em] text-[#c7a76f]/50 uppercase">Kaydır</span>
          <div className="h-10 w-px bg-gradient-to-b from-[#c7a76f]/50 to-transparent" />
        </div>
      </section>

      {/* ── YAŞAM RAKAMLARI ── */}
      <section className="bg-[#173d31] px-5 py-0 sm:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-[#2a5a45] sm:grid-cols-4 sm:divide-y-0">
          <LifeStat number={String(yearsLived)} suffix="yıl" label="Bereketli bir ömür" />
          <LifeStat number="55" suffix="yıl" label="Evlilik hayatı" />
          <LifeStat number="3 evlat" suffix="7 torun" label="Bıraktığı nesil" />
          <LifeStat number="2.700+" suffix="öğrenci" label="Yetiştirdiği canlar" />
        </div>
      </section>

      {/* ── YAPIŞKAN SEKMELER ── */}
      <nav id="sekmeler" className="sticky top-0 z-40 border-b border-[#e6dccb] bg-[#fbf8f1]/96 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl overflow-x-auto px-5 text-sm text-[#665d50] sm:px-8">
          <TabLink href="#hikaye" label="Hayat Hikayesi" />
          <TabLink href="#kronoloji" label="Kronoloji" />
          <TabLink href="#videolar" label="Videolar" />
          <TabLink href="#fotograflar" label="Fotoğraflar" />
          <TabLink href="#son-mesaj" label="Son Mesaj" />
          <TabLink href="#taziye" label="Taziye" />
          <TabLink href="#ziyaret" label="Ziyaret" />
        </div>
      </nav>

      {/* ── BİYOGRAFİ ── */}
      <section id="hikaye" className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionLabel text="Hayat Hikayesi" />
            <h2 className="mt-3 font-serif text-5xl leading-tight text-[#173d31]">
              Bir öğretmenin<br />
              <span className="text-[#b08340]">dolu dolu hayatı.</span>
            </h2>
            <div className="mt-7 space-y-5 text-base leading-8 text-[#4c463c]">
              <p>
                Ahmet Yılmaz, 1940 yılında Konya'nın tarihi dokusunda, mütevazı bir ailenin çocuğu olarak dünyaya geldi.
                Küçük yaşından itibaren kitaplara ve öğrenmeye olan tutkusu onu çevresindeki çocuklardan ayırıyordu.
                Mahalle mektebinden aldığı ilk dersler, onda bir ömür boyu sürecek bir ışığı yaktı.
              </p>
              <p>
                Ankara'da öğretmen okulunu bitirip göreve başladığında henüz on sekiz yaşındaydı. Kalabalık sınıflarda,
                kırık sıralarda, kömür sobası yanında ders anlatırken hiç şikâyet etmedi.
                "İnsan ne kadar verirse o kadar zenginleşir" derdi. Ve gerçekten öyle yaşadı.
              </p>
              <p>
                1965'te eşi Fatma ile kurduğu yuva, onun için her şeyin merkeziydi. Üç çocuğu ve yedi torunu,
                onun dünyaya bıraktığı en güzel mirastı. Emekli olduktan sonra bahçe işleriyle, torunlarıyla
                ve okuduğu kitaplarla geçirdi yıllarını. Her sabah güne dua ile başladı, her akşam şükranla noktaladı.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-6">
            <div className="rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-8 shadow-lg shadow-[#4d3d26]/6">
              <div className="font-serif text-6xl leading-none text-[#c7a76f]">"</div>
              <p className="mt-2 font-serif text-xl italic leading-9 text-[#4c463c]">
                Her sabah okuduğu dua hiç değişmedi. Elli yıl boyunca aynı dua, aynı ses, aynı huzur.
                O sesin olmadığı sabahları bir türlü dolduramıyorum.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#e1d5c3]" />
                <div className="text-right">
                  <div className="font-serif text-lg text-[#173d31]">Fatma Yılmaz</div>
                  <div className="text-xs text-[#8a7a64]">Eşi — 55 yıl birlikte</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#e1d5c3] bg-[#fffdf8] p-5 text-center">
                <BookOpen className="mx-auto h-7 w-7 text-[#b08340]" />
                <div className="mt-2 font-serif text-3xl text-[#173d31]">500+</div>
                <div className="mt-1 text-xs text-[#665d50]">Okuduğu kitap</div>
              </div>
              <div className="rounded-xl border border-[#e1d5c3] bg-[#fffdf8] p-5 text-center">
                <CalendarDays className="mx-auto h-7 w-7 text-[#b08340]" />
                <div className="mt-2 font-serif text-3xl text-[#173d31]">27</div>
                <div className="mt-1 text-xs text-[#665d50]">Yıl öğretmenlik</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KRONOLOJİ ── */}
      <section id="kronoloji" className="border-y border-[#e6dccb] bg-[#f7f2e9] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <SectionLabel text="Yaşam Kronolojisi" />
            <h2 className="mt-3 font-serif text-5xl text-[#173d31]">Önemli anlara<br />bir yolculuk.</h2>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#c7a76f]/40 to-transparent md:block" />

            <div className="space-y-0">
              {timelineEvents.map((event, i) => (
                <div key={event.year} className={`relative grid gap-6 pb-10 md:grid-cols-2 ${i % 2 === 0 ? '' : 'md:[&>*:first-child]:order-last'}`}>
                  <div className={`flex flex-col justify-center ${i % 2 === 0 ? 'md:pr-14 md:text-right' : 'md:pl-14'}`}>
                    <div className={`mb-2 font-serif text-4xl text-[#b08340] ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      {event.year}
                    </div>
                    <h3 className="font-serif text-2xl text-[#173d31]">{event.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[#5b5245]">{event.desc}</p>
                  </div>

                  <div className="hidden md:flex md:items-center md:justify-center">
                    <div className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-4 border-[#c7a76f] bg-[#f7f2e9] shadow-[0_0_0_4px_rgba(199,167,111,0.2)]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VİDEO ANILAR ── */}
      <section id="videolar" className="bg-[#0c3327] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <SectionLabel text="Video Anılar" light />
            <h2 className="mt-3 font-serif text-5xl text-white">Hareket eden<br /><span className="text-[#c7a76f]">anlar.</span></h2>
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
                    <span className="text-[10px] tracking-widest text-[#c7a76f] uppercase">Öne Çıkan</span>
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

          <p className="mt-5 text-center text-xs text-[#6b9e86]">Bu videolar demo amaçlıdır.</p>
        </div>
      </section>

      {/* ── FOTOĞRAFLAR ── */}
      <section id="fotograflar" className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <SectionLabel text="Fotoğraf Arşivi" />
              <h2 className="mt-3 font-serif text-5xl text-[#173d31]">Donmuş anlar,<br /><span className="text-[#b08340]">canlı hatıralar.</span></h2>
            </div>
            <span className="hidden text-sm text-[#8a7a64] sm:block">{photos.length} fotoğraf</span>
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

      {/* ── SON MESAJ ── */}
      <section id="son-mesaj" className="border-y border-[#e6dccb] bg-[#f7f2e9] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel text="Bıraktığı Son Mesaj" />
          <h2 className="mt-3 font-serif text-5xl text-[#173d31]">Hayattayken<br />sevdiklerine bıraktığı satırlar.</h2>
        </div>

        <div className="relative mx-auto mt-12 max-w-2xl">
          <div className="absolute -top-5 -left-5 font-serif text-[120px] leading-none text-[#c7a76f]/15 select-none">"</div>
          <div className="relative overflow-hidden rounded-2xl border border-[#d7c7ae] bg-[#fffdf6] shadow-2xl shadow-[#4d3d26]/12">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c7a76f]/60 to-transparent" />
            <div className="p-6 sm:p-10 lg:p-14">
              <Feather className="mx-auto mb-6 h-8 w-8 text-[#b08340]/60" />
              <div className="space-y-5 font-serif text-xl italic leading-9 text-[#4c463c]">
                <p>Sevdiklerim,</p>
                <p>
                  Hayatta en kıymetli şeyin sevgi olduğunu öğrendim. Sahip olduklarınıza değil,
                  yanınızdaki insanlara bakın. Gerçek zenginlik onlardadır.
                </p>
                <p>
                  Birbirinize daima iyi davranın. Kırmadan konuşun, elinizden geldiğince yardım edin.
                  Küçük bir iyilik bile koca bir karanlığı aydınlatır.
                </p>
                <p>
                  Unutmayın, ben daima sizinleyim. Okuduğunuz her duada, sürdüğünüz her baharatta,
                  paylaştığınız her sofrada yanınızda olacağım.
                </p>
                <p>Sevgiyle kalın.</p>
              </div>

              <div className="mt-10 flex items-center justify-between border-t border-[#e1d5c3] pt-6">
                <div>
                  <div className="font-serif text-2xl text-[#173d31]">Ahmet Yılmaz</div>
                  <div className="mt-1 text-xs text-[#8a7a64]">Konya, 12 Mart 2020</div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#c7a76f]/30 bg-[#f4eee3] shadow-inner">
                  <span className="font-serif text-lg text-[#b08340]">AY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SESLENDİRİLMİŞ ANILAR ── */}
      <section className="bg-[#0c3327] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <SectionLabel text="Seslendirilmiş Anılar" light />
            <h2 className="mt-3 font-serif text-5xl text-white">Sesi hâlâ<br /><span className="text-[#c7a76f]">burada.</span></h2>
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
                <p className="mt-2 text-right text-xs text-[#6b9e86]">Demo ses kaydı</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ÖNE ÇIKAN ANILAR ── */}
      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <SectionLabel text="Öne Çıkan Anılar" />
            <h2 className="mt-3 font-serif text-5xl text-[#173d31]">Sevenlerinin<br /><span className="text-[#b08340]">sözleriyle.</span></h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featuredMemories.map((memory) => (
              <div key={memory.author} className="group relative overflow-hidden rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-6 shadow-lg shadow-[#4d3d26]/6 transition hover:shadow-xl hover:shadow-[#4d3d26]/10">
                <div className="absolute top-5 right-6 font-serif text-7xl leading-none text-[#f4eee3] select-none">"</div>
                <Heart className="mb-5 h-6 w-6 text-[#b08340]/60" />
                <p className="relative z-10 font-serif text-lg italic leading-8 text-[#4c463c]">
                  "{memory.quote}"
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

      {/* ── TAZİYE + İNTERAKSİYON (client) ── */}
      <MemorialInteractions condolences={condolences} />

      {/* ── ZİYARET BİLGİSİ ── */}
      <section id="ziyaret" className="border-t border-[#e6dccb] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <SectionLabel text="Ziyaret Bilgisi" />
            <h2 className="mt-3 font-serif text-5xl text-[#173d31]">Mezarda<br /><span className="text-[#b08340]">bir ziyaret.</span></h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e1d5c3] shadow-xl shadow-[#4d3d26]/8">
            {/* Mezar fotosu — tam genişlik */}
            <div className="relative h-[280px] w-full sm:h-[340px]">
              <Image
                src="/images/landing/memorial-hero-cemetery.png"
                alt="Ahmet Yılmaz mezarı"
                fill
                sizes="100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c3327]/70 via-[#0c3327]/20 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="font-serif text-2xl text-white">Ahmet Yılmaz</p>
                <p className="mt-1 text-sm text-[#c7a76f]">1940 – 2020 · Üçler Mezarlığı, Konya</p>
              </div>
            </div>

            <div className="grid bg-[#fffdf8] lg:grid-cols-[1fr_1.5fr]">
              {/* Mezar bilgileri */}
              <div className="space-y-5 border-b border-[#e1d5c3] p-5 lg:border-b-0 lg:border-r lg:p-7">
                <h3 className="font-serif text-2xl text-[#173d31]">Mezar Bilgileri</h3>

                <div className="space-y-4 text-sm text-[#4c463c]">
                  <InfoRow icon={MapPin} label="Mezarlık" value="Üçler Mezarlığı, Konya" />
                  <InfoRow icon={Navigation} label="Ada / Parsel" value="Ada: 245 · Parsel: 18" />
                  <InfoRow
                    icon={CalendarDays}
                    label="Sıra / Numara"
                    value="Sıra: C · Mezar No: 7"
                  />
                  <InfoRow icon={Clock} label="Ziyaret Saatleri" value="Her gün 08:00 – 19:00" />
                </div>

                <div className="rounded-xl border border-[#e1d5c3] bg-[#f7f2e9] p-4">
                  <p className="text-xs leading-6 text-[#5b5245]">
                    <span className="font-semibold text-[#173d31]">Not:</span> Ziyaretçiler için uygun
                    yürüyüş yolları mevcuttur. Ana girişten D kapısına yönelin,
                    C sırasına 50 metre mesafededir.
                  </p>
                </div>
              </div>

              {/* Harita embed */}
              <div className="relative min-h-[320px] overflow-hidden">
                <iframe
                  src="https://maps.google.com/maps?q=Üçler+Mezarlığı+Konya+Turkey&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="h-full w-full border-0"
                  loading="lazy"
                  title="Mezarlık konumu"
                  allowFullScreen
                />
                <div className="pointer-events-none absolute inset-0 rounded-br-2xl border border-[#e1d5c3]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <MemorialFooter />
    </div>
  )
}

function MemorialNav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#e6dccb]/50 bg-[#fbf8f1]/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3 text-[#173d31]">
          <span className="flex h-9 w-9 items-center justify-center rounded-t-full border border-[#c7a76f] bg-[#f4eee3] text-[#9a7132]">
            <Feather className="h-5 w-5" />
          </span>
          <span className="font-serif text-2xl">The Maradi</span>
        </Link>
        <div className="hidden items-center gap-7 text-sm font-medium text-[#4c463c] lg:flex">
          <Link href="/" className="transition hover:text-[#9a7132]">Ana Sayfa</Link>
          <Link href="/#nasil-calisir" className="transition hover:text-[#9a7132]">Nasıl Çalışır</Link>
          <Link href="/#ozellikler" className="transition hover:text-[#9a7132]">Dijital Anıtlar</Link>
          <Link href="/contact" className="transition hover:text-[#9a7132]">İletişim</Link>
        </div>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 rounded-md bg-[#103b2c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b2b20]"
        >
          Başla
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

function MemorialFooter() {
  return (
    <footer className="bg-[#0c3327] px-5 py-12 text-[#efe7d8] sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3 font-serif text-2xl">
            <Feather className="h-6 w-6 text-[#c7a76f]" />
            The Maradi
          </div>
          <p className="mt-4 max-w-xs font-serif text-lg italic leading-7 text-[#cfc3ad]">
            Hatıralar yaşar, büyük sevgiler sonsuzdur.
          </p>
        </div>
        <FooterCol title="Platform" links={[
          { href: '/', label: 'Ana Sayfa' },
          { href: '/memorial/demo', label: 'Örnek Profil' },
          { href: '/#fiyatlar', label: 'Fiyatlandırma' },
        ]} />
        <FooterCol title="Kurumsal" links={[
          { href: '/contact', label: 'Hakkımızda' },
          { href: '/contact', label: 'İletişim' },
        ]} />
        <FooterCol title="Belgeler" links={[
          { href: '/privacy', label: 'Gizlilik Politikası' },
          { href: '/terms', label: 'Kullanım Koşulları' },
          { href: '/kvkk', label: 'KVKK' },
        ]} />
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-[#b8aa93]">
        © 2026 The Maradi. Tüm hakları saklıdır.
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
