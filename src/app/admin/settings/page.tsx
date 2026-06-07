import { requireAdmin } from '@/lib/admin/auth'

export default async function SettingsPage() {
  await requireAdmin()

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Ayarlar</h1>
        <p className="text-slate-500 text-sm mt-1">Platform yapılandırması</p>
      </div>

      <div className="space-y-4">
        <SettingCard
          label="Bakım Modu"
          description="Aktif edildiğinde site tüm kullanıcılara bakım sayfası gösterir."
          type="toggle"
          value={false}
          disabled
        />
        <SettingCard
          label="Maksimum Dosya Boyutu"
          description="Yükleme başına izin verilen maksimum dosya boyutu (MB)."
          type="text"
          value="50"
          disabled
        />
        <SettingCard
          label="Varsayılan Dil"
          description="Yeni kullanıcılar için varsayılan platform dili."
          type="text"
          value="tr"
          disabled
        />
        <SettingCard
          label="GDPR SLA (gün)"
          description="GDPR taleplerinin tamamlanması için maksimum süre."
          type="text"
          value="30"
          disabled
        />
        <SettingCard
          label="Doğrulama Penceresi (gün)"
          description="Vault doğrulama talebinin geçerli olduğu süre."
          type="text"
          value="14"
          disabled
        />
      </div>

      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-700 font-medium">Geliştirme Notu</p>
        <p className="text-xs text-amber-600 mt-1">
          Bu ayarlar şu an görsel placeholder'dır. Gerçek backend entegrasyonu bir sonraki sprintte eklecenecek.
        </p>
      </div>
    </div>
  )
}

function SettingCard({
  label,
  description,
  type,
  value,
  disabled = false,
}: {
  label: string
  description: string
  type: 'toggle' | 'text'
  value: string | boolean
  disabled?: boolean
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-slate-800 text-sm">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      {type === 'toggle' ? (
        <div className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-emerald-600' : 'bg-slate-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
        </div>
      ) : (
        <input
          type="text"
          defaultValue={value as string}
          disabled={disabled}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none w-28 text-right disabled:bg-slate-50 disabled:text-slate-400"
        />
      )}
    </div>
  )
}
