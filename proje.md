# themaradi — Dijital Miras Kasası & Anı Sayfası Platformu
## Kapsamlı Proje Dokümantasyonu (PRD)

---

## GİRİŞ

### Projenin Amacı

Dijital çağda insanlar yaşamları boyunca devasa bir dijital varlık biriktirir: fotoğraflar, videolar, ses kayıtları, sosyal medya anıları, finansal hesaplar, kripto varlıklar, e-posta arşivleri, bulut belgeleri. Ancak bu varlıkların büyük çoğunluğu şifreler ve platform politikaları arkasına kilitlidir. Kişi vefat ettiğinde bu dijital miras ya tamamen yok olur ya da sevdiklerinin erişemeyeceği bir dijital hiçliğe karışır.

themaradi bu sorunu iki katmanlı bir çözümle adresler:

**Katman 1 — Dijital Kasa (Yaşayan Kullanıcı İçin)**
Kullanıcı hayattayken anılarını, belgelerini, sesini, hikayesini güvenli ve şifreli bir kasada biriktirir. Bu kasa tamamen gizlidir; sadece kullanıcının kendisi erişebilir.

**Katman 2 — Anı Sayfası (Vefat Sonrası İçin)**
Kullanıcı vefat ettiğinde, yetkili varisler kasayı bir anı sayfasına dönüştürür. Bu sayfa fiziksel mezar taşına kazınan QR kodla bağlanır. Mezarlığa gelen ziyaretçi QR'ı okutunca saniyeler içinde vefat edenin hayat hikayesine, fotoğraflarına ve ses kayıtlarına ulaşır.

### Neden Bu Proje

- Dünyada 4.9 milyar internet kullanıcısı var, hepsi dijital varlık biriktiriyor
- Her yıl milyonlarca insan vefat ediyor, dijital mirasları yönetimsiz kalıyor
- Facebook'ta 30 milyon vefat etmiş kullanıcının aktif hesabı bulunuyor
- Gürcistan, Türkiye ve Kafkasya pazarında bu alanda sıfır rakip var
- Fiziksel mezar taşı + dijital anı sayfası entegrasyonu dünyada nadir

### Hedef Kitle

**Birincil:** 35-55 yaş arası, dijital okuryazar, aile odaklı bireyler  
**İkincil:** Yaşlı ebeveynleri için dijital miras hazırlamak isteyen 30-45 yaş arası çocuklar  
**B2B:** Mermer atölyeleri, cenaze levazımatçıları, noterler, sigorta şirketleri  
**Diaspora:** Yurt dışındaki Gürcistanlı, Türk ve Kafkasya kökenli topluluklar

---

## GELİŞME

---

## BÖLÜM 1 — KULLANICI ROLLERİ VE ERİŞİM MİMARİSİ

### 1.1 Planlayıcı (Yaşayan Kullanıcı)

**Kimdir:** Kendi dijital mirasını veya bir aile yakınının mirasını hazırlayan kişi.

**Erişim Seviyesi:** Tam kontrol — kendi kasası üzerinde okuma, yazma, silme, varis atama.

**Kimlik Doğrulama:** Supabase Auth üzerinden Google OAuth, Apple Sign-In veya Magic Link.

**Temel Akış:**
1. Sisteme kayıt → handle_new_user() trigger → public.profiles otomatik oluşur
2. Onboarding wizard → ilk anı eklenir (quick win)
3. Kasa oluşturulur → status = hidden_vault
4. Haftalık anı soruları → drip e-posta kampanyası
5. Varis atanır → inviteHeirAction() → e-posta daveti
6. Medya yüklenir → R2 presigned URL → Cloudflare Worker işler

**Kritik Güvenlik Notu:**
Şu anki mimaride Supabase veritabanına erişimi olan herkes (Supabase çalışanları dahil) teorik olarak verileri görebilir. Gerçek gizlilik için Client-Side Encryption (CSE) zorunludur. Veriler tarayıcıda AES-256-GCM ile şifrelenir, sunucu yalnızca encrypted blob görür.

---

