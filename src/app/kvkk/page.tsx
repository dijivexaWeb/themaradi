import LegalPage from '@/components/legal/LegalPage'

export default function KvkkPage() {
  return (
    <LegalPage
      eyebrow="KVKK"
      title="KVKK Aydınlatma Metni"
      description="Bu metin, themaradi hizmetlerinde kişisel verilerin hangi amaçlarla işlendiğini özetler. Nihai yayın öncesi hukuk danışmanı tarafından gözden geçirilmelidir."
      sections={[
        {
          title: 'Veri sorumlusu',
          body: ['themaradi, dijital kasa ve anı sayfası hizmetleri kapsamında kullanıcı verilerini işler.'],
        },
        {
          title: 'İşlenen veri kategorileri',
          body: [
            'Kimlik ve iletişim verileri: e-posta, ad, profil bilgileri ve oturum kayıtları.',
            'Kullanıcı içerikleri: biyografi, medya dosyaları, belgeler, temsilci/varis e-posta bilgileri ve ziyaretçi defteri mesajları.',
          ],
        },
        {
          title: 'İşleme amaçları',
          body: [
            'Hesap oluşturma, kimlik doğrulama, dijital kasa yönetimi, QR yönlendirme, anı sayfası yayını ve güvenlik süreçleri.',
            'Destek, hata analizi, kötüye kullanım önleme ve yasal yükümlülüklerin yerine getirilmesi.',
          ],
        },
        {
          title: 'Haklarınız',
          body: [
            'KVKK kapsamındaki erişim, düzeltme, silme, işleme kısıtlama ve itiraz hakları için privacy@themaradi.com adresinden iletişime geçebilirsiniz.',
          ],
        },
      ]}
    />
  )
}
