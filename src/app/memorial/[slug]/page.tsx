import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import MemorialPageClient from './MemorialPageClient'
import RealMemorialPage from './RealMemorialPage'

export const revalidate = 3600

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (slug === 'demo') {
    return {
      title: 'Ahmet Yılmaz - The Maradi',
      description: 'Ahmet Yılmaz için hazırlanmış dijital anma profili. 1940-2020.',
    }
  }

  const supabase = await createClient()
  const { data: vault } = await supabase
    .from('vaults')
    .select('display_name, tagline, birth_date, death_date')
    .eq('slug', slug)
    .eq('status', 'public_memorial')
    .single()

  if (!vault) return { title: 'The Maradi' }

  const birthYear = vault.birth_date ? new Date(vault.birth_date).getFullYear() : null
  const deathYear = vault.death_date ? new Date(vault.death_date).getFullYear() : null
  const years = birthYear && deathYear ? ` — ${birthYear}-${deathYear}` : ''

  return {
    title: `${vault.display_name}${years} - The Maradi`,
    description: vault.tagline ?? `${vault.display_name} için dijital anma sayfası.`,
  }
}

export default async function MemorialPage({ params }: Props) {
  const { slug } = await params

  if (slug === 'demo') {
    return <MemorialPageClient />
  }

  const supabase = await createClient()
  const { data: vault } = await supabase
    .from('vaults')
    .select('*')
    .eq('slug', slug)
    .single()

  // Not found
  if (!vault) {
    return (
      <div className="min-h-screen bg-[#0c3327] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🕯️</div>
          <h1 className="text-2xl font-serif text-[#c7a76f] mb-2">Sayfa Bulunamadı</h1>
          <p className="text-[#cfc3ad] text-sm">Bu anma sayfası mevcut değil veya kaldırılmış olabilir.</p>
        </div>
      </div>
    )
  }

  // Not yet published
  if (vault.status !== 'public_memorial') {
    return (
      <div className="min-h-screen bg-[#0c3327] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-serif text-[#c7a76f] mb-2">{vault.display_name}</h1>
          <p className="text-[#cfc3ad] text-sm mt-2">Bu anma sayfası henüz yayınlanmamış.</p>
          <p className="text-[#c7a76f]/50 text-xs mt-3">
            Sayfa sahibi tarafından yayınlandığında buradan ulaşabilirsiniz.
          </p>
        </div>
      </div>
    )
  }

  return <RealMemorialPage vault={vault} />
}
