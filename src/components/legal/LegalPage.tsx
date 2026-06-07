import Link from 'next/link'

export interface LegalSection {
  title: string
  body: string[]
}

export default function LegalPage({
  eyebrow,
  title,
  description,
  sections,
}: {
  eyebrow: string
  title: string
  description: string
  sections: LegalSection[]
}) {
  return (
    <main className="theme-corporate min-h-screen bg-[#f5f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl gradient-text">themaradi</Link>
          <Link href="/login" className="text-sm bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-xl transition-colors">
            Start free
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-5 sm:px-8 py-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-3">{eyebrow}</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h1>
        <p className="text-slate-600 leading-relaxed mb-8">{description}</p>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-slate-950 mb-3">{section.title}</h2>
              <div className="space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm text-slate-600 leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  )
}
