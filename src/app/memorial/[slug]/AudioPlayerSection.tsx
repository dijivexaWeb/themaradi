'use client'

import { useState, useRef } from 'react'
import { Mic, Play, Pause } from 'lucide-react'

interface AudioRecording {
  id: string
  title: string
  author: string | null
  audio_url: string
}

const WAVEFORM_BARS = [3, 5, 8, 4, 7, 9, 3, 6, 5, 8, 4, 7, 6, 3, 9, 5, 4, 7, 6, 8]

export default function AudioPlayerSection({ recordings }: { recordings: AudioRecording[] }) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})

  function toggle(id: string, url: string) {
    if (playingId === id) {
      audioRefs.current[id]?.pause()
      setPlayingId(null)
    } else {
      if (playingId && audioRefs.current[playingId]) {
        audioRefs.current[playingId].pause()
      }
      if (!audioRefs.current[id]) {
        const el = new Audio(url)
        el.onended = () => setPlayingId(null)
        audioRefs.current[id] = el
      }
      audioRefs.current[id].play()
      setPlayingId(id)
    }
  }

  return (
    <section className="bg-[#0c3327] px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="flex items-center gap-3 text-[#c7a76f]">
            <span className="h-px w-10 bg-[#c7a76f]" />
            <span className="text-xs tracking-[0.2em] uppercase">Seslendirilmiş Anılar</span>
          </div>
          <h2 className="mt-3 font-serif text-4xl text-white sm:text-5xl">
            Sesi hâlâ<br />
            <span className="text-[#c7a76f]">burada.</span>
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {recordings.map((rec, idx) => {
            const playing = playingId === rec.id
            const bars = WAVEFORM_BARS.map((h, i) => ({
              height: h * 10,
              duration: `${0.6 + (i % 5) * 0.15}s`,
              delay: `${i * 0.05}s`,
            }))
            return (
              <div key={rec.id} className="rounded-2xl border border-[#2a5a45] bg-[#173d31] p-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggle(rec.id, rec.audio_url)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#c7a76f] shadow-lg transition hover:bg-[#d4b87c]"
                  >
                    {playing
                      ? <Pause className="h-4 w-4 fill-[#0c3327] text-[#0c3327]" />
                      : <Play className="h-4 w-4 fill-[#0c3327] text-[#0c3327] ml-0.5" />
                    }
                  </button>
                  <div>
                    <div className="font-serif text-lg text-white">{rec.title}</div>
                    {rec.author && <div className="text-xs text-[#6b9e86]">{rec.author}</div>}
                  </div>
                </div>

                <div className="mt-5 flex h-10 items-end gap-[3px]">
                  {bars.map((bar, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full ${playing ? 'animate-pulse' : ''} ${playing ? 'bg-[#c7a76f]' : 'bg-[#c7a76f]/60'}`}
                      style={{ height: `${bar.height}%` }}
                    />
                  ))}
                </div>

                <div className="mt-2">
                  <div className="h-0.5 rounded-full bg-[#2a5a45]">
                    <div className={`h-full rounded-full bg-[#c7a76f] transition-all duration-300 ${playing ? 'w-1/3' : 'w-0'}`} />
                  </div>
                </div>

                {idx === 0 && recordings.length > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-[#6b9e86]">
                    <Mic className="h-3 w-3" />
                    <span>Ses kaydı</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