### 1.2 Varis / Executor

**Kimdir:** Planlayıcının güvendiği, vefat sonrası kasayı yönetecek kişi.

**Erişim Seviyeleri:**
- **executor:** Death claim başlatabilir, anı sayfasını açabilir, tüm yönetim işlemlerini yapabilir
- **contributor:** İçerik ekleyebilir, medya yükleyebilir, ziyaretçi mesajlarını onaylayabilir
- **viewer:** Sadece okuyabilir, hiçbir şeyi değiştiremez

**Hayattayken Durum:**
Varis sisteme kayıtlıdır ama kasaya erişemez. RLS policy gereği hidden_vault statüsündeki kasaları göremez. Sadece "sen X kişinin kasasında varissin" bildirimi alır.

**Vefat Sonrası Akış:**
1. Executor varisi death claim başlatır
2. Ölüm belgesi sisteme yüklenir
3. Diğer executor varisler onaylar (çoklu imza — N-of-M)
4. 30 günlük itiraz penceresi açılır (kasa sahibi hâlâ hayattaysa itiraz edebilir)
5. Admin paneli insan incelemesi yapar
6. Onay → handle_vault_transition() trigger çalışır → status = public_memorial
7. Executor'ın ekranında "Anı Sayfası Yönetim Paneli" açılır

**Fraud Koruması:**
Sahte ölüm bildirimi yapılabilir. Bunu önlemek için:
- Kasa sahibinin kayıtlı e-posta ve telefon numarasına "İtiraz Et" linki gönderilir
- 30 gün içinde itiraz gelirse tüm süreç dondurulur
- Çoklu varis onayı zorunlu (tek kişi yapamaz)

---

### 1.3 Ziyaretçi

**Kimdir:** Fiziksel mezarlıkta QR okuyan veya anı sayfası linkini alan herhangi bir kişi.

**Erişim:** Tamamen anonim. Üye olmaya gerek yok, uygulama indirmeye gerek yok.

**Akış:**
1. Akıllı telefonla mezar taşındaki QR kodu okur
2. /api/qr/[hash] → DB'den target_vault_id alınır → HTTP 302 redirect
3. /memorial/[vault-slug] → ISR sayfa CDN'den milisaniyeler içinde yüklenir
4. Biyografiyi okur, fotoğraf galerisinde gezinir, ses kayıtlarını dinler
5. İsterse ziyaretçi defterine anonim mesaj bırakır (executor onayına gider)

**Teknik Detay:**
Anı sayfaları Vercel/Cloudflare Edge CDN üzerinden statik olarak servis edilir. Veritabanı sorgusu olmaz. 3G bağlantıda bile 1 saniyenin altında yüklenir. Mezarlıkların zayıf ağ kapsaması hesaba katılmış.

PWA (Progressive Web App) sayesinde sayfa bir kez yüklendikten sonra internet kopsa da temel içerikler görünmeye devam eder.

---

### 1.4 Partner (Mermerci / B2B2C)

**Kimdir:** Mezar taşı üreten atölyeler, cenaze levazımatçıları, defin hizmetleri.

**Değer Önerisi:**
Partner sisteme girer, fiziksel mermere kazınacak QR kodu anında üretir. Müşterinin dijital anı sayfası henüz hazır olmasa bile mermer üretime başlayabilir. Aile daha sonra QR'ı kendi sayfasıyla eşleştirir.

**Asenkron İş Akışı:**
1. Mermerci partner paneline girer
2. "Yeni QR Üret" → sistem benzersiz hash üretir → dynamic_qr tablosuna target_vault_id=NULL kaydedilir
3. QR kodu indirilir, mermere lazer kazıma yapılır
4. Mermer mezarlığa yerleştirilir
5. Aile platformda kasasını oluşturur → "QR Eşleştir" → hash girilir → UPDATE dynamic_qr SET target_vault_id = ...
6. Artık QR çalışır

