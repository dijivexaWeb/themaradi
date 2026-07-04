'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Upload, Loader2, ArrowRight } from 'lucide-react'
import PartialDateInput from '@/components/PartialDateInput'
import SubmitButton from '@/components/SubmitButton'
import { saveOnboardingBasics } from './actions'

interface Props {
  vaultId: string
  displayName: string
  birthDate: string | null
  birthDatePrecision: string | null
  deathDate: string | null
  deathDatePrecision: string | null
  birthPlace: string | null
  tagline: string | null
  coverPhotoUrl: string | null
}

export default function BasicsForm(props: Props) {
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(props.coverPhotoUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const inputCls = 'w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10'
  const labelCls = 'mb-1.5 block text-xs font-semibold text-[#4a5e55]'

  const action = saveOnboardingBasics.bind(null, props.vaultId)

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="cover_photo_url" value={coverPhotoUrl} />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {/* Kapak fotoğrafı yükleme */}
        <div className="shrink-0">
          <label className={labelCls}>Kapak Fotoğrafı</label>
          <label className="group relative mx-auto flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-[3px] border-dashed border-[#e5dccb] bg-[#fdfaf5] transition hover:border-[#174f35]/50">
            {uploading ? (
              <Loader2 className="h-7 w-7 animate-spin text-[#174f35]" />
            ) : coverPhotoUrl ? (
              <>
                <Image src={coverPhotoUrl} alt="Kapak" fill className="object-cover" unoptimized />
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
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (!file.type.startsWith('image/')) { setUploadError('Sadece görsel yükleyebilirsiniz'); e.target.value = ''; return }
                if (file.size > 8 * 1024 * 1024) { setUploadError('Dosya çok büyük (max 8 MB)'); e.target.value = ''; return }
                setUploading(true)
                setUploadError(null)
                try {
                  const fd = new FormData()
                  fd.set('file', file)
                  fd.set('category', 'profile_photo')
                  fd.set('profileId', props.vaultId)
                  const res = await fetch('/api/r2/upload', { method: 'POST', body: fd })
                  if (!res.ok) {
                    const j = await res.json()
                    throw new Error(j.error || 'Yükleme başarısız.')
                  }
                  const { publicUrl } = await res.json()
                  setCoverPhotoUrl(publicUrl)
                } catch (err) {
                  setUploadError(err instanceof Error ? err.message : 'Yükleme sırasında hata oluştu.')
                } finally {
                  setUploading(false)
                  e.target.value = ''
                }
              }}
            />
          </label>
          {uploadError && <p className="mt-1 max-w-[112px] text-center text-[10px] text-red-500">{uploadError}</p>}
        </div>

        {/* Ad Soyad + Tarihler */}
        <div className="flex-1 space-y-4">
          <div>
            <label className={labelCls}>Vefat Eden Kişinin Adı Soyadı *</label>
            <input type="text" name="display_name" defaultValue={props.displayName} required placeholder="Ahmet Yılmaz" className={inputCls} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Doğum Tarihi</label>
              <PartialDateInput
                name="birth_date"
                defaultDate={props.birthDate}
                defaultPrecision={props.birthDatePrecision ?? 'day'}
                inputCls={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Vefat Tarihi</label>
              <PartialDateInput
                name="death_date"
                defaultDate={props.deathDate}
                defaultPrecision={props.deathDatePrecision ?? 'day'}
                inputCls={inputCls}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Şehir / Ülke</label>
        <input type="text" name="birth_place" defaultValue={props.birthPlace ?? ''} placeholder="İstanbul, Türkiye" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Kısa Açıklama</label>
        <input type="text" name="tagline" defaultValue={props.tagline ?? ''} placeholder="Sevgi dolu bir baba, sadık bir dost" maxLength={120} className={inputCls} />
      </div>

      <SubmitButton
        pendingLabel="Kaydediliyor..."
        className="inline-flex items-center gap-2 rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(23,79,53,0.18)] transition-colors hover:bg-[#123f2b] disabled:opacity-50"
      >
        İleri: Fotoğraflar
        <ArrowRight className="h-4 w-4 inline ml-1" />
      </SubmitButton>
    </form>
  )
}
