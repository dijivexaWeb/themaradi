import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Palette } from 'lucide-react'
import ThemeSelector from './_ThemeSelector'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

export default async function GorunumPage({ params, searchParams }: Props) {
  const { id } = await params
  const { saved } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, display_name, status, theme')
    .eq('id', id)
    .eq('owner_id', user.id)
    .eq('product_type', 'memorial_profile')
    .single()
  if (!vault) notFound()

  const isLocked = vault.status === 'pending_verification'
  const currentTheme = (vault.theme as string) || 'classic_emerald'

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#174f35]/10">
            <Palette className="h-5 w-5 text-[#174f35]" />
          </div>
          <div>
            <h1 className="font-serif text-3xl text-[#1f2d27]">Görünüm & Tema</h1>
            <p className="mt-0.5 text-sm text-[#788177]">Anma sayfanızın renk temasını seçin.</p>
          </div>
        </div>

        {saved && (
          <div className="mb-5 rounded-2xl border border-[#cfe7d3] bg-[#e9f5ec] px-5 py-4 text-sm font-medium text-[#176b3f]">
            ✓ Tema kaydedildi.
          </div>
        )}

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra tema seçebilirsiniz.
          </div>
        )}

        <ThemeSelector vaultId={id} initialTheme={currentTheme} isLocked={isLocked} />
      </div>
    </div>
  )
}
