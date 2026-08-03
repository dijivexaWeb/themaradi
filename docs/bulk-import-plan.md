# Toplu Vefat Listesi → Anma Profili → Kargo — Plan

> Bu döküman, admin panelinde kurulacak "toplu içe aktarma" sisteminin tam planıdır. Unutulmasın diye buraya yazıldı.

## Genel Akış

```
1. Ham liste yüklenir (Excel/CSV) — TEMİZLİK YAPILMAMIŞ, olduğu gibi
2. Panelde tablo halinde görünür, admin satır satır temizler (yaş dışı, ünlü, hatalı vs. çıkarır)
3. "Oluştur" → kalan her satır için hesap + profil + QR üretilir
4. QR/etiket toplu indirilir → baskıya gönderilir
5. Baskı geri geldiğinde isimle arayıp kişiye özel çıktıları (irsaliye/mektup/kılavuz) eşleştirir
6. Takip ekranından hangi adımın yapıldığı görülür (otomatik işaretlenir)
7. Kargoya verilir, teslim edilir
8. Alıcı login olup "Sahiplen" der YA DA admin manuel "Yayınla" der → profil canlanır
```

## 1. Liste Yükleme & Temizleme

- Ham CSV/Excel yüklenir (temizlik yok, olduğu gibi)
- Sütunlar: ad soyad, doğum tarihi, ölüm tarihi, adres, TC kimlik no, telefon (**opsiyonel** — listede yoksa boş kalabilir), mezarlık bilgisi
- Panelde tablo: yaş otomatik hesaplanıp gösterilir (kolay eleme için), admin satır satır çıkarır (ünlü kişi, yanlış yaş, hatalı veri vs.)
- Her yükleme bir **batch** (parti) olarak kaydedilir, tarihiyle gruplanır — takip ekranı varsayılan olarak "bugünün partisi"ni gösterir, günlük 1000 kişilik hacimde liste kirlenmesin diye

## 2. Toplu Oluşturma

Temizlenmiş her satır için:
- **Kullanıcı adı**: `ad.soyad` formatında (TR/GE karakterler sadeleştirilir), DB'de unique constraint var — çakışırsa `ad.soyad2`, `ad.soyad3`... İki farklı kişinin aynı kullanıcı adını almasına DB seviyesinde izin yok (yanlış hesaba girme riski sıfırlanır)
- **Şifre**: rastgele 6 haneli kolay okunur kod (örn. `TEM-4821`)
- **Auth hesabı**: Supabase Auth email zorunlu tuttuğu için arka planda görünmez bir teknik email üretilir (`ahmet.yilmaz@claim.theeternalmemory.com`), hiçbir yere gösterilmez/gönderilmez, sadece iç kimlik
- **Vault kaydı**: `status='unclaimed'`, `vault_origin='bulk_import'` (bu belirteç sayesinde doğrulama/tanık/itiraz akışı HİÇ tetiklenmez — zaten ölü olduğu resmi listeden biliniyor)
- **QR/referans kod**: mevcut `qr_id` sistemiyle otomatik üretilir

## 3. QR / Etiket Üretimi

Tasarım: **üstte** ölen kişinin adı, **ortada** QR kod, **altta** kullanıcı adı + referans kod (aynı isimden birden fazla kişi olursa ayırt etmek için).

- **Toplu indirme**: "Oluştur" bitince tek tıkla günün tüm QR/etiketleri ZIP/PDF olarak iner, direkt baskıya gönderilir (günde ~1000 kişilik hacme uygun hız)
- **Tekil arama/indirme**: Baskılar geri geldiğinde isimle arayıp o kişinin materyallerini tekil bulup eşleştirme

## 4. Kargo Materyalleri

- **İrsaliye**: ad soyad, adres, **telefon (varsa mutlaka basılır, kimin olduğu önemli değil, yoksa boş kalır — zorunlu alan değil)**, referans kod
- **Kişiye özel mektup**: antetli, kurumsal + duygusal ton, "bizi tercih ettiğiniz için teşekkürler" mesajı, ölen kişinin adıyla kişiselleştirilmiş — ilk taslağı Claude yazacak, onaydan geçecek
- **Kullanım kılavuzu**: herkese aynı, tek seferlik tasarlanır (QR nasıl okutulur, nasıl login olunur, "Sahiplen" ne demek) — ilk taslağı Claude yazacak

## 5. Takip Ekranı (EN KRİTİK KISIM)

**Amaç: yanlış kargonun yanlış kişiye gitmemesi.**

- Her kişi bir satır, batch/gün bazlı gruplu
- Sütunlar (otomatik işaretlenir — admin elle işaretlemez, sadece sorun olursa geri alır):
  - ☐ Sistem oluşturuldu
  - ☐ QR/etiket çıktısı alındı
  - ☐ İrsaliye çıktısı alındı
  - ☐ Mektup çıktısı alındı
  - ☐ Kılavuz çıktısı alındı
  - ☐ Kargoya verildi (takip no)
  - ☐ Teslim edildi
  - ☐ Sahiplenildi / Yayınlandı
- Her "çıktı al" butonuna basınca ilgili adım otomatik ✅ olur
- İsimle arama, duruma göre filtre ("henüz kargoya verilmedi" gibi)

## 6. Yayınlama — İki Yol

1. **Alıcı kendisi**: kullanıcı adı/şifreyle login olur → dashboard'da "Sahiplen" popup'ı çıkar → onay verir → profil canlanır, geri dönüş yok
2. **Admin manuel**: panelden "Yayınla" der, doğrulama sorulmaz, direkt canlıya alınır

İkisi de `vault_origin='bulk_import'` olduğu için doğrulama akışını atlar.

## Mevcut Sistemle İlişki — DOKUNULMAYACAKLAR

- Organik satın alma (`/satin-al/anma`) ve mevcut doğrulama/tanık/itiraz sistemi **hiç değişmiyor**, aynen çalışmaya devam ediyor
- Mevcut `/login` formu email ile girenler için **hiç değişmiyor** — sadece `@` içermeyen girişler (bulk kullanıcı adları) arka planda synthetic email'e çevrilecek
- Mevcut `/admin/kargo` akışı bu yeni kayıtları da kapsayacak şekilde genişletilecek, bozulmayacak

## Uygulama Fazları

- **Faz 1**: DB migration + yükleme/temizleme ekranı + toplu oluşturma
- **Faz 2**: QR/etiket tasarımı + toplu/tekil indirme
- **Faz 3**: İrsaliye + mektup + kılavuz PDF üretimi
- **Faz 4**: Takip ekranı + Sahiplen akışı + login güncellemesi + admin manuel yayınla

## Bilinmeyen / Sonradan Netleşecek

- Mektup ve kılavuz metinlerinin ilk taslağı Claude tarafından yazılacak, kullanıcı onayından geçecek
