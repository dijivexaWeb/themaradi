# PROJECT_CONTEXT.md — The Eternal Memory (themaradi)

> Bu dosya projenin tek kaynak gerçeği (single source of truth) dokümantasyonudur.
> Her kod değişikliğinde ilgili bölüm güncellenmelidir.
> Emin olunmayan yerlere `KONTROL EDİLMELİ` notu eklenmiştir.

---

## 1. Proje Özeti

**The Eternal Memory**, iki katmanlı dijital miras platformudur:

| Ürün | Açıklama | Kim Kullanır |
|---|---|---|
| **Anı Biriktirme (Life Vault)** | Yaşayan kişinin ömür boyu gizli dijital kasası. Vasiyet, belgeler, özel notlar, varis yönetimi. Ölümden sonra varislere açılır. | Kişinin kendisi |
| **Anma Sayfası (Memorial Profile)** | Yakını ölen kişi için aile tarafından oluşturulan kamuya açık anma profili. Ömür boyu erişilebilir, güncellenebilir. | Ölen kişinin yakını |

**Hedef Pazar:** Gürcistan (öncelik), Türkiye, Kafkasya, diaspora  
**Para Birimi:** GEL (Gürcü Larisi)  
**Ödeme:** Banka havalesi (aktif), kart ödemesi (yakında)

### Ana Teknolojiler

| Teknoloji | Versiyon | Kullanım |
|---|---|---|
| Next.js | 16.2.7 | Full-stack framework (App Router) |
| React | 19.2.4 | UI |
| TypeScript | ^5 | Tip güvenliği |
| Supabase | ^2.107.0 | Auth + PostgreSQL + Storage + RLS |
| Tailwind CSS | ^4 | Stil sistemi |
| Resend | ^6.12.4 | E-posta gönderimi |
| Leaflet | ^1.9.4 | Harita (mezarlık konumu) |
| Lucide React | ^1.17.0 | İkon seti |
| Nanoid | ^5.1.11 | Benzersiz ID üretimi |

**Build:** `npm run dev` / `npm run build` / `npm start`  
**Server Actions bodySizeLimit:** 50MB (medya yükleme için)

---

## 2. Klasör Yapısı

```
themaradi/
├── src/
│   ├── app/                    # Next.js App Router — tüm sayfalar ve API'lar
│   │   ├── admin/              # Admin paneli (korumalı, role=admin)
│   │   ├── api/                # API route'ları
│   │   ├── auth/               # Auth callback ve signout
│   │   ├── contact/            # İletişim formu
│   │   ├── dashboard/          # Kullanıcı dashboard (korumalı)
│   │   ├── login/              # Giriş sayfası
│   │   ├── memorial/[slug]/    # Kamuya açık anma sayfası
│   │   ├── memorial/demo/      # Demo anma sayfası (statik)
│   │   ├── preview/[id]/       # Vault önizleme (token korumalı)
│   │   ├── pricing/            # Fiyatlandırma sayfası
│   │   ├── q/[code]/           # QR kod redirect (kısa link)
│   │   ├── satin-al/           # Satın alma akışı
│   │   ├── layout.tsx          # Root layout (LangProvider, CookieBanner)
│   │   └── page.tsx            # Landing sayfası
│   ├── components/             # Paylaşılan UI bileşenleri
│   │   └── landing/            # Landing'e özel bileşenler
│   ├── i18n/                   # Çok dil sistemi
│   │   ├── context.tsx         # LangProvider + useLang hook
│   │   ├── server.ts           # Server-side getTranslation()
│   │   ├── index.ts            # Lang tespiti, cookie/localStorage
│   │   ├── tr.ts               # Türkçe çeviriler
│   │   ├── ka.ts               # Gürcüce çeviriler
│   │   ├── ru.ts               # Rusça çeviriler
│   │   └── en.ts               # İngilizce çeviriler + LangDict tipi
│   └── lib/
│       ├── actions/            # Server action dosyaları (vault işlemleri)
│       ├── admin/              # Admin auth ve audit log
│       ├── email/              # Mail sistemi (Resend)
│       ├── supabase/           # Supabase client (server, client, middleware)
│       └── types/              # TypeScript tipleri (database.ts)
├── supabase/
│   └── migrations/             # SQL migration dosyaları (001-007)
├── public/                     # Statik dosyalar
├── next.config.ts              # Next.js konfigürasyonu
├── tailwind.config             # KONTROL EDİLMELİ — v4'te postcss.config.mjs üzerinden
├── package.json
└── PROJECT_CONTEXT.md          # Bu dosya
```

---

## 3. Sayfalar ve Route Yapısı

### Public Sayfalar

| Route | Dosya | Açıklama | DB Tablosu |
|---|---|---|---|
| `/` | `app/page.tsx` | Landing sayfası | `platform_settings` (fiyat) |
| `/memorial/[slug]` | `app/memorial/[slug]/page.tsx` | Kamuya açık anma profili | `vaults`, `media`, `vault_memories`, `vault_family_members`, `vault_audio_recordings`, `guestbook_entries`, `memorial_reactions` |
| `/memorial/demo` | `app/memorial/[slug]/MemorialPageClient.tsx` | Demo profil (statik) | — |
| `/pricing` | `app/pricing/page.tsx` | Fiyatlandırma | `platform_settings` |
| `/satin-al` | `app/satin-al/page.tsx` | Ürün seçimi | `platform_settings` |
| `/satin-al/anma` | `app/satin-al/anma/page.tsx` | Anma profili satın alma | `vaults`, `payments`, `profiles`, `user_consents` |
| `/satin-al/kasa` | `app/satin-al/kasa/page.tsx` | Life vault satın alma | `vaults`, `payments`, `profiles`, `user_consents` |
| `/contact` | `app/contact/page.tsx` | İletişim formu | `contact_messages` |
| `/q/[code]` | `app/q/[code]/route.ts` | QR kod kısa link redirect | `vaults`, `qr_scan_logs` |
| `/api/qr/[hash]` | `app/api/qr/[hash]/route.ts` | Dinamik QR redirect + analitik | `dynamic_qr`, `qr_analytics`, `vaults` |
| `/preview/[id]` | `app/preview/[id]/page.tsx` | Token korumalı önizleme | `vaults` + preview token |

