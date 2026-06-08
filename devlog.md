# themaradi — Geliştirme Günlüğü (DevLog)

> Her oturum sonunda Claude bu dosyayı günceller.
> Format: tarih → ne yapıldı → nerede kalındı → sıradaki adım.

---

## 2026-06-08 — Oturum 25: gstack Kurulumu

### Yapılanlar
- **gstack** skill paketi kuruldu (`~/.claude/skills/gstack`)
  - `bun` kuruldu (`~/.bun/bin/bun v1.3.14`)
  - `git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack`
  - `./setup` çalıştırıldı — Chrome indirme ağ hatası aldı (ECONNRESET), `/browse` binary eksik kaldı
  - 53 skill dizini manuel olarak `~/.claude/skills/` altına kopyalandı
- **`CLAUDE.md`** — gstack bölümü eklendi: `/browse` zorunlu, `mcp__claude-in-chrome__*` yasaklı, 35 skill listelendi

### Proje Durumu
- [x] gstack global kurulum (`~/.claude/skills/`)
- [ ] `/browse` binary — Playwright Chromium indirilemedi (ağ hatası), tarayıcı tabanlı skill'ler çalışmayabilir
- [ ] payments RLS hatası fix
- [ ] Login "Kaydınız yoksa" → /satin-al yönlendirmesi

### Kritik Kararlar / Notlar
- Windows'ta `./setup` symlink yerine `cp -R` kullanıyor; Chrome binary indirmesi ECONNRESET ile kesildi
- Skill doc'lar üretildi, 53 skill dizini `~/.claude/skills/` altına kopyalandı
- Claude Code yeniden başlatılması gerekiyor (skill'ler startup'ta yükleniyor)

### Nerede Kaldık
gstack kuruldu, skill'ler kopyalandı. Claude Code yeniden açıldığında `/browse`, `/qa`, `/review` vb. çalışacak. `/browse` binary'sinin çalışıp çalışmadığı henüz test edilmedi.

### Sıradaki Adım
1. Claude Code yeniden açılıp `/browse http://localhost:3010` ile test et
2. Animasyonlu aile ağacını önizleme sayfasında test et
3. payments RLS hatasını araştır

---

## 2026-06-08 — Oturum 24: Animasyonlu Aile Ağacı (FamilyTreeCanvas)

### Yapılanlar
- **`src/components/FamilyTreeCanvas.tsx`** — Yeni client component (sıfırdan yazıldı)
  - Büyükanne/Büyükbaba → Anne/Baba → Kişi + Eş → Çocuklar → Torunlar hiyerarşisi
  - `parent_member_id` ile torunlar kendi ebeveyninin altına konumlanır
  - Animasyonlu SVG dallar: `stroke-dashoffset` animation (bezier eğri)
  - Merkezi gövde (trunk), couple connector (kalp nokta), anchor dot'lar
  - `IntersectionObserver` ile scroll'da tetiklenen giriş animasyonu
  - Fixed 1000px canvas, küçük ekranda `overflow-x-auto`
  - Vault kişisi featured card (gold border + ring), diğerleri standart dark card
- **`src/lib/actions/family.ts`** — `parent_member_id` desteği eklendi
  - `addFamilyMemberAction`: `parent_member_id` formdan okunuyor, sadece `grandchild` için kaydediliyor
  - `updateFamilyMemberAction`: aynı şekilde update edildi
- **`src/app/memorial/[slug]/RealMemorialPage.tsx`** — Aile bağları bölümü `FamilyTreeCanvas` ile değiştirildi
  - Eski manuel grid/absolute layout kaldırıldı
  - `FamilyTreeCanvas` component import edildi
- **`src/app/dashboard/vault/[id]/aile/page.tsx`** — `FamilyTreeCanvas` entegrasyonu
  - Eski tree layout kaldırıldı, yerine `FamilyTreeCanvas` kullanılıyor
  - Torun eklerken ebeveyn seçim dropdow'u (mevcut oğul/kızlar listeleniyor)
  - Ağaç altına "Üye Yönetimi" list paneli eklendi (düzenle/kaldır butonları)
- **DB Migration** (önceki oturumda): `vault_family_members.parent_member_id UUID FK`

### Proje Durumu
- [x] Auth sistemi
- [x] Dashboard ana sayfa
- [x] Sol sidebar
- [x] Vasiyetname, Anılar, Gizli Kasa, Belgeler
- [x] Aile bağları — düzenleme + silme + animasyonlu ağaç
- [x] Preview sayfası (`/preview/[id]`) — demo ile birebir aynı görünüm
- [x] Animasyonlu `FamilyTreeCanvas` component
- [ ] payments RLS hatası fix
- [ ] Login "Kaydınız yoksa" → /satin-al yönlendirmesi
- [ ] Rehber/kılavuz sayfası
- [ ] Vefat bildirimi alanı

### Kritik Kararlar / Notlar
- `FamilyTreeCanvas` pure display component — edit/delete props taşımıyor
- `aile/page.tsx`'te yönetim "Üye Yönetimi" listesi olarak ayrıldı (tree altında)
- Torun konumlaması: `parent_member_id` ile hangi çocuğun altına geleceği belirleniyor
- Build: `npx next build` → hatasız, TypeScript clean

### Nerede Kaldık
`FamilyTreeCanvas.tsx` yazıldı, `RealMemorialPage.tsx` ve `aile/page.tsx` güncellendi, `family.ts` `parent_member_id` aldı. Build temiz.

### Sıradaki Adım
1. Önizleme (`/preview/[id]`) açılarak animasyonlu ağacın doğru çalıştığını test etmek
2. Torun ekleme → doğru ebeveyn altına yerleştirilmesini doğrulamak
3. payments RLS hatası araştırılması
4. Login sayfasında "Kaydınız yoksa" → `/satin-al` yönlendirmesi

---

## 2026-06-07 — Oturum 23: Aile Sayfası — Demo ile Tam Eşleştirme

### Yapılanlar
- `aile/page.tsx` — Tüm sayfa demo memorial sayfasının aile bölümüyle birebir eşleşecek şekilde yeniden yazıldı
  - Tüm sayfa koyu tema: `bg-[#091712]`, `bg-[#0d1412]`, `bg-[#121b17]`
  - Başlık: "Köklerden / yeni nesillere." — demo ile aynı
  - FamilyCard: `h-16 w-16` yuvarlak fotoğraf, featured=gold border+ring, serif isim, gold yakınlık, muted yıllar
  - Desktop: absolute konumlandırılmış aile ağacı; gold connector çizgiler (7 adet)
  - Mobile: nesile göre 2 sütun grid düzeni
  - Add/Edit formu koyu tema içine entegre (collapsible, `?add=1` / `?edit=<id>`)
  - Footer: "{N} kuşak / Bu aile bağı The Maradi ile korunur."
  - TypeScript temiz (npx tsc --noEmit → hata yok)

### Proje Durumu
- [x] Auth sistemi
- [x] Dashboard ana sayfa
- [x] Sol sidebar
- [x] Tüm alt sayfa layout overhaul
- [x] Vasiyetname sayfası
- [x] Anılar — edit + sil
- [x] Gizli kasa — edit + sil
- [x] Aile bağları — edit + sil + fotoğraf + demo ile eşleşen görünüm
- [x] Belgeler kasası — sil
- [x] Varis bilgileri — kaldır
- [ ] payments RLS hatası
- [ ] Login "Kaydınız yoksa" → /satin-al yönlendirmesi
- [ ] Rehber/kılavuz sayfası
- [ ] Vefat bildirimi alanı

### Kritik Kararlar / Notlar
- Kullanıcı talebi: dashboard'daki aile sayfası ile public memorial sayfası tamamen aynı görünecek
- Demo sayfası (`/memorial/demo`) değiştirilmedi — sadece dashboard sayfası güncellendi
- Form (ekle/düzenle) koyu tema içine entegre edildi, ayrı light-theme bölümü kaldırıldı

### Nerede Kaldık
`aile/page.tsx` rewrite tamamlandı, TypeScript temiz.

### Sıradaki Adım
1. payments RLS hatası düzeltmesi
2. Login "Kaydınız yoksa" → /satin-al yönlendirmesi
3. Rehber/kılavuz sayfası
4. Vefat bildirimi alanı

---

## 2026-06-07 — Oturum 22: Inline Edit + Aile Fotoğraf Yükleme

### Yapılanlar
- `anilar/page.tsx` — `searchParams` prop eklendi; hover'da `Düzenle · Sil` butonları çıkıyor; `?edit=<id>` ile inline edit form açılıyor
- `gizli-kasa/page.tsx` — aynı edit pattern eklendi
- `vasiyet/page.tsx` — yazılı vasiyetler için aynı edit pattern eklendi
- `aile/page.tsx` — edit pattern eklendi; kart görünümü avatar+satır düzenine çevrildi; `photo_file` dosya yükleme eklendi (URL yanında)
- `memories.ts` — `updateMemoryAction` imzası değişti: `redirectTo: string` parametresi eklendi, action sonunda `redirect()` çağrısı yapılıyor
- `family.ts` — `uploadFamilyPhoto()` yardımcı fonksiyonu eklendi (vault-media/family/ bucket); `addFamilyMemberAction` ve `updateFamilyMemberAction` fotoğraf yüklemeyi destekliyor; `updateFamilyMemberAction` redirect ekli; `revalidatePath` vault ana sayfasına da eklendi
- Commit: `482ed69`

