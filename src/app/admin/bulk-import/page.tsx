import { requireAdmin } from '@/lib/admin/auth'
import Link from 'next/link'
import BulkImportClient from './_BulkImportClient'
import LabelSearch from './_LabelSearch'

export default async function BulkImportPage() {
  await requireAdmin()

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Toplu İçe Aktarım</h1>
          <p className="text-slate-500 text-sm mt-1">
            Vefat listesi yükle, gözden geçir/temizle, ardından tüm kayıtları tek seferde oluştur.
            Oluşan profiller doğrulama beklemeden &quot;sahiplenilmeyi bekliyor&quot; durumunda başlar.
          </p>
        </div>
        <Link
          href="/admin/bulk-import/takip"
          className="shrink-0 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Takip Ekranı →
        </Link>
      </div>
      <BulkImportClient />
      <LabelSearch />
    </div>
  )
}
