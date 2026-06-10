'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

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
  maxDepth?: number   // default 2; pass 99 for full/unlimited tree
}

function formatTreeName(fullName: string): string {
  if (!fullName) return ''
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 1) return fullName

  const lastName = parts[parts.length - 1]
  const initials = parts.slice(0, parts.length - 1)
    .map(p => p[0] ? `${p[0].toUpperCase()}.` : '')
    .filter(Boolean)
    .join('')

  return `${initials} ${lastName}`
}

const CW  = 118
const CH  = 148
const HG  = 24
const VG  = 68
const PAD = 40

const REL_LABELS: Record<string, string> = {
  mother: 'Annesi', father: 'Babası', spouse: 'Eşi', son: 'Oğlu', daughter: 'Kızı',
  sibling: 'Kardeşi', gm_maternal: 'Anneannesi', gf_maternal: 'Dedesi (A.T.)',
  gm_paternal: 'Babaannesi', gf_paternal: 'Dedesi (B.T.)',
  uncle: 'Amcası/Dayısı', aunt: 'Halası/Teyzesi',
  grandparent: 'Büyükannesi/Büyükbabası', grandchild: 'Torunu', other: 'Diğer',
}
const REL_ICONS: Record<string, string> = {
  mother: '👩', father: '👨', spouse: '💑', son: '👦', daughter: '👧',
  sibling: '🧑', gm_maternal: '👵', gf_maternal: '👴', gm_paternal: '👵',
  gf_paternal: '👴', uncle: '🧔', aunt: '👩', grandparent: '👴', grandchild: '🧒', other: '👤',
}

const GP_RELS        = new Set(['gm_maternal','gf_maternal','gm_paternal','gf_paternal','grandparent'])
const PAR_RELS       = new Set(['mother','father'])
const LEFT_LAT_RELS  = new Set(['sibling','uncle','aunt'])
const RIGHT_LAT_RELS = new Set(['spouse','other'])
const LAT_RELS       = new Set([...LEFT_LAT_RELS, ...RIGHT_LAT_RELS])

const isGP  = (r: string) => GP_RELS.has(r)
const isPar = (r: string) => PAR_RELS.has(r)
const isAnc = (r: string) => GP_RELS.has(r) || PAR_RELS.has(r)
const isLat = (r: string) => LAT_RELS.has(r)
const isDes = (r: string) => !isAnc(r) && !isLat(r)

function rowW(mems: TreeMember[]): number {
  return mems.length > 0 ? mems.length * CW + (mems.length - 1) * HG : 0
}

interface FlatNode {
  id: string; name: string; photo: string | null
  byear: number | null; dyear: number | null; alive: boolean
  rel: string; isVault: boolean; x: number; y: number; hidden: number
}
interface Branch { d: string; kind: 'tree' | 'couple'; delay: number }

