'use client'

import LegalPage from '@/components/legal/LegalPage'
import { useLang } from '@/i18n/context'

export default function KvkkClient() {
  const { t } = useLang()
  const p = t.legal.kvkk
  const s = p.sections

  return (
    <LegalPage eyebrow={p.eyebrow} title={p.title} date={p.date} toc={p.toc}>

      <section id="sorumluluk">
        <h2>{s.controller.h}</h2>
        <p>{s.controller.p}</p>
      </section>

      <section id="kategoriler">
        <h2>{s.categories.h}</h2>
        <ul>{s.categories.items.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section id="amaclar">
        <h2>{s.purposes.h}</h2>
        <ul>{s.purposes.items.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section id="haklar">
        <h2>{s.rights.h}</h2>
        <p>{s.rights.p1}</p>
        <p>{s.rights.p2} <a href={`mailto:${s.rights.email}`}>{s.rights.email}</a>{s.rights.note}</p>
      </section>

    </LegalPage>
  )
}
