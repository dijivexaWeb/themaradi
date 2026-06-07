import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ purchased?: string }>
}

const REL_LABELS: Record<string, string> = {
  mother: 'Annesi', father: 'Babası', spouse: 'Eşi', son: 'Oğlu',
  daughter: 'Kızı', sibling: 'Kardeşi', grandparent: 'Büyükanne/Büyükbaba',
  grandchild: 'Torunu', other: 'Diğer',
}

export default async function VaultPage({ params, searchParams }: Props) {
  const { id } = await params
  const { purchased } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()
  if (!vault) notFound()

  const [
    { count: photoCount },
    { count: videoCount },
    { count: familyCount },
    { count: memoriesCount },
    { count: secretCount },
    { data: deathClaim },
  ] = await Promise.all([
    supabase.from('media').select('*', { count: 'exact', head: true }).eq('vault_id', id).eq('media_type', 'image'),
    supabase.from('media').select('*', { count: 'exact', head: true }).eq('vault_id', id).eq('media_type', 'video'),
    supabase.from('vault_family_members').select('*', { count: 'exact', head: true }).eq('vault_id', id),
    supabase.from('vault_memories').select('*', { count: 'exact', head: true }).eq('vault_id', id).eq('is_secret', false),
    supabase.from('vault_memories').select('*', { count: 'exact', head: true }).eq('vault_id', id).eq('is_secret', true),
    supabase.from('death_claims').select('id, status').eq('vault_id', id).order('created_at', { ascending: false }).limit(1),
  ])

  const hasDocument = (deathClaim?.length ?? 0) > 0
  const isMemorial = vault.product_type === 'memorial_profile'
  const isLocked = vault.status === 'pending_verification'

  // Completion %
  const checks = [
    { done: (vault.biography?.length ?? 0) > 50, weight: 15, label: 'Biyografi', href: 'biography' },
    { done: !!vault.birth_date && !!vault.death_date, weight: 10, label: 'Tarihler', href: 'profil' },
    { done: !!vault.tagline?.trim(), weight: 5, label: 'Kısa Özet', href: 'profil' },
    { done: !!vault.birth_place?.trim(), weight: 5, label: 'Doğum Yeri', href: 'profil' },
    { done: !!vault.cover_photo_url, weight: 10, label: 'Kapak Fotoğrafı', href: 'profil' },
    { done: (photoCount ?? 0) > 0, weight: 15, label: 'Fotoğraf', href: 'fotolar' },
    { done: (familyCount ?? 0) > 0, weight: 15, label: 'Aile Ağacı', href: 'aile' },
    { done: (memoriesCount ?? 0) > 0, weight: 10, label: 'Anılar', href: 'anilar' },
    { done: hasDocument, weight: 15, label: 'Belgeler', href: 'belgeler' },
  ]
  const completion = Math.round(checks.filter(c => c.done).reduce((s, c) => s + c.weight, 0))
  const missing = checks.filter(c => !c.done)

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending_verification: { label: 'Ödeme Bekleniyor', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    hidden_vault: { label: 'Gizli', color: 'text-slate-400', bg: 'bg-slate-800/60 border-slate-700' },
    private_memorial: { label: 'Özel Anma', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    public_memorial: { label: 'Yayında', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    suspended: { label: 'Askıya Alındı', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  }
  const status = statusConfig[vault.status ?? 'hidden_vault']

  const sections = [
    { href: `biography`, label: 'Biyografi', icon: '📖', desc: (vault.biography?.length ?? 0) > 0 ? `${vault.biography!.length} karakter` : 'Boş', done: (vault.biography?.length ?? 0) > 50 },
    { href: `profil`, label: 'Kişisel Bilgiler', icon: '👤', desc: vault.birth_date ? `${vault.birth_date}` : 'Doldurulmamış', done: !!vault.birth_date && !!vault.tagline },
    { href: `fotolar`, label: 'Fotoğraflar', icon: '📷', desc: `${photoCount ?? 0} / ${isMemorial ? 50 : '∞'} fotoğraf`, done: (photoCount ?? 0) > 0 },
    { href: `videolar`, label: 'Videolar', icon: '🎬', desc: `${videoCount ?? 0} video`, done: (videoCount ?? 0) > 0 },
    { href: `anilar`, label: 'Anılar', icon: '💭', desc: `${memoriesCount ?? 0} anı`, done: (memoriesCount ?? 0) > 0 },
    { href: `aile`, label: 'Aile Ağacı', icon: '🌳', desc: `${familyCount ?? 0} kişi`, done: (familyCount ?? 0) > 0 },
    { href: `belgeler`, label: 'Belgeler', icon: '📋', desc: hasDocument ? 'Yüklendi' : 'Yüklenmedi', done: hasDocument },
    ...(!isMemorial ? [
      { href: `gizli-kasa`, label: 'Gizli Kasa', icon: '🔐', desc: `${secretCount ?? 0} öğe`, done: (secretCount ?? 0) > 0 },
      { href: `heirs`, label: 'Varisler', icon: '👥', desc: 'Yönet', done: false },
    ] : []),
    { href: `onizleme`, label: 'Önizleme', icon: '👁️', desc: 'Nasıl görünecek?', done: true },
    { href: `settings`, label: 'Ayarlar', icon: '⚙️', desc: 'QR, yayın tercihleri', done: true },
  ]

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Purchased flash */}
        {purchased && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-4 flex items-start gap-3">
            <span className="text-amber-400 text-xl shrink-0">✓</span>
            <div>
              <p className="font-semibold text-amber-400">Kaydınız oluşturuldu!</p>
              <p className="text-sm text-slate-400 mt-0.5">
                Havaleni gönderdikten sonra ekibimiz 24 saat içinde hesabını aktive eder.
                Bu sırada aşağıdaki bilgileri doldurmaya başlayabilirsiniz.
              </p>
            </div>
          </div>
        )}

        {/* Pending verification banner */}
        {isLocked && (
          <div className="mb-6 bg-amber-900/20 border border-amber-500/40 rounded-xl px-5 py-4 flex items-start gap-3">
            <span className="text-2xl shrink-0">⏳</span>
            <div>
              <p className="font-semibold text-amber-400">Ödeme Doğrulanıyor</p>
              <p className="text-sm text-slate-400 mt-0.5">
                Havaleni aldıktan sonra hesabın aktive edilecek. Menülerde gezebilirsin,
                ancak içerik kaydetmek için doğrulamayı beklemen gerekiyor.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Kasalarım</Link>
          <span>/</span>
          <span className="text-slate-300">{vault.display_name}</span>
        </div>

        {/* Profile card */}
        <div className="glass border border-slate-800/60 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-100">{vault.display_name}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${status.color} ${status.bg}`}>
                  {status.label}
                </span>
                <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full border border-slate-700">
                  {isMemorial ? 'Anma Profili' : 'Yaşam Kasası'}
                </span>
              </div>
              {vault.tagline && <p className="text-slate-400 text-sm italic mb-1">{vault.tagline}</p>}
              {vault.slug && <p className="text-xs text-slate-600">themaradi.com/memorial/{vault.slug}</p>}
            </div>
            <Link href={`/dashboard/vault/${id}/onizleme`}
              className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition-colors shrink-0">
              👁️ Önizleme
            </Link>
          </div>

          {/* Completion */}
          <div className="mt-5 pt-5 border-t border-slate-800/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">Profil Tamamlanma</span>
              <span className={`text-sm font-bold ${completion >= 80 ? 'text-emerald-400' : completion >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                %{completion}
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${completion >= 80 ? 'bg-emerald-500' : completion >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${Math.max(completion, 2)}%` }}
              />
            </div>
            {missing.length > 0 && completion < 100 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {missing.slice(0, 4).map(m => (
                  <Link key={m.label} href={`/dashboard/vault/${id}/${m.href}`}
                    className="text-[11px] bg-slate-800/80 text-slate-400 hover:text-amber-300 border border-slate-700 px-2 py-0.5 rounded-full transition-colors">
                    + {m.label}
                  </Link>
                ))}
                {missing.length > 4 && (
                  <span className="text-[11px] text-slate-600 px-2 py-0.5">+{missing.length - 4} daha</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sections.map((s) => (
            <Link key={s.href} href={`/dashboard/vault/${id}/${s.href}`}
              className={`glass border rounded-2xl p-4 flex items-center gap-3 hover:border-amber-500/30 transition-all group ${
                s.done ? 'border-slate-800/60' : 'border-slate-800/40 opacity-90'
              }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                s.done ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-800 border border-slate-700'
              }`}>
                {s.done ? '✅' : s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-100 text-sm group-hover:text-amber-300 transition-colors">{s.label}</div>
                <div className="text-xs text-slate-500 truncate">{s.desc}</div>
              </div>
              <svg className="w-4 h-4 text-slate-700 group-hover:text-amber-400 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Public if active */}
        {vault.status === 'public_memorial' && vault.slug && (
          <div className="mt-6 glass border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-emerald-400 mb-1">Anma Sayfası Yayında</div>
              <p className="text-xs text-slate-500">QR kodu okutulduğunda bu sayfaya yönlendirilir</p>
            </div>
            <Link href={`/memorial/${vault.slug}`} target="_blank"
              className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors">
              Sayfayı Aç →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
