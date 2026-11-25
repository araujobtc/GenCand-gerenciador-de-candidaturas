import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { THEME_STORAGE_KEY, ThemeContext, type ThemePreference } from './ThemeContext'

function lerPreferencia(): ThemePreference {
  try {
    const valor = localStorage.getItem(THEME_STORAGE_KEY)
    return valor === 'dark' || valor === 'auto' ? valor : 'light'
  } catch {
    return 'light'
  }
}

function sistemaEscuro(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(lerPreferencia)

  useEffect(() => {
    const aplicar = () => {
      const escuro = preference === 'dark' || (preference === 'auto' && sistemaEscuro())
      document.documentElement.dataset.theme = escuro ? 'dark' : 'light'
    }
    aplicar()
    if (preference !== 'auto') return
    const consulta = window.matchMedia('(prefers-color-scheme: dark)')
    consulta.addEventListener('change', aplicar)
    return () => consulta.removeEventListener('change', aplicar)
  }, [preference])

  const setPreference = useCallback((nova: ThemePreference) => {
    setPreferenceState(nova)
    try { localStorage.setItem(THEME_STORAGE_KEY, nova) } catch { /* armazenamento indisponível */ }
  }, [])

  const value = useMemo(() => ({ preference, setPreference }), [preference, setPreference])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
