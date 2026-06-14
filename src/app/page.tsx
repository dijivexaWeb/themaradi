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
  const reactionCounts: Record<string, { candle: number; flower: number; prayer: number }> = {}
  if (notableIds.length > 0) {
    const { data: reactions } = await supabase
      .from('memorial_reactions')
      .select('vault_id, reaction_type')
      .in('vault_id', notableIds)
    for (const r of reactions ?? []) {
      if (!reactionCounts[r.vault_id]) reactionCounts[r.vault_id] = { candle: 0, flower: 0, prayer: 0 }
      const k = r.reaction_type as 'candle' | 'flower' | 'prayer'
      if (k in reactionCounts[r.vault_id]) reactionCounts[r.vault_id][k]++
    }
  }

  const notableMemorials: NotableMemorial[] = (notableRaw ?? []).map((v) => ({
    ...v,
    candle_count: reactionCounts[v.id]?.candle ?? 0,
    flower_count: reactionCounts[v.id]?.flower ?? 0,
    prayer_count: reactionCounts[v.id]?.prayer ?? 0,
  }))

  return (
    <div className="theme-corporate min-h-screen overflow-x-hidden bg-[#fbf8f1] text-[#173d31]">
      <LandingNav />
      <LocalizedLanding
        pricing={pricing}
        notableMemorials={notableMemorials}
        recentMemorials={(recentMemorials ?? []) as RecentMemorial[]}
      />
    </div>
  )
}
