import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  BookOpen, Eye, FileText, Heart,
  ImageIcon, LockKeyhole, MessageCircle, QrCode,
  Scroll, Shield, Users, Video, UserRound, Leaf,
} from 'lucide-react'
import type { ComponentType } from 'react'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ purchased?: string }>
}

type Section = {
  href: string
  label: string
  meta: string
  done: boolean
  icon: ComponentType<{ className?: string }>
}

export default async function MemoryAreaPage({ params, searchParams }: Props) {
  const { id } = await params
  const { purchased } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: area } = await supabase
    .from('vaults').select('*')
    .eq('id', id).eq('owner_id', user.id).single()
  if (!area) notFound()

  const [
    { count: photoCount },
    { count: videoCount },
    { count: familyCount },
    { count: memoriesCount },
    { count: secretCount },
    { count: vasiyetCount },
    { count: heirCount },
    { count: guestbookCount },
    { count: documentCount },
    { data: linkedQRs },
  ] = await Promise.all([
    supabase.from('media').select('*', { count: 'exact', head: true }).eq('vault_id', id).eq('media_type', 'image'),
    supabase.from('media').select('*', { count: 'exact', head: true }).eq('vault_id', id).eq('media_type', 'video'),
    supabase.from('vault_family_members').select('*', { count: 'exact', head: true }).eq('vault_id', id),
    supabase.from('vault_memories').select('*', { count: 'exact', head: true }).eq('vault_id', id).eq('is_secret', false),
    supabase.from('vault_memories').select('*', { count: 'exact', head: true }).eq('vault_id', id).eq('is_secret', true).eq('section', 'general'),
    supabase.from('vault_memories').select('*', { count: 'exact', head: true }).eq('vault_id', id).eq('section', 'vasiyet'),
    supabase.from('heirs').select('*', { count: 'exact', head: true }).eq('vault_id', id).neq('status', 'revoked'),
    supabase.from('guestbook').select('*', { count: 'exact', head: true }).eq('vault_id', id),
    supabase.from('vault_documents').select('*', { count: 'exact', head: true }).eq('vault_id', id),
    supabase.from('dynamic_qr').select('qr_hash, redirect_count').eq('target_vault_id', id),
  ])

  const isMemorial = area.product_type === 'memorial_profile'
  const isLocked = area.status === 'pending_verification'
  const publicUrl = area.slug ? `themaradi.com/ani-alanim/${area.slug}` : null
  const qrActive = (linkedQRs?.length ?? 0) > 0

  const checks = [
    { done: !!area.birth_date && !!area.tagline, weight: 10 },
    { done: (area.biography?.length ?? 0) > 50, weight: 13 },
    { done: (familyCount ?? 0) > 0, weight: 12 },
    { done: (heirCount ?? 0) > 0, weight: 10 },
    { done: (memoriesCount ?? 0) > 0, weight: 10 },
    { done: (photoCount ?? 0) > 0, weight: 13 },
    { done: (videoCount ?? 0) > 0, weight: 8 },
    { done: (secretCount ?? 0) > 0, weight: 8 },
    { done: (vasiyetCount ?? 0) > 0, weight: 8 },
    { done: (documentCount ?? 0) > 0, weight: 8 },
  ]
  const completion = Math.min(100, Math.round(checks.filter(c => c.done).reduce((sum, c) => sum + c.weight, 0)))

  const statusConfig: Record<string, { label: string; cls: string }> = {
    pending_verification: { label: 'Doğrulama Bekliyor', cls: 'bg-[#fff4dc] text-[#93620f] border-[#ead4a5]' },
    hidden_vault:        { label: 'Gizli Alan',          cls: 'bg-[#eef1ea] text-[#496056] border-[#dfe6d8]' },
    private_memorial:    { label: 'Özel Anma',           cls: 'bg-[#eef1ea] text-[#174f35] border-[#dfe6d8]' },
    public_memorial:     { label: 'Yayında',             cls: 'bg-[#e9f5ec] text-[#176b3f] border-[#cfe7d3]' },
    suspended:           { label: 'Askıda',              cls: 'bg-red-50 text-red-700 border-red-200' },
  }
  const status = statusConfig[area.status ?? 'hidden_vault'] ?? statusConfig.hidden_vault

  const birthYear = area.birth_date ? new Date(area.birth_date).getFullYear() : null
  const deathYear = area.death_date ? new Date(area.death_date).getFullYear() : null

  const sections: (Section & { num: number })[] = [
    { num: 1,  href: 'profil',     label: 'Kişisel Bilgiler',  meta: area.birth_date ? 'Temel bilgiler var' : 'Doğum tarihi, konum, söz ekleyin',    done: !!area.birth_date && !!area.tagline, icon: UserRound },
    { num: 2,  href: 'biography',  label: 'Biyografi',         meta: (area.biography?.length ?? 0) > 0 ? `${area.biography!.length} karakter` : 'Henüz yazılmadı', done: (area.biography?.length ?? 0) > 50, icon: BookOpen },
    { num: 3,  href: 'aile',       label: 'Aile Bağları',      meta: (familyCount ?? 0) > 0 ? `${familyCount} kişi` : 'Aile üyesi eklenmedi',        done: (familyCount ?? 0) > 0, icon: Users },
    { num: 4,  href: 'heirs',      label: 'Varis Bilgileri',   meta: (heirCount ?? 0) > 0 ? `${heirCount} yetkili` : 'Yetkili kişi eklenmedi',       done: (heirCount ?? 0) > 0, icon: Shield },
    { num: 5,  href: 'anilar',     label: 'Anılar',            meta: (memoriesCount ?? 0) > 0 ? `${memoriesCount} anı` : 'Henüz anı eklenmedi',       done: (memoriesCount ?? 0) > 0, icon: MessageCircle },
    { num: 6,  href: 'fotolar',    label: 'Fotoğraflar',       meta: (photoCount ?? 0) > 0 ? `${photoCount} fotoğraf` : 'Henüz fotoğraf yok',         done: (photoCount ?? 0) > 0, icon: ImageIcon },
    { num: 7,  href: 'videolar',   label: 'Videolar',          meta: (videoCount ?? 0) > 0 ? `${videoCount} video` : 'Henüz video eklenmedi',         done: (videoCount ?? 0) > 0, icon: Video },
    { num: 8,  href: 'gizli-kasa', label: 'Özel İçerikler',   meta: (secretCount ?? 0) > 0 ? `${secretCount} içerik` : 'Özel not eklenmedi',         done: (secretCount ?? 0) > 0, icon: LockKeyhole },
    { num: 9,  href: 'vasiyet',    label: 'Vasiyetname',       meta: (vasiyetCount ?? 0) > 0 ? `${vasiyetCount} kayıt` : 'Vasiyet kaydı yok',         done: (vasiyetCount ?? 0) > 0, icon: Scroll },
    { num: 10, href: 'belgeler',   label: 'Belgeler',          meta: (documentCount ?? 0) > 0 ? `${documentCount} belge` : 'Belge yüklenmedi',         done: (documentCount ?? 0) > 0, icon: FileText },
    { num: 11, href: 'settings',   label: 'Yayın & QR',        meta: qrActive ? 'QR aktif' : area.slug ? 'Sayfa adresi var' : 'Ayarlanmadı',          done: qrActive || !!area.slug, icon: QrCode },
  ]

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-sm text-[#788177]">
          <Link href="/dashboard" className="transition-colors hover:text-[#174f35]">Anı Alanım</Link>
          <span>/</span>
          <span className="font-semibold text-[#22362e]">{area.display_name}</span>
        </div>

        {/* Banners */}
        {purchased && (
          <div className="mb-4 rounded-2xl border border-[#dfbd72]/40 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Alanınız oluşturuldu. Ödeme doğrulandıktan sonra tüm içerikleri kaydedebilirsiniz.
          </div>
        )}
        {isLocked && (
          <div className="mb-4 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulaması bekleniyor. Bu sırada sayfaları gezebilirsiniz.
          </div>
        )}

        <div className="flex gap-7 items-start">

          {/* ── SOL: Motivasyon + Bölümler listesi ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Motivasyon kartı */}
            <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-5 flex items-center gap-4 shadow-[0_4px_20px_rgba(64,48,24,0.05)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#dfbd72]/40 bg-[#f8efd8] text-[#b08340]">
                <Leaf className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-serif text-sm text-[#1f2d27] leading-snug">Hatıralar paylaşıldıkça çoğalır.</p>
                <p className="text-xs text-[#788177] mt-0.5">Her bölümü doldurdukça anı sayfanız anlam kazanır.</p>
              </div>
            </div>

            {/* Bölümler listesi */}
            <div>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <p className="text-[10px] font-semibold text-[#adb5ab] uppercase tracking-widest">Bölümler</p>
                <p className="text-[10px] text-[#adb5ab]">
                  {sections.filter(s => s.done).length} / {sections.length} tamamlandı
                </p>
              </div>

              <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] overflow-hidden shadow-[0_4px_24px_rgba(64,48,24,0.05)]">
                {sections.map(({ num, href, label, meta, done, icon: Icon }) => (
                  <Link key={href} href={`/dashboard/vault/${id}/${href}`}
                    className="group flex items-center gap-3 px-4 py-3.5 hover:bg-[#f5efdf] transition-colors border-b border-[#f0ebe0] last:border-0">

                    {/* Sıra no */}
                    <span className="w-5 shrink-0 text-center text-[11px] font-bold text-[#c8bfb0] group-hover:text-[#788177] transition-colors">
                      {String(num).padStart(2, '0')}
                    </span>

                    {/* Status dot */}
                    <span className={`shrink-0 h-2 w-2 rounded-full transition-colors ${done ? 'bg-[#174f35]' : 'bg-red-400'}`} />

                    {/* Icon */}
                    <span className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${done ? 'bg-[#174f35]/8 text-[#174f35]' : 'bg-red-50 text-red-400'}`}>
                      <Icon className="h-4 w-4" />
                    </span>

                    {/* Label + meta */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1f2d27] leading-tight">{label}</p>
                      <p className={`text-xs mt-0.5 truncate ${done ? 'text-[#174f35] font-medium' : 'text-red-400'}`}>{meta}</p>
                    </div>

                    {/* Arrow */}
                    <span className="text-[#c8bfb0] group-hover:text-[#174f35] text-base transition-colors shrink-0">›</span>
                  </Link>
                ))}

                {/* Önizleme — her zaman altın */}
                <Link href={`/dashboard/vault/${id}/onizleme`}
                  className="group flex items-center gap-3 px-4 py-3.5 hover:bg-[#f5efdf] transition-colors">
                  <span className="w-5 shrink-0 text-center text-[11px] font-bold text-[#dfbd72]">👁</span>
                  <span className="shrink-0 h-2 w-2 rounded-full bg-[#dfbd72]" />
                  <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-[#dfbd72]/10 text-[#b08340]">
                    <Eye className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1f2d27] leading-tight">Önizleme</p>
                    <p className="text-xs mt-0.5 text-[#b08340] font-medium">Ziyaretçi bakışı</p>
                  </div>
                  <span className="text-[#c8bfb0] group-hover:text-[#174f35] text-base transition-colors shrink-0">›</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ── SAĞ: Profil kartı (sticky) ── */}
          <div className="hidden lg:flex w-72 shrink-0 flex-col gap-4 sticky top-8">
            <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] overflow-hidden shadow-[0_4px_24px_rgba(64,48,24,0.06)]">

              {/* Avatar */}
              <div className="relative h-36 w-full bg-[#f1eadb]">
                {area.cover_photo_url ? (
                  <Image src={area.cover_photo_url} alt={area.display_name} fill className="object-cover" unoptimized />
                ) : (
                  <Image src="/images/landing/memorial-hero-cemetery.png" alt="Anı alanı görseli" fill className="object-cover opacity-40" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#fffdf8] to-transparent" />
              </div>

              <div className="px-5 pb-5 -mt-4 relative">
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${status.cls}`}>{status.label}</span>
                  <span className="rounded-full border border-[#eadfca] bg-[#fbf5e8] px-2.5 py-0.5 text-[11px] font-semibold text-[#9a6b22]">
                    {isMemorial ? 'Anı Profili' : 'Yaşam Anısı'}
                  </span>
                </div>

                {/* Name */}
                <h1 className="font-serif text-xl text-[#1f2d27] leading-tight mb-1">{area.display_name}</h1>

                {/* Years */}
                {(birthYear || deathYear) && (
                  <p className="font-serif text-sm text-[#788177] mb-2">
                    {birthYear ?? '?'} – {deathYear ?? '...'}
                  </p>
                )}

                {/* Tagline */}
                {area.tagline ? (
                  <p className="font-serif text-xs italic text-[#7a7467] leading-5 mb-3">"{area.tagline}"</p>
                ) : (
                  <Link href={`/dashboard/vault/${id}/profil`}
                    className="block text-xs text-[#adb5ab] italic mb-3 hover:text-[#174f35] transition-colors">
                    + Kısa bir söz ekleyin...
                  </Link>
                )}

                {/* URL */}
                {publicUrl ? (
                  <Link href={`/memorial/${area.slug}`} target="_blank"
                    className="block text-xs text-[#174f35] font-medium hover:underline mb-4 truncate">
                    {publicUrl} →
                  </Link>
                ) : (
                  <Link href={`/dashboard/vault/${id}/settings`}
                    className="block text-xs text-[#adb5ab] hover:text-[#174f35] transition-colors mb-4">
                    + Sayfa adresi belirleyin
                  </Link>
                )}

                {/* Progress */}
                <div className="rounded-2xl border border-[#eadfca] bg-white/80 px-4 py-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-[#23382f]">Profil Tamamlanma</p>
                    <p className="text-sm font-bold text-[#174f35]">%{completion}</p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#f1eadb]">
                    <div className="h-full rounded-full bg-[#174f35] transition-all" style={{ width: `${Math.max(completion, 4)}%` }} />
                  </div>
                  {completion < 100 && (
                    <p className="text-[11px] text-[#adb5ab] mt-2">
                      {sections.filter(s => !s.done).length} bölüm eksik
                    </p>
                  )}
                </div>

                {/* Önizle butonu */}
                <Link href={`/dashboard/vault/${id}/onizleme`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#174f35] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors">
                  <Eye className="h-4 w-4" />
                  Önizle
                </Link>
              </div>
            </div>

            {/* Taziye defteri */}
            {(guestbookCount ?? 0) > 0 && (
              <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="h-4 w-4 text-[#dfbd72]" />
                  <p className="text-xs font-semibold text-[#174f35]">Taziye Defteri</p>
                </div>
                <p className="text-3xl font-bold text-[#1f2d27]">{guestbookCount}</p>
                <p className="text-xs text-[#7b837d]">mesaj bırakıldı</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
