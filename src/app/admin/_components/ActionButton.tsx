'use client'

interface Props {
  action: () => Promise<{ success: boolean; error?: string }>
  label: string
  variant?: 'primary' | 'danger' | 'secondary'
  confirmMessage?: string
}

export default function ActionButton({ action, label, variant = 'primary', confirmMessage }: Props) {
  async function handleClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) return
    const result = await action()
    if (!result.success) alert(result.error ?? 'Hata oluştu')
  }

  const cls = {
    primary: 'bg-emerald-700 text-white hover:bg-emerald-800',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    secondary: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
  }[variant]

  return (
    <button
      onClick={handleClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${cls}`}
    >
      {label}
    </button>
  )
}
