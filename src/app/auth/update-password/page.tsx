'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'

export default function UpdatePasswordPage() {
  const supabase = useMemo(() => createClient(), [])
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)

    if (password.length < 6) {
      setMsg({ ok: false, text: 'Şifre en az 6 karakter olmalı.' })
      return
    }

    if (password !== confirm) {
      setMsg({ ok: false, text: 'Şifreler eşleşmiyor.' })
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setMsg({ ok: false, text: error.message })
      return
    }

    setMsg({ ok: true, text: 'Şifreniz belirlendi. Giriş sayfasına yönlendiriliyorsunuz.' })
    window.setTimeout(() => {
      window.location.href = '/dashboard'
    }, 900)
  }

  return (
    <div className="theme-auth flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="gradient-text mb-4 inline-block text-2xl font-bold tracking-tight">
            The Eternal Memory
          </Link>
          <h1 className="text-xl font-semibold text-slate-100">Şifre Belirle</h1>
          <p className="mt-2 text-sm text-slate-500">
            E-postanıza gelen bağlantı ile hesabınız için yeni şifre oluşturun.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-7 shadow-sm backdrop-blur-sm">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Yeni şifre"
            required
            minLength={6}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-800/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Yeni şifre tekrar"
            required
            minLength={6}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-800/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none"
          />

          {msg && (
            <div className={`rounded-xl border px-4 py-3 text-center text-sm ${
              msg.ok
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}>
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-colors hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Kaydediliyor...' : 'Şifreyi Kaydet'}
          </button>
        </form>
      </div>
    </div>
  )
}
