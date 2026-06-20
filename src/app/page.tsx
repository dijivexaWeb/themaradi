import LandingNav from '@/components/landing/Nav'
import LocalizedLanding from '@/components/landing/LocalizedLanding'
import { fetchPricingConfig } from '@/lib/pricing'
import { createServiceClient } from '@/lib/supabase/server'
import type { RecentMemorial } from '@/components/landing/RecentMemorialsCarousel'
import type { NotableMemorial } from '@/components/landing/NotableProfilesSection'

export const revalidate = 3600

export default async function LandingPage() {
  const supabase = await createServiceClient()

  const [pricing, { data: notableRaw }, { data: recentMemorials }] = await Promise.all([
    fetchPricingConfig(),
    supabase
      .from('vaults')
      .select('id, display_name, slug, tagline, birth_date, death_date, cover_photo_url, nationality, notable_subtitle')
      .eq('status', 'public_memorial')
      .eq('is_notable', true)
      .order('notable_sort_order', { ascending: true, nullsFirst: false })
      .order('published_at', { ascending: false }),
    supabase
      .from('vaults')
      .select('id, display_name, slug, tagline, birth_date, death_date, cover_photo_url, birth_place')
      .eq('status', 'public_memorial')
      .not('is_notable', 'is', true)
      .order('updated_at', { ascending: false })
      .limit(10),
  ])

  const notableIds = (notableRaw ?? []).map((v) => v.id)
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

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#07070d', color: '#EDE8DD' }}>
      <LandingNav />
      <LocalizedLanding
        pricing={pricing}
        notableMemorials={notableMemorials}
        recentMemorials={(recentMemorials ?? []) as RecentMemorial[]}
      />
    </div>
  )
}
