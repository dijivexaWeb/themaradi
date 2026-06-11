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

  let query = supabase
    .from('vaults')
    .select(
      'id, display_name, slug, tagline, birth_date, death_date, cover_photo_url, birth_place',
      { count: 'exact' },
    )
    .eq('status', 'public_memorial')
    .order('updated_at', { ascending: false })

  if (searchTerm) {
    query = query.ilike('display_name', `%${searchTerm}%`)
  } else if (letter) {
    query = query.ilike('display_name', `${letter}%`)
  }

  const from = (currentPage - 1) * PAGE_SIZE
  const { data: memorials, count } = await query.range(from, from + PAGE_SIZE - 1)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-[#fbf8f1] text-[#173d31]">
      <LandingNav />
      <MemorialsClient
        memorials={(memorials ?? []) as MemorialItem[]}
        count={count ?? 0}
        currentPage={currentPage}
        totalPages={totalPages}
        searchTerm={searchTerm}
        letter={letter}
      />
    </div>
  )
}
