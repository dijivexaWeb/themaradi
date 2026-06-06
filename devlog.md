# themaradi — Geliştirme Günlüğü (DevLog)

> Her oturum sonunda Claude bu dosyayı günceller.
> Format: tarih → ne yapıldı → nerede kalındı → sıradaki adım.

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
