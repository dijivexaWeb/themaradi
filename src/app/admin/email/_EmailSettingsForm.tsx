'use client'

import { useState, useTransition } from 'react'
import { saveEmailSettingsAction, sendTestEmailAction } from './actions'

const inputCls = 'w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10'
const labelCls = 'mb-1.5 block text-xs font-semibold text-[#4a5e55]'
const sectionCls = 'rounded-2xl border border-[#e5dccb] bg-white p-6 shadow-sm'

export default function EmailSettingsForm({ settings }: { settings: Record<string, string> }) {
  const [isPending, startTransition] = useTransition()
  const [isTestPending, startTestTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [testResult, setTestResult] = useState<{ ok?: boolean; msg?: string } | null>(null)

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaved(false); setSaveError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await saveEmailSettingsAction(fd)
      if (!result.success) { setSaveError(result.error ?? 'Kaydedilemedi') } else { setSaved(true) }
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
