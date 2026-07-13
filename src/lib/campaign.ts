import { createServiceClient } from '@/lib/supabase/server'

export const CAMPAIGN_TOTAL_SLOTS = 100
const FALLBACK_ELIGIBLE_COUNT = 7

export type CampaignStats = {
  eligibleCount: number
  remainingSlots: number
  usedPercentage: number
  soldOut: boolean
}

function buildStats(eligibleCount: number): CampaignStats {
  const remainingSlots = Math.max(0, CAMPAIGN_TOTAL_SLOTS - eligibleCount)
  const usedPercentage = Math.min(100, (eligibleCount / CAMPAIGN_TOTAL_SLOTS) * 100)
  return { eligibleCount, remainingSlots, usedPercentage, soldOut: remainingSlots === 0 }
}

// "İlk 100 Aile" kampanya sayacı — sabit kodlanmaz, counts_toward_campaign
// bayraklı yayınlanmış anma profillerinin gerçek sayısından hesaplanır.
export async function getCampaignStats(): Promise<CampaignStats> {
  try {
    const supabase = await createServiceClient()
    const { count, error } = await supabase
      .from('vaults')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'public_memorial')
      .eq('counts_toward_campaign', true)

    if (error) throw error
    return buildStats(count ?? FALLBACK_ELIGIBLE_COUNT)
  } catch {
    return buildStats(FALLBACK_ELIGIBLE_COUNT)
  }
}
