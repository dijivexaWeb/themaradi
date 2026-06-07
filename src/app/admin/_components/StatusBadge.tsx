interface Props {
  status: string
}

const colors: Record<string, string> = {
  // Vault statuses
  hidden_vault: 'bg-slate-100 text-slate-600',
  pending_verification: 'bg-yellow-100 text-yellow-700',
  private_memorial: 'bg-blue-100 text-blue-700',
  public_memorial: 'bg-emerald-100 text-emerald-700',
  suspended: 'bg-red-100 text-red-700',
  // Generic
  new: 'bg-sky-100 text-sky-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  spam: 'bg-slate-100 text-slate-500',
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-slate-100 text-slate-500',
  open: 'bg-orange-100 text-orange-700',
  investigating: 'bg-purple-100 text-purple-700',
  dismissed: 'bg-slate-100 text-slate-500',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-emerald-100 text-emerald-700',
  // Roles
  admin: 'bg-purple-100 text-purple-700',
  moderator: 'bg-blue-100 text-blue-700',
  user: 'bg-slate-100 text-slate-600',
}

export default function StatusBadge({ status }: Props) {
  const cls = colors[status] ?? 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {status}
    </span>
  )
}
