'use client'

import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, User, Music, Heart, MapPin, Upload, Loader2 } from 'lucide-react'
import PartialDateInput from '@/components/PartialDateInput'

interface VaultData {
  display_name: string
  biography: string | null
  status: string
  cover_photo_url: string | null
  birth_date: string | null
  birth_date_precision: string | null
  death_date: string | null
  death_date_precision: string | null
  tagline: string | null
  profession: string | null
  hobbies: string | null
  birth_place: string | null
  death_place: string | null
  favorite_song_title: string | null
  favorite_song_url: string | null
  last_message: string | null
  donation_preference: string | null
  donation_url: string | null
  hero_bg_url: string | null
  profile_video_url: string | null
}

export default function BiyografiPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = useMemo(() => createClient(), [])

  const [vault, setVault] = useState<VaultData | null>(null)

  // Profil
  const [displayName, setDisplayName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [birthDatePrecision, setBirthDatePrecision] = useState('day')
  const [deathDate, setDeathDate] = useState('')
  const [deathDatePrecision, setDeathDatePrecision] = useState('day')
  const [tagline, setTagline] = useState('')
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('')
  const [photoObjectPos, setPhotoObjectPos] = useState('center 20%')
  const [heroBgUrl, setHeroBgUrl] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  // Hayat detayları
  const [profession, setProfession] = useState('')
  const [hobbies, setHobbies] = useState('')
  const [birthPlace, setBirthPlace] = useState('')
  const [deathPlace, setDeathPlace] = useState('')
  const [detailSaving, setDetailSaving] = useState(false)
  const [detailSaved, setDetailSaved] = useState(false)

  // Son mesaj & bağış
  const [lastMessage, setLastMessage] = useState('')
  const [donationPreference, setDonationPreference] = useState('')
  const [donationUrl, setDonationUrl] = useState('')
  const [extraSaving, setExtraSaving] = useState(false)
  const [extraSaved, setExtraSaved] = useState(false)

  // Profil fotoğrafı yükleme
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null)

  // Profil videosu
  const [profileVideoUrl, setProfileVideoUrl] = useState('')
  const [videoUploading, setVideoUploading] = useState(false)
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null)

  // Hero arka plan yükleme
  const [heroBgUploading, setHeroBgUploading] = useState(false)
  const [heroBgUploadError, setHeroBgUploadError] = useState<string | null>(null)

  // Sevilen şarkı
  const [favSongTitle, setFavSongTitle] = useState('')
  const [favSongUrl, setFavSongUrl] = useState('')
  const [songSaving, setSongSaving] = useState(false)
  const [songSaved, setSongSaved] = useState(false)
  const [songUploading, setSongUploading] = useState(false)
  const [songUploadError, setSongUploadError] = useState<string | null>(null)

  // Biyografi
  const [bio, setBio] = useState('')
  const [initialBio, setInitialBio] = useState('')
  const [bioSaving, setBioSaving] = useState(false)
  const [bioSaved, setBioSaved] = useState(false)
  const bioTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    supabase
      .from('vaults')
      .select('display_name, biography, status, cover_photo_url, birth_date, birth_date_precision, death_date, death_date_precision, tagline, profession, hobbies, birth_place, death_place, favorite_song_title, favorite_song_url, last_message, donation_preference, donation_url, hero_bg_url, profile_video_url')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          const v = data as VaultData
          setVault(v)
          setDisplayName(v.display_name ?? '')
          setBirthDate(v.birth_date ?? '')
          setBirthDatePrecision(v.birth_date_precision ?? 'day')
          setDeathDate(v.death_date ?? '')
          setDeathDatePrecision(v.death_date_precision ?? 'day')
          setTagline(v.tagline ?? '')
          setCoverPhotoUrl(v.cover_photo_url ?? '')
          setHeroBgUrl(v.hero_bg_url ?? '')
          setProfession(v.profession ?? '')
          setHobbies(v.hobbies ?? '')
          setBirthPlace(v.birth_place ?? '')
          setDeathPlace(v.death_place ?? '')
          setLastMessage(v.last_message ?? '')
          setDonationPreference(v.donation_preference ?? '')
          setDonationUrl(v.donation_url ?? '')
          setFavSongTitle(v.favorite_song_title ?? '')
          setFavSongUrl(v.favorite_song_url ?? '')
          setProfileVideoUrl(v.profile_video_url ?? '')
          setBio(v.biography ?? '')
          setInitialBio(v.biography ?? '')
        }
      })
  }, [id, supabase])

  // Yüklenen fotoğrafın boyutuna göre object-position belirle
  useEffect(() => {
    if (!coverPhotoUrl) return
    const img = new window.Image()
    img.onload = () => {
      const ratio = img.naturalHeight / img.naturalWidth
      // Portre (9:16 → ratio ~1.78): yüz genellikle üst %20'de
      // Kare veya yatay: ortala
      setPhotoObjectPos(ratio > 1.2 ? 'center 20%' : 'center center')
    }
    img.src = coverPhotoUrl
  }, [coverPhotoUrl])

  const isLocked = vault?.status === 'pending_verification'
  const bioDirty = bio !== initialBio
  const words = bio.trim() ? bio.trim().split(/\s+/).length : 0

  const saveBio = async (text: string) => {
    if (isLocked) return
    setBioSaving(true)
    await supabase.from('vaults').update({ biography: text }).eq('id', id)
    setInitialBio(text)
    setBioSaving(false)
    setBioSaved(true)
    setTimeout(() => setBioSaved(false), 2500)
  }

  const handleBioChange = (text: string) => {
    if (isLocked) return
    setBio(text)
    if (bioTimerRef.current) clearTimeout(bioTimerRef.current)
    bioTimerRef.current = setTimeout(() => saveBio(text), 2000)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return
    setProfileSaving(true)
    await supabase.from('vaults').update({
      display_name: displayName.trim() || vault?.display_name,
      birth_date: birthDate || null,
      birth_date_precision: birthDate ? birthDatePrecision : null,
      death_date: deathDate || null,
      death_date_precision: deathDate ? deathDatePrecision : null,
      tagline: tagline.trim() || null,
      cover_photo_url: coverPhotoUrl.trim() || null,
      hero_bg_url: heroBgUrl.trim() || null,
      profile_video_url: profileVideoUrl.trim() || null,
    }).eq('id', id)
    setVault(prev => prev ? { ...prev, display_name: displayName, birth_date: birthDate || null, birth_date_precision: birthDatePrecision, death_date: deathDate || null, death_date_precision: deathDatePrecision, tagline: tagline || null, cover_photo_url: coverPhotoUrl || null, hero_bg_url: heroBgUrl || null, profile_video_url: profileVideoUrl || null } : prev)
    setProfileSaving(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2500)
  }

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return
    setDetailSaving(true)
    await supabase.from('vaults').update({
      profession: profession.trim() || null,
      hobbies: hobbies.trim() || null,
      birth_place: birthPlace.trim() || null,
      death_place: deathPlace.trim() || null,
    }).eq('id', id)
    setDetailSaving(false)
    setDetailSaved(true)
    setTimeout(() => setDetailSaved(false), 2500)
  }

  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return
    setSongSaving(true)
    await supabase.from('vaults').update({
      favorite_song_title: favSongTitle.trim() || null,
      favorite_song_url: favSongUrl.trim() || null,
    }).eq('id', id)
    setSongSaving(false)
    setSongSaved(true)
    setTimeout(() => setSongSaved(false), 2500)
  }

  const handleSaveExtra = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return
    setExtraSaving(true)
    await supabase.from('vaults').update({
      last_message: lastMessage.trim() || null,
      donation_preference: donationPreference.trim() || null,
      donation_url: donationUrl.trim() || null,
    }).eq('id', id)
    setExtraSaving(false)
    setExtraSaved(true)
    setTimeout(() => setExtraSaved(false), 2500)
  }


  const inputCls = 'w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10 disabled:opacity-40'
  const labelCls = 'mb-1.5 block text-xs font-semibold text-[#4a5e55]'
  const blockCls = 'rounded-3xl border border-[#e5dccb] bg-[#fffdf8] shadow-[0_4px_24px_rgba(64,48,24,0.06)]'
  const headerCls = 'flex items-center justify-between border-b border-[#e5dccb] px-6 py-4'
  const saveBtnCls = 'rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(23,79,53,0.18)] transition-colors hover:bg-[#123f2b] disabled:opacity-40'

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center gap-2 text-sm">
          <Link href={`/anma-paneli/${id}`} className="text-[#788177] transition-colors hover:text-[#174f35]">
            {vault?.display_name ?? '...'}
          </Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Biyografi</span>
        </div>

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra bilgileri düzenleyebilirsiniz.
          </div>
        )}

        {/* Profil bilgileri */}
        <div className={`${blockCls} mb-6 overflow-hidden`}>
          <div className={headerCls}>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#b08340]" />
              <h2 className="font-semibold text-[#1f2d27]">Profil Bilgileri</h2>
            </div>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-5 p-6">
            {/* Ad Soyad + Profil Fotoğrafı yan yana önizleme */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {/* Fotoğraf yükleme */}
              <div className="shrink-0">
                <label className={labelCls}>Profil Fotoğrafı</label>
                {/* Büyük daire önizleme + tıklanınca yükle */}
                <label className={`group relative mx-auto flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-[3px] border-dashed border-[#e5dccb] bg-[#fdfaf5] transition hover:border-[#174f35]/50 ${isLocked ? 'pointer-events-none opacity-40' : ''}`}>
                  {photoUploading ? (
                    <Loader2 className="h-7 w-7 animate-spin text-[#174f35]" />
                  ) : coverPhotoUrl ? (
                    <>
                      <Image src={coverPhotoUrl} alt="Profil" fill className="object-cover" style={{ objectPosition: photoObjectPos }} unoptimized />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
                        <Upload className="h-5 w-5 text-white" />
                        <span className="text-[10px] font-semibold text-white">Değiştir</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="h-6 w-6 text-[#b08340]" />
                      <span className="text-center text-[10px] leading-tight text-[#adb5ab]">Fotoğraf<br />Yükle</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={isLocked ?? false}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (!file.type.startsWith('image/')) { setPhotoUploadError('Sadece görsel yükleyebilirsiniz'); e.target.value = ''; return }
                      if (file.size > 8 * 1024 * 1024) { setPhotoUploadError('Dosya çok büyük (max 8 MB)'); e.target.value = ''; return }
                      setPhotoUploading(true)
                      setPhotoUploadError(null)
                      try {
                        const presignRes = await fetch('/api/r2/presign', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            fileName: file.name,
                            fileSize: file.size,
                            category: 'profile_photo',
                            profileId: id,
                            mimeType: file.type || 'image/jpeg',
                          }),
                        })
                        if (!presignRes.ok) {
                          const resJson = await presignRes.json()
                          throw new Error(resJson.error || 'Yükleme izni alınamadı.')
                        }
                        const { uploadUrl, publicUrl } = await presignRes.json()

                        const uploadRes = await fetch(uploadUrl, {
                          method: 'PUT',
                          headers: { 'Content-Type': file.type || 'image/jpeg' },
                          body: file,
                        })
                        if (!uploadRes.ok) {
                          throw new Error('Dosya R2 ye yüklenemedi.')
                        }
                        setCoverPhotoUrl(publicUrl)
                      } catch (err: any) {
                        setPhotoUploadError(err.message || 'Yükleme sırasında hata oluştu.')
                      } finally {
                        setPhotoUploading(false)
                        e.target.value = ''
                      }
                    }}
                  />
                </label>
                {photoUploadError && <p className="mt-1 max-w-[112px] text-center text-[10px] text-red-500">{photoUploadError}</p>}
                {/* Tavsiye notu */}
                <div className="mt-2 max-w-[112px] rounded-lg border border-[#e5dccb] bg-[#faf6ee] px-2.5 py-2 text-[10px] leading-relaxed text-[#788177]">
                  📸 <span className="font-semibold text-[#4a5e55]">Tavsiye:</span><br />
                  Aydınlık, yüzün net göründüğü fotoğraf seçin.
                </div>
              </div>

              {/* Ad Soyad + Tarihler */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className={labelCls}>Ad Soyad *</label>
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} disabled={isLocked ?? false} placeholder="Adnan Kahya" className={inputCls} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Doğum Tarihi</label>
                    <PartialDateInput
                      name="birth_date_ctrl"
                      defaultDate={birthDate || null}
                      defaultPrecision={birthDatePrecision}
                      disabled={isLocked ?? false}
                      inputCls={inputCls}
                      onChange={(d, p) => { setBirthDate(d); setBirthDatePrecision(p) }}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Vefat Tarihi</label>
                    <PartialDateInput
                      name="death_date_ctrl"
                      defaultDate={deathDate || null}
                      defaultPrecision={deathDatePrecision}
                      disabled={isLocked ?? false}
                      inputCls={inputCls}
                      onChange={(d, p) => { setDeathDate(d); setDeathDatePrecision(p) }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Kısa Anı Sözü</label>
              <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} disabled={isLocked ?? false} placeholder="Kalbimizde yaşıyor... veya en sevdiği söz" maxLength={200} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Arka Plan Görseli (Hero)</label>
              <p className="mb-2 text-xs text-[#788177]">Anma sayfasının üst bölümünde görünür. Boş bırakılırsa profil fotoğrafı kullanılır.</p>
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-[#e5dccb] bg-[#fdfaf5] px-4 py-4 transition hover:border-[#174f35]/40 hover:bg-[#f5f0e8] ${isLocked ? 'pointer-events-none opacity-40' : ''}`}>
                {heroBgUploading
                  ? <Loader2 className="h-5 w-5 animate-spin text-[#174f35]" />
                  : <Upload className="h-5 w-5 text-[#b08340]" />
                }
                <div>
                  <p className="text-sm font-medium text-[#1f2d27]">
                    {heroBgUploading ? 'Yükleniyor...' : 'Görsel seç veya buraya sürükle'}
                  </p>
                  <p className="text-xs text-[#adb5ab]">JPG, PNG, WEBP — max 10 MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={isLocked ?? false}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (!file.type.startsWith('image/')) {
                      setHeroBgUploadError('Sadece görsel dosyası yükleyebilirsiniz')
                      e.target.value = ''
                      return
                    }
                    if (file.size > 8 * 1024 * 1024) {
                      setHeroBgUploadError('Dosya çok büyük (max 8 MB)')
                      e.target.value = ''
                      return
                    }
                    setHeroBgUploading(true)
                    setHeroBgUploadError(null)
                    try {
                      const presignRes = await fetch('/api/r2/presign', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          fileName: file.name,
                          fileSize: file.size,
                          category: 'hero_bg',
                          profileId: id,
                          mimeType: file.type || 'image/jpeg',
                        }),
                      })
                      if (!presignRes.ok) {
                        const resJson = await presignRes.json()
                        throw new Error(resJson.error || 'Yükleme izni alınamadı.')
                      }
                      const { uploadUrl, publicUrl } = await presignRes.json()

                      const uploadRes = await fetch(uploadUrl, {
                        method: 'PUT',
                        headers: { 'Content-Type': file.type || 'image/jpeg' },
                        body: file,
                      })
                      if (!uploadRes.ok) {
                        throw new Error('Dosya R2 ye yüklenemedi.')
                      }
                      setHeroBgUrl(publicUrl)
                    } catch (err: any) {
                      setHeroBgUploadError(err.message || 'Yükleme sırasında hata oldu.')
                    } finally {
                      setHeroBgUploading(false)
                      e.target.value = ''
                    }
                  }}
                />
              </label>
              {heroBgUploadError && <p className="mt-1 text-xs text-red-500">{heroBgUploadError}</p>}
              {heroBgUrl && (
                <div className="mt-2 overflow-hidden rounded-xl border border-[#e5dccb]">
                  <Image src={heroBgUrl} alt="Hero önizleme" width={600} height={120} className="h-24 w-full object-cover" unoptimized />
                </div>
              )}
            </div>

            {/* Video yükleme */}
            <div>
              <label className={labelCls}>Profil Videosu</label>
              <label className={`block cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-[#e5dccb] bg-[#fdfaf5] transition hover:border-[#174f35]/40 hover:bg-[#f5f0e8] ${isLocked ? 'pointer-events-none opacity-40' : ''}`}>
                {/* Yükleme satırı */}
                <div className="flex items-center gap-3 px-4 py-4">
                  {videoUploading
                    ? <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#174f35]" />
                    : <Upload className="h-5 w-5 shrink-0 text-[#b08340]" />
                  }
                  <div>
                    <p className="text-sm font-medium text-[#1f2d27]">
                      {videoUploading ? 'Video yükleniyor...' : 'Video seç veya buraya sürükle'}
                    </p>
                    <p className="text-xs text-[#adb5ab]">MP4, MOV, WEBM — max 100 MB, 10 dakika</p>
                  </div>
                </div>
                {/* Tavsiye notu */}
                <div className="border-t border-dashed border-[#e5dccb] bg-[#faf6ee] px-4 py-3 text-xs text-[#4a5e55]">
                  🎥 <span className="font-semibold">Video Seçimi İçin Tavsiyeler</span><br />
                  <span className="text-[#788177]">Mezarlık gibi açık alanlarda internet bağlantısı zayıf olabilir. Videoların ziyaretçilerde donmadan, anında açılabilmesi için süreyi <span className="font-semibold text-[#4a5e55]">2–3 dakika</span> aralığında tutmanızı öneririz.</span><br />
                  <span className="mt-1 block text-[#adb5ab]">(Sistemimiz kalite standartları gereği en fazla 100 MB boyutunda ve 10 dakikalık videolara izin vermektedir.)</span>
                </div>
                <input
                  type="file"
                  accept="video/*"
                  className="sr-only"
                  disabled={isLocked ?? false}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (!file.type.startsWith('video/')) { setVideoUploadError('Sadece video dosyası yükleyebilirsiniz'); e.target.value = ''; return }
                    if (file.size > 100 * 1024 * 1024) { setVideoUploadError('Video çok büyük (max 100 MB)'); e.target.value = ''; return }
                    
                    setVideoUploading(true)
                    setVideoUploadError(null)
                    
                    try {
                      // Check duration
                      const duration = await new Promise<number>((resolve, reject) => {
                        const video = document.createElement('video')
                        video.preload = 'metadata'
                        video.onloadedmetadata = () => {
                          URL.revokeObjectURL(video.src)
                          resolve(video.duration)
                        }
                        video.onerror = () => {
                          URL.revokeObjectURL(video.src)
                          reject(new Error('Video dosyası okunamadı.'))
                        }
                        video.src = URL.createObjectURL(file)
                      })

                      if (duration > 600) {
                        throw new Error('Video süresi en fazla 10 dakika olabilir.')
                      }

                      // Request Direct Creator Upload URL
                      const uploadUrlRes = await fetch('/api/stream/upload-url', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          fileName: file.name,
                          fileSize: file.size,
                          profileId: id,
                          duration,
                        }),
                      })

                      if (!uploadUrlRes.ok) {
                        const resJson = await uploadUrlRes.json()
                        throw new Error(resJson.error || 'Video yükleme bağlantısı alınamadı.')
                      }

                      const { uploadUrl, uid } = await uploadUrlRes.json()

                      // Upload to Cloudflare Stream
                      await new Promise<void>((resolve, reject) => {
                        const xhr = new XMLHttpRequest()
                        xhr.open('POST', uploadUrl, true)
                        xhr.onload = () => {
                          if (xhr.status === 200 || xhr.status === 201 || xhr.status === 204) {
                            resolve()
                          } else {
                            reject(new Error(`Videonuz yüklenemedi. Sunucu durum kodu: ${xhr.status}`))
                          }
                        }
                        xhr.onerror = () => reject(new Error('Yükleme sırasında ağ hatası oluştu.'))
                        const uploadForm = new FormData()
                        uploadForm.append('file', file)
                        xhr.send(uploadForm)
                      })

                      setProfileVideoUrl(`https://iframe.videodelivery.net/${uid}`)
                    } catch (err: any) {
                      setVideoUploadError(err.message || 'Yükleme sırasında hata oluştu.')
                    } finally {
                      setVideoUploading(false)
                      e.target.value = ''
                    }
                  }}
                />
              </label>
              {videoUploadError && <p className="mt-1 text-xs text-red-500">{videoUploadError}</p>}
              {profileVideoUrl && (
                profileVideoUrl.includes('iframe.videodelivery.net') ? (
                  <div className="mt-2 aspect-video overflow-hidden rounded-xl border border-[#e5dccb]">
                    <iframe src={profileVideoUrl} className="h-full w-full border-0" allowFullScreen />
                  </div>
                ) : (
                  <video controls src={profileVideoUrl} className="mt-2 w-full rounded-xl border border-[#e5dccb]" style={{ maxHeight: 220 }} />
                )
              )}
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={(isLocked ?? false) || profileSaving} className={saveBtnCls}>
                {profileSaving ? 'Kaydediliyor...' : 'Profili Kaydet'}
              </button>
              {profileSaved && <span className="flex items-center gap-1.5 text-xs font-medium text-[#174f35]">✓ Kaydedildi</span>}
            </div>
          </form>
        </div>

        {/* Kişisel detaylar */}
        <div className={`${blockCls} mb-6 overflow-hidden`}>
          <div className={headerCls}>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#b08340]" />
              <h2 className="font-semibold text-[#1f2d27]">Kişisel Detaylar</h2>
            </div>
          </div>
          <form onSubmit={handleSaveDetails} className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Meslek / Unvan</label>
                <input type="text" value={profession} onChange={e => setProfession(e.target.value)} disabled={isLocked ?? false} placeholder="Öğretmen, Mühendis, Ressam..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Hobiler & İlgi Alanları</label>
                <input type="text" value={hobbies} onChange={e => setHobbies(e.target.value)} disabled={isLocked ?? false} placeholder="Bahçecilik, okuma, satranç..." className={inputCls} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Doğduğu Yer</label>
                <input type="text" value={birthPlace} onChange={e => setBirthPlace(e.target.value)} disabled={isLocked ?? false} placeholder="Erzurum, Türkiye" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Vefat Ettiği Yer</label>
                <input type="text" value={deathPlace} onChange={e => setDeathPlace(e.target.value)} disabled={isLocked ?? false} placeholder="İstanbul, Türkiye" className={inputCls} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={(isLocked ?? false) || detailSaving} className={saveBtnCls}>
                {detailSaving ? 'Kaydediliyor...' : 'Detayları Kaydet'}
              </button>
              {detailSaved && <span className="flex items-center gap-1.5 text-xs font-medium text-[#174f35]">✓ Kaydedildi</span>}
            </div>
          </form>
        </div>

        {/* Sevilen şarkı */}
        <div className={`${blockCls} mb-6 overflow-hidden`}>
          <div className={headerCls}>
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-[#b08340]" />
              <h2 className="font-semibold text-[#1f2d27]">Sevilen Şarkı</h2>
            </div>
          </div>
          <form onSubmit={handleSaveSong} className="space-y-4 p-6">
            <p className="text-xs text-[#788177]">Anma sayfasında çalınan müzik. Dosya yükleyebilir veya URL girebilirsiniz (MP3/WAV/M4A, max 30 MB).</p>

            <div>
              <label className={labelCls}>Şarkı Adı</label>
              <input type="text" value={favSongTitle} onChange={e => setFavSongTitle(e.target.value)} disabled={isLocked ?? false} placeholder="Ne olurdum sensiz..." className={inputCls} />
            </div>

            {/* Dosya yükleme */}
            <div>
              <label className={labelCls}>Müzik Dosyası Yükle</label>
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-[#e5dccb] bg-[#fdfaf5] px-4 py-4 transition hover:border-[#174f35]/40 hover:bg-[#f5f0e8] ${isLocked ? 'pointer-events-none opacity-40' : ''}`}>
                {songUploading
                  ? <Loader2 className="h-5 w-5 animate-spin text-[#174f35]" />
                  : <Upload className="h-5 w-5 text-[#b08340]" />
                }
                <div>
                  <p className="text-sm font-medium text-[#1f2d27]">
                    {songUploading ? 'Yükleniyor...' : 'Dosya seç veya buraya sürükle'}
                  </p>
                  <p className="text-xs text-[#adb5ab]">MP3, WAV, M4A, AAC — max 30 MB</p>
                </div>
                <input
                  type="file"
                  accept="audio/*"
                  className="sr-only"
                  disabled={isLocked ?? false}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (!file.type.startsWith('audio/')) {
                      setSongUploadError('Sadece ses dosyası yükleyebilirsiniz')
                      e.target.value = ''
                      return
                    }
                    if (file.size > 30 * 1024 * 1024) {
                      setSongUploadError('Dosya çok büyük (max 30 MB)')
                      e.target.value = ''
                      return
                    }
                    setSongUploading(true)
                    setSongUploadError(null)
                    try {
                      const presignRes = await fetch('/api/r2/presign', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          fileName: file.name,
                          fileSize: file.size,
                          category: 'audio_recording',
                          profileId: id,
                          mimeType: file.type || 'audio/mpeg',
                        }),
                      })
                      if (!presignRes.ok) {
                        const resJson = await presignRes.json()
                        throw new Error(resJson.error || 'Yükleme izni alınamadı.')
                      }
                      const { uploadUrl, publicUrl } = await presignRes.json()

                      const uploadRes = await fetch(uploadUrl, {
                        method: 'PUT',
                        headers: { 'Content-Type': file.type || 'audio/mpeg' },
                        body: file,
                      })
                      if (!uploadRes.ok) {
                        throw new Error('Dosya R2 ye yüklenemedi.')
                      }

                      setFavSongUrl(publicUrl)
                      if (!favSongTitle) setFavSongTitle(file.name.replace(/\.[^.]+$/, ''))
                    } catch (err: any) {
                      setSongUploadError(err.message || 'Yükleme sırasında hata oldu.')
                    } finally {
                      setSongUploading(false)
                      e.target.value = ''
                    }
                  }}
                />
              </label>
              {songUploadError && <p className="mt-1 text-xs text-red-500">{songUploadError}</p>}
            </div>

            {/* Manuel URL */}
            <div>
              <label className={labelCls}>veya Ses URL</label>
              <input type="url" value={favSongUrl} onChange={e => setFavSongUrl(e.target.value)} disabled={isLocked ?? false} placeholder="https://..." className={inputCls} />
            </div>

            {favSongUrl && (
              <audio controls src={favSongUrl} className="h-9 w-full" />
            )}
            <div className="flex items-center gap-3">
              <button type="submit" disabled={(isLocked ?? false) || songSaving} className={saveBtnCls}>
                {songSaving ? 'Kaydediliyor...' : 'Şarkıyı Kaydet'}
              </button>
              {songSaved && <span className="flex items-center gap-1.5 text-xs font-medium text-[#174f35]">✓ Kaydedildi</span>}
            </div>
          </form>
        </div>

        {/* Son mesaj & bağış */}
        <div className={`${blockCls} mb-6 overflow-hidden`}>
          <div className={headerCls}>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-[#b08340]" />
              <h2 className="font-semibold text-[#1f2d27]">Son Mesaj & Bağış Tercihi</h2>
            </div>
          </div>
          <form onSubmit={handleSaveExtra} className="space-y-4 p-6">
            <div>
              <label className={labelCls}>Son Mesaj</label>
              <p className="mb-2 text-xs text-[#788177]">Anma sayfasında özel bir bölümde gösterilir. Kişinin hayatından bir söz veya veda mesajı.</p>
              <textarea value={lastMessage} onChange={e => setLastMessage(e.target.value)} disabled={isLocked ?? false} rows={4} placeholder="Sevdiklerime bıraktığım son mesaj..." className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Bağış Tercihi</label>
              <textarea value={donationPreference} onChange={e => setDonationPreference(e.target.value)} disabled={isLocked ?? false} rows={2} placeholder="Çiçek yerine lütfen bir hayır kurumuna bağış yapın..." className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Bağış URL</label>
              <input type="url" value={donationUrl} onChange={e => setDonationUrl(e.target.value)} disabled={isLocked ?? false} placeholder="https://... (bağış sayfası)" className={inputCls} />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={(isLocked ?? false) || extraSaving} className={saveBtnCls}>
                {extraSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              {extraSaved && <span className="flex items-center gap-1.5 text-xs font-medium text-[#174f35]">✓ Kaydedildi</span>}
            </div>
          </form>
        </div>

        {/* Hayat hikayesi */}
        <div className={`${blockCls} overflow-hidden`}>
          <div className={headerCls}>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#b08340]" />
              <div>
                <h2 className="font-semibold text-[#1f2d27]">Hayat Hikayesi</h2>
                <p className="mt-0.5 text-xs text-[#adb5ab]">
                  {words > 0 ? `${words} kelime · ${bio.length} karakter` : 'Henüz yazılmamış'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {bioSaving && (
                <span className="flex items-center gap-1.5 text-xs text-[#788177]">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#dfbd72]" />
                  Kaydediliyor
                </span>
              )}
              {bioSaved && <span className="flex items-center gap-1.5 text-xs font-medium text-[#174f35]">✓ Kaydedildi</span>}
              {bioDirty && !bioSaving && !isLocked && (
                <button onClick={() => saveBio(bio)} className="rounded-xl bg-[#174f35] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(23,79,53,0.18)] transition-colors hover:bg-[#123f2b]">
                  Kaydet
                </button>
              )}
            </div>
          </div>
          <textarea
            value={bio}
            onChange={e => handleBioChange(e.target.value)}
            disabled={isLocked ?? false}
            placeholder={`Doğduğu yer, büyüdüğü yıllar, sevdikleri, çalışma hayatı, hatırlanan anlar...\n\nBu alanda yazdıklarınız anma sayfasında 'Hayat Hikayesi' bölümünde görünür.`}
            rows={20}
            className="w-full resize-none bg-white px-6 py-5 text-sm leading-8 text-[#1f2d27] placeholder-[#c8bfb0] outline-none disabled:opacity-40"
          />
          <div className="flex items-center justify-between border-t border-[#e5dccb] px-6 py-3">
            <p className="text-xs text-[#adb5ab]">Değişiklikler 2 saniye sonra otomatik kaydedilir</p>
            {!isLocked && bioDirty && <p className="text-xs font-medium text-[#dfbd72]">Kaydedilmemiş değişiklik</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
