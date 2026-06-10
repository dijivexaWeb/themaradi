'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
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

export function LangProvider({ children, serverLang = 'tr' }: { children: ReactNode; serverLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(serverLang)

  useEffect(() => {
    const clientLang = detectLang()
    if (clientLang !== serverLang) {
      const timer = setTimeout(() => {
        setLangState(clientLang)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [serverLang])

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
