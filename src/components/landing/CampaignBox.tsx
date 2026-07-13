'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { ArrowRight, Eye } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import type { CampaignStats } from '@/lib/campaign'

const G = {
  gold: '#C9A96E',
  goldBright: '#D8BE8A',
  goldGrad: 'linear-gradient(135deg, #E2C885, #C39E63)',
  text: '#EDE8DD',
  textMuted: 'rgba(237,232,221,.56)',
  card: 'rgba(255,255,255,.035)',
  cardBorder: 'rgba(201,169,110,.22)',
  sans: 'var(--font-outfit), system-ui, sans-serif',
  serif: 'var(--font-cormorant), Georgia, serif',
}

export default function CampaignBox({
  stats,
  campaignPriceText,
  regularPriceText,
  copy,
}: {
  stats: CampaignStats
  campaignPriceText: string
  regularPriceText: string
  copy: {
    badge: string
    slotsRemaining: string
    slotsSoldOut: string
    progressLabel: string
    sub: string
    ctaPrimary: string
    ctaSecondary: string
  }
}) {
  const { remainingSlots, eligibleCount, usedPercentage, soldOut } = stats

  useEffect(() => {
    trackEvent('campaign_view', {
      campaign_name: 'first_100_families',
      remaining_slots: remainingSlots,
      used_slots: eligibleCount,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const slotsText = soldOut
    ? copy.slotsSoldOut
    : copy.slotsRemaining.replace('{slots}', String(remainingSlots))
  const progressText = copy.progressLabel.replace('{count}', String(eligibleCount))

  return (
    <div
      style={{
        borderRadius: 18,
        background: G.card,
        border: `1px solid ${G.cardBorder}`,
        padding: 'clamp(18px,2.6vw,26px)',
        marginBottom: 20,
      }}
    >
      {/* Rozet */}
      <span
        style={{
          display: 'inline-block',
          fontSize: 11,
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: '#14110a',
          background: G.goldGrad,
          borderRadius: 999,
          padding: '5px 12px',
          marginBottom: 14,
          fontFamily: G.sans,
        }}
      >
        {copy.badge}
      </span>

      {/* Fiyat */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: G.serif, fontSize: 'clamp(30px,4vw,42px)', fontWeight: 500, color: G.goldBright, lineHeight: 1 }}>
          {soldOut ? regularPriceText : campaignPriceText}
        </span>
        {!soldOut && (
          <span style={{ fontSize: 16, color: G.textMuted, textDecoration: 'line-through', fontFamily: G.sans, fontWeight: 300 }}>
            {regularPriceText}
          </span>
        )}
      </div>

      {/* Kontenjan mesajı */}
      <p style={{ fontFamily: G.sans, fontSize: 14.5, fontWeight: 500, color: soldOut ? G.textMuted : G.text, margin: '0 0 12px' }}>
        {slotsText}
      </p>

      {/* İlerleme çubuğu */}
      <div style={{ height: 6, borderRadius: 999, background: 'rgba(201,169,110,.14)', overflow: 'hidden', marginBottom: 8 }}>
        <div
          style={{
            height: '100%',
            width: `${usedPercentage}%`,
            borderRadius: 999,
            background: G.goldGrad,
            transition: 'width .6s ease',
          }}
        />
      </div>
      <p style={{ fontFamily: G.sans, fontSize: 12, color: G.textMuted, margin: '0 0 16px' }}>{progressText}</p>

      {/* Alt açıklama */}
      <p style={{ fontFamily: G.sans, fontSize: 12.5, color: G.textMuted, margin: '0 0 18px', lineHeight: 1.55 }}>
        {copy.sub}
      </p>

      {/* CTA'lar */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link
          href="/satin-al/anma"
          onClick={() =>
            trackEvent('campaign_primary_cta_click', {
              campaign_name: 'first_100_families',
              remaining_slots: remainingSlots,
              used_slots: eligibleCount,
            })
          }
          style={{
            display: 'flex', flex: '1 1 200px', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '15px 24px', borderRadius: 14, background: G.goldGrad, color: '#14110a',
            fontSize: 15.5, fontWeight: 600, textDecoration: 'none', fontFamily: G.sans,
            boxShadow: '0 8px 24px rgba(201,169,110,.24)',
          }}
        >
          {copy.ctaPrimary}
          <ArrowRight style={{ width: 17, height: 17 }} />
        </Link>
        <Link
          href="/memorial/demo"
          onClick={() =>
            trackEvent('campaign_demo_click', {
              campaign_name: 'first_100_families',
              remaining_slots: remainingSlots,
              used_slots: eligibleCount,
            })
          }
          style={{
            display: 'flex', flex: '1 1 200px', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '15px 22px', borderRadius: 14, background: 'rgba(201,169,110,.08)',
            border: `1px solid ${G.cardBorder}`, color: G.goldBright, fontSize: 14.5, fontWeight: 600,
            textDecoration: 'none', fontFamily: G.sans,
          }}
        >
          <Eye style={{ width: 16, height: 16 }} />
          {copy.ctaSecondary}
        </Link>
      </div>
    </div>
  )
}
