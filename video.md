# Video Yükleme ve İşleme Planı

## Hedef

Kullanıcı videoyu sisteme yüklerken bizim uygulama sunucusuna yük bindirmemek. Video dosyası doğrudan Amazon S3'e gidecek, AWS Lambda + FFmpeg ile sıkıştırılacak, orijinal video silinecek ve sistemde yalnızca işlenmiş video kullanılacak.

## Kullanıcı Limitleri

- Fotoğraf limiti: 30 adet
- Video limiti: 10 adet
- Toplam medya alanı: 500 MB
- Tek video dosya limiti: 100 MB
- Tek video süre limiti: 10 dakika

## Kullanıcıya Gösterilecek Tavsiye Kutusu

Bu kutu dosya seçme butonunun veya sürükle-bırak alanının hemen üstünde, açık renkli bilgi kutusu olarak sabit durmalı. Kullanıcı sayfaya girince dosya seçmeden önce bunu okumalı.

```text
📸 Fotoğraf Seçimi İçin Tavsiyeler
Ziyaretçilerin ekranda net görebilmesi için aydınlık ve yüzün belirgin olduğu yüksek kaliteli fotoğrafları tercih edin.

🎥 Video Seçimi İçin Tavsiyeler
Mezarlık gibi açık alanlarda internet bağlantısı zayıf olabilir. Videoların ziyaretçilerde donmadan, anında açılabilmesi için süreyi 2-3 dakika aralığında tutmanızı öneririz.
(Sistemimiz kalite standartları gereği en fazla 100 MB boyutunda ve 10 dakikalık videolara izin vermektedir.)
```

## Ekran Mesajları

Dosya seçme alanı altında kısa limit metni:

```text
En fazla 100 MB / 10 dakika. Daha hızlı işleme ve daha iyi ziyaretçi deneyimi için 2-3 dakikalık videolar önerilir.
```

Video yüklenirken:

```text
Video yükleniyor. Lütfen bu pencereyi kapatmayın.
```

Upload bittikten sonra:

```text
Video işleniyor. Bu işlem birkaç dakika sürebilir. Video hazır olduğunda burada görünecek.
```

Limit aşılırsa:

```text
Video yüklenemedi. Lütfen 100 MB'ı ve 10 dakikayı geçmeyen bir video seçin.
```

Kota aşılırsa:

```text
Medya alanınız dolmak üzere. 500 MB sınırını aşmamak için daha kısa video veya daha küçük dosya seçin.
```

## Teknik Akış

1. Kullanıcı video sayfasına girer.
2. Tavsiye kutusu dosya seçme alanının üstünde görünür.
3. Kullanıcı video seçer.
4. Browser dosyayı kontrol eder:
   - Dosya boyutu 100 MB üstündeyse yükleme başlamaz.
   - Video süresi 10 dakika üstündeyse yükleme başlamaz.
5. Backend kullanıcı yetkisini, video sayısını ve 500 MB medya kotasını kontrol eder.
6. Backend AWS S3 için kısa süreli signed upload URL üretir.
7. Kullanıcı videosu doğrudan S3'e yüklenir.
8. Yükleme sırasında pencereyi kapatmaması için kullanıcıya net uyarı gösterilir.
9. Upload tamamlanınca DB'de video kaydı `processing` durumuna alınır.
10. S3 upload event AWS Lambda'yı tetikler.
11. Lambda FFmpeg ile videoyu işler:
    - Web uyumlu MP4/H.264 formatına çevirir.
    - 720p hedef çözünürlüğe indirir.
    - Bitrate'i düşürerek dosyayı küçültür.
    - Thumbnail/poster görseli üretir.
12. Lambda işlenmiş videoyu S3'te `processed-videos/` altına kaydeder.
13. Lambda orijinal videoyu `original-videos/` altından siler.
14. Lambda DB kaydını `ready` yapar.
15. Public anma sayfası sadece `ready` videoyu gösterir.
16. İşleme hata verirse DB kaydı `failed` olur ve kullanıcıya hata mesajı gösterilir.

## Önerilen S3 Klasör Yapısı

```text
original-videos/{vaultId}/{userId}/{videoId}/source
processed-videos/{vaultId}/{userId}/{videoId}/video.mp4
processed-videos/{vaultId}/{userId}/{videoId}/poster.jpg
```

## DB Alanları

Mevcut `media` tablosu kullanılabilir. Gerekli alanlar yoksa migration ile eklenmeli.

- `media_type`: `video`
- `source_type`: `aws_s3`
- `processing_status`: `pending_upload | processing | ready | failed`
- `storage_bucket`
- `storage_path`
- `processed_storage_path`
- `original_url`
- `processed_url`
- `thumb_url`
- `file_size_bytes`
- `processed_size_bytes`
- `duration_seconds`
- `processing_error`

## Güvenlik ve Kontrol Katmanları

Client kontrolü tek başına yeterli değildir. Kullanıcı browser kontrolünü bypass edebilir.

Kontroller üç yerde yapılmalı:

1. Browser:
   - 100 MB dosya limiti
   - 10 dakika süre limiti
   - kullanıcıya hızlı uyarı

2. Backend:
   - oturum ve sahiplik kontrolü
   - 10 video limiti
   - 500 MB medya kotası
   - signed upload URL süresi
   - signed upload max byte limiti

3. Lambda:
   - `ffprobe` ile gerçek süre kontrolü
   - dosya boyutu kontrolü
   - hatalı formatları reddetme
   - başarılı işlem sonrası orijinali silme

## AWS İçin Gereken Bilgiler

Uygulamaya bağlamadan önce şu bilgiler netleşmeli:

- AWS region
- S3 bucket adı
- AWS access key
- AWS secret key
- Lambda deploy yöntemi: manuel, AWS SAM, CDK veya başka bir yöntem
- Lambda'nın DB'ye nasıl güvenli erişeceği
- İşlenmiş videoların public erişimi: S3 public URL, CloudFront veya signed playback URL

## İlk Uygulama Adımları

1. Video ve fotoğraf upload ekranlarına tavsiye kutusunu ekle.
2. Video seçildiğinde client tarafında 100 MB ve 10 dakika kontrolü yap.
3. Video upload sırasında "pencereyi kapatmayın" durum ekranı ekle.
4. 30 fotoğraf, 10 video ve 500 MB kota hesabının mevcut DB'de nereden yapılacağını netleştir.
5. AWS S3 signed upload endpoint tasarla.
6. Lambda + FFmpeg worker taslağını hazırla.
7. DB'ye `processing_status` ve işlenmiş video alanları gerekiyorsa migration ekle.
8. Public anma sayfasında `processing`, `ready`, `failed` video durumlarını göster.

## Karar Notu

Bu model, video işleme yükünü Next.js uygulamasından uzak tutar. Kullanıcı videoyu doğrudan S3'e yükler. Lambda sadece kısa ve limitli videoları işler. 100 MB / 10 dakika sınırı bu yüzden kritik bir güvenlik ve maliyet kontrolüdür.
