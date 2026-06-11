'use client'

import Link from 'next/link'
import { ArrowRight, Heart, Infinity, ShieldCheck } from 'lucide-react'
import { useLang } from '@/i18n/context'
import LandingNav from '@/components/landing/Nav'
import MemorialsFooter from '@/app/memorial/_MemorialsFooter'

const VALUE_ICONS = [Heart, Infinity, ShieldCheck]

export default function AboutClient() {
  const { t } = useLang()
  const a = t.about
  const lf = t.landing.finalCta

  return (
    <div className="min-h-screen bg-[#fbf8f1] text-[#173d31]">

      <LandingNav />

      {/* HERO */}
      <section className="bg-[#0f3628] px-5 py-20 pt-32 sm:px-8 sm:py-28 sm:pt-36">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-3 text-[#c7a76f]">
            <span className="h-px w-10 bg-[#c7a76f]" />
            <span className="text-xs tracking-[0.25em] uppercase font-medium">{a.hero.eyebrow}</span>
            <span className="h-px w-10 bg-[#c7a76f]" />
          </div>
          <h1 className="font-serif text-5xl leading-tight text-white sm:text-[3.5rem]">
            {a.hero.heading}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[#c8bfad]">
            {a.hero.body}
          </p>
        </div>
      </section>

      {/* STORY */}
      <section className="border-b border-[#e6dccb] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl text-[#173d31] sm:text-4xl">{a.story.heading}</h2>
          <div className="mt-3 flex items-center gap-3 text-[#b08340]">
            <span className="h-px w-16 bg-[#c7a76f]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#c7a76f]" />
          </div>
          <p className="mt-8 text-base leading-8 text-[#5b5245]">{a.story.p1}</p>
          <p className="mt-5 text-base leading-8 text-[#5b5245]">{a.story.p2}</p>

          {/* Pull quote */}
          <blockquote className="my-8 border-l-4 border-[#c7a76f] pl-6">
            <p className="font-serif text-xl leading-8 text-[#173d31] italic">{a.story.pullQuote}</p>
          </blockquote>

          <p className="text-base leading-8 text-[#5b5245]">{a.story.p3}</p>
        </div>
      </section>

      {/* VISION + MISSION */}
      <section className="border-b border-[#e6dccb] bg-[#f7f2e9] px-5 py-14 sm:px-8">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {/* Vision */}
          <div className="rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-8 shadow-sm">
            <span className="mb-4 inline-block rounded-full border border-[#c7a76f]/40 bg-[#fdf7eb] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#b08340]">
              {a.vision.label}
            </span>
            <p className="mt-3 font-serif text-xl leading-8 text-[#173d31]">{a.vision.text}</p>
          </div>
          {/* Mission */}
          <div className="rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-8 shadow-sm">
            <span className="mb-4 inline-block rounded-full border border-[#173d31]/20 bg-[#f0f6f3] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#173d31]">
              {a.mission.label}
            </span>
            <p className="mt-3 font-serif text-xl leading-8 text-[#173d31]">{a.mission.text}</p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="border-b border-[#e6dccb] px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center font-serif text-3xl text-[#173d31] sm:text-4xl">
            {a.values.heading}
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {a.values.items.map((item, i) => {
              const Icon = VALUE_ICONS[i]
              return (
                <div key={i} className="rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-7 shadow-sm">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#e1d5c3] bg-[#f4eee3] text-[#b08340]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-serif text-lg text-[#173d31]">{item.title}</h3>
                  <p className="text-sm leading-6 text-[#5b5245]">{item.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA — from landing finalCta style */}
      <section className="bg-[#0f3628] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl leading-snug text-white sm:text-4xl">{a.cta.heading}</h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-[#c8bfad]">{a.cta.body}</p>
          <Link
            href="/satin-al/anma"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#c7a76f] px-7 py-3.5 text-sm font-semibold text-[#0f3628] shadow-lg transition hover:bg-[#b08340]"
          >
            {a.cta.btn}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="border-b border-[#e6dccb] bg-[#fbf8f1] px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-2xl text-[#173d31]">{a.contact.heading}</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#5b5245]">{a.contact.body}</p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-md border border-[#c7a76f] px-6 py-3 text-sm font-semibold text-[#173d31] transition hover:bg-[#f8f1e6]"
          >
            {a.contact.btn}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <MemorialsFooter />

    </div>
  )
}
