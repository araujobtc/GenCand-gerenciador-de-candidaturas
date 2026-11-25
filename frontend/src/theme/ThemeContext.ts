import { createContext } from 'react'

export type ThemePreference = 'light' | 'dark' | 'auto'

export interface ThemeContextValue {
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
}

export const THEME_STORAGE_KEY = 'theme-preference'
export const ThemeContext = createContext<ThemeContextValue | null>(null)
