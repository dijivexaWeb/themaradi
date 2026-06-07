import LandingNav from '@/components/landing/Nav'
import LocalizedLanding from '@/components/landing/LocalizedLanding'
import { fetchPricingConfig } from '@/lib/pricing'

// Revalidates via revalidatePath() when admin changes prices
export const revalidate = 3600

export default async function LandingPage() {
  const pricing = await fetchPricingConfig()

  return (
    <div className="theme-corporate min-h-screen overflow-x-hidden bg-[#fbf8f1] text-[#173d31]">
      <LandingNav />
      <LocalizedLanding pricing={pricing} />
    </div>
  )
}
