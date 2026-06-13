'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ImageUploadInput } from './ImageUploadInput'
import { CemeteryLocationPicker } from './CemeteryLocationPicker'
import PartialDateInput from './PartialDateInput'

interface Props {
  vault: {
    id: string
    display_name: string
    tagline: string | null
    profession: string | null
    hobbies: string | null
    birth_date: string | null
    birth_date_precision: string | null
    death_date: string | null
    death_date_precision: string | null
    birth_place: string | null
    death_place: string | null
    cover_photo_url: string | null
    hero_bg_url: string | null
    favorite_song_title: string | null
    favorite_song_url: string | null
    donation_preference: string | null
    donation_url: string | null
    last_message: string | null
    cemetery_name: string | null
    cemetery_address: string | null
    cemetery_lat: string | number | null
    cemetery_lng: string | number | null
    cemetery_plot: string | null
    cemetery_row: string | null
    cemetery_hours: string | null
    cemetery_note: string | null
    theme: string | null
  }
  saveProfileAction: (formData: FormData) => Promise<void>
  isLocked: boolean
}

const STEPS = [
  { id: 1, icon: '🧍', title: 'Temel Bilgiler', desc: 'İsim, meslek, hobi ve doğum/vefat tarihleri' },
  { id: 2, icon: '🎨', title: 'Görünüm & Tema', desc: 'Profil & arka plan görseli ve sayfa tasarımı' },
  { id: 3, icon: '🎵', title: 'Son Mesaj & Şarkı', desc: 'Son sözler ve en sevilen müzik' },
  { id: 4, icon: '🪦', title: 'Mezar Bilgileri', desc: 'Mezarlık adı, adresi, harita konumu ve notlar' },
  { id: 5, icon: '💝', title: 'Bağış Tercihi', desc: 'Çiçek yerine bağış önerileri ve yönlendirmesi' },
]

const THEMES = [
  {
    id: 'classic_emerald',
    name: 'Zümrüt Klasik',
    desc: 'Zümrüt Yeşili & Bej & Altın detaylar',
    font: 'Playfair Display / Serif',
    bg: '#fbf8f1',
    primary: '#0c3327',
    accent: '#c7a76f',
    textColor: '#1f2d27'
  },
  {
    id: 'warm_sunset',
    name: 'Sıcak Gün Batımı',
    desc: 'Kiremit & Kum Beji & Bronz detaylar',
    font: 'Lora / Georgia / Serif',
    bg: '#fcf9f4',
    primary: '#8c3b1a',
    accent: '#d49f6a',
    textColor: '#4c1d0b'
  },
  {
    id: 'midnight_silence',
    name: 'Gece Sessizliği',
    desc: 'Gece Mavisi & Gümüş Gri & Platin',
    font: 'Geist / Inter / Sans-Serif',
    bg: '#f8fafc',
    primary: '#0f172a',
    accent: '#94a3b8',
    textColor: '#0f172a'
  },
  {
    id: 'pure_light',
    name: 'Minimal Beyaz',
    desc: 'Kar Beyazı & Açık Gri & İnce Altın',
    font: 'Geist / System-ui / Sans-Serif',
    bg: '#ffffff',
    primary: '#f8fafc',
    accent: '#b45309',
    textColor: '#0f172a'
  },
  {
    id: 'rustic_autumn',
    name: 'Nostaljik Sonbahar',
    desc: 'Haki Zeytin & Sonbahar Sarısı',
    font: 'Garamond / Georgia / Serif',
    bg: '#fbfaf7',
    primary: '#3f4e3f',
    accent: '#ca8a04',
    textColor: '#2b352b'
  }
]

