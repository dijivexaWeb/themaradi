'use client'

import { useActionState } from 'react'
import { adminLogin } from './actions'
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react'
import { useState } from 'react'
import TurnstileWidget from '@/components/TurnstileWidget'

export default function AdminLoginForm({ siteKey }: { siteKey: string }) {
  const [state, action, pending] = useActionState(adminLogin, null)
  const [showPw, setShowPw] = useState(false)

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">
          E-posta
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@theeternalmemory.com"
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">
          Şifre
        </label>
        <div className="relative">
          <input
            name="password"
            type={showPw ? 'text' : 'password'}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 pr-11 text-sm text-white placeholder-slate-600 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            tabIndex={-1}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <TurnstileWidget siteKey={siteKey} />

      {state?.error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        {pending ? 'Giriş yapılıyor…' : 'Giriş Yap'}
      </button>
    </form>
  )
}
