# themaradi — Dijital Miras Kasası & Anı Sayfası
## Sistem Mimarisi ve Proje Dokümantasyonu

---

## 1. KULLANICI ROLLERİ VE ERİŞİM NOKTALARI

### Planlayıcı (Yaşayan Kullanıcı)
- Kasa oluşturur, anı ekler, varis atar
- Erişim: Kimlik doğrulu (Supabase Auth)
- Yetki: Kendi kasası üzerinde tam kontrol
- Akış: Kayıt → Onboarding wizard → Kasa oluştur → Anı ekle → Varis ata

### Varis / Executor
- Vefat sonrası kasa yönetimi ve moderasyon
- Erişim: Kademeli yetki (executor / contributor / viewer)
- Hayattayken: Sadece bildirim alır, kasaya erişemez
- Vefat sonrası: Death claim başlatır → admin onayı → yönetim paneli açılır

### Ziyaretçi
- QR okur, anı sayfasını görüntüler, mesaj bırakır
- Erişim: Anonim (üye olmadan)
- Akış: QR tara → 302 redirect → anı sayfası → ziyaretçi defteri formu

### Partner (Mermerci)
- QR üretir, asenkron eşleştirir
- Erişim: B2B2C partner hesabı
- Akış: Partner paneli → QR hash üret → fiziksel mermere kazdır → aile sonradan vault ile eşleştirir

---

## 2. FRONTEND KATMANI — Next.js 15 App Router

> ⚠️ Orijinal dokümanda eksik bölüm — aşağıdaki yapı analiz sonrası tanımlanmıştır.

### Landing Page
- Render: Static / ISR (force-static, revalidate: 86400)
- İçerik: Loss aversion copy, CTA, pricing, güven sinyalleri
- Hedef: Ücretsiz kayıt dönüşümü
- Route: /

### Kasa Dashboard
- Render: Auth only (Server Component ağırlıklı)
- İçerik: Anı ekleme, medya galerisi, varis yönetimi, kasa durumu
- Route: /dashboard, /dashboard/vault/[id], /dashboard/heirs

### Anı Sayfası
- Render: ISR + CDN (revalidate: 3600)
- İçerik: Biyografi, medya galerisi, ziyaretçi defteri, QR hedefi
- Erişim: Herkese açık (anonim dahil)
- Route: /memorial/[vault-slug]

### Onboarding Wizard
- Render: Client Component
- İçerik: Gamified, drip, quick-win akışı
- Adımlar: 1 fotoğraf yükle → haftalık anı soruları → streak sistemi → varis atama
- Route: /onboarding

### QR Redirect
- Render: Route Handler (Edge Runtime)
- Akış: /api/qr/[hash] → DB lookup → HTTP 302 → /memorial/[vault-slug]
- Analitik: Her okumada timestamp, user_agent, IP coğrafyası loglanır

---

## 3. ADMIN PANEL — Kritik Boşluk

> ⚠️ Orijinal dokümanda hiç ele alınmamış — öncelikli geliştirme alanı

### Vefat Doğrulama
- Belge inceleme, onay/ret, audit log
- Mod: Manuel + AI ön tarama
- Akış: Varis belge yükler → AI OCR tarar → insan inceleme kuyruğu → onay/ret → bildirim
- Fraud koruması: 30 gün itiraz süresi, çoklu varis onayı (2/3 majority)

### İçerik Moderasyon
- Ziyaretçi mesajları, spam, hukuki şikayetler
- Mod: Kuyruk tabanlı
- Akış: Yeni mesaj → is_approved=false → executor bildirimi → onayla/reddet
- AI: Açık spam/nefret söylemi otomatik filtreleme

### Fraud & Güvenlik
- Sahte ölüm tespiti, kasa ele geçirme alertleri
- Mod: Otomatik kural motoru
- Kurallar: Çok sayıda death claim → bot tespiti, tek IP çoklu varis ataması → fraud sinyali
- Alert: Şüpheli işlem → platform durdur → admin bildir

