'use client'

import LegalPage from '@/components/legal/LegalPage'
import { useLang } from '@/i18n/context'

export default function VerificationPolicyClient() {
  const { t } = useLang()
  const p = t.legal.verification
  const s = p.sections

  return (
    <LegalPage eyebrow={p.eyebrow} title={p.title} date={p.date} toc={p.toc}>

      <section id="amac">
        <h2>{s.purpose.h}</h2>
        <p>{s.purpose.p}</p>
      </section>

      <section id="neden">
        <h2>{s.why.h}</h2>
        <p>{s.why.p}</p>
        <ul>{s.why.items.map((item) => <li key={item}>{item}</li>)}</ul>
        <p>{s.why.p2}</p>
      </section>

      <section id="belgeler">
        <h2>{s.documents.h}</h2>
        <h3>{s.documents.h2a}</h3>
        <ul>{s.documents.items2a.map((item) => <li key={item}>{item}</li>)}</ul>
        <h3>{s.documents.h2b}</h3>
        <ul>{s.documents.items2b.map((item) => <li key={item}>{item}</li>)}</ul>
        <p><em>{s.documents.note}</em></p>
      </section>

      <section id="surec">
        <h2>{s.process.h}</h2>
        <div className="not-prose space-y-4">
          {s.process.steps.map((step) => (
            <div key={step.num} className="flex gap-5 rounded-xl border border-[#e1d5c3] bg-[#fffdf8] p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#c7a76f] bg-[#f4eee3]">
                <span className="font-serif text-sm font-bold text-[#b08340]">{step.num}</span>
              </div>
              <div>
                <p className="font-serif text-base font-semibold text-[#173d31]">{step.title}</p>
                <p className="mt-1 text-sm leading-6 text-[#5b5245]">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="itiraz">
        <h2>{s.objectionWindow.h}</h2>
        <p>{s.objectionWindow.p}</p>
        <ul>{s.objectionWindow.items.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section id="nasil">
        <h2>{s.howToObject.h}</h2>
        <ul>{s.howToObject.methods.map((m) => <li key={m}>{m}</li>)}</ul>
        <p>{s.howToObject.p}</p>
      </section>

      <section id="degerlendirme">
        <h2>{s.evaluation.h}</h2>
        <ul>{s.evaluation.items.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section id="yasayan">
        <h2>{s.stillAlive.h}</h2>
        <p>{s.stillAlive.p}</p>
        <ul>{s.stillAlive.items.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section id="sahte">
        <h2>{s.fakeApplication.h}</h2>
        <ul>{s.fakeApplication.items.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section id="gizlilik">
        <h2>{s.confidentiality.h}</h2>
        <p>{s.confidentiality.p}</p>
      </section>

      <section id="itiraz_red">
        <h2>{s.appeal.h}</h2>
        <p>{s.appeal.p}</p>
      </section>

      <section id="iletisim">
        <h2>{s.contactSection.h}</h2>
        <div className="not-prose rounded-xl border border-[#e1d5c3] bg-[#f7f2e9] p-5 text-sm text-[#4c463c]">
          <p><a href={`mailto:${s.contactSection.email}`} className="text-[#9a7132]">{s.contactSection.email}</a></p>
          <p>{s.contactSection.tel}</p>
          <p>{s.contactSection.address}</p>
        </div>
      </section>

    </LegalPage>
  )
}
