import type { Metadata } from 'next'
import LandingNav from '@/components/landing/Nav'
import NotableProfilesSection, { type NotableMemorial } from '@/components/landing/NotableProfilesSection'
import { createServiceClient } from '@/lib/supabase/server'
import { buildAlternateLanguages } from '@/lib/i18n/hreflang'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Ulusal Miras — Bir Milletin Hafızası | The Eternal Memory',
  description: 'Tarihe iz bırakmış isimlerin dijital anma profilleri. The Eternal Memory ile ulusal mirası yaşatın.',
  alternates: { canonical: `${APP_URL}/miras`, languages: buildAlternateLanguages('/miras') },
  openGraph: {
    title: 'Ulusal Miras — Bir Milletin Hafızası',
    description: 'Tarihe iz bırakmış isimlerin dijital anma profilleri.',
    url: `${APP_URL}/miras`,
    type: 'website',
  },
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