**Neden Kritik:**
Eğer mermere direkt URL kazınırsa (örn: themaradi.com/memorial/ahmet-yilmaz) ve ileride domain değişirse veya URL yapısı değişirse, onlarca yıl sürmesi gereken mezar taşı işlevsiz kalır. Dinamik QR bu riski tamamen ortadan kaldırır.

---

## BÖLÜM 2 — FRONTEND MİMARİSİ

### 2.1 Landing Page (/)

**Render Stratejisi:** Static generation / force-static  
**Yenileme:** Revalidate: 86400 (günde bir)  
**Hedef:** Ücretsiz kayıt dönüşümü

**Sayfa Yapısı:**

*Hero Bölümü:*
Güçlü bir görsel (yaşlı eller, fotoğraf albümü, mezarlık gibi nostaljik ama karanlık olmayan bir imge) ve ana mesaj. Kopya "ölüm" kelimesini içermez, "süreklilik" ve "miras" üzerine kuruludur.

Örnek başlık: "Hayatınız boyunca biriktirdiğiniz her şey — hikayeler, sesler, anlar — şimdi güvende."

*Nasıl Çalışır:*
3 adımlı basit açıklama: Oluştur → Doldur → Güvende Kal

*Güven Sinyalleri:*
- Uçtan uca şifreleme rozeti
- GDPR uyumlu ibaresi
- Uptime garantisi
- Erken kullanıcı sayısı (sosyal kanıt)

*Pricing:*
Free / Premium / Lifetime — Lifetime planı "Geleceği Güvenceye Alan Tek Seferlik Ödeme" olarak konumlandırılır. Aylık abonelik ölüm bağlamında stres yaratır ("ben öldükten sonra ödeme alınamazsa veriler silinir mi?" kaygısı). Lifetime bu kaygıyı yıkar.

*B2B CTA:*
"Mezar taşı atölyeniz için partner olun" — ayrı bölüm.

---

### 2.2 Onboarding Wizard (/onboarding)

**Render:** Client Component  
**Amaç:** Blank canvas paralysis'i kırmak — kullanıcı boş kasayla karşılaşıp ne yapacağını bilemez ve terk eder.

**Adım 1 — Quick Win:**
"Tek bir fotoğraf yükle ve altına tarih yaz." Başka hiçbir şey istenmez. Yükleme tamamlanınca: "İlk anınızı ölümsüzleştirdiniz! Kasanızın temeli atıldı." animasyonu. Bu küçük başarı (endowed progress effect) kullanıcıyı bağlar.

**Adım 2 — Drip Soru Sistemi:**
Haftada bir otomatik e-posta: "Çocukluğunuzda en güzel yaz tatili neredeydi?" Kullanıcı e-postayı yanıtlar → cevap otomatik olarak kasadaki biyografi sekmesine eklenir. Platforma girmeye gerek yok.

**Adım 3 — Streak (Seri Sistemi):**
3 hafta üst üste anı sorusunu yanıtlayana "Anı Koruyucusu" rozeti verilir. Seri kırılmadan 2 gün önce hatırlatıcı bildirim: "Serinizi bozmayın, sadece bir anı uzaktasınız."

**Adım 4 — Varis Atama (İlk Gün Değil):**
Kullanıcı platformu benimsedikten sonra (2. hafta) "Güvenilir Temsilci Ekle" olarak sunulur. "Varis" veya "ölüm" kelimesi kullanılmaz. Apple'ın "Legacy Contact" terminolojisine benzer bir dil.

---

### 2.3 Kasa Dashboard (/dashboard)

**Render:** Auth only — Server Component ağırlıklı  
**Erişim:** Sadece giriş yapmış kullanıcı

**Alt Sayfalar:**
- /dashboard → genel bakış, kasa özeti, son eklenenler, streak durumu
- /dashboard/vault/[id] → tek kasa yönetimi
- /dashboard/vault/[id]/biography → biyografi düzenleme (Markdown editor)
- /dashboard/vault/[id]/media → medya galerisi, yükleme
- /dashboard/vault/[id]/heirs → varis listesi, davet, yetki değiştirme
- /dashboard/vault/[id]/settings → kasa ayarları, QR eşleştirme, kasa silme
- /dashboard/billing → abonelik yönetimi, plan değiştirme

