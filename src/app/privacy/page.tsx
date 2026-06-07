import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası — The Maradi',
  description: 'The Maradi kişisel veri işleme politikası. GDPR, Gürcistan KVK ve KVKK uyumlu.',
}

const toc = [
  { id: 'taraflar', label: '1. Veri Sorumlusu' },
  { id: 'toplanan', label: '2. Toplanan Veriler' },
  { id: 'amaclar', label: '3. İşleme Amaçları' },
  { id: 'ozel', label: '4. Özel Nitelikli Veriler' },
  { id: 'saklama', label: '5. Saklama Süreleri' },
  { id: 'guvenlik', label: '6. Güvenlik' },
  { id: 'ucuncu', label: '7. Üçüncü Taraflar' },
  { id: 'transfer', label: '8. Uluslararası Transfer' },
  { id: 'haklar', label: '9. Kullanıcı Hakları' },
  { id: 'cerezler', label: '10. Çerezler' },
  { id: 'cocuklar', label: '11. Çocukların Gizliliği' },
  { id: 'degisiklik', label: '12. Değişiklikler' },
  { id: 'iletisim', label: '13. İletişim' },
]

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Hukuki Belge" title="Gizlilik Politikası" date="7 Haziran 2026 · GDPR · Gürcistan KVK · KVKK uyumlu" toc={toc}>

      <section id="taraflar">
        <h2>1. Veri Sorumlusu</h2>
        <p>
          Bu politika, <strong>The Maradi</strong> ticari unvanıyla faaliyet gösteren ve aşağıdaki adreste kayıtlı
          veri sorumlusuna aittir:
        </p>
        <div className="not-prose my-4 rounded-xl border border-[#e1d5c3] bg-[#f7f2e9] p-5 text-sm text-[#4c463c]">
          <p className="font-semibold text-[#173d31]">The Maradi</p>
          <p>Petre Bagrationi Str. 220, Batumi, Gürcistan</p>
          <p>E-posta: <a href="mailto:privacy@themaradi.com" className="text-[#9a7132]">privacy@themaradi.com</a></p>
          <p>Tel: +995 555 511 884</p>
        </div>
        <p>
          The Maradi; Gürcistan Kişisel Verilerin Koruma Kanunu (2012, rev. 2024), AB Genel Veri Koruma Tüzüğü
          (GDPR — 2016/679) ve Türkiye&apos;de yerleşik kullanıcılar için 6698 sayılı KVKK kapsamında
          kişisel verilerinizi işler.
        </p>
      </section>

      <section id="toplanan">
        <h2>2. Toplanan Veriler</h2>
        <h3>2.1 Hesap ve Kimlik Verileri</h3>
        <ul>
          <li>Ad, soyad, e-posta adresi, telefon numarası</li>
          <li>Şifre (bcrypt karması — düz metin asla saklanmaz)</li>
          <li>Profil fotoğrafı (isteğe bağlı)</li>
        </ul>
        <h3>2.2 Anma Profili / Vault İçerikleri</h3>
        <ul>
          <li>Vefat eden kişiye ait ad, doğum/vefat tarihi, biyografik bilgiler</li>
          <li>Fotoğraflar, videolar, ses kayıtları (kullanıcı tarafından yüklenen)</li>
          <li>Mezarlık adresi ve GPS koordinatları</li>
          <li>Taziye mesajları, mum / çiçek / dua etkileşimleri ve bu etkileşimlere eklenen isim/iletişim bilgisi</li>
        </ul>
        <h3>2.3 Doğrulama Belgeleri</h3>
        <ul>
          <li>Başvuru sahibinin kimlik belgesi (nüfus cüzdanı veya pasaport)</li>
          <li>Vefat belgesi veya ölüm ilamı</li>
          <li>Bu belgeler yalnızca doğrulama amacıyla işlenir; onay/ret kararından itibaren <strong>en geç 30 gün içinde kalıcı olarak silinir.</strong></li>
        </ul>
        <h3>2.4 Teknik Veriler</h3>
        <ul>
          <li>IP adresi (güvenlik amaçlı, anonimleştirilmiş)</li>
          <li>Tarayıcı türü, cihaz bilgisi, oturum verileri</li>
          <li>QR kod tarama logları (kod, zaman, ülke — vault_id ile ilişkilendirilmiş)</li>
        </ul>
        <h3>2.5 Ödeme Verileri</h3>
        <p>
          Ödeme işlemleri TBC Pay, BOG Pay veya Stripe üzerinden gerçekleştirilir. Kart bilgileri
          sistemimizde <strong>saklanmaz</strong>; yalnızca işlem referans numarası ve tutarı kayıt altına alınır.
        </p>
      </section>

      <section id="amaclar">
        <h2>3. Veri İşleme Amaçları ve Hukuki Dayanakları</h2>
        <div className="not-prose overflow-hidden rounded-xl border border-[#e1d5c3]">
          <table className="w-full text-sm">
            <thead className="bg-[#f4eee3] text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-[#173d31]">Amaç</th>
                <th className="px-4 py-3 font-semibold text-[#173d31]">Hukuki Dayanak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1d5c3]">
              {[
                ['Hizmet sunumu (hesap, vault, profil yönetimi)', 'Sözleşmenin ifası'],
                ['Kimlik doğrulama ve sahte profil önleme', 'Meşru menfaat / Hukuki yükümlülük'],
                ['Ödeme işlemleri', 'Sözleşmenin ifası'],
                ['QR yönlendirme ve tarama logu', 'Meşru menfaat'],
                ['Varis bildirim e-postaları', 'Sözleşmenin ifası'],
                ['Güvenlik, dolandırıcılık tespiti', 'Meşru menfaat / Hukuki yükümlülük'],
                ['Hizmet iyileştirme ve analitik', 'Meşru menfaat (anonimleştirilmiş)'],
                ['Pazarlama e-postaları', 'Açık rıza'],
              ].map(([purpose, basis]) => (
                <tr key={purpose} className="bg-[#fffdf8]">
                  <td className="px-4 py-3 text-[#4c463c]">{purpose}</td>
                  <td className="px-4 py-3 text-[#5b5245]">{basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="ozel">
        <h2>4. Özel Nitelikli Kişisel Veriler</h2>
        <p>
          Doğrulama sürecinde toplanan kimlik ve vefat belgeleri, GDPR Madde 9 ile KVKK Madde 6 kapsamında
          özel nitelikli kişisel veri içerebilir. Bu veriler:
        </p>
        <ul>
          <li>Yalnızca yetkili bir yakın tarafından, açık rızayla iletilir.</li>
          <li>Cloudflare R2&apos;de AES-256 şifreli olarak depolanır.</li>
          <li>Yalnızca doğrulama ekibine erişim hakkı tanınır; başka hiçbir tarafla paylaşılmaz.</li>
          <li>Onay ya da ret kararından itibaren <strong>en geç 30 gün</strong> içinde kalıcı olarak silinir ve silme kaydı audit loguna işlenir.</li>
        </ul>
      </section>

      <section id="saklama">
        <h2>5. Veri Saklama Süreleri</h2>
        <div className="not-prose overflow-hidden rounded-xl border border-[#e1d5c3]">
          <table className="w-full text-sm">
            <thead className="bg-[#f4eee3] text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-[#173d31]">Veri Kategorisi</th>
                <th className="px-4 py-3 font-semibold text-[#173d31]">Saklama Süresi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1d5c3]">
              {[
                ['Hesap verileri', 'Hesap aktif olduğu sürece + silme talebinden 30 gün sonra'],
                ['Anma profili içeriği', 'Ömür boyu (hizmet aktif olduğu sürece) veya silme talebine kadar'],
                ['Kimlik ve vefat belgeleri', 'Onay/ret kararından itibaren en geç 30 gün'],
                ['Ödeme kayıtları', '10 yıl (muhasebe/vergi yükümlülüğü)'],
                ['QR tarama logları', '24 ay (anonimleştirilmiş)'],
                ['Güvenlik logları', '12 ay'],
                ['Pazarlama onay kaydı', 'Onay geri alınana kadar + 3 yıl ispat amaçlı'],
              ].map(([cat, dur]) => (
                <tr key={cat} className="bg-[#fffdf8]">
                  <td className="px-4 py-3 text-[#4c463c]">{cat}</td>
                  <td className="px-4 py-3 text-[#5b5245]">{dur}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="guvenlik">
        <h2>6. Güvenlik Önlemleri</h2>
        <ul>
          <li>Tüm veri iletimi TLS 1.3 ile şifrelenir.</li>
          <li>Veritabanı (Supabase/PostgreSQL) satır bazlı güvenlik (RLS) ile korunur; her kullanıcı yalnızca kendi verilerine erişebilir.</li>
          <li>Medya dosyaları Cloudflare R2&apos;de AES-256 şifreli olarak depolanır.</li>
          <li>Servis hesapları prensip-en-az-yetki ile yapılandırılmıştır.</li>
          <li>Şifreler bcrypt algoritmasıyla karmalanır; düz metin asla tutulmaz.</li>
          <li>Doğrulama belgelerine erişim yalnızca doğrulama ekibiyle sınırlıdır.</li>
          <li>Güvenlik açığı bildirimi: <a href="mailto:privacy@themaradi.com">privacy@themaradi.com</a></li>
        </ul>
      </section>

      <section id="ucuncu">
        <h2>7. Üçüncü Taraflarla Veri Paylaşımı</h2>
        <p>Kişisel verilerinizi <strong>satmıyoruz.</strong> Yalnızca aşağıdaki veri işleyicilerle, hizmet sunumu için gerekli ölçüde paylaşırız:</p>
        <div className="not-prose overflow-hidden rounded-xl border border-[#e1d5c3]">
          <table className="w-full text-sm">
            <thead className="bg-[#f4eee3] text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-[#173d31]">Sağlayıcı</th>
                <th className="px-4 py-3 font-semibold text-[#173d31]">Amaç</th>
                <th className="px-4 py-3 font-semibold text-[#173d31]">Konum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1d5c3]">
              {[
                ['Supabase Inc.', 'Veritabanı ve kimlik doğrulama', 'AB (Frankfurt)'],
                ['Cloudflare R2', 'Medya dosyası depolama', 'Çoklu bölge'],
                ['Vercel Inc.', 'Uygulama barındırma', 'ABD / AB'],
                ['Resend Inc.', 'İşlemsel e-posta', 'ABD'],
                ['TBC Pay / BOG Pay', 'Ödeme işleme', 'Gürcistan'],
              ].map(([name, purpose, loc]) => (
                <tr key={name} className="bg-[#fffdf8]">
                  <td className="px-4 py-3 font-medium text-[#173d31]">{name}</td>
                  <td className="px-4 py-3 text-[#4c463c]">{purpose}</td>
                  <td className="px-4 py-3 text-[#5b5245]">{loc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>Tüm veri işleyicilerle GDPR uyumlu veri işleme sözleşmesi (DPA) imzalanmıştır.</p>
      </section>

      <section id="transfer">
        <h2>8. Uluslararası Veri Transferi</h2>
        <p>Verileriniz Gürcistan dışındaki sunucularda işlenebilir. Bu transferlerde:</p>
        <ul>
          <li>AB aktarımları için Standart Sözleşme Maddeleri (SCC) uygulanır.</li>
          <li>ABD aktarımları için GDPR uyumlu veri işleyici sözleşmeleri mevcuttur.</li>
          <li>Tüm transferler Gürcistan KVK Madde 17 kapsamında değerlendirilmiştir.</li>
        </ul>
      </section>

      <section id="haklar">
        <h2>9. Haklarınız</h2>
        <h3>GDPR (AB / AEA Kullanıcıları)</h3>
        <ul>
          <li><strong>Erişim (Md. 15):</strong> Hakkınızdaki verilerin kopyasını talep edebilirsiniz.</li>
          <li><strong>Düzeltme (Md. 16):</strong> Yanlış verilerin düzeltilmesini isteyebilirsiniz.</li>
          <li><strong>Silme (Md. 17):</strong> Verilerinizin silinmesini talep edebilirsiniz.</li>
          <li><strong>Kısıtlama (Md. 18):</strong> İşlemenin kısıtlanmasını talep edebilirsiniz.</li>
          <li><strong>Taşınabilirlik (Md. 20):</strong> Verilerinizi makine okunabilir biçimde alabilirsiniz.</li>
          <li><strong>İtiraz (Md. 21):</strong> Meşru menfaat dayanağıyla yapılan işlemelere itiraz edebilirsiniz.</li>
        </ul>
        <h3>KVKK (Türkiye&apos;de Yerleşik Kullanıcılar)</h3>
        <ul>
          <li>KVKK Madde 11 kapsamında bilgi edinme, düzeltme, silme, aktarımın bildirilmesi, itiraz ve zararın giderilmesi haklarına sahipsiniz.</li>
          <li>Başvurular <a href="mailto:privacy@themaradi.com">privacy@themaradi.com</a> adresine yazılı olarak yapılır; 30 gün içinde yanıtlanır.</li>
          <li>Kişisel Verileri Koruma Kurulu&apos;na (kvkk.gov.tr) şikâyette bulunabilirsiniz.</li>
        </ul>
        <h3>Gürcistan KVK</h3>
        <ul>
          <li>Gürcistan&apos;da yerleşik kişiler Kişisel Veri Koruma Servisi&apos;ne (pdp.ge) şikâyette bulunabilir.</li>
        </ul>
        <p>Tüm talepler için: <a href="mailto:privacy@themaradi.com">privacy@themaradi.com</a> — 30 takvim günü içinde yanıtlanır.</p>
      </section>

      <section id="cerezler">
        <h2>10. Çerezler ve İzleme</h2>
        <p>Platformumuz yalnızca işlevsel çerezler kullanır. Üçüncü taraf reklam ağları veya davranışsal izleme çerezleri <strong>kullanılmaz.</strong></p>
        <ul>
          <li><strong>Oturum çerezleri:</strong> Giriş durumunuzu korur; tarayıcı kapandığında silinir.</li>
          <li><strong>CSRF koruma çerezleri:</strong> Form güvenliği için; kalıcı değildir.</li>
        </ul>
        <p>Çerezleri tarayıcınızdan devre dışı bırakabilirsiniz; bu durumda giriş gerektiren özellikler çalışmayabilir.</p>
      </section>

      <section id="cocuklar">
        <h2>11. Çocukların Gizliliği</h2>
        <p>
          Hizmetlerimiz 18 yaşın altındaki bireylere yönelik değildir. Bu durumu fark ettiğimizde hesabı ve
          verileri kalıcı olarak sileriz. Bildirmek için: <a href="mailto:privacy@themaradi.com">privacy@themaradi.com</a>
        </p>
      </section>

      <section id="degisiklik">
        <h2>12. Politika Değişiklikleri</h2>
        <p>
          Önemli değişikliklerde kayıtlı e-posta adresinize bildirim gönderilir ve sitede duyurulur.
          Değişikliğin yürürlüğe giriş tarihinden itibaren hizmeti kullanmaya devam etmeniz kabul anlamına gelir.
        </p>
      </section>

      <section id="iletisim">
        <h2>13. İletişim</h2>
        <div className="not-prose rounded-xl border border-[#e1d5c3] bg-[#f7f2e9] p-5 text-sm text-[#4c463c]">
          <p><strong className="text-[#173d31]">Gizlilik talepleri:</strong> <a href="mailto:privacy@themaradi.com" className="text-[#9a7132]">privacy@themaradi.com</a></p>
          <p><strong className="text-[#173d31]">Genel iletişim:</strong> <a href="mailto:info@themaradi.com" className="text-[#9a7132]">info@themaradi.com</a></p>
          <p><strong className="text-[#173d31]">Posta:</strong> Petre Bagrationi Str. 220, Batumi, Gürcistan</p>
          <p className="mt-2 text-[#8a7a64]">Yanıt süresi: En fazla 30 takvim günü.</p>
        </div>
      </section>

    </LegalPage>
  )
}
