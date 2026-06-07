import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Çerez Politikası — The Maradi',
}

const toc = [
  { id: 'zorunlu', label: '1. Zorunlu Çerezler' },
  { id: 'tercihler', label: '2. Yerel Tercihler' },
  { id: 'analitik', label: '3. Analitik' },
  { id: 'kontrol', label: '4. Kontrol' },
]

export default function CookiesPage() {
  return (
    <LegalPage eyebrow="Hukuki Belge" title="Çerez Politikası" date="7 Haziran 2026" toc={toc}>

      <section id="zorunlu">
        <h2>1. Zorunlu Çerezler</h2>
        <p>
          Kimlik doğrulama ve oturum çerezleri; giriş yapma, kontrol paneline erişim ve hesap
          güvenliği için zorunludur. Bu çerezler devre dışı bırakılamaz.
        </p>
      </section>

      <section id="tercihler">
        <h2>2. Yerel Tercihler</h2>
        <p>
          Dil tercihi, seçilen dilin ziyaretler arasında korunması amacıyla tarayıcının yerel
          depolama alanında saklanabilir.
        </p>
      </section>

      <section id="analitik">
        <h2>3. Analitik</h2>
        <p>
          QR taramaları; zaman damgası, cihaz türü ve yaklaşık konum başlığı gibi sınırlı teknik
          analitik verilerini saklayabilir. Bu veriler anonimleştirilmiş olarak işlenir.
        </p>
      </section>

      <section id="kontrol">
        <h2>4. Kontrol</h2>
        <p>
          Çerezleri tarayıcı ayarlarından yönetebilirsiniz. Zorunlu çerezlerin engellenmesi
          giriş yapmanızı veya kontrol paneline erişmenizi engelleyebilir.
        </p>
      </section>

    </LegalPage>
  )
}