**Kritik UI Elementleri:**
- Kasa durum göstergesi: hidden_vault (kilitli ikonu) veya public_memorial (herkese açık rozeti)
- Depolama kullanım çubuğu: X GB / Y GB kullanıldı
- Varis sayısı ve onay durumları
- Son aktivite zaman çizelgesi

---

### 2.4 Anı Sayfası (/memorial/[vault-slug])

**Render:** ISR — revalidate: 3600  
**Erişim:** Herkese açık (anonim dahil)  
**Önbellek:** Vercel/Cloudflare Edge CDN

**Sayfa Yapısı:**
- Hero: Kapak fotoğrafı, isim, doğum-ölüm tarihleri, kısa başlık
- Biyografi: Markdown render, tam hayat hikayesi
- Medya Galerisi: is_public=true olan fotoğraf ve videolar, lightbox
- Ses Kayıtları: Kişinin kendi sesiyle anlattığı anılar, inline player
- Belgeler: Kamuya açık belge ve mektuplar
- Ziyaretçi Defteri: Anonim mesaj formu (onay bekleyen)
- Paylaşım: WhatsApp, sosyal medya, link kopyala

**Performans Hedefleri:**
- LCP (Largest Contentful Paint): < 1.5 saniye
- 3G bağlantıda ilk yükleme: < 2 saniye
- Offline mod: PWA Service Worker ile temel içerik cache

---

### 2.5 QR Yönlendirme (/api/qr/[hash])

**Tip:** Route Handler — Edge Runtime  
**Gecikme Hedefi:** < 50ms

**Akış:**
```
GET /api/qr/ABC987
→ SELECT target_vault_id FROM dynamic_qr WHERE qr_hash = 'ABC987'
→ INSERT INTO qr_analytics (hash, timestamp, user_agent, ip_geo)
→ HTTP 302 Location: /memorial/[vault-slug]
```

**Neden 302 (Geçici) ve 301 (Kalıcı) Değil:**
301 tarayıcı cache'e alır ve bir daha sunucuya gelmez. 302 her seferinde sunucuya gelir → analitik kaydı mümkün olur → hedef değiştirilebilir kalır.

---

## BÖLÜM 3 — ADMIN PANEL

> Bu bölüm orijinal dokümanda tamamen eksikti. Platform canlıya çıkmadan önce zorunludur.

### 3.1 Vefat Doğrulama Paneli (/admin/death-claims)

**Akış:**
1. Executor varisi death claim başlatır, belge yükler
2. AI ön tarama: OCR ile belge okunur, geçerlilik kontrol edilir
3. İnsan inceleme kuyruğuna düşer
4. Admin inceler: onayla / reddet / ek belge iste
5. Onay → vault transition trigger çalışır
6. Ret → varis bilgilendirilir, sebep belirtilir

**Fraud Önleme Mekanizmaları:**
- Kasa sahibine otomatik "İtiraz Et" e-postası gönderilir
- 30 günlük itiraz penceresi (bu sürede hiçbir şey değişmez)
- Birden fazla executor varisi varsa çoğunluk onayı gerekir
- Şüpheli durum: aynı IP'den çok sayıda death claim → otomatik dondur, alert

**Audit Log:**
Her onay/ret kriptografik imzayla audit_logs tablosuna yazılır. GDPR gereği geri döndürülemez kayıt.

---

### 3.2 İçerik Moderasyon Paneli (/admin/moderation)

**Ziyaretçi Mesajları:**
is_approved=false olan mesajlar executor'ın kendi panelinde görünür. Admin sadece hukuki şikayetlere müdahil olur.

**Hukuki Şikayetler:**
- GDPR "Unutulma Hakkı" talepleri
- Hakaret/iftira bildirimleri
- Telif hakkı ihlali şikayetleri
Her biri ayrı bir şikayet tipi olarak kategorize edilir ve SLA süresi belirlenir.

