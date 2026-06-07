import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni — The Maradi',
}

const toc = [
  { id: 'sorumluluk', label: '1. Veri Sorumlusu' },
  { id: 'kategoriler', label: '2. İşlenen Veri Kategorileri' },
  { id: 'amaclar', label: '3. İşleme Amaçları' },
  { id: 'haklar', label: '4. Haklarınız' },
]

export default function KvkkPage() {
  return (
    <LegalPage eyebrow="KVKK" title="KVKK Aydınlatma Metni" date="7 Haziran 2026" toc={toc}>

      <section id="sorumluluk">
        <h2>1. Veri Sorumlusu</h2>
        <p>
          The Maradi, dijital anıt profili ve yaşam kasası hizmetleri kapsamında kullanıcı verilerini
          6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca işlemektedir.
          Veri sorumlusu: <strong>The Maradi</strong> — Petre Bagrationi Str. 220, Batumi, Gürcistan.
          İletişim: <a href="mailto:privacy@themaradi.com">privacy@themaradi.com</a>
        </p>
      </section>

      <section id="kategoriler">
        <h2>2. İşlenen Veri Kategorileri</h2>
        <ul>
          <li><strong>Kimlik ve iletişim verileri:</strong> e-posta, ad soyad, telefon, profil bilgileri ve oturum kayıtları.</li>
          <li><strong>Kullanıcı içerikleri:</strong> biyografi, fotoğraf, video, ses kaydı, belgeler, varis bilgileri ve ziyaretçi mesajları.</li>
          <li><strong>Doğrulama belgeleri:</strong> kimlik belgesi ve vefat belgesi (doğrulama sonrası 30 gün içinde silinir).</li>
        </ul>
      </section>

      <section id="amaclar">
        <h2>3. İşleme Amaçları</h2>
        <ul>
          <li>Hesap oluşturma, kimlik doğrulama ve dijital kasa yönetimi</li>
          <li>QR yönlendirme, anıt profili yayını ve aile bildirim sistemi</li>
          <li>Güvenlik, kötüye kullanım önleme ve yasal yükümlülüklerin yerine getirilmesi</li>
          <li>Teknik destek ve hata analizi</li>
        </ul>
      </section>

      <section id="haklar">
        <h2>4. KVKK Kapsamındaki Haklarınız</h2>
        <p>
          KVKK Madde 11 kapsamında; kişisel verilerinizin işlenip işlenmediğini öğrenme,
          işlenmişse bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme,
          yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış
          işlenmiş verilerin düzeltilmesini isteme, silinmesini veya yok edilmesini talep etme,
          bu işlemlerin aktarıldığı kişilere bildirilmesini isteme, otomatik sistemlerle aleyhinize
          bir sonucun ortaya çıkmasına itiraz etme ve zarara uğramanız halinde zararın giderilmesini
          talep etme haklarına sahipsiniz.
        </p>
        <p>
          Başvurularınız için: <a href="mailto:privacy@themaradi.com">privacy@themaradi.com</a> —
          30 gün içinde yanıtlanır.
          Kişisel Verileri Koruma Kurulu&apos;na (kvkk.gov.tr) şikâyette bulunabilirsiniz.
        </p>
        <p>
          Ayrıntılı bilgi için bkz. <a href="/privacy">Gizlilik Politikası</a>.
        </p>
      </section>

    </LegalPage>
  )
}
