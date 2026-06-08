'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const REL_LABELS: Record<string, string> = {
  mother: 'Annesi', father: 'Babası', spouse: 'Eşi', son: 'Oğlu',
  daughter: 'Kızı', sibling: 'Kardeşi', grandparent: 'Büyükanne/Büyükbaba',
  grandchild: 'Torunu', other: 'Diğer',
}
const REL_ICONS: Record<string, string> = {
  mother: '👩', father: '👨', spouse: '💑', son: '👦',
  daughter: '👧', sibling: '🧑', grandparent: '👴', grandchild: '🧒', other: '👤',
}

export type TreeMember = {
  id: string
  full_name: string
  relationship: string
  photo_url: string | null
  birth_date: string | null
  death_date: string | null
  is_alive: boolean
  parent_member_id: string | null
}

export type TreeVault = {
  display_name: string
  cover_photo_url: string | null
  birth_date: string | null
  death_date: string | null
}

interface Props {
  vault: TreeVault
  members: TreeMember[]
}

// ── Layout constants ──────────────────────────────────────────
const CW       = 1000   // canvas width (fixed, scrolls on mobile)
const CARD_W   = 112
const CARD_H   = 152
const ROW_H    = CARD_H + 72
const PAD      = 44

const ccx = (x: number) => x + CARD_W / 2

function spread(n: number, lo: number, hi: number): number[] {
  if (n === 0) return []
  if (n === 1) return [(lo + hi) / 2 - CARD_W / 2]
  const step = (hi - lo) / n
  return Array.from({ length: n }, (_, i) => lo + step * i + (step - CARD_W) / 2)
}

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const my = (y1 + y2) / 2
  return `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`
}

type Node = {
  id: string; x: number; y: number
  member: TreeMember | null; isVault?: boolean
}
type Branch = { d: string; delay: number; kind: 'trunk' | 'couple' | 'branch' }

