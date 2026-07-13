import type { Metadata } from 'next'
import LandingNav from '@/components/landing/Nav'
import NotableProfilesSection, { type NotableMemorial } from '@/components/landing/NotableProfilesSection'
import { createServiceClient } from '@/lib/supabase/server'
import { buildAlternateLanguages, buildCanonical } from '@/lib/i18n/hreflang'
import { getTranslation } from '@/i18n/server'

export const revalidate = 3600
const PATH = '/miras'

export async function generateMetadata(): Promise<Metadata> {
  const { t, lang } = await getTranslation()
  const m = t.seoMeta.miras
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: buildCanonical(lang, PATH), languages: buildAlternateLanguages(PATH) },
    openGraph: { title: m.title, description: m.description, url: buildCanonical(lang, PATH), type: 'website' },
  }
}

export default async function MirasPage() {
  const supabase = await createServiceClient()

  const { data: notableRaw } = await supabase
    .from('vaults')
    .select('id, display_name, slug, tagline, birth_date, death_date, cover_photo_url, nationality, notable_subtitle, birth_place')
    .eq('status', 'public_memorial')
    .eq('is_notable', true)
    .order('notable_sort_order', { ascending: true, nullsFirst: false })
    .order('published_at', { ascending: false })

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
      <div style={{ paddingTop: 40 }}>
        <NotableProfilesSection memorials={notableMemorials} />
      </div>
    </div>
  )
}
