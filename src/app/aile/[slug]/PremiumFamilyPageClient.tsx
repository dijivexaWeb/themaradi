'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { incrementFamilyActionAction } from '@/lib/actions/family-public'
import { CondolenceForm } from './FamilyInteractions'
import { useLang } from '@/i18n/context'
import { langs } from '@/i18n'
import BrandLogo, { BrandMark } from '@/components/BrandLogo'


interface MemberVault {
  id: string
  display_name: string
  slug: string | null
  cover_photo_url: string | null
  birth_date: string | null
  death_date: string | null
}

interface FamilyPhoto {
  id: string
  original_url: string
  caption: string | null
}

interface FamilyMemory {
  id: string
  title: string | null
  content: string
  memory_date: string | null
}

interface CondolenceEntry {
  id: string
  author_name: string
  message: string
  relation: string | null
  created_at: string
}

interface ActionData {
  action_type: 'candle' | 'flower' | 'prayer' | 'heart' | 'star' | 'silence'
  count: number
}

interface Props {
  family: {
    id: string
    name: string
    tagline: string | null
    description: string | null
    hero_bg_url: string | null
    slug: string
    enabled_actions: string[] | null
  }
  memberVaults: MemberVault[]
  photos: FamilyPhoto[]
  memories: FamilyMemory[]
  condolences: CondolenceEntry[]
  actions: ActionData[]
  lang: string
  translations: any
}

const ACTION_CONFIG = {
  candle: { emoji: '🕯️', labelKey: 'silence', desc: 'Saygınızı ve minnetinizi iletin' },
  flower: { emoji: '🌹', labelKey: 'flower', desc: 'Sevginizi çiçekle ifade edin' },
  prayer: { emoji: '🤲', labelKey: 'prayer', desc: 'Dualarınızı bizimle paylaşın' },
  heart: { emoji: '❤️', labelKey: 'heart', desc: 'Sevgiyle anılarınızı paylaşın' },
  star: { emoji: '⭐', labelKey: 'star', desc: 'Yıldızlarla aydınlatın' },
  silence: { emoji: '🙏', labelKey: 'silence', desc: 'Saygıyla anın' },
}

