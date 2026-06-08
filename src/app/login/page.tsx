import { getTurnstileSiteKey } from '@/lib/turnstile'
import LoginPageClient from './_LoginPageClient'

export default async function LoginPage() {
  const siteKey = await getTurnstileSiteKey()
  return <LoginPageClient siteKey={siteKey} />
}
