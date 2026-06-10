'use client'

import { useState } from 'react'
import { addAudioRecordingAction } from '@/lib/actions/audio'

interface Props {
  vaultId: string
  isLocked: boolean
}

export default function AudioUploadForm({ vaultId, isLocked }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    if (selected) {
      if (selected.size > 30 * 1024 * 1024) {
        setError('Her ses dosyası en fazla 30 MB olabilir.')
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
            category: 'audio_recording',
            profileId: vaultId,
            mimeType: file.type || 'audio/mpeg',
          }),
        })

        if (!presignRes.ok) {
          const resJson = await presignRes.json()
          throw new Error(resJson.error || 'Ses kaydı yükleme yetkisi alınamadı.')
        }

        const { uploadUrl, fileKey: generatedKey, bucket: targetBucket } = await presignRes.json()
        fileKey = generatedKey
        bucket = targetBucket
        originalFilename = file.name
        fileSize = file.size

        // 2. Upload file directly to R2
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('PUT', uploadUrl, true)
          xhr.setRequestHeader('Content-Type', file.type || 'audio/mpeg')

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
      formData.set('author', author)

      if (fileKey && bucket) {
        formData.set('file_key', fileKey)
        formData.set('bucket', bucket)
        formData.set('file_size', fileSize.toString())
        formData.set('original_filename', originalFilename)
      } else if (url) {
        formData.set('audio_url', url)
      } else {
        throw new Error('Lütfen bir ses dosyası seçin veya URL belirtin.')
      }

      await addAudioRecordingAction(vaultId, formData)

      // Clear states
      setFile(null)
      setTitle('')
      setAuthor('')
      setUrl('')
      const formEl = e.target as HTMLFormElement
      formEl.reset()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10 disabled:opacity-50`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`

  return (
    <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)]">
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#1f2d27]">
        <span>➕</span> Yeni Ses Kaydı Ekle
      </h2>

      <div className="mb-5 rounded-2xl border border-amber-500/10 bg-amber-500/[0.04] p-4 text-xs leading-relaxed text-[#7a6440]">
        <h3 className="font-bold mb-1">🎙️ Ses Seçimi İçin Tavsiyeler</h3>
        <p className="mb-2">Sevdiklerinizin kendi sesinden konuşmaları, vasiyetleri, okudukları şiirleri ya da onları anlatan kayıtları buraya ekleyin.</p>
        <span className="font-semibold">Her ses dosyası en fazla 30 MB olabilir. Desteklenen formatlar: MP3, M4A, WAV, WEBM.</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Başlık <span className="text-[#dfbd72]">*</span></label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sabah duası, Vasiyetim, ..."
            disabled={isLocked || loading}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Seslendiren</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Kendi sesinden, Kızı Zeynep anlatıyor..."
            disabled={isLocked || loading}
            className={inputCls}
          />
        </div>
        <div className="rounded-2xl border border-[#e5dccb] bg-white p-4 space-y-3">
          <div>
            <label className={labelCls}>Ses dosyası yükle</label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              disabled={isLocked || loading}
              className="w-full cursor-pointer rounded-xl border border-[#e5dccb] bg-white px-3 py-2.5 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium outline-none disabled:opacity-40"
            />
          </div>
          <p className="text-[11px] text-[#adb5ab] text-center">veya</p>
          <div>
            <label className={labelCls}>Ses URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://... (mp3, wav, ogg)"
              disabled={isLocked || loading || !!file}
              className={inputCls}
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#788177]">
              <span>Ses dosyası yükleniyor...</span>
              <span>%{progress}</span>
            </div>
            <div className="h-2 w-full bg-[#e5dccb] rounded-full overflow-hidden">
              <div className="h-full bg-[#174f35] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {!isLocked && (
          <button
            type="submit"
            disabled={loading || (!file && !url) || !title}
            className="w-full rounded-xl bg-[#174f35] py-3.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors disabled:opacity-50"
          >
            {loading ? 'Ses Kaydediliyor...' : 'Kaydet'}
          </button>
        )}
      </form>
    </div>
  )
}
