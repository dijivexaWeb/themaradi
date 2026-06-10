const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

// 1. Load .env.local manually
const envPath = path.resolve(__dirname, '../.env.local')
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found at:', envPath)
  process.exit(1)
}

console.log('📖 Loading environment variables from .env.local...')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split(/\r?\n/).forEach((line) => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return
  const match = trimmed.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
  if (match) {
    const key = match[1]
    let val = match[2] || ''
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1)
    env[key] = val.trim()
  }
})

Object.assign(process.env, env)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const r2Endpoint = process.env.R2_ENDPOINT
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY
const r2PublicBucket = process.env.R2_PUBLIC_BUCKET || 'tem-public-media'
const r2PrivateBucket = process.env.R2_PRIVATE_BUCKET || 'tem-private-documents'
const r2PublicUrl = process.env.R2_PUBLIC_URL

if (!supabaseUrl || !supabaseServiceKey || !r2Endpoint || !r2AccessKeyId || !r2SecretAccessKey) {
  console.error('❌ Hata: .env.local içinde gerekli R2 veya Supabase anahtarları eksik!')
  console.error('Lütfen R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY ve SUPABASE_SERVICE_ROLE_KEY değişkenlerini kontrol edin.')
  process.exit(1)
}

// 2. Initialize Clients
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

const r2 = new S3Client({
  region: 'auto',
  endpoint: r2Endpoint,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  },
})

function getR2PublicUrl(key) {
  if (r2PublicUrl) {
    const cleanBase = r2PublicUrl.endsWith('/') ? r2PublicUrl.slice(0, -1) : r2PublicUrl
    return `${cleanBase}/${key}`
  }
  const accountId = process.env.R2_ACCOUNT_ID
  return `https://${r2PublicBucket}.${accountId}.r2.cloudflarestorage.com/${key}`
}

