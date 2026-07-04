interface Props {
  status: string
}

const config: Record<string, { label: string; cls: string }> = {
  // Vault statuses
  hidden_vault:         { label: 'Gizli Kasa',          cls: 'bg-slate-100 text-slate-600' },
  pending_verification: { label: 'Doğrulama Bekliyor',  cls: 'bg-yellow-100 text-yellow-700' },
  private_memorial:     { label: 'Özel Anma',           cls: 'bg-blue-100 text-blue-700' },
  public_memorial:      { label: 'Yayında',             cls: 'bg-emerald-100 text-emerald-700' },
  suspended:            { label: 'Askıya Alındı',       cls: 'bg-red-100 text-red-700' },
  // Payment statuses
  order_created:        { label: 'Sipariş Oluşturuldu', cls: 'bg-sky-100 text-sky-700' },
  pending:              { label: 'Ödeme Bekliyor',      cls: 'bg-yellow-100 text-yellow-700' },
  payment_verification: { label: 'Doğrulama Bekliyor',  cls: 'bg-amber-100 text-amber-700' },
  paid:                 { label: 'Ödendi',              cls: 'bg-emerald-100 text-emerald-700' },
  info_pending:         { label: 'Bilgi Bekleniyor',    cls: 'bg-orange-100 text-orange-700' },
  profile_preparing:    { label: 'Profil Hazırlanıyor', cls: 'bg-blue-100 text-blue-700' },
  publish_approval:     { label: 'Yayın Onayı Bekliyor',cls: 'bg-purple-100 text-purple-700' },
  published:            { label: 'Yayında',             cls: 'bg-emerald-100 text-emerald-700' },
  overdue:              { label: 'Vadesi Geçmiş',       cls: 'bg-red-100 text-red-700' },
  failed:               { label: 'Başarısız',           cls: 'bg-red-100 text-red-700' },
  refunded:             { label: 'İade Edildi',         cls: 'bg-slate-100 text-slate-600' },
  cancelled:            { label: 'İptal',               cls: 'bg-slate-100 text-slate-500' },
  // Contact / objection / alert statuses
  new:                  { label: 'Yeni',                cls: 'bg-sky-100 text-sky-700' },
  in_progress:          { label: 'İşlemde',             cls: 'bg-blue-100 text-blue-700' },
  resolved:             { label: 'Çözüldü',             cls: 'bg-emerald-100 text-emerald-700' },
  completed:            { label: 'Tamamlandı',          cls: 'bg-emerald-100 text-emerald-700' },
  approved:             { label: 'Onaylandı',           cls: 'bg-emerald-100 text-emerald-700' },
  rejected:             { label: 'Reddedildi',          cls: 'bg-red-100 text-red-700' },
  open:                 { label: 'Açık',                cls: 'bg-orange-100 text-orange-700' },
  investigating:        { label: 'İnceleniyor',         cls: 'bg-purple-100 text-purple-700' },
  dismissed:            { label: 'Kapatıldı',           cls: 'bg-slate-100 text-slate-500' },
  spam:                 { label: 'Spam',                cls: 'bg-slate-100 text-slate-500' },
  // Roles
  admin:                { label: 'Admin',               cls: 'bg-purple-100 text-purple-700' },
  moderator:            { label: 'Moderatör',           cls: 'bg-blue-100 text-blue-700' },
  user:                 { label: 'Kullanıcı',           cls: 'bg-slate-100 text-slate-600' },
}

export default function StatusBadge({ status }: Props) {
  const { label, cls } = config[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' }
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  )
}
