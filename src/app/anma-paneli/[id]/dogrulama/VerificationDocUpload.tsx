'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { uploadVerificationDocAction } from '../actions'

interface Props {
  vaultId: string
}

export default function VerificationDocUpload({ vaultId }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 20 MB
    if (file.size > 20 * 1024 * 1024) {
      setError('Belge boyutu en fazla 20 MB olmalıdır.')
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
          category: 'death_certificate', // R2 folder & category selection
          profileId: vaultId,
          mimeType: file.type || 'application/octet-stream',
        }),
      })

      if (!presignRes.ok) {
        const resJson = await presignRes.json()
        throw new Error(resJson.error || 'Yükleme izni alınamadı.')
      }

      const { uploadUrl, fileKey, bucket } = await presignRes.json()
      console.log('[DocUpload] uploadUrl host:', new URL(uploadUrl).hostname)

      // 2. Upload directly to Cloudflare R2
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', uploadUrl, true)
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const pct = Math.round((event.loaded / event.total) * 100)
            setProgress(pct)
          }
        }

        xhr.onload = () => {
          console.log('[DocUpload] xhr.status:', xhr.status)
          if (xhr.status === 200) {
            resolve()
          } else {
            reject(new Error(`Yükleme başarısız (Status: ${xhr.status})`))
          }
        }

        xhr.onerror = () => {
          console.error('[DocUpload] xhr.onerror — status:', xhr.status, 'readyState:', xhr.readyState)
          reject(new Error('Ağ hatası oluştu.'))
        }
        xhr.send(file)
      })

      // 3. Call Server Action to register metadata
      const formData = new FormData()
      formData.set('file_key', fileKey)
      formData.set('bucket', bucket)
      formData.set('file_name', file.name)
      formData.set('file_size', file.size.toString())
      formData.set('mime_type', file.type || 'application/octet-stream')

      await uploadVerificationDocAction(vaultId, formData)
    } catch (err: any) {
      console.error('[VerificationDocUpload] error:', err)
      setError(err.message || 'Yükleme sırasında bir hata oluştu.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#e5dccb] bg-white px-5 py-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="animate-spin text-lg">⏳</span>
            <span className="text-sm font-semibold text-[#1f2d27]">Belge R2'ye yükleniyor... %{progress}</span>
          </div>
          <div className="h-1.5 w-full bg-[#e5dccb] rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-[#174f35] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[#e5dccb] bg-white px-5 py-8 text-center hover:border-[#174f35]/40 hover:bg-[#f9f5ec] transition-all">
          <Upload className="h-6 w-6 text-[#c7a76f]" />
          <span className="text-sm font-medium text-[#1f2d27]">Belge seçin veya sürükleyin</span>
          <span className="text-xs text-[#adb5ab]">PDF, JPG, PNG — maks. 20 MB</span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  )
}