**AI Moderasyon:**
Açıkça uygunsuz içerikler (spam, nefret söylemi, kimlik avı linkleri) otomatik filtrelenir. Gri alanlar insan incelemesine gönderilir.

---

### 3.3 Fraud & Güvenlik Paneli (/admin/security)

**Otomatik Kurallar:**
- Kısa sürede çok sayıda death claim → bot sinyali → hesap dondur
- Aynı IP'den farklı kasalara varis ataması → fraud sinyali → alert
- Anormal giriş davranışı (yeni cihaz, yeni konum) → 2FA zorla

**Alert Sistemi:**
Kritik olaylar anlık bildirim olarak admin ekranında görünür. Severity seviyeleri: info / warning / critical.

---

### 3.4 Platform Analitiği (/admin/analytics)

**Kullanıcı Metrikleri:**
DAU/MAU oranı, onboarding tamamlanma yüzdesi, streak uzunluğu dağılımı, churn rate, medyan anı ekleme sıklığı

**QR Metrikleri:**
Toplam QR okuma sayısı, tekil ziyaretçi, coğrafya haritası, pik saatler (dini bayramlar, anma tarihleri özellikle yüksek trafik)

**Gelir Metrikleri:**
MRR, ARR, Lifetime plan satış sayısı, B2B partner geliri, churn nedeniyle kaybedilen gelir

**Operasyonel Metrikler:**
Bekleyen death claim sayısı, ortalama inceleme süresi, moderasyon kuyruğu uzunluğu

---

## BÖLÜM 4 — SERVER ACTIONS & API

### 4.1 Kasa İşlemleri

```typescript
// Yeni kasa oluştur
createVaultAction(ownerId: string, forSelf: boolean)
→ INSERT INTO vaults (owner_id, status='hidden_vault')
→ Returns: vault UUID

// Biyografi güncelle
updateBiographyAction(vaultId: string, content: string)
→ XSS sanitization (DOMPurify)
→ UPDATE vaults SET biography = sanitizedContent
→ Versiyon geçmişi için vault_versions tablosuna INSERT

// Anı sayfasına geçiş başlat
initiateTransitionAction(vaultId: string, deathCertUrl: string)
→ INSERT INTO death_claims (vault_id, claimant_id, document_url)
→ Diğer executor varislere bildirim gönder
→ Kasa sahibine "İtiraz Et" e-postası gönder

// GDPR - Kasa sil
deleteVaultAction(vaultId: string)
→ Soft delete: deleted_at timestamp yaz
→ 30 gün sonra hard delete cronjob tetiklenir
→ CASCADE: tüm media, heirs, guestbook silinir
→ R2 bucket'tan dosyalar temizlenir

// GDPR - Veri dışa aktar
exportVaultDataAction(vaultId: string)
→ Tüm veriler toplanır
→ ZIP olarak paketlenir
→ Presigned download URL döner
```

### 4.2 Medya Yönetimi

```typescript
// Presigned upload URL üret
generatePresignedUrlAction(vaultId: string, fileType: string, fileSize: number)
→ Yetki kontrol (RLS)
→ Depolama limiti kontrol
→ R2 presigned URL üret (15 dakika geçerli)
→ Returns: { uploadUrl, fileKey }

// Yükleme tamamlandı (webhook)
POST /api/webhooks/r2-upload
→ İmza doğrula (R2 webhook secret)
→ Cloudflare Worker zaten işledi (WebP, EXIF, boyutlar)
→ INSERT INTO media (vault_id, media_url, thumb_url, ...)
```

**Cloudflare Worker İşlem Sırası:**
1. Orijinal dosya R2'ye yüklendi
2. Worker tetiklenir
3. WebP/AVIF dönüşüm (kayıpsız sıkıştırma)
4. EXIF metadata temizleme (GPS, kamera bilgisi)
5. 3 boyut üretimi: thumbnail (200px), medium (800px), large (1920px)
6. Hepsi ayrı R2 path'lere kaydedilir
7. Webhook tetiklenir → uygulama DB güncellenir

### 4.3 Varis İşlemleri

