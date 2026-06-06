@AGENTS.md

# ZORUNLU: Her Oturum Sonu DevLog Kuralı

Her konuşmanın sonunda Claude MUTLAKA `devlog.md` dosyasını günceller.
Bu kural atlanamaz, unutulamaz, istisnası yoktur.

## Log Formatı

```
## YYYY-MM-DD — Oturum N: [Kısa Başlık]

### Yapılanlar
- Madde madde ne yapıldı

### Proje Durumu
[ ] / [x] formatında tüm kritik görevlerin güncel durumu

### Kritik Kararlar / Notlar
- Bu oturumda alınan mimari kararlar, önemli bulgular

### Nerede Kaldık
Tek paragraf: tam olarak hangi dosya/özellik/adımda duruldu

### Sıradaki Adım
Numaralı liste: sıradaki somut görevler
```

## Kurallar
- Log `devlog.md` dosyasına yazılır (proje kök dizini)
- Yeni oturumlar dosyanın ÜSTÜNE eklenir (en son oturum en üstte)
- Kod değişikliği olmasa bile (sadece konuşma/planlama) log yazılır
- Hangi dosyalar değiştirildiyse listele
- "Sıradaki Adım" bölümü her zaman dolu olmalı
