'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { BookHeart, Camera, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { submitMemoryAction } from '@/lib/actions/memory'

interface Memory {
  id: string
  author_name: string
  relation: string | null
  memory_text: string
  photo_url: string | null
  created_at: string
}

interface Texts {
  guestbook: string
  sharedMemories: string
  shareMemory: string
  shareYourMemory: string
  memoriesModeratedNote: string
  memorySubmitted: string
  fullName: string
  yourRelation: string
  relationPlaceholder: string
  memoryLabel: string
  memoryPlaceholder: string
  photoOptionalLabel: string
  addPhoto: string
  emailOptional: string
  uploadingLabel: string
  submittingLabel: string
  submitLabel: string
  noSharedMemories: string
  beFirstToShare: string
  requiredError: string
  photoError: string
  photoUploadError: string
}

interface Props {
  vaultId: string
  initialMemories: Memory[]
  texts: Texts
  lang: string
}

export default function MemoryBookClient({ vaultId, initialMemories, texts, lang }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    author_name: '',
    relation: '',
    memory_text: '',
    author_email: '',
  })

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError(texts.photoError)
      return
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setError(null)
  }

  function removePhoto() {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!form.author_name.trim() || !form.memory_text.trim()) {
      setError(texts.requiredError)
      return
    }

    setSubmitting(true)
    let photo_url: string | undefined

    let fileKey = ''
    let bucket = ''

    if (photoFile) {
      setUploadProgress(true)
      try {
        const presignRes = await fetch('/api/r2/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: photoFile.name,
            fileSize: photoFile.size,
            category: 'gallery_image',
            profileId: vaultId,
            mimeType: photoFile.type || 'image/jpeg',
          }),
        })

        if (!presignRes.ok) {
          const resJson = await presignRes.json()
          throw new Error(resJson.error || 'Yükleme izni alınamadı.')
        }

        const presignData = await presignRes.json()
        fileKey = presignData.fileKey
        bucket = presignData.bucket
        photo_url = presignData.publicUrl

        const uploadRes = await fetch(presignData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': photoFile.type || 'image/jpeg' },
          body: photoFile,
        })

        if (!uploadRes.ok) {
          throw new Error('Dosya R2\'ye yüklenemedi.')
        }
      } catch (err: any) {
        console.error(err)
        setError(texts.photoUploadError)
        setSubmitting(false)
        setUploadProgress(false)
        return
      }
      setUploadProgress(false)
    }

    const result = await submitMemoryAction(vaultId, {
      author_name: form.author_name,
      relation: form.relation || undefined,
      memory_text: form.memory_text,
      photo_url,
      file_key: fileKey || undefined,
      bucket: bucket || undefined,
      author_email: form.author_email || undefined,
    })

    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSubmitted(true)
    setShowForm(false)
    setForm({ author_name: '', relation: '', memory_text: '', author_email: '' })
    removePhoto()
  }

  return (
    <section id="ani-defteri" className="px-5 py-16 sm:px-8 bg-[#f7f2e9]">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3 text-[#b08340]">
              <span className="h-px w-10 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.2em] uppercase">{texts.guestbook}</span>
            </div>
            <h2 className="mt-3 font-serif text-5xl text-[#173d31]">{texts.sharedMemories}</h2>
          </div>
          <button
            type="button"
            onClick={() => { setShowForm(v => !v); setSubmitted(false); setError(null) }}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[#174f35] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123f2b]"
          >
            <BookHeart className="h-4 w-4" />
            {texts.shareMemory}
            {showForm ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Success banner */}
        {submitted && (
          <div className="mb-6 rounded-xl border border-[#c7e4c7] bg-[#e9f5ec] p-4 text-sm font-medium text-[#174f35]">
            {texts.memorySubmitted}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-10 overflow-hidden rounded-2xl border border-[#e1d5c3] bg-white shadow-lg shadow-[#4d3d26]/6"
          >
            <div className="border-b border-[#e1d5c3] bg-[#fffdf8] px-6 py-4">
              <h3 className="font-serif text-lg text-[#173d31]">{texts.shareYourMemory}</h3>
              <p className="mt-0.5 text-xs text-[#8a7a64]">{texts.memoriesModeratedNote}</p>
            </div>
            <div className="space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#4a5e55]">{texts.fullName} *</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={form.author_name}
                    onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
                    className="w-full rounded-xl border border-[#e1d5c3] bg-[#fafaf6] px-4 py-2.5 text-sm text-[#173d31] outline-none focus:border-[#c7a76f] focus:ring-2 focus:ring-[#c7a76f]/15"
                    placeholder="Adınız"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#4a5e55]">{texts.yourRelation}</label>
                  <input
                    type="text"
                    maxLength={80}
                    value={form.relation}
                    onChange={e => setForm(f => ({ ...f, relation: e.target.value }))}
                    className="w-full rounded-xl border border-[#e1d5c3] bg-[#fafaf6] px-4 py-2.5 text-sm text-[#173d31] outline-none focus:border-[#c7a76f] focus:ring-2 focus:ring-[#c7a76f]/15"
                    placeholder={texts.relationPlaceholder}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#4a5e55]">
                  {texts.memoryLabel} *
                  <span className="ml-2 font-normal text-[#adb5ab]">{form.memory_text.length}/1500</span>
                </label>
                <textarea
                  required
                  maxLength={1500}
                  rows={5}
                  value={form.memory_text}
                  onChange={e => setForm(f => ({ ...f, memory_text: e.target.value }))}
                  className="w-full resize-none rounded-xl border border-[#e1d5c3] bg-[#fafaf6] px-4 py-2.5 text-sm text-[#173d31] outline-none focus:border-[#c7a76f] focus:ring-2 focus:ring-[#c7a76f]/15"
                  placeholder={texts.memoryPlaceholder}
                />
              </div>

              {/* Photo upload */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#4a5e55]">
                  {texts.photoOptionalLabel}
                </label>
                {photoPreview ? (
                  <div className="relative inline-block">
                    <Image
                      src={photoPreview}
                      alt="Fotoğraf önizleme"
                      width={120}
                      height={120}
                      className="h-28 w-28 rounded-xl object-cover border border-[#e1d5c3]"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#c7a76f]/40 bg-[#fdfaf4] px-4 py-3 text-sm text-[#8a7a64] transition hover:border-[#c7a76f]/70 hover:bg-[#faf5eb]">
                    <Camera className="h-5 w-5 text-[#c7a76f]" />
                    {texts.addPhoto}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#4a5e55]">{texts.emailOptional}</label>
                <input
                  type="email"
                  value={form.author_email}
                  onChange={e => setForm(f => ({ ...f, author_email: e.target.value }))}
                  className="w-full rounded-xl border border-[#e1d5c3] bg-[#fafaf6] px-4 py-2.5 text-sm text-[#173d31] outline-none focus:border-[#c7a76f] focus:ring-2 focus:ring-[#c7a76f]/15"
                  placeholder="ornek@email.com"
                />
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-600">{error}</p>
              )}

              <div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-[11px] text-[#adb5ab]">{texts.memoriesModeratedNote}</p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-[#174f35] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123f2b] disabled:opacity-60"
                >
                  {(submitting || uploadProgress) && <Loader2 className="h-4 w-4 animate-spin" />}
                  {uploadProgress ? texts.uploadingLabel : submitting ? texts.submittingLabel : texts.submitLabel}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Approved memories grid */}
        {initialMemories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e1d5c3] bg-white py-14 text-center">
            <div className="mb-3 text-4xl">📖</div>
            <p className="font-serif text-lg text-[#8a7a64]">{texts.noSharedMemories}</p>
            <p className="mt-1 text-sm text-[#adb5ab]">{texts.beFirstToShare}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {initialMemories.map((mem) => (
              <div
                key={mem.id}
                className="overflow-hidden rounded-2xl border border-[#e1d5c3] bg-white shadow-sm shadow-[#4d3d26]/5 transition hover:shadow-md hover:shadow-[#4d3d26]/8"
              >
                <div className="flex gap-4 p-5 sm:p-6">
                  {mem.photo_url && (
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#e1d5c3] bg-[#f4eee3] sm:h-28 sm:w-28">
                      <Image
                        src={mem.photo_url}
                        alt={`${mem.author_name} anısı`}
                        fill
                        sizes="112px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4eee3] text-sm font-semibold text-[#b08340]">
                            {mem.author_name[0]?.toUpperCase() ?? '?'}
                          </div>
                          <span className="font-serif text-base text-[#173d31]">{mem.author_name}</span>
                          {mem.relation && (
                            <span className="rounded-full border border-[#c7a76f]/30 bg-[#fdf7ed] px-2 py-0.5 text-[11px] text-[#b08340]">
                              {mem.relation}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-[11px] text-[#adb5ab]">
                        {new Date(mem.created_at).toLocaleDateString(lang, {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-sm leading-7 text-[#4a5e55] sm:text-base">{mem.memory_text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
