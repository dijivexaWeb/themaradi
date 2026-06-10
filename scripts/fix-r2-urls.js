const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// 1. Load .env.local manually
const envPath = path.resolve(__dirname, '../.env.local')
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found at:', envPath)
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split(/\r?\n/).forEach((line) => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return
  const match = trimmed.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
  if (match) {
    env[match[1]] = (match[2] || '').replace(/['"]/g, '').trim()
  }
})
Object.assign(process.env, env)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const r2PublicUrl = process.env.R2_PUBLIC_URL

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Hata: Supabase URL veya Service Role Key eksik!')
  process.exit(1)
}

if (!r2PublicUrl) {
  console.warn('⚠️ Uyarı: R2_PUBLIC_URL tanımlı değil! Veritabanındaki URL\'ler varsayılan R2 S3 formatına dönüştürülecektir.')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

// Cloudflare R2 S3 endpoint domain pattern matching:
// https://{bucket}.{accountId}.r2.cloudflarestorage.com/
const s3Pattern = /https:\/\/[\w.-]+\.r2\.cloudflarestorage\.com\//

function getNewUrl(oldUrl, key) {
  if (r2PublicUrl) {
    const cleanBase = r2PublicUrl.endsWith('/') ? r2PublicUrl.slice(0, -1) : r2PublicUrl
    return `${cleanBase}/${key}`
  }
  const accountId = process.env.R2_ACCOUNT_ID
  const bucket = process.env.R2_PUBLIC_BUCKET || 'tem-public-media'
  return `https://${bucket}.${accountId}.r2.cloudflarestorage.com/${key}`
}

async function fixTable(tableName, columnName, keyColumn) {
  console.log(`\n⚙️ ${tableName}.${columnName} sütunu inceleniyor...`)
  const { data: rows, error } = await supabase
    .from(tableName)
    .select(`id, ${columnName}, ${keyColumn}`)
    .not(columnName, 'is', null)

  if (error) {
    console.error(`❌ ${tableName} verileri alınamadı:`, error.message)
    return
  }

  let count = 0
  for (const row of rows) {
    const oldUrl = row[columnName]
    const fileKey = row[keyColumn]

    if (oldUrl && fileKey && s3Pattern.test(oldUrl)) {
      const newUrl = getNewUrl(oldUrl, fileKey)
      if (oldUrl === newUrl) continue

      console.log(`⏳ [${tableName} ${row.id}] URL güncelleniyor:\n   Eski: ${oldUrl}\n   Yeni: ${newUrl}`)
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ [columnName]: newUrl })
        .eq('id', row.id)

      if (updateError) {
        console.error(`❌ Güncelleme hatası:`, updateError.message)
      } else {
        count++
      }
    }
  }
  console.log(`✅ ${tableName}.${columnName} için ${count} kayıt güncellendi.`)
}

// Special case for tables without a separate key column (key is parsed from url)
async function fixUrlColumnOnly(tableName, columnName) {
  console.log(`\n⚙️ ${tableName}.${columnName} (Anahtarsız) sütunu inceleniyor...`)
  const { data: rows, error } = await supabase
    .from(tableName)
    .select(`id, ${columnName}`)
    .not(columnName, 'is', null)

  if (error) {
    console.error(`❌ ${tableName} verileri alınamadı:`, error.message)
    return
  }

  let count = 0
  for (const row of rows) {
    const oldUrl = row[columnName]
    if (oldUrl && s3Pattern.test(oldUrl)) {
      // Find S3 pattern and extract the key (path)
      const match = oldUrl.match(/https:\/\/[\w.-]+\.r2\.cloudflarestorage\.com\/(.*)/)
      if (match && match[1]) {
        const key = match[1]
        const newUrl = getNewUrl(oldUrl, key)
        if (oldUrl === newUrl) continue

        console.log(`⏳ [${tableName} ${row.id}] URL güncelleniyor:\n   Eski: ${oldUrl}\n   Yeni: ${newUrl}`)
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ [columnName]: newUrl })
          .eq('id', row.id)

        if (updateError) {
          console.error(`❌ Güncelleme hatası:`, updateError.message)
        } else {
          count++
        }
      }
    }
  }
  console.log(`✅ ${tableName}.${columnName} için ${count} kayıt güncellendi.`)
}

async function run() {
  console.log('🔄 Cloudflare R2 URL Güncelleme Aracı Başlatıldı...\n')
  
  // 1. media tablosu (original_url, thumb_url)
  await fixTable('media', 'original_url', 'r2_file_key')
  await fixTable('media', 'thumb_url', 'r2_file_key')

  // 2. vaults tablosu (cover_photo_url, hero_bg_url, favorite_song_url)
  // key sütunu yok, url içinden parse edilecek
  await fixUrlColumnOnly('vaults', 'cover_photo_url')
  await fixUrlColumnOnly('vaults', 'hero_bg_url')
  await fixUrlColumnOnly('vaults', 'favorite_song_url')

  // 3. vault_family_members (photo_url)
  await fixUrlColumnOnly('vault_family_members', 'photo_url')

  // 4. vault_memories (media_url)
  await fixUrlColumnOnly('vault_memories', 'media_url')

  // 5. memory_book_entries (photo_url)
  await fixUrlColumnOnly('memory_book_entries', 'photo_url')

  console.log('\n🏁 Tüm güncelleme işlemleri bitti!')
}

run()
