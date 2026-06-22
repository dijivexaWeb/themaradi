import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

const base = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${base}`, priority: 1.0, changeFrequency: 'daily' },
  { url: `${base}/about`, priority: 0.7, changeFrequency: 'monthly' },
  { url: `${base}/memorial`, priority: 0.8, changeFrequency: 'daily' },
  { url: `${base}/pricing`, priority: 0.8, changeFrequency: 'weekly' },
  { url: `${base}/contact`, priority: 0.6, changeFrequency: 'monthly' },
  { url: `${base}/satin-al/anma`, priority: 0.9, changeFrequency: 'weekly' },
  { url: `${base}/satin-al/aile`, priority: 0.8, changeFrequency: 'weekly' },
  { url: `${base}/privacy`, priority: 0.3, changeFrequency: 'yearly' },
  { url: `${base}/terms`, priority: 0.3, changeFrequency: 'yearly' },
  { url: `${base}/cookies`, priority: 0.3, changeFrequency: 'yearly' },
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
