import Image from 'next/image'
import Link from 'next/link'

interface Props {
  vault: {
    id: string
    display_name: string
    cover_photo_url?: string | null
    birth_date?: string | null
    death_date?: string | null
  }
  sectionLabel: string
  sectionIcon: string
}

export default function PersonHeader({ vault, sectionLabel, sectionIcon }: Props) {
  const birthYear = vault.birth_date ? new Date(vault.birth_date).getFullYear() : null
  const deathYear = vault.death_date ? new Date(vault.death_date).getFullYear() : null
  const lifespan = birthYear || deathYear
    ? `${birthYear ?? '?'} – ${deathYear ?? ''}`
    : null

  return (
    <div className="mb-8 flex items-center gap-4 rounded-2xl border border-[#e5dccb] bg-white px-5 py-3.5 shadow-sm">
      <Link href={`/dashboard/vault/${vault.id}`} className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-[#e5dccb] bg-[#f5efdf] transition-opacity hover:opacity-80">
        {vault.cover_photo_url ? (
          <Image src={vault.cover_photo_url} alt={vault.display_name} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg text-[#c8bfb0]">👤</div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/dashboard/vault/${vault.id}`} className="block truncate text-sm font-semibold text-[#1f2d27] transition-colors hover:text-[#174f35]">
          {vault.display_name}
        </Link>
        {lifespan && <p className="font-serif text-xs text-[#adb5ab]">{lifespan}</p>}
      </div>

      <div className="h-7 w-px shrink-0 bg-[#e5dccb]" />

      <div className="flex shrink-0 items-center gap-2">
        <span className="text-lg leading-none">{sectionIcon}</span>
        <span className="hidden text-sm font-semibold text-[#174f35] sm:block">{sectionLabel}</span>
      </div>
    </div>
  )
}
