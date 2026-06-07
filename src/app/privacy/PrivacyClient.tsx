'use client'

import LegalPage from '@/components/legal/LegalPage'
import { useLang } from '@/i18n/context'

export default function PrivacyClient() {
  const { t } = useLang()
  const p = t.legal.privacy
  const s = p.sections

  return (
    <LegalPage eyebrow={p.eyebrow} title={p.title} date={p.date} toc={p.toc}>

      <section id="taraflar">
        <h2>{s.controller.h}</h2>
        <p>{s.controller.p1}</p>
        <div className="not-prose my-4 rounded-xl border border-[#e1d5c3] bg-[#f7f2e9] p-5 text-sm text-[#4c463c]">
          <p className="font-semibold text-[#173d31]">The Maradi</p>
          <p>{s.controller.address}</p>
          <p>E-mail: <a href={`mailto:${s.controller.email}`} className="text-[#9a7132]">{s.controller.email}</a></p>
          <p>Tel: {s.controller.tel}</p>
        </div>
        <p>{s.controller.p2}</p>
      </section>

      <section id="toplanan">
        <h2>{s.collected.h}</h2>
        <h3>{s.collected.h2a}</h3>
        <ul>{s.collected.items2a.map((item) => <li key={item}>{item}</li>)}</ul>
        <h3>{s.collected.h2b}</h3>
        <ul>{s.collected.items2b.map((item) => <li key={item}>{item}</li>)}</ul>
        <h3>{s.collected.h2c}</h3>
        <ul>{s.collected.items2c.map((item) => <li key={item}>{item}</li>)}</ul>
        <p><em>{s.collected.noteVerification}</em></p>
        <h3>{s.collected.h2d}</h3>
        <ul>{s.collected.items2d.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section id="amaclar">
        <h2>{s.purposes.h}</h2>
        <ul>{s.purposes.items.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section id="ozel">
        <h2>{s.special.h}</h2>
        <p>{s.special.p}</p>
      </section>

      <section id="saklama">
        <h2>{s.retention.h}</h2>
        <div className="not-prose overflow-hidden rounded-xl border border-[#e1d5c3]">
          <table className="w-full text-sm">
            <thead className="bg-[#f4eee3] text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-[#173d31]">Category</th>
                <th className="px-4 py-3 font-semibold text-[#173d31]">Retention Period</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1d5c3]">
              {s.retention.rows.map(([cat, dur]) => (
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
        <h2>{s.security.h}</h2>
        <ul>{s.security.items.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section id="ucuncu">
        <h2>{s.thirdParties.h}</h2>
        <div className="not-prose overflow-hidden rounded-xl border border-[#e1d5c3]">
          <table className="w-full text-sm">
            <thead className="bg-[#f4eee3] text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-[#173d31]">Provider</th>
                <th className="px-4 py-3 font-semibold text-[#173d31]">Purpose</th>
                <th className="px-4 py-3 font-semibold text-[#173d31]">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1d5c3]">
              {s.thirdParties.rows.map(([name, purpose, loc]) => (
                <tr key={name} className="bg-[#fffdf8]">
                  <td className="px-4 py-3 font-medium text-[#173d31]">{name}</td>
                  <td className="px-4 py-3 text-[#4c463c]">{purpose}</td>
                  <td className="px-4 py-3 text-[#5b5245]">{loc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>{s.thirdParties.note}</p>
      </section>

      <section id="transfer">
        <h2>{s.transfer.h}</h2>
        <p>{s.transfer.p}</p>
      </section>

      <section id="haklar">
        <h2>{s.rights.h}</h2>
        <ul>{s.rights.items.map((item) => <li key={item}>{item}</li>)}</ul>
        <p>{s.rights.contact} <a href={`mailto:${s.rights.email}`}>{s.rights.email}</a></p>
        <p>{s.rights.note}</p>
      </section>

      <section id="cerezler">
        <h2>{s.cookies.h}</h2>
        <p>{s.cookies.p}</p>
      </section>

      <section id="cocuklar">
        <h2>{s.children.h}</h2>
        <p>{s.children.p}</p>
      </section>

      <section id="degisiklik">
        <h2>{s.changes.h}</h2>
        <p>{s.changes.p}</p>
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
