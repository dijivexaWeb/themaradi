import Link from 'next/link'

type BrandLogoProps = {
  href?: string
  markOnly?: boolean
  light?: boolean
  className?: string
}

export function BrandMark({ light = false, className = '' }: Pick<BrandLogoProps, 'light' | 'className'>) {
  const petal   = light ? '#c7a76f' : '#173d31'
  const inner   = light ? '#f4eee3' : '#c7a76f'
  const water   = light ? '#c7a76f' : '#c7a76f'

  return (
    <span
      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${light ? 'border-[#c7a76f]/60 bg-[#0c3327]' : 'border-[#c7a76f] bg-[#f4eee3]'} shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" className="h-[26px] w-[26px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Dış yapraklar */}
        <path d="M 20 28 C 18 25 18 20.5 20 17 C 22 20.5 22 25 20 28 Z" fill={petal} opacity="0.75" transform="rotate(-52, 20, 28)"/>
        <path d="M 20 28 C 18 25 18 20.5 20 17 C 22 20.5 22 25 20 28 Z" fill={petal} opacity="0.75" transform="rotate(52, 20, 28)"/>
        {/* İç yapraklar */}
        <path d="M 20 28 C 17.5 24 17.5 16 20 12 C 22.5 16 22.5 24 20 28 Z" fill={petal} opacity="0.9" transform="rotate(-24, 20, 28)"/>
        <path d="M 20 28 C 17.5 24 17.5 16 20 12 C 22.5 16 22.5 24 20 28 Z" fill={petal} opacity="0.9" transform="rotate(24, 20, 28)"/>
        {/* Merkez yaprak */}
        <path d="M 20 28 C 17 24 17 13 20 8 C 23 13 23 24 20 28 Z" fill={petal}/>
        {/* Altın iç şerit */}
        <path d="M 20 27 C 19 24 19 16 20 12 C 21 16 21 24 20 27 Z" fill={inner} opacity="0.85"/>
        {/* Su çizgisi */}
        <path d="M 11 30.5 Q 20 33 29 30.5" stroke={water} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity={light ? '0.7' : '1'}/>
      </svg>
    </span>
  )
}

export default function BrandLogo({ href = '/', markOnly = false, light = false, className = '' }: BrandLogoProps) {
  const content = (
    <>
      <BrandMark light={light} />
      {!markOnly && <span className="font-serif text-2xl">The Eternal Memory</span>}
    </>
  )

  if (!href) {
    return <div className={`flex items-center gap-3 ${className}`}>{content}</div>
  }

  return (
    <Link href={href} className={`flex items-center gap-3 ${light ? 'text-[#efe7d8]' : 'text-[#173d31]'} ${className}`}>
      {content}
    </Link>
  )
}
