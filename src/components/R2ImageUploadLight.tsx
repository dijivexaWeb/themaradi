'use client'

import { useState } from 'react'
import { Upload, Loader2, AlertCircle, X } from 'lucide-react'
import Image from 'next/image'
import { useLang } from '@/i18n/context'

interface Props {
  name: string
  category: string
  profileId: string
  defaultUrl?: string | null
  disabled?: boolean
}

export default function R2ImageUploadLight({ name, category, profileId, defaultUrl, disabled = false }: Props) {
  const { t } = useLang()
  const u = t.r2Upload

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultUrl || null)
  const [error, setError] = useState<string | null>(null)
  const [fileKey, setFileKey] = useState('')
  const [bucket, setBucket] = useState('')

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError(u.errorImageOnly); return }
    if (file.size > 8 * 1024 * 1024) { setError(u.errorSizeLimit); return }

    setLoading(true); setError(null); setProgress(0)

    try {
      const { fk, bk, publicUrl } = await new Promise<{ fk: string; bk: string; publicUrl: string }>((resolve, reject) => {
        const fd = new FormData()
        fd.set('file', file)
        fd.set('category', category)
        fd.set('profileId', profileId)

        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/r2/upload', true)
        xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setProgress(Math.round(ev.loaded / ev.total * 100)) }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const d = JSON.parse(xhr.responseText)
              resolve({ fk: d.fileKey ?? '', bk: d.bucket ?? '', publicUrl: d.publicUrl ?? '' })
            } catch { reject(new Error(u.errorParseResponse)) }
          } else {
            try { reject(new Error(JSON.parse(xhr.responseText).error || `${u.errorGeneric} (${xhr.status})`)) }
            catch { reject(new Error(`${u.errorGeneric} (${xhr.status})`)) }
          }
        }
        xhr.onerror = () => reject(new Error(u.errorConnection))
        xhr.send(fd)
      })

      setFileKey(fk); setBucket(bk); setPreviewUrl(publicUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : u.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {fileKey && (
        <>
          <input type="hidden" name="file_key" value={fileKey} />
          <input type="hidden" name="bucket" value={bucket} />
        </>
      )}

      {previewUrl ? (
        <div className="relative inline-block">
          <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-[#e5dccb]">
            <Image src={previewUrl} alt="" fill className="object-cover" unoptimized />
          </div>
          <button type="button" onClick={() => { setPreviewUrl(null); setFileKey(''); setBucket('') }}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <label className={`flex cursor-pointer items-center gap-2 rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#4a5e55] hover:border-[#174f35]/40 hover:bg-[#f9f5ee] transition-all ${disabled ? 'pointer-events-none opacity-40' : ''}`}>
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin text-[#174f35]" /><span className="text-xs font-medium">{u.uploading.replace('%{p}', String(progress))}</span></>
          ) : (
            <><Upload className="h-4 w-4 text-[#174f35]" /><span className="text-xs font-semibold">{u.uploadBtn}</span><span className="ml-auto text-[10px] text-[#adb5ab]">{u.sizeHint}</span></>
          )}
          <input type="file" name={name} accept="image/*" disabled={disabled || loading} onChange={handleFile} className="sr-only" />
        </label>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
        </div>
      )}
    </div>
  )
}
