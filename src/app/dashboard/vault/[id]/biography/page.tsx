'use client'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

export default function BiographyPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = useMemo(() => createClient(), [])

  const [initial, setInitial] = useState('')
  const [content, setContent] = useState('')
  const [vaultName, setVaultName] = useState('')
  const [isLocked, setIsLocked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const dirty = content !== initial
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    supabase.from('vaults').select('display_name, biography, status').eq('id', id).single()
      .then(({ data }) => {
        if (data) {
          setVaultName(data.display_name)
          setInitial(data.biography ?? '')
          setContent(data.biography ?? '')
          setIsLocked(data.status === 'pending_verification')
        }
      })
  }, [id, supabase])

  const save = async (text: string) => {
    if (isLocked) return
    setSaving(true)
    await supabase.from('vaults').update({ biography: text }).eq('id', id)
    setInitial(text)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChange = (text: string) => {
    if (isLocked) return
    setContent(text)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => save(text), 2000)
  }

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/dashboard" className="text-[#788177] hover:text-[#174f35] transition-colors">Anı Alanım</Link>
          <span className="text-[#c8bfb0]">/</span>
          <Link href={`/dashboard/vault/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">{vaultName}</Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Hayat Hikayesi</span>
        </div>

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra hayat hikayesi yazabilirsiniz.
          </div>
        )}

        <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] shadow-[0_16px_50px_rgba(64,48,24,0.06)] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-serif text-2xl text-[#1f2d27]">Hayat Hikayesi</h1>
              <p className="text-xs text-[#788177] mt-0.5">
                {content.length > 0 ? `${content.length} karakter` : 'Henüz yazılmamış'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {saving && <span className="text-xs text-[#788177]">Kaydediliyor...</span>}
              {saved && <span className="text-xs text-[#174f35] font-medium">Kaydedildi ✓</span>}
              {dirty && !saving && !isLocked && (
                <button
                  onClick={() => save(content)}
                  className="rounded-xl bg-[#174f35] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors"
                >
                  Kaydet
                </button>
              )}
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isLocked}
            placeholder="Hayat hikayeleri, anlar, hatıralar... Bu kişiye dair bilmek istediklerinizi buraya yazın. Doğduğu yer, büyüdüğü yıllar, sevdikleri, yaptıkları..."
            rows={22}
            className="w-full rounded-xl border border-[#e5dccb] bg-white px-5 py-4 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10 resize-none leading-relaxed disabled:opacity-40"
          />

          <p className="text-xs text-[#adb5ab] mt-3">
            Değişiklikler otomatik kaydedilir (2 saniye sonra)
          </p>
        </div>
      </div>
    </div>
  )
}
