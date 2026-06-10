'use client'

import { useState } from 'react'
import { uploadDocumentsAction } from '@/lib/actions/documents'

interface Props {
  vaultId: string
  categories: Record<string, { label: string; icon: string }>
  defaultCategory?: string
}

export default function DocumentUploadForm({ vaultId, categories, defaultCategory }: Props) {
  const [files, setFiles] = useState<FileList | null>(null)
  const [category, setCategory] = useState(defaultCategory || 'other')
  const [description, setDescription] = useState('')

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      // Validate all files size <= 15 MB
      const isTooBig = Array.from(selectedFiles).some(f => f.size > 15 * 1024 * 1024)
      if (isTooBig) {
        setError('Belge boyutu en fazla 15 MB olmalıdır.')
        setFiles(null)
      } else {
        setError(null)
        setFiles(selectedFiles)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files || files.length === 0) return

    setLoading(true)
    setError(null)
    setProgress({})

    try {
      const uploadedFilesList: Array<{
        fileKey: string
        fileName: string
        fileSize: number
        mimeType: string
        bucket: string
      }> = []

      // Upload each file one by one
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Initialize progress for this file
        setProgress(prev => ({ ...prev, [file.name]: 0 }))

        // 1. Get presigned upload URL (for private documents)
        const presignRes = await fetch('/api/r2/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
            category: 'verification_document', // Private documents category mapping
            profileId: vaultId,
            mimeType: file.type || 'application/octet-stream',
          }),
        })

        if (!presignRes.ok) {
          const resJson = await presignRes.json()
          throw new Error(resJson.error || `[${file.name}] yükleme yetkisi alınamadı.`)
        }

        const { uploadUrl, fileKey, bucket } = await presignRes.json()

        // 2. Upload file directly to R2 private bucket
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('PUT', uploadUrl, true)
          xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const pct = Math.round((event.loaded / event.total) * 100)
              setProgress(prev => ({ ...prev, [file.name]: pct }))
            }
          }

          xhr.onload = () => {
            if (xhr.status === 200) {
              resolve()
            } else {
              reject(new Error(`[${file.name}] R2 yüklemesi başarısız oldu (Status: ${xhr.status})`))
            }
          }

          xhr.onerror = () => reject(new Error(`[${file.name}] yüklenirken ağ hatası oluştu.`))
          xhr.send(file)
        })

        uploadedFilesList.push({
          fileKey,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          bucket,
        })
      }

      // 3. Submit metadata to Server Action
      const formData = new FormData()
      formData.set('category', category)
      formData.set('description', description)
      formData.set('uploaded_files', JSON.stringify(uploadedFilesList))

      await uploadDocumentsAction(vaultId, formData)
      
      // Clear states
      setFiles(null)
      setDescription('')
      // Reset input element
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
    <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)] mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📤</span>
        <h2 className="font-semibold text-[#1f2d27]">Belge Yükle</h2>
      </div>

      <div className="mb-5 rounded-2xl border border-amber-500/10 bg-amber-500/[0.04] p-4 text-xs leading-relaxed text-[#7a6440]">
        <h3 className="font-bold mb-1">🛡️ Belge & Dekont Yükle</h3>
        <p className="mb-2">Bu dosyalar herkese açık görünmez. Sadece doğrulama ve ödeme kontrolü için admin tarafından incelenir.</p>
        <span className="font-semibold">PDF, JPG, PNG veya WEBP formatında dosya yükleyebilirsiniz. Maksimum dosya boyutu 15 MB olmalıdır.</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Dosya Seç <span className="text-[#dfbd72]">*</span></label>
          <input
            type="file"
            multiple
            required
            onChange={handleFileChange}
            disabled={loading}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.webp,.heic"
            className="w-full cursor-pointer rounded-xl border border-[#e5dccb] bg-white px-3 py-3 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium outline-none disabled:opacity-50"
          />
          <p className="mt-1.5 text-xs text-[#adb5ab]">Birden fazla dosya seçilebilir.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {!defaultCategory && (
            <div>
              <label className={labelCls}>Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] outline-none focus:border-[#174f35] disabled:opacity-50"
              >
                {Object.entries(categories).map(([val, { label, icon }]) => (
                  <option key={val} value={val}>{icon} {label}</option>
                ))}
              </select>
            </div>
          )}
          <div className={defaultCategory ? "col-span-2" : ""}>
            <label className={labelCls}>Açıklama (opsiyonel)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kısa bir not..."
              disabled={loading}
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
          <div className="space-y-2 max-h-40 overflow-y-auto border border-[#e5dccb] rounded-xl p-3 bg-white">
            <p className="text-xs font-semibold text-[#1f2d27] mb-1">Dosyalar Yükleniyor...</p>
            {Object.entries(progress).map(([name, pct]) => (
              <div key={name} className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#788177]">
                  <span className="truncate max-w-[80%]">{name}</span>
                  <span>%{pct}</span>
                </div>
                <div className="h-1 w-full bg-[#e5dccb] rounded-full overflow-hidden">
                  <div className="h-full bg-[#174f35] transition-all duration-300" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !files || files.length === 0}
          className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors disabled:opacity-50"
        >
          {loading ? 'Belgeler Yükleniyor...' : 'Belgeleri Yükle'}
        </button>
      </form>
    </div>
  )
}
