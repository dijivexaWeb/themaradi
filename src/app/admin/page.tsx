import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { AlertTriangle, Clock, HeartPulse, Mail, ShieldCheck, Wallet } from 'lucide-react'

export default async function AdminDashboard() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const today = new Date().toISOString().split('T')[0]
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [
    { data: vaultStats },
    { count: openObjections },
    { count: pendingContacts },
    { count: overduePayments },
    { count: openAlerts },
    { data: recentAudit },
    { data: monthRevenue },
  ] = await Promise.all([
    supabase.from('vaults').select('status'),
    supabase.from('claim_objections').select('*', { count: 'exact', head: true }).in('status', ['pending', 'open']),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'overdue').lte('due_date', today),
    supabase.from('alive_alerts').select('*', { count: 'exact', head: true }).in('status', ['open', 'investigating']),
    supabase.from('admin_audit_logs').select('action, entity_type, admin_email, created_at').order('created_at', { ascending: false }).limit(10),
    supabase.from('payments').select('amount').eq('status', 'paid').gte('paid_at', monthStart),
  ])

  const byStatus = (status: string) => (vaultStats ?? []).filter((v) => v.status === status).length

  const statCards = [
    { label: 'Doğrulama Bekliyor', value: byStatus('pending_verification'), color: 'bg-yellow-50 border-yellow-200 text-yellow-800', href: '/admin/verifications', icon: ShieldCheck },
    { label: 'Açık İtirazlar', value: openObjections ?? 0, color: 'bg-red-50 border-red-200 text-red-800', href: '/admin/objections', icon: AlertTriangle },
    { label: 'Yeni Mesajlar', value: pendingContacts ?? 0, color: 'bg-blue-50 border-blue-200 text-blue-800', href: '/admin/contacts', icon: Mail },
    { label: 'Vadesi Geçmiş Ödeme', value: overduePayments ?? 0, color: 'bg-orange-50 border-orange-200 text-orange-800', href: '/admin/kasa', icon: Wallet },
    { label: 'Ben Yaşıyorum Bildirimi', value: openAlerts ?? 0, color: 'bg-purple-50 border-purple-200 text-purple-800', href: '/admin/alive-alerts', icon: HeartPulse },
    { label: 'Bu Ay Tahsilat (GEL)', value: (monthRevenue ?? []).reduce((s, p) => s + Number(p.amount), 0).toFixed(2), color: 'bg-emerald-50 border-emerald-200 text-emerald-800', href: '/admin/kasa', icon: Clock },
  ]

  const vaultSummary = [
    { label: 'hidden_vault', count: byStatus('hidden_vault'), color: 'bg-slate-100 text-slate-600' },
    { label: 'pending_verification', count: byStatus('pending_verification'), color: 'bg-yellow-100 text-yellow-700' },
    { label: 'private_memorial', count: byStatus('private_memorial'), color: 'bg-blue-100 text-blue-700' },
    { label: 'public_memorial', count: byStatus('public_memorial'), color: 'bg-emerald-100 text-emerald-700' },
    { label: 'suspended', count: byStatus('suspended'), color: 'bg-red-100 text-red-700' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Operasyon merkezi — kritik kuyruklar ve son aktivite</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`border rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow ${card.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide opacity-70">{card.label}</span>
              <card.icon className="h-4 w-4 opacity-60" />
            </div>
            <span className="text-3xl font-bold">{card.value}</span>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Recent Audit Log */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Son Admin Aksiyonları</h2>
            <Link href="/admin/audit" className="text-xs text-emerald-700 hover:underline">Tümünü gör</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {(recentAudit ?? []).length === 0 ? (
              <p className="text-sm text-slate-400 p-5">Henüz kayıt yok.</p>
            ) : (
              (recentAudit ?? []).map((log, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-slate-700">{log.action}</span>
                    <span className="text-slate-400 ml-2">on {log.entity_type}</span>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xs text-slate-500">{log.admin_email}</p>
                    <p className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString('tr-TR')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vault Status Summary */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-fit">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Vault Durumları</h2>
          </div>
          <div className="p-4 space-y-2">
            {vaultSummary.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
                <span className="text-sm font-bold text-slate-700">{s.count}</span>
              </div>
            ))}
          </div>
          <div className="px-5 pb-4">
            <Link href="/admin/memorials" className="text-xs text-emerald-700 hover:underline">
              Tüm vaultları yönet →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