```typescript
// Varis davet et
inviteHeirAction(vaultId: string, email: string, accessLevel: string)
→ INSERT INTO heirs (vault_id, heir_email, access_level, status='pending')
→ Resend ile davet e-postası gönder
→ Davet token oluştur (7 gün geçerli)

// Varis erişimini iptal et
revokeHeirAccessAction(heirId: string)
→ DELETE FROM heirs WHERE id = heirId
→ RLS anında güncellenir (sonraki istekte erişim kesilir)
→ Varisi bilgilendirme e-postası

// Shamir anahtar dağıtımı (CSE aktifse)
distributeKeySharesAction(vaultId: string, executorIds: string[])
→ AES-256 master key N parçaya bölünür (Shamir's Secret Sharing)
→ Her executor'a şifrelenmiş parça gönderilir
→ encryption_keys tablosuna hash kaydedilir (plaintext asla)
```

---

## BÖLÜM 5 — VERİTABANI MİMARİSİ

### 5.1 Tablo Şeması (Tam)

**public.profiles**
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  locale VARCHAR(10) DEFAULT 'ka', -- Gürcüce varsayılan
  notification_email BOOLEAN DEFAULT true,
  notification_push BOOLEAN DEFAULT true,
  two_factor_enabled BOOLEAN DEFAULT false,
  account_delete_requested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**public.vaults**
```sql
CREATE TABLE public.vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug VARCHAR(100) UNIQUE, -- /memorial/[slug] için
  display_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'hidden_vault'
    CHECK (status IN ('hidden_vault', 'private_memorial', 'public_memorial')),
  biography TEXT,
  cover_photo_url TEXT,
  birth_date DATE,
  death_date DATE,
  transition_date TIMESTAMPTZ,
  data_protection_flag BOOLEAN DEFAULT false, -- vefat sonrası silme engeli
  encryption_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**public.heirs**
```sql
CREATE TABLE public.heirs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  heir_email VARCHAR(255) NOT NULL,
  heir_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  access_level VARCHAR(50) DEFAULT 'viewer'
    CHECK (access_level IN ('executor', 'contributor', 'viewer')),
  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'revoked')),
  invitation_token VARCHAR(100) UNIQUE,
  invitation_expires_at TIMESTAMPTZ,
  shamir_key_share TEXT, -- şifrelenmiş anahtar parçası (CSE için)
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**public.media**
```sql
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  uploader_id UUID REFERENCES public.profiles(id),
  original_url TEXT NOT NULL, -- R2 orijinal path
  thumb_url TEXT,             -- 200px WebP
  medium_url TEXT,            -- 800px WebP
  large_url TEXT,             -- 1920px WebP
  media_type VARCHAR(50) CHECK (media_type IN ('image','video','audio','document')),
  original_filename VARCHAR(500),
  file_size_bytes BIGINT,
  is_public BOOLEAN DEFAULT false,
  taken_at TIMESTAMPTZ,       -- fotoğraf çekim tarihi (EXIF'ten)
  ai_tags TEXT[],             -- AI analiz etiketleri
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**public.guestbook**
```sql
CREATE TABLE public.guestbook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  visitor_name VARCHAR(255) NOT NULL,
  visitor_email VARCHAR(255), -- opsiyonel
  message TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  rejected_reason TEXT,
  ip_hash VARCHAR(64), -- fraud tespiti için (hash, plain IP değil)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id)
);
```

**public.dynamic_qr**
```sql
CREATE TABLE public.dynamic_qr (
  qr_hash VARCHAR(50) PRIMARY KEY,
  target_vault_id UUID REFERENCES public.vaults(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ, -- vault ile eşleştirildiği tarih
  redirect_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  physical_format VARCHAR(50) -- 'marble', 'paper', 'nfc', 'flower_ribbon'
);
```

**public.death_claims**
```sql
CREATE TABLE public.death_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES public.vaults(id),
  claimant_id UUID NOT NULL REFERENCES public.profiles(id),
  document_url TEXT,          -- R2'de saklanan ölüm belgesi
  document_type VARCHAR(100), -- 'death_certificate', 'obituary', 'court_order'
  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'contested')),
  ai_pre_check_result JSONB,  -- AI OCR analiz sonucu
  reviewed_by UUID REFERENCES public.profiles(id), -- admin
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  objection_deadline TIMESTAMPTZ, -- 30 günlük itiraz penceresi
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**public.audit_logs**
```sql
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES public.vaults(id),
  actor_id UUID REFERENCES public.profiles(id),
  action VARCHAR(100) NOT NULL, -- 'vault_transition', 'heir_added', 'death_claim_approved'
  old_value JSONB,
  new_value JSONB,
  ip_hash VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- Silme yok: audit log asla silinemez
);
```

