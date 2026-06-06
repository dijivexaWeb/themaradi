# themaradi — Geliştirme Günlüğü (DevLog)

> Her oturum sonunda Claude bu dosyayı günceller.
> Format: tarih → ne yapıldı → nerede kalındı → sıradaki adım.

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
