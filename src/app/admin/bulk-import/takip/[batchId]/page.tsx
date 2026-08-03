import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import TrackingTable from './_TrackingTable'

interface Props {
  params: Promise<{ batchId: string }>
}

export default async function BulkImportBatchTrackingPage({ params }: Props) {
  await requireAdmin()
  const { batchId } = await params
  const supabase = await createServiceClient()

  const { data: batch } = await supabase
    .from('bulk_import_batches')
    .select('id, batch_date, source_filename, total_rows, created_count')
    .eq('id', batchId)
    .single()

  if (!batch) notFound()

  const { data: vaults } = await supabase
    .from('vaults')
    .select('id, display_name, qr_id, login_username, status, shipping_status, tracking_number, qr_label_printed, waybill_printed, letter_printed, guide_printed, claimed_at')
    .eq('bulk_batch_id', batchId)
    .order('display_name', { ascending: true })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/bulk-import/takip?all=1" className="text-xs text-slate-400 hover:text-slate-700">← Tüm Partiler</Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-xl font-bold text-slate-900">
          {new Date(batch.batch_date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </h1>
        <span className="text-xs text-slate-400">({batch.created_count} kayıt)</span>
      </div>

      <TrackingTable rows={vaults ?? []} />
    </div>
  )
}
