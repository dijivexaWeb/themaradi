'use client'

import { useState } from 'react'
import { Upload, Loader2, AlertCircle } from 'lucide-react'
import Image from 'next/image'

interface Props {
  name: string
  category: string
  profileId: string
  defaultUrl?: string | null
  className?: string
  disabled?: boolean
}

export default function R2ImageUpload({
  name,
  category,
  profileId,
  defaultUrl,
  className,
  disabled = false,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultUrl || null)
  const [error, setError] = useState<string | null>(null)
  
  const [fileKey, setFileKey] = useState('')
  const [bucket, setBucket] = useState('')
  const [originalName, setOriginalName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [mimeType, setMimeType] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Sadece görsel dosyaları yükleyebilirsiniz.')
      return
    }

    // 8 MB limit for gallery and profile assets
    if (file.size > 8 * 1024 * 1024) {
      setError('Fotoğraf boyutu en fazla 8 MB olmalıdır.')
      return
    }

    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      // 1. Get presigned upload URL
      const presignRes = await fetch('/api/r2/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          category,
          profileId,
          mimeType: file.type || 'image/jpeg',
        }),
      })

      if (!presignRes.ok) {
        const resJson = await presignRes.json()
        throw new Error(resJson.error || 'Yükleme yetkisi alınamadı.')
      }

      const presignData = await presignRes.json()

      // 2. Upload directly to Cloudflare R2
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', presignData.uploadUrl, true)
        xhr.setRequestHeader('Content-Type', file.type || 'image/jpeg')

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

        xhr.onerror = () => reject(new Error('Ağ hatası oluştu.'))
        xhr.send(file)
      })

      setFileKey(presignData.fileKey)
      setBucket(presignData.bucket)
      setOriginalName(file.name)
      setFileSize(file.size)
      setMimeType(file.type || 'image/jpeg')
      setPreviewUrl(presignData.publicUrl)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Fotoğraf yüklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* Hidden inputs to feed the parent form's Server Action */}
      {fileKey && (
        <>
          <input type="hidden" name="file_key" value={fileKey} />
          <input type="hidden" name="bucket" value={bucket} />
          <input type="hidden" name="file_name" value={originalName} />
          <input type="hidden" name="file_size" value={fileSize.toString()} />
          <input type="hidden" name="mime_type" value={mimeType} />
        </>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Preview image */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Önizleme"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="text-xl opacity-35">👤</span>
          )}
        </div>

        {/* Upload Control */}
        <div className="flex-1 w-full space-y-1">
          {loading ? (
            <div className="space-y-1.5 w-full">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span className="flex items-center gap-1.5 font-medium">
                  <Loader2 className="h-3 w-3 animate-spin text-[#c7a76f]" />
                  Görsel R2'ye yükleniyor...
                </span>
                <span>%{progress}</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#c7a76f] transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <label className={`flex items-center justify-center gap-2 cursor-pointer rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-[#efe7d8] hover:border-[#c7a76f]/50 hover:bg-white/10 transition-all ${disabled ? 'pointer-events-none opacity-40' : ''}`}>
              <Upload className="h-4 w-4 text-[#c7a76f]" />
              <span className="font-semibold text-xs">Fotoğraf Yükle</span>
              <input
                type="file"
                accept="image/*"
                disabled={disabled}
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          )}
          <p className="text-[10px] text-white/40">Görsel dosyaları (JPEG, PNG, WEBP) — max 8 MB</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg p-2.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
