import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

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
  const lifespan = birthYear || deathYear ? `${birthYear ?? '?'} – ${deathYear ?? ''}` : null

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1c2e25] mb-7 shadow-lg">
      {/* Arka plan — cover foto */}
      {vault.cover_photo_url && (
        <div className="absolute inset-0">
          <Image src={vault.cover_photo_url} alt="" fill className="object-cover opacity-10" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1c2e25] to-[#1c2e25]/80" />
        </div>
      )}

      <div className="relative flex items-center gap-4 px-5 py-4">
        {/* Geri butonu */}
        <Link
          href={`/dashboard/vault/${vault.id}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/15 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        {/* Avatar */}
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-[#2a4035]">
          {vault.cover_photo_url ? (
            <Image src={vault.cover_photo_url} alt={vault.display_name} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-base text-[#dfbd72]">
              {vault.display_name[0]}
            </div>
          )}
        </div>

        {/* İsim + tarih */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white leading-tight">{vault.display_name}</p>
          {lifespan && <p className="text-[11px] text-white/40">{lifespan}</p>}
        </div>

        {/* Divider */}
        <div className="h-8 w-px shrink-0 bg-white/10" />

        {/* Bölüm başlığı */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xl leading-none">{sectionIcon}</span>
          <span className="text-sm font-semibold text-white/90">{sectionLabel}</span>
        </div>
      </div>
    </div>
  )
}