### Platform Analitiği
- Churn, QR tıklama, dönüşüm, gelir metrikleri
- Mod: Dashboard
- Metrikler: DAU/MAU, onboarding tamamlanma %, QR coğrafya haritası, MRR, Lifetime satış

---

## 4. SERVER ACTIONS & API KATMANI

### Kasa İşlemleri
- Tip: Server Action
- Fonksiyonlar:
  - createVaultAction() → INSERT INTO vaults (status=hidden_vault)
  - updateBiographyAction() → XSS sanitize, Markdown/HTML
  - transitionToMemorial() → death_claim oluştur, admin kuyruğuna at
  - deleteVaultAction() → GDPR Right to be Forgotten, CASCADE sil
  - exportVaultData() → ZIP export, GDPR data portability

### Medya Yönetimi
- Tip: R2 Worker + Server Action
- Akış:
  1. generatePresignedUrl() → RLS kontrol → R2 geçici URL
  2. İstemci R2'ye direkt upload (sunucu bant genişliği yok)
  3. Cloudflare Worker tetiklenir → WebP/AVIF dönüşüm → EXIF temizleme → 3 boyut üret
  4. Webhook → public.media tablosuna metadata yaz

### Varis İşlemleri
- Tip: Kritik Akış (Server Action)
- Fonksiyonlar:
  - inviteHeirAction() → e-posta davet → heirs tablosuna pending kayıt
  - revokeAccessAction() → DELETE FROM heirs → RLS anında güncellenir
  - distributeShamisKeys() → Shamir's Secret Sharing → her executor bir parça alır

---

## 5. VERİTABANI KATMANI — Supabase / PostgreSQL

### public.profiles
- Bağlantı: auth.users ile 1:1
- Sütunlar: id UUID, full_name, avatar_url, created_at, locale, notification_prefs
- Trigger: handle_new_user() → auth INSERT → profiles otomatik oluştur
- RLS: Kullanıcı sadece kendi profilini okur/günceller

### public.vaults
- Durum makinesi: hidden_vault → private_memorial → public_memorial
- Sütunlar: id UUID, owner_id FK, status, biography, transition_date, encryption_key_hash, data_protection_flag
- Trigger: handle_vault_transition() → status değişince transition_date yazar, audit_logs'a INSERT
- RLS:
  - hidden_vault: sadece owner
  - public_memorial: herkes okur (anon dahil)
  - executor varisi: yönetim işlemleri

### public.heirs
- Yetki katmanları: executor / contributor / viewer
- Sütunlar: id UUID, vault_id FK, heir_email, heir_profile_id FK, access_level, status, invitation_token, shamir_key_share, accepted_at
- RLS: auth.uid() IN (SELECT heir_profile_id FROM heirs WHERE vault_id = vaults.id)
- Kritik: Önemli işlemler için minimum 2 executor onayı gerekli

### public.media
- Sütunlar: id UUID, vault_id FK, uploader_id FK, media_url, thumb_url, medium_url, media_type, is_public, file_size, taken_at, ai_tags
- Kural: ON DELETE CASCADE (kasa silinince medya da silinir)
- Depolama: R2 bucket, orijinal + WebP sürümleri ayrı path

### public.guestbook
- Sütunlar: id UUID, vault_id FK, visitor_name, visitor_email, message, is_approved (default false), ip_hash, created_at, rejected_reason
- Akış: Yeni mesaj → is_approved=false → executor bildirim → onay/ret

### public.dynamic_qr
- Sütunlar: qr_hash PRIMARY KEY, target_vault_id FK (nullable), created_by, created_at, activated_at, redirect_count
- Asenkron: QR üretilir → vault_id=NULL → aile sonradan eşleştirir → UPDATE
- Analitik: Her redirect → qr_analytics tablosuna log

### ⚠️ Eksik Tablolar (Tanımlanması Gereken)
- public.audit_logs → tüm kritik işlemlerin geri döndürülemez kaydı
- public.death_claims → vefat bildirimi süreci, belgeler, onay durumu
- public.encryption_keys → Shamir parçaları, şifrelenmiş anahtar depolama
- public.ai_memory_profiles → transkript, duygu analizi, anı etiketleri
- public.subscriptions (detaylı) → Stripe webhook uyumlu, storage_used_bytes
- public.qr_analytics → her QR okumasının logu
- public.notifications → varis ve kullanıcı bildirimleri
- public.death_verification_docs → yüklenen ölüm belgeleri ve doğrulama durumu

