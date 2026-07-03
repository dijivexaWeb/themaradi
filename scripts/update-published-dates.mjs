import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env.local')
const envVars = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) acc[m[1].trim()] = m[2].trim()
  return acc
}, {})

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY)

// Slug -> yeni published_at (yerel saat 12:00 ile ISO'ya çevrilecek)
const SLUG_DATES = {
  'nino-kvaratskhelia': '2026-06-12T12:00:00Z',
  'giorgi-beridze-imereti': '2026-06-12T12:00:00Z',
  'huseyin-kara-tbilisi': '2026-06-15T12:00:00Z',
  'tamar-chikvanaia': '2026-06-18T12:00:00Z',
  'marina-lomidze-tbilisi': '2026-06-25T12:00:00Z',
  'giorgi-maisuradze-tbilisi': '2026-07-03T12:00:00Z',
}

async function main() {
  // 1) Bilinen slug'lar için doğrudan güncelle
  for (const [slug, date] of Object.entries(SLUG_DATES)) {
    const { error, data } = await supabase
      .from('vaults')
      .update({ published_at: date })
      .eq('slug', slug)
      .select('id, display_name')
    if (error) console.error(`✗ ${slug}:`, error.message)
    else if (!data?.length) console.warn(`⚠ ${slug}: eşleşen kayıt bulunamadı`)
    else console.log(`✓ ${slug} → ${date} (${data[0].display_name})`)
  }

  // 2) İstanbollu aile üyelerini display_name'e göre bul ve güncelle
  const { data: istanbollu, error: findErr } = await supabase
    .from('vaults')
    .select('id, slug, display_name')
    .ilike('display_name', '%İstanbollu%')

  if (findErr) {
    console.error('✗ İstanbollu araması başarısız:', findErr.message)
  } else if (!istanbollu?.length) {
    console.warn('⚠ İstanbollu profili bulunamadı')
  } else {
    for (const v of istanbollu) {
      const { error } = await supabase
        .from('vaults')
        .update({ published_at: '2026-06-29T12:00:00Z' })
        .eq('id', v.id)
      if (error) console.error(`✗ ${v.slug}:`, error.message)
      else console.log(`✓ ${v.slug} → 2026-06-29T12:00:00Z (${v.display_name})`)
    }
  }

  console.log('\nDone.')
}

main().catch(console.error)
