'use client'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import PersonHeader from '../_PersonHeader'

interface VaultData {
  display_name: string
  biography: string | null
  status: string
  cover_photo_url: string | null
  birth_date: string | null
  death_date: string | null
}

export default function BiographyPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = useMemo(() => createClient(), [])

  const [vault, setVault] = useState<VaultData | null>(null)
  const [content, setContent] = useState('')
  const [initial, setInitial] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const dirty = content !== initial
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    supabase
      .from('vaults')
      .select('display_name, biography, status, cover_photo_url, birth_date, death_date')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setVault(data as VaultData)
          setInitial(data.biography ?? '')
          setContent(data.biography ?? '')
        }
      })
  }, [id, supabase])

  const isLocked = vault?.status === 'pending_verification'

  const save = async (text: string) => {
    if (isLocked) return
    setSaving(true)
    await supabase.from('vaults').update({ biography: text }).eq('id', id)
    setInitial(text)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleChange = (text: string) => {
    if (isLocked) return
    setContent(text)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => save(text), 2000)
  }

  const words = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Person header */}
        {vault && (
          <PersonHeader
            vault={{ id, ...vault }}
            sectionLabel="Hayat Hikayesi"
            sectionIcon="📖"
          />
        )}

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra hayat hikayesi yazabilirsiniz.
          </div>
        )}

        <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] shadow-[0_16px_50px_rgba(64,48,24,0.06)] overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center justify-between border-b border-[#e5dccb] px-6 py-4">
            <div>
              <h1 className="font-serif text-xl text-[#1f2d27]">Hayat Hikayesi</h1>
              <p className="text-xs text-[#adb5ab] mt-0.5">
                {words > 0 ? `${words} kelime · ${content.length} karakter` : 'Henüz yazılmamış'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {saving && (
                <span className="flex items-center gap-1.5 text-xs text-[#788177]">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#dfbd72]" />
                  Kaydediliyor
                </span>
              )}
              {saved && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-[#174f35]">
                  <span className="text-base">✓</span> Kaydedildi
                </span>
              )}
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

          {/* Textarea */}
          <textarea
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isLocked}
            placeholder="Doğduğu yer, büyüdüğü yıllar, sevdikleri, çalışma hayatı, hatırlanan anlar...

Bu alanda yazdıklarınız anma sayfasında 'Hayat Hikayesi' olarak görünür. Dil, üslup, uzunluk tamamen size bırakılmıştır."
            rows={24}
            className="w-full bg-white px-6 py-5 text-sm text-[#1f2d27] placeholder-[#c8bfb0] outline-none resize-none leading-8 disabled:opacity-40"
          />

          {/* Footer hint */}
          <div className="border-t border-[#e5dccb] px-6 py-3 flex items-center justify-between">
            <p className="text-xs text-[#adb5ab]">Değişiklikler 2 saniye sonra otomatik kaydedilir</p>
            {!isLocked && dirty && (
              <p className="text-xs text-[#dfbd72] font-medium">Kaydedilmemiş değişiklik</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
