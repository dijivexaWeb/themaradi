import type { Metadata } from 'next'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import MemorialPageClient from './MemorialPageClient'
import RealMemorialPage from './RealMemorialPage'
import ObjectionSection from './ObjectionSection'
import ViewTracker from './ViewTracker'
import FamilySiblingsBar from './FamilySiblingsBar'

export const revalidate = 0

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (slug === 'demo') {
    return {
      title: 'Ahmet Yılmaz - The Eternal Memory',
      description: 'Ahmet Yılmaz için hazırlanmış dijital anma profili. 1940-2020.',
    }
  }

  const supabase = await createClient()
  const { data: vault } = await supabase
    .from('vaults')
    .select('display_name, tagline, birth_date, death_date, cover_photo_url')
    .eq('slug', slug)
    .eq('status', 'public_memorial')
    .single()

  const icons = {
    icon: [{ url: '/icon', type: 'image/png', sizes: '32x32' }],
    apple: [{ url: '/apple-icon', type: 'image/png', sizes: '180x180' }],
  }

  if (!vault) return { title: 'The Eternal Memory', icons }

  const birthYear = vault.birth_date ? new Date(vault.birth_date).getFullYear() : null
  const deathYear = vault.death_date ? new Date(vault.death_date).getFullYear() : null
  const years = birthYear && deathYear ? ` (${birthYear}–${deathYear})` : ''
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

  const description = vault.tagline
    ?? `${vault.display_name}${years} — Dijital anma profili. Fotoğraflar, hayat hikayesi ve anılar. The Eternal Memory.`

  const ogImage = [{
    url: vault.cover_photo_url || `${APP_URL}/images/landing/memorial-hero-cemetery.png`,
    width: 1200,
    height: 630,
    alt: vault.display_name,
  }]

  return {
    title: `${vault.display_name}${years}`,
    description,
    icons,
    alternates: { canonical: `${APP_URL}/memorial/${slug}` },
    openGraph: {
      title: `${vault.display_name}${years}`,
      description,
      type: 'profile',
      siteName: 'The Eternal Memory',
      url: `${APP_URL}/memorial/${slug}`,
      images: ogImage,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${vault.display_name}${years}`,
      description,
      images: [ogImage[0].url],
    },
  }
}

interface PropsWithSearch extends Props {
  searchParams: Promise<{ preview?: string }>
}

export default async function MemorialPage({ params, searchParams }: PropsWithSearch) {
  const { slug } = await params
  const { preview } = await searchParams

  if (slug === 'demo') {
    return <MemorialPageClient />
  }

  const supabase = await createClient()
  // preview=1: use service client to bypass RLS (unpublished vaults are hidden from non-owners)
  const vaultClient = preview === '1' ? await createServiceClient() : supabase
  const { data: vault } = await vaultClient
    .from('vaults')
    .select('*')
    .eq('slug', slug)
    .single()

  // Not found
  if (!vault) {
    return (
      <div className="min-h-screen bg-[#0c3327] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🕯️</div>
          <h1 className="text-2xl font-serif text-[#c7a76f] mb-2">Sayfa Bulunamadı</h1>
          <p className="text-[#cfc3ad] text-sm">Bu anma sayfası mevcut değil veya kaldırılmış olabilir.</p>
        </div>
      </div>
    )
  }

  const isLive = vault.status === 'public_memorial' || vault.status === 'private_memorial'
  const isDormant = vault.status === 'dormant_memorial'

  // Owner/admin preview — yayınlanmamış sayfalarda sahibi veya admin görebilir
  if (!isLive && preview === '1') {
    const { data: { user } } = await supabase.auth.getUser()
    const isOwner = user?.id === vault.owner_id
    let isAdmin = false
    if (user && !isOwner) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      isAdmin = profile?.role === 'admin'
    }
    if (!isOwner && !isAdmin) {
      return (
        <div className="min-h-screen bg-[#0c3327] flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-serif text-[#c7a76f] mb-2">{vault.display_name}</h1>
            <p className="text-[#cfc3ad] text-sm mt-2">Bu anma sayfası henüz yayınlanmamış.</p>
          </div>
        </div>
      )
    }
    const backLink = isAdmin ? '/admin/verifications' : `/anma-paneli/${vault.id}`
    const backLabel = isAdmin ? 'Admin Paneli' : 'Panele Dön'
    return (
      <>
        {/* Önizleme bandı */}
        <div className="sticky top-0 z-50 flex items-center justify-between bg-amber-500 px-4 py-2 text-sm font-semibold text-white">
          <span>👁 Önizleme Modu — Bu sayfa henüz yayınlanmadı</span>
          <a href={backLink} className="rounded bg-white/20 px-3 py-1 text-xs hover:bg-white/30">
            {backLabel}
          </a>
        </div>
        <RealMemorialPage vault={vault} isPreview />
      </>
    )
  }

  if (isDormant) {
    return (
      <div className="min-h-screen bg-[#0c3327] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🕯️</div>
          <h1 className="text-2xl font-serif text-[#c7a76f] mb-1">{vault.display_name}</h1>
          {vault.cover_photo_url && (
            <img
              src={vault.cover_photo_url}
              alt={vault.display_name}
              className="w-24 h-24 rounded-full object-cover mx-auto my-4 border-2 border-[#c7a76f]/40"
            />
          )}
          <p className="text-[#cfc3ad] text-sm mt-2 leading-6">
            Bu anma sayfası şu an barındırma yenileme bekliyor.
          </p>
          <p className="text-[#c7a76f]/60 text-xs mt-3 leading-5">
            Tam içeriğe erişmek için lütfen sayfa sahibiyle iletişime geçin.
          </p>
          <div className="mt-6 bg-[#ffffff08] border border-[#c7a76f]/15 rounded-xl px-5 py-4 text-xs text-[#c7a76f]/50 leading-5">
            Sayfa sahibi yenileme yaptıktan sonra bu profil tekrar tam içeriğiyle erişilebilir olacak.
          </div>
        </div>
      </div>
    )
  }

  if (!isLive) {
    return (
      <div className="min-h-screen bg-[#0c3327] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-serif text-[#c7a76f] mb-2">{vault.display_name}</h1>
          <p className="text-[#cfc3ad] text-sm mt-2">Bu anma sayfası henüz yayınlanmamış.</p>
          <p className="text-[#c7a76f]/50 text-xs mt-3">
            Sayfa sahibi tarafından yayınlandığında buradan ulaşabilirsiniz.
          </p>
        </div>
      </div>
    )
  }

  // Fetch family + siblings for this vault
  const serviceClient = await createServiceClient()
  let familySiblings: FamilySibling[] = []
  let familyInfo: { name: string; slug: string } | null = null

  const { data: memberLink } = await serviceClient
    .from('family_members')
    .select('family_id, memorial_families(name, slug)')
    .eq('vault_id', vault.id)
    .maybeSingle()

  if (memberLink?.family_id) {
    const raw = memberLink.memorial_families as { name: string; slug: string }[] | { name: string; slug: string } | null
    familyInfo = Array.isArray(raw) ? (raw[0] ?? null) : raw

    const { data: siblings } = await serviceClient
      .from('family_members')
      .select('vault_id, vaults(display_name, slug, cover_photo_url, birth_date, death_date)')
      .eq('family_id', memberLink.family_id)
      .neq('vault_id', vault.id)
      .limit(8)

    for (const s of siblings ?? []) {
      const raw2 = s.vaults as { display_name: string; slug: string; cover_photo_url: string | null; birth_date: string | null; death_date: string | null }[] | { display_name: string; slug: string; cover_photo_url: string | null; birth_date: string | null; death_date: string | null } | null
      const v = Array.isArray(raw2) ? (raw2[0] ?? null) : raw2
      if (v) {
        familySiblings.push({
          vault_id: s.vault_id,
          display_name: v.display_name,
          slug: v.slug,
          cover_photo_url: v.cover_photo_url,
          birth_date: v.birth_date,
          death_date: v.death_date,
        })
      }
    }
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: vault.display_name,
      url: `${APP_URL}/memorial/${slug}`,
      mainEntity: {
        '@type': 'Person',
        name: vault.display_name,
        description: vault.tagline ?? undefined,
        ...(vault.birth_date ? { birthDate: vault.birth_date } : {}),
        ...(vault.death_date ? { deathDate: vault.death_date } : {}),
        ...(vault.cover_photo_url ? { image: vault.cover_photo_url } : {}),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: APP_URL },
        { '@type': 'ListItem', position: 2, name: 'Anma Profilleri', item: `${APP_URL}/memorial` },
        { '@type': 'ListItem', position: 3, name: vault.display_name, item: `${APP_URL}/memorial/${slug}` },
      ],
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker vaultId={vault.id} />
      <RealMemorialPage vault={vault} />
      {vault.status === 'public_memorial' && !vault.is_notable && !vault.hide_objection && <ObjectionSection vaultId={vault.id} />}
      {familySiblings.length > 0 && familyInfo && (
        <FamilySiblingsBar siblings={familySiblings} family={familyInfo} />
      )}
    </>
  )
}

export type FamilySibling = {
  vault_id: string
  display_name: string
  slug: string
  cover_photo_url: string | null
  birth_date: string | null
  death_date: string | null
}
