import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Check,
  Copy,
  Eye,
  FileText,
  Heart,
  Image as ImageIcon,
  Leaf,
  LockKeyhole,
  MessageCircle,
  QrCode,
  Shield,
  Users,
  Video,
  UserRound,
} from 'lucide-react'
import type { ComponentType } from 'react'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ purchased?: string }>
}

type Section = {
  href: string
  label: string
  desc: string
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
    .from('vaults')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()
  if (!area) notFound()

  const [
    { count: photoCount },
    { count: publicPhotoCount },
    { count: videoCount },
    { count: publicVideoCount },
    { count: familyCount },
    { count: memoriesCount },
    { count: secretCount },
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
    supabase.from('vault_memories').select('*', { count: 'exact', head: true }).eq('vault_id', id).eq('is_secret', true),
    supabase.from('heirs').select('*', { count: 'exact', head: true }).eq('vault_id', id).neq('status', 'revoked'),
    supabase.from('guestbook').select('*', { count: 'exact', head: true }).eq('vault_id', id),
    supabase.from('death_claims').select('*', { count: 'exact', head: true }).eq('vault_id', id),
    supabase.from('dynamic_qr').select('qr_hash, redirect_count').eq('target_vault_id', id),
  ])

  const isMemorial = area.product_type === 'memorial_profile'
  const isLocked = area.status === 'pending_verification'
  const publicUrl = area.slug ? `themaradi.com/ani-alanim/${area.slug}` : 'Sayfa adresi belirlenmedi'
  const qrActive = (linkedQRs?.length ?? 0) > 0

  const checks = [
    { done: (area.biography?.length ?? 0) > 50, weight: 13, label: 'Hayat hikayesi', href: 'biography' },
    { done: !!area.birth_date && !!area.death_date, weight: 10, label: 'Tarih bilgileri', href: 'profil' },
    { done: !!area.tagline?.trim(), weight: 7, label: 'Kısa söz', href: 'profil' },
    { done: !!area.cover_photo_url, weight: 10, label: 'Profil fotoğrafı', href: 'profil' },
    { done: (photoCount ?? 0) > 0, weight: 13, label: 'Fotoğraflar', href: 'fotolar' },
    { done: (videoCount ?? 0) > 0, weight: 8, label: 'Videolar', href: 'videolar' },
    { done: (memoriesCount ?? 0) > 0, weight: 10, label: 'Anılar', href: 'anilar' },
    { done: (familyCount ?? 0) > 0, weight: 12, label: 'Aile bağları', href: 'aile' },
    { done: (documentCount ?? 0) > 0, weight: 9, label: 'Belgeler', href: 'belgeler' },
    { done: !!area.slug || qrActive, weight: 8, label: 'Yayın ayarları', href: 'settings' },
  ]
  const completion = Math.min(100, Math.round(checks.filter(c => c.done).reduce((sum, c) => sum + c.weight, 0)))
  const missing = checks.filter(c => !c.done)

  const statusConfig: Record<string, { label: string; cls: string }> = {
    pending_verification: { label: 'Doğrulama Bekliyor', cls: 'bg-[#fff4dc] text-[#93620f] border-[#ead4a5]' },
    hidden_vault: { label: 'Gizli Alan', cls: 'bg-[#eef1ea] text-[#496056] border-[#dfe6d8]' },
    private_memorial: { label: 'Özel Anma', cls: 'bg-[#eef1ea] text-[#174f35] border-[#dfe6d8]' },
    public_memorial: { label: 'Yayında', cls: 'bg-[#e9f5ec] text-[#176b3f] border-[#cfe7d3]' },
    suspended: { label: 'Askıda', cls: 'bg-red-50 text-red-700 border-red-200' },
  }
  const status = statusConfig[area.status ?? 'hidden_vault'] ?? statusConfig.hidden_vault

  const sections: Section[] = [
    {
      href: 'biography',
      label: 'Hayat Hikayesi',
      desc: `${area.display_name} için yaşam öyküsünü anlatın.`,
      meta: (area.biography?.length ?? 0) > 0 ? `${area.biography!.length} karakter` : 'Henüz başlamadı',
      done: (area.biography?.length ?? 0) > 50,
      icon: BookOpen,
    },
    {
      href: 'profil',
      label: 'Kişisel Bilgiler',
      desc: 'Doğum, tarih, konum ve temel bilgiler.',
      meta: area.birth_date ? 'Temel bilgiler var' : 'Tamamlanmalı',
      done: !!area.birth_date && !!area.tagline,
      icon: UserRound,
    },
    {
      href: 'fotolar',
      label: 'Fotoğraflar',
      desc: 'Anılar fotoğraflarla sonsuzlaşır.',
      meta: `${photoCount ?? 0} fotoğraf · ${publicPhotoCount ?? 0} açık`,
      done: (photoCount ?? 0) > 0,
      icon: ImageIcon,
    },
    {
      href: 'videolar',
      label: 'Videolar',
      desc: 'Sesler, hareketler ve özel anlar.',
      meta: `${videoCount ?? 0} video · ${publicVideoCount ?? 0} açık`,
      done: (videoCount ?? 0) > 0,
      icon: Video,
    },
    {
      href: 'anilar',
      label: 'Anılar',
      desc: 'Sizin ve sevdiklerinizin paylaştığı notlar.',
      meta: `${memoriesCount ?? 0} anı`,
      done: (memoriesCount ?? 0) > 0,
      icon: MessageCircle,
    },
    {
      href: 'aile',
      label: 'Aile Bağları',
      desc: 'Aile üyeleri ve yakın ilişkiler.',
      meta: `${familyCount ?? 0} kişi`,
      done: (familyCount ?? 0) > 0,
      icon: Users,
    },
    {
      href: 'belgeler',
      label: 'Belgeler',
      desc: 'Önemli belgeleri güvenle saklayın.',
      meta: `${documentCount ?? 0} belge`,
      done: (documentCount ?? 0) > 0,
      icon: FileText,
    },
    {
      href: 'heirs',
      label: 'Yetkili Kişiler',
      desc: 'Dijital miras yetkilerini yönetin.',
      meta: `${heirCount ?? 0} yetkili`,
      done: (heirCount ?? 0) > 0,
      icon: Shield,
    },
    {
      href: 'gizli-kasa',
      label: 'Özel İçerikler',
      desc: 'Sadece belirli kişilere özel içerikler.',
      meta: `${secretCount ?? 0} içerik`,
      done: (secretCount ?? 0) > 0,
      icon: LockKeyhole,
    },
    {
      href: 'settings',
      label: 'Yayın ve QR Ayarları',
      desc: 'Anı sayfanızı paylaşın, QR kodunu yönetin.',
      meta: qrActive ? 'QR aktif' : 'QR bekliyor',
      done: qrActive || !!area.slug,
      icon: QrCode,
    },
    {
      href: 'onizleme',
      label: 'Önizleme',
      desc: 'Anı alanınızın ziyaretçi görünümü.',
      meta: 'Ziyaretçi bakışı',
      done: true,
      icon: Eye,
    },
  ]

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8 xl:px-10">
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-5 flex items-center gap-2 text-sm text-[#788177]">
          <Link href="/dashboard" className="transition-colors hover:text-[#174f35]">Anı Alanım</Link>
          <span>/</span>
          <span className="font-semibold text-[#22362e]">{area.display_name}</span>
        </div>

        {purchased && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/40 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Alanınız oluşturuldu. Ödeme doğrulandıktan sonra tüm içerikleri kaydedebilirsiniz.
          </div>
        )}

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulaması bekleniyor. Bu sırada sayfaları gezebilirsiniz, kayıt işlemleri doğrulamadan sonra aktif olur.
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[1fr_280px]">
          <main>
            <section className="relative overflow-hidden rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-5 shadow-[0_24px_80px_rgba(64,48,24,0.08)] sm:p-7">
              <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                <div className="flex justify-center lg:justify-start">
                  <div className="relative h-44 w-44 rounded-full border border-[#dfbd72] bg-[#f8efd8] p-2 shadow-[0_18px_42px_rgba(80,62,24,0.12)]">
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-[#f1eadb]">
                      {area.cover_photo_url ? (
                        <Image src={area.cover_photo_url} alt={area.display_name} fill className="object-cover" unoptimized />
                      ) : (
                        <Image src="/images/landing/memorial-hero-cemetery.png" alt="Anı alanı görseli" fill className="object-cover" />
                      )}
                    </div>
                    <div className="absolute -bottom-2 right-5 rounded-full bg-[#fff8e8] p-2 text-[#b08340] shadow-md">
                      <Leaf className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="font-serif text-4xl leading-none text-[#1f2d27] sm:text-5xl">{area.display_name}</h1>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.cls}`}>{status.label}</span>
                        <span className="rounded-full border border-[#eadfca] bg-[#fbf5e8] px-3 py-1 text-xs font-semibold text-[#9a6b22]">
                          {isMemorial ? 'Anı Profili' : 'Yaşam Anısı'}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[#174f35]">
                        <Link href={area.slug ? `/memorial/${area.slug}` : `/dashboard/vault/${id}/settings`} className="font-medium hover:underline">
                          {publicUrl}
                        </Link>
                        <Copy className="h-4 w-4 text-[#8c927f]" />
                      </div>

                      {area.tagline ? (
                        <p className="mt-5 font-serif text-lg italic leading-8 text-[#7a7467]">“{area.tagline}”</p>
                      ) : (
                        <p className="mt-5 text-sm leading-7 text-[#7a7467]">
                          Kısa bir anı sözü eklediğinizde burada görünür.
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/dashboard/vault/${id}/onizleme`}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#174f35] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(23,79,53,0.22)] transition-colors hover:bg-[#123f2b]"
                    >
                      <Eye className="h-4 w-4" />
                      Önizle
                    </Link>
                  </div>

                  <div className="mt-7 rounded-2xl border border-[#eadfca] bg-white/70 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#23382f]">Profil Tamamlanma</p>
                        <p className="mt-1 text-xs text-[#7d857c]">
                          {completion >= 80 ? 'Harika gidiyorsunuz, birkaç dokunuş kaldı.' : 'Her tamamladığınız bölüm sayfanızı daha anlamlı kılar.'}
                        </p>
                      </div>
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[6px] border-[#dfbd72] bg-[#fffdf8] text-xl font-bold text-[#174f35]">
                        %{completion}
                      </div>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#f1eadb]">
                      <div className="h-full rounded-full bg-[#174f35]" style={{ width: `${Math.max(completion, 4)}%` }} />
                    </div>
                    {missing.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {missing.slice(0, 4).map(item => (
                          <Link key={item.label} href={`/dashboard/vault/${id}/${item.href}`} className="rounded-full bg-[#f7f0df] px-3 py-1 text-xs text-[#6d624e] hover:text-[#174f35]">
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {sections.map(({ href, label, desc, meta, done, icon: Icon }) => (
                <Link
                  key={href}
                  href={`/dashboard/vault/${id}/${href}`}
                  className="group flex min-h-28 items-center gap-4 rounded-2xl border border-[#e5dccb] bg-[#fffdf8] p-4 shadow-[0_16px_40px_rgba(64,48,24,0.05)] transition-all hover:-translate-y-0.5 hover:border-[#dfbd72]"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#eadfca] bg-[#fbf5e8] text-[#174f35]">
                    <Icon className="h-7 w-7" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 font-serif text-lg text-[#1f2d27]">
                      {label}
                      {done && <Check className="h-4 w-4 text-[#176b3f]" />}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-[#737c74]">{desc}</span>
                    <span className="mt-2 block text-xs font-semibold text-[#174f35]">{meta}</span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 text-[#9f927a] transition-transform group-hover:translate-x-1 group-hover:text-[#174f35]" />
                </Link>
              ))}
            </section>
          </main>

          <aside className="space-y-5">
            <section className="overflow-hidden rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-7 text-center shadow-[0_24px_80px_rgba(64,48,24,0.08)]">
              <Heart className="mx-auto h-8 w-8 text-[#dfbd72]" />
              <h2 className="mx-auto mt-6 max-w-[210px] font-serif text-2xl leading-snug text-[#1f2d27]">
                Sevdikleriniz için anlamlı bir anı sayfası oluşturun.
              </h2>
              <div className="mx-auto mt-7 h-px w-20 bg-[#dfbd72]" />
              <p className="mx-auto mt-7 max-w-[210px] text-sm leading-7 text-[#5f6b63]">
                Anılar paylaştıkça çoğalır, sevgi ise paylaştıkça sonsuzlaşır.
              </p>
              <div className="relative mx-auto mt-8 h-52 w-48">
                <Image src="/images/landing/cta-candle-olive.png" alt="Anı mumu ve zeytin dalı" fill className="object-contain" />
              </div>
            </section>

            <section className="rounded-3xl border border-[#e5dccb] bg-[#f7f6ec] p-6 shadow-[0_18px_50px_rgba(64,48,24,0.06)]">
              <CalendarCheck className="h-6 w-6 text-[#174f35]" />
              <p className="mt-4 text-sm leading-6 text-[#4e5d55]">
                Her tamamladığınız bölüm, anı sayfanızı daha da anlamlı kılar.
              </p>
              <p className="mt-5 font-serif text-lg leading-7 text-[#1f2d27]">
                Devam edin, birlikte güzelleştirelim.
              </p>
            </section>

            {guestbookCount !== null && guestbookCount > 0 && (
              <section className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6">
                <p className="text-sm font-semibold text-[#174f35]">Taziye Defteri</p>
                <p className="mt-2 text-3xl font-bold text-[#1f2d27]">{guestbookCount}</p>
                <p className="mt-1 text-xs text-[#7b837d]">mesaj bırakıldı</p>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
