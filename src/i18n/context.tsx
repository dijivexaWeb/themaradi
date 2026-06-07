'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { dictionaries, detectLang, saveLang, type Lang, type LangDict } from './index'

interface LangContext {
  lang: Lang
  t: LangDict
  setLang: (l: Lang) => void
}

const Ctx = createContext<LangContext>({
  lang: 'ka',
  t: dictionaries.ka,
  setLang: () => {},
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectLang())

  function setLang(l: Lang) {
    setLangState(l)
    saveLang(l)
  }

  return (
    <Ctx.Provider value={{ lang, t: dictionaries[lang], setLang }}>
      {children}
    </Ctx.Provider>
  )
}

export function useLang() {
  return useContext(Ctx)
}