function buildLayout(vault: TreeVault, members: TreeMember[]) {
  const byRel = (...rels: string[]) => members.filter(m => rels.includes(m.relationship))

  const grandparents  = byRel('grandparent')
  const mothers       = byRel('mother')
  const fathers       = byRel('father')
  const spouses       = byRel('spouse')
  const children      = byRel('son', 'daughter')
  const grandchildren = byRel('grandchild')
  const siblings      = byRel('sibling')
  const others        = byRel('other')

  type RowKey = 'gp' | 'parent' | 'vault' | 'child' | 'gc' | 'other'
  const rowOrder: RowKey[] = []
  if (grandparents.length)                       rowOrder.push('gp')
  if (mothers.length || fathers.length)          rowOrder.push('parent')
  rowOrder.push('vault')
  if (children.length || siblings.length)        rowOrder.push('child')
  if (grandchildren.length)                      rowOrder.push('gc')
  if (others.length)                             rowOrder.push('other')

  const rowY: Record<RowKey, number> = {} as never
  rowOrder.forEach((r, i) => { rowY[r] = i * ROW_H + 20 })

  const nodes: Node[]    = []
  const branches: Branch[] = []

  // Vault person position (shifts left if spouse exists)
  const vy = rowY['vault']
  const vaultX = spouses.length > 0 ? CW / 2 - CARD_W - 36 : CW / 2 - CARD_W / 2
  const vaultCx = ccx(vaultX)
  nodes.push({ id: '__vault', x: vaultX, y: vy, member: null, isVault: true })

  // Spouse
  let spouseCx = 0
  if (spouses.length > 0) {
    const sx = vaultX + CARD_W + 72
    spouseCx = ccx(sx)
    nodes.push({ id: spouses[0].id, x: sx, y: vy, member: spouses[0] })
    const connY = vy + 44
    branches.push({ d: `M${vaultCx},${connY} L${spouseCx},${connY}`, delay: 0, kind: 'couple' })
  }

  const coupleMidCx = spouseCx > 0 ? (vaultCx + spouseCx) / 2 : vaultCx
  const vaultBottom = vy + CARD_H

  // Parents
  let motherCx = 0, fatherCx = 0
  if (rowOrder.includes('parent')) {
    const py = rowY['parent']
    if (mothers.length) {
      const xs = spread(mothers.length, PAD, CW / 2 - 16)
      mothers.forEach((m, i) => {
        const x = xs[i]; motherCx = ccx(x)
        nodes.push({ id: m.id, x, y: py, member: m })
        branches.push({ d: bezier(motherCx, py + CARD_H, vaultCx, vy), delay: 200, kind: 'branch' })
      })
    }
    if (fathers.length) {
      const xs = spread(fathers.length, CW / 2 + 16, CW - PAD - CARD_W)
      fathers.forEach((m, i) => {
        const x = xs[i]; fatherCx = ccx(x)
        nodes.push({ id: m.id, x, y: py, member: m })
        branches.push({ d: bezier(fatherCx, py + CARD_H, vaultCx, vy), delay: 200, kind: 'branch' })
      })
    }
  }

  // Grandparents
  if (rowOrder.includes('gp')) {
    const gpy = rowY['gp']
    const targetY = rowY['parent'] ?? vy
    const half = Math.ceil(grandparents.length / 2)
    const leftGPs  = grandparents.slice(0, half)
    const rightGPs = grandparents.slice(half)
    spread(leftGPs.length, PAD, CW / 2 - 16).forEach((x, i) => {
      const gcx = ccx(x)
      nodes.push({ id: leftGPs[i].id, x, y: gpy, member: leftGPs[i] })
      branches.push({ d: bezier(gcx, gpy + CARD_H, motherCx || vaultCx, targetY), delay: 0, kind: 'branch' })
    })
    spread(rightGPs.length, CW / 2 + 16, CW - PAD - CARD_W).forEach((x, i) => {
      const gcx = ccx(x)
      nodes.push({ id: rightGPs[i].id, x, y: gpy, member: rightGPs[i] })
      branches.push({ d: bezier(gcx, gpy + CARD_H, fatherCx || vaultCx, targetY), delay: 0, kind: 'branch' })
    })
  }

  // Children + siblings
  const childCxMap: Record<string, number> = {}
  if (rowOrder.includes('child')) {
    const cy = rowY['child']
    const all = [...children, ...siblings]
    spread(all.length, PAD, CW - PAD - CARD_W).forEach((x, i) => {
      const kcx = ccx(x)
      childCxMap[all[i].id] = kcx
      nodes.push({ id: all[i].id, x, y: cy, member: all[i] })
      branches.push({ d: bezier(coupleMidCx, vaultBottom, kcx, cy), delay: 400, kind: 'branch' })
    })
  }

  // Grandchildren (grouped by parent_member_id)
  if (rowOrder.includes('gc')) {
    const gcy = rowY['gc']
    const childBottom = (rowY['child'] ?? vy) + CARD_H
    const groups: Record<string, TreeMember[]> = {}
    for (const gc of grandchildren) {
      const pid = gc.parent_member_id ?? '__unknown__'
      ;(groups[pid] ??= []).push(gc)
    }
    const groupEntries = Object.entries(groups)
    const groupCount = groupEntries.length
    for (const [pid, gcs] of groupEntries) {
      const parentCx = childCxMap[pid] ?? coupleMidCx
      const zoneHalf = Math.min(180, (CW - PAD * 2) / groupCount / 1.5)
      const lo = Math.max(PAD, parentCx - zoneHalf)
      const hi = Math.min(CW - PAD - CARD_W, parentCx + zoneHalf)
      spread(gcs.length, lo, hi).forEach((x, i) => {
        const gcx = ccx(x)
        nodes.push({ id: gcs[i].id, x, y: gcy, member: gcs[i] })
        branches.push({ d: bezier(parentCx, childBottom, gcx, gcy), delay: 600, kind: 'branch' })
      })
    }
  }

  // Others
  if (rowOrder.includes('other')) {
    const oy = rowY['other']
    spread(others.length, PAD, CW - PAD - CARD_W).forEach((x, i) => {
      nodes.push({ id: others[i].id, x, y: oy, member: others[i] })
    })
  }

  // Central trunk (decorative, behind everything)
  const topRowY = rowOrder.length > 1 ? rowY[rowOrder[0]] + CARD_H / 2 : vy
  const canvasH = rowOrder.length * ROW_H + 36

  branches.unshift({
    d: `M${vaultCx},${canvasH - 20} L${vaultCx},${topRowY}`,
    delay: 0,
    kind: 'trunk',
  })

  return { nodes, branches, canvasH }
}

