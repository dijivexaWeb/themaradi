'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBulkImportBatch, type BulkImportRow, type BulkImportRowResult } from './actions'

interface PreviewRow extends BulkImportRow {
  _id: string
  _age: number | null
}

const HEADER_ALIASES: Record<string, keyof BulkImportRow> = {
  adsoyad: 'full_name', isimsoyisim: 'full_name', adisoyadi: 'full_name', isim: 'full_name', ad: 'full_name',
  dogumtarihi: 'birth_date', dogtarihi: 'birth_date',
  olumtarihi: 'death_date', vefattarihi: 'death_date', oluttarihi: 'death_date',
  adres: 'address', acikadres: 'address', teslimatadresi: 'address',
  tckimlikno: 'national_id', tc: 'national_id', kimlikno: 'national_id', tcno: 'national_id',
  telefon: 'phone', tel: 'phone', gsm: 'phone', telefonno: 'phone',
  mezarlik: 'cemetery_name', mezarlikbilgisi: 'cemetery_name', mezarlikadi: 'cemetery_name', defin: 'cemetery_name',
}

function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '')
}

function parseDateValue(v: unknown): string | null {
  if (v == null || v === '') return null
  if (v instanceof Date && !isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10)
  }
  const s = String(v).trim()
  // dd.mm.yyyy or dd/mm/yyyy
  const dmy = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/)
  if (dmy) {
    const [, d, m, y] = dmy
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  // yyyy-mm-dd
  const ymd = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (ymd) {
    const [, y, m, d] = ymd
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return null
}

function calcAge(birth: string | null, death: string | null): number | null {
  if (!birth) return null
  const b = new Date(birth)
  const ref = death ? new Date(death) : new Date()
  if (isNaN(b.getTime()) || isNaN(ref.getTime())) return null
  let age = ref.getFullYear() - b.getFullYear()
  const m = ref.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && ref.getDate() < b.getDate())) age--
  return age
}

