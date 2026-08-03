import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ all?: string }>
}

export default async function BulkImportTrackingPage({ searchParams }: Props) {
  await requireAdmin()
  const { all } = await searchParams
  const supabase = await createServiceClient()

  if (all !== '1') {
    const today = new Date().toISOString().slice(0, 10)
    const { data: todaysBatch } = await supabase
      .from('bulk_import_batches')
      .select('id')
      .eq('batch_date', today)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (todaysBatch) redirect(`/admin/bulk-import/takip/${todaysBatch.id}`)
  }

  const { data: batches } = await supabase
    .from('bulk_import_batches')
    .select('id, batch_date, uploaded_at, total_rows, created_count, source_filename')
    .order('batch_date', { ascending: false })
    .order('uploaded_at', { ascending: false })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/bulk-import" className="text-xs text-slate-400 hover:text-slate-700">← Toplu İçe Aktarım</Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-xl font-bold text-slate-900">Takip Ekranı — Tüm Partiler</h1>
      </div>

      {!batches?.length ? (
        <p className="text-sm text-slate-500">Henüz bir yükleme yapılmamış.</p>
      ) : (
        <div className="space-y-3">
          {batches.map((b) => (
            <Link
              key={b.id}
              href={`/admin/bulk-import/takip/${b.id}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 hover:border-slate-300 hover:shadow-sm transition"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {new Date(b.batch_date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{b.source_filename ?? 'liste'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{b.created_count} / {b.total_rows}</p>
                <p className="text-xs text-slate-400">oluşturuldu</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
