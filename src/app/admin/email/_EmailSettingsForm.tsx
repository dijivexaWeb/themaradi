'use client'

import { useState, useTransition } from 'react'
import { saveEmailSettingsAction, sendTestEmailAction, saveTurnstileSettingsAction } from './actions'
import { regenerateWebhookSecretAction } from '../inbox/actions'

const inputCls = 'w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10'
const labelCls = 'mb-1.5 block text-xs font-semibold text-[#4a5e55]'
const sectionCls = 'rounded-2xl border border-[#e5dccb] bg-white p-6 shadow-sm'

export default function EmailSettingsForm({ settings }: { settings: Record<string, string> }) {
  const [isPending, startTransition] = useTransition()
  const [isTestPending, startTestTransition] = useTransition()
  const [isTurnstilePending, startTurnstileTransition] = useTransition()
  const [isWebhookPending, startWebhookTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [turnstileSaved, setTurnstileSaved] = useState(false)
  const [turnstileError, setTurnstileError] = useState('')
  const [testResult, setTestResult] = useState<{ ok?: boolean; msg?: string } | null>(null)
  const [webhookSecret, setWebhookSecret] = useState(settings.inbound_webhook_secret ?? '')

  function handleTurnstileSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTurnstileSaved(false); setTurnstileError('')
    const fd = new FormData(e.currentTarget)
    startTurnstileTransition(async () => {
      const result = await saveTurnstileSettingsAction(fd)
      if (!result.success) { setTurnstileError(result.error ?? 'Kaydedilemedi') } else { setTurnstileSaved(true) }
    })
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaved(false); setSaveError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await saveEmailSettingsAction(fd)
      if (!result.success) { setSaveError(result.error ?? 'Kaydedilemedi') } else { setSaved(true) }
    })
  }

  function handleRegenerateWebhook() {
    startWebhookTransition(async () => {
      const r = await regenerateWebhookSecretAction()
      if (r.secret) setWebhookSecret(r.secret)
    })
  }

  function handleTest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTestResult(null)
    const fd = new FormData(e.currentTarget)
    startTestTransition(async () => {
      const result = await sendTestEmailAction(fd)
      if (!result.success) { setTestResult({ ok: false, msg: result.error }) }
      else { setTestResult({ ok: true, msg: 'Email gönderildi! Gelen kutunuzu kontrol edin.' }) }
    })
  }

  return (
    <>
      {/* Bağlantı ayarları */}
      <form onSubmit={handleSave} className={sectionCls}>
        <h2 className="font-semibold text-[#1f2d27] mb-5">Bağlantı Ayarları</h2>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>Resend API Anahtarı</label>
            <input
              type="password"
              name="email_api_key"
              defaultValue={settings.email_api_key ?? ''}
              placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxx"
              className={inputCls}
              autoComplete="off"
            />
            <p className="mt-1.5 text-xs text-[#adb5ab]">
              resend.com → API Keys → Create API Key
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Gönderen Email</label>
              <input
                type="email"
                name="email_from_address"
                defaultValue={settings.email_from_address ?? 'noreply@theeternalmemory.com'}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Gönderen Adı</label>
              <input
                type="text"
                name="email_from_name"
                defaultValue={settings.email_from_name ?? 'The Eternal Memory'}
                className={inputCls}
              />
            </div>
          </div>

          <div className="border-t border-[#f0ebe0] pt-4">
            <h3 className="text-sm font-semibold text-[#1f2d27] mb-3">Bildirim Ayarları</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="email_notify_new_guestbook"
                  defaultChecked={settings.email_notify_new_guestbook !== 'false'}
                  className="h-4 w-4 rounded accent-[#174f35]"
                />
                <span className="text-sm text-[#1f2d27]">Yeni taziye mesajında vault sahibine email gönder</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="email_notify_approved"
                  defaultChecked={settings.email_notify_approved !== 'false'}
                  className="h-4 w-4 rounded accent-[#174f35]"
                />
                <span className="text-sm text-[#1f2d27]">Mesaj onaylandığında göndericiye bildirim gönder</span>
              </label>
            </div>
          </div>
        </div>

        {saveError && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{saveError}</p>
        )}
        {saved && (
          <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">Ayarlar kaydedildi.</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-5 rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white hover:bg-[#123f2b] transition-colors disabled:opacity-60"
        >
          {isPending ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>

      {/* Turnstile (CAPTCHA) */}
      <form onSubmit={handleTurnstileSave} className={sectionCls}>
        <h2 className="font-semibold text-[#1f2d27] mb-1">CAPTCHA Koruması (Cloudflare Turnstile)</h2>
        <p className="text-xs text-[#788177] mb-5">
          Giriş, iletişim ve taziye formlarını bot saldırılarına karşı korur.
          Anahtarları <a href="https://dash.cloudflare.com/?to=/:account/turnstile" target="_blank" rel="noopener noreferrer" className="underline text-[#174f35]">Cloudflare Turnstile</a> panelinden alın.
        </p>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>Site Anahtarı (public)</label>
            <input
              type="text"
              name="turnstile_site_key"
              defaultValue={settings.turnstile_site_key ?? ''}
              placeholder="0x4AAAAAAA..."
              className={inputCls}
              autoComplete="off"
            />
            <p className="mt-1.5 text-xs text-[#adb5ab]">Tarayıcıya gönderilir — public, gizli değil.</p>
          </div>
          <div>
            <label className={labelCls}>Gizli Anahtar (secret)</label>
            <input
              type="password"
              name="turnstile_secret_key"
              defaultValue={settings.turnstile_secret_key ?? ''}
              placeholder="0x4AAAAAAA..."
              className={inputCls}
              autoComplete="off"
            />
            <p className="mt-1.5 text-xs text-[#adb5ab]">Sunucuda saklanır — asla paylaşmayın.</p>
          </div>
        </div>

        {turnstileError && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{turnstileError}</p>
        )}
        {turnstileSaved && (
          <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">Turnstile anahtarları kaydedildi.</p>
        )}

        <div className="mt-5 flex items-center gap-4">
          <button
            type="submit"
            disabled={isTurnstilePending}
            className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white hover:bg-[#123f2b] transition-colors disabled:opacity-60"
          >
            {isTurnstilePending ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <div className="flex items-center gap-2 text-xs text-[#788177]">
            <span className={`h-2 w-2 rounded-full ${settings.turnstile_site_key && settings.turnstile_secret_key ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            {settings.turnstile_site_key && settings.turnstile_secret_key ? 'Aktif' : 'Yapılandırılmadı'}
          </div>
        </div>
      </form>

      {/* Gelen Kutusu Webhook */}
      <div className={sectionCls}>
        <h2 className="font-semibold text-[#1f2d27] mb-1">Gelen Kutusu Webhook</h2>
        <p className="text-xs text-[#788177] mb-5">
          Bu URL'yi{' '}
          <a href="https://resend.com/inbound-webhooks" target="_blank" rel="noopener noreferrer" className="underline text-[#174f35]">
            Resend Inbound
          </a>{' '}
          bölümünde kaydedin. Artık support@, partner@, privacy@ adreslerine gelen mailler admin panelinde görünür.
        </p>

        <div className="mb-4">
          <label className={labelCls}>Webhook URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={
                webhookSecret
                  ? `https://theeternalmemory.com/api/email/inbound?token=${webhookSecret}`
                  : '— önce token oluşturun —'
              }
              className={`${inputCls} font-mono text-xs bg-slate-50 cursor-text select-all`}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              type="button"
              onClick={() => {
                const val = webhookSecret
                  ? `https://theeternalmemory.com/api/email/inbound?token=${webhookSecret}`
                  : ''
                if (val) navigator.clipboard.writeText(val)
              }}
              className="shrink-0 rounded-xl border border-[#e5dccb] px-3 py-2 text-xs text-[#788177] hover:bg-slate-50 transition-colors"
            >
              Kopyala
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleRegenerateWebhook}
            disabled={isWebhookPending}
            className="rounded-xl bg-[#174f35] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#123f2b] transition-colors disabled:opacity-60"
          >
            {isWebhookPending ? 'Oluşturuluyor...' : webhookSecret ? 'Yeni Token Oluştur' : 'Token Oluştur'}
          </button>
          {webhookSecret && (
            <span className="text-xs text-[#788177]">
              ⚠ Token değişirse Resend'de URL'yi güncellemeniz gerekir.
            </span>
          )}
        </div>

        <div className="mt-4 bg-[#fffdf8] border border-[#f0ebe0] rounded-xl p-4 text-xs text-[#788177] space-y-1.5">
          <p className="font-semibold text-[#4a5e55]">Kurulum adımları:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Yukarıdaki "Token Oluştur" butonuna tıklayın.</li>
            <li>Resend panelini açın → Inbound → Add Webhook.</li>
            <li>Webhook URL'yi yapıştırın, etki alanı olarak <code className="bg-[#f0ebe0] px-1 rounded">theeternalmemory.com</code> yazın.</li>
            <li>Kaydedin. Artık gelen mailler admin panelinde "Gelen Kutusu"nda görünür.</li>
          </ol>
        </div>
      </div>

      {/* Test email */}
      <form onSubmit={handleTest} className={sectionCls}>
        <h2 className="font-semibold text-[#1f2d27] mb-1">Test Email Gönder</h2>
        <p className="text-xs text-[#788177] mb-4">API key kaydettikten sonra bağlantıyı doğrulamak için kullanın.</p>
        <div className="flex gap-3">
          <input
            type="email"
            name="test_email"
            placeholder="test@example.com"
            defaultValue="checklifemedical@gmail.com"
            className={inputCls}
          />
          <button
            type="submit"
            disabled={isTestPending}
            className="shrink-0 rounded-xl border border-[#174f35] px-5 py-3 text-sm font-semibold text-[#174f35] hover:bg-[#174f35]/5 transition-colors disabled:opacity-60"
          >
            {isTestPending ? '...' : 'Gönder'}
          </button>
        </div>
        {testResult && (
          <p className={`mt-3 rounded-lg px-3 py-2 text-xs ${testResult.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {testResult.msg}
          </p>
        )}
      </form>

      {/* Durum */}
      <div className={`${sectionCls} bg-[#fffdf8]`}>
        <h2 className="font-semibold text-[#1f2d27] mb-3">Mevcut Durum</h2>
        <div className="space-y-2 text-sm font-sans">
          <div className="flex items-center justify-between">
            <span className="text-[#788177]">API Key</span>
            <span className={`font-medium ${settings.email_api_key ? 'text-[#174f35]' : 'text-red-500'}`}>
              {settings.email_api_key ? '✓ Yapılandırıldı' : '✗ Eksik'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#788177]">Gönderen</span>
            <span className="text-[#1f2d27] font-medium text-xs">
              {settings.email_from_name || 'The Eternal Memory'} &lt;{settings.email_from_address || 'noreply@theeternalmemory.com'}&gt;
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#788177]">Yeni mesaj bildirimi</span>
            <span className={`font-medium ${settings.email_notify_new_guestbook !== 'false' ? 'text-[#174f35]' : 'text-[#adb5ab]'}`}>
              {settings.email_notify_new_guestbook !== 'false' ? 'Aktif' : 'Kapalı'}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