**public.qr_analytics**
```sql
CREATE TABLE public.qr_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_hash VARCHAR(50) REFERENCES public.dynamic_qr(qr_hash),
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  device_type VARCHAR(50), -- 'mobile', 'tablet', 'desktop'
  country_code VARCHAR(5), -- IP'den türetilmiş
  city VARCHAR(100)
);
```

**public.subscriptions**
```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier VARCHAR(50) CHECK (tier IN ('free', 'premium', 'lifetime')),
  status VARCHAR(50) CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_subscription_id VARCHAR(200) UNIQUE,
  stripe_customer_id VARCHAR(200),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  storage_limit_bytes BIGINT DEFAULT 1073741824, -- 1GB free
  storage_used_bytes BIGINT DEFAULT 0,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 5.2 Trigger'lar

```sql
-- Yeni kullanıcı kaydında profil otomatik oluştur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Kasa durumu değişince otomatik işlemler
CREATE OR REPLACE FUNCTION handle_vault_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'hidden_vault' AND NEW.status = 'public_memorial' THEN
    NEW.transition_date := NOW();
    NEW.data_protection_flag := true;
    INSERT INTO public.audit_logs (vault_id, action, old_value, new_value)
    VALUES (NEW.id, 'vault_transition',
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status, 'transition_date', NOW())
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vault_status_change
  BEFORE UPDATE ON public.vaults
  FOR EACH ROW EXECUTE FUNCTION handle_vault_transition();
```

---

### 5.3 RLS Politikaları

```sql
-- Gizli kasalar: sadece sahibi görür
CREATE POLICY "owner_sees_own_hidden_vault"
ON public.vaults FOR SELECT TO authenticated
USING (auth.uid() = owner_id AND status = 'hidden_vault');

-- Anı sayfaları: herkes görür
CREATE POLICY "public_memorial_visible_to_all"
ON public.vaults FOR SELECT TO authenticated, anon
USING (status = 'public_memorial');

-- Varis erişimi: aktif varisler kasayı görebilir (executor)
CREATE POLICY "active_heirs_can_view"
ON public.vaults FOR SELECT TO authenticated
USING (
  auth.uid() IN (
    SELECT heir_profile_id FROM public.heirs
    WHERE vault_id = vaults.id AND status = 'active'
  )
);

-- Medya: sadece is_public=true olanlar anonime açık
CREATE POLICY "public_media_visible_to_anon"
ON public.media FOR SELECT TO anon
USING (
  is_public = true AND
  vault_id IN (SELECT id FROM public.vaults WHERE status = 'public_memorial')
);
```

---

## BÖLÜM 6 — GÜVENLİK MİMARİSİ

### 6.1 Client-Side Encryption (CSE)

Mevcut durumda Supabase veritabanına erişimi olan herkes (platform yöneticileri dahil) kullanıcı verilerini görebilir. "Bize güven" modeli dijital miras bağlamında yetersizdir.

**Çözüm:**
```
Kullanıcı parolası
    ↓ PBKDF2 (100.000 iterasyon, salt: user UUID)
AES-256-GCM şifreleme anahtarı
    ↓ Tarayıcıda biyografi/belgeler şifrelenir
Şifreli blob → Supabase'e gönderilir
    ↓ Sunucu asla plaintext görmez
