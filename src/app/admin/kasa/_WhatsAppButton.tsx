import { buildWhatsAppAdminReplyLink } from '@/lib/whatsapp'

export default function WhatsAppButton({
  phone,
  orderCode,
  locale,
}: {
  phone: string | null
  orderCode: string | null
  locale: string | null
}) {
  if (!phone || !orderCode) return <span className="text-xs text-slate-300">—</span>

  const href = buildWhatsAppAdminReplyLink({ phone, orderCode, locale: locale ?? undefined })

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium text-[#128C7E] hover:text-[#0f6f63] bg-[#25D366]/10 hover:bg-[#25D366]/20 px-2 py-1 rounded-lg transition-colors"
    >
      💬 WhatsApp Aç
    </a>
  )
}
