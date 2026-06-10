import { cookies } from 'next/headers'
import { dictionaries, type Lang, type LangDict } from './index'

export async function getTranslation(): Promise<{ lang: Lang; t: LangDict }> {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('tm_lang')?.value as Lang) || 'tr'
  return {
    lang,
    t: dictionaries[lang] || dictionaries.tr,
  }
}
