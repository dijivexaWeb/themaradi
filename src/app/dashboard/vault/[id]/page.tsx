import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  BookOpen, CalendarCheck, Eye, FileText, Heart,
  ImageIcon, Leaf, LockKeyhole, MessageCircle, QrCode,
  Scroll, Shield, Users, Video, UserRound,
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
    { count: publicPhotoCount },
    { count: videoCount },
    { count: publicVideoCount },
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
    supabase.from('media').select('*', { count: 'exact', head: true }).eq('vault_id', id).eq('media_type', 'image').eq('is_public', true),
    supabase.from('media').select('*', { count: 'exact', head: true }).eq('vault_id', id).eq('media_type', 'video'),
    supabase.from('media').select('*', { count: 'exact', head: true }).eq('vault_id', id).eq('media_type', 'video').eq('is_public', true),
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
    { done: (area.biography?.length ?? 0) > 50, weight: 10 },
    { done: !!area.birth_date && !!area.death_date, weight: 8 },
    { done: !!area.tagline?.trim(), weight: 5 },
    { done: !!area.cover_photo_url, weight: 8 },
    { done: (photoCount ?? 0) > 0, weight: 10 },
    { done: (videoCount ?? 0) > 0, weight: 7 },
    { done: (memoriesCount ?? 0) > 0, weight: 8 },
    { done: (familyCount ?? 0) > 0, weight: 10 },
    { done: (documentCount ?? 0) > 0, weight: 7 },
    { done: (vasiyetCount ?? 0) > 0, weight: 7 },
    { done: !!area.slug || qrActive, weight: 8 },
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

  const sections: Section[] = [
    { href: 'profil',     label: 'Kişisel Bilgiler',  meta: area.birth_date ? 'Temel bilgiler var' : 'Tamamlanmalı',                                          done: !!area.birth_date && !!area.tagline, icon: UserRound },
    { href: 'biography',  label: 'Hayat Hikayesi',    meta: (area.biography?.length ?? 0) > 0 ? `${area.biography!.length} karakter` : 'Henüz yazılmadı',     done: (area.biography?.length ?? 0) > 50, icon: BookOpen },
    { href: 'aile',       label: 'Aile Bağları',      meta: (familyCount ?? 0) > 0 ? `${familyCount} kişi` : 'Eklenmedi',                                     done: (familyCount ?? 0) > 0, icon: Users },
    { href: 'heirs',      label: 'Varis Bilgileri',   meta: (heirCount ?? 0) > 0 ? `${heirCount} yetkili` : 'Eklenmedi',                                      done: (heirCount ?? 0) > 0, icon: Shield },
    { href: 'anilar',     label: 'Anılar',            meta: (memoriesCount ?? 0) > 0 ? `${memoriesCount} anı` : 'Anı yok',                                    done: (memoriesCount ?? 0) > 0, icon: MessageCircle },
    { href: 'fotolar',    label: 'Fotoğraflar',       meta: (photoCount ?? 0) > 0 ? `${photoCount} fotoğraf · ${publicPhotoCount} açık` : 'Fotoğraf yok',     done: (photoCount ?? 0) > 0, icon: ImageIcon },
    { href: 'videolar',   label: 'Videolar',          meta: (videoCount ?? 0) > 0 ? `${videoCount} video · ${publicVideoCount} açık` : 'Video yok',           done: (videoCount ?? 0) > 0, icon: Video },
    { href: 'gizli-kasa', label: 'Özel İçerikler',   meta: (secretCount ?? 0) > 0 ? `${secretCount} içerik` : 'İçerik yok',                                  done: (secretCount ?? 0) > 0, icon: LockKeyhole },
    { href: 'vasiyet',    label: 'Vasiyetname',       meta: (vasiyetCount ?? 0) > 0 ? `${vasiyetCount} kayıt` : 'Vasiyet girilmedi',                          done: (vasiyetCount ?? 0) > 0, icon: Scroll },
    { href: 'belgeler',   label: 'Belgeler',          meta: (documentCount ?? 0) > 0 ? `${documentCount} belge` : 'Belge yok',                                done: (documentCount ?? 0) > 0, icon: FileText },
    { href: 'settings',   label: 'Yayın & QR',        meta: qrActive ? 'QR aktif' : area.slug ? 'Slug var' : 'Ayarlanmadı',                                   done: qrActive || !!area.slug, icon: QrCode },
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

        {/* Profil başlık kartı — tam genişlik üstte */}
        <div className="mb-6 rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-5 shadow-[0_4px_24px_rgba(64,48,24,0.06)] sm:p-7">
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 shrink-0 rounded-full border-2 border-[#dfbd72] bg-[#f8efd8] shadow-md overflow-hidden">
              {area.cover_photo_url ? (
                <Image src={area.cover_photo_url} alt={area.display_name} fill className="object-cover" unoptimized />
              ) : (
                <Image src="/images/landing/memorial-hero-cemetery.png" alt="Anı alanı görseli" fill className="object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-serif text-2xl text-[#1f2d27] sm:text-3xl">{area.display_name}</h1>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.cls}`}>{status.label}</span>
                <span className="rounded-full border border-[#eadfca] bg-[#fbf5e8] px-2.5 py-0.5 text-xs font-semibold text-[#9a6b22]">
                  {isMemorial ? 'Anı Profili' : 'Yaşam Anısı'}
                </span>
              </div>
              {(birthYear || deathYear) && (
                <p className="font-serif text-sm text-[#788177] mb-1">{birthYear ?? '?'} – {deathYear ?? '...'}</p>
              )}
              {area.tagline && (
                <p className="font-serif text-sm italic text-[#7a7467]">"{area.tagline}"</p>
              )}
              {publicUrl && (
                <Link href={`/memorial/${area.slug}`} target="_blank"
                  className="mt-1 inline-block text-xs text-[#174f35] font-medium hover:underline">
                  {publicUrl} →
                </Link>
              )}
            </div>
            <Link href={`/dashboard/vault/${id}/onizleme`}
              className="hidden sm:inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#174f35] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors">
              <Eye className="h-4 w-4" />
              Önizle
            </Link>
          </div>
          <div className="mt-5 rounded-2xl border border-[#eadfca] bg-white/70 px-4 py-3.5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-[#23382f]">Profil Tamamlanma</p>
              <p className="text-sm font-bold text-[#174f35]">%{completion}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#f1eadb]">
              <div className="h-full rounded-full bg-[#174f35] transition-all" style={{ width: `${Math.max(completion, 4)}%` }} />
            </div>
          </div>
        </div>

        {/* İki kolon: sol liste + sağ widget'lar */}
        <div className="flex gap-6 items-start">

          {/* Sol: bölüm listesi */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-[#adb5ab] uppercase tracking-widest mb-2.5 px-1">Bölümler</p>
            <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] overflow-hidden shadow-[0_4px_24px_rgba(64,48,24,0.05)]">
              {sections.map(({ href, label, meta, done, icon: Icon }, i) => (
                <Link key={href} href={`/dashboard/vault/${id}/${href}`}
                  className={`group flex items-center gap-3.5 px-5 py-3.5 hover:bg-[#f5efdf] transition-colors ${i !== 0 ? 'border-t border-[#f0ebe0]' : ''}`}>
                  <span className={`shrink-0 h-2.5 w-2.5 rounded-full ${done ? 'bg-[#174f35]' : 'bg-red-400'}`} />
                  <span className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-xl ${done ? 'bg-[#174f35]/8 text-[#174f35]' : 'bg-red-50 text-red-400'}`}>
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1f2d27] leading-tight">{label}</p>
                    <p className={`text-xs mt-0.5 ${done ? 'text-[#174f35] font-medium' : 'text-red-400'}`}>{meta}</p>
                  </div>
                  <span className="text-[#c8bfb0] group-hover:text-[#174f35] transition-colors text-sm">›</span>
                </Link>
              ))}
              <Link href={`/dashboard/vault/${id}/onizleme`}
                className="group flex items-center gap-3.5 px-5 py-3.5 border-t border-[#f0ebe0] hover:bg-[#f5efdf] transition-colors">
                <span className="shrink-0 h-2.5 w-2.5 rounded-full bg-[#dfbd72]" />
                <span className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-[#dfbd72]/10 text-[#b08340]">
                  <Eye className="h-[18px] w-[18px]" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1f2d27] leading-tight">Önizleme</p>
                  <p className="text-xs mt-0.5 text-[#b08340] font-medium">Ziyaretçi bakışı</p>
                </div>
                <span className="text-[#c8bfb0] group-hover:text-[#174f35] transition-colors text-sm">›</span>
              </Link>
            </div>
          </div>

          {/* Sağ: widget'lar */}
          <div className="hidden lg:flex w-64 shrink-0 flex-col gap-4">
            <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 text-center shadow-[0_4px_24px_rgba(64,48,24,0.06)]">
              <Heart className="mx-auto h-7 w-7 text-[#dfbd72]" />
              <h2 className="mx-auto mt-5 max-w-[180px] font-serif text-lg leading-snug text-[#1f2d27]">
                Hatıralar paylaşıldıkça çoğalır.
              </h2>
              <div className="mx-auto mt-5 h-px w-14 bg-[#dfbd72]" />
              <p className="mx-auto mt-5 text-xs leading-6 text-[#5f6b63]">
                Ödeme onayı veya admin muafiyeti sonrası sayfanız şekillenmeye başlar.
              </p>
              <div className="relative mx-auto mt-6 h-44 w-40">
                <Image src="/images/landing/cta-candle-olive.png" alt="Anı mumu ve zeytin dalı" fill className="object-contain" />
              </div>
            </div>

            <div className="rounded-3xl border border-[#e5dccb] bg-[#f7f6ec] p-5 shadow-[0_4px_24px_rgba(64,48,24,0.04)]">
              <CalendarCheck className="h-5 w-5 text-[#174f35]" />
              <p className="mt-3 text-xs leading-6 text-[#4e5d55]">
                Her tamamladığınız bölüm, anı sayfanızı daha da anlamlı kılar.
              </p>
              <p className="mt-3 font-serif text-base leading-6 text-[#1f2d27]">
                Devam edin, birlikte güzelleştirelim.
              </p>
            </div>

            {(guestbookCount ?? 0) > 0 && (
              <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-5">
                <p className="text-xs font-semibold text-[#174f35]">Taziye Defteri</p>
                <p className="mt-2 text-3xl font-bold text-[#1f2d27]">{guestbookCount}</p>
                <p className="mt-0.5 text-xs text-[#7b837d]">mesaj bırakıldı</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
