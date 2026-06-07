import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Doğrulama ve İtiraz Politikası — The Maradi',
  description: 'Anma Profili kimlik doğrulama süreci, belge gereksinimleri ve 14 günlük itiraz penceresi.',
}

const toc = [
  { id: 'amac', label: '1. Amaç ve Kapsam' },
  { id: 'neden', label: '2. Neden Doğrulama Gerekiyor?' },
  { id: 'belgeler', label: '3. Gerekli Belgeler' },
  { id: 'surec', label: '4. Doğrulama Süreci' },
  { id: 'itiraz', label: '5. 14 Günlük İtiraz Penceresi' },
  { id: 'nasil', label: '6. İtiraz Nasıl Yapılır?' },
  { id: 'degerlendirme', label: '7. İtirazın Değerlendirilmesi' },
  { id: 'yasayan', label: '8. "Bu Kişi Hâlâ Yaşıyor" Bildirimi' },
  { id: 'sahte', label: '9. Sahte Başvurunun Sonuçları' },
  { id: 'gizlilik', label: '10. Belge Gizliliği' },
  { id: 'itiraz_red', label: '11. İtiraz Reddi ve İtiraz' },
  { id: 'iletisim', label: '12. İletişim' },
]

export default function VerificationPolicyPage() {
  return (
    <LegalPage
      eyebrow="Hukuki Belge"
      title="Doğrulama ve İtiraz Politikası"
      date="7 Haziran 2026"
      toc={toc}
    >

      <section id="amac">
        <h2>1. Amaç ve Kapsam</h2>
        <p>
          Bu politika, The Maradi platformunda <strong>Anma Profili</strong> oluşturulurken uygulanan kimlik
          doğrulama sürecini, gerekli belgeleri, inceleme adımlarını ve 14 günlük itiraz penceresini
          açıklamaktadır. Tüm Anma Profili başvuruları bu politika kapsamındadır.
        </p>
      </section>

      <section id="neden">
        <h2>2. Neden Doğrulama Gerekiyor?</h2>
        <p>
          Dijital anıt profillerinde en ciddi risk, yaşayan bir kişi adına sahte bir vefat profili
          oluşturulmasıdır. Bu durum:
        </p>
        <ul>
          <li>İlgili kişinin onuru ve mahremiyetine zarar verebilir,</li>
          <li>Aile üyelerinde derin psikolojik travmaya yol açabilir,</li>
          <li>Dolandırıcılık, miras usulsüzlüğü veya iftira gibi suçların aracı haline gelebilir.</li>
        </ul>
        <p>
          Bu nedenle The Maradi, her Anma Profili başvurusunda belge doğrulama ve itiraz penceresi
          zorunluluğu getirmektedir. Bu süreç tek taraflı bir şüphe değil; tüm başvurulara eşit şekilde
          uygulanan bir standart prosedürdür.
        </p>
      </section>

      <section id="belgeler">
        <h2>3. Gerekli Belgeler</h2>
        <p>Başvuru tamamlandıktan ve ödeme alındıktan sonra <strong>48 saat içinde</strong> aşağıdaki belgeler yüklenmelidir:</p>

        <h3>3.1 Başvuru Sahibinin Kimlik Belgesi</h3>
        <ul>
          <li>Geçerli nüfus cüzdanı veya pasaport (ön yüz)</li>
          <li>Belge üzerindeki ad/soyad ile başvuru formundaki bilgiler eşleşmelidir.</li>
        </ul>

        <h3>3.2 Vefat Belgesi</h3>
        <p>Aşağıdakilerden <strong>biri</strong> yeterlidir:</p>
        <ul>
          <li>Nüfus müdürlüğü / belediye tarafından düzenlenmiş resmi ölüm belgesi</li>
          <li>Hastane tarafından düzenlenmiş ölüm tutanağı</li>
          <li>Mahkeme tarafından verilmiş ölüm ilamı</li>
          <li>Cenaze hizmetleri sağlayıcısından alınan resmi belge</li>
        </ul>

        <h3>3.3 Akrabalık / Yetki Belgesi (Gerektiğinde)</h3>
        <p>
          Başvuru sahibi vefat edeni doğrudan tanımıyorsa (avukat, vasiyetnamenin uygulayıcısı vb.)
          yetki belgesi veya vekaletname talep edilebilir.
        </p>

        <h3>3.4 Belge Formatı</h3>
        <ul>
          <li>JPG, PNG veya PDF formatında; minimum 300 DPI kalitesinde</li>
          <li>Belge net, okunabilir ve kırpılmamış olmalıdır.</li>
          <li>Dosya boyutu 10 MB&apos;ı geçmemelidir.</li>
        </ul>
      </section>

      <section id="surec">
        <h2>4. Doğrulama Süreci</h2>

        <div className="not-prose space-y-4">
          {[
            {
              num: '01',
              title: 'Başvuru ve Ödeme',
              desc: 'Anma Profili formu doldurulur ve ödeme tamamlanır. Profil otomatik olarak pending_verification (doğrulama bekliyor) durumuna alınır. Bu aşamada profil kamuya görünmez.',
            },
            {
              num: '02',
              title: 'Belge Yükleme',
              desc: 'Başvuru sahibi, ödeme onayından itibaren 48 saat içinde gerekli belgeleri güvenli yükleme arayüzüne ekler. 48 saat içinde belge yüklenmezse başvuru askıya alınır ve destek ekibi iletişime geçer.',
            },
            {
              num: '03',
              title: 'Ön Kontrol',
              desc: 'Yüklenen belgeler otomatik formatlanır ve temel tutarlılık kontrolünden geçer (isim eşleşmesi, belge tarihi geçerliliği). Açık sorun yoksa inceleme ekibine iletilir.',
            },
            {
              num: '04',
              title: 'İnsan İncelemesi',
              desc: 'Doğrulama ekibi belgeler 24–48 iş saati içinde inceler. Eksik veya şüpheli durumda ek belge talep edilir; bu süre 72 saate uzayabilir. Tüm inceleme kararları kayıt altına alınır.',
            },
            {
              num: '05',
              title: 'Onay / Red',
              desc: 'Belgeler geçerliyse profil "onaylandı ve itiraz penceresinde" durumuna geçer. 14 günlük itiraz süresi başlar. Belgeler geçersizse başvuru sahibine gerekçeli red bildirimi gönderilir; yeniden başvuru hakkı tanınır.',
            },
            {
              num: '06',
              title: 'İtiraz Penceresi Sona Erer → Yayın',
              desc: '14 günlük süre boyunca geçerli bir itiraz gelmezse profil tam yayına alınır ve QR plaka üretimi başlar.',
            },
          ].map((step) => (
            <div key={step.num} className="flex gap-5 rounded-xl border border-[#e1d5c3] bg-[#fffdf8] p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#c7a76f] bg-[#f4eee3]">
                <span className="font-serif text-sm font-bold text-[#b08340]">{step.num}</span>
              </div>
              <div>
                <p className="font-serif text-base font-semibold text-[#173d31]">{step.title}</p>
                <p className="mt-1 text-sm leading-6 text-[#5b5245]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="itiraz">
        <h2>5. 14 Günlük İtiraz Penceresi</h2>
        <p>
          Belgeler onaylandıktan sonra profil hemen yayına girmez. <strong>14 takvim günlük bir itiraz penceresi</strong> uygulanır.
          Bu süre içinde:
        </p>
        <ul>
          <li>Profil URL&apos;i kamuya açık değildir; yalnızca başvuru sahibi tarafından görülebilir.</li>
          <li>Profil sayfasında &quot;Bu profil hakkında itirazım var&quot; bağlantısı bulunur.</li>
          <li>İlgili aile üyeleri veya kişinin kendisi (bkz. Bölüm 8) itiraz başlatabilir.</li>
        </ul>
        <p>
          14 günlük süre geçerli bir itiraz olmaksızın sona ererse profil tam yayına alınır.
          İtiraz gelirse profil askıya alınır ve inceleme süreci başlar.
        </p>
      </section>

      <section id="nasil">
        <h2>6. İtiraz Nasıl Yapılır?</h2>
        <p>İki yöntemle itiraz başlatılabilir:</p>
        <ul>
          <li><strong>Profil sayfasındaki &quot;İtiraz&quot; bağlantısına tıklayarak</strong> çevrimiçi form doldurmak.</li>
          <li><a href="mailto:privacy@themaradi.com">privacy@themaradi.com</a> adresine e-posta göndermek.</li>
        </ul>
        <p>İtiraz formunda şunlar belirtilmelidir:</p>
        <ul>
          <li>İtiraz edenin adı, soyadı ve iletişim bilgileri</li>
          <li>İtiraz gerekçesi (örnek: &quot;Bu kişi hâlâ yaşıyor&quot; / &quot;Bilgiler yanlış&quot; / &quot;Yetkim olmadan oluşturuldu&quot;)</li>
          <li>Varsa destekleyici belge veya kanıt</li>
        </ul>
        <p>
          İtiraz başvuruları <strong>anonim olarak kabul edilmez.</strong> Sahte itirazların sorumluluğu
          itiraz edene aittir.
        </p>
      </section>

      <section id="degerlendirme">
        <h2>7. İtirazın Değerlendirilmesi</h2>
        <p>İtiraz alındığında:</p>
        <ul>
          <li>Profil derhal askıya alınır ve kamuya görünmez hale getirilir.</li>
          <li>Hem başvuru sahibi hem de itiraz eden bilgilendirilir.</li>
          <li>İnceleme ekibi her iki tarafın belgelerini değerlendirir; gerekirse ek belge talep eder.</li>
          <li>Karar <strong>en geç 10 iş günü</strong> içinde verilir.</li>
        </ul>
        <div className="not-prose overflow-hidden rounded-xl border border-[#e1d5c3]">
          <table className="w-full text-sm">
            <thead className="bg-[#f4eee3] text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-[#173d31]">Karar</th>
                <th className="px-4 py-3 font-semibold text-[#173d31]">Sonuç</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1d5c3]">
              {[
                ['İtiraz haklı bulundu', 'Profil kalıcı olarak silindi; başvuru sahibine bildirim yapıldı. Sahte başvuruysa hukuki süreç başlatıldı.'],
                ['İtiraz kısmen haklı', 'Profildeki yanlış bilgiler düzeltildi; profil düzeltilmiş haliyle yayına girdi.'],
                ['İtiraz haksız bulundu', 'Profil yayına alındı; itiraz eden bilgilendirildi.'],
                ['Karar verilemeyen durum', 'Ek 10 günlük inceleme süresi tanındı; gerekirse yasal mercilere başvuruldu.'],
              ].map(([karar, sonuc]) => (
                <tr key={karar} className="bg-[#fffdf8]">
                  <td className="px-4 py-3 font-medium text-[#173d31]">{karar}</td>
                  <td className="px-4 py-3 text-[#4c463c]">{sonuc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="yasayan">
        <h2>8. &quot;Bu Kişi Hâlâ Yaşıyor&quot; Bildirimi</h2>
        <p>
          Profil oluşturulan kişi hâlâ yaşıyorsa ve bu durumu öğrendiyse aşağıdaki adımları izleyebilir:
        </p>
        <ul>
          <li><a href="mailto:privacy@themaradi.com">privacy@themaradi.com</a> adresine &quot;Ben yaşıyorum — acil&quot; konusuyla e-posta gönderebilir.</li>
          <li>Kimliğini kanıtlayan bir belge (fotoğraflı kimlik + tarihli bir selfie) ekleyebilir.</li>
        </ul>
        <p>
          Bu bildirim alındığında profil <strong>derhal ve otomatik olarak askıya alınır</strong> (inceleme
          beklenmez). Kimlik doğrulandıktan sonra profil kalıcı olarak silinir ve başvuru sahibi hakkında
          yasal süreç değerlendirmesi başlatılır.
        </p>
        <p>Acil bildirimlere <strong>4 iş saati</strong> içinde dönüş yapılır.</p>
      </section>

      <section id="sahte">
        <h2>9. Sahte Başvurunun Sonuçları</h2>
        <p>Yaşayan biri için kasıtlı olarak vefat profili oluşturulduğu tespit edilirse:</p>
        <ul>
          <li>Hesap kalıcı olarak kapatılır.</li>
          <li>Ödeme iade edilmez.</li>
          <li>Kimlik belgeleri ve başvuru bilgileri yetkili makamlara teslim edilebilir.</li>
          <li>Mağdurun talebi halinde hukuki süreç başlatılmasına destek sağlanır.</li>
          <li>Eylem; Gürcistan, Türkiye ve/veya AB hukuku kapsamında kimliğe bürünme, iftira veya
          mahremiyet ihlali olarak değerlendirilebilir.</li>
        </ul>
      </section>

      <section id="gizlilik">
        <h2>10. Belge Gizliliği ve Güvenliği</h2>
        <ul>
          <li>Tüm belgeler TLS 1.3 şifreli bağlantıyla iletilir.</li>
          <li>Cloudflare R2&apos;de AES-256 ile şifreli depolanır.</li>
          <li>Yalnızca doğrulama ekibine erişim hakkı tanınır.</li>
          <li>Onay/ret kararından itibaren <strong>30 gün içinde</strong> kalıcı olarak silinir.</li>
          <li>Silme işlemi audit loguna kaydedilir.</li>
          <li>Belgeler pazarlama, analitik veya başka bir amaçla kullanılmaz.</li>
        </ul>
        <p>Belge güvenliği hakkında detaylı bilgi için bkz. <a href="/privacy">Gizlilik Politikası</a>.</p>
      </section>

      <section id="itiraz_red">
        <h2>11. Karar İtirazı (Üst İnceleme)</h2>
        <p>
          Doğrulama veya itiraz kararına karşı çıkmak istiyorsanız karar bildiriminden itibaren
          <strong> 14 gün içinde</strong> <a href="mailto:privacy@themaradi.com">privacy@themaradi.com</a> adresine
          &quot;Üst İnceleme Talebi&quot; konusuyla yazabilirsiniz.
        </p>
        <p>
          Üst inceleme, ilk incelemeye katılmayan farklı bir ekip üyesi tarafından yapılır ve
          <strong> 10 iş günü</strong> içinde sonuçlandırılır. Bu süreç platformun nihai kararıdır;
          devlet makamlarına başvuru hakkı saklıdır.
        </p>
      </section>

      <section id="iletisim">
        <h2>12. İletişim</h2>
        <div className="not-prose rounded-xl border border-[#e1d5c3] bg-[#f7f2e9] p-5 text-sm text-[#4c463c]">
          <p><strong className="text-[#173d31]">Doğrulama ve itiraz soruları:</strong> <a href="mailto:privacy@themaradi.com" className="text-[#9a7132]">privacy@themaradi.com</a></p>
          <p><strong className="text-[#173d31]">Acil &quot;yaşayan kişi&quot; bildirimi:</strong> <a href="mailto:privacy@themaradi.com" className="text-[#9a7132]">privacy@themaradi.com</a> — konu: <em>Ben yaşıyorum — acil</em></p>
          <p><strong className="text-[#173d31]">Telefon:</strong> +995 555 511 884</p>
          <p className="mt-2 text-[#8a7a64]">Standart yanıt süresi: 24–48 iş saati. Acil bildirimler: 4 iş saati.</p>
        </div>
      </section>

    </LegalPage>
  )
}
