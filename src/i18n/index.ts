import en, { LangDict } from './en'
import tr from './tr'
import ka from './ka'
import ru from './ru'

export type Lang = 'tr' | 'ka' | 'ru' | 'en'

export const langs: { code: Lang; label: string; flag: string }[] = [
  { code: 'ka', label: 'ქართული', flag: 'KA' },
  { code: 'tr', label: 'Türkçe', flag: 'TR' },
  { code: 'ru', label: 'Русский', flag: 'RU' },
  { code: 'en', label: 'English', flag: 'EN' },
]

export const dictionaries: Record<Lang, LangDict> = { en, tr, ka, ru }

export function detectLang(): Lang {
  if (typeof window === 'undefined') return 'tr'
  const saved = localStorage.getItem('lang') as Lang | null
  if (saved && saved in dictionaries) return saved
  const browser = navigator.language.slice(0, 2).toLowerCase()
  if (browser === 'ka') return 'ka'
  if (browser === 'tr') return 'tr'
  if (browser === 'ru') return 'ru'
  return 'en'
}

export function saveLang(lang: Lang) {
  localStorage.setItem('lang', lang)
}

export type { LangDict }
