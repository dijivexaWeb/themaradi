'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addMemorialAudioAction } from '../actions'

interface Props {
  vaultId: string
  isLocked: boolean
}

export default function AudioUploadForm({ vaultId, isLocked }: Props) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    if (!selected) {
      setFile(null)
      return
    }

    // Size limit check: 30 MB
    if (selected.size > 30 * 1024 * 1024) {
      setError('Ses dosyası boyutu en fazla 30 MB olmalıdır.')
      setFile(null)
      return
    }

    if (!selected.type.startsWith('audio/')) {
      setError('Sadece ses dosyaları (.mp3, .wav, .m4a vb.) yükleyebilirsiniz.')
      setFile(null)
      return
    }

    setError(null)
    setFile(selected)
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Başlık zorunludur.')
      return
    }

    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      let fileKey = ''
      let bucket = ''
      let originalFilename = ''
      let fileSize = 0
      let mimeType = ''

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
          throw new Error(resJson.error || 'Ses dosyası yükleme yetkisi alınamadı.')
        }

        const presignData = await presignRes.json()
        fileKey = presignData.fileKey
        bucket = presignData.bucket
        originalFilename = file.name
        fileSize = file.size
        mimeType = file.type || 'audio/mpeg'

        // 2. Upload file directly to R2 public bucket
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('PUT', presignData.uploadUrl, true)
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

          xhr.onerror = () => reject(new Error('Yüklenirken ağ hatası oluştu.'))
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
        formData.set('file_name', originalFilename)
        formData.set('file_size', fileSize.toString())
        formData.set('mime_type', mimeType)
      } else if (url) {
        formData.set('audio_url', url)
      } else {
        throw new Error('Lütfen bir ses dosyası seçin veya geçerli bir URL girin.')
      }

      const result = await addMemorialAudioAction(vaultId, formData)
      if (result?.error === 'auth') {
        router.push('/login')
        return
      }

      setFile(null)
      setUrl('')
      setTitle('')
      setAuthor('')
      const formEl = e.target as HTMLFormElement
      formEl.reset()
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Ses kaydı kaydedilirken hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10 disabled:opacity-50'
  const labelCls = 'mb-1.5 block text-xs font-semibold text-[#4a5e55]'

  return (
    <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)]">
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#1f2d27]">
        <span>➕</span> Yeni Ses Kaydı Ekle
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Başlık <span className="text-[#dfbd72]">*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Sabah duası, Son mesajı, Şiir okuması..."
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
              disabled={isLocked || loading}
              onChange={handleFileChange}
              className="w-full cursor-pointer rounded-xl border border-[#e5dccb] bg-white px-3 py-2.5 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium outline-none disabled:opacity-40"
            />
          </div>
          <p className="text-[11px] text-[#adb5ab]">veya</p>
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
              <span>Ses dosyası R2'ye yükleniyor. Lütfen bu ekranı kapatmayın...</span>
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
            disabled={loading || (!file && !url)}
            className="w-full rounded-xl bg-[#174f35] py-3.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Yükleniyor...' : 'Kaydet'}
          </button>
        )}
      </form>
    </div>
  )
}
