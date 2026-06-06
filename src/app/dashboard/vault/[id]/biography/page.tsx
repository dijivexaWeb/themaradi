'use client'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function BiographyPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [initial, setInitial] = useState('')
  const [content, setContent] = useState('')
  const [vaultName, setVaultName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const dirty = content !== initial
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    supabase.from('vaults').select('display_name, biography').eq('id', id).single()
      .then(({ data }) => {
        if (data) {
          setVaultName(data.display_name)
          setInitial(data.biography ?? '')
          setContent(data.biography ?? '')
        }
      })
  }, [id])

  const save = async (text: string) => {
    setSaving(true)
    await supabase.from('vaults').update({ biography: text }).eq('id', id)
    setInitial(text)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChange = (text: string) => {
    setContent(text)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => save(text), 2000)
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-300">Kasalar</Link>
          <span>/</span>
          <Link href={`/dashboard/vault/${id}`} className="hover:text-slate-300">{vaultName}</Link>
          <span>/</span>
          <span className="text-slate-300">Biyografi</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-100">Biyografi</h1>
          <div className="flex items-center gap-3">
            {saving && <span className="text-xs text-slate-500">Kaydediliyor...</span>}
            {saved && <span className="text-xs text-emerald-400">Kaydedildi</span>}
            {dirty && !saving && (
              <button onClick={() => save(content)}
                className="text-xs bg-amber-500 hover:bg-amber-400 text-white px-4 py-1.5 rounded-lg transition-colors">
                Kaydet
              </button>
            )}
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Hayat hikayeleri, anlar, hatiralar... Bu kisiye dair bilmek istediklerinizi buraya yazin."
          rows={20}
          className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-600 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
        />

        <p className="text-xs text-slate-600 mt-3">
          Degisiklikler otomatik kaydedilir. Son kaydedilen: {initial.length > 0 ? `${initial.length} karakter` : 'henuz yok'}
        </p>
      </div>
    </div>
  )
}
