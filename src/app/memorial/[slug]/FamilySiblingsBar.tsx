'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Users } from 'lucide-react'
import type { FamilySibling } from './page'

export default function FamilySiblingsBar({
  siblings,
  family,
}: {
  siblings: FamilySibling[]
  family: { name: string; slug: string }
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        position: 'fixed',
        left: 16,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 8,
      }}
    >
      {/* Sibling avatars — shown when expanded */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          {siblings.map((s) => {
            const birthYear = s.birth_date ? new Date(s.birth_date).getFullYear() : null
            const deathYear = s.death_date ? new Date(s.death_date).getFullYear() : null
            const years = birthYear && deathYear ? `${birthYear} – ${deathYear}` : birthYear ? `${birthYear}` : null

            return (
              <Link
                key={s.vault_id}
                href={`/memorial/${s.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'rgba(10,12,17,.88)',
                  border: '1px solid rgba(201,169,110,.25)',
                  borderRadius: 999,
                  padding: '6px 14px 6px 6px',
                  textDecoration: 'none',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,.4)',
                  transition: 'border-color .2s',
                }}
                className="hover:border-[rgba(201,169,110,.6)]"
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1.5px solid rgba(201,169,110,.35)', position: 'relative', background: '#1a1208' }}>
                  {s.cover_photo_url ? (
                    <Image
                      src={s.cover_photo_url}
                      alt={s.display_name}
                      fill
                      sizes="36px"
                      className="object-cover object-top"
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users style={{ width: 16, height: 16, color: '#C9A96E' }} />
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: '#F4F0E6', fontFamily: 'var(--font-cormorant), Georgia, serif', lineHeight: 1.2 }}>
                    {s.display_name}
                  </div>
                  {years && (
                    <div style={{ fontSize: 10.5, color: '#C9A96E', marginTop: 1 }}>{years}</div>
                  )}
                </div>
              </Link>
            )
          })}

          {/* Family page link */}
          <Link
            href={`/aile/${family.slug}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(143,184,158,.15)',
              border: '1px solid rgba(143,184,158,.4)',
              borderRadius: 999,
              padding: '5px 14px',
              fontSize: 11,
              fontWeight: 600,
              color: '#8FB89E',
              textDecoration: 'none',
              letterSpacing: '.04em',
            }}
          >
            <Users style={{ width: 12, height: 12 }} />
            {family.name} →
          </Link>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: expanded ? 'rgba(143,184,158,.2)' : 'rgba(10,12,17,.9)',
          border: `1.5px solid ${expanded ? 'rgba(143,184,158,.6)' : 'rgba(201,169,110,.4)'}`,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0,0,0,.5)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
          transition: 'all .2s',
        }}
        title={expanded ? 'Kapat' : `${family.name} — ${siblings.length} üye`}
      >
        <Users style={{ width: 18, height: 18, color: expanded ? '#8FB89E' : '#C9A96E' }} />
        <span style={{ fontSize: 8.5, fontWeight: 700, color: expanded ? '#8FB89E' : '#C9A96E', letterSpacing: '.06em', textTransform: 'uppercase' }}>
          Aile
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, color: expanded ? '#8FB89E' : '#C9A96E', letterSpacing: '.04em', marginTop: -2 }}>
          {siblings.length}
        </span>
      </button>
    </div>
  )
}
