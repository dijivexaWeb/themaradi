'use client'

import { useState } from 'react'
import { addMemorialVideoAction } from '../actions'

interface Props {
  vaultId: string
  todayMax: string
}

export default function VideoUploadForm({ vaultId, todayMax }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [takenAt, setTakenAt] = useState('')
  const [visibility, setVisibility] = useState('private')
  const [caption, setCaption] = useState('')

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const checkVideoMetadata = (file: File): Promise<{ duration: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src)
        resolve({ duration: video.duration })
      }
      video.onerror = () => {
        URL.revokeObjectURL(video.src)
        reject(new Error('Video dosyası okunamadı veya biçimi desteklenmiyor.'))
      }
      video.src = URL.createObjectURL(file)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    if (!selected) {
      setFile(null)
      return
    }

    // Size limit check: 100 MB
    if (selected.size > 100 * 1024 * 1024) {
      setError('Video boyutu en fazla 100 MB olabilir.')
      setFile(null)
      return
    }

    const validExtensions = ['.mp4', '.mov', '.webm']
    const hasValidExt = validExtensions.some(ext => selected.name.toLowerCase().endsWith(ext))
    if (!hasValidExt) {
      setError('Lütfen MP4, MOV veya WEBM formatında bir video yükleyin.')
      setFile(null)
      return
    }

    setError(null)
    setFile(selected)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      let cfStreamId = ''
      let originalFilename = ''
      let fileSize = 0

      if (file) {
        let duration = 0
        try {
          const meta = await checkVideoMetadata(file)
          duration = meta.duration
        } catch (err: any) {
          throw new Error(err.message || 'Video meta verisi okunamadı.')
        }

        // Duration limit check: 10 minutes (600 seconds)
        if (duration > 600) {
          throw new Error('Video süresi en fazla 10 dakika olabilir.')
        }

        // 1. Request Direct Creator Upload URL
        const uploadUrlRes = await fetch('/api/stream/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
            profileId: vaultId,
            duration,
          }),
        })

        if (!uploadUrlRes.ok) {
          const resJson = await uploadUrlRes.json()
          throw new Error(resJson.error || 'Video yükleme bağlantısı alınamadı.')
        }

        const { uploadUrl, uid } = await uploadUrlRes.json()
        cfStreamId = uid
        originalFilename = file.name
        fileSize = file.size

        // 2. Upload to Cloudflare Stream
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', uploadUrl, true)

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const pct = Math.round((event.loaded / event.total) * 100)
              setProgress(pct)
            }
          }

          xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 201 || xhr.status === 204) {
              resolve()
            } else {
              reject(new Error(`Yükleme başarısız. Durum kodu: ${xhr.status}`))
            }
          }

          xhr.onerror = () => reject(new Error('Yükleme sırasında ağ hatası oluştu.'))

          const uploadForm = new FormData()
          uploadForm.append('file', file)
          xhr.send(uploadForm)
        })
      }

      // 3. Submit metadata to server action
      const formData = new FormData()
      formData.set('title', title)
      formData.set('taken_at', takenAt)
      formData.set('visibility', visibility)
      formData.set('caption', caption)

      if (cfStreamId) {
        formData.set('cf_stream_id', cfStreamId)
        formData.set('original_filename', originalFilename)
        formData.set('file_size', fileSize.toString())
      } else if (url) {
        formData.set('url', url)
      } else {
        throw new Error('Lütfen bir video dosyası seçin veya geçerli bir URL girin.')
      }

      await addMemorialVideoAction(vaultId, formData)

      // Reset
      setFile(null)
      setUrl('')
      setTitle('')
      setTakenAt('')
      setCaption('')
      const formEl = e.target as HTMLFormElement
      formEl.reset()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Video kaydedilirken hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10 disabled:opacity-50'
  const labelCls = 'mb-1.5 block text-xs font-semibold text-[#4a5e55]'

  return (
    <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)] mb-10">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">📤</span>
        <h2 className="font-semibold text-[#1f2d27]">Video Ekle</h2>
      </div>
      <p className="text-xs text-[#788177] mb-4 ml-7">YouTube / Vimeo linki veya video dosyası yükleme</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Dosya Yükle</label>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={handleFileChange}
              disabled={loading}
              className="w-full cursor-pointer rounded-xl border border-[#e5dccb] bg-white px-3 py-2.5 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className={labelCls}>veya Video URL (YouTube / Vimeo)</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              disabled={loading || !!file}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Başlık</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Doğum günü videosu"
              disabled={loading}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Tarih</label>
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
          <label className={labelCls}>Anlatım</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            placeholder="Bu videoda kimler var, hangi an anlatılıyor?"
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
              <span>Videonuz yükleniyor. Lütfen bu ekranı kapatmayın...</span>
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
          {loading ? 'Video Kaydediliyor...' : 'Videoyu Kaydet'}
        </button>
      </form>
    </div>
  )
}
