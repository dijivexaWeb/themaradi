'use client'

import { useActionState, useState } from 'react'
import { purchaseVaultAction } from '../actions'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { BankSettings } from '@/lib/bank-settings'
import BrandLogo from '@/components/BrandLogo'

const PayPalCheckoutButton = dynamic(() => import('@/components/PayPalCheckoutButton'), { ssr: false })

export default function KasaFormClient({
  bank,
  setupAmount,
  monthlyAmount,
  paypalClientId,
}: {
  bank: BankSettings
  setupAmount: number
  monthlyAmount: number
  paypalClientId: string
}) {
  const [state, action, pending] = useActionState(purchaseVaultAction, null)
  const [method, setMethod] = useState<'bank' | 'paypal'>('bank')
  const [paypalError, setPaypalError] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [phone, setPhone] = useState('')
  const [emailConsent, setEmailConsent] = useState(false)
  const [phoneConsent, setPhoneConsent] = useState(false)

  const inp = 'w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500'

  if (state && 'emailConfirmationSent' in state && state.emailConfirmationSent) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📧</div>
          <h1 className="text-2xl font-bold text-white mb-3">E-postanızı doğrulayın</h1>
          <p className="text-slate-400 mb-2">
            <span className="text-emerald-400 font-medium">{'email' in state ? state.email : ''}</span> adresine
            bir doğrulama bağlantısı gönderdik.
          </p>
          <p className="text-slate-500 text-sm mb-8 leading-6">
            Bağlantıya tıkladıktan sonra hesabınız aktif olacak ve panelinize giriş yapabileceksiniz.
          </p>
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 text-left text-sm space-y-3 mb-6">
            <div className="flex items-center gap-3 text-emerald-400"><span>✓</span><span>Sipariş kaydedildi</span></div>
            <div className="flex items-center gap-3 text-emerald-400"><span>✓</span><span>Havale bilgileri ekibimize iletildi</span></div>
            <div className="flex items-center gap-3 text-amber-400/70"><span>⏳</span><span>E-posta doğrulama bekleniyor</span></div>
            <div className="flex items-center gap-3 text-slate-500"><span>⏳</span><span>Ödeme onayından sonra panel açılacak</span></div>
          </div>
          <p className="text-xs text-slate-600">E-posta gelmediyse spam klasörünü kontrol edin.</p>
        </div>
      </div>
    )
  }

  const sharedFields = (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-slate-400 mb-1.5 font-medium">
          Anı alanı adı <span className="text-emerald-400">*</span>
        </label>
        <input
          type="text" name="display_name" required
          placeholder="Örn: Mehmet'in Anı Alanı veya kendi adınız"
          value={displayName} onChange={(e) => setDisplayName(e.target.value)}
          className={inp}
        />
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-1.5 font-medium">
          Adınız Soyadınız <span className="text-emerald-400">*</span>
        </label>
        <input
          type="text" name="sender_name" required
          placeholder="Havaleyi gönderecek kişi"
          value={senderName} onChange={(e) => setSenderName(e.target.value)}
          className={inp}
        />
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-1.5 font-medium">
          E-posta <span className="text-emerald-400">*</span>
        </label>
        <input
          type="email" name="sender_email" required
          placeholder="Bildirim gönderilecek adres"
          value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)}
          className={inp}
        />
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-1.5 font-medium">
          Telefon Numarası <span className="text-emerald-400">*</span>
        </label>
        <input
          type="tel" name="phone" required
          placeholder="+90 555 000 00 00"
          value={phone} onChange={(e) => setPhone(e.target.value)}
          className={inp}
        />
        <p className="text-xs text-slate-600 mt-1">Uluslararası format: +ülke kodu ile yazın</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">
            Şifre <span className="text-emerald-400">*</span>
          </label>
          <input
            type="password" name="password" required minLength={6}
            placeholder="En az 6 karakter"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className={inp}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">
            Şifre tekrar <span className="text-emerald-400">*</span>
          </label>
          <input
            type="password" name="password_confirm" required minLength={6}
            placeholder="Şifrenizi tekrar yazın"
            value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)}
            className={inp}
          />
        </div>
      </div>
      <p className="text-xs text-slate-600 leading-5">
        Bu e-posta ve şifreyle hesabınız oluşturulur. Ödeme onaylandıktan sonra aynı bilgilerle panelinize giriş yapabilirsiniz.
      </p>

      <div className="border border-slate-700/60 bg-slate-800/30 rounded-xl p-4 space-y-4">
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">İzinler & Aydınlatma</p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox" name="email_consent" required
            checked={emailConsent} onChange={(e) => setEmailConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded accent-emerald-500 cursor-pointer"
          />
          <div>
            <span className="text-sm text-slate-200 leading-5">
              Hesabıma ait bilgilendirme e-postalarını almayı kabul ediyorum.{' '}
              <span className="text-emerald-400 text-xs">*</span>
            </span>
            <p className="text-xs text-slate-500 mt-1 leading-5">
              Sipariş onayı, ödeme durumu ve hesap güvenliği bildirimleri gönderilir.
            </p>
          </div>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox" name="phone_consent" required
            checked={phoneConsent} onChange={(e) => setPhoneConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded accent-emerald-500 cursor-pointer"
          />
          <div>
            <span className="text-sm text-slate-200 leading-5">
              Kimlik doğrulama ve müşteri desteği amacıyla belirttiğim numaradan aranmayı kabul ediyorum.{' '}
              <span className="text-emerald-400 text-xs">*</span>
            </span>
            <p className="text-xs text-slate-500 mt-1 leading-5">
              Yalnızca hesap doğrulama ve sipariş takibi için sizi arayabiliriz.
            </p>
          </div>
        </label>
        <p className="text-xs text-slate-600 leading-5 pt-1 border-t border-slate-700/50">
          Kişisel verileriniz 6698 sayılı KVKK kapsamında işlenmektedir.{' '}
          <Link href="/kvkk" className="text-emerald-400/70 hover:text-emerald-400 underline underline-offset-2">
            Kişisel Verilerin Korunması Politikası →
          </Link>
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Checkout header */}
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <BrandLogo light href="/" />
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Güvenli Ödeme
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="mb-6 text-center">
          <p className="text-slate-400 text-sm leading-6">
            Yaşam kasanızı oluşturun. Dijital mirasınızı güvenle koruyun.
          </p>
        </div>

        <Link href="/satin-al" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors">
          ← Paket seçimine dön
        </Link>

        <div className="border border-emerald-500/20 bg-slate-900 rounded-2xl p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center text-xl">🔐</div>
            <div>
              <h1 className="font-bold text-xl text-white">Yaşam Kasası</h1>
              <p className="text-xs text-slate-500">Kurulum: {setupAmount} ₾ + {monthlyAmount} ₾/ay</p>
            </div>
          </div>

          {/* Ödeme Yöntemi */}
          <div className="mb-6">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-semibold">Ödeme Yöntemi</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('bank')}
                className={`rounded-xl border p-3.5 text-left transition-all ${
                  method === 'bank'
                    ? 'border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="text-lg mb-1">🏦</div>
                <div className="text-sm font-semibold text-white">Banka Havalesi</div>
                <div className="text-[11px] text-emerald-400 font-medium mt-0.5">✓ Aktif</div>
              </button>
              <button
                type="button"
                onClick={() => setMethod('paypal')}
                className={`rounded-xl border p-3.5 text-left transition-all ${
                  method === 'paypal'
                    ? 'border-[#009cde]/50 bg-[#009cde]/10 ring-1 ring-[#009cde]/30'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="text-lg mb-1">🅿️</div>
                <div className="text-sm font-semibold text-white">PayPal</div>
                <div className="text-[11px] text-emerald-400 font-medium mt-0.5">Aktif</div>
              </button>
            </div>
          </div>

          {/* BANKA HAVALESİ */}
          {method === 'bank' && (
            <>
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-6">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-semibold">Havale Bilgileri</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">IBAN</span>
                    <span className="font-mono text-emerald-400 select-all text-xs sm:text-sm">{bank.iban}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Banka</span>
                    <span className="text-slate-200">{bank.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Alıcı</span>
                    <span className="text-slate-200">{bank.recipient}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-700">
                    <span className="text-slate-400">Kurulum ücreti</span>
                    <span className="text-white font-bold text-base">{setupAmount} ₾</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Aylık ücret</span>
                    <span className="text-slate-300">{monthlyAmount} ₾/ay (aktivasyondan sonra)</span>
                  </div>
                </div>
              </div>

              <form action={action} className="space-y-4">
                {sharedFields}
                {state?.error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{state.error}</p>
                )}
                <button type="submit" disabled={pending}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                  {pending ? 'İşleniyor...' : 'Havale Yaptım, Anı Alanımı Oluştur →'}
                </button>
              </form>
              <p className="text-xs text-slate-600 mt-4 text-center leading-5">
                Kurulum ücretini gönderdikten sonra bu formu doldurun.
              </p>
            </>
          )}

          {/* PAYPAL */}
          {method === 'paypal' && (
            <div className="space-y-4">
              <div className="bg-[#009cde]/10 border border-[#009cde]/20 rounded-xl p-4 text-sm text-slate-300 leading-6">
                PayPal ile güvenli ödeme yapın. Kurulum ücreti: <strong className="text-white">{setupAmount} ₾</strong>
              </div>
              {sharedFields}
              {paypalError && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{paypalError}</p>
              )}
              <PayPalCheckoutButton
                clientId={paypalClientId}
                formData={{
                  productType: 'vault_setup',
                  displayName,
                  senderName,
                  senderEmail,
                  password,
                  phone,
                  emailConsent,
                  phoneConsent,
                }}
                onError={setPaypalError}
              />
              <p className="text-xs text-slate-600 text-center leading-5">
                Ödeme PayPal güvenli altyapısı üzerinden işlenir.
              </p>
            </div>
          )}
        </div>

        {/* Trust badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            256-bit SSL
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Veri Güvenliği
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Güvenli Ödeme
          </span>
        </div>
      </div>
      </div>
    </div>
  )
}
