'use client'

import { useActionState, useState } from 'react'
import { purchaseVaultAction } from '../actions'
import Link from 'next/link'
import type { BankSettings } from '@/lib/bank-settings'

export default function KasaFormClient({ bank, setupAmount, monthlyAmount }: { bank: BankSettings; setupAmount: number; monthlyAmount: number }) {
  const [state, action, pending] = useActionState(purchaseVaultAction, null)
  const [method, setMethod] = useState<'bank' | 'card'>('bank')

  const inp = 'w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500'
  const inpDisabled = 'w-full bg-slate-900 border border-slate-800 text-slate-600 placeholder-slate-700 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed'

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
            <div className="flex items-center gap-3 text-emerald-400">
              <span>✓</span><span>Sipariş kaydedildi</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-400">
              <span>✓</span><span>Havale bilgileri ekibimize iletildi</span>
            </div>
            <div className="flex items-center gap-3 text-amber-400/70">
              <span>⏳</span><span>E-posta doğrulama bekleniyor</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <span>⏳</span><span>Ödeme onayından sonra panel açılacak</span>
            </div>
          </div>
          <p className="text-xs text-slate-600">E-posta gelmediyse spam klasörünü kontrol edin.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
        <Link href="/satin-al" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
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

          {/* Ödeme Yöntemi Seçimi */}
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
                onClick={() => setMethod('card')}
                className={`rounded-xl border p-3.5 text-left transition-all ${
                  method === 'card'
                    ? 'border-slate-600 bg-slate-800/50 ring-1 ring-slate-600/30'
                    : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                }`}
              >
                <div className="text-lg mb-1">💳</div>
                <div className="text-sm font-semibold text-slate-400">Kartla Ödeme</div>
                <div className="text-[11px] text-amber-500/70 font-medium mt-0.5">⏳ Çok Yakında</div>
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
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    Anı alanı adı <span className="text-emerald-400">*</span>
                  </label>
                  <input type="text" name="display_name" placeholder="Örn: Mehmet'in Anı Alanı veya kendi adınız" required className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    Adınız Soyadınız <span className="text-emerald-400">*</span>
                  </label>
                  <input type="text" name="sender_name" placeholder="Havaleyi gönderecek kişi" required className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    E-posta <span className="text-emerald-400">*</span>
                  </label>
                  <input type="email" name="sender_email" placeholder="Bildirim gönderilecek adres" required className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    Telefon Numarası <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+90 555 000 00 00"
                    required
                    className={inp}
                  />
                  <p className="text-xs text-slate-600 mt-1">Uluslararası format: +ülke kodu ile yazın</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                      Şifre <span className="text-emerald-400">*</span>
                    </label>
                    <input type="password" name="password" placeholder="En az 6 karakter" required minLength={6} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                      Şifre tekrar <span className="text-emerald-400">*</span>
                    </label>
                    <input type="password" name="password_confirm" placeholder="Şifrenizi tekrar yazın" required minLength={6} className={inp} />
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-5">
                  Bu e-posta ve şifreyle hesabınız oluşturulur. Ödeme onaylandıktan sonra aynı bilgilerle panelinize giriş yapabilirsiniz.
                </p>

                {/* İzinler & KVKK */}
                <div className="border border-slate-700/60 bg-slate-800/30 rounded-xl p-4 space-y-4">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">İzinler & Aydınlatma</p>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="email_consent"
                      required
                      className="mt-0.5 h-4 w-4 shrink-0 rounded accent-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-sm text-slate-200 leading-5">
                        Hesabıma ait bilgilendirme e-postalarını almayı kabul ediyorum.{' '}
                        <span className="text-emerald-400 text-xs">*</span>
                      </span>
                      <p className="text-xs text-slate-500 mt-1 leading-5">
                        Sipariş onayı, ödeme durumu ve hesap güvenliği bildirimleri gönderilir.
                        Pazarlama veya reklam içerikleri iletilmez.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="phone_consent"
                      required
                      className="mt-0.5 h-4 w-4 shrink-0 rounded accent-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-sm text-slate-200 leading-5">
                        Kimlik doğrulama ve müşteri desteği amacıyla belirttiğim numaradan aranmayı kabul ediyorum.{' '}
                        <span className="text-emerald-400 text-xs">*</span>
                      </span>
                      <p className="text-xs text-slate-500 mt-1 leading-5">
                        Yalnızca hesap doğrulama ve sipariş takibi için sizi arayabiliriz.
                        Telefonunuz üçüncü taraflarla paylaşılmaz.
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

                {state?.error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{state.error}</p>
                )}
                <button type="submit" disabled={pending}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                  {pending ? 'İşleniyor...' : 'Havale Yaptım, Anı Alanımı Oluştur →'}
                </button>
              </form>

              <p className="text-xs text-slate-600 mt-4 text-center leading-5">
                Kurulum ücretini gönderdikten sonra bu formu doldurun. Hesabınız aktive edilince
                aylık ödeme düzenlemesini birlikte yapacağız.
              </p>
            </>
          )}

          {/* KARTLA ÖDEME — YAKINDA */}
          {method === 'card' && (
            <div className="relative">
              <div className="absolute inset-0 z-10 rounded-xl bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <div className="text-4xl">🔒</div>
                <p className="text-white font-semibold text-sm">Bu ödeme yöntemi yakında aktif olacak</p>
                <p className="text-slate-400 text-xs text-center max-w-[220px] leading-5">
                  Kart ödemeleri entegrasyonu üzerinde çalışıyoruz. Şimdilik banka havalesi ile devam edebilirsiniz.
                </p>
                <button onClick={() => setMethod('bank')}
                  className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  Banka Havalesi ile Öde →
                </button>
              </div>

              <div className="space-y-4 opacity-30 pointer-events-none select-none p-1">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Kart Sahibi Ad Soyad</label>
                  <input disabled placeholder="Ad Soyad" className={inpDisabled} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Kart Numarası</label>
                  <input disabled placeholder="•••• •••• •••• ••••" className={inpDisabled} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Son Kullanma Tarihi</label>
                    <input disabled placeholder="AA / YY" className={inpDisabled} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">CVV</label>
                    <input disabled placeholder="•••" className={inpDisabled} />
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-xl py-3 text-center text-slate-500 text-sm font-semibold">
                  Ödemeyi Tamamla
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
