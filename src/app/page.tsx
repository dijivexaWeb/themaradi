import type { Metadata } from 'next'
import LandingNav from '@/components/landing/Nav'
import LocalizedLanding from '@/components/landing/LocalizedLanding'
import { fetchPricingConfig } from '@/lib/pricing'
import { createServiceClient } from '@/lib/supabase/server'
import type { RecentMemorial } from '@/components/landing/RecentMemorialsCarousel'
import type { NotableMemorial } from '@/components/landing/NotableProfilesSection'
import type { TestimonialMemorial } from '@/components/landing/TestimonialSection'

export const revalidate = 3600

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

export const metadata: Metadata = {
  title: 'The Eternal Memory — Dijital Anma Profili & QR Mezar Taşı',
  description:
    'Sevdikleriniz için kalıcı dijital anma profili oluşturun. Fotoğraflar, hayat hikayesi, aile ağacı ve QR mezar taşı. Gürcistan, Türkiye ve dünya genelinde hizmet. — ციფრული მემორიალი, QR საფლავის ქვა, მოგონებები.',
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    title: 'The Eternal Memory — Dijital Anma Profili & QR Mezar Taşı',
    description: 'Sevdikleriniz için kalıcı dijital anma profili. QR mezar taşı, fotoğraflar, aile ağacı.',
    url: APP_URL,
    type: 'website',
  },
}

export default async function LandingPage() {
  const supabase = await createServiceClient()

  const [pricing, { data: notableRaw }, { data: recentMemorials }] = await Promise.all([
    fetchPricingConfig(),
    supabase
      .from('vaults')
      .select('id, display_name, slug, tagline, birth_date, death_date, cover_photo_url, nationality, notable_subtitle, birth_place')
      .eq('status', 'public_memorial')
      .eq('is_notable', true)
      .order('notable_sort_order', { ascending: true, nullsFirst: false })
      .order('published_at', { ascending: false }),
    supabase
      .from('vaults')
      .select('id, display_name, slug, tagline, birth_date, death_date, cover_photo_url, cover_video_url, birth_place')
      .eq('status', 'public_memorial')
      .not('is_notable', 'is', true)
      .order('updated_at', { ascending: false })
      .limit(10),
  ])

  const notableIds = (notableRaw ?? []).map((v) => v.id)

  // Attach family info to recent + notable memorials
  const recentIds = (recentMemorials ?? []).map((v) => v.id)
  const familyMap: Record<string, { name: string; slug: string }> = {}
  const familyLookupIds = [...recentIds, ...notableIds]
  if (familyLookupIds.length > 0) {
    const { data: familyLinks } = await supabase
      .from('family_members')
      .select('vault_id, memorial_families(name, slug)')
      .in('vault_id', familyLookupIds)
    for (const link of familyLinks ?? []) {
      const raw = link.memorial_families as { name: string; slug: string }[] | { name: string; slug: string } | null
      const fam = Array.isArray(raw) ? raw[0] : raw
      if (fam && link.vault_id) familyMap[link.vault_id] = fam
    }
  }

  // Testimonial kartları: İstanbollu ailesi hariç ilk 4 notable profil
  const testimonialMemorials: TestimonialMemorial[] = (notableRaw ?? [])
    .filter((v) => familyMap[v.id]?.slug !== 'istanbollu')
    .slice(0, 4)
    .map((v) => ({
      id: v.id,
      display_name: v.display_name,
      slug: v.slug,
      cover_photo_url: v.cover_photo_url,
      tagline: v.tagline,
      birth_place: v.birth_place,
    }))
  const interactionTotals: Record<string, number> = {}
  if (notableIds.length > 0) {
    const { data: actions } = await supabase
      .from('memorial_actions')
      .select('memorial_id, count')
      .in('memorial_id', notableIds)
      .eq('is_active', true)
    for (const a of actions ?? []) {
      interactionTotals[a.memorial_id] = (interactionTotals[a.memorial_id] ?? 0) + ((a.count as number) ?? 0)
    }
  }

  const notableMemorials: NotableMemorial[] = (notableRaw ?? []).map((v) => ({
    ...v,
    interaction_count: interactionTotals[v.id] ?? 0,
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Eternal Memory',
    url: APP_URL,
    logo: `${APP_URL}/images/logo-mark.png`,
    description: 'Dijital anma profili, QR mezar taşı ve aile mirası platformu. Gürcistan, Türkiye ve dünya genelinde hizmet.',
    sameAs: [],
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', email: 'info@theeternalmemory.com' },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen overflow-x-hidden" style={{ background: '#07070d', color: '#EDE8DD' }}>
        <LandingNav />
        <LocalizedLanding
          pricing={pricing}
          notableMemorials={notableMemorials}
          recentMemorials={(recentMemorials ?? []).map(m => ({ ...m, family: familyMap[m.id] ?? null })) as RecentMemorial[]}
          testimonialMemorials={testimonialMemorials}
        />
      </div>
    </>
  )
}
