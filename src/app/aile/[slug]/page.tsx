import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getTranslation } from '@/i18n/server'
import PremiumFamilyPageClient from './PremiumFamilyPageClient'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: family } = await supabase
    .from('memorial_families')
    .select('name, tagline')
    .eq('slug', slug)
    .single()

  const name = family?.name ?? 'Anma Sayfası'
  return {
    title: `${name} — The Eternal Memory`,
    description: family?.tagline ?? `${name} anma sayfası`,
  }
}

export default async function PublicFamilyPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { t, lang } = await getTranslation()

  const { data: family } = await supabase
    .from('memorial_families')
    .select('id, name, tagline, description, hero_bg_url, is_public, slug, enabled_actions')
    .eq('slug', slug)
    .single()

  if (!family || !family.is_public) notFound()

  const [
    { data: memberRows },
    { data: familyPhotos },
    { data: familyMemories },
    { data: familyActions },
    { data: familyGuestbook },
  ] = await Promise.all([
    supabase.from('family_members').select('vault_id, sort_order').eq('family_id', family.id).order('sort_order', { ascending: true }),
    supabase.from('family_media').select('id, original_url, caption, taken_at').eq('family_id', family.id).order('sort_order', { ascending: true }),
    supabase.from('family_memories').select('id, title, content, memory_date').eq('family_id', family.id).order('created_at', { ascending: false }),
    supabase.from('family_actions').select('action_type, count').eq('family_id', family.id),
    supabase.from('family_guestbook').select('id, author_name, message, relation, message_type, created_at').eq('family_id', family.id).eq('status', 'approved').order('created_at', { ascending: false }).limit(30),
  ])

  const vaultIds = (memberRows ?? []).map(r => r.vault_id)
  let memberVaults: { id: string; display_name: string; slug: string | null; cover_photo_url: string | null; birth_date: string | null; death_date: string | null }[] = []

  if (vaultIds.length > 0) {
    const vaultsRes = await supabase
      .from('vaults')
      .select('id, display_name, slug, cover_photo_url, birth_date, death_date')
      .in('id', vaultIds)
      .eq('status', 'public_memorial')
    memberVaults = (vaultsRes.data as typeof memberVaults) ?? []
  }

  const condolences = (familyGuestbook ?? []) as { id: string; author_name: string; message: string; relation: string | null; message_type: string | null; created_at: string }[]

  const photos = (familyPhotos ?? []).map(p => ({
    id: p.id,
    original_url: p.original_url,
    caption: p.caption
  }))

  const memories = (familyMemories ?? []).map(m => ({
    id: m.id,
    title: m.title,
    content: m.content,
    memory_date: m.memory_date
  }))

  const actions = (familyActions ?? []) as { action_type: 'candle' | 'flower' | 'prayer' | 'heart' | 'star' | 'silence'; count: number }[]

  return (
    <div className="family-page-premium">
      <PremiumFamilyPageClient
        family={family}
        memberVaults={memberVaults}
        photos={photos}
        memories={memories}
        condolences={condolences}
        actions={actions}
        lang={lang}
        translations={t}
      />
    </div>
  )
}
