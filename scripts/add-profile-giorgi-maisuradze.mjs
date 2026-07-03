import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

// Load .env.local
const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env.local')
const envVars = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) acc[m[1].trim()] = m[2].trim()
  return acc
}, {})

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PHOTOS_DIR = path.join(__dirname, 'demo-photos')

const R2_ENDPOINT = envVars.R2_ENDPOINT
const R2_ACCESS_KEY = envVars.R2_ACCESS_KEY_ID
const R2_SECRET_KEY = envVars.R2_SECRET_ACCESS_KEY
const R2_BUCKET = envVars.R2_PUBLIC_BUCKET
const R2_PUBLIC_URL = envVars.R2_PUBLIC_URL
const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY
const ADMIN_ID = 'd91c6055-196a-43c4-bfc2-c14076bb1127'

const r2 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_ACCESS_KEY, secretAccessKey: R2_SECRET_KEY },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
})

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function uploadToR2(filePath, vaultId, subfolder = 'assets') {
  const name = path.basename(filePath)
  const key = `profiles/${vaultId}/${subfolder}/${Date.now()}-${name}`
  const buffer = fs.readFileSync(filePath)
  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/png',
  }))
  return { url: `${R2_PUBLIC_URL}/${key}`, key }
}

const PUB_SETTINGS = {
  show_media: true,
  show_memories: true,
  show_biography: true,
  show_family_tree: true,
  auto_publish_on_death: false,
  require_heir_approval: true,
}

