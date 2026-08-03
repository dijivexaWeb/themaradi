'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { claimVaultAction } from './actions'

export default function ClaimGate({ vaultId, displayName }: { vaultId: string; displayName: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClaim() {
    setLoading(true)
    setError(null)
    const res = await claimVaultAction(vaultId)
    setLoading(false)
    if (!res.success) {
      setError(res.error ?? 'Bir hata oluştu.')
      return
    }
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1c2e25] px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#22362c] p-8 text-center shadow-2xl">
        <div className="mb-4 text-5xl">🕊️</div>
        <h1 className="font-serif text-2xl text-white">{displayName}</h1>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Bu anma sayfası sizin için hazırlandı ve şu an sahiplenilmeyi bekliyor.
          Sahiplendiğinizde sayfa kalıcı olarak yayına alınır ve düzenlemeye açılır.
        </p>

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="mt-6 w-full rounded-2xl bg-[#dfbd72] px-6 py-3 text-sm font-semibold text-[#1c2e25] shadow-lg transition hover:bg-[#e8cc82]"
          >
            Sahiplen
          </button>
        ) : (
          <div className="mt-6 rounded-2xl border border-[#dfbd72]/30 bg-white/5 p-5">
            <p className="text-sm font-semibold text-white">Emin misiniz?</p>
            <p className="mt-2 text-xs leading-5 text-white/50">
              Sahiplendiğinizde bu sayfa kalıcı olarak yayına alınır. Bu işlem geri alınamaz.
            </p>
            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                disabled={loading}
                className="flex-1 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-white/70 transition hover:bg-white/5 disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button
                onClick={handleClaim}
                disabled={loading}
                className="flex-1 rounded-xl bg-[#dfbd72] px-4 py-2.5 text-xs font-semibold text-[#1c2e25] transition hover:bg-[#e8cc82] disabled:opacity-50"
              >
                {loading ? 'İşleniyor...' : 'Evet, Sahiplen'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