### Proje Durumu
- [x] Auth sistemi
- [x] Dashboard ana sayfa — 6 görsel blok (sayfa inşa et konsepti)
- [x] Sol sidebar — Ana nav + Özel Alan grubu
- [x] Tüm alt sayfa layout overhaul (PersonHeader)
- [x] Vasiyetname sayfası (metin + belge)
- [x] Anılar — edit + sil
- [x] Gizli kasa — edit + sil
- [x] Aile bağları — edit + sil + fotoğraf yükleme
- [x] Belgeler kasası — sil (belgeler için edit gerekmez, silip tekrar yükle)
- [x] Varis bilgileri — kaldır (edit gerekmez)
- [ ] payments RLS hatası
- [ ] Login "Kaydınız yoksa" → /satin-al yönlendirmesi
- [ ] Rehber/kılavuz sayfası
- [ ] Vefat bildirimi alanı

### Kritik Kararlar / Notlar
- Edit pattern: `?edit=<id>` URL param → server component searchParams → inline form; submit → redirect temiz URL'ye
- `updateMemoryAction` artık `redirectTo` 3. parametre olarak alıyor — bind: `.bind(null, memoryId, vaultId, pageUrl)`
- Aile fotoğrafı: `photo_file` (File) varsa storage'a yükle, yoksa `photo_url` (text) kullan; boş bırakılırsa mevcut URL korunur
- Formlar `encType="multipart/form-data"` gerektiriyor (dosya yükleme olan tüm formlarda)

### Nerede Kaldık
Edit ve fotoğraf yükleme özellikleri tamamlandı, build başarılı, push edildi.

### Sıradaki Adım
1. Rehber/kılavuz sayfası (`/dashboard/vault/[id]/rehber`) — kişi verilerin anma sayfasında nerede göründüğünü gösterir
2. payments RLS hatası düzeltmesi
3. Login sayfası "Kaydınız yoksa" → /satin-al yönlendirmesi
4. Vefat bildirimi alanı

---

## 2026-06-07 — Oturum 21: Dashboard Redesign + Vasiyetname Sayfası

### Yapılanlar
- `vault/[id]/page.tsx` (dashboard ana sayfa) yeniden tasarlandı:
  - Sol: motivasyon widget + numaralı bölüm listesi (kırmızı=boş, yeşil=dolu, meta sayılar)
  - Sağ sticky: profil kartı (kapak görseli, isim, yıllar, tagline, URL, progress bar, önizle butonu)
  - Bölüm sırası: profil → biyografi → aile → varis → anılar → fotolar → videolar → özel → vasiyet → belgeler → QR
- `vault/[id]/vasiyet/page.tsx` yeni sayfa oluşturuldu:
  - Hem yazılı vasiyet metni (vault_memories, section='vasiyet') hem belge yükleme (vault_documents, category='will')
  - PersonHeader, locked state, tam CRUD
- Supabase migration: `vault_memories.section` text kolonu eklendi (default 'general')
- `gizli-kasa/page.tsx`: section='general' filtresi eklendi (vasiyet kayıtlarını göstermez)
- `memories.ts` action: section alanı okunup INSERT'e eklendi, vasiyet revalidatePath eklendi
- Commit: `f4f5c43`

### Proje Durumu
- [x] Auth sistemi
- [x] Dashboard ana sayfa redesign (sol liste + sağ profil kartı)
- [x] Tüm alt sayfa layout overhaul (PersonHeader, timeline, masonry, sidebar nav)
- [x] Vasiyetname sayfası (metin + belge)
- [x] Anılar medya desteği
- [x] Belgeler kasası
- [ ] payments RLS hatası
- [ ] Login "Kaydınız yoksa" → /satin-al yönlendirmesi
- [ ] Rehber/kılavuz sayfası (kişi verilerin nereye gittiğini görecek)
- [ ] Vefat bildirimi alanı

### Kritik Kararlar / Notlar
- vault_memories.section kolonu: 'general' (gizli-kasa), 'vasiyet' (vasiyetname) ayrımı
- Vasiyet belgeler: vault_documents category='will' — belgeler sayfasında da 'Vasiyet' kategorisinde görünür
- Dashboard profil kartında cover_photo_url yoksa memorial-hero-cemetery görseli görünür (düşük opacity)

### Nerede Kaldık
Dashboard redesign ve vasiyetname sayfası tamamlandı ve push edildi.

### Sıradaki Adım
1. Rehber/kılavuz sayfası (/rehber) — verilerin anma sayfasında nerede görüneceğini gösteren kılavuz
2. payments RLS hatası düzeltmesi
3. Login sayfası "Kaydınız yoksa" → /satin-al
4. Vefat bildirimi alanı

---

## 2026-06-07 — Oturum 20: Layout Overhaul — PersonHeader + Timeline + Masonry + Sidebar Nav

### Yapılanlar
- `_PersonHeader.tsx` bileşeni oluşturuldu: kişi avatarı, ad, yaşam yılları ve mevcut bölüm başlığı
- `biography/page.tsx` — PersonHeader eklendi, vault query genişletildi (cover_photo_url, birth_date, death_date)
- `profil/page.tsx` — sol sticky sidebar nav + sağ form düzeni (5 bölüm: temel, foto, tarih, mesaj, mezar)
- `fotolar/page.tsx` — masonry grid (CSS columns-2/3/4, natural aspect ratio images)
- `anilar/page.tsx` — vertical timeline (gold date markers, absolute line + dots), medya desteği korundu
- `aile/page.tsx` — card grid (2/3 kolon), centered avatarlar, hover reveal delete
- `videolar/page.tsx` — PersonHeader + büyük empty state (serif font)
- `belgeler/page.tsx` — PersonHeader + 8 kategorili belge kasası, kategoriye göre gruplu liste
- `heirs/page.tsx` — PersonHeader eklendi, vault query genişletildi
- `gizli-kasa/page.tsx` — PersonHeader eklendi, form düzeni iyileştirildi
- `settings/page.tsx` — PersonHeader + sol sticky sidebar nav (5 bölüm: slug, genel, qr, yayin, tehlike)
- Tüm değişiklikler commit edildi ve push edildi (commit: `3cfea54`)

