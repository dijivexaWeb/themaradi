'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useLang } from '@/i18n/context'

const ALPHABETS: Record<string, string[]> = {
  tr: [
    'A','B','C','Ç','D','E','F','G','Ğ','H',
    'I','İ','J','K','L','M','N','O','Ö','P',
    'R','S','Ş','T','U','Ü','V','Y','Z',
  ],
  en: [
    'A','B','C','D','E','F','G','H','I','J','K','L','M',
    'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  ],
  ka: [
    'ა','ბ','გ','დ','ე','ვ','ზ','თ','ი','კ','ლ','მ','ნ',
    'ო','პ','ჟ','რ','ს','ტ','უ','ფ','ქ','ღ','ყ','შ','ჩ',
    'ც','ძ','წ','ჭ','ხ','ჯ','ჰ',
  ],
  ru: [
    'А','Б','В','Г','Д','Е','Ж','З','И','К','Л','М',
    'Н','О','П','Р','С','Т','У','Ф','Х','Ц','Ч','Ш','Э','Ю','Я',
  ],
}

export default function FilterBar({
  currentQ,
  currentLetter,
}: {
  currentQ: string
  currentLetter: string
}) {
  const { t, lang } = useLang()
  const labels = t.memorialsPage
  const alphabet = ALPHABETS[lang] ?? ALPHABETS.tr

  const router = useRouter()
  const pathname = usePathname()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navigate = (q: string, l: string) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (l) params.set('l', l)
    const str = params.toString()
    router.push(`${pathname}${str ? `?${str}` : ''}`)
  }

  const handleSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => navigate(value, ''), 400)
  }

  const handleLetter = (letter: string) =>
    navigate('', letter === currentLetter ? '' : letter)

  const handleClear = () => navigate('', '')

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-60 xl:w-72">
      {/* Search */}
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a8f7a]" />
        <input
          type="search"
          defaultValue={currentQ}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="w-full rounded-xl border border-[#e6dccb] bg-white py-3 pl-10 pr-10 text-sm text-[#173d31] placeholder-[#b5a88e] outline-none transition focus:border-[#173d31] focus:ring-2 focus:ring-[#173d31]/10"
        />
        {currentQ && (
          <button
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9a8f7a] transition hover:text-[#173d31]"
            aria-label="Temizle"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Alphabet */}
      <div className="rounded-xl border border-[#e6dccb] bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#9a8f7a]">
          {labels.filterByLetter}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={handleClear}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              !currentLetter && !currentQ
                ? 'bg-[#173d31] text-white'
                : 'text-[#173d31] hover:bg-[#eef7f2]'
            }`}
          >
            {labels.allProfiles}
          </button>
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => handleLetter(letter)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                currentLetter === letter
                  ? 'bg-[#173d31] text-white'
                  : 'text-[#173d31] hover:bg-[#eef7f2]'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
