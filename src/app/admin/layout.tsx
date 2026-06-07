import { requireAdmin } from '@/lib/admin/auth'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile } = await requireAdmin()

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <AdminSidebar adminEmail={user.email ?? ''} adminName={profile.full_name ?? ''} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