### Auth Sayfalar

| Route | Dosya | Açıklama |
|---|---|---|
| `/login` | `app/login/page.tsx` | Kullanıcı girişi | 
| `/auth/callback` | `app/auth/callback/route.ts` | Supabase OAuth/email callback |
| `/auth/signout` | `app/auth/signout/route.ts` | Oturum kapatma |
| `/auth/update-password` | `app/auth/update-password/page.tsx` | Şifre güncelleme |

### Dashboard (Korumalı — Supabase Auth gerekli)

| Route | Dosya | Açıklama | DB Tablosu |
|---|---|---|---|
| `/dashboard` | `app/dashboard/page.tsx` | Dashboard ana sayfa (vault listesi) | `vaults` |
| `/dashboard/billing` | `app/dashboard/billing/page.tsx` | Abonelik/fatura | `payments`, `subscriptions` |
| `/dashboard/vault/[id]` | `app/dashboard/vault/[id]/page.tsx` | Vault genel görünüm | `vaults` |
| `/dashboard/vault/[id]/profil` | `.../profil/page.tsx` | Profil bilgileri düzenleme | `vaults` |
| `/dashboard/vault/[id]/biography` | `.../biography/page.tsx` | Biyografi düzenleme | `vaults` |
| `/dashboard/vault/[id]/anilar` | `.../anilar/page.tsx` | Anı ekleme/düzenleme | `vault_memories` |
| `/dashboard/vault/[id]/fotolar` | `.../fotolar/page.tsx` | Fotoğraf yönetimi | `media` |
| `/dashboard/vault/[id]/videolar` | `.../videolar/page.tsx` | Video yönetimi | `media` |
| `/dashboard/vault/[id]/media` | `.../media/page.tsx` | Genel medya yönetimi | `media` |
| `/dashboard/vault/[id]/ses-kayitlari` | `.../ses-kayitlari/page.tsx` | Ses kaydı yönetimi | `vault_audio_recordings` |
| `/dashboard/vault/[id]/aile` | `.../aile/page.tsx` | Aile üyesi yönetimi | `vault_family_members` |
| `/dashboard/vault/[id]/aile/tam-agac` | `.../tam-agac/page.tsx` | Tam aile ağacı görünümü | `vault_family_members` |
| `/dashboard/vault/[id]/heirs` | `.../heirs/page.tsx` | Varis yönetimi | `heirs` |
| `/dashboard/vault/[id]/vasiyet` | `.../vasiyet/page.tsx` | Vasiyet düzenleme | `vaults` |
| `/dashboard/vault/[id]/gizli-kasa` | `.../gizli-kasa/page.tsx` | Gizli içerikler | `vaults` (KONTROL EDİLMELİ) |
| `/dashboard/vault/[id]/belgeler` | `.../belgeler/page.tsx` | Belge yönetimi | `media` (document tipi) |
| `/dashboard/vault/[id]/taziye-defteri` | `.../taziye-defteri/page.tsx` | Taziye mesajları yönetimi | `guestbook_entries` |
| `/dashboard/vault/[id]/settings` | `.../settings/page.tsx` | Yayın ve QR ayarları | `vaults`, `dynamic_qr` |
| `/dashboard/vault/[id]/onizleme` | `.../onizleme/page.tsx` | Sayfa önizlemesi | — |

### Admin Panel (Korumalı — profiles.role = 'admin' gerekli)

| Route | Dosya | Açıklama | DB Tablosu |
|---|---|---|---|
| `/admin` | `app/admin/page.tsx` | Admin dashboard (istatistikler) | `vaults` (rpc), `claim_objections`, `contact_messages`, `payments`, `alive_alerts`, `admin_audit_logs` |
| `/admin/verifications` | `app/admin/verifications/page.tsx` | Vault doğrulama kuyruğu | `vaults`, `profiles`, `payments` |
| `/admin/memorials` | `app/admin/memorials/page.tsx` | Tüm vault/memorial listesi | `vaults`, `profiles` |
| `/admin/memorials/[id]` | `app/admin/memorials/[id]/page.tsx` | Vault detayı ve durum değişikliği | `vaults`, `payments` |
| `/admin/memorials/[id]/preview` | `.../preview/page.tsx` | Vault önizlemesi (admin) | `vaults` |
| `/admin/objections` | `app/admin/objections/page.tsx` | Vefat talebi itirazları | `claim_objections`, `death_claims`, `vaults` |
| `/admin/heirs` | `app/admin/heirs/page.tsx` | Varis listesi | `heirs`, `vaults` |
| `/admin/kasa` | `app/admin/kasa/page.tsx` | Ödeme yönetimi | `payments` |
| `/admin/guestbook` | `app/admin/guestbook/page.tsx` | Taziye defteri moderasyonu | `guestbook_entries` |
| `/admin/alive-alerts` | `app/admin/alive-alerts/page.tsx` | "Ben yaşıyorum" bildirimleri | `alive_alerts` |
| `/admin/contacts` | `app/admin/contacts/page.tsx` | İletişim formu mesajları | `contact_messages` |
| `/admin/inbox` | `app/admin/inbox/page.tsx` | Gelen e-posta kutusu | `inbound_emails` |
| `/admin/email` | `app/admin/email/page.tsx` | E-posta ayarları (Resend API key) | `platform_settings` |
| `/admin/users` | `app/admin/users/page.tsx` | Kullanıcı yönetimi | `profiles` |
| `/admin/gdpr` | `app/admin/gdpr/page.tsx` | GDPR talepleri | `gdpr_requests` |
| `/admin/audit` | `app/admin/audit/page.tsx` | Admin işlem geçmişi | `admin_audit_logs` |
| `/admin/settings` | `app/admin/settings/page.tsx` | Platform ayarları (fiyat, banka, ödeme gateway) | `platform_settings`, `pricing_exemptions` |
| `/admin/login` | `app/admin/login/page.tsx` | Admin girişi | — |
| `/admin/signout` | `app/admin/signout/route.ts` | Admin çıkışı | — |