export default function FamilyTreeCanvas({ vault, members, maxDepth = 2 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.05 }
    )
    obs.observe(el); return () => obs.disconnect()
  }, [])

  if (members.length === 0) return null

  const bp = new Map<string | null, TreeMember[]>()
  for (const m of members) {
    const k = m.parent_member_id ?? null
    if (!bp.has(k)) bp.set(k, [])
    bp.get(k)!.push(m)
  }

  // ── Helpers — defined inside component to close over maxDepth ──
  function descW(id: string | null, depth: number): number {
    if (depth > maxDepth) return CW
    const des = (bp.get(id) ?? []).filter(c => isDes(c.relationship))
    if (des.length === 0) return CW
    const tw = des.reduce((s, c, i) => s + descW(c.id, depth + 1) + (i > 0 ? HG : 0), 0)
    return Math.max(CW, tw)
  }

  function fullW(id: string | null, depth: number): number {
    if (depth > maxDepth) return CW
    const lats = (bp.get(id) ?? []).filter(c => isLat(c.relationship))
    return descW(id, depth) + lats.reduce((s, l) => s + fullW(l.id, depth + 1) + HG, 0)
  }

  function fullWL(id: string | null, depth: number): number {
    if (depth > maxDepth) return CW
    const lats = (bp.get(id) ?? []).filter(c => isLat(c.relationship))
    return descW(id, depth) + lats.reduce((s, l) => s + fullWL(l.id, depth + 1) + HG, 0)
  }

  function countAll(id: string | null): number {
    return (bp.get(id) ?? []).reduce((s, k) => s + 1 + countAll(k.id), 0)
  }

  // ── ownerCX ────────────────────────────────────────────────────
  const rootKids     = bp.get(null) ?? []
  const rootGPs      = rootKids.filter(c => isGP(c.relationship))
  const rootPars     = rootKids.filter(c => isPar(c.relationship))
  const rootLeftLats = rootKids.filter(c => LEFT_LAT_RELS.has(c.relationship))

  const parRowW = rowW(rootPars)
  const gpDirect = rowW(rootGPs)
  const gpViaParents = rootPars.reduce((mx, p) => {
    const sub = (bp.get(p.id) ?? []).filter(c => isAnc(c.relationship))
    return Math.max(mx, rowW(sub))
  }, 0)
  const gpRowW2 = Math.max(gpDirect, gpViaParents)

  const vaultDescW = descW(null, 0)
  const leftZoneW  = rootLeftLats.reduce((s, l, i) =>
    s + fullWL(l.id, 1) + (i > 0 ? HG : 0), 0)
  const leftGap = rootLeftLats.length > 0 ? HG : 0

  const ownerCX = Math.max(
    PAD + leftZoneW + leftGap + Math.max(CW, vaultDescW) / 2,
    PAD + Math.max(CW, parRowW, gpRowW2) / 2,
  )

  // ── lay() ──────────────────────────────────────────────────────
  const nodes: FlatNode[] = []
  const branches: Branch[] = []
  let tick = 0

  function lay(
    id: string | null,
    mem: TreeMember | null,
    vlt: boolean,
    cx: number,
    y: number,
    depth: number,
    leftBranch = false,
  ): void {
    const bd = vlt ? vault.birth_date : mem!.birth_date
    const dd = vlt ? vault.death_date : mem!.death_date
    const hidden = depth === maxDepth ? countAll(id) : 0

    nodes.push({
      id: id ?? '__vault__',
      name:  vlt ? vault.display_name : mem!.full_name,
      photo: vlt ? vault.cover_photo_url : mem!.photo_url,
      byear: bd ? new Date(bd).getFullYear() : null,
      dyear: dd ? new Date(dd).getFullYear() : null,
      alive: vlt ? !vault.death_date : mem!.is_alive,
      rel: vlt ? '' : mem!.relationship,
      isVault: vlt, x: cx, y, hidden,
    })

    if (depth >= maxDepth) return

    const kids = bp.get(id) ?? []

    if (vlt) {
      const directGPs  = kids.filter(c => isGP(c.relationship))
      const directPars = kids.filter(c => isPar(c.relationship))
      const des        = kids.filter(c => isDes(c.relationship))
      const leftLats   = kids.filter(c => LEFT_LAT_RELS.has(c.relationship))
      const rightLats  = kids.filter(c => RIGHT_LAT_RELS.has(c.relationship))

      if (directGPs.length > 0) {
        const rw = rowW(directGPs); let ax = cx - rw / 2
        for (const gp of directGPs) {
          const gCX = ax + CW / 2; const gY = y - 2 * (CH + VG)
          const my = (y + gY + CH) / 2
          branches.push({ d: `M${cx},${y} C${cx},${my} ${gCX},${my} ${gCX},${gY + CH}`, kind: 'tree', delay: tick++ * 55 })
          lay(gp.id, gp, false, gCX, gY, depth + 2)
          ax += CW + HG
        }
      }

      if (directPars.length > 0) {
        const rw = rowW(directPars); let ax = cx - rw / 2
        for (const par of directPars) {
          const pCX = ax + CW / 2; const pY = y - (CH + VG)
          const my = (y + pY + CH) / 2
          branches.push({ d: `M${cx},${y} C${cx},${my} ${pCX},${my} ${pCX},${pY + CH}`, kind: 'tree', delay: tick++ * 55 })
          lay(par.id, par, false, pCX, pY, depth + 1)
          ax += CW + HG
        }
      }

      if (des.length > 0) {
        const dws = des.map(d => descW(d.id, depth + 1))
        const tw  = dws.reduce((s, w, i) => s + w + (i > 0 ? HG : 0), 0)
        let dl    = cx - tw / 2
        for (let i = 0; i < des.length; i++) {
          const dCX = dl + dws[i] / 2; const dY = y + CH + VG
          const my = (y + CH + dY) / 2
          branches.push({ d: `M${cx},${y + CH} C${cx},${my} ${dCX},${my} ${dCX},${dY}`, kind: 'tree', delay: tick++ * 55 })
          lay(des[i].id, des[i], false, dCX, dY, depth + 1)
          dl += dws[i] + HG
        }
      }

      const dw0 = descW(null, 0)
      let rl = cx + dw0 / 2 + HG
      for (const l of rightLats) {
        const ldw = descW(l.id, depth + 1); const lCX = rl + ldw / 2
        branches.push({ d: `M${cx + CW / 2},${y + CH / 2} L${lCX - CW / 2},${y + CH / 2}`, kind: 'couple', delay: tick++ * 55 })
        lay(l.id, l, false, lCX, y, depth + 1, false)
        rl += fullW(l.id, depth + 1) + HG
      }

      let lr = cx - dw0 / 2 - HG
      for (const l of leftLats) {
        const ddw = descW(l.id, depth + 1); const lfw = fullWL(l.id, depth + 1)
        const lCX = lr - ddw / 2
        branches.push({ d: `M${cx - CW / 2},${y + CH / 2} L${lCX + CW / 2},${y + CH / 2}`, kind: 'couple', delay: tick++ * 55 })
        lay(l.id, l, false, lCX, y, depth + 1, true)
        lr -= lfw + HG
      }
      return
    }

    const ancs = kids.filter(c => isAnc(c.relationship))
    const des  = kids.filter(c => isDes(c.relationship))
    const lats = kids.filter(c => isLat(c.relationship))

    if (ancs.length > 0) {
      const rw = rowW(ancs); let ax = cx - rw / 2
      for (const a of ancs) {
        const aCX = ax + CW / 2; const aY = y - CH - VG
        const my = (y + aY + CH) / 2
        branches.push({ d: `M${cx},${y} C${cx},${my} ${aCX},${my} ${aCX},${aY + CH}`, kind: 'tree', delay: tick++ * 55 })
        lay(a.id, a, false, aCX, aY, depth + 1)
        ax += CW + HG
      }
    }

    if (des.length > 0) {
      const dws = des.map(d => descW(d.id, depth + 1))
      const tw  = dws.reduce((s, w, i) => s + w + (i > 0 ? HG : 0), 0)
      let dl    = cx - tw / 2
      for (let i = 0; i < des.length; i++) {
        const dCX = dl + dws[i] / 2; const dY = y + CH + VG
        const my = (y + CH + dY) / 2
        branches.push({ d: `M${cx},${y + CH} C${cx},${my} ${dCX},${my} ${dCX},${dY}`, kind: 'tree', delay: tick++ * 55 })
        lay(des[i].id, des[i], false, dCX, dY, depth + 1, leftBranch)
        dl += dws[i] + HG
      }
    }

    if (leftBranch) {
      let lr = cx - descW(id, depth) / 2 - HG
      for (const l of lats) {
        const ddw = descW(l.id, depth + 1); const lfw = fullWL(l.id, depth + 1)
        const lCX = lr - ddw / 2
        branches.push({ d: `M${cx - CW / 2},${y + CH / 2} L${lCX + CW / 2},${y + CH / 2}`, kind: 'couple', delay: tick++ * 55 })
        lay(l.id, l, false, lCX, y, depth + 1, true)
        lr -= lfw + HG
      }
    } else {
      let ll = cx + descW(id, depth) / 2 + HG
      for (const l of lats) {
        const ldw = descW(l.id, depth + 1); const lCX = ll + ldw / 2
        branches.push({ d: `M${cx + CW / 2},${y + CH / 2} L${lCX - CW / 2},${y + CH / 2}`, kind: 'couple', delay: tick++ * 55 })
        lay(l.id, l, false, lCX, y, depth + 1, false)
        ll += fullW(l.id, depth + 1) + HG
      }
    }
  }

  lay(null, null, true, ownerCX, 0, 0)

  const minY = nodes.reduce((m, n) => Math.min(m, n.y), 0)
  const yOff = PAD - minY
  for (const n of nodes) n.y += yOff
  for (const b of branches) {
    b.d = b.d.replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g,
      (_, x, y2) => `${x},${(parseFloat(y2) + yOff).toFixed(1)}`)
  }

  const W = nodes.reduce((m, n) => Math.max(m, n.x + CW / 2), 0) + PAD
  const H = nodes.reduce((m, n) => Math.max(m, n.y + CH + (n.hidden > 0 ? 20 : 0)), 0) + PAD
  const DASH = 2400

  return (
    <div ref={ref} className="w-full overflow-x-auto">
      <div className="relative" style={{ width: W, height: H }}>
        <svg width={W} height={H} className="absolute inset-0 pointer-events-none" aria-hidden>
          <style>{`
            @keyframes tree-flow {
              0% { stroke-dashoffset: 32; }
              100% { stroke-dashoffset: 0; }
            }
            .branch-flow-path {
              animation: tree-flow 1.2s linear infinite;
            }
            @keyframes pulse-ring {
              0% { box-shadow: 0 0 0 0 rgba(199, 167, 111, 0.45), 0 12px 30px rgba(0,0,0,0.3); }
              70% { box-shadow: 0 0 0 8px rgba(199, 167, 111, 0), 0 12px 30px rgba(0,0,0,0.3); }
              100% { box-shadow: 0 0 0 0 rgba(199, 167, 111, 0), 0 12px 30px rgba(0,0,0,0.3); }
            }
            .owner-pulse {
              animation: pulse-ring 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
          `}</style>
          <defs>
            <linearGradient id="ftGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c7a76f" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#c7a76f" stopOpacity="0.13" />
            </linearGradient>
          </defs>
          {branches.map((b, i) => (
            <g key={i}>
              <path d={b.d} fill="none"
                stroke={b.kind === 'couple' ? '#c7a76f' : 'url(#ftGrad)'}
                strokeWidth={2} strokeOpacity={b.kind === 'couple' ? 0.50 : 0.8}
                strokeLinecap="round"
                style={{
                  strokeDasharray: DASH,
                  strokeDashoffset: visible ? 0 : DASH,
                  transition: visible ? `stroke-dashoffset 0.7s ease ${b.delay}ms` : 'none',
                }}
              />
              {visible && (
                <path d={b.d} fill="none"
                  stroke="#c7a76f"
                  strokeWidth={1.5}
                  strokeOpacity={0.65}
                  strokeLinecap="round"
                  className="branch-flow-path"
                  style={{
                    strokeDasharray: '4, 12',
                    animationDelay: `${b.delay}ms`,
                  }}
                />
              )}
            </g>
          ))}
        </svg>

        {nodes.map(node => {
          const label = REL_LABELS[node.rel] ?? node.rel
          const icon  = REL_ICONS[node.rel] ?? '👤'
          const init  = node.name[0]?.toUpperCase() ?? '?'
          const yrs   = node.byear
            ? `${node.byear}${node.dyear ? ` – ${node.dyear}` : node.alive ? ' –' : ''}`
            : ''

          return (
            <div key={node.id} className="absolute"
              style={{
                left: node.x - CW / 2, top: node.y, width: CW,
                opacity:   visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(10px)',
                transition: visible
                  ? `opacity 0.5s ease ${node.isVault ? 50 : 260}ms, transform 0.5s ease ${node.isVault ? 50 : 260}ms`
                  : 'none',
              }}>
              <div className={`overflow-hidden rounded-xl p-2.5 text-center shadow-xl shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(199,167,111,0.12)] hover:border-[#c7a76f]/60 ${
                node.isVault
                  ? 'border-2 border-[#c7a76f] ring-4 ring-[#c7a76f]/15 bg-[#0f1c16] owner-pulse'
                  : 'border border-white/10 bg-[#121b17] hover:bg-[#15201b]'
              }`} style={{ height: CH }}>
                <div className={`relative mx-auto mb-1.5 flex items-center justify-center overflow-hidden rounded-full border-2 ${
                  node.isVault ? 'h-[52px] w-[52px] border-[#c7a76f]/70' : 'h-[44px] w-[44px] border-[#c7a76f]/35'
                } bg-[#f4eee3] shadow-md shadow-black/25`}>
                  {node.photo
                    ? <Image src={node.photo} alt={node.name} width={52} height={52} className="h-full w-full object-cover" unoptimized />
                    : node.rel
                      ? <span className="text-xl leading-none">{icon}</span>
                      : <span className="text-base font-bold text-[#173d31]">{init}</span>
                  }
                  {!node.alive && !node.isVault && (
                    <div className="absolute inset-x-0 bottom-0 flex justify-center bg-black/25 pb-0.5">
                      <span className="text-[8px] text-white/70">†</span>
                    </div>
                  )}
                </div>
                <div className="font-serif text-[11px] leading-snug text-neutral-100"
                  style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {formatTreeName(node.name)}
                </div>
                {label && (
                  <div className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-amber-400 truncate">
                    {label}
                  </div>
                )}
                {yrs && <div className="mt-0.5 text-[9px] text-[#6e7d75]">{yrs}</div>}
              </div>
              {node.hidden > 0 && (
                <div className="mt-1 flex justify-center">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#c7a76f]/30 bg-[#c7a76f]/10 px-2 py-0.5 text-[9px] font-medium text-[#c7a76f]/70">
                    +{node.hidden} kişi
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
