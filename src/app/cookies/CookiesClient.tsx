'use client'

import LegalPage from '@/components/legal/LegalPage'
import { useLang } from '@/i18n/context'

export default function CookiesClient() {
  const { t } = useLang()
  const p = t.legal.cookies
  const s = p.sections

  return (
    <LegalPage eyebrow={p.eyebrow} title={p.title} date={p.date} toc={p.toc}>

      <section id="zorunlu">
        <h2>{s.essential.h}</h2>
        <p>{s.essential.p}</p>
      </section>

      <section id="tercihler">
        <h2>{s.preferences.h}</h2>
        <p>{s.preferences.p}</p>
      </section>

      <section id="analitik">
        <h2>{s.analytics.h}</h2>
        <p>{s.analytics.p}</p>
      </section>

      <section id="kontrol">
        <h2>{s.control.h}</h2>
        <p>{s.control.p}</p>
      </section>

    </LegalPage>
  )
}
