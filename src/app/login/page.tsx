import { getTurnstileSiteKey } from '@/lib/turnstile'
import LoginPageClient from './_LoginPageClient'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const siteKey = await getTurnstileSiteKey()
  const { error } = await searchParams
  return <LoginPageClient siteKey={siteKey} callbackError={error} />
}