### API Routes

| Route | Dosya | Açıklama |
|---|---|---|
| `POST /api/email/inbound` | `app/api/email/inbound/route.ts` | Resend inbound webhook — gelen maili `inbound_emails`'e yazar |
| `GET /api/qr/[hash]` | `app/api/qr/[hash]/route.ts` | Dinamik QR redirect + analitik kaydı (Edge runtime) |
| `GET /api/geocode` | `app/api/geocode/route.ts` | Adres → koordinat geocoding (KONTROL EDİLMELİ — hangi servis?) |

---

## 4. Database Yapısı

**Database:** Supabase PostgreSQL  
**URL:** `https://qcxsqirqlepjebkezgud.supabase.co`  
**Project ID:** `qcxsqirqlepjebkezgud`  
**RLS:** Tüm tablolarda aktif  

### Bağlantı Noktaları

| Client | Dosya | Kullanım |
|---|---|---|
| `createClient()` | `src/lib/supabase/server.ts` | Cookie tabanlı, kullanıcı oturumu, RLS aktif |
| `createServiceClient()` | `src/lib/supabase/server.ts` | Service role, RLS bypass, admin işlemleri |
| `createClient()` (browser) | `src/lib/supabase/client.ts` | Client-side işlemler |
| `updateSession()` | `src/lib/supabase/middleware.ts` | Session yenileme — **KONTROL EDİLMELİ:** middleware.ts dosyası bulunamadı, bu fonksiyonu çağıran bir giriş noktası olmalı |

### Tablolar

