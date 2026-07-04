import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { buildAlternateLanguages } from '@/lib/i18n/hreflang'
import { isLocaleEligible } from '@/lib/i18n/localizedHref'

const base = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

function withAlternates(url: string, path: string): MetadataRoute.Sitemap[number]['alternates'] {
  return isLocaleEligible(path) ? { languages: buildAlternateLanguages(path) } : undefined
}

const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${base}`, priority: 1.0, changeFrequency: 'daily', alternates: withAlternates(`${base}`, '/') },
  { url: `${base}/about`, priority: 0.7, changeFrequency: 'monthly', alternates: withAlternates(`${base}/about`, '/about') },
  { url: `${base}/memorial`, priority: 0.8, changeFrequency: 'daily' },
  { url: `${base}/pricing`, priority: 0.8, changeFrequency: 'weekly', alternates: withAlternates(`${base}/pricing`, '/pricing') },
  { url: `${base}/contact`, priority: 0.6, changeFrequency: 'monthly', alternates: withAlternates(`${base}/contact`, '/contact') },
  { url: `${base}/miras`, priority: 0.6, changeFrequency: 'weekly', alternates: withAlternates(`${base}/miras`, '/miras') },
  { url: `${base}/dijital-ani-sayfasi`, priority: 0.7, changeFrequency: 'monthly', alternates: withAlternates(`${base}/dijital-ani-sayfasi`, '/dijital-ani-sayfasi') },
  { url: `${base}/qr-kodlu-mezar-tasi`, priority: 0.7, changeFrequency: 'monthly', alternates: withAlternates(`${base}/qr-kodlu-mezar-tasi`, '/qr-kodlu-mezar-tasi') },
  { url: `${base}/online-taziye-defteri`, priority: 0.7, changeFrequency: 'monthly', alternates: withAlternates(`${base}/online-taziye-defteri`, '/online-taziye-defteri') },
  { url: `${base}/anma-profili-nasil-hazirlanir`, priority: 0.7, changeFrequency: 'monthly', alternates: withAlternates(`${base}/anma-profili-nasil-hazirlanir`, '/anma-profili-nasil-hazirlanir') },
  { url: `${base}/satin-al/anma`, priority: 0.9, changeFrequency: 'weekly', alternates: withAlternates(`${base}/satin-al/anma`, '/satin-al/anma') },
  { url: `${base}/satin-al/aile`, priority: 0.8, changeFrequency: 'weekly', alternates: withAlternates(`${base}/satin-al/aile`, '/satin-al/aile') },
  { url: `${base}/privacy`, priority: 0.3, changeFrequency: 'yearly' },
  { url: `${base}/terms`, priority: 0.3, changeFrequency: 'yearly' },
  { url: `${base}/cookies`, priority: 0.3, changeFrequency: 'yearly' },
  { url: `${base}/kvkk`, priority: 0.3, changeFrequency: 'yearly' },
  { url: `${base}/legal/verification-policy`, priority: 0.3, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServiceClient()

  const [{ data: vaults }, { data: families }] = await Promise.all([
    supabase
      .from('vaults')
      .select('slug, updated_at')
      .eq('status', 'public_memorial')
      .not('slug', 'is', null),
    supabase
      .from('memorial_families')
      .select('slug, updated_at')
      .eq('is_public', true)
      .not('slug', 'is', null),
  ])

  const vaultRoutes: MetadataRoute.Sitemap = (vaults ?? []).map(v => ({
    url: `${base}/memorial/${v.slug}`,
    lastModified: v.updated_at ? new Date(v.updated_at) : new Date(),
    priority: 0.9,
    changeFrequency: 'weekly',
  }))

  const familyRoutes: MetadataRoute.Sitemap = (families ?? []).map(f => ({
    url: `${base}/aile/${f.slug}`,
    lastModified: f.updated_at ? new Date(f.updated_at) : new Date(),
    priority: 0.8,
    changeFrequency: 'weekly',
  }))

  return [...staticRoutes, ...vaultRoutes, ...familyRoutes]
}
