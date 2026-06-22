import LandingNav from '@/components/landing/Nav'
import { createServiceClient } from '@/lib/supabase/server'
import MemorialsClient, { type MemorialItem } from './_MemorialsClient'

export const revalidate = 60

const PAGE_SIZE = 20

interface Props {
  searchParams: Promise<{ q?: string; l?: string; page?: string }>
}

export default async function MemorialsIndexPage({ searchParams }: Props) {
  const params = await searchParams
  const searchTerm = params.q?.trim() ?? ''
  const letter = params.l?.toUpperCase() ?? ''
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10))

  const supabase = await createServiceClient()

  const SELECT_FIELDS = 'id, display_name, slug, tagline, birth_date, death_date, cover_photo_url, cover_video_url, birth_place, is_notable, nationality, notable_sort_order'

  // Notable profiles — always pinned at top, filtered by search/letter when active
  let notableQuery = supabase
    .from('vaults')
    .select(SELECT_FIELDS)
    .eq('status', 'public_memorial')
    .eq('is_notable', true)
    .order('notable_sort_order', { ascending: true, nullsFirst: false })
    .order('display_name', { ascending: true })

  if (searchTerm) {
    notableQuery = notableQuery.ilike('display_name', `%${searchTerm}%`)
  } else if (letter) {
    notableQuery = notableQuery.ilike('display_name', `${letter}%`)
  }

  const { data: notableMemorials } = await notableQuery

  // Regular profiles — exclude notables, apply filters, paginate
  let query = supabase
    .from('vaults')
    .select(SELECT_FIELDS, { count: 'exact' })
    .eq('status', 'public_memorial')
    .or('is_notable.is.null,is_notable.eq.false')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (searchTerm) {
    query = query.ilike('display_name', `%${searchTerm}%`)
  } else if (letter) {
    query = query.ilike('display_name', `${letter}%`)
  }

  const from = (currentPage - 1) * PAGE_SIZE
  const { data: memorials, count } = await query.range(from, from + PAGE_SIZE - 1)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  // Attach family info to all memorials
  const allIds = [...(notableMemorials ?? []), ...(memorials ?? [])].map(v => v.id)
  const familyMap: Record<string, { name: string; slug: string }> = {}
  if (allIds.length > 0) {
    const { data: familyLinks } = await supabase
      .from('family_members')
      .select('vault_id, memorial_families(name, slug)')
      .in('vault_id', allIds)
    for (const link of familyLinks ?? []) {
      const raw = link.memorial_families as { name: string; slug: string }[] | { name: string; slug: string } | null
      const fam = Array.isArray(raw) ? raw[0] : raw
      if (fam && link.vault_id) familyMap[link.vault_id] = fam
    }
  }

  return (
    <div className="min-h-screen bg-[#fbf8f1] text-[#173d31]">
      <LandingNav />
      <MemorialsClient
        memorials={(memorials ?? []).map(m => ({ ...m, family: familyMap[m.id] ?? null })) as MemorialItem[]}
        notableMemorials={(notableMemorials ?? []).map(m => ({ ...m, family: familyMap[m.id] ?? null })) as MemorialItem[]}
        count={count ?? 0}
        currentPage={currentPage}
        totalPages={totalPages}
        searchTerm={searchTerm}
        letter={letter}
      />
    </div>
  )
}
