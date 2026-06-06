'use client'

import { useEffect, useRef } from 'react'

export function HeroVault() {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const rx = ((e.clientY - cy) / 25) * -1
      const ry = (e.clientX - cx) / 25
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`
    }

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(6deg) rotateY(-8deg) scale(1)'
    }

    document.addEventListener('mousemove', handleMouseMove)
    card.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div className="relative flex items-center justify-center py-12 lg:py-0">
      {/* Ambient glow */}
      <div className="absolute w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute w-48 h-48 bg-indigo-600/15 rounded-full blur-2xl animate-glow-pulse" style={{ animationDelay: '2s' }} />

      <div
        ref={cardRef}
        style={{
          transform: 'perspective(1000px) rotateX(6deg) rotateY(-8deg)',
          transition: 'transform 0.15s ease-out',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
        className="relative w-80 rounded-2xl overflow-hidden"
      >
        {/* Card gradient border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-purple-500/20 pointer-events-none" />

        <div className="glass border border-slate-700/50 rounded-2xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-100">Dijital Kasa</div>
                <div className="text-xs text-slate-500">Özel · Şifreli</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Güvenli
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 mb-5">
            {[
              { icon: '🖼️', label: '2,847 Fotoğraf', size: '12.4 GB' },
              { icon: '🎵', label: '23 Ses Kaydı', size: '340 MB' },
              { icon: '📄', label: '156 Belge', size: '2.1 GB' },
              { icon: '🎬', label: '8 Video', size: '4.2 GB' },
            ].map(({ icon, label, size }) => (
              <div key={label} className="flex items-center justify-between bg-slate-800/60 border border-slate-700/30 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{icon}</span>
                  <span className="text-xs text-slate-300 font-medium">{label}</span>
                </div>
                <span className="text-xs text-slate-600">{size}</span>
              </div>
            ))}
          </div>

          {/* Storage bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Depolama kullanımı</span>
              <span className="text-slate-400">19.0 / 50 GB</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                style={{ width: '38%' }}
              />
            </div>
          </div>

          {/* Varisler */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex -space-x-2">
              {[
                { l: 'A', from: 'from-blue-400', to: 'to-blue-600' },
                { l: 'M', from: 'from-indigo-400', to: 'to-indigo-600' },
                { l: 'S', from: 'from-violet-400', to: 'to-violet-600' },
              ].map(({ l, from, to }) => (
                <div
                  key={l}
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${from} ${to} flex items-center justify-center text-white text-xs font-bold border-2 border-slate-900`}
                >
                  {l}
                </div>
              ))}
            </div>
            <span className="text-xs text-slate-400">3 varis atandı</span>
            <div className="ml-auto">
              <div className="flex items-center gap-1 text-xs text-emerald-400">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Korumalı
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
