'use client'

import LegalPage from '@/components/legal/LegalPage'
import { useLang } from '@/i18n/context'

export default function TermsClient() {
  const { t } = useLang()
  const p = t.legal.terms
  const c = p.content

  return (
    <LegalPage eyebrow={p.eyebrow} title={p.title} date={p.date} toc={p.toc}>

      <section id="taraflar">
        <h2>{c.parties.h}</h2>
        <p>{c.parties.p1}</p>
        <p>{c.parties.p2}</p>
      </section>

      <section id="hizmetler">
        <h2>{c.services.h}</h2>
        <p>{c.services.p}</p>
        <h3>{c.services.memorialH}</h3>
        <p>{c.services.memorialP}</p>
        <h3>{c.services.vaultH}</h3>
        <p>{c.services.vaultP}</p>
      </section>

      <section id="hesap">
        <h2>{c.account.h}</h2>
        <ul>{c.account.items.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section id="yasak">
        <h2>{c.prohibited.h}</h2>
        <ul>{c.prohibited.items.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section id="dogrulama">
        <h2>{c.verificationTerms.h}</h2>
        <p>{c.verificationTerms.p}</p>
      </section>

      <section id="odeme">
        <h2>{c.payment.h}</h2>
        <ul>{c.payment.items.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section id="icerik">
        <h2>{c.content.h}</h2>
        <p>{c.content.p1}</p>
        <p>{c.content.p2}</p>
      </section>

      <section id="sorumluluk">
        <h2>{c.liability.h}</h2>
        <p>{c.liability.p}</p>
      </section>

      <section id="askiya">
        <h2>{c.suspension.h}</h2>
        <ul>{c.suspension.items.map((item) => <li key={item}>{item}</li>)}</ul>
        <p>{c.suspension.p}</p>
      </section>

      <section id="abonelik">
        <h2>{c.cancellation.h}</h2>
        <p>{c.cancellation.p}</p>
      </section>

      <section id="sureklilk">
        <h2>{c.continuity.h}</h2>
        <p>{c.continuity.p}</p>
      </section>

      <section id="hukuk">
        <h2>{c.law.h}</h2>
        <p>{c.law.p}</p>
      </section>

      <section id="degisiklik">
        <h2>{c.changes.h}</h2>
        <p>{c.changes.p}</p>
      </section>

      <section id="iletisim">
        <h2>{c.contactSection.h}</h2>
        <p><a href={`mailto:${c.contactSection.email}`} className="text-[#9a7132]">{c.contactSection.email}</a></p>
        <p>{c.contactSection.tel}</p>
        <p>{c.contactSection.address}</p>
      </section>

    </LegalPage>
  )
}