const profile = {
  coverFile: 'Profil_foto.png',
  vault: {
    slug: 'giorgi-maisuradze-tbilisi',
    display_name: 'გიორგი მაისურაძე',
    birth_date: '1949-05-14',
    death_date: '2024-11-22',
    birth_place: 'ქუთაისი, საქართველო',
    death_place: 'თბილისი, საქართველო',
    profession: 'ხის ხელოსანი და სამშენებლო ოსტატი',
    hobbies: 'ბაღი, ვაზის მოვლა, ძველი ქართული სიმღერები, ნარდი და დომინო',
    nationality: 'Georgian',
    tagline: 'მშვიდი ხასიათი, ოჯახის სიყვარული და მეგობრებისადმი ერთგულება — გიორგი მაისურაძე სამუდამოდ ჩვენს გულებში დარჩება.',
    biography: 'გიორგი მაისურაძე დაიბადა 1949 წლის 14 მაისს ქუთაისში. ახალგაზრდობიდანვე ცნობილი იყო შრომისმოყვარეობითა და პატიოსნებით. 1979 წელს ოჯახთან ერთად გადავიდა თბილისში, სადაც განაგრძო ცხოვრება შრომის, ოჯახისა და მეგობრობის საფუძველზე.\n\nის იყო ხელგამომეტებული ხის ოსტატი და სამშენებლო ხელოსანი — მრავალი წლის განმავლობაში აკეთებდა ავეჯს, პატარა შეკეთებებს და სამშენებლო სამუშაოებს. მეზობლები მას ენდობოდნენ არა მხოლოდ ხელობის, არამედ სიტყვის კაცობის გამო. „თუ საქმეს აკეთებ, სწორად უნდა გააკეთო" — ეს იყო მისი პრინციპი.\n\n1974 წელს დაქორწინდა ნინო მაისურაძეზე და ერთად ააშენეს ოჯახი, რომელიც სიყვარულზე, მოთმინებასა და შრომაზე იდგა. ორი შვილის მამა იყო და მოგვიანებით შვილიშვილების გაჩენამ მისი ცხოვრება კიდევ უფრო გაალამაზა. ცნობილი იყო ეზოში, ბაღში ან მეგობრებთან ერთად სუფრაზე ჯდომით — მშვიდი, სანდო და თბილი ხასიათით, რომელსაც ყველა იხსენებდა.',
    last_message: 'სახლი დიდი არ უნდა იყოს; მთავარია, შიგნით სიყვარული, პატივისცემა და დალოცვა იყოს.',
    cemetery_name: 'სასაფლაო, დავით სარაჯიშვილის ქუჩა',
    cemetery_address: 'დავით სარაჯიშვილის ქუჩა, თბილისი',
    cemetery_lat: 41.8011483,
    cemetery_lng: 44.797235,
    cemetery_hours: 'ყოველ დღე 09:00 – 18:00',
    status: 'public_memorial',
    product_type: 'memorial_profile',
    vault_origin: 'family',
    theme: 'warm_sunset',
    pub_settings: PUB_SETTINGS,
    view_count: 41,
    hero_left_react_heart: 4,
    hero_left_react_pray: 2,
    hero_right_react_heart: 2,
    hero_right_react_pray: 1,
    qr_code: 'TM-DEMO006',
    payment_verified_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    is_notable: false,
    hide_objection: false,
  },
  gallery: [
    { file: '1.png', caption: 'ოჯახთან ერთად, სახლის კიბეებზე' },
    { file: '2.png', caption: 'პატარა შვილებთან, ახალგაზრდობის წლები' },
    { file: '3.png', caption: 'საოჯახო სუფრა, შვილები უკვე გაზრდილები' },
    { file: '4.png', caption: 'პირველი შვილი ხელში' },
    { file: '5.png', caption: 'საზაფხულო სუფრა ეზოში' },
    { file: '6.png', caption: 'შვილებთან და მათ მეუღლეებთან სახლში' },
    { file: '7.png', caption: 'ჩაის სუფრა ბაღში' },
    { file: '8.png', caption: 'სეირნობა ეზოში ოჯახთან ერთად' },
    { file: '9.png', caption: 'მეგობრებთან სუფრაზე' },
    { file: '10.png', caption: 'დიდი სუფრა ნათესავებთან და მეგობრებთან' },
  ],
  memories: [
    {
      title: 'ეზოს სკამი',
      content: 'სახლის წინ, უბრალო სკამზე მჯდომი გიორგი ყველაზე ბუნებრივი თავად იყო. მშვიდი გამომეტყველება მის უბრალო, მაგრამ ძლიერ ხასიათს გამოხატავდა.',
      memory_date: '2020-06-01',
    },
    {
      title: 'სუფრა მეგობრებთან',
      content: 'დიდ სუფრებზე გიორგი უფრო მხიარული ჩანდა. სადღეგრძელოს კადრებში, სიცილსა და საუბარში ჩანდა მისი თბილი და საზოგადოებრივი მხარე — ეს სუფრები მხოლოდ საჭმელი კი არა, მოგონება და მეგობრობა იყო.',
      memory_date: '2015-09-12',
    },
  ],
  kronoloji: [
    { memory_date: '1949-05-14', title: 'დაბადება', content: 'გიორგი დაიბადა ქუთაისში.' },
    { memory_date: '1974-06-01', title: 'ქორწინება', content: 'დაქორწინდა ნინო მაისურაძეზე და საკუთარი ოჯახი შექმნა.' },
    { memory_date: '1979-01-01', title: 'გადასახლება თბილისში', content: 'ოჯახთან ერთად თბილისში გადავიდა საცხოვრებლად.' },
    { memory_date: '1985-01-01', title: 'ხელობის წლები', content: 'ხის ოსტატობითა და შრომისმოყვარეობით მეზობლების ნდობა დაიმსახურა.' },
    { memory_date: '2003-01-01', title: 'შვილიშვილების დაბადება', content: 'შვილიშვილების გაჩენამ მისი ცხოვრება კიდევ უფრო ბედნიერი გახადა.' },
    { memory_date: '2015-01-01', title: 'ოჯახთან და მეგობრებთან', content: 'დროის დიდი ნაწილი ეზოს, ბაღისა და მეგობრულ სუფრებს დაუთმო.' },
    { memory_date: '2024-11-22', title: 'გარდაცვალება', content: 'გარდაიცვალა თბილისში და დაუკრძალეს დავით სარაჯიშვილის ქუჩის მიმდებარე სასაფლაოზე.' },
  ],
  guestbook: [
    { author_name: 'ვახტანგ ლომიძე', relation: 'მეზობელი', message: 'გიორგი ნამდვილი ოსტატი და კარგი კაცი იყო — ვისაც სჭირდებოდა დახმარება, არასდროს არ ამბობდა უარს. სულა ასვენოს.' },
    { author_name: 'ნანა ჩხაიძე', relation: 'ახლო მეგობრის ცოლი', message: 'იმდენი წელი ვიცნობდით ერთმანეთს — მშვიდი, სანდო, ღირსეული ადამიანი იყო. ძალიან მოგვენატრება.' },
    { author_name: 'დავით მაისურაძე', relation: 'ნათესავი', message: 'ბიძია გიორგი ყოველთვის სიბრძნეს გვასწავლიდა ცოტა სიტყვით. მისი მოგონება სამარადისოდ ჩვენს გულებში იცოცხლებს.' },
  ],
}