async function runMigration() {
  console.log('🚀 Supabase Storage -> Cloudflare R2 Göç İşlemi Başladı...\n')

  // --- FAZ 1: public.media Tablosu Taşıması ---
  console.log('📦 FAZ 1: public.media tablosu işleniyor...')
  const { data: mediaItems, error: mediaError } = await supabase
    .from('media')
    .select('id, storage_bucket, storage_path, media_type')
    .eq('source_type', 'bucket')
    .not('storage_path', 'is', null)

  if (mediaError) {
    console.error('❌ Media verileri çekilemedi:', mediaError.message)
  } else {
    console.log(`Found ${mediaItems.length} media items to migrate.`)
    for (const item of mediaItems) {
      try {
        console.log(`⏳ [Media ${item.id}] Supabase'den indiriliyor: ${item.storage_path}...`)
        const { data: fileBlob, error: downloadError } = await supabase
          .storage
          .from(item.storage_bucket)
          .download(item.storage_path)

        if (downloadError) {
          console.error(`❌ İndirme hatası [Media ${item.id}]:`, downloadError.message)
          continue
        }

        const arrayBuffer = await fileBlob.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        console.log(`⏳ [Media ${item.id}] R2'ye yükleniyor: ${r2PublicBucket}/${item.storage_path}...`)
        await r2.send(new PutObjectCommand({
          Bucket: r2PublicBucket,
          Key: item.storage_path,
          Body: buffer,
          ContentType: fileBlob.type,
        }))

        const newUrl = getR2PublicUrl(item.storage_path)

        // Veritabanı kaydını güncelle
        const { error: updateError } = await supabase
          .from('media')
          .update({
            storage_bucket: r2PublicBucket,
            original_url: newUrl,
            thumb_url: item.media_type === 'image' ? newUrl : undefined,
            r2_file_key: item.storage_path,
            status: 'ready'
          })
          .eq('id', item.id)

        if (updateError) {
          console.error(`❌ DB Güncelleme hatası [Media ${item.id}]:`, updateError.message)
        } else {
          console.log(`✅ [Media ${item.id}] Başarıyla taşındı ve güncellendi.`)
        }
      } catch (err) {
        console.error(`❌ Beklenmeyen hata [Media ${item.id}]:`, err.message)
      }
    }
  }

  // --- FAZ 2: vault_documents Tablosu Taşıması ---
  console.log('\n📦 FAZ 2: vault_documents tablosu işleniyor (Özel Kasa Evrakları)...')
  const { data: vaultDocs, error: docsError } = await supabase
    .from('vault_documents')
    .select('id, storage_bucket, storage_path, file_name')
    .not('storage_path', 'is', null)

  if (docsError) {
    console.error('❌ Vault Documents verileri çekilemedi:', docsError.message)
  } else {
    console.log(`Found ${vaultDocs.length} documents to migrate.`)
    for (const doc of vaultDocs) {
      try {
        console.log(`⏳ [Doc ${doc.id}] Supabase'den indiriliyor: ${doc.storage_path}...`)
        const { data: fileBlob, error: downloadError } = await supabase
          .storage
          .from(doc.storage_bucket)
          .download(doc.storage_path)

        if (downloadError) {
          console.error(`❌ İndirme hatası [Doc ${doc.id}]:`, downloadError.message)
          continue
        }

        const arrayBuffer = await fileBlob.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        console.log(`⏳ [Doc ${doc.id}] R2 Private Bucket'a yükleniyor: ${r2PrivateBucket}/${doc.storage_path}...`)
        await r2.send(new PutObjectCommand({
          Bucket: r2PrivateBucket,
          Key: doc.storage_path,
          Body: buffer,
          ContentType: fileBlob.type,
        }))

        // Özel belge olduğu için file_url boşaltılır, file_key ve storage_bucket güncellenir
        const { error: updateError } = await supabase
          .from('vault_documents')
          .update({
            storage_bucket: r2PrivateBucket,
            file_url: '', // Artık doğrudan erişim kapalı
            file_key: doc.storage_path
          })
          .eq('id', doc.id)

        if (updateError) {
          console.error(`❌ DB Güncelleme hatası [Doc ${doc.id}]:`, updateError.message)
        } else {
          console.log(`✅ [Doc ${doc.id}] Başarıyla taşındı ve özel kasaya güncellendi.`)
        }
      } catch (err) {
        console.error(`❌ Beklenmeyen hata [Doc ${doc.id}]:`, err.message)
      }
    }
  }

  // --- FAZ 3: memorial_verification_docs Tablosu Taşıması ---
  console.log('\n📦 FAZ 3: memorial_verification_docs tablosu işleniyor (Vefat Belgeleri)...')
  const { data: verDocs, error: verError } = await supabase
    .from('memorial_verification_docs')
    .select('id, storage_bucket, storage_path, file_name')
    .not('storage_path', 'is', null)

  if (verError) {
    console.error('❌ Verification Documents verileri çekilemedi:', verError.message)
  } else {
    console.log(`Found ${verDocs.length} verification docs to migrate.`)
    for (const doc of verDocs) {
      try {
        console.log(`⏳ [VerDoc ${doc.id}] Supabase'den indiriliyor: ${doc.storage_path}...`)
        const { data: fileBlob, error: downloadError } = await supabase
          .storage
          .from(doc.storage_bucket)
          .download(doc.storage_path)

        if (downloadError) {
          console.error(`❌ İndirme hatası [VerDoc ${doc.id}]:`, downloadError.message)
          continue
        }

        const arrayBuffer = await fileBlob.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        console.log(`⏳ [VerDoc ${doc.id}] R2 Private Bucket'a yükleniyor: ${r2PrivateBucket}/${doc.storage_path}...`)
        await r2.send(new PutObjectCommand({
          Bucket: r2PrivateBucket,
          Key: doc.storage_path,
          Body: buffer,
          ContentType: fileBlob.type,
        }))

        // Özel belge olduğu için file_url boşaltılır, file_key ve storage_bucket güncellenir
        const { error: updateError } = await supabase
          .from('memorial_verification_docs')
          .update({
            storage_bucket: r2PrivateBucket,
            file_url: '', // Doğrudan erişim yok
            file_key: doc.storage_path
          })
          .eq('id', doc.id)

        if (updateError) {
          console.error(`❌ DB Güncelleme hatası [VerDoc ${doc.id}]:`, updateError.message)
        } else {
          console.log(`✅ [VerDoc ${doc.id}] Başarıyla taşındı ve güncellendi.`)
        }
      } catch (err) {
        console.error(`❌ Beklenmeyen hata [VerDoc ${doc.id}]:`, err.message)
      }
    }
  }

  // --- FAZ 4: Diğer Tablolardaki URL Kolonlarının R2'ye Taşınması ---
  const migrateTableUrlColumn = async (tableName, columnName) => {
    console.log(`\n📦 FAZ: ${tableName}.${columnName} sütunu işleniyor...`)
    const prefix = `${supabaseUrl}/storage/v1/object/public/`
    const { data: rows, error } = await supabase
      .from(tableName)
      .select(`id, ${columnName}`)
      .like(columnName, `${prefix}%`)

    if (error) {
      console.error(`❌ ${tableName} verileri çekilemedi:`, error.message)
      return
    }

    console.log(`Found ${rows.length} rows to migrate in ${tableName}.${columnName}.`)
    for (const row of rows) {
      try {
        const url = row[columnName]
        if (!url) continue
        
        const relativePart = url.replace(prefix, '')
        const firstSlash = relativePart.indexOf('/')
        if (firstSlash === -1) continue
        
        const bucket = relativePart.substring(0, firstSlash)
        const path = relativePart.substring(firstSlash + 1)
        
        console.log(`⏳ [${tableName} ${row.id}] Supabase'den indiriliyor: ${bucket}/${path}...`)
        const { data: fileBlob, error: downloadError } = await supabase
          .storage
          .from(bucket)
          .download(path)

        if (downloadError) {
          console.error(`❌ İndirme hatası [${tableName} ${row.id}]:`, downloadError.message)
          continue
        }

        const arrayBuffer = await fileBlob.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        console.log(`⏳ [${tableName} ${row.id}] R2'ye yükleniyor: ${r2PublicBucket}/${path}...`)
        await r2.send(new PutObjectCommand({
          Bucket: r2PublicBucket,
          Key: path,
          Body: buffer,
          ContentType: fileBlob.type,
        }))

        const newUrl = getR2PublicUrl(path)

        const { error: updateError } = await supabase
          .from(tableName)
          .update({
            [columnName]: newUrl
          })
          .eq('id', row.id)

        if (updateError) {
          console.error(`❌ DB Güncelleme hatası [${tableName} ${row.id}]:`, updateError.message)
        } else {
          console.log(`✅ [${tableName} ${row.id}] Başarıyla R2'ye taşındı ve güncellendi.`)
        }
      } catch (err) {
        console.error(`❌ Beklenmeyen hata [${tableName} ${row.id}]:`, err.message)
      }
    }
  }

  await migrateTableUrlColumn('vaults', 'cover_photo_url')
  await migrateTableUrlColumn('vaults', 'hero_bg_url')
  await migrateTableUrlColumn('vaults', 'favorite_song_url')
  await migrateTableUrlColumn('vault_family_members', 'photo_url')
  await migrateTableUrlColumn('vault_memories', 'media_url')
  await migrateTableUrlColumn('memory_book_entries', 'photo_url')

  console.log('\n🏁 Göç işlemi başarıyla tamamlandı!')
}

runMigration()
