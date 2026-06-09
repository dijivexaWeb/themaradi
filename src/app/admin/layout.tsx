import { getAdminContext } from '@/lib/admin/auth'
import IdleLogout from '@/components/IdleLogout'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Soft check — no redirect. Each protected page calls requireAdmin() which does the redirect.
  // This way /admin/login is never caught in an infinite redirect loop.
  const ctx = await getAdminContext()

  if (!ctx) {
    // Unauthenticated or non-admin: render bare (page will redirect)
    return <div className="min-h-screen bg-slate-950">{children}</div>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <IdleLogout signoutPath="/admin/signout" redirectPath="/admin/login" />
      <AdminSidebar
        adminEmail={ctx.user.email ?? ''}
        adminName={(ctx.profile as { full_name?: string }).full_name ?? 'Admin'}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
