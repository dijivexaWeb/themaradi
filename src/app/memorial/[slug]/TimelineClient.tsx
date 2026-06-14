'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import TimelineSection from './TimelineSection'

interface TimelineEvent {
  id: string
  year: string | null
  title: string | null
  content: string | null
  media_url: string | null
}

interface Props {
  events: TimelineEvent[]
  labels: {
    timeline: string
    slideshow: string
    chronology: string
    timeTravel: string
    journeyToMoments: string
    yearsStory: string
    milestone: string
  }
  yearsLived: number | null
}

type AnimState = 'idle' | 'exit' | 'enter'

export default function TimelineClient({ events, labels, yearsLived }: Props) {
  const [mode, setMode] = useState<'timeline' | 'slideshow'>('timeline')
  const [idx, setIdx] = useState(0)
  const [animState, setAnimState] = useState<AnimState>('idle')
  const [dir, setDir] = useState<'next' | 'prev'>('next')
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const active = events[idx]

  function navigate(newIdx: number, direction: 'next' | 'prev') {
    if (animState !== 'idle') return
    setDir(direction)
    setAnimState('exit')

    setTimeout(() => {
      setIdx(((newIdx % events.length) + events.length) % events.length)
      setAnimState('enter')
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimState('idle')
        })
      })
    }, 220)
  }

  const goNext = useCallback(() => navigate(idx + 1, 'next'), [idx, animState, events.length])
  const goPrev = useCallback(() => navigate(idx - 1, 'prev'), [idx, animState, events.length])

  // Auto-advance in slideshow mode
  useEffect(() => {
    if (mode !== 'slideshow' || events.length <= 1) return
    autoRef.current = setInterval(goNext, 6000)
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [mode, idx, events.length])

  function enterSlideshow() {
    setIdx(0)
    setAnimState('idle')
    setMode('slideshow')
  }

  const slideClass =
    animState === 'idle'
      ? 'opacity-100 translate-x-0 transition-all duration-300 ease-in-out'
      : animState === 'exit'
      ? `opacity-0 ${dir === 'next' ? '-translate-x-10' : 'translate-x-10'} transition-all duration-[220ms] ease-in-out`
      : `opacity-0 ${dir === 'next' ? 'translate-x-10' : '-translate-x-10'}` // enter: no transition, off-screen

  const progressPct = events.length > 1 ? ((idx + 1) / events.length) * 100 : 100

  return (
    <>
      {/* Section header + tab bar */}
      <div className="mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3 text-[#c7a76f]">
            <span className="h-px w-10 bg-[#c7a76f]" />
            <span className="text-xs tracking-[0.2em] uppercase">{labels.chronology}</span>
          </div>
          <h2 className="mt-3 font-serif text-5xl text-white">{labels.timeTravel}</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#b8aa93]">
            {labels.journeyToMoments}{yearsLived !== null ? ` ${yearsLived} ${labels.yearsStory}` : ''}
          </p>
        </div>

        <div className="flex w-full gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1 text-xs font-semibold sm:w-auto">
          <button
            onClick={() => setMode('timeline')}
            className={`flex-1 rounded-lg px-4 py-2.5 text-center transition sm:flex-none ${
              mode === 'timeline'
                ? 'bg-[#c7a76f] text-[#091712] shadow-lg shadow-black/20'
                : 'text-[#cfc3ad] hover:text-white'
            }`}
          >
            {labels.timeline}
          </button>
          <button
            onClick={enterSlideshow}
            className={`flex-1 rounded-lg px-4 py-2.5 text-center transition sm:flex-none ${
              mode === 'slideshow'
                ? 'bg-[#c7a76f] text-[#091712] shadow-lg shadow-black/20'
                : 'text-[#cfc3ad] hover:text-white'
            }`}
          >
            {labels.slideshow}
          </button>
        </div>
      </div>

      {mode === 'timeline' ? (
        <TimelineSection events={events} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1412] shadow-2xl shadow-black/40">

          {/* Progress bar */}
          <div className="h-px bg-white/5">
            <div
              className="h-full bg-[#c7a76f] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Main slide */}
          <div className="relative min-h-[420px] sm:min-h-[480px]">

            {/* Ghost year — decorative background */}
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 flex items-center justify-end pr-8 ${slideClass}`}
            >
              <span className="font-serif text-[clamp(120px,18vw,220px)] font-bold leading-none text-white/[0.025] select-none">
                {active?.year}
              </span>
            </div>

            {/* Content */}
            <div className={`relative z-10 grid min-h-[420px] sm:min-h-[480px] lg:grid-cols-[1fr_360px] ${slideClass}`}>

              {/* Left: text */}
              <div className="flex flex-col justify-center px-8 py-12 sm:px-12">
                <div className="mb-3 flex items-center gap-3 text-[#c7a76f]/70">
                  <span className="h-px w-6 bg-[#c7a76f]/50" />
                  <span className="text-[10px] tracking-[0.3em] uppercase">{labels.milestone}</span>
                </div>
                <div className="font-serif text-[clamp(64px,10vw,96px)] leading-none text-[#c7a76f]">
                  {active?.year}
                </div>
                {active?.title && (
                  <h3 className="mt-3 font-serif text-3xl text-white sm:text-4xl">
                    {active.title}
                  </h3>
                )}
                {active?.content && (
                  <p className="mt-4 max-w-lg text-sm leading-7 text-[#b8aa93]">
                    {active.content}
                  </p>
                )}
              </div>

              {/* Right: image or decorative fill */}
              <div className="relative hidden lg:block">
                {active?.media_url ? (
                  <Image
                    src={active.media_url}
                    alt={active.title ?? ''}
                    fill
                    className="object-cover opacity-60"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#111b17]">
                    <span className="font-serif text-[140px] leading-none text-[#c7a76f]/10">
                      {active?.year}
                    </span>
                  </div>
                )}
                {/* left-to-right fade overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0d1412] via-[#0d1412]/30 to-transparent" />
              </div>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="flex items-center justify-between gap-4 border-t border-white/8 px-6 py-4">
            {/* Prev */}
            <button
              onClick={goPrev}
              disabled={animState !== 'idle'}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#cfc3ad] transition hover:border-[#c7a76f]/40 hover:text-[#c7a76f] disabled:opacity-30"
              aria-label="Önceki"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Dot indicators */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[60vw] sm:max-w-none py-1">
              {events.map((ev, i) => (
                <button
                  key={ev.id}
                  onClick={() => navigate(i, i > idx ? 'next' : 'prev')}
                  disabled={animState !== 'idle'}
                  aria-label={ev.year ?? `${i + 1}`}
                  className={`rounded-full transition-all duration-300 shrink-0 ${
                    i === idx
                      ? 'h-2 w-7 bg-[#c7a76f]'
                      : 'h-2 w-2 bg-white/20 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* Next */}
            <button
              onClick={goNext}
              disabled={animState !== 'idle'}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#cfc3ad] transition hover:border-[#c7a76f]/40 hover:text-[#c7a76f] disabled:opacity-30"
              aria-label="Sonraki"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
