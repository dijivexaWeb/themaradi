import LandingNav from '@/components/landing/Nav'
import LocalizedLanding from '@/components/landing/LocalizedLanding'

export const dynamic = 'force-static'
export const revalidate = 86400

export default function LandingPage() {
  return (
    <div className="theme-corporate min-h-screen overflow-x-hidden bg-[#fbf8f1] text-[#173d31]">
      <LandingNav />
      <LocalizedLanding />
    </div>
  )
}
