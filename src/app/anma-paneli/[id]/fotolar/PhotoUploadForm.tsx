'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addMemorialPhotoAction } from '../actions'

interface Props {
  vaultId: string
  todayMax: string
}

export default function PhotoUploadForm({ vaultId, todayMax }: Props) {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [takenAt, setTakenAt] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [caption, setCaption] = useState('')

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)    // current file upload %
  const [current, setCurrent] = useState(0)       // index of file being uploaded
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    const errors: string[] = []
    const valid = selected.filter(f => {
      if (!f.type.startsWith('image/')) { errors.push(`${f.name}: görsel dosyası değil`); return false }
      if (f.size > 8 * 1024 * 1024) { errors.push(`${f.name}: 8 MB sınırını aşıyor`); return false }
      return true
    })
    setError(errors.length ? errors.join(' / ') : null)
    setFiles(valid)
    setDone(false)
  }

  async function uploadOne(file: File, idx: number): Promise<void> {
    setCurrent(idx + 1)
    setProgress(0)

    const presignRes = await fetch('/api/r2/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        category: 'gallery_image',
        profileId: vaultId,
        mimeType: file.type || 'image/jpeg',
      }),
    })
    if (!presignRes.ok) {
      const j = await presignRes.json()
      throw new Error(j.error || 'Presign hatası.')
    }
    const { uploadUrl, fileKey, bucket } = await presignRes.json()

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', uploadUrl, true)
      xhr.setRequestHeader('Content-Type', file.type || 'image/jpeg')
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100))
      }
      xhr.onload = () => xhr.status === 200 ? resolve() : reject(new Error(`Yükleme hatası (${xhr.status})`))
      xhr.onerror = () => reject(new Error('Ağ hatası.'))
      xhr.send(file)
    })

    const formData = new FormData()
    formData.set('title', files.length > 1 ? '' : title)
    formData.set('taken_at', takenAt)
    formData.set('visibility', visibility)
    formData.set('caption', files.length > 1 ? '' : caption)
    formData.set('file_key', fileKey)
    formData.set('bucket', bucket)
    formData.set('file_name', file.name)
    formData.set('file_size', file.size.toString())
    formData.set('mime_type', file.type || 'image/jpeg')
    const result = await addMemorialPhotoAction(vaultId, formData)
    if (result?.error === 'auth') { router.push('/login'); return }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (files.length === 0 && !url) {
      setError('Lütfen en az bir fotoğraf seçin veya URL girin.')
      return
    }
    setLoading(true)
    setError(null)
    setDone(false)

    try {
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          await uploadOne(files[i], i)
        }
      } else {
        // URL mode
        const formData = new FormData()
        formData.set('title', title)
        formData.set('taken_at', takenAt)
        formData.set('visibility', visibility)
        formData.set('caption', caption)
        formData.set('url', url)
        const result = await addMemorialPhotoAction(vaultId, formData)
        if (result?.error === 'auth') { router.push('/login'); return }
      }

      setFiles([])
      setUrl('')
      setTitle('')
      setTakenAt('')
      setCaption('')
      setDone(true)
      router.refresh()
      const formEl = e.target as HTMLFormElement
      formEl.reset()
    } catch (err: any) {
      setError(err.message || 'Fotoğraf kaydedilirken hata oluştu.')
    } finally {
      setLoading(false)
      setProgress(0)
      setCurrent(0)
    }
  }

  const inputCls = 'w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10 disabled:opacity-50'
  const labelCls = 'mb-1.5 block text-xs font-semibold text-[#4a5e55]'
  const multi = files.length > 1

  return (
    <div className="mb-10 rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)]">
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#1f2d27]">
        <span>📤</span> Fotoğraf Ekle
      </h2>

      {done && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-[#c7e4c7] bg-[#e9f5ec] px-4 py-3 text-sm font-medium text-[#174f35]">
          ✓ Fotoğraf{files.length > 1 ? 'lar' : ''} başarıyla yüklendi.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Fotoğraf Seç <span className="font-normal text-[#adb5ab]">(birden fazla seçebilirsiniz)</span></label>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={loading}
              onChange={handleFileChange}
              className="w-full cursor-pointer rounded-xl border border-[#e5dccb] bg-white px-3 py-2.5 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:font-medium file:text-[#174f35] outline-none disabled:opacity-50"
            />
            {files.length > 0 && (
              <p className="mt-1 text-xs text-[#788177]">
                {files.length} fotoğraf seçildi ({(files.reduce((s, f) => s + f.size, 0) / 1024 / 1024).toFixed(1)} MB toplam)
              </p>
            )}
          </div>
          <div>
            <label className={labelCls}>veya URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading || files.length > 0}
              placeholder="https://..."
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {!multi && (
            <div>
              <label className={labelCls}>Fotoğraf Adı</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                placeholder="Piknik, 1985"
                className={inputCls}
              />
            </div>
          )}
          <div className={multi ? 'sm:col-span-2' : ''}>
            <label className={labelCls}>Çekildiği Tarih</label>
            <input
              type="datetime-local"
              value={takenAt}
              onChange={(e) => setTakenAt(e.target.value)}
              disabled={loading}
              max={todayMax}
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

        {!multi && (
          <div>
            <label className={labelCls}>Not</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={loading}
              rows={2}
              placeholder="Bu fotoğraf hakkında birkaç kelime..."
              className={`${inputCls} resize-none`}
            />
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#788177]">
              <span>
                {files.length > 1
                  ? `${current} / ${files.length} fotoğraf yükleniyor...`
                  : 'Fotoğraf yükleniyor...'}
              </span>
              <span>%{progress}</span>
            </div>
            <div className="h-2 w-full bg-[#e5dccb] rounded-full overflow-hidden">
              <div className="h-full bg-[#174f35] transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (files.length === 0 && !url)}
          className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors disabled:opacity-50"
        >
          {loading
            ? (files.length > 1 ? `Yükleniyor ${current}/${files.length}...` : 'Kaydediliyor...')
            : (files.length > 1 ? `${files.length} Fotoğrafı Yükle` : 'Fotoğrafı Kaydet')}
        </button>
      </form>
    </div>
  )
}
