'use client'

import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    // TODO: Resend / API route entegrasyonu
    await new Promise((r) => setTimeout(r, 900))
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#d4e8dc] bg-[#edf7f1] px-8 py-14 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2d7a53]/10 text-3xl">
          ✓
        </div>
        <h3 className="font-serif text-2xl text-[#173d31]">Mesajınız iletildi</h3>
        <p className="max-w-xs text-sm leading-7 text-[#5b5245]">
          En kısa sürede geri döneceğiz — genellikle 24 saat içinde.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#8a7a64]">
            Ad Soyad
          </label>
          <input
            required
            type="text"
            placeholder="Adınız"
            className="w-full rounded-xl border border-[#e1d5c3] bg-[#fbf8f1] px-4 py-3 text-sm text-[#173d31] placeholder-[#c0b49e] outline-none transition focus:border-[#b08340] focus:ring-2 focus:ring-[#b08340]/15"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#8a7a64]">
            E-posta
          </label>
          <input
            required
            type="email"
            placeholder="ornek@email.com"
            className="w-full rounded-xl border border-[#e1d5c3] bg-[#fbf8f1] px-4 py-3 text-sm text-[#173d31] placeholder-[#c0b49e] outline-none transition focus:border-[#b08340] focus:ring-2 focus:ring-[#b08340]/15"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#8a7a64]">
          Konu
        </label>
        <select
          required
          defaultValue=""
          className="w-full rounded-xl border border-[#e1d5c3] bg-[#fbf8f1] px-4 py-3 text-sm text-[#173d31] outline-none transition focus:border-[#b08340] focus:ring-2 focus:ring-[#b08340]/15"
        >
          <option value="" disabled>Seçiniz</option>
          <option>Anma Profili hakkında</option>
          <option>Yaşam Kasası hakkında</option>
          <option>QR plaka siparişi</option>
          <option>Teknik destek</option>
          <option>İş birliği / B2B</option>
          <option>Diğer</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#8a7a64]">
          Mesajınız
        </label>
        <textarea
          required
          rows={5}
          placeholder="Nasıl yardımcı olabiliriz?"
          className="w-full resize-none rounded-xl border border-[#e1d5c3] bg-[#fbf8f1] px-4 py-3 text-sm text-[#173d31] placeholder-[#c0b49e] outline-none transition focus:border-[#b08340] focus:ring-2 focus:ring-[#b08340]/15"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#103b2c] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#103b2c]/20 transition hover:bg-[#0b2b20] disabled:opacity-60"
      >
        {status === 'sending' ? 'Gönderiliyor…' : 'Mesaj Gönder'}
        {status !== 'sending' && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  )
}
