import Link from 'next/link'

export default function ContactPage() {
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

      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-3">Contact</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Talk to themaradi</h1>
        <p className="text-slate-600 max-w-2xl leading-relaxed mb-8">
          For support, partnerships, privacy requests or early access questions, use the contact points below.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: 'Support', email: 'support@themaradi.com', desc: 'Account, login and vault questions.' },
            { title: 'Partners', email: 'partner@themaradi.com', desc: 'Stone workshops, funeral services and B2B inquiries.' },
            { title: 'Privacy', email: 'privacy@themaradi.com', desc: 'KVKK, privacy and data requests.' },
          ].map((item) => (
            <a key={item.email} href={`mailto:${item.email}`} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-teal-200 transition-colors">
              <h2 className="font-semibold text-slate-950 mb-2">{item.title}</h2>
              <p className="text-sm text-slate-600 mb-4">{item.desc}</p>
              <span className="text-sm text-teal-700 font-medium">{item.email}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}
