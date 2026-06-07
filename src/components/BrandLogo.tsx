import Link from 'next/link'

type BrandLogoProps = {
  href?: string
  markOnly?: boolean
  light?: boolean
  className?: string
}

export function BrandMark({ light = false, className = '' }: Pick<BrandLogoProps, 'light' | 'className'>) {
  const bg = light ? 'bg-[#f4eee3]' : 'bg-[#f4eee3]'
  const border = light ? 'border-[#c7a76f]/70' : 'border-[#c7a76f]'

  return (
    <span
      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${border} ${bg} shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 40 40"
        className="h-7 w-7"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 27.5V14.5"
          stroke="#173d31"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M20 20.5C16.2 20.5 13.4 18.1 12.2 14.8C15.9 14.2 18.7 15.7 20 18.2C21.3 15.7 24.1 14.2 27.8 14.8C26.6 18.1 23.8 20.5 20 20.5Z"
          fill="#173d31"
        />
        <path
          d="M20 14.7C17.7 12.7 17.2 9.8 18.5 7.1C21.5 8.3 23 10.7 22.1 13.6C21.7 14.1 20.9 14.6 20 14.7Z"
          fill="#b08340"
        />
        <path
          d="M20 27.1C16.6 27.1 14.2 29.1 12.7 32.2H27.3C25.8 29.1 23.4 27.1 20 27.1Z"
          fill="#b08340"
        />
        <path
          d="M15 25.6C16.8 25.6 18.6 26.4 20 27.7C21.4 26.4 23.2 25.6 25 25.6"
          stroke="#173d31"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

export default function BrandLogo({ href = '/', markOnly = false, light = false, className = '' }: BrandLogoProps) {
  const content = (
    <>
      <BrandMark light={light} />
      {!markOnly && <span className="font-serif text-2xl">The Maradi</span>}
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
