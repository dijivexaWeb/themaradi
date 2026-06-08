'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

interface TimelineEvent {
  id: string
  year: string | null
  title: string | null
  content: string | null
  media_url: string | null
}

interface Props {
  events: TimelineEvent[]
}

export default function TimelineSection({ events }: Props) {
  const [selected, setSelected] = useState(0)
  const active = events[selected]

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1412] shadow-2xl shadow-black/30">
      <div className="grid lg:grid-cols-[1fr_360px]">

        {/* Left — event list */}
        <div className="relative px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
          <div className="absolute bottom-10 left-[2.15rem] top-10 w-px bg-gradient-to-b from-[#c7a76f]/20 via-[#c7a76f] to-[#c7a76f]/20 sm:left-[3.15rem] lg:left-[3.65rem]" />
          <div className="space-y-7">
            {events.map((event, i) => {
              const isActive = selected === i
              return (
                <article key={event.id} className="relative grid grid-cols-[44px_1fr] gap-4 sm:grid-cols-[56px_1fr]">
                  <div className="relative z-10 flex justify-center pt-1">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#c7a76f] shadow-[0_0_0_5px_rgba(199,167,111,0.12)] transition ${isActive ? 'bg-[#c7a76f]' : 'bg-[#0d1412]'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full transition ${isActive ? 'bg-[#091712]' : 'bg-[#c7a76f]'}`} />
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(i)}
                    className={`grid w-full gap-4 rounded-xl border p-4 text-left transition sm:grid-cols-[1fr_104px] sm:p-5 ${
                      isActive
                        ? 'border-[#c7a76f]/65 bg-[#c7a76f]/10 shadow-lg shadow-black/20'
                        : 'border-white/8 bg-white/[0.035] hover:border-[#c7a76f]/35 hover:bg-white/[0.055]'
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif text-3xl leading-none text-[#c7a76f]">{event.year}</span>
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-widest transition ${isActive ? 'border-[#c7a76f]/35 text-[#efe7d8]' : 'border-white/10 text-[#8f9f96]'}`}>
                          Dönüm noktası
                        </span>
                      </div>
                      <h3 className="mt-2 font-serif text-2xl text-white">{event.title}</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-[#cfc3ad]">{event.content}</p>
                    </div>
                    {/* Inline thumbnail — shown on sm+ */}
                    <div className="relative hidden min-h-[104px] overflow-hidden rounded-xl border border-[#c7a76f]/25 bg-[#17251f] sm:block sm:h-[104px]">
                      {event.media_url ? (
                        <Image
                          src={event.media_url}
                          alt={event.title ?? ''}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="font-serif text-3xl text-[#c7a76f]/20">{event.year}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                    </div>
                  </button>
                </article>
              )
            })}
          </div>
        </div>

        {/* Right — detail panel */}
        <aside className="border-t border-white/10 bg-[#111b17] p-5 lg:border-l lg:border-t-0 lg:p-6">
          <div className="flex h-full flex-col gap-4">
            <div className="relative h-[320px] overflow-hidden rounded-2xl border border-[#c7a76f]/35 bg-[#0b1210] shadow-2xl shadow-black/30 sm:h-[420px] lg:h-[430px]">
              {active.media_url ? (
                <Image
                  key={active.id}
                  src={active.media_url}
                  alt={active.title ?? ''}
                  fill
                  sizes="360px"
                  className="scale-105 object-cover object-center opacity-90 transition duration-500"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="font-serif text-[100px] leading-none text-[#c7a76f]/20">{active.year}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#091712] via-[#091712]/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="font-serif text-5xl leading-none text-[#c7a76f]">{active.year}</p>
                <h3 className="mt-2 font-serif text-3xl text-white">{active.title}</h3>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d1412] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c7a76f]">Dönüm noktası</p>
              <p className="mt-3 text-sm leading-7 text-[#cfc3ad]">{active.content}</p>
              <a
                href="#fotograflar"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#c7a76f] px-4 py-2.5 text-xs font-semibold text-[#091712] transition hover:bg-[#d4b87c]"
              >
                Anıları aç <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