export default function PremiumFamilyPageClient({
  family,
  memberVaults,
  photos,
  memories,
  condolences,
  actions,
  lang,
  translations
}: Props) {
  const { setLang } = useLang()

  const displayPhotos = photos

  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const init = {} as Record<string, number>
    actions.forEach(a => { init[a.action_type] = a.count })
    return init
  })
  const [done, setDone] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<string | null>(null)
  
  // Modals state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [activeMemory, setActiveMemory] = useState<FamilyMemory | null>(null)
  const [activeCondolence, setActiveCondolence] = useState<CondolenceEntry | null>(null)
  
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }
  
  const [copied, setCopied] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  const locale = lang === 'tr' ? 'tr-TR' : lang === 'ka' ? 'ka-GE' : lang === 'ru' ? 'ru-RU' : lang === 'hy' ? 'hy-AM' : lang === 'az' ? 'az-AZ' : lang === 'he' ? 'he-IL' : 'en-US'

  const handleAction = async (type: string) => {
    if (done.has(type) || loading) return
    setLoading(type)
    const result = await incrementFamilyActionAction(family.id, family.slug, type as any)
    if (result.ok && result.count !== undefined) {
      setCounts(prev => ({ ...prev, [type]: result.count! }))
      setDone(prev => new Set([...prev, type]))
    }
    setLoading(null)
  }

  // Build hanging tree images dynamically
  const memberImages = memberVaults.map(mv => ({
    src: mv.cover_photo_url as string,
    alt: mv.display_name,
    isMember: true,
    slug: mv.slug
  })).filter(item => !!item.src)

  const mediaImages = photos.map(p => ({
    src: p.original_url,
    alt: p.caption || '',
    isMember: false,
    slug: null
  })).filter(item => !!item.src)

  const hangingItems: { src: string; alt: string; isMember: boolean; slug: string | null }[] = []
  let memberIdx = 0
  let mediaIdx = 0

  while (hangingItems.length < 7 && (memberIdx < memberImages.length || mediaIdx < mediaImages.length)) {
    if (memberIdx < memberImages.length) {
      hangingItems.push(memberImages[memberIdx++])
    }
    if (hangingItems.length < 7 && mediaIdx < mediaImages.length) {
      hangingItems.push(mediaImages[mediaIdx++])
    }
  }


  const frameClasses = [
    'frame-1 landscape',
    'frame-2 portrait',
    'frame-3 portrait',
    'frame-4 landscape',
    'frame-5 landscape',
    'frame-6 landscape',
    'frame-7 portrait'
  ]

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      if (e.key === 'Escape') setLightboxOpen(false)
      else if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % displayPhotos.length)
      else if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, displayPhotos.length])

  // Get active actions (default to candle, flower, prayer)
  const activeActions = (family.enabled_actions || ['candle', 'flower', 'prayer']) as (keyof typeof ACTION_CONFIG)[]

  const handleShareCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: family.name, url: window.location.href }) } catch {}
    } else {
      setShowShareMenu(s => !s)
    }
  }

  // Translation helpers
  const fpT = translations.family_page || {}
  const footerT = translations.pricing?.footer || {}

  return (
    <div className="family-page-premium min-h-screen bg-[#02120f] text-[#f3eade]">
      
      {/* Header & Navigation */}
      <header className="header">
        <div className="container header-container">
          <BrandLogo href="/" light={true} />
          
          <ul className="nav-menu">
            <li><a href="#" className="nav-link">{fpT.navHome || 'Anasayfa'}</a></li>
            {memories.length > 0 && <li><a href="#anilar" className="nav-link">{fpT.navMemories || 'Aile Anıları'}</a></li>}
            {displayPhotos.length > 0 && <li><a href="#galeri" className="nav-link">{fpT.navPhotos || 'Fotoğraflar'}</a></li>}
            {memberVaults.length > 0 && <li><a href="#uyeler" className="nav-link">{fpT.navMembers || 'Aile Üyeleri'}</a></li>}
            {condolences.length > 0 && <li><a href="#taziye" className="nav-link">{fpT.navCondolences || 'Anı Defteri'}</a></li>}
          </ul>
          
          <div className="header-actions">
            {/* Embedded language switcher from Next.js server context */}
            <div className="lang-selector">
              {langs.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLang(item.code)
                    window.location.reload()
                  }}
                  title={item.label}
                  className={`lang-link ${lang === item.code ? 'active' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  {item.flag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Integrated Tree of Life */}
      <section className="hero">
        {/* Integrated Tree Background Image */}
        <div className="hero-tree-bg" style={{ backgroundImage: `url(${family.hero_bg_url || '/images/premium-family/tree_bg.png'})` }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-tag">{fpT.inMemoryOf || 'AİLE ANMA SAYFASI'}</div>
          <h1 className="hero-title">{family.name}</h1>
          
          {/* Small Elegant Separator Decor */}
          <div className="hero-divider">
            <svg width="120" height="12" viewBox="0 0 120 12">
              <line x1="0" y1="6" x2="45" y2="6" stroke="#c19a6b" strokeWidth="1"/>
              <polygon points="60,0 65,6 60,12 55,6" fill="#c19a6b"/>
              <line x1="75" y1="6" x2="120" y2="6" stroke="#c19a6b" strokeWidth="1"/>
            </svg>
          </div>
          
          {/* Integrated Tree Wrapper with Description & Absolute Hanging Frames */}
          <div className="hero-tree-wrapper">
            {hangingItems.map((item, index) => {
              const frameClass = frameClasses[index]
              const content = (
                <>
                  <Image src={item.src} alt={item.alt} fill sizes="80px" />
                </>
              )
              if (item.slug) {
                return (
                  <Link key={index} href={`/memorial/${item.slug}`} className={`tree-frame ${frameClass}`}>
                    {content}
                  </Link>
                )
              }
              return (
                <div key={index} className={`tree-frame ${frameClass}`}>
                  {content}
                </div>
              )
            })}

            {family.tagline && (
              <p className="hero-description" style={{ marginBottom: '20px' }}>
                &ldquo;{family.tagline}&rdquo;
              </p>
            )}

            {family.description && (
              <p className="hero-description" style={{ fontSize: '15px', color: '#a3b5b0', fontStyle: 'normal' }}>
                {family.description}
              </p>
            )}
          </div>

          {/* Quick Action Cards Grid */}
          <div className="quick-actions">
            {activeActions.map(type => {
              const cfg = ACTION_CONFIG[type]
              if (!cfg) return null
              const isDone = done.has(type)
              const count = counts[type] ?? 0
              
              return (
                <div key={type} className={`action-card premium-border ${isDone ? 'done' : ''}`} onClick={() => handleAction(type)}>
                  <div className="corners-decor"></div>
                  <div className="action-icon">
                    <span className="text-3xl" style={{ display: 'inline-block', transition: 'transform 0.3s' }}>
                      {loading === type ? '⏳' : cfg.emoji}
                    </span>
                  </div>
                  <h3 className="action-title">{fpT[cfg.labelKey] || cfg.labelKey.toUpperCase()}</h3>
                  <p className="action-desc">{cfg.desc}</p>
                  <div className="action-counter">
                    <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px', fill: 'currentColor' }}>
                      <path d="M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5,2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3,19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54Z"/>
                    </svg>
                    <span>{count}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Share Button */}
          <div className="share-container" style={{ position: 'relative' }}>
            {showShareMenu && (
              <div onClick={() => setShowShareMenu(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
            )}
            <button className="btn-share" onClick={handleNativeShare}>
              <svg viewBox="0 0 24 24">
                <path d="M18,16.08c-.76,0-1.44,.3-1.96,.77L8.91,12.7c.05-.23,.09-.46,.09-.7s-.04-.47-.09-.7l7.05-4.11c.54,.5,1.25,.81,2.04,.81,1.66,0,3-1.34,3-3s-1.34-3-3-3-3,1.34-3,3c0,.24,.04,.47,.09,.7L8.04,9.81c-.54-.5-1.25-.81-2.04-.81-1.66,0-3,1.34-3,3s1.34,3,3,3c.79,0,1.5-.31,2.04-.81l7.12,4.16c-.05,.21-.08,.43,.08,.65,0,1.61,1.31,2.92,2.92,2.92s2.92-1.31,2.92-2.92-1.31-2.92-2.92-2.92Z"/>
              </svg>
              <span>{fpT.shareTitle || 'Paylaş'}</span>
            </button>
            {showShareMenu && (
              <div style={{
                position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)',
                zIndex: 50, minWidth: '200px',
                background: 'rgba(2,18,15,0.97)',
                border: '1px solid rgba(193,154,107,0.25)',
                borderRadius: '16px', padding: '8px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(16px)',
              }}>
                {(() => {
                  const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')
                  const text = encodeURIComponent(family.name)
                  const platforms = [
                    { label: 'WhatsApp',  emoji: '💬', href: `https://wa.me/?text=${text}%20${url}` },
                    { label: 'Telegram',  emoji: '✈️', href: `https://t.me/share/url?url=${url}&text=${text}` },
                    { label: 'Facebook',  emoji: '👥', href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
                    { label: 'X / Twitter', emoji: '🐦', href: `https://twitter.com/intent/tweet?text=${text}&url=${url}` },
                    { label: 'E-posta',   emoji: '📧', href: `mailto:?subject=${text}&body=${url}` },
                  ]
                  return platforms.map(p => (
                    <a key={p.label} href={p.href} target="_blank" rel="noopener noreferrer"
                      onClick={() => setShowShareMenu(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px', borderRadius: '10px',
                        color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 500,
                        textDecoration: 'none', transition: 'background 0.15s',
                      }}
                      className="hover:bg-white/8">
                      <span style={{ fontSize: '16px' }}>{p.emoji}</span>
                      {p.label}
                    </a>
                  ))
                })()}
                <div style={{ height: '1px', background: 'rgba(193,154,107,0.1)', margin: '4px 8px' }} />
                <button onClick={() => { handleShareCopy(); setShowShareMenu(false) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', borderRadius: '10px',
                    color: copied ? '#c19a6b' : 'rgba(255,255,255,0.8)',
                    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                    background: 'transparent', border: 'none', transition: 'background 0.15s',
                  }}
                  className="hover:bg-white/8">
                  <span style={{ fontSize: '16px' }}>🔗</span>
                  {copied ? 'Kopyalandı!' : 'Linki Kopyala'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Aile Üyeleri Section */}
      {memberVaults.length > 0 && (
        <section id="uyeler" className="members">
          <div className="container">
            <div className="section-header">
              <div className="section-decorator">
                <span className="decorator-star">✦</span>
              </div>
              <h2 className="section-title">{fpT.familyMembersLabel || 'Aile Üyeleri'}</h2>
              <p className="section-subtitle">Bu anma sayfasına bağlı aile bireyleri</p>
            </div>

            <div className="members-grid">
              {memberVaults.map((vault) => (
                <div key={vault.id} className="member-card premium-border">
                  <div className="corners-decor"></div>
                  <div className="avatar-wrapper">
                    {vault.cover_photo_url ? (
                      <Image src={vault.cover_photo_url} fill sizes="100px" className="member-avatar" alt={vault.display_name} />
                    ) : (
                      <div className="member-avatar flex items-center justify-center bg-[#2a4535] text-white text-3xl font-serif">
                        {vault.display_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="status-dot"></div>
                  </div>
                  <h3 className="member-name">{vault.display_name}</h3>
                  <p className="member-years">
                    {vault.birth_date ? new Date(vault.birth_date).getFullYear() : '?'} – {vault.death_date ? new Date(vault.death_date).getFullYear() : ''}
                  </p>
                  <div className="member-status">Anı sayfası mevcut</div>
                  
                  {vault.slug ? (
                    <Link href={`/memorial/${vault.slug}`} className="btn-view-profile">
                      <span>{fpT.viewMemorial || 'Profili Gör'}</span>
                      <svg viewBox="0 0 24 24"><path d="M5,12H19M19,12L12,5M19,12L12,19" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                    </Link>
                  ) : (
                    <button className="btn-view-profile" disabled>
                      <span>Profili Gör</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Aile Anıları Section */}
      {memories.length > 0 && (
        <section id="anilar" className="memories">
          <div className="container">
            <div className="section-header">
              <div className="section-decorator">
                <span className="decorator-star">✦</span>
              </div>
              <h2 className="section-title">{fpT.memoriesLabel || 'Aile Anıları'}</h2>
            </div>

            <div className="memories-grid">
              {memories.map((mem, index) => {
                // If there's an associated photo, use it, else pick a fallback
                const photoSrc = displayPhotos[index % displayPhotos.length]?.original_url
                return (
                  <div key={mem.id} className="memory-card premium-border" onClick={() => setActiveMemory(mem)} style={{ cursor: 'pointer' }}>
                    <div className="corners-decor"></div>
                    {photoSrc && (
                      <div className="memory-image-wrapper">
                        <Image src={photoSrc} fill sizes="(max-width: 640px) 100vw, 320px" className="memory-image" alt={mem.title || 'Anı Görseli'} />
                      </div>
                    )}
                    <div className="memory-content">
                      <div>
                        <div className="memory-date-row">
                          <svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
                          <span>{mem.memory_date ? new Date(mem.memory_date).toLocaleDateString(locale, { year: 'numeric', month: 'long' }).toUpperCase() : ''}</span>
                        </div>
                        <h3 className="memory-title">{mem.title || 'Anı'}</h3>
                        <p className="memory-desc line-clamp-3">{mem.content}</p>
                      </div>
                      <button className="btn-read-more" onClick={(e) => {
                        e.stopPropagation()
                        setActiveMemory(mem)
                      }}>
                        <span>{fpT.readMore || 'Devamını Oku'}</span>
                        <svg viewBox="0 0 24 24"><path d="M5,12H19M19,12L12,5M19,12L12,19" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Fotoğraflar Section */}
      {displayPhotos.length > 0 && (
        <section id="galeri" className="gallery">
          <div className="container">
            <div className="section-header">
              <div className="section-decorator">
                <span className="decorator-star">✦</span>
              </div>
              <h2 className="section-title">{fpT.photosLabel || 'Fotoğraflar'}</h2>
            </div>

            <div className="gallery-grid">
              {displayPhotos.map((photo, index) => (
                <div key={photo.id} className="gallery-item premium-border" onClick={() => openLightbox(index)}>
                  <div className="corners-decor"></div>
                  <Image src={photo.original_url} fill sizes="(max-width: 640px) 50vw, 200px" alt={photo.caption || `Fotoğraf ${index + 1}`} />
                  <div className="gallery-icon-overlay">
                    <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-footer-btn">
              <button id="btn-view-all" className="btn-view-profile" style={{ width: 'auto', padding: '12px 32px' }} onClick={() => openLightbox(0)}>
                <span>{fpT.viewAllLabel || 'Tümünü Gör'}</span>
                <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px' }}><path d="M5,12H19M19,12L12,5M19,12L12,19" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Taziye & Anma Mesajları Section */}
      <section id="taziye" className="messages">
        <div className="container">
          <div className="section-header">
            <div className="section-decorator">
              <span className="decorator-star">✦</span>
            </div>
            <h2 className="section-title">{fpT.condolenceTitle || 'Taziye & Anma Mesajları'}</h2>
          </div>

          {condolences.length > 0 && (
            <div className="messages-grid" style={{ marginBottom: '2.5rem' }}>
              {condolences.map((entry) => (
                <div key={entry.id} className="message-card premium-border" onClick={() => setActiveCondolence(entry)} style={{ cursor: 'pointer' }}>
                  <div className="corners-decor"></div>
                  <div className="msg-header">
                    <div className="msg-user-info">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-sm font-semibold text-[#c19a6b]">
                        {entry.author_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="msg-name">{entry.author_name}</div>
                        {entry.relation && <div className="msg-relationship">{entry.relation}</div>}
                      </div>
                    </div>
                    <div className="msg-time">{new Date(entry.created_at).toLocaleDateString(locale)}</div>
                  </div>
                  <p className="msg-text line-clamp-4">&ldquo;{entry.message}&rdquo;</p>
                  <div className="msg-footer">
                    <div className="msg-quote-icon">"</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Taziye gönder formu */}
          <CondolenceForm familyId={family.id} slug={family.slug} t={fpT} />
        </div>
      </section>

      {/* Alt Butonlar — Linki Kopyala & QR İndir */}
      <section style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '2rem 0' }}>
        <div className="container" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleShareCopy}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem', borderRadius: '12px',
              border: '1px solid rgba(193,154,107,0.3)',
              background: 'rgba(193,154,107,0.08)',
              color: '#c19a6b', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
            <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'currentColor' }}>
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
            {copied ? (fpT.shareCopied || 'Kopyalandı!') : (fpT.shareCopy || 'Linki Kopyala')}
          </button>
          <Link href={`/aile/${family.slug}/qr`}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem', borderRadius: '12px',
              border: '1px solid rgba(193,154,107,0.3)',
              background: 'rgba(193,154,107,0.08)',
              color: '#c19a6b', fontSize: '14px', fontWeight: 600,
              transition: 'all 0.2s', textDecoration: 'none'
            }}>
            <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'currentColor' }}>
              <path d="M3 11h2v2H3zm0-4h2v2H3zm4 4h2v2H7zm0-4h2v2H7zm4-6H3v8h8V1zm-2 6H5V3h6v4zM3 13h2v2H3zm4 4H3v-2h2v-2h2v4zm2-2h2v2H9zm4-2h-2v-2h2v2zm2 2h-2v-2h2v2zm-2-6V3h2v2h2v2h-2v2h-2zm2 4h2v2h-2z"/>
            </svg>
            {fpT.shareQr || 'QR Kod İndir'}
          </Link>
        </div>
      </section>

      {/* CTA — Anasayfa */}
      <section style={{
        padding: '5rem 0',
        background: 'linear-gradient(180deg, rgba(2,18,15,0) 0%, rgba(193,154,107,0.06) 50%, rgba(2,18,15,0) 100%)',
        borderTop: '1px solid rgba(193,154,107,0.1)',
        borderBottom: '1px solid rgba(193,154,107,0.1)',
        textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: '640px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ marginBottom: '1rem', color: 'rgba(193,154,107,0.5)', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            ✦ The Eternal Memory
          </div>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
            fontWeight: 400,
            color: '#f3eade',
            lineHeight: 1.3,
            marginBottom: '1rem',
          }}>
            Sevdiklerinizin Anısını<br />
            <span style={{ color: '#c19a6b' }}>Sonsuza Taşıyın</span>
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Dijital bir anma sayfası oluşturun. Fotoğraflar, anılar ve taziyeler — hepsini tek bir yerde saklayın.
          </p>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
            padding: '1rem 2.5rem',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #c19a6b, #a07840)',
            color: '#fff',
            fontWeight: 700, fontSize: '15px',
            textDecoration: 'none',
            boxShadow: '0 8px 32px rgba(193,154,107,0.25)',
            transition: 'all 0.2s',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A2,2,0,0,0,10,4c0,1.5,2,4,2,4s2-2.5,2-4A2,2,0,0,0,12,2Zm5,9H7a1,1,0,0,0-1,1v9a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2V12A1,1,0,0,0,17,11Z"/>
            </svg>
            Anma Sayfası Oluştur
          </Link>
          <p style={{ marginTop: '1rem', fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
            Birkaç dakikada kurulum tamamlanır.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-logo">
              <BrandLogo href="/" light={true} />
              <p className="footer-logo-tagline">{fpT.footerTagline || 'Hatıralar asla solmaz.'}</p>
            </div>
            
            <div className="footer-links">
              <Link href="/privacy" className="footer-link">{footerT.privacy || 'Gizlilik'}</Link>
              <Link href="/terms" className="footer-link">{footerT.terms || 'Koşullar'}</Link>
              <Link href="/contact" className="footer-link">{footerT.contact || 'İletişim'}</Link>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} The Eternal Memory</p>
            <div className="footer-candle" style={{ opacity: 0.55 }}>
              <BrandMark />
            </div>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {lightboxOpen && displayPhotos.length > 0 && (
        <div id="lightbox" className="lightbox active" onClick={() => setLightboxOpen(false)}>
          <span className="lightbox-close" onClick={() => setLightboxOpen(false)}>&times;</span>
          {displayPhotos.length > 1 && (
            <>
              <span className="lightbox-arrow lightbox-prev" onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + displayPhotos.length) % displayPhotos.length) }}>&#10094;</span>
              <span className="lightbox-arrow lightbox-next" onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % displayPhotos.length) }}>&#10095;</span>
            </>
          )}
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={displayPhotos[lightboxIndex]?.original_url} alt={displayPhotos[lightboxIndex]?.caption || 'Büyütülmüş Görsel'} />
            <div className="lightbox-caption">{displayPhotos[lightboxIndex]?.caption || `${lightboxIndex + 1} / ${displayPhotos.length}`}</div>
          </div>
        </div>
      )}

      {/* Memory Detail Modal */}
      {activeMemory && (
        <div className="lightbox active" onClick={() => setActiveMemory(null)}>
          <span className="lightbox-close" onClick={() => setActiveMemory(null)}>&times;</span>
          <div className="lightbox-content premium-border p-8 bg-[#041e1a] border border-[#c19a6b]/30 rounded-2xl" onClick={(e) => e.stopPropagation()} style={{ minWidth: '320px', maxWidth: '600px' }}>
            <div className="corners-decor"></div>
            <div className="memory-date-row text-[#c19a6b] font-semibold text-xs tracking-wider mb-2" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px', fill: 'currentColor' }}><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
              <span>{activeMemory.memory_date ? new Date(activeMemory.memory_date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase() : ''}</span>
            </div>
            <h3 className="font-serif text-2xl text-white mb-4 border-b border-[#c19a6b]/20 pb-2">{activeMemory.title || 'Anı Detayı'}</h3>
            <div className="text-[#a3b5b0] font-serif leading-relaxed text-base max-h-[50vh] overflow-y-auto pr-2" style={{ fontStyle: 'italic' }}>
              {activeMemory.content.split('\n').filter(Boolean).map((para, i) => (
                <p key={i} className="mb-3">{para}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Condolence Detail Modal */}
      {activeCondolence && (
        <div className="lightbox active" onClick={() => setActiveCondolence(null)}>
          <span className="lightbox-close" onClick={() => setActiveCondolence(null)}>&times;</span>
          <div className="lightbox-content premium-border p-8 bg-[#041e1a] border border-[#c19a6b]/30 rounded-2xl" onClick={(e) => e.stopPropagation()} style={{ minWidth: '320px', maxWidth: '600px' }}>
            <div className="corners-decor"></div>
            <div className="flex justify-between items-baseline mb-4 border-b border-[#c19a6b]/20 pb-2" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div>
                <span className="font-semibold text-white text-lg">{activeCondolence.author_name}</span>
                {activeCondolence.relation && <span className="text-xs text-[#a3b5b0] ml-2">({activeCondolence.relation})</span>}
              </div>
              <span className="text-xs text-[#627773]">{new Date(activeCondolence.created_at).toLocaleDateString(locale)}</span>
            </div>
            <div className="text-[#a3b5b0] font-serif leading-relaxed text-base max-h-[50vh] overflow-y-auto pr-2" style={{ fontStyle: 'italic' }}>
              {activeCondolence.message.split('\n').filter(Boolean).map((para, i) => (
                <p key={i} className="mb-3">&ldquo;{para}&rdquo;</p>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
