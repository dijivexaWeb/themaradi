'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'

interface MemoryItem {
  id: string
  title: string | null
  content: string | null
  memory_date: string | null
  media_url: string | null
  media_type: string | null
  formattedDate: string | null
  embedUrl: string | null
}

interface Props {
  memories: MemoryItem[]
}

export default function MemoriesAccordion({ memories }: Props) {
  const [openId, setOpenId] = useState<string | null>(memories[0]?.id ?? null)

  function toggle(id: string) {
    setOpenId(prev => (prev === id ? null : id))
  }

  return (
    <div className="space-y-2">
      {memories.map((m) => {
        const isOpen = openId === m.id
        const hasThumb = m.media_type === 'image' && m.media_url
        const preview = m.content ? m.content.slice(0, 80) + (m.content.length > 80 ? '…' : '') : null

        return (
          <div
            key={m.id}
            className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
              isOpen
                ? 'border-[#c7a76f]/40 bg-[#fffdf8] shadow-md shadow-[#4d3d26]/8'
                : 'border-[#e1d5c3] bg-white hover:border-[#c7a76f]/25 hover:bg-[#fffef9]'
            }`}
          >
            {/* Header — always visible, click to toggle */}
            <button
              type="button"
              onClick={() => toggle(m.id)}
              className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
            >
              {/* Thumbnail (only when collapsed) */}
              {hasThumb && !isOpen && (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#e1d5c3] bg-[#f4eee3]">
                  <Image
                    src={m.media_url!}
                    alt={m.title ?? 'Anı'}
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              <div className="min-w-0 flex-1">
                {m.formattedDate && (
                  <p className="mb-0.5 text-xs font-semibold tracking-wide text-[#b08340]">
                    {m.formattedDate}
                  </p>
                )}
                <p className={`font-serif text-[#173d31] ${isOpen ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}>
                  {m.title ?? preview ?? 'Anı'}
                </p>
                {!isOpen && !m.title && !preview && null}
                {!isOpen && m.title && preview && (
                  <p className="mt-0.5 text-xs text-[#8a7a64] line-clamp-1">{preview}</p>
                )}
              </div>

              <ChevronDown
                className={`h-5 w-5 shrink-0 text-[#b08340] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div className="border-t border-[#e1d5c3]/60 px-4 pb-5 pt-4 sm:px-5">
                {/* Image */}
                {m.media_type === 'image' && m.media_url && (
                  <div className="mb-4 overflow-hidden rounded-xl border border-[#e1d5c3]">
                    <Image
                      src={m.media_url}
                      alt={m.title ?? 'Anı fotoğrafı'}
                      width={0}
                      height={0}
                      sizes="(max-width: 768px) 100vw, 672px"
                      style={{ width: '100%', height: 'auto' }}
                      unoptimized
                    />
                  </div>
                )}

                {/* Embedded video */}
                {m.embedUrl && (
                  <div className="mb-4 overflow-hidden rounded-xl border border-[#e1d5c3]">
                    <div className="aspect-video">
                      <iframe src={m.embedUrl} className="h-full w-full" allowFullScreen title={m.title ?? 'Video'} />
                    </div>
                  </div>
                )}

                {/* Native video */}
                {m.media_type === 'video' && m.media_url && !m.embedUrl && (
                  <div className="mb-4 overflow-hidden rounded-xl border border-[#e1d5c3] bg-black">
                    <video controls src={m.media_url} className="w-full" preload="metadata" />
                  </div>
                )}

                {/* Full text */}
                {m.content && (
                  <p className="text-sm leading-7 text-[#4c463c] sm:text-base sm:leading-8 whitespace-pre-wrap">
                    {m.content}
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
