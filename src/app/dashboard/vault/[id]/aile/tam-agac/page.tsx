import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import FamilyTreeCanvas from '@/components/FamilyTreeCanvas'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TamAgacPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults')
    .select('id, display_name, status, cover_photo_url, birth_date, death_date')
    .eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const { data: members } = await supabase
    .from('vault_family_members').select('*')
    .eq('vault_id', id).order('sort_order', { ascending: true })

  const memberCount = members?.length ?? 0

  return (
    <div className="min-h-screen bg-[#091712] text-[#efe7d8]">

      {/* Nav */}
      <div className="sticky top-0 z-20 border-b border-white/8 bg-[#091712]/95 px-5 py-4 sm:px-8 backdrop-blur">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="text-[#c7a76f]/60 hover:text-[#c7a76f] transition-colors">Dashboard</Link>
            <span className="text-white/20">/</span>
            <Link href={`/dashboard/vault/${id}`} className="text-[#c7a76f]/60 hover:text-[#c7a76f] transition-colors">{vault.display_name}</Link>
            <span className="text-white/20">/</span>
            <Link href={`/dashboard/vault/${id}/aile`} className="text-[#c7a76f]/60 hover:text-[#c7a76f] transition-colors">Aile Bağları</Link>
            <span className="text-white/20">/</span>
            <span className="font-semibold text-[#efe7d8]">Tam Ağaç</span>
          </div>
          <Link href={`/dashboard/vault/${id}/aile`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-[#c7a76f] hover:border-[#c7a76f]/40 transition-colors">
            ← Geri
          </Link>
        </div>
      </div>

      <div className="px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 text-[#c7a76f] mb-3">
              <span className="h-px w-10 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.2em] uppercase">Tam Aile Ağacı</span>
              <span className="h-px w-10 bg-[#c7a76f]" />
            </div>
            <h1 className="font-serif text-3xl text-white sm:text-4xl">{vault.display_name}</h1>
            {memberCount > 0 && (
              <p className="mt-2 text-sm text-[#8f9f96]">{memberCount} aile üyesi</p>
            )}
          </div>

          {/* Full tree */}
          {memberCount === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#0d1412] py-16 text-center">
              <p className="text-4xl mb-3">🌳</p>
              <p className="font-serif text-lg text-white">Henüz aile üyesi eklenmemiş</p>
              <Link href={`/dashboard/vault/${id}/aile?add=1`}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#c7a76f] px-5 py-2.5 text-sm font-semibold text-[#091712] hover:bg-[#d4b87c] transition-colors">
                + Üye Ekle
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1412] shadow-2xl shadow-black/30">
              <div className="relative p-4 sm:p-6">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(199,167,111,0.08),transparent_50%)]" />
                <div className="relative">
                  <FamilyTreeCanvas
                    maxDepth={99}
                    vault={{
                      display_name: vault.display_name,
                      cover_photo_url: vault.cover_photo_url,
                      birth_date: vault.birth_date,
                      death_date: vault.death_date,
                    }}
                    members={(members ?? []).map(m => ({
                      id: m.id,
                      full_name: m.full_name,
                      relationship: m.relationship,
                      photo_url: m.photo_url ?? null,
                      birth_date: m.birth_date ?? null,
                      death_date: m.death_date ?? null,
                      is_alive: m.is_alive ?? true,
                      parent_member_id: (m as Record<string, unknown>).parent_member_id as string | null ?? null,
                    }))}
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