| Tablo | Migration | Açıklama | RLS Politikaları |
|---|---|---|---|
| `profiles` | 001 | Kullanıcı profilleri (auth.users'a bağlı) | Kullanıcı kendi profilini yönetir |
| `subscriptions` | 001 | Abonelikler (yearly/lifetime) | Kullanıcı görüntüler, service_role yönetir |
| `vaults` | 001+002 | Ana vault/memorial varlığı | Sahip yönetir, public_memorial herkese görünür, aktif varisler görüntüler |
| `heirs` | 001+002 | Vault varisleri | Vault sahibi yönetir |
| `media` | 001+003 | Fotoğraf/video/ses/belge | Vault sahibi yönetir, public medya herkese görünür |
| `guestbook` | 001 | **Eski tablo** — KONTROL EDİLMELİ (guestbook_entries ile çakışma?) | — |
| `dynamic_qr` | 001 | Dinamik QR kayıtları | Aktif QR herkese görünür, oluşturan yönetir |
| `qr_analytics` | 001 | QR tarama analitikleri | service_role yönetir |
| `death_claims` | 001 | Vefat doğrulama talepleri | Talep eden görüntüler/ekler, service_role yönetir |
| `audit_logs` | 001 | Vault değişiklik geçmişi | Vault sahibi okur, service_role yönetir |
| `notifications` | 002 | Kullanıcı bildirimleri | Alıcı okur, service_role yönetir |
| `vault_memories` | KONTROL EDİLMELİ | Anılar (kronoloji/featured/genel) | KONTROL EDİLMELİ |
| `vault_family_members` | KONTROL EDİLMELİ | Aile üyeleri | KONTROL EDİLMELİ |
| `vault_audio_recordings` | KONTROL EDİLMELİ | Ses kayıtları | KONTROL EDİLMELİ |
| `guestbook_entries` | KONTROL EDİLMELİ | Taziye mesajları (yeni tablo) | KONTROL EDİLMELİ |
| `memorial_reactions` | KONTROL EDİLMELİ | Mum/çiçek/dua reaksiyonları | KONTROL EDİLMELİ |
| `payments` | KONTROL EDİLMELİ | Ödeme kayıtları | KONTROL EDİLMELİ |
| `platform_settings` | KONTROL EDİLMELİ | Admin anahtar-değer ayarları (fiyat, mail API key, banka bilgisi) | service_role yönetir |
| `contact_messages` | KONTROL EDİLMELİ | İletişim formu mesajları | KONTROL EDİLMELİ |
| `claim_objections` | KONTROL EDİLMELİ | Vefat talebi itirazları | KONTROL EDİLMELİ |
| `alive_alerts` | KONTROL EDİLMELİ | "Ben yaşıyorum" bildirimleri | KONTROL EDİLMELİ |
| `gdpr_requests` | KONTROL EDİLMELİ | GDPR talepleri | KONTROL EDİLMELİ |
| `admin_audit_logs` | KONTROL EDİLMELİ | Admin işlem geçmişi | KONTROL EDİLMELİ |
| `inbound_emails` | KONTROL EDİLMELİ | Gelen e-postalar (Resend webhook) | KONTROL EDİLMELİ |
| `pricing_exemptions` | KONTROL EDİLMELİ | Fiyat muafiyetleri | KONTROL EDİLMELİ |
| `user_consents` | KONTROL EDİLMELİ | KVKK rıza kayıtları | KONTROL EDİLMELİ |
| `qr_scan_logs` | KONTROL EDİLMELİ | QR tarama logları (kısa link) | KONTROL EDİLMELİ |

### Vaults Tablosu — Kritik Alanlar

```
vaults.status:
  'hidden_vault'         → Anı biriktirme (gizli kasa), kullanıcı aktif
  'pending_verification' → Ödeme/doğrulama bekleniyor
  'private_memorial'     → Anma sayfası (özel erişim)
  'public_memorial'      → Anma sayfası (herkese açık)
  'suspended'            → Askıya alındı

vaults.product_type:
  'life_vault'           → Anı Biriktirme ürünü
  'memorial_profile'     → Anma Sayfası ürünü

vaults.vault_origin:
  'self'                 → Kişinin kendisi oluşturdu
  'family'               → Yakını oluşturdu
```

### Migrations Durumu

| Dosya | İçerik | Canlıya Uygulandı mı? |
|---|---|---|
| `001_initial_schema.sql` | Temel tablolar, triggerlar | Evet |
| `002_profile_and_interactions.sql` | Vaults genişletme, notifications, heir trigger | Evet |
| `003_media_bucket_metadata.sql` | Storage bucket, media genişletme | Evet |
| `004_vault_personal_details.sql` | profession, hobbies | Evet |
| `005_vault_favorite_song.sql` | favorite_song_title/url, audio MIME tipleri | Evet |
| `006_vault_donation_preference.sql` | donation_preference | Evet |
| `007_vault_donation_url.sql` | donation_url | **KONTROL EDİLMELİ — canlıya uygulanmamış olabilir** |

### Triggerlar

| Trigger | İşlev |
|---|---|
| `on_auth_user_created` | Yeni kullanıcı kaydında `profiles` tablosuna kayıt oluşturur |
| `on_vault_status_change` | `hidden_vault → public_memorial` geçişinde `transition_date` ve `audit_log` kaydeder |
| `on_heir_death_confirmation` | 2+ varis ölümü onayladığında vault'u `public_memorial`'a geçirir |
| `set_profiles_updated_at` | `profiles.updated_at` otomatik güncellenir |
| `set_vaults_updated_at` | `vaults.updated_at` otomatik güncellenir |

---

## 5. Mail Sistemi

### Servis: Resend

**Ana dosyalar:**
- `src/lib/email/index.ts` — `sendEmail()` fonksiyonu, API key `platform_settings` tablosundan okunur
- `src/lib/email/templates.ts` — HTML e-posta şablonları

**Gelen Mail (Inbound):**
- Resend → `POST /api/email/inbound?token=SECRET` webhook
- Token `platform_settings.inbound_webhook_secret` alanında saklanır
- Gelen mail `inbound_emails` tablosuna yazılır
- Thread algılama: aynı gönderici + benzer konu → `thread_id` bağlanır
- Inbox kategorileri: `support`, `partner`, `privacy`, `other` (alıcı adresine göre)

**Admin Gelen Kutusu:**
- `/admin/inbox` — `inbound_emails` tablosunu listeler
- `admin/inbox/actions.ts` — admin yanıt gönderme

### Mevcut E-posta Şablonları

| Şablon | Fonksiyon | Ne Zaman Gönderilir |
|---|---|---|
| Yeni taziye mesajı | `newGuestbookEntryEmail()` | Ziyaretçi taziye mesajı bıraktığında |
| Mesaj onaylandı | `messageApprovedEmail()` | Admin taziye mesajını onayladığında |
| Anma kaydı doğrulama | `memorialSignupConfirmEmail()` | Anma satın alımında e-posta doğrulama |
| Life vault kaydı doğrulama | `vaultSignupConfirmEmail()` | Vault satın alımında e-posta doğrulama |
| Taziye alındı | `condolenceReceivedEmail()` | Ziyaretçiye otomatik alındı bildirimi |
| Test maili | `testEmail()` | Admin panelinden test amaçlı |

### Mail Akışı — Satın Alma

```
Kullanıcı formu doldurur (satin-al/anma veya satin-al/kasa)
→ purchaseMemorialAction() / purchaseVaultAction() server action çalışır
→ Supabase'de kullanıcı hesabı oluşturulur (service_role.generateLink)
→ Vaults tablosuna vault kaydı eklenir (status: 'pending_verification')
→ Payments tablosuna ödeme kaydı eklenir
→ memorialSignupConfirmEmail() / vaultSignupConfirmEmail() gönderilir
→ Admin ödeme gelince /admin/kasa'dan onaylar
→ Vault aktif olur
```

### Eksik Mail Şablonları (YAPILACAK — Anma Sayfası için)

- Tanık doğrulama maili (token'lı onay linki)
- Tanık onayladı bildirimi
- Anma doğrulandı/reddedildi bildirimi
- İtiraz alındı otomatik yanıtı

### Kullanılan ENV Değişkenleri (Mail)

```
KONTROL EDİLMELİ — .env.example dosyası yok
API key platform_settings tablosundan okunuyor (admin panelden ayarlanıyor)
```

---

## 6. Dil Sistemi

### Yapı: Custom i18n (next-intl değil)

**Desteklenen Diller:**
| Kod | Dil | Bayrak | Öncelik |
|---|---|---|---|
| `ka` | Gürcüce (ქართული) | KA | 1. öncelik (hedef pazar) |
| `tr` | Türkçe | TR | 2. öncelik |
| `ru` | Rusça (Русский) | RU | 3. öncelik |
| `en` | İngilizce | EN | 4. öncelik |

### Dosyalar

| Dosya | Açıklama |
|---|---|
| `src/i18n/en.ts` | İngilizce çeviriler — **`LangDict` tipi `typeof en`'den türetilir (tek kaynak)** |
| `src/i18n/tr.ts` | Türkçe çeviriler |
| `src/i18n/ka.ts` | Gürcüce çeviriler |
| `src/i18n/ru.ts` | Rusça çeviriler |
| `src/i18n/index.ts` | `detectLang()`, `saveLang()`, `langs` listesi, `dictionaries` map |
| `src/i18n/context.tsx` | `LangProvider`, `useLang()` hook — **sadece Client Component'lerde** |
| `src/i18n/server.ts` | `getTranslation()` — cookie'den dil okur, **sadece Server Component'lerde** |

### Tip Sistemi

`LangDict` tipi `en.ts`'deki nesnenin `typeof`'undan türetilir:

```ts
// src/i18n/en.ts
const en = { nav: {...}, landing: {...}, dashboard: {...}, ... }
export type LangDict = typeof en
export default en
```

Bu yüzden **yeni çeviri anahtarı eklerken her zaman önce `en.ts`'e ekle.** TypeScript diğer dil dosyalarındaki eksiklikleri otomatik olarak derleyici hatası olarak gösterir.

### Dil Tespiti (Öncelik Sırası)

```
1. Cookie: tm_lang  ← Login sayfasında saveLang(l) ile set edilir
2. localStorage: lang (legacy / manuel değiştirme için fallback)
3. Tarayıcı dili: navigator.language
4. Varsayılan: 'tr'
```

### Kullanım Kalıpları

**Client Component (Landing, Nav, login sayfası dil seçici):**
```tsx
const { t, lang, setLang } = useLang()
// setLang('en') → cookie + localStorage'a kaydeder, re-render tetikler
```

**Server Component (Dashboard layout, vault sayfaları, tüm dashboard):**
```tsx
const { t, lang } = await getTranslation()
// tm_lang cookie'sini okur, varsayılan 'tr'
```

**Dinamik Tarih Formatlama (Dashboard vault sayfası):**
```ts
const dateLocale =
  lang === 'ka' ? 'ka-GE' :
  lang === 'ru' ? 'ru-RU' :
  lang === 'en' ? 'en-US' : 'tr-TR'

new Date(someDate).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long' })
```

### Mevcut Kullanım Durumu

| Alan | Durum |
|---|---|
| Landing sayfası | ✅ Tam i18n (`useLang()`) |
| Nav / Header | ✅ Dil seçici mevcut (`useLang()`) |
| Dashboard `layout.tsx` | ✅ `getTranslation()` ile server-side |
| Dashboard `page.tsx` | ✅ `getTranslation()` ile server-side |
| Dashboard `vault/[id]/page.tsx` | ✅ `getTranslation()` + dinamik tarih locale |
| Login sayfası dil seçimi | ✅ `useLang()` / `setLang()` mekanizması aktif — **ama çeviriler lokal `authCopy` objesinde, merkezi LangDict'e bağlı değil** |
| Satın alma formları | ❌ Sadece Türkçe |
| Diğer dashboard alt sayfaları | ⚠️ Kısmen — her sayfa kendi i18n entegrasyonuna ihtiyaç duyuyor |
| Admin panel | ❌ Sadece Türkçe (kasıtlı) |
| Anma sayfası (public) | ❌ Sadece Türkçe |

### Yeni Dashboard Sayfasına i18n Eklerken (Standart Prosedür)

```ts
// 1. Sayfayı async function yap
export default async function MyPage() {

// 2. Import ekle
import { getTranslation } from '@/i18n/server'

// 3. Sayfanın başında çöz
const { t, lang } = await getTranslation()

// 4. Hardcoded Türkçe metinleri t.dashboard.xxx ile değiştir

// 5. Yeni key gerekiyorsa: önce en.ts, sonra tr/ka/ru/en.ts
```

### Yeni Dil Eklemek İçin

1. `src/i18n/` altına `xx.ts` oluştur (tüm `LangDict` alanlarını doldur)
2. `src/i18n/index.ts`'e ekle: `langs` listesi + `dictionaries` map + `Lang` tipi
3. `context.tsx`'te herhangi bir değişiklik gerekmez

### Yeni Çeviri Namespace'i Eklemek İçin

1. **`src/i18n/en.ts`'e ekle** (TypeScript tip kaynağı)
2. `tr.ts`, `ka.ts`, `ru.ts`'ye aynı yapıyı ekle — TypeScript eksikleri hata olarak gösterir

---

## 7. Admin Panel

**Route:** `/admin/*`  
**Koruma:** `requireAdmin()` — her admin sayfasında çağrılır  
**Koşul:** `profiles.role === 'admin'`  
**Giriş:** `/admin/login` (Supabase Auth ile ayrı giriş — KONTROL EDİLMELİ: normal kullanıcı oturumundan bağımsız mı?)

### Sidebar Menüsü (AdminSidebar.tsx)

```
Dashboard → /admin
Doğrulama → /admin/verifications
Kasa / Ödemeler → /admin/kasa
Memoriallar → /admin/memorials
İtirazlar → /admin/objections
Ziyaretçi Defteri → /admin/guestbook
Varisler → /admin/heirs
Ben Yaşıyorum → /admin/alive-alerts
Email Ayarları → /admin/email
Gelen Kutusu → /admin/inbox
İletişim Formu → /admin/contacts
Kullanıcılar → /admin/users
GDPR → /admin/gdpr
Audit Log → /admin/audit
Ayarlar → /admin/settings
```

### Kritik Admin Actions (src/app/admin/actions.ts)

| Action | Açıklama |
|---|---|
| `approveVault()` | Vault'u `public_memorial`'a çeker |
| `rejectVault()` | Vault'u `suspended`'a çeker |
| `changeVaultStatus()` | Vault durumunu manuel değiştirir |
| `resolveObjection()` | İtirazı çözüme kavuşturur |
| `updateContactStatus()` | İletişim mesajı durumunu günceller |
| `updatePaymentStatus()` | Ödeme durumunu günceller |
| `resolveAliveAlert()` | "Ben yaşıyorum" bildirimini çözer |
| `resolveGdprRequest()` | GDPR talebini çözer |
| `moderateGuestbook()` | Taziye mesajını onayla/reddet/spam |
| `addManualPayment()` | Manuel ödeme ekler |
| `updatePricingSettings()` | Fiyatları günceller |
| `updateBankSettings()` | Banka bilgilerini günceller |
| `addPricingExemption()` | Fiyat muafiyeti tanır |

### Admin Audit Log

Her admin işleminde `logAdminAction()` çağrılır → `admin_audit_logs` tablosuna yazılır.

---

## 8. Tasarım Sistemi

### CSS Framework: Tailwind CSS v4

**Konfigürasyon:** `postcss.config.mjs` üzerinden, ayrı `tailwind.config.ts` yok (v4 davranışı)  
**Global CSS:** `src/app/globals.css`

### Renk Paleti

| Değişken/Değer | Renk | Kullanım |
|---|---|---|
| `#0c3327`, `#103b2c`, `#173d31` | Koyu yeşil | Birincil renk, hero arka planlar |
| `#fbf8f1`, `#fffdf8`, `#f7f2e9` | Krem/bej | Sayfa arka planı |
| `#c7a76f`, `#b08340` | Altın | Vurgu, ikincil renk |
| `#e6dccb`, `#e1d5c3` | Açık bej | Kenarlıklar |
| `#4c463c`, `#665d50` | Kahverengi | Gövde metni |
| `#8a7a64` | Koyu bej | Yardımcı metin |

### Fontlar

- **Gövde:** Geist (Google Fonts, `--font-geist-sans`)
- **Başlıklar (anma sayfaları):** `font-serif` (tarayıcı varsayılan serif)

### Tema Sınıfları

```
.theme-corporate   → Landing sayfası için
.theme-memorial    → Dashboard için
```

### İkon Seti

Tüm projede `lucide-react` kullanılır.

### Bileşenler (src/components/)

| Bileşen | Açıklama |
|---|---|
| `BrandLogo.tsx` | Marka logosu (light/dark varyantı) |
| `CemeteryLocationPicker.tsx` | Leaflet harita ile konum seçici |
| `CookieBanner.tsx` | GDPR çerez bildirimi |
| `FamilyTreeCanvas.tsx` | Canvas üzerinde aile ağacı görselleştirme |
| `IdleLogout.tsx` | Hareketsizlik sonrası otomatik çıkış |
| `ImageUploadInput.tsx` | Resim yükleme input bileşeni |
| `TurnstileWidget.tsx` | Cloudflare Turnstile bot koruması |
| `landing/LocalizedLanding.tsx` | i18n'li landing sayfası içeriği |
| `landing/Nav.tsx` | Dil seçicili navigasyon |
| `landing/hero-vault.tsx` | Landing hero bölümü |

### Yeni Bileşen Yazarken

- Renk değerlerini doğrudan Tailwind class olarak yaz (CSS değişkeni değil)
- `lucide-react` ikonlarını kullan
- Admin bileşenleri: `slate-*` renk paleti (koyu tema)
- Public/user bileşenleri: krem/yeşil/altın paleti

---

## 9. API Route ve Server Action Yapısı

### API Routes

| Route | Method | Dosya | Açıklama | Auth |
|---|---|---|---|---|
| `/api/email/inbound` | POST | `app/api/email/inbound/route.ts` | Resend inbound webhook | Token (platform_settings) |
| `/api/qr/[hash]` | GET | `app/api/qr/[hash]/route.ts` | Dinamik QR redirect | Yok (edge) |
| `/api/geocode` | GET | `app/api/geocode/route.ts` | Adres geocoding | KONTROL EDİLMELİ |
| `/q/[code]` | GET | `app/q/[code]/route.ts` | QR kısa link redirect | Yok |
| `/auth/callback` | GET | `app/auth/callback/route.ts` | Supabase auth callback | — |
| `/auth/signout` | POST | `app/auth/signout/route.ts` | Oturum sonlandırma | Yok |
| `/admin/signout` | POST | `app/admin/signout/route.ts` | Admin oturumu sonlandırma | Yok |

### Server Actions

| Dosya | Action'lar | Kullanılan Sayfalar |
|---|---|---|
| `app/satin-al/actions.ts` | `purchaseMemorialAction`, `purchaseVaultAction` | `/satin-al/anma`, `/satin-al/kasa` |
| `app/login/actions.ts` | `checkTurnstileAction` | `/login` |
| `app/contact/actions.ts` | İletişim formu gönderimi | `/contact` |
| `app/admin/actions.ts` | Tüm admin işlemleri (vault, ödeme, itiraz vb.) | Admin sayfaları |
| `app/admin/email/actions.ts` | E-posta ayarları kaydetme | `/admin/email` |
| `app/admin/inbox/actions.ts` | Admin yanıt gönderme | `/admin/inbox` |
| `app/admin/users/actions.ts` | Kullanıcı rol değiştirme, banlama | `/admin/users` |
| `app/admin/verifications/actions.ts` | Vault onay/red | `/admin/verifications` |
| `app/admin/login/actions.ts` | Admin giriş | `/admin/login` |
| `src/lib/actions/profile.ts` | Profil güncelleme | Dashboard profil sayfası |
| `src/lib/actions/media.ts` | Medya yükleme/silme | Dashboard medya sayfaları |
| `src/lib/actions/memories.ts` | Anı ekleme/düzenleme/silme | Dashboard anılar sayfası |
| `src/lib/actions/family.ts` | Aile üyesi yönetimi | Dashboard aile sayfası |
| `src/lib/actions/heirs.ts` | Varis yönetimi | Dashboard heirs sayfası |
| `src/lib/actions/audio.ts` | Ses kaydı yönetimi | Dashboard ses sayfası |
| `src/lib/actions/documents.ts` | Belge yönetimi | Dashboard belgeler sayfası |
| `src/lib/actions/condolences.ts` | Taziye işlemleri | Dashboard taziye sayfası |
| `src/lib/actions/vault.ts` | Vault genel işlemleri | Dashboard genel |

---

## 10. Auth / Yetki Sistemi

### Kullanıcı Girişi

- **Servis:** Supabase Auth (e-posta + şifre)
- **Giriş sayfası:** `/login`
- **Callback:** `/auth/callback` (e-posta doğrulama, password reset)
- **Çıkış:** `POST /auth/signout`
- **Session yenileme:** `src/lib/supabase/middleware.ts` → `updateSession()`

### Middleware

**KONTROL EDİLMELİ:** `src/middleware.ts` (root seviyesi) bulunamadı. `updateSession()` fonksiyonu mevcut ama çağrıldığı yer belirsiz. Dashboard ve admin koruması şu anda layout seviyesinde yapılıyor (`redirect('/login')` ile).

### Yetki Seviyeleri

| Rol | Nasıl Belirlenir | Yetkiler |
|---|---|---|
| `anon` | Giriş yapmamış | Public sayfaları görüntüler, taziye/reaksiyon bırakır |
| `authenticated` | Supabase Auth oturumu | Dashboard, vault yönetimi |
| `admin` | `profiles.role = 'admin'` | Tüm admin panel |
| `heir` | `heirs` tablosunda aktif kayıt | Vault'a sınırlı erişim |

### Admin Koruması

```ts
// Her admin sayfasında:
await requireAdmin()  // src/lib/admin/auth.ts
// → profiles.role !== 'admin' ise /admin/login'e redirect
```

### Vault Sahipliği Koruması (RLS)

Her vault işleminde Supabase RLS otomatik kontrol eder:
```sql
USING (auth.uid() = owner_id)
```

---

## 11. Environment Değişkenleri

| Değişken | Açıklama | Kullanıldığı Yer |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL | Tüm Supabase client'ları |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public) | Tüm Supabase client'ları |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (gizli) | `createServiceClient()`, admin işlemleri |
| `NEXT_PUBLIC_APP_URL` | Uygulama base URL | Root layout metadata |
| `NEXT_PUBLIC_SITE_URL` | Site URL (satın alma callback için) | `satin-al/actions.ts` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key | `TurnstileWidget.tsx` |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret | `src/lib/turnstile.ts` |
| Resend API Key | E-posta gönderimi | `platform_settings` tablosunda saklanır (admin panelden ayarlanır, .env değil) |
| Banka bilgileri | Ödeme yönlendirme | `platform_settings` tablosunda saklanır |
| `inbound_webhook_secret` | Resend inbound webhook token | `platform_settings` tablosunda saklanır |

> **NOT:** Resend API key ve diğer platform ayarları `.env` dosyasında değil, `platform_settings` DB tablosunda tutulur. Admin `/admin/email` ve `/admin/settings` sayfalarından yönetilir.

---

## 12. Önemli İş Akışları

### Yeni Sayfa Ekleme

1. `src/app/[route]/page.tsx` dosyasını oluştur
2. Public ise nav'a link ekle (gerekirse `src/components/landing/Nav.tsx`)
3. Dashboard ise `src/app/dashboard/layout.tsx`'deki sidebar'a ekle (i18n key ile)
4. İlgili dil dosyalarına (`tr.ts`, `ka.ts`, `ru.ts`, `en.ts`) çeviri ekle
5. Bu dosyada (PROJECT_CONTEXT.md) "Sayfalar ve Route Yapısı" bölümünü güncelle

### Yeni Admin Alanı Ekleme

1. `src/app/admin/[route]/page.tsx` oluştur
2. Sayfanın başına `await requireAdmin()` ekle
3. `src/app/admin/AdminSidebar.tsx`'deki `NAV_ITEMS` dizisine ekle
4. Server action varsa `src/app/admin/[route]/actions.ts` oluştur
5. Action'larda `requireAdmin()` + `logAdminAction()` çağır

### Yeni Dil / Çeviri Ekleme

1. `src/i18n/en.ts`'deki `LangDict` tipini güncelle (kaynak tip)
2. Tüm 4 dil dosyasına yeni alanı ekle
3. Yeni dil ekleniyorsa: `index.ts`'te `langs` ve `dictionaries`'e ekle

### Mail Sisteminde Değişiklik

1. Yeni şablon: `src/lib/email/templates.ts`'e fonksiyon ekle
2. Göndermek için `sendEmail()` çağır (`src/lib/email/index.ts`)
3. API key admin panelinden `/admin/email`'den ayarlanır
4. Inbound webhook: Resend dashboard'dan `/api/email/inbound` URL'ini yapılandır

### Database Tablosu Ekleme

1. `supabase/migrations/` dizinine `00X_açıklama.sql` dosyası ekle
2. RLS politikalarını da migration içine yaz
3. `src/lib/types/database.ts` tiplerini güncelle
4. Supabase dashboard'dan veya `supabase db push` ile canlıya uygula
5. Bu dosyada "Database Yapısı" bölümünü güncelle

### Tasarım Bileşeni Ekleme

1. `src/components/` altına dosyayı ekle
2. Renk paletine sadık kal (yeşil/krem/altın)
3. Admin bileşenler için slate renk paletini kullan
4. `lucide-react` ikonlarını kullan

---

## 13. AI İçin Çalışma Kuralları

Bu projede işlem yapacak AI agent aşağıdaki kurallara uymak **ZORUNDADIR:**

1. **İşe başlamadan önce PROJECT_CONTEXT.md dosyasını oku.** Özellikle çalışacağın bölümün ilgili kısmını.

2. **Kod değişikliği yaparsan ilgili bölümü güncelle:**
   - Mail sistemi değişirse → Bölüm 5 güncelle
   - Database değişirse → Bölüm 4 güncelle
   - Yeni sayfa/route eklenirse → Bölüm 3 güncelle
   - Dil sistemi değişirse → Bölüm 6 güncelle
   - Yeni bileşen eklenirse → Bölüm 8 güncelle
   - Yeni env değişkeni eklenirse → Bölüm 11 güncelle

3. **Emin olmadığın şeyi tahmin etme** — `KONTROL EDİLMELİ` yaz.

4. **Kullanıcı istemedikçe production kodunda geniş refactor yapma.**

5. **Renk paletine ve font yapısına sadık kal.** Rastgele renk ekleme.

6. **Admin sayfalar için her zaman `requireAdmin()` çağır.**

7. **Server action'lar için her zaman Zod validation kullan** (`src/app/admin/actions.ts` örneğini incele).

8. **Yeni migration yazmadan önce mevcut migration dosyalarını oku** — çakışmayı önle.

9. **Mail gönderimi için `platform_settings`'teki API key'i kullan** — `.env`'den değil.

10. **i18n:** Yeni kullanıcıya görünür metin ekliyorsan mutlaka 4 dile çeviri ekle.

---

## 14. Kontrol Edilmesi Gerekenler

| Alan | Belirsizlik |
|---|---|
| `src/middleware.ts` | Root seviyesinde yok gibi görünüyor. `updateSession()` nasıl çağrılıyor? Auth koruması sadece layout seviyesinde mi? |
| `guestbook` vs `guestbook_entries` | İki tablo var gibi görünüyor. Hangi aktif, hangisi eski? |
| `007_vault_donation_url.sql` | Canlı ortama uygulandı mı? Önceki oturum verisine göre uygulanmamış olabilir. |
| `vault_memories`, `vault_family_members`, `vault_audio_recordings` | Bu tabloların migration dosyaları bulunamadı (001-007 arası yok). Doğrudan Supabase dashboard'dan mı oluşturuldu? |
| `memorial_reactions`, `guestbook_entries` | Migration dosyası yok, oluşturulma yeri belirsiz. |
| `payments`, `platform_settings`, `contact_messages` vb. | Migration dosyası bulunamadı. |
| `admin_audit_logs` | `audit_logs` tablosuyla fark nedir? İkisi de var gibi görünüyor. |
| `/api/geocode` | Hangi geocoding servisi kullanılıyor? API key var mı? |
| `profiles.email` | `auth.users.email` ile nasıl senkronize ediliyor? |
| Admin giriş sistemi | Normal user oturumuyla aynı Supabase session mi, yoksa ayrı mı? |
| `src/proxy.ts` | Bu dosyanın amacı nedir? |
| Cloudflare R2 | Dosya yüklemeler için kullanılıyor mu yoksa Supabase Storage mu? `vault-media` bucket Supabase'de görünüyor. |
| `src/lib/preview-token.ts` | Token korumalı önizleme nasıl çalışıyor? |

---

## 15. Değişiklik Geçmişi

| Tarih | Değişiklik |
|---|---|
| 2026-06-10 | İlk PROJECT_CONTEXT.md oluşturuldu. Tüm proje dosyaları analiz edildi. Sayfa, database, mail, dil, admin ve tasarım yapısı dokümante edildi. |
