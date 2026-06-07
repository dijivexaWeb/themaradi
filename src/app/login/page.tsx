'use client'

import { createClient } from '@/lib/supabase/client'
import { langs, type Lang } from '@/i18n'
import { useLang } from '@/i18n/context'
import Link from 'next/link'
import { useMemo, useState } from 'react'

type Mode = 'login' | 'signup'

const authCopy: Record<Lang, {
  login: string
  signup: string
  google: string
  divider: string
  email: string
  password: string
  passwordSignup: string
  submitLogin: string
  submitSignup: string
  loading: string
  success: string
  error: string
  terms: string
  privacy: string
  and: string
  tos: string
}> = {
  tr: {
    login: 'Giriş yap',
    signup: 'Kayıt ol',
    google: 'Google ile devam et',
    divider: 'veya e-posta ile',
    email: 'E-posta adresi',
    password: 'Şifre',
    passwordSignup: 'Şifre (min. 6 karakter)',
    submitLogin: 'Giriş yap',
    submitSignup: 'Hesap oluştur',
    loading: 'Yükleniyor...',
    success: 'Hesabınız oluşturuldu. E-postanızı onaylayın veya doğrudan giriş yapın.',
    error: 'E-posta veya şifre hatalı.',
    terms: 'Devam ederek',
    privacy: 'Gizlilik Politikası',
    and: 've',
    tos: 'Kullanım Şartları',
  },
  ka: {
    login: 'შესვლა',
    signup: 'რეგისტრაცია',
    google: 'Google-ით გაგრძელება',
    divider: 'ან ელფოსტით',
    email: 'ელფოსტის მისამართი',
    password: 'პაროლი',
    passwordSignup: 'პაროლი (მინ. 6 სიმბოლო)',
    submitLogin: 'შესვლა',
    submitSignup: 'ანგარიშის შექმნა',
    loading: 'იტვირთება...',
    success: 'ანგარიში შეიქმნა. დაადასტურეთ ელფოსტა ან შედით პირდაპირ.',
    error: 'ელფოსტა ან პაროლი არასწორია.',
    terms: 'გაგრძელებით ეთანხმებით',
    privacy: 'კონფიდენციალურობის პოლიტიკას',
    and: 'და',
    tos: 'გამოყენების პირობებს',
  },
  ru: {
    login: 'Войти',
    signup: 'Регистрация',
    google: 'Продолжить с Google',
    divider: 'или по e-mail',
    email: 'E-mail',
    password: 'Пароль',
    passwordSignup: 'Пароль (мин. 6 символов)',
    submitLogin: 'Войти',
    submitSignup: 'Создать аккаунт',
    loading: 'Загрузка...',
    success: 'Аккаунт создан. Подтвердите e-mail или войдите напрямую.',
    error: 'Неверный e-mail или пароль.',
    terms: 'Продолжая, вы принимаете',
    privacy: 'Политику конфиденциальности',
    and: 'и',
    tos: 'Условия использования',
  },
  en: {
    login: 'Sign in',
    signup: 'Sign up',
    google: 'Continue with Google',
    divider: 'or use email',
    email: 'Email address',
    password: 'Password',
    passwordSignup: 'Password (min. 6 characters)',
    submitLogin: 'Sign in',
    submitSignup: 'Create account',
    loading: 'Loading...',
    success: 'Your account was created. Confirm your email or sign in directly.',
    error: 'Email or password is incorrect.',
    terms: 'By continuing, you accept the',
    privacy: 'Privacy Policy',
    and: 'and',
    tos: 'Terms of Service',
  },
}

export default function LoginPage() {
  const { lang, setLang } = useLang()
  const c = authCopy[lang]
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const supabase = useMemo(() => createClient(), [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) setMsg({ ok: false, text: error.message })
      else if (data.session) window.location.href = '/dashboard'
      else setMsg({ ok: true, text: c.success })
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMsg({ ok: false, text: c.error })
      else window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  async function handleGoogle() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setMsg({ ok: false, text: error.message })
      setLoading(false)
    }
  }

  return (
    <div className="theme-auth min-h-screen bg-[#f5f7fb] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/8 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-bold text-2xl tracking-tight gradient-text mb-4">
            themaradi
          </Link>

          <div className="flex justify-center gap-1 mb-4">
            {langs.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setLang(item.code)}
                className={`text-xs border px-2.5 py-1 rounded-lg transition-colors ${
                  lang === item.code
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900'
                }`}
              >
                {item.flag}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => { setMode('login'); setMsg(null) }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-slate-800 text-slate-100 shadow'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {c.login}
            </button>
            <button
              onClick={() => { setMode('signup'); setMsg(null) }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-slate-800 text-slate-100 shadow'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {c.signup}
            </button>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-7 backdrop-blur-sm shadow-sm">
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 mb-5 shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {c.google}
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-900 px-3 text-xs text-slate-600">{c.divider}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={c.email}
              required
              className="w-full bg-slate-800/70 border border-slate-700/80 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? c.passwordSignup : c.password}
              required
              minLength={6}
              className="w-full bg-slate-800/70 border border-slate-700/80 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />

            {msg && (
              <div className={`text-sm rounded-xl px-4 py-3 text-center ${
                msg.ok
                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                  : 'text-red-700 bg-red-50 border border-red-200'
              }`}>
                {msg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors disabled:opacity-50 shadow-lg shadow-amber-500/20"
            >
              {loading
                ? c.loading
                : mode === 'signup'
                ? c.submitSignup
                : c.submitLogin}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-slate-700">
          {c.terms}{' '}
          <Link href="/privacy" className="underline hover:text-slate-500 transition-colors">{c.privacy}</Link>
          {' '}{c.and}{' '}
          <Link href="/terms" className="underline hover:text-slate-500 transition-colors">{c.tos}</Link>.
        </p>
      </div>
    </div>
  )
}
