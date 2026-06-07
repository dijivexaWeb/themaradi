import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Kullanım Koşulları — The Maradi',
  description: 'The Maradi hizmet kullanım koşulları, ödeme ve iade politikası.',
}

const toc = [
  { id: 'taraflar', label: '1. Taraflar ve Kapsam' },
  { id: 'hizmetler', label: '2. Hizmetler' },
  { id: 'hesap', label: '3. Hesap Oluşturma' },
  { id: 'yasak', label: '4. Yasak Kullanımlar' },
  { id: 'dogrulama', label: '5. Doğrulama Süreci' },
  { id: 'odeme', label: '6. Ödeme ve İade' },
  { id: 'icerik', label: '7. İçerik Hakları' },
  { id: 'sorumluluk', label: '8. Sorumluluk Sınırı' },
  { id: 'askiya', label: '9. Hesap Askıya Alma' },
  { id: 'abonelik', label: '10. Abonelik İptali' },
  { id: 'sureklilk', label: '11. Hizmet Sürekliliği Taahhüdü' },
  { id: 'hukuk', label: '12. Uygulanacak Hukuk' },
  { id: 'degisiklik', label: '13. Değişiklikler' },
]

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Hukuki Belge" title="Kullanım Koşulları" date="7 Haziran 2026" toc={toc}>

      <section id="taraflar">
        <h2>1. Taraflar ve Kapsam</h2>
        <p>
          Bu Kullanım Koşulları, <strong>The Maradi</strong> (Petre Bagrationi Str. 220, Batumi, Gürcistan —
          bundan böyle &quot;The Maradi&quot;, &quot;biz&quot;, &quot;bizim&quot;) ile platformu kullanan gerçek ya da
          tüzel kişi (&quot;Kullanıcı&quot;, &quot;siz&quot;) arasındaki sözleşmeyi oluşturur.
          Platformu kullanmaya başladığınız anda bu koşulları kabul etmiş sayılırsınız.
        </p>
        <p>
          18 yaşından küçükseniz platformu kullanamazsınız. Üçüncü bir kişi adına başvuru yapıyorsanız o kişi
          adına yetkili olduğunuzu beyan edersiniz.
        </p>
      </section>

      <section id="hizmetler">
        <h2>2. Hizmetler</h2>
        <p>The Maradi iki temel ürün sunar:</p>

        <h3>2.1 Anma Profili</h3>
        <p>
          Vefat eden bir kişi için aile veya yetkili yakın tarafından oluşturulan, tek seferlik ücrete tabi
          dijital anıt profilidir. Profil; biyografi, fotoğraf, video, mezarlık bilgisi ve QR plaka hizmetini kapsar.
          Yayına girmeden önce kimlik doğrulama ve 14 günlük itiraz süreci uygulanır.
        </p>

        <h3>2.2 Yaşam Kasası</h3>
        <p>
          Kullanıcının hayattayken kendi dijital mirasını oluşturduğu, aboneliğe dayalı hizmettir. Kullanıcı;
          fotoğraf, video, ses kaydı, biyografi ve son mesaj ekleyebilir; 3 varis belirleyebilir. Vefat sonrası
          varislerden en az 2&apos;si onay verdiğinde vault otomatik olarak herkese açık Anma Profili&apos;ne dönüşür.
          Abonelik kurulum ücreti + aylık/yıllık ücretle sunulur.
        </p>
      </section>

      <section id="hesap">
        <h2>3. Hesap Oluşturma ve Güvenlik</h2>
        <ul>
          <li>Doğru, güncel ve eksiksiz bilgi sağlamakla yükümlüsünüz.</li>
          <li>Hesap güvenliğinizden siz sorumlusunuz; şifrenizi kimseyle paylaşmayın.</li>
          <li>Hesabınızın yetkisiz kullanıldığını fark ettiğinizde derhal <a href="mailto:support@themaradi.com">support@themaradi.com</a> adresine bildirin.</li>
          <li>Bir kişi için birden fazla hesap açmak yasaktır.</li>
        </ul>
      </section>

      <section id="yasak">
        <h2>4. Yasak Kullanımlar</h2>
        <p>Aşağıdaki eylemler kesinlikle yasaktır ve hesabın kalıcı olarak kapatılmasına ve yasal işlem başlatılmasına yol açar:</p>
        <ul>
          <li><strong>Yaşayan biri için vefat profili oluşturmak.</strong> Bu eylem Gürcistan Ceza Kanunu kapsamında değerlendirilebilir.</li>
          <li>Başkasının kimliğine bürünmek ya da sahte belge sunmak.</li>
          <li>Yanıltıcı, hakaret içeren veya telif hakkı ihlali teşkil eden içerik yüklemek.</li>
          <li>Platformu otomatik araçlarla taramak, veri kazımak (scraping) veya sistemi aşırı yüklemek.</li>
          <li>Başka kullanıcıların verilerine yetkisiz erişim denemek.</li>
          <li>QR yönlendirme sistemini kötüye kullanmak.</li>
        </ul>
      </section>

      <section id="dogrulama">
        <h2>5. Doğrulama Süreci</h2>
        <p>
          Anma Profili başvurularında kimlik doğrulama zorunludur. Detaylı süreç için bkz.{' '}
          <a href="/legal/verification-policy">Doğrulama ve İtiraz Politikası</a>.
        </p>
        <ul>
          <li>Belgeler güvenli ortamda saklanır ve doğrulama sonrası 30 gün içinde silinir.</li>
          <li>Onaylanan profil, 14 günlük itiraz penceresinin ardından tam yayına geçer.</li>
          <li>Sahte belge tespitinde ücret iade edilmez ve yasal işlem başlatılır.</li>
        </ul>
      </section>

      <section id="odeme">
        <h2>6. Ödeme ve İade Politikası</h2>
        <h3>6.1 Ödeme Yöntemleri</h3>
        <p>TBC Pay, BOG Pay, Visa/Mastercard ve banka havalesi kabul edilir. Tüm fiyatlar Gürcistan Larisi (₾/GEL) cinsinden belirtilmiştir.</p>

        <h3>6.2 Anma Profili — İade</h3>
        <ul>
          <li>Dijital içerik oluşturulmadan önce yapılan iptal taleplerinde <strong>tam iade</strong> yapılır.</li>
          <li>Profil oluşturulduktan ve doğrulama süreci başladıktan sonra <strong>iade yapılmaz.</strong></li>
          <li>QR plaka üretimine başlanmadan önce yapılan taleplerde plaka maliyeti iade edilebilir.</li>
          <li>Kargo yola çıkmışsa plaka maliyeti iade edilmez; ancak profil içeriği silinebilir.</li>
        </ul>

        <h3>6.3 Yaşam Kasası — İade</h3>
        <ul>
          <li>Kurulum ücreti iade edilmez (QR plaka üretimi dahil).</li>
          <li>Aylık abonelik: iptal tarihinden sonra gelen periyot için ücret alınmaz; mevcut dönem iade edilmez.</li>
          <li>Yıllık abonelik: ilk 14 gün içinde iptal edilirse, QR plaka maliyeti düşülerek kalan süre oranında iade yapılır.</li>
        </ul>

        <h3>6.4 Fiyat Değişiklikleri</h3>
        <p>
          Abonelik fiyatı artışlarında en az <strong>30 gün önceden</strong> e-posta ile bildirim yapılır.
          Mevcut aboneliğiniz bildirim tarihinden itibaren bir sonraki yenilemeye kadar eski fiyatla devam eder.
        </p>
      </section>

      <section id="icerik">
        <h2>7. İçerik Hakları</h2>
        <p>
          Platforma yüklediğiniz tüm içeriklerin (fotoğraf, video, metin, ses) fikri mülkiyet haklarının
          sahibi sizsiniz. Bu içerikleri yükleyerek The Maradi&apos;ye, hizmetin işletilmesi amacıyla
          kullanmak, depolamak, görüntülemek ve iletmek için <strong>münhasır olmayan, devredilemez, ücretsiz
          bir lisans</strong> vermiş olursunuz.
        </p>
        <p>
          The Maradi ticari marka, logo ve platform tasarımı tüm haklarıyla saklıdır; izinsiz kullanılamaz.
        </p>
      </section>

      <section id="sorumluluk">
        <h2>8. Sorumluluk Sınırı</h2>
        <p>
          The Maradi, uygulanabilir hukukun izin verdiği azami ölçüde; veri kaybı, hizmet kesintisi,
          kullanım geliri kaybı veya dolaylı zararlardan sorumlu tutulamaz.
        </p>
        <p>
          Toplam sorumluluğumuz, zararın oluştuğu aydan önceki <strong>12 aylık dönemde</strong> ödediğiniz
          hizmet bedeliyle sınırlıdır.
        </p>
        <p>
          Üçüncü kişilerin platformu kötüye kullanımından (sahte başvuru, yetkisiz erişim vb.) kaynaklanan
          zararlardan The Maradi sorumlu değildir.
        </p>
      </section>

      <section id="askiya">
        <h2>9. Hesap Askıya Alma ve Kapatma</h2>
        <p>The Maradi, aşağıdaki durumlarda hesabı önceden bildirim yapmaksızın askıya alabilir veya kapatabilir:</p>
        <ul>
          <li>Kullanım Koşulları&apos;nın ihlali</li>
          <li>Sahte belge ya da doğrulama girişimi</li>
          <li>Üçüncü kişilerin şikâyeti üzerine açık ihlal tespiti</li>
          <li>Yasal bir makamın talebi</li>
        </ul>
        <p>
          Hesap kapatma durumunda içeriklerin bir kopyasını talep edebilirsiniz; bu talep 30 gün içinde
          karşılanır. Yasal ihlal durumlarında bu hak kısıtlanabilir.
        </p>
      </section>

      <section id="abonelik">
        <h2>10. Yaşam Kasası Aboneliği İptali</h2>
        <p>
          Aboneliğinizi istediğiniz zaman hesap ayarlarından veya <a href="mailto:support@themaradi.com">support@themaradi.com</a> üzerinden iptal edebilirsiniz.
        </p>
        <ul>
          <li>İptal tarihine kadar tüm özellikler aktif kalır.</li>
          <li>İptal sonrasında kasa <strong>dondurulur</strong> — içerikler silinmez, yalnızca erişim durdurulur.</li>
          <li>Varisler, vefat sonrasında aboneliği yeniden aktif hale getirerek kasayı yayına alabilir.</li>
        </ul>
      </section>

      <section id="sureklilk">
        <h2>11. Hizmet Sürekliliği — Ömür Boyu Taahhüdü</h2>
        <p>
          Dijital anıt hizmetlerinde en kritik güven unsuru platformun kalıcılığıdır. The Maradi,
          bu konuda açık ve bağlayıcı bir taahhüt vermektedir:
        </p>
        <ul>
          <li>
            <strong>Ömür boyu açık kalma taahhüdü:</strong> The Maradi, süresiz olarak aktif kalmayı
            taahhüt eder. Platform hiçbir zaman &quot;kapatma tarihi&quot; olan bir hizmet olarak
            tasarlanmamıştır; dijital anıtlar nesiller boyunca erişilebilir kalacak şekilde kurgulanmıştır.
          </li>
          <li>
            <strong>Ömür boyu Anma Profili:</strong> Tek seferlik ücretle oluşturulan Anma Profilleri
            için hiçbir zaman ek ücret, yenileme veya abonelik talep edilmez. Fiyat artışları yalnızca
            yeni başvuruları etkiler; mevcut profiller bu değişikliklerden etkilenmez.
          </li>
          <li>
            <strong>Kalıcı QR yönlendirme:</strong> QR plakalar alan adı veya URL değişikliğinden bağımsız
            çalışır. QR kodlar fiziksel olarak mezar taşına kazınır ya da yerleştirilir; bu nedenle
            hiçbir koşulda geçersiz hale getirilmezler.
          </li>
          <li>
            <strong>Olağanüstü hal (force majeure):</strong> Beklenmedik bir durum nedeniyle hizmetin
            sürdürülmesinin fiilen imkânsız hale gelmesi durumunda kullanıcılara en az{' '}
            <strong>6 ay önceden</strong> bildirim yapılır ve içerikler standart formatlarda (ZIP)
            indirilebilir hale getirilir. Bu istisna yalnızca doğal afet, savaş hali veya yasal
            zorunluluk gibi kontrolümüz dışındaki durumlar için geçerlidir; ticari bir karar değildir.
          </li>
        </ul>
        <p>
          Bu taahhütler hukuki olarak bağlayıcı sözleşme yükümlülükleridir ve bu Koşullar&apos;ın ayrılmaz
          parçasını oluşturur.
        </p>
      </section>

      <section id="hukuk">
        <h2>12. Uygulanacak Hukuk ve Uyuşmazlık Çözümü</h2>
        <p>
          Bu Koşullar, Gürcistan hukuku kapsamında yorumlanır ve uygulanır. Uyuşmazlıklar önce taraflar
          arasında iyi niyetle çözülmeye çalışılır. Çözüme kavuşturulamazsa Batumi&apos;deki yetkili mahkemeler
          münhasır yetki sahibidir.
        </p>
        <p>
          Türkiye&apos;de yerleşik kullanıcılar, KVKK kapsamındaki uyuşmazlıklar için Kişisel Verileri Koruma
          Kurulu&apos;na başvurabilir.
        </p>
      </section>

      <section id="degisiklik">
        <h2>13. Koşul Değişiklikleri</h2>
        <p>
          Bu Koşullar değiştirildiğinde kayıtlı e-posta adresinize bildirim gönderilir. Değişiklik
          yürürlüğe girdikten sonra platformu kullanmaya devam etmek değişikliği kabul ettiğiniz anlamına gelir.
          Kabul etmiyorsanız hizmeti kullanmayı bırakabilir ve verilerinizin silinmesini talep edebilirsiniz.
        </p>
        <p>Sorularınız için: <a href="mailto:info@themaradi.com">info@themaradi.com</a></p>
      </section>

    </LegalPage>
  )
}