async function main() {
  console.log(`Photos directory: ${PHOTOS_DIR}`)
  console.log(`\n=== ${profile.vault.display_name} ===`)
  const vaultId = randomUUID()

  const coverPath = path.join(PHOTOS_DIR, profile.coverFile)
  if (!fs.existsSync(coverPath)) {
    console.error(`  ✗ Missing cover photo: ${profile.coverFile} — aborting`)
    return
  }

  // Upload cover photo
  const { url: coverUrl } = await uploadToR2(coverPath, vaultId, 'assets')
  console.log(`  ✓ Cover uploaded`)

  // Insert vault record
  const { error: vaultErr } = await supabase.from('vaults').insert({
    id: vaultId,
    ...profile.vault,
    cover_photo_url: coverUrl,
    owner_id: ADMIN_ID,
    verified_by: ADMIN_ID,
  })
  if (vaultErr) {
    console.error(`  ✗ Vault insert failed:`, vaultErr.message)
    return
  }
  console.log(`  ✓ Vault created: ${vaultId}`)

  // Upload gallery photos + insert media records
  for (let i = 0; i < profile.gallery.length; i++) {
    const { file, caption } = profile.gallery[i]
    const filePath = path.join(PHOTOS_DIR, file)
    if (!fs.existsSync(filePath)) {
      console.error(`  ✗ Missing gallery: ${file}`)
      continue
    }
    const { url, key } = await uploadToR2(filePath, vaultId, 'gallery')
    const { error: mediaErr } = await supabase.from('media').insert({
      vault_id: vaultId,
      uploader_id: ADMIN_ID,
      original_url: url,
      r2_file_key: key,
      media_type: 'image',
      caption,
      is_public: true,
      sort_order: i + 1,
      status: 'ready',
      source_type: 'upload',
      storage_bucket: 'tem-public-media',
      storage_path: key,
    })
    if (mediaErr) console.error(`  ✗ Media insert error (${file}):`, mediaErr.message)
    else console.log(`  ✓ Gallery ${i + 1}/${profile.gallery.length}: ${file}`)
  }

  // Insert memories (genel anılar)
  for (let i = 0; i < profile.memories.length; i++) {
    const { error: memErr } = await supabase.from('vault_memories').insert({
      vault_id: vaultId,
      ...profile.memories[i],
      is_secret: false,
      sort_order: i + 1,
      section: 'memory',
    })
    if (memErr) console.error(`  ✗ Memory ${i + 1} error:`, memErr.message)
  }
  console.log(`  ✓ ${profile.memories.length} memories inserted`)

  // Insert kronoloji (timeline) entries
  for (let i = 0; i < profile.kronoloji.length; i++) {
    const { error: krErr } = await supabase.from('vault_memories').insert({
      vault_id: vaultId,
      ...profile.kronoloji[i],
      is_secret: false,
      sort_order: i + 1,
      section: 'kronoloji',
    })
    if (krErr) console.error(`  ✗ Kronoloji ${i + 1} error:`, krErr.message)
  }
  console.log(`  ✓ ${profile.kronoloji.length} kronoloji entries inserted`)

  // Insert guestbook entries
  for (const g of profile.guestbook) {
    const { error: gbErr } = await supabase.from('guestbook_entries').insert({
      vault_id: vaultId,
      author_name: g.author_name,
      relation: g.relation,
      message: g.message,
      status: 'approved',
      author_email: null,
      ip_address: '127.0.0.1',
      react_heart: Math.floor(Math.random() * 6) + 1,
      react_pray: Math.floor(Math.random() * 4),
      react_smile: 0,
      react_cry: Math.floor(Math.random() * 3),
      react_dove: Math.floor(Math.random() * 2),
    })
    if (gbErr) console.error(`  ✗ Guestbook error:`, gbErr.message)
  }
  console.log(`  ✓ ${profile.guestbook.length} guestbook entries inserted`)
  console.log(`  → https://themaradi.com/memorial/${profile.vault.slug}`)
  console.log('\n=== Profile created! ===')
}

main().catch(console.error)