### Proje Durumu
- [x] Auth sistemi
- [x] Dashboard + Vault CRUD
- [x] QR route
- [x] Warm cream/olive/gold tasarım
- [x] Tüm alt sayfa layout overhaul (PersonHeader, timeline, masonry, sidebar nav)
- [x] Anılar medya desteği (foto/video upload + URL)
- [x] Belgeler kasası (multi-file, 8 kategori)
- [ ] payments RLS hatası
- [ ] Login "Kaydınız yoksa" → /satin-al yönlendirmesi
- [ ] Vefat bildirimi alanı (belgeler'den ayrı)

### Kritik Kararlar / Notlar
- PersonHeader saf presentational component — hem server hem client componentlarda kullanılabilir
- Masonry için CSS columns yaklaşımı (Tailwind native: columns-2 sm:columns-3 lg:columns-4)
- Timeline için absolute positioned line + relative item dots
- Settings ve profil: sol nav sadece lg: breakpoint'te görünür (sticky top-8)
- belgeler sayfası eskiden vefat bildirimi içeriyordu; tamamen belge kasasına dönüştürüldü

### Nerede Kaldık
11 sayfa layout overhaul'ı tamamlandı ve push edildi. Tüm sub-page'ler PersonHeader ile tutarlı görünüm kazandı.

### Sıradaki Adım
1. `payments` RLS hatası düzeltmesi (ödeme kayıt sorunu)
2. Login sayfası "Kaydınız yoksa" → `/satin-al` yönlendirmesi
3. Vefat bildirimi alanının tasarımı ve implementasyonu (belgeler'den ayrı, ayrı bir alan)

---

## 2026-06-07 — Oturum 19: Anılar — Medya Ekleme + Zorunlu Tarih

### Yapılanlar
- `vault_memories` tablosuna `media_url` (text) ve `media_type` (text, 'image'|'video') kolonları eklendi (migration)
- `memories.ts` action güncellendi: tarih zorunlu (`!memoryDate → return`), dosya upload (vault-media bucket, `memories/{vaultId}/{userId}/...`) + URL desteği
- `anilar/page.tsx` yeniden yazıldı: tarih zorunlu `required`, medya bölümü (dosya yükle + URL + tür seçimi), kartlarda fotoğraf/video embed gösterimi
- `gizli-kasa/page.tsx` tarih alanına `required` eklendi

### Nerede Kaldık
Anılar sayfası artık fotoğraf/video destekli. Medya dosyaları `vault-media` bucket'ına `memories/` prefix ile yükleniyor.

### Sıradaki Adım
1. Sayfa test et — özellikle dosya upload ve video embed
2. `payments` RLS hatası düzeltmesi
3. Login "Kaydınız yoksa" → `/satin-al` yönlendirmesi

---

## 2026-06-07 — Oturum 18: Tüm Alt Sayfalar Yeniden Tasarlandı

### Yapılanlar
- `biography/page.tsx` — warm cream/olive tasarımıyla yeniden yazıldı (client component, auto-save korundu)
- `profil/page.tsx` — yeni tasarım, dosya upload + URL seçeneği, `saveVaultProfileAction` bağlı
- `fotolar/page.tsx` — yeni tasarım, `addPhotoAction` ile hem dosya hem URL desteği, `encType="multipart/form-data"` eklendi
- `anilar/page.tsx` — yeni tasarım, tüm logic korundu
- `aile/page.tsx` — yeni tasarım, aile üyeleri listesi ve form güncellendi
- `videolar/page.tsx` — yeni tasarım, YouTube/Vimeo embed + dosya upload
- `belgeler/page.tsx` — yeni tasarım, inline action `id` string üzerinden çalışıyor
- `heirs/page.tsx` — yeni tasarım ("Yetkili Kişiler" başlığı)
- `gizli-kasa/page.tsx` — yeni tasarım, özel içerikler ve gizli medya listesi

### Proje Durumu
- [x] Auth sistemi
- [x] Dashboard ana sayfası (warm cream tasarım)
- [x] Layout sidebar (warm cream)
- [x] Tüm alt sayfalar (biography, profil, fotolar, anilar, aile, videolar, belgeler, heirs, gizli-kasa, settings) — TAMAMLANDI
- [x] Storage bucket (vault-media)
- [ ] payments RLS hatası
- [ ] Login sayfası "Kaydınız yoksa" → /satin-al yönlendirmesi

### Kritik Kararlar / Notlar
- Tüm sayfalarda ortak tasarım tokenleri: `bg-[#fbf8f0]`, kart `bg-[#fffdf8]`, yeşil `#174f35`, altın `#dfbd72`, kenarlık `#e5dccb`
- Input stili: `rounded-xl border border-[#e5dccb] bg-white focus:border-[#174f35]`
- Breadcrumb: `text-[#788177]` link, `font-semibold text-[#22362e]` aktif
- Kilitli uyarı: `bg-[#fff7e6] border-[#dfbd72]/50 text-[#725212]`
- File upload formlarında `encType="multipart/form-data"` zorunlu
- `media.ts` action dosyası zaten hem URL hem dosya destekliyor (`vault-media` bucket)

### Nerede Kaldık
Tüm 9 alt sayfa (biography, profil, fotolar, anilar, aile, videolar, belgeler, heirs, gizli-kasa) ve settings sayfası warm cream/olive/altın tasarımına taşındı. Önizleme (onizleme) sayfası kasıtlı olarak koyu yeşil önizleme tasarımında bırakıldı.

### Sıradaki Adım
1. Sayfaları test et — özellikle dosya upload (profil + fotolar + videolar)
2. `payments` tablosu RLS hatasını düzelt (kayıt yaptırma akışı kırık)
3. Login sayfasında "Kaydınız yoksa" linkini `/satin-al` satın alma sayfasına yönlendir
4. `onizleme` sayfasını isteğe göre gözden geçir (şu an koyu yeşil, kasıtlı)

---

## 2026-06-07 — Oturum 17: Hata Teşhisi + Storage Bucket + Kullanıcı Geri Bildirimleri

### Yapılanlar
- `/dashboard/vault/[id]/profil` — 404 hatası teşhis edildi; inline `'use server'` fonksiyonların modül seviyesine taşınması gerektiği tespit edildi
- Supabase API/Postgres logları incelendi: `invalid input syntax for type uuid: ""` ve `payments` RLS hatası görüldü
- Supabase Storage `media` bucket oluşturuldu (10MB limit, jpeg/png/webp/gif, public read, authenticated upload)
- Claude Code auto-update sorunu kullanıcıya açıklandı (VS Code açıkken güncelleme çalışmıyor)
- Kullanıcı geri bildirimleri alındı ve sıradaki oturum için yapılacaklar netleşti

### Proje Durumu
- [x] Auth sistemi (Supabase SSR)
- [x] Admin paneli (bank settings, gateway settings, verifications, exemptions)
- [x] Satın alma akışı (havale + pending_verification)
- [x] Vault CRUD + tüm içerik sayfaları
- [x] RLS sonsuz döngü düzeltmesi (SECURITY DEFINER fonksiyonlar)
- [x] createServiceClient düzeltmesi (cookie'siz pure service role)
- [x] Supabase Storage media bucket
- [ ] Profil sayfası inline action → modül action'a taşınacak (404 fix)
- [ ] Gerçek dosya yükleme (şu an URL tabanlı, bucket hazır)
- [ ] "Kasalarım"/"Kasa" → daha duygusal isim (kullanıcı talebi)
- [ ] Tasarım revizyonu — daha premium, duygusal görünüm (kullanıcı talebi)
- [ ] Login sayfası "Kaydınız yoksa" linki → satın alma sayfasına yönlendir

### Kritik Kararlar / Notlar
- Kullanıcı "birden fazla kasa olmaz" dedi — konsept "Kasa" yerine daha duygusal bir isim istiyor
- Kullanıcı foto yüklemenin URL yerine gerçek dosya yükleme olmasını istiyor + otomatik sıkıştırma
- Sistem şu an çalışıyor; tasarım ve isim revizyonu sonraki oturumun önceliği
- `payments` tablosunda RLS hatası var — satın alma akışında payment kaydı oluşturulurken sorun çıkabilir

### Nerede Kaldık
Teşhis oturumu. Kod değişikliği minimal (sadece storage bucket SQL). Kullanıcı sistemi çalışır buldu. Sıradaki oturumda somut kod değişiklikleri yapılacak.

### Sıradaki Adım
1. `profil/page.tsx` inline server action → `src/lib/actions/profile.ts` modülüne taşı (404 fix)
2. `fotolar/page.tsx` — gerçek dosya yükleme (Canvas sıkıştırma + Supabase Storage)
3. "Kasalarım" / "Kasa" terminolojisini daha duygusal bir isimle değiştir (tüm sayfalarda)
4. Dashboard ve vault sayfaları tasarım revizyonu — premium anma platformu görünümü
5. Login sayfası "Kaydınız yoksa" → `/satin-al` yönlendirmesi
6. `payments` tablosu RLS politikası düzelt

---

## 2026-06-07 — Oturum 16: Tam İçerik Sistemi — Ödeme, Kasa, Anma Sayfası

### Yapılanlar
- `src/lib/actions/memories.ts` — addMemoryAction, updateMemoryAction, deleteMemoryAction (void dönüş tipi, lock kontrolü)
- `src/lib/actions/family.ts` — addFamilyMemberAction, updateFamilyMemberAction, deleteFamilyMemberAction (void)
- `src/lib/actions/heirs.ts` — full_name + relationship + phone alanları eklendi, revokeHeirAccessAction void yapıldı
- `src/app/satin-al/page.tsx` — ürün seçim sayfası (Anma 249₾ / Kasa 49₾+12.90₾)
- `src/app/satin-al/actions.ts` — purchaseMemorialAction + purchaseVaultAction (pending_verification status ile vault oluşturur)
- `src/app/satin-al/anma/page.tsx` — anma satın alma formu (IBAN, havale)
- `src/app/satin-al/kasa/page.tsx` — kasa satın alma formu
- `src/app/admin/verifications/actions.ts` — approvePaymentAction + rejectPaymentAction
- `src/app/admin/verifications/page.tsx` — ödeme bilgisi join eklendi
- `src/app/admin/verifications/_ApproveButton.tsx` — paymentId prop eklendi
- `src/app/admin/_components/StatusBadge.tsx` — Türkçe etiketler
- `src/app/dashboard/vault/[id]/page.tsx` — tamamlanma yüzdesi, kilit banner, 10-kart grid
- `src/app/dashboard/vault/[id]/profil/page.tsx` — kişisel bilgiler (ad, tarihler, fotoğraf, mezar vb.)
- `src/app/dashboard/vault/[id]/biography/page.tsx` — lock kontrolü eklendi
- `src/app/dashboard/vault/[id]/anilar/page.tsx` — anı ekleme/silme
- `src/app/dashboard/vault/[id]/aile/page.tsx` — aile ağacı builder
- `src/app/dashboard/vault/[id]/fotolar/page.tsx` — 50 foto limiti, URL tabanlı
- `src/app/dashboard/vault/[id]/videolar/page.tsx` — 10 video limiti, YouTube/Vimeo embed
- `src/app/dashboard/vault/[id]/belgeler/page.tsx` — ölüm belgesi URL yükleme
- `src/app/dashboard/vault/[id]/gizli-kasa/page.tsx` — is_secret memories (life_vault only)
- `src/app/dashboard/vault/[id]/heirs/page.tsx` — full_name/relationship/phone ile davet formu (life_vault only)
- `src/app/dashboard/vault/[id]/onizleme/page.tsx` — ölüm sonrası sayfa önizleme (amber banner)
- `src/app/dashboard/vault/[id]/settings/page.tsx` — pub_settings bölümü eklendi (6 toggle)
- `src/app/memorial/[slug]/page.tsx` — slug='demo' → demo, diğer → gerçek veri
- `src/app/memorial/[slug]/RealMemorialPage.tsx` — gerçek vault datası ile anma sayfası

### Proje Durumu
- [x] Supabase schema (migration 013: vault_family_members, vault_memories, heirs güncelleme, pub_settings, payment_verified_at)
- [x] Satın alma akışı (havale + pending_verification)
- [x] Admin ödeme onaylama/reddetme
- [x] Vault lock mekanizması (pending_verification → her yerde disabled)
- [x] Tamamlanma yüzdesi hesaplama
- [x] Profil bilgileri sayfası
- [x] Biyografi (lock kontrolü eklendi)
- [x] Fotoğraf galerisi (URL, 50 limit)
- [x] Video galerisi (YouTube/Vimeo, 10 limit)
- [x] Anılar sayfası
- [x] Aile ağacı
- [x] Belgeler / ölüm belgesi
- [x] Gizli kasa (life_vault only)
- [x] Varisler (life_vault only, full_name/relationship/phone)
- [x] Önizleme sayfası (ölüm sonrası sayfa nasıl görünür)
- [x] Settings pub_settings toggleları
- [x] memorial/[slug] gerçek veri bağlantısı
- [ ] R2 dosya yükleme (URL tabanlı çalışıyor şimdilik)
- [ ] Varis davet e-postası gönderimi
- [ ] Ödeme bildirim e-postası

### Kritik Kararlar / Notlar
- Server actions artık `Promise<void>` döndürüyor; form `action=` prop tipi uyumsuzluğunu çözdü
- memorial_profile → gizli-kasa ve heirs sayfalarına giremez (redirect ile)
- RealMemorialPage VaultRow interface ile tip güvenliği sağlandı
- Tüm TypeScript hataları giderildi (npx tsc --noEmit temiz çıktı)

### Nerede Kaldık
Tüm planlanan özellikler tamamlandı. Son commit atıldı. Sistem çalışır durumda: satın alma → admin onay → içerik doldurma → önizleme → yayın. R2 entegrasyonu ve e-posta bildirimleri sıradaki büyük adım.

### Sıradaki Adım
1. R2 / Cloudflare entegrasyonu ile gerçek dosya yükleme (fotolar + belgeler)
2. Supabase Edge Function veya Resend ile varis davet e-postası
3. Admin panel ödeme onay e-postası bildirimi
4. memorial/[slug] public sayfasına ziyaretçi guestbook / yorum bölümü
5. QR kod üretimi ve PDF indirme özelliği

---

## 2026-06-07 — Oturum 15: Admin Durum Etiketleri Türkçeleştirildi

### Yapılanlar
- `src/app/admin/_components/StatusBadge.tsx` — renk-only map'ten `{ label, cls }` config map'e dönüştürüldü; tüm vault, ödeme, iletişim, rol durumları artık Türkçe görünüyor
- `src/app/admin/page.tsx` — vault özet kartlarındaki İngilizce kod etiketleri Türkçeye çevrildi

### Proje Durumu
- [x] Admin login ayrı URL (`/admin/login`)
- [x] Admin panel DB bağlantılı sayfalar
- [x] Kasa (ödeme yönetimi) sayfası
- [x] DB'den fiyat yönetimi + kampanya sistemi
- [x] Admin durum etiketleri Türkçe
- [ ] Resend e-posta entegrasyonu
- [ ] TBC Pay / BOG Pay ödeme entegrasyonu
- [ ] R2 medya yükleme
- [ ] Supabase bölge migrasyonu (Tokyo → Frankfurt)

### Kritik Kararlar / Notlar
- `StatusBadge` artık ham DB değeri yerine Türkçe etiket gösteriyor; bilinmeyen status string'leri olduğu gibi fallback olarak görünüyor
- Supabase bölgesi hâlâ `ap-northeast-1` (Tokyo) — Gürcistan/Türkiye pazarı için Frankfurt (`eu-central-1`) öneriliyor

### Nerede Kaldık
`StatusBadge.tsx` ve `admin/page.tsx` Türkçe etiket düzenlemesi tamamlandı ve commit'lendi (f0fd4ca). Supabase bölge migrasyonu henüz yapılmadı.

### Sıradaki Adım
1. Supabase bölge migrasyonu: Tokyo → Frankfurt (Ayarlar → Genel → Bölge değiştir)
2. Resend ile iletişim formu e-posta entegrasyonu
3. R2 medya yükleme altyapısı
4. TBC Pay / BOG Pay ödeme entegrasyonu başlangıcı

---

## 2026-06-07 — Oturum 14: Admin Login, Kasa Geliştirme, DB Fiyat Yönetimi

### Yapılanlar

**Admin Login & Güvenlik:**
- `src/app/admin/login/page.tsx` + `AdminLoginForm.tsx` + `actions.ts` — ayrı admin login sayfası (`/admin/login`), `/auth/login`'den tamamen bağımsız
- Login sonrası rol kontrolü: `role !== 'admin'` ise anında `signOut()` + audit log
- `src/app/admin/signout/route.ts` — admin çıkış route'u (logout audit log dahil)
- `src/lib/supabase/middleware.ts` — `/admin/login` ve `/admin/signout` middleware'den muaf tutuldu; korumalı admin sayfaları artık `/admin/login`'e yönleniyor (`/login`'e değil)
- `src/app/admin/layout.tsx` — `getAdminContext()` (soft check) kullanacak şekilde yeniden yazıldı; sonsuz redirect döngüsü engellendi
- `src/lib/admin/auth.ts` — `cache()` ile deduplicate: layout + page aynı auth sonucunu paylaşıyor (4 DB round-trip → 2'ye düştü)
- `admin@themaradi.com` kullanıcısı Supabase'e SQL ile oluşturuldu, `role = 'admin'` atandı
- `/dashboard` layout'una admin ise "Admin Paneli" kısayol linki eklendi

**Kasa Geliştirme:**
- `src/app/admin/kasa/page.tsx` — ödeme listesine kullanıcı adı + e-posta eklendi (vault → profiles join)
- `src/app/admin/kasa/_ManualPaymentForm.tsx` — vault arama + manuel ödeme ekleme modalı
- `actions.ts → addManualPayment()` — Zod validasyonlu, audit loglu server action

**Performans:**
- `src/lib/admin/auth.ts` — `cache()` ile auth deduplication
- `src/app/admin/page.tsx` — `vaults` tam tablo yerine `vault_status_counts()` RPC ile GROUP BY sorgusu
- Migration 011: `vault_status_counts()` PostgreSQL fonksiyonu

**Fiyat & Kampanya Yönetimi:**
- Migration 012: `platform_settings` tablosu (fiyatlar, kampanya config) + `pricing_exemptions` tablosu (ücretsiz/indirimli muafiyetler)
- `src/lib/pricing.ts` — `fetchPricingConfig()` utility, fallback değerli
- `src/app/page.tsx` — server component olarak fiyat çekip `LocalizedLanding`'e prop geçiriyor
- `src/app/pricing/page.tsx` — aynı şekilde `PricingClient`'a prop geçiriyor
- `src/components/landing/LocalizedLanding.tsx` — `pricing` prop kabul ediyor, kampanya varsa üzeri çizili eski fiyat + büyük yeni fiyat gösteriyor
- `src/app/pricing/PricingClient.tsx` — aynı kampanya mantığı
- `src/app/admin/settings/page.tsx` — fiyat yönetim sayfası (tam işlevsel)
- `src/app/admin/settings/_PricingSettingsForm.tsx` — fiyat güncelleme formu + kampanya toggle
- `src/app/admin/settings/_ExemptionForm.tsx` — ücretsiz/indirimli muafiyet ekleme modalı
- `actions.ts → updatePricingSettings()`, `addPricingExemption()` — server actions

### Proje Durumu
```
[x] DB migrations 001-012
[x] Admin panel — 13 sayfa (dashboard, verifications, kasa, memorials, objections, vb.)
[x] Admin login — ayrı URL (/admin/login), rol doğrulama, audit log
[x] Admin auth cache() optimizasyonu
[x] Kasa — kullanıcı bilgileri + manuel ödeme ekleme
[x] Fiyat yönetimi — DB'den okuma, admin panelinden güncelleme
[x] Kampanya sistemi — toggle, indirimli fiyat, bitiş tarihi
[x] Ücretsiz muafiyet sistemi (şehitler, ünlüler, özel kişiler)
[x] 4 dil i18n (TR/KA/RU/EN)
[ ] ContactForm API route (Resend)
[ ] Ödeme entegrasyonu (TBC Pay / BOG Pay)
[ ] R2 media upload
[ ] Admin panel — pricing exemptions ödeme akışına entegre edilmeli
[ ] Admin panel — kullanıcı oluşturma UI (şu an SQL ile yapılıyor)
```

### Kritik Kararlar / Notlar
- Admin login `/admin/login`'de, kullanıcı login `/auth/login`'de (henüz yok) — tamamen ayrı
- `cache()` pattern: React request-scope cache ile aynı request'te birden fazla `requireAdmin()` çağrısı tek DB round-trip'e iniyor
- `platform_settings` key-value tablosu: fiyat değişikliklerinde `revalidatePath('/')` ve `revalidatePath('/pricing')` çağrılıyor → ISR anında revalidate oluyor
- Muafiyetler şu an sadece kayıt altında — ödeme akışına henüz entegre değil (ileride kontrol edilecek)

### Nerede Kaldık
Admin paneli temel işlevleriyle çalışıyor. Fiyatlar DB'den okunuyor, admin panelinden güncellenebiliyor. Kampanya sistemi hazır. Manuel ödeme kaydı yapılabiliyor.

### Sıradaki Adım
1. ContactForm Resend entegrasyonu (e-posta gönderimi)
2. Ödeme entegrasyonu — TBC Pay veya BOG Pay
3. R2 media upload (vault içeriği için)
4. Pricing exemption → ödeme akışında kontrol (ücretsiz kullanıcı vault oluştururken muafiyet kontrolü)
5. Admin'den kullanıcı oluşturma UI (şu an SQL gerekiyor)

---

## 2026-06-07 — Oturum 13: Tam Admin Panel — Dashboard, Doğrulama, Kasa, Güvenlik, Audit Log

### Yapılanlar
- **6 DB Migration** (mcp__supabase-themaradi):
  - 005: `payments` tablosu (GEL, product_type, overdue tracking)
  - 006: `contact_messages` tablosu (anon insert politikası)
  - 007: `admin_audit_logs` tablosu (tüm admin aksiyonlarının kaydı)
  - 008: `alive_alerts` tablosu (yaşıyorum bildirimleri)
  - 009: `gdpr_requests` tablosu (30 gün SLA trigger)
  - 010: `profiles.role` kolonu + `is_admin()` fonksiyonu + `guestbook_entries` tablosu
- **`src/lib/admin/auth.ts`** — `requireAdmin()` + `getAdminContext()` server-side auth utilities
- **`src/lib/admin/audit.ts`** — `logAdminAction()` her mutasyonda admin_audit_logs'a kayıt
- **`src/app/admin/layout.tsx`** — requireAdmin korumalı server layout, AdminSidebar'a adminEmail/Name iletir
- **`src/app/admin/AdminSidebar.tsx`** — 13 nav item, mobile hamburger drawer, slate-900 dark sidebar
- **`src/app/admin/actions.ts`** — 11 server action: approveVault, rejectVault, changeVaultStatus, resolveObjection, updateContactStatus, updatePaymentStatus, resolveAliveAlert, resolveGdprRequest, moderateGuestbook, updateUserRole, banUser
- **13 admin sayfası** (hepsi server component + requireAdmin):
  - `/admin` — Dashboard (6 stat kart, vault durum özeti, son audit log)
  - `/admin/verifications` — Doğrulama kuyruğu, gün sayacı, 14 gün pencere
  - `/admin/kasa` — Ödeme özeti (MRR, tahsilat, vadeli), payment status değiştirme
  - `/admin/memorials` — Tüm vaultlar, filtreleme, pagination (25/sayfa)
  - `/admin/memorials/[id]` — Vault detay, heir listesi, payment geçmişi, durum değiştirme
  - `/admin/objections` — İtiraz kuyruğu, upheld/dismissed çözümleme
  - `/admin/contacts` — Contact mesaj kuyruğu, accordion expand, status/note güncelleme
  - `/admin/heirs` — Bekleyen varis davetleri, gün takibi
  - `/admin/alive-alerts` — Ben yaşıyorum bildirimleri, inceleme/çözme/reddetme
  - `/admin/guestbook` — Pending guestbook_entries moderasyonu, bulk approve/reject/spam
  - `/admin/users` — Kullanıcı listesi, rol değiştirme, ban (Supabase Admin API)
  - `/admin/gdpr` — GDPR talepleri, 30 gün SLA takibi, overdue highlight
  - `/admin/audit` — Salt okunur audit log, admin/action/tarih filtresi
  - `/admin/settings` — Placeholder UI (bakım modu, dosya boyutu, dil)
- **`src/app/contact/actions.ts`** — `submitContactMessage` server action (Zod validated, contact_messages tablosuna kayıt)
- **`src/app/contact/ContactForm.tsx`** — Gerçek DB kaydı yapan form (name attr'ları eklendi, error state)
- **`src/proxy.ts`** — /admin/* için `Cache-Control: no-store, no-cache`

### Proje Durumu
- [x] Supabase altyapısı ve middleware
- [x] Auth (login, signout, callback)
- [x] Dashboard
- [x] Vault CRUD
- [x] Memorial sayfası + QR route
- [x] i18n (TR/KA/RU/EN)
- [x] Landing page (yeniden tasarlandı)
- [x] Yasal sayfalar (terms, privacy, kvkk, legal)
- [x] Admin panel — tam, production-ready
- [x] DB: payments, contact_messages, admin_audit_logs, alive_alerts, gdpr_requests, guestbook_entries, profiles.role
- [ ] E-posta altyapısı (Resend entegrasyonu)
- [ ] Ödeme altyapısı (gerçek ödeme geçidi)
- [ ] Dosya yükleme (R2)
- [ ] Admin ayarlar backend

### Kritik Kararlar / Notlar
- `createServiceClient()` admin tarafında kullanılıyor (RLS bypass) — client'e service key asla gönderilmiyor
- `admin_audit_logs` tablosu orijinal `audit_logs` ile karışmaması için ayrı isimlendirildi
- `guestbook_entries` orijinal `guestbook` tablosundan ayrı — admin için yeni moderation tablosu
- `claim_objections` tablosu zaten vardı (farklı schema), migration 010'da yeni eklenmedi
- Form action pattern'leri Next.js App Router uyumlu — void return için client button component'leri kullanıldı
- Build zero TypeScript hata ile geçti (`npx tsc --noEmit` ve `npx next build` temiz)

### Nerede Kaldık
Tam admin panel tamamlandı ve master'a push edildi (commit: 2b94494). Tüm sayfalar `requireAdmin()` ile korunuyor, tüm mutasyonlar `logAdminAction()` ile audit_logs'a yazılıyor. Migrations 005-010 Supabase production'a apply edildi.

### Sıradaki Adım
1. E-posta altyapısı: Resend entegrasyonu (heir invitation, contact autoresponse, payment reminder)
2. Dosya yükleme: R2 bucket + presigned URL — media tablosu entegrasyonu
3. Admin settings backend: key-value store tablosu, maintenance mode middleware
4. Gerçek ödeme geçidi: GEL için yerel Gürcistan ödeme sağlayıcısı araştırılması
5. Alive alert → vault status değiştirme mantığını tamamla (admin resolve → vault suspend)

---

## 2026-06-07 — Oturum 12: Tam 4 Dil i18n (TR/KA/RU/EN) + Otomatik Dil Tespiti

### Yapılanlar
- `src/i18n/en.ts` — master schema oluşturuldu (800+ anahtar, `LangDict = typeof en`)
- `src/i18n/tr.ts` — Türkçe sözlük (mevcut sayfalardan birebir çıkarıldı)
- `src/i18n/ka.ts` — Gürcüce çeviriler (ციფრული სამახსოვრო, სიცოცხლის სეიფი vs.)
- `src/i18n/ru.ts` — Rusça çeviriler (Цифровой мемориал, Сейф жизни vs.)
- `src/i18n/index.ts` — cookie-first dil tespiti (`tm_lang` cookie > localStorage > navigator)
- `src/i18n/context.tsx` — LangProvider + useLang() hook (değişmedi, zaten hazırdı)
- `src/middleware.ts` — Accept-Language header'dan dil tespiti, cookie set (yönlendirme yok)
- `src/components/landing/Nav.tsx` — useLang() + dil değiştirici (desktop dropdown, mobil buton grubu)
- `src/components/landing/LocalizedLanding.tsx` — tüm veri dizileri t.landing.* ile
- `src/components/CookieBanner.tsx` — t.cookieBanner.* ile
- `src/components/legal/LegalPage.tsx` — 'use client', t.legal.shell.* (nav, TOC başlığı, footer)
- `src/app/pricing/page.tsx` — server shell → PricingClient.tsx render
- `src/app/pricing/PricingClient.tsx` — yeni, 'use client', t.pricing.* ile tam sayfa
- `src/app/contact/page.tsx` — server shell → ContactPageClient.tsx
- `src/app/contact/ContactPageClient.tsx` — yeni, 'use client', t.contact.*
- `src/app/contact/ContactForm.tsx` — t.contact.form.* ile
- `src/app/privacy/page.tsx` — server shell → PrivacyClient.tsx
- `src/app/privacy/PrivacyClient.tsx` — yeni, t.legal.privacy.* ile
- `src/app/terms/page.tsx` — server shell → TermsClient.tsx
- `src/app/terms/TermsClient.tsx` — yeni, t.legal.terms.* ile
- `src/app/kvkk/page.tsx` — server shell → KvkkClient.tsx
- `src/app/kvkk/KvkkClient.tsx` — yeni, t.legal.kvkk.* ile
- `src/app/cookies/page.tsx` — server shell → CookiesClient.tsx
- `src/app/cookies/CookiesClient.tsx` — yeni, t.legal.cookies.* ile
- `src/app/legal/verification-policy/page.tsx` — server shell → VerificationPolicyClient.tsx
- `src/app/legal/verification-policy/VerificationPolicyClient.tsx` — yeni, t.legal.verification.* ile
- `src/app/q/not-found/page.tsx` — 'use client', t.qPages.notFound.*
- `src/app/q/pending/page.tsx` — server shell → QrPendingClient.tsx
- `src/app/q/pending/QrPendingClient.tsx` — yeni, t.qPages.pending.*
- Commit: `feat: tam 4 dil i18n (TR/KA/RU/EN) + otomatik dil tespiti` → push OK

### Proje Durumu
```
[x] DB migrations 001-004
[x] Memorial profil sayfası
[x] /pricing (2 ürün modeli)
[x] /contact sayfası
[x] QR kalıcı yönlendirme (/q/[code])
[x] /privacy — Gizlilik Politikası
[x] /terms — Kullanım Koşulları
[x] /legal/verification-policy — Doğrulama Politikası
[x] Landing page güncellemeleri
[x] 4 dil i18n (TR/KA/RU/EN) — tüm sayfalarda
[x] Otomatik dil tespiti (middleware + cookie)
[ ] ContactForm API route (Resend)
[ ] Admin panel (belge inceleme)
[ ] R2 media upload
[ ] Ödeme entegrasyonu (TBC Pay / BOG Pay)
```

### Kritik Kararlar / Notlar
- Server/client split: `export const metadata` olan sayfalar server component kalır, i18n içeriği `*Client.tsx`'e taşınır
- Cookie adı: `tm_lang`, maxAge: 1 yıl, SameSite=Lax — hem middleware hem client'tan yazılıyor
- Middleware yönlendirme yapmıyor, sadece cookie set ediyor (UX için non-disruptive)
- `LangDict = typeof en` — TypeScript type safety, diğer diller bunu satisfy etmek zorunda
- Icon dizileri (PricingClient, LocalizedLanding) veri dizilerinden bağımsız, indeks ile eşleşiyor
- Legal sayfalar: basitleştirilmiş `t.legal.*` structure kullanıldı (orijinal TR inline HTML kaldırıldı, dict-based içerik alındı)

### Nerede Kaldık
Tam i18n implementasyonu tamamlandı. 28 dosya değişti, 9 yeni dosya oluşturuldu. Commit + push yapıldı.
Tüm sayfalar artık TR/KA/RU/EN destekliyor; dil değiştiricisi Nav'da mevcut.

### Sıradaki Adım
1. ContactForm API route (Resend ile e-posta gönderimi)
2. Admin panel temel yapısı (pending_verification kuyruğu)
3. Belge yükleme UI (create-memorial akışı)
4. Ödeme entegrasyonu (TBC Pay / BOG Pay)

---

## 2026-06-07 - Oturum 11: Hukuki Belgeler + Landing Page Güncelleme

### Yapilanlar
**Hukuki Belgeler:**
- `LegalPage.tsx` component yeniden tasarlandı (TOC sidebar, nav, footer, prose içerik)
- `/privacy` — Gizlilik Politikası (GDPR + Gürcistan KVK + KVKK uyumlu, 13 bölüm, tablolar)
- `/terms` — Kullanım Koşulları (13 bölüm, Bölüm 11 hizmet sürekliliği taahhüdü: min 10 yıl)
- `/legal/verification-policy` — Doğrulama & İtiraz Politikası (5 adımlı süreç, itiraz tablosu, acil bildirim)
- Footer ve nav linkleri doğrulama politikasını içerecek şekilde güncellendi

**Landing Page (LocalizedLanding.tsx) güncellemeleri:**
- Fiyatlandırma bölümü: 3 paket → 2 ürün (Anma Profili 249₾ + Yaşam Kasası 49₾+12.90₾/ay)
- SSS: salt metin → tam genişleyebilir accordion (useState, ChevronDown animasyon), 8 soru-cevap
- Güvenlik bölümü: 4 kart → 6 kart, her birinde spesifik teknik detay (TLS 1.3, AES-256, RLS, bcrypt, QR kalıcılık, doğrulama)
- "Nasıl çalışır?" bölümü: 4 adım → 2 senaryo kartı (A: Aile sonradan oluşturur / B: Kişi hayattayken kurar)
- "Neden The Maradi?" bölümü: 5 → 6 kart, son kart "Minimum 10 yıl aktif taahhüdü" eklendi
- Footer: İstanbul → Batumi, Gürcistan; /kvkk → /legal/verification-policy

### Proje Durumu
```
[x] DB migrations 001-004
[x] Memorial profil sayfası
[x] /pricing (2 ürün modeli)
[x] /contact sayfası
[x] QR kalıcı yönlendirme (/q/[code])
[x] /privacy — Gizlilik Politikası
[x] /terms — Kullanım Koşulları
[x] /legal/verification-policy — Doğrulama Politikası
[x] Landing page güncellemeleri (accordion FAQ, 2 ürün pricing, güvenlik detayları)
[ ] ContactForm API route (Resend)
[ ] Admin panel (belge inceleme)
[ ] R2 media upload
[ ] Ödeme entegrasyonu (TBC Pay / BOG Pay)
```

### Kritik Kararlar / Notlar
- Terms Bölüm 11 hukuki olarak bağlayıcı taahhüt: min 10 yıl aktif, kapatma öncesi 12 ay bildirim
- Doğrulama politikası acil "ben yaşıyorum" bildirimi → 4 iş saati yanıt, profil derhal askıya
- Landing FAQ accordion: openFaq state, null = hepsi kapalı
- LegalPage component artık children prop alıyor (esnek JSX), sections array kaldırıldı

### Nerede Kaldik
Tüm hukuki belgeler ve landing page güncellemeleri tamamlandı. Commit atıldı.

### Siradaki Adim
1. ContactForm API route (Resend ile e-posta gönderimi)
2. Admin panel temel yapısı (pending_verification kuyruğu)
3. Belge yükleme UI (create-memorial akışı)
4. Ödeme entegrasyonu (TBC Pay / BOG Pay)

---

## 2026-06-07 - Oturum 10: QR Kalıcı Yönlendirme + Contact Sayfası

### Yapilanlar
**QR Routing Sistemi:**
- DB Migration 004 uygulandı:
  - `vaults.qr_code VARCHAR(20) UNIQUE` alanı eklendi
  - `generate_qr_code()` fonksiyonu: `TM-XXXXXXXX` formatı, çakışma kontrolü
  - `assign_qr_code()` trigger: yeni vault'lara otomatik kod atar
  - `qr_scan_logs` tablosu: her QR taramasını loglar (vault_id, user_agent, country)
  - Mevcut vault'lara otomatik kod atandı
- `/app/q/[code]/route.ts` oluşturuldu:
  - `qr_code` → DB lookup → 301/302 redirect
  - `public_memorial` / `private_memorial` → `/memorial/[slug]` (301 kalıcı)
  - `pending_verification` / `hidden_vault` → `/q/pending` (302 geçici)
  - Bulunamayan kod → `/q/not-found`
  - `origin` kullanılır (request.url), hem local hem prod çalışır
  - Scan log fire-and-forget (yönlendirmeyi bloklamaz)
- `/app/q/pending/page.tsx` — "Profil hazırlanıyor" sayfası
- `/app/q/not-found/page.tsx` — "QR kodu tanınmadı" sayfası
- `.env.local` → `NEXT_PUBLIC_SITE_URL` eklendi

**Contact Sayfası:**
- `/contact/page.tsx` tamamen yeniden yazıldı
- `/contact/ContactForm.tsx` client component (konu seçimi, gönderim durumu)
- İletişim: +995 555 511 884, Petre Bagrationi Str. 220 Batumi, info@themaradi.com
- Google Maps embed, departman kartları (destek/iş birliği/gizlilik)

### Proje Durumu
```
[x] DB migrations 001-004
[x] Memorial profil sayfası
[x] /pricing (2 ürün modeli)
[x] /contact sayfası
[x] QR kalıcı yönlendirme (/q/[code])
[x] QR scan log tablosu
[ ] ContactForm API route (Resend)
[ ] Hukuki belgeler (Gizlilik, KVKK/GDPR, Kullanım Koşulları)
[ ] Admin panel (belge inceleme)
[ ] R2 media upload
[ ] Ödeme entegrasyonu
```

### Kritik Kararlar / Notlar
- QR koda basan URL hiçbir zaman slug içermez → slug değişse bile plaka çalışır
- `generate_qr_code()` loop ile çakışmayı önler, teorik sonsuz unique kod havuzu
- Scan log analitik için (ileride hangi mezarlık daha çok tarıyor görebilirsin)
- `origin` kullanımı: local'de `localhost:3010/q/...`, prod'da `themaradi.com/q/...` otomatik

### Nerede Kaldik
QR sistemi ve contact sayfası tamamlandı. Sırada hukuki belgeler.

### Siradaki Adim
1. Gizlilik Politikası (/privacy) — GDPR + Gürcistan KVK + KVKK uyumlu
2. Kullanım Koşulları (/terms)
3. ContactForm API route (Resend entegrasyonu)
4. Admin panel temel yapısı

---

## 2026-06-07 - Oturum 9: Contact Sayfası

### Yapilanlar
- `/contact/page.tsx` tamamen yeniden yazıldı — önceki iskelet silindi
- `/contact/ContactForm.tsx` client component oluşturuldu (useState form, konu seçimi, gönderim durumu)
- İletişim bilgileri:
  - Telefon: +995 555 511 884 (Gürcistan)
  - E-posta: info@themaradi.com / support@themaradi.com / privacy@themaradi.com
  - Adres: Petre Bagrationi Str. 220, Batumi / Gürcistan
  - Çalışma saatleri: Pzt–Cum 09:00–18:00, Cmt 10:00–14:00
- Google Haritalar embed (Batumi ofis konumu)
- 3 departman kartı (Destek / İş birliği / Gizlilik) e-posta linkleriyle
- Nav ve footer pricing/memorial sayfalarıyla uyumlu

### Proje Durumu
```
[x] DB migrations 001-003
[x] Memorial profil sayfası (/memorial/demo)
[x] /pricing sayfası (2 ürün modeli)
[x] /contact sayfası (form + iletişim bilgileri)
[ ] ContactForm → API route / Resend entegrasyonu
[ ] Admin panel (belge inceleme kuyruğu)
[ ] R2 media upload
[ ] Ödeme entegrasyonu (TBC Pay / BOG Pay)
[ ] Heir davet e-postaları
[ ] /dashboard gerçek kullanıcı akışı
```

### Nerede Kaldik
Contact sayfası tamamlandı. Form şu an UI seviyesinde (TODO: Resend API route).

### Siradaki Adim
1. ContactForm için `/api/contact` route yaz (Resend entegrasyonu)
2. Dashboard — kullanıcı profil oluşturma akışı
3. Belge yükleme UI (pending_verification için)
4. Ödeme entegrasyonu

---

## 2026-06-07 - Oturum 8: Fraud Prevention + Pricing 2-Urun Modeli

### Yapilanlar
- DB Migration 003 uygulandı (proje: qcxsqirqlepjebkezgud):
  - `vaults.status` CHECK kısıtına `pending_verification` ve `suspended` eklendi
  - `vaults.product_type` alanı eklendi: `life_vault` | `memorial_profile`
  - `death_claims` tablosuna `requester_id_document_url`, `deceased_id_document_url`, `objection_count`, `verification_notes` alanları eklendi
  - `claim_objections` tablosu oluşturuldu (14 günlük itiraz penceresi için), RLS politikaları ile
  - `subscriptions.tier` CHECK kısıtı güncellendi: `memorial_profile`, `life_vault_monthly`, `life_vault_yearly`
  - `subscriptions.setup_fee_paid` ve `setup_fee_amount` alanları eklendi
  - `increment_objection_count()` trigger fonksiyonu eklendi
- `/pricing` sayfası 2 ürün modeline göre tamamen yeniden yazıldı:
  - Anma Profili: 249 ₾ tek seferlik (QR plaka dahil, belge doğrulama zorunlu)
  - Yaşam Kasası: 49 ₾ kurulum + 12.90 ₾/ay veya 99 ₾/yıl
  - Doğrulama adımları bölümü (5 adım, itiraz penceresi dahil)
  - Ürün karşılaştırma tablosu (hangi durumda hangisi uygun)
  - Fraud prevention açıklaması güven inşa eder
  - TBC Pay, BOG Pay, Visa/MC, banka havalesi ödeme yöntemleri
  - 6 SSS (sahte profil koruması dahil)

### Proje Durumu
```
[x] DB migration 001 — temel tablolar
[x] DB migration 002 — profil + etkileşim
[x] DB migration 003 — fraud prevention + pricing şema
[x] Memorial profil sayfası (/memorial/demo)
[x] Anasayfa Nav + CTA /pricing'e bağlandı
[x] /pricing sayfası 2 ürün modeli
[ ] Admin panel (belge inceleme arayüzü)
[ ] R2 media upload
[ ] Ödeme entegrasyonu (TBC Pay / BOG Pay)
[ ] Heir davet e-postaları (Resend)
[ ] Pending_verification → belge yükleme UI
```

### Kritik Kararlar / Notlar
- Anma Profili tek seferlik (no subscription) — aile kolayca anlayabilsin, hafıza yükü yok
- Yaşam Kasası aylık/yıllık abonelik — uzun vadeli ilişki, setup fee ile QR plaka maliyeti karşılanır
- `pending_verification` durumu profili yayından önce tutar, admin onayına kadar görünmez
- `claim_objections` tablosu 14 günlük pencereyi yönetir; objection_count trigger ile otomatik artar
- Belge GDPR uyumlu: doğrulama sonrası sistemden silindi açıklaması pricing sayfasına eklendi

### Nerede Kaldik
`/pricing` sayfası yeni 2 ürün modeli ile tamamlandı. DB şeması fraud prevention için hazır.
Sırada: admin paneli (belge inceleme), ödeme entegrasyonu, belge yükleme UI.

### Siradaki Adim
1. `/contact` sayfası veya form oluştur (pricing CTA'ları oraya bağlı)
2. Belge yükleme UI (`/dashboard/create-memorial` akışı)
3. Admin panel — pending_verification kuyruğu, belge onay/red
4. TBC Pay / BOG Pay ödeme entegrasyonu
5. R2 media upload (fotoğraf/video için)

---

## 2026-06-07 - Oturum 7: Ana Sayfa Premium Hero Gecisi

### Yapilanlar
- Ana sayfa hero bolumu gorsel arka planli ilk ekran yapisina cekildi.
- Hero icinde CTA, guven maddeleri ve sag tarafta mini urun durumu paneli eklendi.
- "Kasa baslat" ifadesi daha dogal olan "Ani profili olustur" cizgisine cekildi.
- Nasil calisir kartlari daha belirgin numarali ikon bloklariyla yenilendi.
- Ozellik kartlarina `lucide-react` ikonlari eklendi.
- Fiyat kartlarina check ikonlari ve hafif hover davranisi eklendi.
- Final CTA koyu kurumsal bant olarak yeniden tasarlandi.

### Proje Durumu
```
[x] Ana sayfa hero premium gorsel gecis
[x] Ozellik ve fiyat kartlari gorsel iyilestirme
[x] npm run lint temiz
[x] npm run build temiz
[x] Localhost ana sayfa HTTP 200
[x] Hero image optimized asset HTTP 200
[ ] Mobil/desktop screenshot ile manuel gorsel kontrol
[ ] Admin panel detaylari
[ ] R2 media upload
[ ] Resend heir davet e-postalari
[ ] Stripe odeme
```

### Kritik Kararlar / Notlar
- Landing hero artik split kart degil; gercek gorsel arka plan ustunde metin ve aksiyon tasiyor.
- Kart radius degerleri 8px cizgisinde tutuldu.
- Browser plugin kontrol araci hala gorunmedigi icin dogrulama lint/build ve localhost HTTP kontrolleriyle yapildi.

### Nerede Kaldik
Ana sayfa daha kurumsal ve daha premium bir ilk izlenime cekildi. Teknik dogrulama temiz.

### Siradaki Adim
1. Sayfayi desktop ve mobil viewportta gorsel kontrol et
2. Nav/hero kontrastini canli goruntuye gore ince ayarla
3. Admin panelini gercek operasyon paneli diline cek

## 2026-06-07 - Oturum 6: Landing i18n Encoding Temizligi

### Yapilanlar
- Next.js 16 dokumanindan Server/Client Component ve Image kullanimi kontrol edildi.
- Landing copy tek bir temiz veri yapisina indirildi ve TR/KA/RU/EN metinler UTF-8 olarak yeniden yazildi.
- Nav sozlukleri temizlendi:
  - Dil etiketleri duzeltildi
  - CTA "ucretsiz" iddiasindan "Basla" cizgisine cekildi
  - 100/200/400 Lari fiyatlandirma metniyle tutarlilik saglandi
- Nav icindeki manuel SVG ok ve check ikonlari `lucide-react` ikonlariyla degistirildi.
- Landing kart radius degerleri daha kurumsal ve kontrollu bir gorsel dile cekildi.
- Localhost ana sayfa HTTP 200 ve hero image asset HTTP 200 olarak dogrulandi.
- `src` altinda belirgin mojibake pattern taramasi yapildi.

### Proje Durumu
```
[x] Landing/i18n encoding temizligi
[x] Nav CTA ve dil etiketleri temiz
[x] npm run lint temiz
[x] npm run build temiz
[x] Localhost ana sayfa HTTP 200
[ ] i18n/Nav untracked dosyalar icin commit karari
[ ] Gorsel browser screenshot kontrolu
[ ] Admin panel detaylari
[ ] R2 media upload
[ ] Resend heir davet e-postalari
[ ] Stripe odeme
```

### Kritik Kararlar / Notlar
- Ucretsiz plan metni kaldirildi; fiyatlandirma yillik 100 Lari, Premium 200 Lari ve Lifetime 400 Lari olarak tutarli hale getirildi.
- Browser plugin icin beklenen Node execution araci bu oturumda gorunmedigi icin gorsel kontrol DOM/HTML ve HTTP kontrolleriyle sinirli kaldi.
- Port 3010 zaten doluydu; mevcut local server uzerinden kontrol yapildi.

### Nerede Kaldik
Landing metinleri ve nav artik temiz gorunuyor. Lint/build temiz. Localhost HTML yaniti Turkce karakterleri dogru donduruyor ve landing gorselleri erisilebilir.

### Siradaki Adim
1. In-app browser veya normal browser ile masaustu/mobil screenshot kontrolu yap
2. Admin paneli gercek tablo/form/list component diline cek
3. Untracked dosyalari commit kapsaminda netlestir
4. R2 media upload entegrasyonuna basla

## 2026-06-07 - Oturum 5: Kurumsal Tema ve Next 16 Temizligi

### Yapilanlar
- Next.js 16 dokumani `node_modules/next/dist/docs/` altindan kontrol edildi.
- Deprecated `src/middleware.ts`, `src/proxy.ts` dosyasina tasindi ve export adi `proxy` yapildi.
- Lint hatalari temizlendi; `npm run lint` temiz hale getirildi.
- `npm run build` temiz hale getirildi.
- QR route service role varsa analytics ve `redirect_count` yazacak sekilde guclendirildi.
- Public landing, login, dashboard/admin ve memorial yuzeyleri icin kurumsal tema katmani eklendi:
  - Acik zemin
  - Lacivert ana metin
  - Teal ana aksiyon rengi
  - Kontrollu altin vurgu
  - Beyaz/neutral admin panel hissi

### Proje Durumu
```
[x] Next 16 proxy uyumlulugu
[x] npm run lint temiz
[x] npm run build temiz
[x] QR analytics service role fallback
[x] Kurumsal renk temasi ilk gecis
[ ] UI metin/encoding temizligi
[ ] i18n/Nav untracked dosyalar icin karar
[ ] R2 media upload
[ ] Resend heir davet e-postalari
[ ] Stripe odeme
[ ] Admin panel detaylari
```

### Kritik Kararlar / Notlar
- Guven verici kurumsal dil icin koyu slate/amber agirligi azaltildi; lacivert + teal + sinirli altin paleti secildi.
- Mevcut component yapisini yikmadan route wrapper class'lari ve global tema override'lariyla hizli ilk gecis yapildi.
- Tarayici otomasyon araci bu oturumda Node REPL baglantisini expose etmedigi icin gorsel kontrol build/lint ile sinirli kaldi; local server `http://localhost:3010` zaten acik.

### Nerede Kaldik
Temel teknik kalite ve ilk kurumsal renk gecisi tamamlandi. Tasarim artik daha acik, daha kurumsal ve admin tarafinda daha dashboard odakli bir zemine cekildi.

### Siradaki Adim
1. Localhost uzerinde sayfalari gozle kontrol et ve renk kontrastlarini ince ayarla
2. Admin icin gercek tablo/form/list component dili tasarla
3. Landing metinlerini daha ciddi ve guven odakli copy ile yenile
4. Memorial sayfasini daha sakin, saygili ve premium bir gorsel dile cek
5. Encoding ve i18n kararini netlestir

## 2026-06-06 — Oturum 4: Build Hatalarının Çözümü

### Yapılanlar
- PowerShell ile yazılan 6 dosyadaki UTF-8 encoding hatası giderildi:
  - `src/app/dashboard/vault/[id]/page.tsx` — yeniden yazıldı (bash heredoc, UTF-8)
  - `src/app/dashboard/vault/[id]/media/page.tsx` — yeniden yazıldı
  - `src/app/dashboard/vault/[id]/biography/page.tsx` — yeniden yazıldı
  - `src/app/dashboard/vault/[id]/heirs/page.tsx` — yeniden yazıldı + schema düzeltmesi
  - `src/app/memorial/[slug]/page.tsx` — yeniden yazıldı
  - `src/app/dashboard/billing/page.tsx` — yeniden yazıldı
- TypeScript hataları düzeltildi:
  - `createVaultAction` → `Promise<void>` dönüş tipi (form action uyumluluğu)
  - `inviteHeirAction` → `Promise<void>` dönüş tipi
  - `heirs/page.tsx` → doğru schema alanları (`heir_email`, `access_level`, `invitation_expires_at`)
  - `api/qr/[hash]/route.ts` → `Promise.resolve(...).catch()` ile Supabase tip uyumu
- `npm run build` → temiz, 14 route, TypeScript hatası yok

### Proje Durumu
```
[x] PRD yazıldı (proje.md)
[x] GitHub remote bağlandı
[x] .env.local yapılandırıldı
[x] Supabase client dosyaları oluşturuldu
[x] Middleware auth guard kuruldu
[x] DB şeması uygulandı (10 tablo, RLS, trigger'lar)
[x] TypeScript tipleri oluşturuldu
[x] Landing page (3D animated, slate/blue design)
[x] Login page (Google OAuth + Magic Link)
[x] Auth callback + signout route
[x] Dashboard layout (sidebar)
[x] Dashboard page (vault list + storage bar)
[x] Vault CRUD server actions
[x] Vault detail, biography, media, heirs, settings sayfaları
[x] Memorial page (ISR, guestbook)
[x] QR redirect route (Edge Runtime)
[x] Billing page
[x] npm run build — temiz, 14 route
[ ] Google OAuth provider Supabase dashboard'da etkinleştirilmeli
[ ] SUPABASE_SERVICE_ROLE_KEY .env.local'a eklenmeli
[ ] Cloudflare R2 media upload entegrasyonu
[ ] Resend e-posta (heir davet bildirimleri)
[ ] Stripe ödeme entegrasyonu
[ ] Admin panel (vefat talepleri, moderasyon)
```

### Kritik Kararlar / Notlar
- PowerShell 5.1 `Set-Content -LiteralPath` emoji içeren dosyalarda UTF-16 LE yazar → build başarısız olur. Çözüm: bash heredoc (`cat > file << 'EOF'`) kullan.
- Server Action form `action` prop'u `void | Promise<void>` bekler; `{ error: string }` döndüren action'lar TypeScript hatasına yol açar.
- `heirs` tablosunda `full_name` alanı yok, `role` yerine `access_level` kullanılıyor.
- `subscriptions` tablosunda `plan_id` yok, `tier` kullanılıyor.

### Nerede Kaldık
`npm run build` temiz geçiyor. Tüm 14 route derleniyor. Proje local'de çalışmaya hazır. Supabase Auth'u aktif etmek için dashboard'a gidip Google OAuth provider'ı ve redirect URL'leri ayarlamak gerekiyor.

### Sıradaki Adım
1. Supabase dashboard → Authentication → Providers → Google OAuth'u etkinleştir
2. `.env.local`'e `SUPABASE_SERVICE_ROLE_KEY` ekle (Supabase dashboard → Settings → API)
3. `npm run dev` ile local'de test et — login flow'u dene
4. Cloudflare R2 bucket kur ve media upload component'ini yaz
5. Resend API key al ve heir davet e-postası template'ini yaz
6. Vercel'e ilk deploy (env vars ekle)

---

## 2026-06-06 — Oturum 2: Git + Supabase Bağlantısı

### Yapılanlar
- GitHub remote eklendi → `https://github.com/dijivexaWeb/themaradi.git`
- `master` branch push edildi (tüm commits GitHub'da)
- `.env.local` oluşturuldu → Supabase URL + anon key + service_role key
- `npm install @supabase/supabase-js @supabase/ssr` kuruldu
- `src/lib/supabase/client.ts` → browser client (Client Components için)
- `src/lib/supabase/server.ts` → server client + service client (Server Components/Actions için)
- `src/lib/supabase/middleware.ts` → session yenileme + /dashboard auth guard
- `src/middleware.ts` → Next.js middleware (tüm route'ları kapsar)
- TypeScript hatası yok (`tsc --noEmit` temiz)

### Proje Durumu
```
[x] PRD yazıldı (proje.md)
[x] GitHub remote bağlandı
[x] .env.local yapılandırıldı
[x] Supabase client dosyaları oluşturuldu
[x] Middleware auth guard kuruldu
[ ] DB şeması uygulandı (migration — Supabase'de tablolar yok)
[ ] Supabase Auth kuruldu (Google OAuth + Magic Link)
[ ] handle_new_user() trigger oluşturuldu
[ ] Landing page yazıldı
[ ] Dashboard iskelet kuruldu
```

### Kritik Kararlar / Notlar
- `createClient()` → browser/Client Component; `createServiceClient()` → admin işlemler (RLS bypass)
- Middleware her request'te session yeniliyor — bu Supabase SSR'ın zorunlu adımı
- `/dashboard` prefix'li tüm sayfalar login gerektiriyor
- `.env.local` gitignore'da (`.env*` kuralı) — asla commit edilmez

### Nerede Kaldık
Supabase client altyapısı kuruldu. Veritabanında henüz hiçbir tablo yok.

### Sıradaki Adım
1. Supabase'de DB migration: `proje.md` Bölüm 5'teki tüm tabloları uygula (profiles, vaults, heirs, media, guestbook, dynamic_qr, death_claims, audit_logs, qr_analytics, subscriptions)
2. Trigger'ları ekle: `handle_new_user()` + `handle_vault_transition()`
3. RLS politikalarını etkinleştir
4. Google OAuth provider'ı Supabase dashboard'da aç

---

## 2026-06-06 — Oturum 1: Proje Kurulumu & Dokümantasyon

### Yapılanlar
- `proje.md` oluşturuldu — tam kapsamlı PRD (8 bölüm, tüm DB şeması, API, güvenlik mimarisi)
- `devlog.md` oluşturuldu (bu dosya) — zorunlu log kuralı devreye alındı
- `CLAUDE.md` güncellendi — her oturum sonu log zorunluluğu eklendi
- Claude hafızasına proje bağlamı kaydedildi

### Proje Durumu
```
[x] PRD yazıldı (proje.md)
[ ] Supabase projesi oluşturuldu
[ ] DB şeması uygulandı (migration)
[ ] Supabase Auth kuruldu
[ ] Vercel deploy bağlantısı yapıldı
[ ] Landing page yazıldı
[ ] Dashboard iskelet kuruldu
```

### Teknik Stack (Karar Verildi)
- Next.js 16 kurulu (hedef: App Router, Server Components)
- Supabase: Auth + PostgreSQL + RLS
- Cloudflare R2: medya depolama
- Vercel: deploy + ISR + Edge
- Resend: e-posta, Stripe: ödeme

### Kritik Kararlar / Notlar
- QR sistemi: dinamik hash tabanlı — domain/URL değişikliğine karşı dayanıklı
- Death claim: 30 gün itiraz penceresi + çoklu executor onayı
- "Ölüm/vefat" kelimesi UI'da kullanılmaz → "süreklilik, güvenilir temsilci"
- Lifetime plan: aylık abonelik yerine tek seferlik ödeme (kullanıcı kaygısını önler)

### Nerede Kaldık
PRD tamamlandı, kod henüz yazılmadı. Proje boilerplate Next.js şablonu.

### Sıradaki Adım
**Hafta 1-2 görevleri:**
1. Supabase projesi oluştur → bağlantı string'lerini `.env.local`'e ekle
2. DB migration: `proje.md` Bölüm 5'teki tüm tabloları ve trigger'ları uygula
3. Supabase Auth kur: Google OAuth + Magic Link
4. `handle_new_user()` trigger'ı test et

---

<!-- YENİ OTURUMLAR YUKARIYA EKLENİR -->
