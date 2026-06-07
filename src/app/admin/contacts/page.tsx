import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import StatusBadge from '../_components/StatusBadge'
import ContactStatusForm from './_ContactStatusForm'

export default async function ContactsPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { data: messages } = await supabase
    .from('contact_messages')
    .select('id, name, email, subject, message, status, admin_note, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">İletişim Mesajları</h1>
        <p className="text-slate-500 text-sm mt-1">İletişim formundan gelen talepler</p>
      </div>

      <div className="space-y-3">
        {(messages ?? []).length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
            Mesaj yok.
          </div>
        )}
        {(messages ?? []).map((m) => (
          <details key={m.id} className="bg-white border border-slate-200 rounded-xl shadow-sm group">
            <summary className="px-5 py-4 cursor-pointer list-none flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-400">{m.email} · {new Date(m.created_at).toLocaleDateString('tr-TR')}</p>
                </div>
                <span className="text-sm text-slate-600">{m.subject}</span>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={m.status} />
                <span className="text-slate-400 group-open:rotate-180 transition-transform text-xs">▼</span>
              </div>
            </summary>
            <div className="px-5 pb-5 border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-700 whitespace-pre-wrap mb-4">{m.message}</p>
              {m.admin_note && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 mb-4">
                  <span className="font-medium">Admin Notu:</span> {m.admin_note}
                </div>
              )}
              <ContactStatusForm messageId={m.id} currentStatus={m.status} currentNote={m.admin_note ?? ''} />
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
