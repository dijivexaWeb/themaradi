import type { Metadata } from 'next'
import LandingNav from '@/components/landing/Nav'
import LocalizedLanding from '@/components/landing/LocalizedLanding'
import { fetchPricingConfig } from '@/lib/pricing'
import { createServiceClient } from '@/lib/supabase/server'
import type { RecentMemorial } from '@/components/landing/RecentMemorialsCarousel'
import type { HeroMemorial } from '@/components/landing/HeroPhoneShowcase'
import type { TestimonialMemorial } from '@/components/landing/TestimonialSection'
import { getFamilyThankYouQuote } from '@/lib/testimonialQuotes'
import { buildAlternateLanguages, buildCanonical } from '@/lib/i18n/hreflang'
import { getCampaignStats } from '@/lib/campaign'
import { getTranslation } from '@/i18n/server'

export const revalidate = 3600

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'
const PATH = '/'

export async function generateMetadata(): Promise<Metadata> {
  const { t, lang } = await getTranslation()
  const m = t.seoMeta.home
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: buildCanonical(lang, PATH), languages: buildAlternateLanguages(PATH) },
    openGraph: { title: m.title, description: m.description, url: buildCanonical(lang, PATH), type: 'website' },
  }
}

export default async function LandingPage() {
  const supabase = await createServiceClient()

  const [pricing, campaignStats, { data: recentMemorials }, { data: testimonialCandidates }] = await Promise.all([
    fetchPricingConfig(),
    getCampaignStats(),
    supabase
      .from('vaults')
      .select('id, display_name, slug, tagline, birth_date, death_date, cover_photo_url, cover_video_url, birth_place, published_at')
      .eq('status', 'public_memorial')
      .not('is_notable', 'is', true)
      .order('updated_at', { ascending: false })
      .limit(10),
    // Testimonial kartları için normal (notable olmayan) profiller — ulusal miras dışında
    supabase
      .from('vaults')
      .select('id, display_name, slug, cover_photo_url, birth_place, nationality')
      .eq('status', 'public_memorial')
      .not('is_notable', 'is', true)
      .order('published_at', { ascending: false })
      .limit(12),
  ])

  // Attach family info to recent + testimonial memorials
  const recentIds = (recentMemorials ?? []).map((v) => v.id)
  const testimonialIds = (testimonialCandidates ?? []).map((v) => v.id)
  const familyMap: Record<string, { name: string; slug: string }> = {}
  const familyLookupIds = [...recentIds, ...testimonialIds]
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

  // Testimonial kartları: normal profillerden, İstanbollu ailesi/soyadı hariç ilk 4.
  // Aileler platforma kendi dillerinde teşekkür ediyor — metin statik, dil profildeki nationality'den seçilir.
  const testimonialMemorials: TestimonialMemorial[] = (testimonialCandidates ?? [])
    .filter((v) => familyMap[v.id]?.slug !== 'istanbollu' && !/i̇?stanbollu/i.test(v.display_name ?? ''))
    .slice(0, 4)
    .map((v, i) => ({
      id: v.id,
      display_name: v.display_name,
      slug: v.slug,
      cover_photo_url: v.cover_photo_url,
      tagline: getFamilyThankYouQuote(v.nationality, i),
      birth_place: v.birth_place,
    }))
  const interactionTotals: Record<string, number> = {}
  if (recentIds.length > 0) {
    const { data: actions } = await supabase
      .from('memorial_actions')
      .select('memorial_id, count')
      .in('memorial_id', recentIds)
      .eq('is_active', true)
    for (const a of actions ?? []) {
      interactionTotals[a.memorial_id] = (interactionTotals[a.memorial_id] ?? 0) + ((a.count as number) ?? 0)
    }
  }

  // Hero'daki 3 kart: en son eklenen/güncellenen normal profiller (notable değil),
  // recentMemorials zaten updated_at DESC sıralı — ilk 3'ü yeniden kullanıyoruz.
  const heroMemorials: HeroMemorial[] = (recentMemorials ?? []).slice(0, 3).map((v) => ({
    ...v,
    family: familyMap[v.id] ?? null,
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
          campaignStats={campaignStats}
          heroMemorials={heroMemorials}
          recentMemorials={(recentMemorials ?? []).map(m => ({ ...m, family: familyMap[m.id] ?? null })) as RecentMemorial[]}
          testimonialMemorials={testimonialMemorials}
        />
      </div>
    </>
  )
}
