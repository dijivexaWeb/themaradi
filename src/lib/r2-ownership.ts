import type { createClient } from '@/lib/supabase/server'

/**
 * Bir yüklemede geçen profileId/orderId'nin gerçekten çağıran kullanıcıya ait
 * olduğunu doğrular. Kontrol edilmezse herkes başka birinin vault/aile/sipariş
 * ID'sini kullanarak onun storage alanına dosya yükleyebilirdi (IDOR).
 */
export async function verifyUploadOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  category: string,
  profileId: string
): Promise<boolean> {
  if (category === 'family_photo') {
    const { data } = await supabase
      .from('memorial_families')
      .select('id')
      .eq('id', profileId)
      .eq('owner_id', userId)
      .maybeSingle()
    return !!data
  }

  // gallery_image, profile_cover, profile_photo, hero_bg, profile_cover_video,
  // audio_recording, death_certificate, verification_document — hepsi vaults.id kullanır
  const { data } = await supabase
    .from('vaults')
    .select('id')
    .eq('id', profileId)
    .eq('owner_id', userId)
    .maybeSingle()
  return !!data
}

/** payment_proof kategorisi için orderId'nin çağıran kullanıcıya ait olduğunu doğrular. */
export async function verifyOrderOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  orderId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('payments')
    .select('id')
    .eq('id', orderId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}
