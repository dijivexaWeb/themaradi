'use client'

import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, User, Music, Heart, MapPin } from 'lucide-react'

interface VaultData {
  display_name: string
  biography: string | null
  status: string
  cover_photo_url: string | null
  birth_date: string | null
  death_date: string | null
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
}

export default function BiyografiPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = useMemo(() => createClient(), [])

  const [vault, setVault] = useState<VaultData | null>(null)

  // Profil
  const [displayName, setDisplayName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [deathDate, setDeathDate] = useState('')
  const [tagline, setTagline] = useState('')
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('')
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

  // Sevilen şarkı
  const [favSongTitle, setFavSongTitle] = useState('')
  const [favSongUrl, setFavSongUrl] = useState('')
  const [songSaving, setSongSaving] = useState(false)
  const [songSaved, setSongSaved] = useState(false)

  // Biyografi
  const [bio, setBio] = useState('')
  const [initialBio, setInitialBio] = useState('')
  const [bioSaving, setBioSaving] = useState(false)
  const [bioSaved, setBioSaved] = useState(false)
  const bioTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    supabase
      .from('vaults')
      .select('display_name, biography, status, cover_photo_url, birth_date, death_date, tagline, profession, hobbies, birth_place, death_place, favorite_song_title, favorite_song_url, last_message, donation_preference, donation_url, hero_bg_url')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          const v = data as VaultData
          setVault(v)
          setDisplayName(v.display_name ?? '')
          setBirthDate(v.birth_date ?? '')
          setDeathDate(v.death_date ?? '')
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
          setBio(v.biography ?? '')
          setInitialBio(v.biography ?? '')
        }
      })
  }, [id, supabase])

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
      death_date: deathDate || null,
      tagline: tagline.trim() || null,
      cover_photo_url: coverPhotoUrl.trim() || null,
      hero_bg_url: heroBgUrl.trim() || null,
    }).eq('id', id)
    setVault(prev => prev ? { ...prev, display_name: displayName, birth_date: birthDate || null, death_date: deathDate || null, tagline: tagline || null, cover_photo_url: coverPhotoUrl || null, hero_bg_url: heroBgUrl || null } : prev)
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
          <form onSubmit={handleSaveProfile} className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Ad Soyad *</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} disabled={isLocked ?? false} placeholder="Adnan Kahya" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Profil Fotoğrafı URL</label>
                <input type="url" value={coverPhotoUrl} onChange={e => setCoverPhotoUrl(e.target.value)} disabled={isLocked ?? false} placeholder="https://..." className={inputCls} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Doğum Tarihi</label>
                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} disabled={isLocked ?? false} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Vefat Tarihi</label>
                <input type="date" value={deathDate} onChange={e => setDeathDate(e.target.value)} disabled={isLocked ?? false} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Kısa Anı Sözü</label>
              <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} disabled={isLocked ?? false} placeholder="Kalbimizde yaşıyor... veya en sevdiği söz" maxLength={200} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Arka Plan Görseli URL (Hero)</label>
              <input type="url" value={heroBgUrl} onChange={e => setHeroBgUrl(e.target.value)} disabled={isLocked ?? false} placeholder="https://... (anma sayfasının hero bölümünde görünür)" className={inputCls} />
              <p className="mt-1 text-xs text-[#adb5ab]">Boş bırakılırsa profil fotoğrafı arka plan olarak kullanılır</p>
            </div>

            {coverPhotoUrl && (
              <div className="flex items-center gap-3 rounded-xl border border-[#e5dccb] bg-[#f9f5ec] p-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#dfbd72]">
                  <Image src={coverPhotoUrl} alt="Önizleme" fill className="object-cover" unoptimized />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-serif text-sm text-[#1f2d27]">{displayName}</p>
                  {tagline && <p className="mt-0.5 truncate text-xs italic text-[#7a7467]">&quot;{tagline}&quot;</p>}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button type="submit" disabled={isLocked ?? false} className={saveBtnCls}>
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
              <button type="submit" disabled={isLocked ?? false} className={saveBtnCls}>
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
            <p className="text-xs text-[#788177]">Anma sayfasında çalınan müzik. MP3/WAV URL veya SoundCloud/Spotify bağlantısı.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Şarkı Adı</label>
                <input type="text" value={favSongTitle} onChange={e => setFavSongTitle(e.target.value)} disabled={isLocked ?? false} placeholder="Ne olurdum sensiz..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Ses URL</label>
                <input type="url" value={favSongUrl} onChange={e => setFavSongUrl(e.target.value)} disabled={isLocked ?? false} placeholder="https://..." className={inputCls} />
              </div>
            </div>
            {favSongUrl && (
              <audio controls src={favSongUrl} className="h-9 w-full" />
            )}
            <div className="flex items-center gap-3">
              <button type="submit" disabled={isLocked ?? false} className={saveBtnCls}>
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
              <button type="submit" disabled={isLocked ?? false} className={saveBtnCls}>
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
