import { requireAdmin } from '@/lib/admin/auth'
import Link from 'next/link'
import CreateMemorialForm from './_CreateMemorialForm'

export default async function CreateMemorialPage() {
  await requireAdmin()

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/memorials" className="text-xs text-slate-400 hover:text-slate-700">← Memoriallar</Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-xl font-bold text-slate-900">Yeni Memorial Profili Oluştur</h1>
      </div>
      <CreateMemorialForm />
    </div>
  )
}