```

### 6.2 Shamir's Secret Sharing

CSE aktifse vefat sonrası anahtar erişimi için:

```
Master Key
    ↓ Shamir (n=3, k=2) — 3 parça üret, 2 tanesi yeterli
Parça 1 → Executor Varis A'ya şifrelenmiş gönderilir
Parça 2 → Executor Varis B'ye şifrelenmiş gönderilir
Parça 3 → Executor Varis C'ye şifrelenmiş gönderilir

Vefat sonrası: A + B bir araya gelir → Master Key rekonstrükte → kasa açılır
```

---

## BÖLÜM 7 — TECH STACK

| Katman | Teknoloji | Versiyon | Açıklama |
|--------|-----------|----------|----------|
| Frontend | Next.js | 15 | App Router, Server Components |
| Dil | TypeScript | 5.x | Tam tip güvenliği |
| Stil | Tailwind CSS | 4.x | Utility-first |
| Veritabanı | PostgreSQL (Supabase) | 15 | RLS, Triggers, Functions |
| Auth | Supabase Auth | — | OAuth, Magic Link |
| Depolama | Cloudflare R2 | — | Sıfır egress fee |
| CDN | Vercel Edge / Cloudflare | — | ISR, Edge Runtime |
| E-posta | Resend | — | Transactional + Drip |
| Ödeme | Stripe | — | Abonelik + Lifetime |
| Deploy | Vercel | — | Checklife Aesthetics team |
| Analytics | PostHog | — | Kullanıcı davranışı |
| Monitoring | Sentry | — | Hata takibi |

---

## BÖLÜM 8 — GELİR MODELİ

| Plan | Fiyat | Depolama | Özellikler |
|------|-------|----------|------------|
| Free | 0 | 1 GB | 1 kasa, temel anı ekleme |
| Premium | Aylık/Yıllık TBD | 50 GB | Sınırsız kasa, AI özellikler, öncelikli destek |
| Lifetime | Tek seferlik TBD | 100 GB | Kalıcı güvence, tüm özellikler |
| Partner (Mermerci) | SaaS lisans TBD | — | QR üretim paneli, API erişimi |
| B2B (Sigorta/Noter) | White-label TBD | — | Kendi markasıyla platform |

---

## SONUÇ

### Başarı Kriterleri

**3. Ay Hedefleri:**
- 500 kayıtlı kullanıcı (Gürcistan pazarı)
- 50 partner mermerci
- 10 anı sayfasına dönüşmüş kasa
- Ortalama onboarding tamamlanma: %60

**12. Ay Hedefleri:**
- 5.000 aktif kullanıcı
- 200 partner
- Premium dönüşüm oranı: %15
- İlk Lifetime plan satışları
- Türkiye pazarına giriş

### Geliştirme Öncelik Sırası

1. **Acil (Hafta 1-2):** Git + Vercel + Supabase bağlantısı, DB şeması, Auth
2. **Kısa Vadeli (Hafta 3-6):** Landing page, Kasa Dashboard, temel medya yükleme
3. **Orta Vadeli (Ay 2-3):** Anı sayfası + ISR, QR sistemi, varis akışı
4. **Uzun Vadeli (Ay 3-6):** Admin panel, AI entegrasyonu, CSE, ödeme sistemi
5. **Büyüme (Ay 6+):** B2B partner paneli, Türkiye genişlemesi, white-label

### Kritik Risk ve Azaltma

| Risk | Etki | Azaltma |
|------|------|---------|
| Sahte ölüm bildirimi | Yüksek | 30 gün itiraz penceresi + çoklu varis onayı |
| Veri ihlali | Kritik | CSE + Supabase RLS + audit logs |
| Platform varlığı sona ererse | Yüksek | Kullanıcıya veri export zorunluluğu |
| Domain değişikliği | Orta | Dinamik QR sistemi |
| GDPR uyumsuzluğu | Yüksek | Hukuki danışman + data processor agreement |

---

_themaradi — "Anılar kaybolmaz, sadece bekler."_  
_Proje başlangıcı: 2026 | Platform: themaradi.com (TBD)_
