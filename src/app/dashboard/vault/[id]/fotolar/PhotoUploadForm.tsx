'use client'

import { useState } from 'react'
import { addPhotoAction } from '@/lib/actions/media'

interface Props {
  vaultId: string
  todayMax: string
}

export default function PhotoUploadForm({ vaultId, todayMax }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [takenAt, setTakenAt] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [caption, setCaption] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    if (selected) {
      if (selected.size > 8 * 1024 * 1024) {
        setError('Her fotoğraf en fazla 8 MB olabilir.')
        setFile(null)
      } else {
        setError(null)
        setFile(selected)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      let fileKey = ''
      let bucket = ''
      let originalFilename = ''
      let fileSize = 0

      if (file) {
        // 1. Get presigned upload URL
        const presignRes = await fetch('/api/r2/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
            category: 'gallery_image',
            profileId: vaultId,
            mimeType: file.type,
          }),
        })

        if (!presignRes.ok) {
          const resJson = await presignRes.json()
          throw new Error(resJson.error || 'Yükleme yetkisi alınamadı.')
        }

        const { uploadUrl, fileKey: generatedKey, bucket: targetBucket } = await presignRes.json()
        fileKey = generatedKey
        bucket = targetBucket
        originalFilename = file.name
        fileSize = file.size

        // 2. Upload file directly to R2 using XMLHttpRequest to track progress
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('PUT', uploadUrl, true)
          xhr.setRequestHeader('Content-Type', file.type)

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const pct = Math.round((event.loaded / event.total) * 100)
              setProgress(pct)
            }
          }

          xhr.onload = () => {
            if (xhr.status === 200) {
              resolve()
            } else {
              reject(new Error(`Yükleme başarısız oldu (Status: ${xhr.status})`))
            }
          }

          xhr.onerror = () => reject(new Error('Yükleme sırasında ağ hatası oluştu.'))
          xhr.send(file)
        })
      }

      // 3. Submit metadata to Server Action
      const formData = new FormData()
      formData.set('title', title)
      formData.set('taken_at', takenAt)
      formData.set('visibility', visibility)
      formData.set('caption', caption)
      
      if (fileKey && bucket) {
        formData.set('file_key', fileKey)
        formData.set('bucket', bucket)
        formData.set('file_size', fileSize.toString())
        formData.set('original_filename', originalFilename)
      } else if (url) {
        formData.set('url', url)
      } else {
        throw new Error('Lütfen bir dosya seçin veya URL belirtin.')
      }

      await addPhotoAction(vaultId, formData)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Bir hata oluştu.')
      setLoading(false)
    }
  }

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10 disabled:opacity-50`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`

  return (
    <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)] mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📸</span>
        <h2 className="font-semibold text-[#1f2d27]">Fotoğraf Ekle</h2>
      </div>

      <div className="mb-5 rounded-2xl border border-amber-500/10 bg-amber-500/[0.04] p-4 text-xs leading-relaxed text-[#7a6440]">
        <h3 className="font-bold mb-1">📸 Fotoğraf Seçimi İçin Tavsiyeler</h3>
        <p className="mb-2">Ziyaretçilerin fotoğrafları ekranda net görebilmesi için aydınlık, kaliteli ve yüzün belirgin olduğu fotoğrafları tercih edin.</p>
        <p className="mb-2 text-[#967d53]">Çok bulanık, karanlık veya düşük kaliteli fotoğraflar anı sayfasındaki görsel deneyimi zayıflatabilir.</p>
        <span className="font-semibold">Her fotoğraf en fazla 8 MB olabilir. Desteklenen formatlar: JPG, JPEG, PNG, WEBP.</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Dosya Yükle</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={loading}
              className="w-full cursor-pointer rounded-xl border border-[#e5dccb] bg-white px-3 py-2.5 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className={labelCls}>veya URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              disabled={loading || !!file}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Fotoğraf adı</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Piknik, 1985"
              disabled={loading}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Çekildiği tarih</label>
            <input
              type="datetime-local"
              value={takenAt}
              onChange={(e) => setTakenAt(e.target.value)}
              max={todayMax}
              disabled={loading}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Görünürlük</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] outline-none focus:border-[#174f35] disabled:opacity-50"
            >
              <option value="private">Gizli</option>
              <option value="public">Herkese açık</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Not</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            placeholder="Bu fotoğraf hakkında birkaç kelime..."
            disabled={loading}
            className={inputCls + ' resize-none'}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#788177]">
              <span>Yükleniyor...</span>
              <span>%{progress}</span>
            </div>
            <div className="h-2 w-full bg-[#e5dccb] rounded-full overflow-hidden">
              <div className="h-full bg-[#174f35] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (!file && !url)}
          className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors disabled:opacity-50"
        >
          {loading ? 'Fotoğraf Kaydediliyor...' : 'Fotoğrafı Kaydet'}
        </button>
      </form>
    </div>
  )
}
