# themaradi — Geliştirme Günlüğü (DevLog)

> Her oturum sonunda Claude bu dosyayı günceller.
> Format: tarih → ne yapıldı → nerede kalındı → sıradaki adım.

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
