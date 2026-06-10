'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

interface Photo {
  id: string
  original_url: string
  thumb_url: string | null
  original_filename: string | null
  caption: string | null
}

interface Props {
  photos: Photo[]
  photoCount: number
  photoArchiveLabel: string
  tracesLabel: string
  photosLabel: string
}

export default function PhotoGallery({ photos, photoCount, photoArchiveLabel, tracesLabel, photosLabel }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const SLIDE_DURATION = 4000 // ms per slide

  const goTo = useCallback((index: number) => {
    setCurrentIndex(((index % photos.length) + photos.length) % photos.length)
    setProgress(0)
  }, [photos.length])

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo])
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo])

  const startSlideshow = useCallback(() => {
    setIsPlaying(true)
    setProgress(0)
  }, [])

  const stopSlideshow = useCallback(() => {
    setIsPlaying(false)
    setProgress(0)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (progressRef.current) clearInterval(progressRef.current)
  }, [])

  // Handle slideshow tick
  useEffect(() => {
    if (!isPlaying || !lightboxOpen) return

    const step = 50
    const increment = (step / SLIDE_DURATION) * 100

    progressRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0
        }
        return prev + increment
      })
    }, step)

    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % photos.length)
      setProgress(0)
    }, SLIDE_DURATION)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [isPlaying, lightboxOpen, photos.length])

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setProgress(0)
    setIsPlaying(false)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    stopSlideshow()
    setLightboxOpen(false)
  }

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape') closeLightbox()
      if (e.key === ' ') { e.preventDefault(); isPlaying ? stopSlideshow() : startSlideshow() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, isPlaying, goNext, goPrev]) // eslint-disable-line

  // Touch swipe support
  const touchStartX = useRef<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) {
      if (dx < 0) goNext()
      else goPrev()
    }
    touchStartX.current = null
  }

  const currentPhoto = photos[currentIndex]

  // Grid layout sizes: mix 2-col and 3-col
  const getGridClass = (i: number) => {
    // every 7th item spans 2 cols on desktop for visual interest
    if (i % 7 === 0) return 'sm:col-span-2 aspect-[16/9]'
    if (i % 5 === 0) return 'aspect-[3/4]'
    if (i % 3 === 0) return 'aspect-[4/3]'
    return 'aspect-square'
  }

  return (
    <>
      <section id="fotograflar" className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="mb-10 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 text-[#b08340]">
                <span className="h-px w-10 bg-[#c7a76f]" />
                <span className="text-xs tracking-[0.2em] uppercase">{photoArchiveLabel}</span>
              </div>
              <h2 className="mt-3 font-serif text-4xl text-[#173d31] sm:text-5xl">
                {tracesLabel}
              </h2>
            </div>
            <span className="hidden text-sm text-[#8a7a64] sm:block">{photoCount} {photosLabel}</span>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => openLightbox(i)}
                className={`group relative cursor-pointer overflow-hidden focus:outline-none ${getGridClass(i)}`}
                aria-label={photo.original_filename ?? 'Fotoğraf'}
              >
                {/* Outer frame */}
                <div
                  className="absolute inset-0 rounded-lg border border-[#c7a76f]/60 shadow-[0_0_0_1px_rgba(199,167,111,0.15),0_2px_12px_rgba(64,48,24,0.12)] transition-all duration-300 group-hover:border-[#c7a76f] group-hover:shadow-[0_0_0_1px_rgba(199,167,111,0.4),0_8px_24px_rgba(64,48,24,0.20)] z-10 pointer-events-none"
                  style={{ borderRadius: '8px' }}
                />
                {/* Inner frame line */}
                <div
                  className="absolute inset-[5px] rounded border border-[#c7a76f]/30 z-10 pointer-events-none transition-all duration-300 group-hover:border-[#c7a76f]/60"
                />
                {/* Corner ornaments */}
                {[
                  'top-1.5 left-1.5',
                  'top-1.5 right-1.5 rotate-90',
                  'bottom-1.5 right-1.5 rotate-180',
                  'bottom-1.5 left-1.5 -rotate-90',
                ].map((pos, ci) => (
                  <span
                    key={ci}
                    className={`absolute ${pos} z-20 pointer-events-none text-[#c7a76f]/70 text-[10px] leading-none select-none group-hover:text-[#b08340] transition-colors`}
                  >
                    ✦
                  </span>
                ))}

                {/* Image */}
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <Image
                    src={photo.thumb_url ?? photo.original_url}
                    alt={photo.original_filename ?? ''}
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  {/* Caption */}
                  {(photo.caption || photo.original_filename) && (
                    <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="font-serif text-sm text-white drop-shadow-md">
                        {photo.caption ?? photo.original_filename}
                      </p>
                    </div>
                  )}
                  {/* Magnify icon */}
                  <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white text-sm">
                      ⛶
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIGHTBOX ── */}
      {lightboxOpen && currentPhoto && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeLightbox() }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Progress bar (slideshow) */}
          {isPlaying && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 z-10">
              <div
                className="h-full bg-[#c7a76f] transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Kapat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Prev button */}
          {photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              className="absolute left-3 sm:left-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
              aria-label="Önceki"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Main image with frame */}
          <div className="relative mx-16 flex max-h-[85vh] max-w-4xl w-full items-center justify-center px-2 sm:mx-24">
            {/* Outer frame */}
            <div className="relative w-full" style={{ maxHeight: '80vh' }}>
              {/* Frame border */}
              <div className="absolute -inset-2 rounded-lg border border-[#c7a76f]/40 pointer-events-none z-10" />
              <div className="absolute -inset-[14px] rounded-xl border border-[#c7a76f]/20 pointer-events-none z-10" />
              {/* Corner ornaments */}
              {[
                '-top-3 -left-3',
                '-top-3 -right-3 rotate-90',
                '-bottom-3 -right-3 rotate-180',
                '-bottom-3 -left-3 -rotate-90',
              ].map((pos, ci) => (
                <span
                  key={ci}
                  className={`absolute ${pos} z-20 text-[#c7a76f]/60 text-base leading-none pointer-events-none`}
                >
                  ✦
                </span>
              ))}

              {/* Image container */}
              <div className="relative overflow-hidden rounded-md" style={{ maxHeight: '80vh' }}>
                <Image
                  src={currentPhoto.thumb_url ?? currentPhoto.original_url}
                  alt={currentPhoto.original_filename ?? ''}
                  width={1200}
                  height={900}
                  className="max-h-[80vh] w-full object-contain"
                  unoptimized
                />
              </div>

              {/* Caption */}
              {(currentPhoto.caption || currentPhoto.original_filename) && (
                <div className="mt-3 text-center">
                  <p className="font-serif text-base text-white/90">
                    {currentPhoto.caption ?? currentPhoto.original_filename}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Next button */}
          {photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext() }}
              className="absolute right-3 sm:right-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
              aria-label="Sonraki"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Bottom controls */}
          <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-4 z-20">
            {/* Slide counter */}
            <span className="text-xs text-white/50">
              {currentIndex + 1} / {photos.length}
            </span>

            {/* Dot indicators (max 8 dots) */}
            {photos.length <= 12 && (
              <div className="flex gap-1.5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); goTo(i) }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? 'w-5 bg-[#c7a76f]'
                        : 'w-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Fotoğraf ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Play/Pause button */}
            {photos.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); isPlaying ? stopSlideshow() : startSlideshow() }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
                aria-label={isPlaying ? 'Durdur' : 'Slayt Başlat'}
                title={isPlaying ? 'Durdur (Boşluk)' : 'Otomatik Kaydır (Boşluk)'}
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 translate-x-0.5">
                    <path d="M8 5.14v14l11-7-11-7z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
