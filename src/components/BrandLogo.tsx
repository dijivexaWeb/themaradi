import Link from 'next/link'

type BrandLogoProps = {
  href?: string
  markOnly?: boolean
  light?: boolean
  className?: string
}

export function BrandMark({ className = '' }: Pick<BrandLogoProps, 'light' | 'className'>) {
  return (
    <span
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
      style={{
        width: 44,
        height: 44,
        backgroundImage: 'url(/images/logo-mark.png)',
        backgroundSize: 'auto 78px',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
      }}
    />
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