---

## 6. HARİCİ SERVİSLER & ENTEGRASYONLAR

### Cloudflare R2
- Amaç: Medya depolama
- Avantaj: Sıfır egress fee (AWS S3'e göre maliyet avantajı)
- Kullanım: Orijinal + WebP/AVIF dönüşüm, thumbnail, medium, large

### Resend / SendGrid
- Amaç: E-posta altyapısı
- Kullanım: Varis davet, drip kampanya (haftalık anı soruları), bildirimler

### AI Servisleri
- Amaç: OCR, ses transkripsiyonu, anı kürasyon
- ⚠️ Durum: Tanımlanmamış — sağlayıcı ve entegrasyon belirsiz
- Gereksinimler: Belge OCR (ölüm belgesi tarama), ses-metin dönüşüm, fotoğraf etiketleme

### Ölüm Doğrulama
- Amaç: Resmi belge doğrulama
- ⚠️ Durum: Tanımlanmamış
- Seçenekler: Gürcistan e-Devlet, AB eIDAS, manuel belge inceleme

### Ödeme
- Amaç: Abonelik ve Lifetime plan tahsilatı
- ⚠️ Durum: Tanımlanmamış — Stripe veya Paddle
- Planlar: Free, Premium (aylık/yıllık), Lifetime (tek seferlik)

---

## 7. KRİTİK GÜVENLİK BOŞLUKLARI

### Client-Side Encryption (CSE)
- Sorun: Supabase şu an verilere erişebilir — "bize güven" modeli
- Çözüm: Web Crypto API + AES-256-GCM, şifreleme tarayıcıda yapılır
- Anahtar: PBKDF2 ile kullanıcı parolasından türetilir, sunucuda saklanmaz

### Shamir's Secret Sharing
- Sorun: CSE varsa vefat sonrası anahtar kime geçecek?
- Çözüm: Anahtar N parçaya bölünür, K parça bir araya gelince açılır
- Örnek: 3 executor varisi, 2'si onaylayınca kasa açılır

### Fraud Koruması
- Sahte ölüm bildirimi: 30 gün itiraz penceresi + kasa sahibine SMS/e-posta
- Kasa ele geçirme: Çoklu varis onayı zorunluluğu (N-of-M)
- Bot tespiti: Rate limiting, anormal death claim pattern'leri

---

## 8. COĞRAFYA & PAZAR STRATEJİSİ

- İlk pazar: Gürcistan (Tbilisi, Batumi, Kutaisi)
- Hedef segment: 35-50 yaş, dijital okuryazar, Batı'ya açık
- Diaspora: Yurt dışındaki Gürcistanlı topluluk (Batı Avrupa, Türkiye, Rusya)
- Rakip yok: Bu segmentte Kafkasya'da mevcut rakip bulunmuyor
- Köprü pozisyon: Türkiye + Orta Doğu + Rusya pazarlarına giriş üssü

---

## 9. GELİR MODELİ

| Katman | Model | Açıklama |
|--------|-------|----------|
| Free | Freemium | Temel kasa, 1GB depolama |
| Premium | Abonelik (aylık/yıllık) | Sınırsız medya, AI özellikler |
| Lifetime | Tek seferlik | Güven kancası, yüksek bilet |
| B2B Mermerci | Partner API + SaaS lisans | QR üretim, dashboard |
| B2B Sigorta | White-label | Hayat sigortası poliçe eki |
| B2B Noterlik | Referral + API | Dijital vasiyetname yönlendirme |

---

## 10. TECH STACK

- Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth + RLS + Triggers)
- Depolama: Cloudflare R2
- CDN: Cloudflare / Vercel Edge
- Deploy: Vercel (Checklife Aesthetics team)
- E-posta: Resend
- Ödeme: Stripe (TBD)
- AI: TBD

---

_Son güncelleme: 2026 | themaradi projesi_