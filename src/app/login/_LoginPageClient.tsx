'use client'

import { createClient } from '@/lib/supabase/client'
import { langs, type Lang } from '@/i18n'
import { useLang } from '@/i18n/context'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import TurnstileWidget from '@/components/TurnstileWidget'
import { checkTurnstileAction } from './actions'

const authCopy: Record<Lang, {
  login: string
  email: string
  password: string
  submitLogin: string
  resetPassword: string
  resetSent: string
  resetNeedsEmail: string
  loading: string
  error: string
  errorUnconfirmed: string
  errorCaptcha: string
  terms: string
  privacy: string
  and: string
  tos: string
}> = {
  tr: {
    login: 'Giriş yap',
    email: 'E-posta adresi',
    password: 'Şifre',
    submitLogin: 'Giriş yap',
    resetPassword: 'Şifremi belirle / unuttum',
    resetSent: 'Şifre belirleme bağlantısı e-posta adresinize gönderildi.',
    resetNeedsEmail: 'Önce e-posta adresinizi yazın.',
    loading: 'Yükleniyor...',
    error: 'E-posta veya şifre hatalı.',
    errorUnconfirmed: 'E-postanızı henüz doğrulamadınız. Gelen kutunuzu ve spam klasörünü kontrol edin.',
    errorCaptcha: 'CAPTCHA doğrulaması başarısız. Sayfayı yenileyip tekrar deneyin.',
    terms: 'Devam ederek',
    privacy: 'Gizlilik Politikası',
    and: 've',
    tos: 'Kullanım Şartları',
  },
  ka: {
    login: 'შესვლა',
    email: 'ელფოსტის მისამართი',
    password: 'პაროლი',
    submitLogin: 'შესვლა',
    resetPassword: 'პაროლის დაყენება / დამავიწყდა',
    resetSent: 'პაროლის დასაყენებელი ბმული გაიგზავნა ელფოსტაზე.',
    resetNeedsEmail: 'ჯერ შეიყვანეთ ელფოსტა.',
    loading: 'იტვირთება...',
    error: 'ელფოსტა ან პაროლი არასწორია.',
    errorUnconfirmed: 'ელფოსტა ჯერ არ გაქვთ დადასტურებული. შეამოწმეთ შემოსული ფოსტა და სპამი.',
    errorCaptcha: 'CAPTCHA ვერიფიკაცია ვერ მოხდა. განაახლეთ გვერდი და სცადეთ კვლავ.',
    terms: 'გაგრძელებით ეთანხმებით',
    privacy: 'კონფიდენციალურობის პოლიტიკას',
    and: 'და',
    tos: 'გამოყენების პირობებს',
  },
  ru: {
    login: 'Войти',
    email: 'E-mail',
    password: 'Пароль',
    submitLogin: 'Войти',
    resetPassword: 'Задать / забыли пароль',
    resetSent: 'Ссылка для задания пароля отправлена на e-mail.',
    resetNeedsEmail: 'Сначала введите e-mail.',
    loading: 'Загрузка...',
    error: 'Неверный e-mail или пароль.',
    errorUnconfirmed: 'E-mail ещё не подтверждён. Проверьте входящие и папку «Спам».',
    errorCaptcha: 'Проверка CAPTCHA не прошла. Обновите страницу и попробуйте снова.',
    terms: 'Продолжая, вы принимаете',
    privacy: 'Политику конфиденциальности',
    and: 'и',
    tos: 'Условия использования',
  },
  en: {
    login: 'Sign in',
    email: 'Email address',
    password: 'Password',
    submitLogin: 'Sign in',
    resetPassword: 'Set / forgot password',
    resetSent: 'Password setup link was sent to your email.',
    resetNeedsEmail: 'Enter your email address first.',
    loading: 'Loading...',
    error: 'Email or password is incorrect.',
    errorUnconfirmed: 'Your email has not been confirmed yet. Check your inbox and spam folder.',
    errorCaptcha: 'CAPTCHA verification failed. Refresh the page and try again.',
    terms: 'By continuing, you accept the',
    privacy: 'Privacy Policy',
    and: 'and',
    tos: 'Terms of Service',
  },
}

export default function LoginPageClient({ siteKey }: { siteKey: string }) {
  const { lang, setLang } = useLang()
  const c = authCopy[lang]
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const supabase = useMemo(() => createClient(), [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    // Verify Turnstile if configured
    const token = (e.currentTarget.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]'))?.value
    if (token) {
      const { ok } = await checkTurnstileAction(token)
      if (!ok) {
        setMsg({ ok: false, text: c.errorCaptcha })
        setLoading(false)
        return
      }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const isUnconfirmed = error.message.toLowerCase().includes('not confirmed') || error.code === 'email_not_confirmed'
      setMsg({ ok: false, text: isUnconfirmed ? c.errorUnconfirmed : c.error })
      setLoading(false)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: vault } = await supabase
          .from('vaults')
          .select('id, product_type')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (vault?.product_type === 'memorial_profile') {
          window.location.href = `/anma-paneli/${vault.id}`
        } else if (vault?.product_type === 'life_vault') {
          window.location.href = `/dashboard/vault/${vault.id}`
        } else {
          window.location.href = '/dashboard'
        }
      } else {
        window.location.href = '/dashboard'
      }
      // intentionally no setLoading(false) — button stays disabled while navigating
    }
  }

  async function handlePasswordReset() {
    const targetEmail = email.trim().toLowerCase()
    if (!targetEmail) {
      setMsg({ ok: false, text: c.resetNeedsEmail })
      return
    }

    setLoading(true)
    setMsg(null)
    const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    })
    setMsg({ ok: !error, text: error ? error.message : c.resetSent })
    setLoading(false)
  }

  return (
    <div className="theme-auth min-h-screen bg-[#f5f7fb] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/8 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-bold text-2xl tracking-tight gradient-text mb-4">
            The Eternal Memory
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

          <h1 className="text-xl font-semibold text-slate-100">{c.login}</h1>
          <p className="mt-2 text-sm text-slate-500">
            Hesaplar satın alma sonrası veya admin muafiyetiyle açılır.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-7 backdrop-blur-sm shadow-sm">
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
              placeholder={c.password}
              required
              minLength={6}
              className="w-full bg-slate-800/70 border border-slate-700/80 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />

            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={loading}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 disabled:opacity-50"
            >
              {c.resetPassword}
            </button>

            <TurnstileWidget siteKey={siteKey} />

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
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors disabled:opacity-50 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? c.loading : c.submitLogin}
            </button>
          </form>

          <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-center text-xs leading-5 text-slate-600">
            Henüz hesabınız yoksa paket seçerek satın alma adımından devam edin.
            <Link href="/satin-al" className="mt-3 block rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-400">
              Paketleri Gör ve Satın Al
            </Link>
          </div>
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
