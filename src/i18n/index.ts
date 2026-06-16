import en, { LangDict } from './en'
import tr from './tr'
import ka from './ka'
import ru from './ru'
import hy from './hy'

export type Lang = 'tr' | 'ka' | 'ru' | 'en' | 'hy'

export const langs: { code: Lang; label: string; flag: string }[] = [
  { code: 'ka', label: 'ქართული', flag: 'KA' },
  { code: 'tr', label: 'Türkçe', flag: 'TR' },
  { code: 'ru', label: 'Русский', flag: 'RU' },
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'hy', label: 'Հայերեն', flag: 'AM' },
]

export const dictionaries: Record<Lang, LangDict> = { en, tr, ka, ru, hy }

function getCookieLang(): Lang | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)tm_lang=([^;]+)/)
  if (!match) return null
  const val = match[1] as Lang
  return val in dictionaries ? val : null
}

export function detectLang(): Lang {
  if (typeof window === 'undefined') return 'tr'
  // Priority 1: cookie (set by middleware or manual switcher)
  const cookieLang = getCookieLang()
  if (cookieLang) return cookieLang
  // Priority 2: localStorage (legacy / manual switcher)
  try {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved && saved in dictionaries) return saved
  } catch {
    // localStorage may be unavailable in private mode
  }
  // Priority 3: browser language
  const browser = navigator.language.slice(0, 2).toLowerCase()
  if (browser === 'ka') return 'ka'
  if (browser === 'tr') return 'tr'
  if (browser === 'ru') return 'ru'
  if (browser === 'hy') return 'hy'
  return 'en'
}

export function saveLang(lang: Lang) {
  // Save to localStorage for fallback
  try {
    localStorage.setItem('lang', lang)
  } catch {
    // localStorage may be unavailable
  }
  // Also set the cookie so middleware & SSR can read it
  if (typeof document !== 'undefined') {
    const maxAge = 60 * 60 * 24 * 365
    document.cookie = `tm_lang=${lang}; path=/; max-age=${maxAge}; SameSite=Lax`
  }
}

export type { LangDict }
