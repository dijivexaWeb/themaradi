import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PHOTOS_DIR = path.join(__dirname, 'demo-photos')

const R2_ENDPOINT = 'https://d193c5c0be7d8a63c6e703d51d1929be.r2.cloudflarestorage.com'
const R2_ACCESS_KEY = 'd8f19660f3852b0394ceba52d6cc4d54'
const R2_SECRET_KEY = '8f5a7ca14b537d11caa2adbfe8482e6c09509edd12acb767fec7d9e50375c27d'
const R2_BUCKET = 'tem-public-media'
const R2_PUBLIC_URL = 'https://pub-4e99edb14c604383a844cb7f05d69b9b.r2.dev'
const SUPABASE_URL = 'https://qcxsqirqlepjebkezgud.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjeHNxaXJxbGVwamVia2V6Z3VkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc2MDA1NCwiZXhwIjoyMDk2MzM2MDU0fQ.JnemTLKrD7AjhHsBXwjSmKTfA-6n2dhRmKmWLDaKYes'
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
    ContentType: 'image/jpeg',
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

const profiles = [
  {
    coverFile: 'nino-cover.jpg',
    vault: {
      slug: 'nino-kvaratskhelia',
      display_name: 'ნინო ქვარაცხელია',
      birth_date: '1947-04-12',
      death_date: '2022-11-03',
      birth_place: 'თბილისი',
      death_place: 'თბილისი',
      profession: 'მუსიკის მასწავლებელი',
      hobbies: 'მუსიკა, ხელსაქმე, ბაღი',
      nationality: 'Georgian',
      tagline: 'ოჯახის სიხარული, შვილიშვილების სიამაყე — ნინო ქვარაცხელია სამარადისოდ ჩვენს გულებში დარჩება.',
      biography: 'ნინო ქვარაცხელია 1947 წელს თბილისში, ვერის უბანში დაიბადა. ბავშვობიდანვე მუსიკით გატაცებული, მან თბილისის სახელმწიფო უნივერსიტეტი დაამთავრა და 35 წელი მუსიკის მასწავლებლად გაატარა. ათასობით ბავშვს ასწავლა ნოტები, გრძნობა და სიყვარული ხელოვნებისადმი.\n\nსამი შვილი და ექვსი შვილიშვილი გაზარდა. მისი სახლი ყოველთვის ღია იყო სტუმრებისთვის — სუფრა სავსე, გული კიდევ უფრო სავსე. ყოველ კვირა ოჯახი ერთად იკრიბებოდა.\n\n2022 წელს, 75 წლის ასაკში, მან სამყარო დატოვა. მისი სიყვარული, სითბო და ღიმილი სამარადისოდ ჩვენს გულებში დარჩება.',
      last_message: 'ყველა ჩემი სიყვარული, ყველა ჩემი ლოცვა თქვენთვისაა. ოჯახი ყველაზე ძვირფასი სიმდიდრეა. გიყვარდეთ ერთმანეთი, ზრუნავდეთ ერთმანეთზე.',
      cemetery_name: 'თბილისის ვაკე სასაფლაო',
      cemetery_address: 'ვაკე, თბილისი',
      cemetery_lat: 41.6938,
      cemetery_lng: 44.7809,
      cemetery_hours: 'ყოველ დღე 09:00 – 18:00',
      status: 'public_memorial',
      product_type: 'memorial_profile',
      vault_origin: 'family',
      theme: 'warm_sunset',
      pub_settings: PUB_SETTINGS,
      view_count: 124,
      hero_left_react_heart: 7,
      hero_left_react_pray: 4,
      hero_right_react_heart: 3,
      hero_right_react_pray: 2,
      qr_code: 'TM-DEMO001',
      payment_verified_at: '2023-01-10T10:00:00Z',
      published_at: '2023-01-12T12:00:00Z',
      is_notable: false,
      hide_objection: false,
    },
    gallery: [
      { file: 'scene-tea-hands.jpg', caption: 'ჩაი და სიყვარული ერთ ჭიქაში' },
      { file: 'scene-framed-portrait.jpg', caption: 'ოჯახური ფოტო — ნინოს მშობლები ახალგაზრდობაში' },
      { file: 'scene-woman-window.jpg', caption: 'სახლი, სადაც ყოველთვის სითბო იყო' },
    ],
    memories: [
      {
        title: 'დიდი დედის ჩაი',
        content: 'ყოველ დილას, სანამ სკოლაში წავიდოდი, დიდი დედა ჩაის ამზადებდა. ზამთრის ცივ დილებში ის ჩაის ჭიქა ჩემი ხელებით თბებოდა. ახლა, როდესაც ჩაის ვსვამ, ყოველთვის მის სითბოს ვგრძნობ. ეს მომენტები სამარადისოდ ჩემ გულში დარჩება.',
        memory_date: '2010-03-15',
      },
      {
        title: 'მუსიკის პირველი გაკვეთილი',
        content: 'ნინო ჩემი პირველი მუსიკის მასწავლებელი იყო. ის ასე ასწავლიდა, რომ ჩვენ ვაჟობდით ყოველ ნოტს. 30 წლის შემდეგ, ახლა ვდგავარ ფორტეპიანოს წინ და მისი ხმა ვისმენ ჩემს თავში.',
        memory_date: '1985-09-01',
      },
    ],
    guestbook: [
      { author_name: 'მაია გოგიაშვილი', relation: 'მეზობელი', message: 'ნინო, შენი სიყვარული და სიტკბო ჩვენ ყოველთვის გვახსოვს. მშვიდობა გქონდეს.' },
      { author_name: 'გიორგი თევზაძე', relation: 'ახლო ნაცნობი', message: 'ბევრი წელი ვიცოდი ნინო. ოჯახის ნამდვილი სვეტი იყო. ღმერთმა შეარსოს სული.' },
      { author_name: 'თამარ ბერიძე', relation: 'ყოფილი მოსწავლის დედა', message: 'ჩემი შვილი შენ გაზარდე, ამ სიყვარულს ვერ დავივიწყებ. დიდი მადლობა.' },
    ],
  },
  {
    coverFile: 'giorgi-cover.jpg',
    vault: {
      slug: 'giorgi-beridze-imereti',
      display_name: 'გიორგი ბერიძე',
      birth_date: '1940-06-15',
      death_date: '2021-09-08',
      birth_place: 'ქუთაისი',
      death_place: 'ქუთაისი',
      profession: 'მევენახე',
      hobbies: 'ვენახი, ღვინო, ბაღი',
      nationality: 'Georgian',
      tagline: 'მიწის კაცი, ოჯახის სვეტი — გიორგი ბერიძე ვენახის სუნსა და ღვინის სითბოში ჩვენ გვახსოვს.',
      biography: 'გიორგი ბერიძე 1940 წელს ქუთაისის მახლობლად, იმერეთის მწვანე ველებში დაიბადა. ადრეიდანვე მიწის სამუშაო შეიყვარა — ჯერ მამის გვერდით, შემდეგ კი თავისი ოჯახისთვის. მთელი სიცოცხლე ვენახს და ხილის ბაღს მიუძღვნა.\n\nმისი ღვინო სოფელში ყველა ამბობდა, რომ ქუთაისის ბაზარზე საუკეთესო იყო. სამი ვაჟი გაზარდა, ყველა ახლა ქუთაისში ცხოვრობს. ბებო-ბაბუა ბოლომდე ერთად იყვნენ — 52 წლის ქორწინება.\n\n2021 წელს, 81 წლის ასაკში, გარდაიცვალა. გარდაიცვალა ისე, როგორც ცხოვრობდა — მიწის სუნით, ვენახის გვერდით.',
      last_message: 'მიწა, ოჯახი, ღვინო — ეს სამი სიტყვა ჩემი ცხოვრება იყო. ბავშვებო, ნუ დაავიწყდება თქვენი ფესვები. იმერეთი ჩვენი სახლია, ვენახი ჩვენი სიამაყე. გამარჯვება!',
      cemetery_name: 'ქუთაისის მთავარი სასაფლაო',
      cemetery_address: 'ქუთაისი, იმერეთი',
      cemetery_lat: 42.2679,
      cemetery_lng: 42.7069,
      cemetery_hours: 'ყოველ დღე 09:00 – 18:00',
      status: 'public_memorial',
      product_type: 'memorial_profile',
      vault_origin: 'family',
      theme: 'warm_sunset',
      pub_settings: PUB_SETTINGS,
      view_count: 87,
      hero_left_react_heart: 5,
      hero_left_react_pray: 3,
      hero_right_react_heart: 2,
      hero_right_react_pray: 1,
      qr_code: 'TM-DEMO002',
      payment_verified_at: '2021-10-05T10:00:00Z',
      published_at: '2021-10-08T12:00:00Z',
      is_notable: false,
      hide_objection: false,
    },
    gallery: [
      { file: 'scene-man-volga.jpg', caption: 'ბაბუა და მისი ავტომობილი, 1998 წელი' },
      { file: 'scene-garden.jpg', caption: 'ბაბუას ვენახი ივლისში' },
      { file: 'scene-picnic-river.jpg', caption: 'ოჯახური პიკნიკი მდინარეზე, 2002' },
    ],
    memories: [
      {
        title: 'ბაბუას ღვინო',
        content: 'ყოველ შემოდგომას ბაბუასთან ვდიოდი ყურძნის კრეფაზე. მისი ხელებით გაჭყლეტილი ყურძნის ღვინო ყველაზე გემრიელი იყო მსოფლიოში. ეს სუნი ახლაც ვგრძნობ.',
        memory_date: '2005-10-01',
      },
      {
        title: 'ბოლო ზაფხული',
        content: 'ბოლო ზაფხულს ბაბუა ვენახში მაინც ჩადიოდა ყოველ დილა-საღამოს. ეუბნებოდა, სანამ ხელები ძლიერია, ვენახს ვუვლი. ეს სიტყვები ჩვენ ყველას გვახსოვს.',
        memory_date: '2021-07-20',
      },
    ],
    guestbook: [
      { author_name: 'ვახო კვარაცხელია', relation: 'სოფლელი', message: 'გიორგი, კარგი კაცი იყავი. სოფელში ყველა გიცნობდა და გიყვარდა. ღვთისა ხარ.' },
      { author_name: 'მანანა კორიძე', relation: 'მეგობრის ცოლი', message: '52 წელი ერთად — ეს მსოფლიო რამდენი ხედავს? ნეტა ისე ვიყოთ.' },
      { author_name: 'ზურაბ ბერიძე', relation: 'ნათესავი', message: 'ბევრი სვე გიორგიმ. ახლა ზეციდან უყურებს ვენახს.' },
    ],
  },
  {
    coverFile: 'tamar-cover.jpg',
    vault: {
      slug: 'tamar-chikvanaia',
      display_name: 'თამარ ჩიქვანაია',
      birth_date: '1955-03-20',
      death_date: '2023-07-14',
      birth_place: 'ბათუმი',
      death_place: 'ბათუმი',
      profession: 'მედდა',
      hobbies: 'ბაღი, სამზარეულო, ნაქარგობა',
      nationality: 'Georgian',
      tagline: 'ბათუმის ზღვის გულში, ათასი ადამიანის გულში — თამარ ჩიქვანაია სამყაროს სიყვარული დატოვა.',
      biography: 'თამარ ჩიქვანაია 1955 წელს ბათუმში დაიბადა. ბავშვობა ზღვის პირას გაატარა, მწვანე ქალაქში, ყვავილებით სავსე ქუჩებზე. სამედიცინო სკოლის დამთავრების შემდეგ, 30 წელი გაატარა ბათუმის საქალაქო საავადმყოფოში.\n\nათასობით პაციენტი გაიარა მის ხელებში. ყველა ამბობდა, რომ მისი მოვლა და ყურადღება სამკურნალო იყო. ერთი ქალიშვილი და ორი შვილიშვილი ჰყავდა.\n\n2023 წელს, 68 წლის ასაკში, გარდაიცვალა. ბათუმის ზღვა მის ხსოვნას ინახავს.',
      last_message: 'ჩემო ქალიშვილო, ჩემო შვილიშვილებო — ყოველთვის ადამიანს ეხმარეთ, ყოველთვის გული ღია გქონდეთ. ბათუმი ჩვენი სახლია.',
      cemetery_name: 'ბათუმის საქალაქო სასაფლაო',
      cemetery_address: 'ბათუმი, აჭარა',
      cemetery_lat: 41.6168,
      cemetery_lng: 41.6367,
      cemetery_hours: 'ყოველ დღე 09:00 – 18:00',
      status: 'public_memorial',
      product_type: 'memorial_profile',
      vault_origin: 'family',
      theme: 'warm_sunset',
      pub_settings: PUB_SETTINGS,
      view_count: 156,
      hero_left_react_heart: 9,
      hero_left_react_pray: 5,
      hero_right_react_heart: 4,
      hero_right_react_pray: 3,
      qr_code: 'TM-DEMO003',
      payment_verified_at: '2023-08-02T10:00:00Z',
      published_at: '2023-08-05T12:00:00Z',
      is_notable: false,
      hide_objection: false,
    },
    gallery: [
      { file: 'scene-kitchen-bright.jpg', caption: 'დედა სამზარეულოში — ყოველ დილის სურათი' },
      { file: 'scene-family-dinner4.jpg', caption: 'ოჯახური სადილი, ახალი წელი 1998' },
      { file: 'scene-portrait-yellow.jpg', caption: 'დედის მშობლების ძველი ფოტო, ოჯახური სიამაყე' },
    ],
    memories: [
      {
        title: 'დედის სუფრა',
        content: 'ჩვენ სახლში ყოველ შაბათს სუფრა იყო. დედა მთელ კვირა ამზადებდა — ხაჭაპური, ჩაქაფური, ლობიანი. ყველა ყნოსავდა სახლში და ვახშმის ლოდინი ტკბილი წამება იყო.',
        memory_date: '2000-12-30',
      },
      {
        title: 'საავადმყოფოში',
        content: 'ბავშვობიდან ვხვდებოდი, რომ დედა სახლში ექიმი იყო. ოჯახიდან ვინც ცუდად გახდებოდა, ყველა ჯერ დედას ეკითხებოდა. ის ასე ბუნებრივად ეხმარებოდა, თითქოს სხვაგვარად ვერ შეეძლო.',
        memory_date: '1990-05-10',
      },
    ],
    guestbook: [
      { author_name: 'ნინო აბუაშვილი', relation: 'მეზობელი', message: 'თამარ, შენი სიკეთე და სიყვარული ბევრი ადამიანის ცხოვრება შეცვალა. ბათუმი შენ გვაჩუქა.' },
      { author_name: 'დოქტ. ირაკლი ჯიშქარიანი', relation: 'კოლეგა', message: '20 წელი ერთ სამსახურში ვიყავით. ასეთი მედდა არარსებობს მეტი — გულისმიერი, ზრუნვით სავსე.' },
      { author_name: 'ხათია ლომთაძე', relation: 'პაციენტის ოჯახი', message: 'ჩვენი ოჯახი ბევრ ჯერ შენ დაგჭირდა, ყოველ ჯერ მოვედი. ღმერთმა შეარსოს სული.' },
    ],
  },
  {
    coverFile: 'huseyin-cover.jpg',
    vault: {
      slug: 'huseyin-kara-tbilisi',
      display_name: 'Hüseyin Kara',
      birth_date: '1945-08-10',
      death_date: '2024-02-18',
      birth_place: 'Trabzon, Türkiye',
      death_place: 'Tiflis, Gürcistan',
      profession: 'Esnaf',
      hobbies: 'Çay keyfi, bahçe, tavla',
      nationality: 'Turkish',
      tagline: 'Trabzon\'dan Tiflis\'e uzanan bir ömür — Hüseyin Kara iki kültürün köprüsü, ailesinin güçlü direğiydi.',
      biography: 'Hüseyin Kara 1945 yılında Trabzon\'da, Karadeniz\'in serin sularının kıyısında dünyaya geldi. Genç yaşlarda Gürcistan\'a geçen Hüseyin, önce Batum\'a, sonra Tiflis\'e yerleşti. Burada küçük bir ticaret dükkanı kurdu ve yıllar içinde güvenilir bir esnaf olarak tanındı.\n\nGürcü komşularıyla, Türk göçmen topluluğuyla ve Tiflis\'in kozmopolit havasıyla bütünleşti. İki dili de mükemmel konuşur, iki kültürün de en güzel taraflarını yaşardı. İki oğlu ve dört torunu var.\n\n2024 yılında, 78 yaşında hayata gözlerini yumdu. Tiflis sokakları onu tanıyor, çarşıdaki esnaf onu biliyor.',
      last_message: 'Oğullarım, torunlarım — ne Türklüğünüzü ne Gürcistan\'ı unutun. İki kültür sizin zenginliğiniz. Dürüstlükle çalışın, komşuya iyi davranın, aile her şeyin üstündedir.',
      cemetery_name: 'Tiflis Türk Mezarlığı',
      cemetery_address: 'Tbilisi, Gürcistan',
      cemetery_lat: 41.6924,
      cemetery_lng: 44.8015,
      cemetery_hours: 'Her gün 09:00 – 18:00',
      status: 'public_memorial',
      product_type: 'memorial_profile',
      vault_origin: 'family',
      theme: 'warm_sunset',
      pub_settings: PUB_SETTINGS,
      view_count: 73,
      hero_left_react_heart: 4,
      hero_left_react_pray: 3,
      hero_right_react_heart: 2,
      hero_right_react_pray: 1,
      qr_code: 'TM-DEMO004',
      payment_verified_at: '2024-03-01T10:00:00Z',
      published_at: '2024-03-04T12:00:00Z',
      is_notable: false,
      hide_objection: false,
    },
    gallery: [
      { file: 'scene-family-dinner.jpg', caption: 'Aile yemeği, 1995 Yeni Yıl' },
      { file: 'scene-kids-football.jpg', caption: 'Mahallede çocukluk yıllarından bir an' },
    ],
    memories: [
      {
        title: 'Babamın çay keyfi',
        content: 'Babam her öğleden sonra mutfak masasında otururdu, çayını yudumlardı ve pencereden dışarı bakardı. "Hem Trabzon çayı hem Gürcü çayı aynı lezzet" derdi gülerek. O masada çok hikaye dinledik.',
        memory_date: '2005-08-10',
      },
      {
        title: 'İki dilli büyükbaba',
        content: 'Babam torunlarımıza hem Türkçe hem Gürcüce öğretirdi. Gürcü komşuların çocukları da ondan bir şeyler öğrendi. O bir köprüydü — iki kültür arasında.',
        memory_date: '2015-06-01',
      },
    ],
    guestbook: [
      { author_name: 'Süleyman Kaya', relation: 'Hemşehri', message: 'Hüseyin ağbi, mahallenin en güzel insanı. Her zaman kapın açıktı, her zaman çayın hazırdı. Allah rahmet eylesin.' },
      { author_name: 'Giorgi Mchedlishvili', relation: 'Komşu', message: 'Tiflis\'te böyle bir esnaf kalmadı artık. Dürüstlüğü, samimiyeti unutulmaz.' },
      { author_name: 'Nino Varsimashvili', relation: '30 yıllık komşu', message: '30 yıl komşuyduk. O her zaman iyiydi — kimseyle kavga etmedi, herkese yardım etti.' },
    ],
  },
  {
    coverFile: 'marina-cover.jpg',
    vault: {
      slug: 'marina-lomidze-tbilisi',
      display_name: 'მარინა ლომიძე',
      birth_date: '1958-11-25',
      death_date: '2022-04-02',
      birth_place: 'თბილისი',
      death_place: 'თბილისი',
      profession: 'კულტურის სახლის გამგე',
      hobbies: 'წიგნები, ლიტერატურა, მუსიკა',
      nationality: 'Georgian',
      tagline: 'წიგნებს შორის, კულტურის სიყვარულში — მარინა ლომიძე თბილისის სულია.',
      biography: 'მარინა ლომიძე 1958 წელს თბილისში, ძველ ქალაქში დაიბადა. ლიტერატურა და ისტორია ბავშვობიდანვე მისი სამყარო იყო. თბილისის სახელმწიფო უნივერსიტეტის დამთავრების შემდეგ, კულტურის სახლში დაიწყო მუშაობა და 28 წელი ლიტერატურული წრეების, გამოფენებისა და კულტურული ღონისძიებების ორგანიზება.\n\nმამა რუსი იყო, დედა ქართველი — ეს ორი კულტურა მასში ერწყმოდა და მდიდრობდა. სახლში ყოველთვის წიგნები, მუსიკა და საუბარი იყო.\n\n2022 წელს, 63 წლის ასაკში, გარდაიცვალა. მისი კულტურული მემკვიდრეობა თბილისის გულებში ცოცხლობს.',
      last_message: 'წიგნი კაცის ყველაზე კარგი მეგობარია. კითხვა, ფიქრი, სიყვარული — ეს სამი სიტყვა ჩემი ცხოვრება იყო. ბავშვებო, ნუ გადაივიწყებთ წიგნებს.',
      cemetery_name: 'თბილისის ვაკე სასაფლაო',
      cemetery_address: 'ვაკე, თბილისი',
      cemetery_lat: 41.6938,
      cemetery_lng: 44.7809,
      cemetery_hours: 'ყოველ დღე 09:00 – 18:00',
      status: 'public_memorial',
      product_type: 'memorial_profile',
      vault_origin: 'family',
      theme: 'warm_sunset',
      pub_settings: PUB_SETTINGS,
      view_count: 98,
      hero_left_react_heart: 5,
      hero_left_react_pray: 3,
      hero_right_react_heart: 2,
      hero_right_react_pray: 2,
      qr_code: 'TM-DEMO005',
      payment_verified_at: '2022-05-10T10:00:00Z',
      published_at: '2022-05-14T12:00:00Z',
      is_notable: false,
      hide_objection: false,
    },
    gallery: [
      { file: 'scene-kitchen.jpg', caption: 'დედა სამზარეულოში, 1990-იანი წლები' },
      { file: 'scene-couple-bench.jpg', caption: 'ბებო-ბაბუა ეზოში, 1992 წელი' },
      { file: 'scene-garden-vine.jpg', caption: 'სახლის ეზო — ყოველ ზაფხულს აქ ვიყავით' },
    ],
    memories: [
      {
        title: 'დედის ბიბლიოთეკა',
        content: 'სახლი ბიბლიოთეკა იყო. კედლები წიგნებით. ყოველ ოთახში — ვოლტერი, პუშკინი, გამსახურდია. მე 6 წლისა ვიყავი, სანამ ვკითხულობდი — უბრალოდ წიგნებს ვემხრობოდი.',
        memory_date: '1968-01-01',
      },
      {
        title: 'ქართულ-რუსული სახლი',
        content: 'დედა ქართულ-რუსულ ოჯახში გაიზარდა. ეს ორი სამყარო მასში ერთ ჰარმონიად ჩამოყალიბდა. ბებოს ქართული ლექსები და ბაბუას პუშკინი — ორივე ერთ სახლში.',
        memory_date: '1975-11-25',
      },
    ],
    guestbook: [
      { author_name: 'ნინო გაბრიაძე', relation: 'კოლეგა', message: 'მარინა, შენ ჩვენი კულტურული ცხოვრების სული იყავი. ბევრი ღონისძიება შენი ხელებით გაიხსნა. მადლობა.' },
      { author_name: 'პროფ. ლევან ბერძენიშვილი', relation: 'ახლო მეგობარი', message: '30 წელი ვიცოდი მარინა. ისეთი ინტელიგენტი, ისეთი კარგი ადამიანი — ასეთები ცოტაა.' },
      { author_name: 'Ирина Волкова', relation: 'Подруга', message: 'Марина была настоящим мостом между культурами. Её помнят все, кто знал.' },
    ],
  },
]

async function main() {
  console.log(`Photos directory: ${PHOTOS_DIR}`)
  console.log(`Processing ${profiles.length} profiles...\n`)

  for (const profile of profiles) {
    console.log(`\n=== ${profile.vault.display_name} ===`)
    const vaultId = randomUUID()

    const coverPath = path.join(PHOTOS_DIR, profile.coverFile)
    if (!fs.existsSync(coverPath)) {
      console.error(`  ✗ Missing cover photo: ${profile.coverFile} — skipping profile`)
      continue
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
      continue
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

    // Insert memories
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
  }

  console.log('\n=== All profiles created! ===')
}

main().catch(console.error)
