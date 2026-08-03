'use client'

import { useState } from 'react'

interface SearchResult {
  id: string
  display_name: string
  login_username: string | null
  qr_id: string
  status: string
  shipping_address: string | null
}

export default function LabelSearch() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  async function search(value: string) {
    setQ(value)
    if (value.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/bulk-import/search?q=${encodeURIComponent(value.trim())}`)
      const json = await res.json()
      setResults(json.results ?? [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">İsimle Ara — Tekil Etiket İndir</h2>
      <p className="mb-3 text-xs text-slate-500">
        Basılan QR&apos;lar elinize geri geldiğinde, kişiyi isimle arayıp etiketini tekrar indirip eşleştirebilirsiniz.
      </p>
      <input
        type="text"
        value={q}
        onChange={(e) => search(e.target.value)}
        placeholder="Ad soyad ara..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      {loading && <p className="mt-2 text-xs text-slate-400">Aranıyor...</p>}
      {results.length > 0 && (
        <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {results.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <div>
                <p className="font-medium text-slate-900">{r.display_name}</p>
                <p className="text-xs text-slate-500">
                  {r.login_username} · {r.status === 'unclaimed' ? 'Sahiplenilmeyi bekliyor' : r.status}
                  {r.shipping_address ? ` · ${r.shipping_address}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <a
                  href={`/api/admin/bulk-import/labels?vaultId=${r.id}`}
                  className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Etiket
                </a>
                <a
                  href={`/api/admin/bulk-import/waybill?vaultId=${r.id}`}
                  className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  İrsaliye
                </a>
                <a
                  href={`/api/admin/bulk-import/letter?vaultId=${r.id}`}
                  className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Mektup
                </a>
                <a
                  href={`/api/admin/bulk-import/guide?vaultId=${r.id}`}
                  className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Kılavuz
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && q.trim().length >= 2 && results.length === 0 && (
        <p className="mt-2 text-xs text-slate-400">Sonuç bulunamadı.</p>
      )}
    </div>
  )
}