export default function ProfileWizardForm({ vault, saveProfileAction, isLocked }: Props) {
  const searchParams = useSearchParams()

  // Read active step from URL parameter directly to prevent setState cascading render warnings
  const stepParam = searchParams.get('step')
  let activeStep = 1
  if (stepParam) {
    const stepNum = parseInt(stepParam, 10)
    if (stepNum >= 1 && stepNum <= 5) {
      activeStep = stepNum
    }
  }

  const [selectedTheme, setSelectedTheme] = useState(vault.theme || 'classic_emerald')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10 disabled:opacity-40`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`
  const sectionCls = `rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)] space-y-4`

  const cemeteryLat = vault.cemetery_lat ? parseFloat(vault.cemetery_lat.toString()) : null
  const cemeteryLng = vault.cemetery_lng ? parseFloat(vault.cemetery_lng.toString()) : null

  const progressPercentage = (activeStep / 5) * 100

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      {/* Left Stepper Layout */}
      <aside className="w-full shrink-0 lg:w-64 sticky top-8 z-10 bg-[#fbfaf7] py-2 lg:py-0">
        <div className="rounded-2xl border border-[#e5dccb] bg-white p-4 shadow-sm">
          {/* Progress Indicator */}
          <div className="mb-4">
            <div className="flex justify-between items-center text-xs font-semibold text-[#4a5e55] mb-1.5">
              <span>Profil Tamamlama</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full h-2 bg-[#f2ebd9] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#174f35] transition-all duration-500 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex overflow-x-auto no-scrollbar gap-2 lg:flex-col lg:overflow-x-visible lg:gap-1 pb-2 lg:pb-0">
            {STEPS.map((s) => {
              const isActive = activeStep === s.id
              const isPassed = activeStep > s.id
              return (
                <Link
                  key={s.id}
                  href={`?step=${s.id}`}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all shrink-0 lg:shrink-1 ${
                    isActive
                      ? 'bg-[#174f35] text-white shadow-md shadow-[#174f35]/10'
                      : isPassed
                      ? 'bg-[#edf8ef] text-[#176b3f] border border-[#b9dfc2]/40 hover:bg-[#e2f3e5]'
                      : 'bg-transparent text-[#4a5e55] hover:bg-[#f5efdf] hover:text-[#174f35]'
                  }`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    isActive 
                      ? 'bg-white text-[#174f35]' 
                      : isPassed 
                      ? 'bg-[#176b3f] text-white' 
                      : 'bg-[#f2ebd9] text-[#788177]'
                  }`}>
                    {isPassed ? '✓' : s.id}
                  </span>
                  <div className="text-xs">
                    <p className={`font-bold ${isActive ? 'text-white' : 'text-[#22362e]'}`}>{s.title}</p>
                    <p className={`hidden lg:block text-[10px] truncate w-44 ${isActive ? 'text-[#e5dccb]' : 'text-[#adb5ab]'}`}>{s.desc}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Main Form Area */}
      <form 
        action={saveProfileAction} 
        onSubmit={() => setIsSubmitting(true)}
        className="flex-1 min-w-0"
      >
        {/* Hidden inputs to control stepping and save state */}
        <input type="hidden" name="step" value={activeStep} />
        <input type="hidden" name="theme" value={selectedTheme} />

        {/* STEP 1: Temel Bilgiler */}
        <div className={activeStep === 1 ? 'block animate-fade-in space-y-5' : 'hidden'}>
          <section className={sectionCls}>
            <div className="flex items-center gap-2 pb-1 border-b border-[#e5dccb]/60 mb-2">
              <span className="text-xl">🧍</span>
              <div>
                <h2 className="font-semibold text-[#1f2d27]">Temel Bilgiler</h2>
                <p className="text-xs text-[#adb5ab]">Anılan kişinin kimlik ve temel yaşam bilgileri</p>
              </div>
            </div>
            
            <div>
              <label className={labelCls}>Ad Soyad <span className="text-[#dfbd72]">*</span></label>
              <input type="text" name="display_name" defaultValue={vault.display_name} required disabled={isLocked} className={inputCls} />
            </div>
            
            <div>
              <label className={labelCls}>Kısa Özet (tagline)</label>
              <input type="text" name="tagline" defaultValue={vault.tagline ?? ''} placeholder="Sevgiyle yaşadı, sevgiyle hatırlanıyor." disabled={isLocked} className={inputCls} />
              <p className="mt-1 text-xs text-[#adb5ab]">Anma sayfasının giriş bölümünde ismin altında görünür</p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Meslek</label>
                <input type="text" name="profession" defaultValue={vault.profession ?? ''} placeholder="Öğretmen, mühendis, esnaf..." disabled={isLocked} className={inputCls} />
                <p className="mt-1 text-xs text-[#adb5ab]">Önizleme ve anma sayfasında kişisel bilgi olarak görünür</p>
              </div>
              <div>
                <label className={labelCls}>Hobileri / İlgi Alanları</label>
                <input type="text" name="hobbies" defaultValue={vault.hobbies ?? ''} placeholder="Bahçecilik, şiir, müzik..." disabled={isLocked} className={inputCls} />
                <p className="mt-1 text-xs text-[#adb5ab]">Kısa ve virgülle ayrılmış yazabilirsiniz</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className={labelCls}>Doğum Tarihi</label>
                <PartialDateInput
                  name="birth_date"
                  defaultDate={vault.birth_date}
                  defaultPrecision={vault.birth_date_precision}
                  disabled={isLocked}
                  inputCls={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Vefat Tarihi</label>
                <PartialDateInput
                  name="death_date"
                  defaultDate={vault.death_date}
                  defaultPrecision={vault.death_date_precision}
                  disabled={isLocked}
                  inputCls={inputCls}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Doğum Yeri</label>
                <input type="text" name="birth_place" defaultValue={vault.birth_place ?? ''} placeholder="Şehir, Ülke" disabled={isLocked} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Vefat Yeri</label>
                <input type="text" name="death_place" defaultValue={vault.death_place ?? ''} placeholder="Şehir, Ülke" disabled={isLocked} className={inputCls} />
              </div>
            </div>
          </section>
        </div>

        {/* STEP 2: Görünüm & Tema */}
        <div className={activeStep === 2 ? 'block animate-fade-in space-y-5' : 'hidden'}>
          {/* Photos */}
          <section className={sectionCls}>
            <div className="flex items-center gap-2 pb-1 border-b border-[#e5dccb]/60 mb-2">
              <span className="text-xl">📸</span>
              <div>
                <h2 className="font-semibold text-[#1f2d27]">Profil ve Kapak Fotoğrafı</h2>
                <p className="text-xs text-[#adb5ab]">Anma sayfasında kullanılacak görseller</p>
              </div>
            </div>

            {/* Profile Photo */}
            <div className="space-y-3">
              <label className={labelCls}>Profil Fotoğrafı</label>
              <div className="flex gap-5 items-start">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[#e5dccb] bg-[#f5efdf]">
                  {vault.cover_photo_url ? (
                    <Image src={vault.cover_photo_url} alt={vault.display_name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl text-[#c8bfb0]">👤</div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className={labelCls}>Dosya yükle</label>
                    <ImageUploadInput
                      name="cover_photo_file"
                      disabled={isLocked}
                      className="w-full cursor-pointer rounded-xl border border-[#e5dccb] bg-white px-3 py-2.5 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium outline-none disabled:opacity-40"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>veya fotoğraf URL</label>
                    <input type="url" name="cover_photo_url" defaultValue={vault.cover_photo_url ?? ''} placeholder="https://..." disabled={isLocked} className={inputCls} />
                  </div>
                </div>
              </div>
            </div>

            {/* Background Photo */}
            <div className="space-y-3 pt-2">
              <label className={labelCls}>Giriş Bölümü Arka Planı (Hero Background)</label>
              <div className="flex gap-5 items-start">
                <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-2xl border border-[#e5dccb] bg-[#f5efdf]">
                  {vault.hero_bg_url ? (
                    <Image src={vault.hero_bg_url} alt="Arka plan" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl text-[#c8bfb0]">🌿</div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className={labelCls}>Dosya yükle</label>
                    <ImageUploadInput
                      name="hero_bg_file"
                      disabled={isLocked}
                      className="w-full cursor-pointer rounded-xl border border-[#e5dccb] bg-white px-3 py-2.5 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium outline-none disabled:opacity-40"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>veya görsel URL</label>
                    <input type="url" name="hero_bg_url" defaultValue={vault.hero_bg_url ?? ''} placeholder="https://..." disabled={isLocked} className={inputCls} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Theme Selector */}
          <section className={sectionCls}>
            <div className="flex items-center gap-2 pb-1 border-b border-[#e5dccb]/60 mb-2">
              <span className="text-xl">🎨</span>
              <div>
                <h2 className="font-semibold text-[#1f2d27]">Sayfa Şablonu & Tema Seçimi</h2>
                <p className="text-xs text-[#adb5ab]">Anma sayfasının genel renk paleti, yazı tipi ve atmosferi</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 pt-2">
              {THEMES.map((theme) => {
                const isSelected = selectedTheme === theme.id
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`flex flex-col text-left rounded-2xl border p-4 transition-all relative ${
                      isSelected
                        ? 'border-[#174f35] bg-[#fdfdfb] ring-2 ring-[#174f35]/20 shadow-md'
                        : 'border-[#e5dccb] bg-white hover:border-[#b08340]/60 hover:bg-[#fffdf8]'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#174f35] text-white text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                    <h3 className="font-bold text-sm text-[#1f2d27] flex items-center gap-1.5">
                      {theme.name}
                      {theme.id === 'classic_emerald' && (
                        <span className="rounded bg-[#edf8ef] px-1.5 py-0.5 text-[9px] font-semibold text-[#176b3f]">Varsayılan</span>
                      )}
                    </h3>
                    <p className="text-xs text-[#adb5ab] mt-0.5 mb-3">{theme.desc}</p>
                    
                    {/* Visual color palette preview */}
                    <div className="mt-auto flex items-center gap-2 bg-[#fbfaf7] rounded-xl p-2 border border-[#e5dccb]/40">
                      <div className="flex gap-1">
                        <div className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.primary }} title="Ana Renk" />
                        <div className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.accent }} title="Vurgu Rengi" />
                        <div className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.bg }} title="Arka Plan" />
                      </div>
                      <span className="text-[10px] font-mono text-[#788177] ml-auto" style={{ fontFamily: theme.id === 'midnight_silence' || theme.id === 'pure_light' ? 'sans-serif' : 'serif' }}>
                        {theme.font}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        {/* STEP 3: Son Mesaj & Şarkı */}
        <div className={activeStep === 3 ? 'block animate-fade-in space-y-5' : 'hidden'}>
          <section className={sectionCls}>
            <div className="flex items-center gap-2 pb-1 border-b border-[#e5dccb]/60 mb-2">
              <span className="text-xl">💬</span>
              <div>
                <h2 className="font-semibold text-[#1f2d27]">Son Mesaj</h2>
                <p className="text-xs text-[#adb5ab]">Ziyaretçilere iletilecek son sözler ve veda mesajı</p>
              </div>
            </div>
            <div>
              <label className={labelCls}>Bıraktığı Son Söz</label>
              <textarea name="last_message" rows={5} defaultValue={vault.last_message ?? ''} disabled={isLocked}
                placeholder="Hayatta en kıymetli şeyin sevgi olduğunu öğrendim. Hepinizi sevgiyle selamlıyorum..."
                className={inputCls + ' resize-none'} />
              <p className="mt-1 text-xs text-[#adb5ab]">Anma sayfasında özel tırnak içinde ve şık bir alıntı alanında gösterilir</p>
            </div>
          </section>

          <section className={sectionCls}>
            <div className="flex items-center gap-2 pb-1 border-b border-[#e5dccb]/60 mb-2">
              <span className="text-xl">🎵</span>
              <div>
                <h2 className="font-semibold text-[#1f2d27]">En Sevdiği Şarkı / Müzik</h2>
                <p className="text-xs text-[#adb5ab]">Anma sayfasında dinlenebilecek arka plan müziği</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-2">
              <div>
                <label className={labelCls}>Şarkı Adı & Sanatçı</label>
                <input type="text" name="favorite_song_title" defaultValue={vault.favorite_song_title ?? ''} placeholder="Örn: Aşık Veysel - Kara Toprak" disabled={isLocked} className={inputCls} />
              </div>
              
              <div className="rounded-2xl border border-[#e5dccb]/60 bg-white p-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Müzik dosyası yükle</label>
                    <input type="file" name="favorite_song_file" accept="audio/*" disabled={isLocked}
                      className="w-full cursor-pointer rounded-xl border border-[#e5dccb] bg-white px-3 py-2 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium outline-none disabled:opacity-40" />
                  </div>
                  <div>
                    <label className={labelCls}>veya ses dosyası URL&apos;si</label>
                    <input type="url" name="favorite_song_url" defaultValue={vault.favorite_song_url ?? ''} placeholder="https://... (mp3, wav, ogg)" disabled={isLocked} className={inputCls} />
                  </div>
                </div>
                <p className="text-[11px] text-[#adb5ab]">Not: Dosya yüklemeniz halinde URL yerine dosya kullanılır. Maksimum 25 MB boyutundaki ses dosyaları önerilir.</p>
              </div>
            </div>
          </section>
        </div>

        {/* STEP 4: Mezar Bilgileri */}
        <div className={activeStep === 4 ? 'block animate-fade-in space-y-5' : 'hidden'}>
          <section className={sectionCls}>
            <div className="flex items-center gap-2 pb-1 border-b border-[#e5dccb]/60 mb-2">
              <span className="text-xl">🪦</span>
              <div>
                <h2 className="font-semibold text-[#1f2d27]">Mezar Bilgileri & Konum</h2>
                <p className="text-xs text-[#adb5ab]">Ziyaretçilerin kabri kolayca bulabilmesi için konum ve detaylar</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-2">
              <div>
                <label className={labelCls}>Mezarlık Adı</label>
                <input type="text" name="cemetery_name" defaultValue={vault.cemetery_name ?? ''} placeholder="Üçler Mezarlığı, Konya" disabled={isLocked} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mezarlık Adresi</label>
                <input type="text" name="cemetery_address" defaultValue={vault.cemetery_address ?? ''} placeholder="Adres veya konum tarifi" disabled={isLocked} className={inputCls} />
              </div>
              
              <div className="rounded-2xl border border-[#e5dccb]/50 p-2 bg-white">
                <CemeteryLocationPicker initialLat={cemeteryLat} initialLng={cemeteryLng} disabled={isLocked} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Ada / Parsel</label>
                  <input type="text" name="cemetery_plot" defaultValue={vault.cemetery_plot ?? ''} placeholder="Ada: 245 · Parsel: 18" disabled={isLocked} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Sıra / Numara</label>
                  <input type="text" name="cemetery_row" defaultValue={vault.cemetery_row ?? ''} placeholder="Sıra: C · No: 7" disabled={isLocked} className={inputCls} />
                </div>
              </div>
              
              <div>
                <label className={labelCls}>Ziyaret Saatleri</label>
                <input type="text" name="cemetery_hours" defaultValue={vault.cemetery_hours ?? ''} placeholder="Her gün 08:00 – 19:00" disabled={isLocked} className={inputCls} />
              </div>
              
              <div>
                <label className={labelCls}>Ziyaretçilere Özel Not / Yönlendirme</label>
                <textarea name="cemetery_note" rows={3} defaultValue={vault.cemetery_note ?? ''} placeholder="Ana kapıdan girdikten sonra selvi ağacının arkasındaki yoldan devam edin..." disabled={isLocked} className={inputCls + ' resize-none'} />
              </div>
            </div>
          </section>
        </div>

        {/* STEP 5: Bağış Tercihi */}
        <div className={activeStep === 5 ? 'block animate-fade-in space-y-5' : 'hidden'}>
          <section className={sectionCls}>
            <div className="flex items-center gap-2 pb-1 border-b border-[#e5dccb]/60 mb-2">
              <span className="text-xl">💝</span>
              <div>
                <h2 className="font-semibold text-[#1f2d27]">Bağış Yönlendirmesi</h2>
                <p className="text-xs text-[#adb5ab]">Çiçek gönderimi yerine hayır kurumlarına bağış yapılması talebi</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-2">
              <div>
                <label className={labelCls}>Bağış Talebi Mesajı</label>
                <textarea
                  name="donation_preference"
                  rows={4}
                  defaultValue={vault.donation_preference ?? ''}
                  placeholder="Çiçek göndermek yerine anısına LÖSEV, TEMA Vakfı veya dilediğiniz bir hayır kurumuna bağış yapmanızı rica ederiz..."
                  disabled={isLocked}
                  className={inputCls + ' resize-none'}
                />
                <p className="mt-1 text-xs text-[#adb5ab]">Anma sayfasında ziyaretçilere gösterilir.</p>
              </div>
              
              <div>
                <label className={labelCls}>Doğrudan Bağış Linki (URL)</label>
                <input
                  type="url"
                  name="donation_url"
                  defaultValue={vault.donation_url ?? ''}
                  placeholder="https://... (Örn: LÖSEV bağış sayfası linki)"
                  disabled={isLocked}
                  className={inputCls}
                />
                <p className="mt-1 text-xs text-[#adb5ab]">Link girilirse anma sayfasında ziyaretçilerin bağış yapabilmesi için yönlendirme butonu görünür.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3 items-center justify-between">
          <div>
            {activeStep > 1 && (
              <Link
                href={`?step=${activeStep - 1}`}
                className="rounded-xl border border-[#e5dccb] bg-white px-5 py-3 text-sm font-semibold text-[#4a5e55] hover:bg-[#f5efdf] hover:text-[#174f35] transition-colors"
              >
                Geri Dön
              </Link>
            )}
          </div>
          
          <div className="flex gap-3 ml-auto">
            {/* Taslağı Kaydet */}
            {!isLocked && (
              <button
                type="submit"
                name="next_step"
                value={activeStep}
                disabled={isSubmitting}
                className="rounded-xl border border-[#174f35] bg-[#edf8ef] px-5 py-3 text-sm font-semibold text-[#174f35] hover:bg-[#e2f3e5] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            )}

            {/* Kaydet & İlerle / Tamamla */}
            {!isLocked && activeStep < 5 && (
              <button
                type="submit"
                name="next_step"
                value={activeStep + 1}
                disabled={isSubmitting}
                className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#123f2b] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Kaydediliyor...' : 'Kaydet & İlerle →'}
              </button>
            )}

            {!isLocked && activeStep === 5 && (
              <button
                type="submit"
                name="next_step"
                value={5}
                disabled={isSubmitting}
                className="rounded-xl bg-[#176b3f] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#125833] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Kaydediliyor...' : 'Tamamla & Kaydet ✓'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
