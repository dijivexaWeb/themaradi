import type { Metadata } from 'next'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import MemorialPageClient from './MemorialPageClient'
import RealMemorialPage from './RealMemorialPage'
import ObjectionSection from './ObjectionSection'

export const revalidate = 0

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (slug === 'demo') {
    return {
      title: 'Ahmet Yılmaz - The Eternal Memory',
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

  if (!vault) return { title: 'The Eternal Memory' }

  const birthYear = vault.birth_date ? new Date(vault.birth_date).getFullYear() : null
  const deathYear = vault.death_date ? new Date(vault.death_date).getFullYear() : null
  const years = birthYear && deathYear ? ` — ${birthYear}-${deathYear}` : ''

  return {
    title: `${vault.display_name}${years} - The Eternal Memory`,
    description: vault.tagline ?? `${vault.display_name} için dijital anma sayfası.`,
  }
}

interface PropsWithSearch extends Props {
  searchParams: Promise<{ preview?: string }>
}

export default async function MemorialPage({ params, searchParams }: PropsWithSearch) {
  const { slug } = await params
  const { preview } = await searchParams

  if (slug === 'demo') {
    return <MemorialPageClient />
  }

  const supabase = await createClient()
  // preview=1: use service client to bypass RLS (unpublished vaults are hidden from non-owners)
  const vaultClient = preview === '1' ? await createServiceClient() : supabase
  const { data: vault } = await vaultClient
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

  const isLive = vault.status === 'public_memorial' || vault.status === 'private_memorial'

  // Owner/admin preview — yayınlanmamış sayfalarda sahibi veya admin görebilir
  if (!isLive && preview === '1') {
    const { data: { user } } = await supabase.auth.getUser()
    const isOwner = user?.id === vault.owner_id
    let isAdmin = false
    if (user && !isOwner) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      isAdmin = profile?.role === 'admin'
    }
    if (!isOwner && !isAdmin) {
      return (
        <div className="min-h-screen bg-[#0c3327] flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-serif text-[#c7a76f] mb-2">{vault.display_name}</h1>
            <p className="text-[#cfc3ad] text-sm mt-2">Bu anma sayfası henüz yayınlanmamış.</p>
          </div>
        </div>
      )
    }
    const backLink = isAdmin ? '/admin/verifications' : `/anma-paneli/${vault.id}`
    const backLabel = isAdmin ? 'Admin Paneli' : 'Panele Dön'
    return (
      <>
        {/* Önizleme bandı */}
        <div className="sticky top-0 z-50 flex items-center justify-between bg-amber-500 px-4 py-2 text-sm font-semibold text-white">
          <span>👁 Önizleme Modu — Bu sayfa henüz yayınlanmadı</span>
          <a href={backLink} className="rounded bg-white/20 px-3 py-1 text-xs hover:bg-white/30">
            {backLabel}
          </a>
        </div>
        <RealMemorialPage vault={vault} />
      </>
    )
  }

  if (!isLive) {
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

  return (
    <>
      <RealMemorialPage vault={vault} />
      {vault.status === 'public_memorial' && <ObjectionSection vaultId={vault.id} />}
    </>
  )
}
