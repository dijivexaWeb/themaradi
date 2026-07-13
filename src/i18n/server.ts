import { cookies, headers } from 'next/headers'
import { dictionaries, type Lang, type LangDict } from './index'

// Öncelik: proxy.ts'in /xx/... önekli isteklerde eklediği x-tm-locale request
// header'ı (bu isteğin GERÇEK URL'i) > tm_lang cookie'si (öneksiz isteklerde
// dönen ziyaretçinin son tercihi) > varsayılan 'tr'.
export async function getTranslation(): Promise<{ lang: Lang; t: LangDict }> {
  const headerStore = await headers()
  const headerLang = headerStore.get('x-tm-locale') as Lang | null
  if (headerLang && dictionaries[headerLang]) {
    return { lang: headerLang, t: dictionaries[headerLang] }
  }

  const cookieStore = await cookies()
  const lang = (cookieStore.get('tm_lang')?.value as Lang) || 'tr'
  return {
    lang,
    t: dictionaries[lang] || dictionaries.tr,
  }
}