// ── Person card ───────────────────────────────────────────────
function PersonCard({ node, vault, visible }: { node: Node; vault: TreeVault; visible: boolean }) {
  const m = node.member
  const name  = node.isVault ? vault.display_name : (m?.full_name ?? '')
  const rel   = node.isVault ? 'Profil' : (REL_LABELS[m?.relationship ?? ''] ?? m?.relationship ?? '')
  const icon  = node.isVault ? null : (REL_ICONS[m?.relationship ?? ''] ?? '👤')
  const photo = node.isVault ? vault.cover_photo_url : (m?.photo_url ?? null)
  const alive = node.isVault ? !vault.death_date : (m?.is_alive ?? true)
  const bY    = node.isVault
    ? (vault.birth_date  ? new Date(vault.birth_date).getFullYear()  : null)
    : (m?.birth_date     ? new Date(m.birth_date).getFullYear()      : null)
  const dY    = node.isVault
    ? (vault.death_date  ? new Date(vault.death_date).getFullYear()  : null)
    : (m?.death_date     ? new Date(m.death_date).getFullYear()      : null)
  const years = bY ? `${bY}${dY ? ` – ${dY}` : alive ? ' –' : ''}` : ''
  const init  = name[0]?.toUpperCase() ?? '?'

  return (
    <div
      className="absolute"
      style={{
        left: node.x,
        top:  node.y,
        width: CARD_W,
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: `opacity 0.5s ease ${node.isVault ? 60 : 280}ms, transform 0.5s ease ${node.isVault ? 60 : 280}ms`,
      }}
    >
      <div className={`overflow-hidden rounded-xl p-2.5 text-center shadow-xl shadow-black/30 ${
        node.isVault
          ? 'border-2 border-[#c7a76f] ring-4 ring-[#c7a76f]/15 bg-[#0f1c16]'
          : 'border border-white/10 bg-[#121b17]'
      }`}>
        {/* Photo */}
        <div className={`relative mx-auto mb-1.5 flex items-center justify-center overflow-hidden rounded-full border-2 ${
          node.isVault ? 'h-[52px] w-[52px] border-[#c7a76f]/70' : 'h-[44px] w-[44px] border-[#c7a76f]/35'
        } bg-[#f4eee3] shadow-md shadow-black/25`}>
          {photo ? (
            <Image src={photo} alt={name} width={52} height={52} className="h-full w-full object-cover" unoptimized />
          ) : icon ? (
            <span className="text-xl leading-none">{icon}</span>
          ) : (
            <span className="text-base font-bold text-[#173d31]">{init}</span>
          )}
          {!alive && !node.isVault && (
            <div className="absolute inset-x-0 bottom-0 flex justify-center bg-black/25 pb-0.5">
              <span className="text-[8px] text-white/70">†</span>
            </div>
          )}
        </div>
        {/* Name */}
        <div
          className="font-serif text-[11px] leading-snug text-white"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {name}
        </div>
        <div className="mt-0.5 text-[9px] font-medium uppercase tracking-widest text-[#c7a76f]">{rel}</div>
        {years && <div className="mt-0.5 text-[9px] text-[#6e7d75]">{years}</div>}
      </div>
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────
export default function FamilyTreeCanvas({ vault, members }: Props) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  if (members.length === 0) return null

  const { nodes, branches, canvasH } = buildLayout(vault, members)
  const DASH = 2600

  return (
    <div ref={ref} className="w-full overflow-x-auto">
      <div className="relative" style={{ width: CW, height: canvasH }}>

        {/* SVG branches */}
        <svg
          width={CW}
          height={canvasH}
          className="absolute inset-0 pointer-events-none"
          aria-hidden
        >
          <defs>
            <radialGradient id="ftGlow" cx="50%" cy="50%" r="38%">
              <stop offset="0%" stopColor="#c7a76f" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#c7a76f" stopOpacity="0" />
            </radialGradient>
            <filter id="ftBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <rect width={CW} height={canvasH} fill="url(#ftGlow)" />

          {branches.map((b, i) => {
            const isTrunk  = b.kind === 'trunk'
            const isCouple = b.kind === 'couple'
            return (
              <path
                key={i}
                d={b.d}
                fill="none"
                stroke={isTrunk ? '#3a2510' : isCouple ? '#c7a76f' : '#7a5c28'}
                strokeWidth={isTrunk ? 8 : isCouple ? 2 : 2.5}
                strokeLinecap="round"
                opacity={isTrunk ? 0.35 : isCouple ? 0.80 : 0.60}
                filter={isCouple ? 'url(#ftBlur)' : undefined}
                style={{
                  strokeDasharray: DASH,
                  strokeDashoffset: visible ? 0 : DASH,
                  transition: `stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1) ${b.delay}ms`,
                }}
              />
            )
          })}

          {/* Couple heart dot */}
          {branches.filter(b => b.kind === 'couple').map((b, i) => {
            const m1 = b.d.match(/M([\d.]+),([\d.]+)/)
            const m2 = b.d.match(/L([\d.]+),([\d.]+)/)
            if (!m1 || !m2) return null
            const mx = (parseFloat(m1[1]) + parseFloat(m2[1])) / 2
            return (
              <circle key={`cdot-${i}`} cx={mx} cy={parseFloat(m1[2])} r={5}
                fill="#c7a76f" opacity={visible ? 0.9 : 0}
                style={{ transition: `opacity 0.5s ease 800ms` }} />
            )
          })}

          {/* Anchor dots at card bottoms */}
          {nodes.map(n => (
            <circle key={`nd-${n.id}`}
              cx={n.x + CARD_W / 2} cy={n.y + CARD_H} r={3}
              fill={n.isVault ? '#c7a76f' : '#7a5c28'}
              opacity={visible ? 0.50 : 0}
              style={{ transition: `opacity 0.4s ease 1000ms` }} />
          ))}
        </svg>

        {/* Person cards */}
        {nodes.map(n => <PersonCard key={n.id} node={n} vault={vault} visible={visible} />)}
      </div>

      {/* Footer bar */}
      <div className="mt-4 rounded-xl border border-[#c7a76f]/20 bg-[#0f1c16]/90 px-4 py-3 text-center text-xs text-[#b8aa93]">
        <span className="font-serif text-[#c7a76f]">{members.length} kişi</span>
        <span className="mx-2 text-white/20">/</span>
        Bu aile bağı The Maradi ile korunur.
      </div>
    </div>
  )
}