export default function BulkImportClient() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [rows, setRows] = useState<PreviewRow[]>([])
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [progressLabel, setProgressLabel] = useState<string | null>(null)
  const [results, setResults] = useState<BulkImportRowResult[] | null>(null)
  const [createdBatchId, setCreatedBatchId] = useState<string | null>(null)

  async function handleFile(file: File) {
    setParsing(true)
    setParseError(null)
    setResults(null)
    try {
      const XLSX = await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { cellDates: true })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

      if (!raw.length) {
        setParseError('Dosyada okunabilir satır bulunamadı.')
        setParsing(false)
        return
      }

      const parsed: PreviewRow[] = raw.map((r, i) => {
        const mapped: Partial<BulkImportRow> = {}
        for (const [key, value] of Object.entries(r)) {
          const norm = normalizeHeader(key)
          const field = HEADER_ALIASES[norm]
          if (field && value !== '') {
            ;(mapped as Record<string, unknown>)[field] = value
          }
        }
        const birth_date = parseDateValue(mapped.birth_date)
        const death_date = parseDateValue(mapped.death_date)
        return {
          _id: `row-${i}-${Math.random().toString(36).slice(2, 8)}`,
          full_name: String(mapped.full_name ?? '').trim(),
          birth_date,
          death_date,
          address: mapped.address ? String(mapped.address).trim() : null,
          national_id: mapped.national_id ? String(mapped.national_id).trim() : null,
          phone: mapped.phone ? String(mapped.phone).trim() : null,
          cemetery_name: mapped.cemetery_name ? String(mapped.cemetery_name).trim() : null,
          _age: calcAge(birth_date, death_date),
        }
      })

      const missingName = parsed.filter((r) => !r.full_name).length
      if (missingName === parsed.length) {
        setParseError('"Ad Soyad" sütunu tanınamadı. Dosyanın başlık satırında Ad Soyad, Doğum Tarihi, Ölüm Tarihi, Adres, TC Kimlik No, Telefon, Mezarlık sütunlarından en az Ad Soyad bulunmalı.')
        setParsing(false)
        return
      }

      setRows(parsed.filter((r) => r.full_name))
      setFileName(file.name)
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Dosya okunamadı.')
    } finally {
      setParsing(false)
    }
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r._id !== id))
  }

  async function handleCreate() {
    if (!rows.length) return
    setCreating(true)
    setProgressLabel(`${rows.length} kayıt oluşturuluyor, bu biraz sürebilir...`)
    const payload: BulkImportRow[] = rows.map(({ _id, _age, ...rest }) => rest)
    const res = await createBulkImportBatch(payload, fileName ?? 'liste.xlsx')
    setCreating(false)
    setProgressLabel(null)
    if (!res.success) {
      setParseError(res.error ?? 'Oluşturma başarısız oldu.')
      return
    }
    setResults(res.results ?? [])
    setCreatedBatchId(res.batchId ?? null)
    setRows([])
    router.refresh()
  }

  if (results) {
    const success = results.filter((r) => r.success)
    const failed = results.filter((r) => !r.success)
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p className="mb-2">{success.length} kayıt oluşturuldu{failed.length ? `, ${failed.length} kayıt başarısız` : ''}.</p>
          {createdBatchId && success.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <a
                href={`/api/admin/bulk-import/labels?batchId=${createdBatchId}`}
                className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
              >
                Tüm Etiketleri İndir (PDF)
              </a>
              <a
                href={`/api/admin/bulk-import/waybill?batchId=${createdBatchId}`}
                className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
              >
                Tüm İrsaliyeleri İndir (PDF)
              </a>
              <a
                href={`/api/admin/bulk-import/letter?batchId=${createdBatchId}`}
                className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
              >
                Tüm Mektupları İndir (PDF)
              </a>
              <a
                href={`/api/admin/bulk-import/guide?batchId=${createdBatchId}`}
                className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
              >
                Kullanım Kılavuzu (PDF)
              </a>
              <a
                href={`/admin/bulk-import/takip/${createdBatchId}`}
                className="rounded-lg border border-emerald-700 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                Bu Partiyi Takip Et →
              </a>
            </div>
          )}
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Ad Soyad</th>
                <th className="px-3 py-2 text-left">Kullanıcı Adı</th>
                <th className="px-3 py-2 text-left">Şifre</th>
                <th className="px-3 py-2 text-left">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((r, i) => (
                <tr key={i} className={r.success ? '' : 'bg-red-50'}>
                  <td className="px-3 py-2">{r.full_name}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.login_username ?? '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.password ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">
                    {r.success ? <span className="text-emerald-600">Oluşturuldu</span> : <span className="text-red-600">{r.error}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => setResults(null)}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Yeni liste yükle
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {!rows.length && (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
          <p className="mb-3 text-sm text-slate-500">
            Ham Excel (.xlsx) veya CSV dosyasını yükle. Sütun başlıkları: Ad Soyad, Doğum Tarihi, Ölüm Tarihi, Adres, TC Kimlik No, Telefon (opsiyonel), Mezarlık.
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={parsing}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {parsing ? 'Okunuyor...' : 'Dosya Seç'}
          </button>
          {parseError && <p className="mt-3 text-sm text-red-600">{parseError}</p>}
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="text-sm text-slate-600">
              <strong className="text-slate-900">{fileName}</strong> — {rows.length} satır tabloda
            </div>
            <button
              onClick={() => { setRows([]); setFileName(null); setParseError(null) }}
              className="text-xs font-semibold text-slate-400 hover:text-red-600"
            >
              Vazgeç
            </button>
          </div>

          <div className="max-h-[520px] overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Ad Soyad</th>
                  <th className="px-3 py-2 text-left">Doğum</th>
                  <th className="px-3 py-2 text-left">Ölüm</th>
                  <th className="px-3 py-2 text-left">Yaş</th>
                  <th className="px-3 py-2 text-left">Adres</th>
                  <th className="px-3 py-2 text-left">TC</th>
                  <th className="px-3 py-2 text-left">Telefon</th>
                  <th className="px-3 py-2 text-left">Mezarlık</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-900">{r.full_name}</td>
                    <td className="px-3 py-2 text-slate-500">{r.birth_date ?? '—'}</td>
                    <td className="px-3 py-2 text-slate-500">{r.death_date ?? '—'}</td>
                    <td className="px-3 py-2 text-slate-500">{r._age ?? '—'}</td>
                    <td className="px-3 py-2 max-w-[220px] truncate text-slate-500">{r.address ?? '—'}</td>
                    <td className="px-3 py-2 text-slate-500">{r.national_id ?? '—'}</td>
                    <td className="px-3 py-2 text-slate-500">{r.phone ?? '—'}</td>
                    <td className="px-3 py-2 max-w-[160px] truncate text-slate-500">{r.cemetery_name ?? '—'}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => removeRow(r._id)}
                        className="text-xs font-semibold text-red-500 hover:text-red-700"
                      >
                        Çıkar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {parseError && <p className="text-sm text-red-600">{parseError}</p>}

          <button
            onClick={handleCreate}
            disabled={creating || !rows.length}
            className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {creating ? (progressLabel ?? 'Oluşturuluyor...') : `${rows.length} Kayıt Oluştur`}
          </button>
        </>
      )}
    </div>
  )
}
