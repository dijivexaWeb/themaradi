'use client'

import { useRef, useState, useTransition } from 'react'
import { addOwnerMemoryAction } from '@/lib/actions/memory'
import R2ImageUpload from '@/components/R2ImageUpload'

interface Props {
  vaultId: string
  vaultName: string
}

export default function AddOwnerMemoryForm({ vaultId, vaultName }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const action = addOwnerMemoryAction.bind(null, vaultId)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await action(fd)
        setSuccess(true)
        formRef.current?.reset()
        setTimeout(() => { setSuccess(false); setOpen(false) }, 2000)
      } catch {
        setError('Kaydedilirken bir hata oluştu.')
      }
    })
  }

  const inputCls = 'w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10'
  const labelCls = 'mb-1.5 block text-xs font-semibold text-[#4a5e55]'

  return (
    <div className="mb-8 rounded-2xl border border-[#e5dccb] bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#fffdf8] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#174f35]/10 text-sm">✍️</span>
          <div>
            <p className="text-sm font-semibold text-[#1f2d27]">Aile Olarak Anı Ekle</p>
            <p className="text-xs text-[#788177]">Doğrudan yayına girer, onay gerekmez</p>
          </div>
        </div>
        <span className={`text-[#788177] transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="border-t border-[#e5dccb] px-6 py-5">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>İsim / Kimden *</label>
                <input
                  type="text"
                  name="author_name"
                  required
                  placeholder="Ailesi, Eşi, Oğlu..."
                  defaultValue="Ailesi"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Yakınlık</label>
                <input
                  type="text"
                  name="relation"
                  placeholder="Eşi, Oğlu, Kızı..."
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Anı / Mesaj *</label>
              <textarea
                name="memory_text"
                required
                rows={4}
                maxLength={1500}
                placeholder={`${vaultName} için bir anı ya da mesaj yazın...`}
                className={`${inputCls} resize-none`}
              />
              <p className="mt-1 text-[11px] text-[#adb5ab]">Maks. 1500 karakter</p>
            </div>

            <div>
              <label className={labelCls}>Fotoğraf <span className="font-normal text-[#adb5ab]">(opsiyonel)</span></label>
              <R2ImageUpload
                name="photo_file"
                category="profile_photo"
                profileId={vaultId}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
            )}
            {success && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">✓ Anı eklendi ve yayında.</p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#123f2b] transition-colors disabled:opacity-60"
              >
                {isPending ? 'Ekleniyor...' : 'Ekle ve Yayınla'}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-[#788177] hover:text-[#1f2d27]"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
