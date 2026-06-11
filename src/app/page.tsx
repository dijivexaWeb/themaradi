import LandingNav from '@/components/landing/Nav'
import LocalizedLanding from '@/components/landing/LocalizedLanding'
import { fetchPricingConfig } from '@/lib/pricing'
import { createServiceClient } from '@/lib/supabase/server'
import type { RecentMemorial } from '@/components/landing/RecentMemorialsCarousel'

export const revalidate = 3600

export default async function LandingPage() {
  const supabase = await createServiceClient()

  const [pricing, { data: recentMemorials }] = await Promise.all([
    fetchPricingConfig(),
    supabase
      .from('vaults')
      .select('id, display_name, slug, tagline, birth_date, death_date, cover_photo_url, birth_place')
      .eq('status', 'public_memorial')
      .order('updated_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div className="theme-corporate min-h-screen overflow-x-hidden bg-[#fbf8f1] text-[#173d31]">
      <LandingNav />
      <LocalizedLanding
        pricing={pricing}
        recentMemorials={(recentMemorials ?? []) as RecentMemorial[]}
      />
    </div>
  )
}
