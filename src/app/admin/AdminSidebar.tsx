'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  ShieldCheck,
  Wallet,
  BookOpen,
  AlertTriangle,
  MessageSquare,
  Users,
  HeartPulse,
  Mail,
  Inbox,
  UserCircle,
  FileText,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Package,
  HardDrive,
  Send,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/storage', label: 'Depolama', icon: HardDrive },
  { href: '/admin/verifications', label: 'Doğrulama', icon: ShieldCheck },
  { href: '/admin/kasa', label: 'Kasa / Ödemeler', icon: Wallet },
  { href: '/admin/kargo', label: 'Kargo Takibi', icon: Package },
  { href: '/admin/memorials', label: 'Memoriallar', icon: BookOpen },
  { href: '/admin/objections', label: 'İtirazlar', icon: AlertTriangle },
  { href: '/admin/guestbook', label: 'Ziyaretçi Defteri', icon: MessageSquare },
  { href: '/admin/heirs', label: 'Varisler', icon: Users },
  { href: '/admin/alive-alerts', label: 'Ben Yaşıyorum', icon: HeartPulse },
  { href: '/admin/email', label: 'Email Ayarları', icon: Mail },
  { href: '/admin/inbox', label: 'Gelen Kutusu', icon: Inbox },
  { href: '/admin/toplu-mail', label: 'Toplu Mail', icon: Send },
  { href: '/admin/contacts', label: 'İletişim Formu', icon: MessageSquare },
  { href: '/admin/users', label: 'Kullanıcılar', icon: UserCircle },
  { href: '/admin/gdpr', label: 'GDPR', icon: FileText },
  { href: '/admin/audit', label: 'Audit Log', icon: ClipboardList },
  { href: '/admin/settings', label: 'Ayarlar', icon: Settings },
]

interface Props {
  adminEmail: string
  adminName: string
}

export default function AdminSidebar({ adminEmail, adminName }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const sidebar = (
    <aside className="flex flex-col h-full w-64 bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-0.5">The Eternal Memory</p>
          <p className="text-sm font-bold text-white">Admin Panel</p>
        </div>
        <button
          className="lg:hidden text-slate-400 hover:text-white"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group ${
              isActive(href)
                ? 'bg-slate-700 text-white font-medium'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {isActive(href) && <ChevronRight className="h-3 w-3 text-slate-400" />}
          </Link>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-slate-700 p-4">
        <div className="mb-3">
          <p className="text-xs font-medium text-white truncate">{adminName || 'Admin'}</p>
          <p className="text-xs text-slate-400 truncate">{adminEmail}</p>
        </div>
        <form action="/admin/signout" method="post">
          <button
            type="submit"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </form>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full shrink-0">
        {sidebar}
      </div>

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-0 left-0 z-50">
        <button
          className="m-3 p-2 rounded-lg bg-slate-900 text-white"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex h-full">{sidebar}</div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  )
}
