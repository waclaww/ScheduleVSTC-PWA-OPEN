import { useContext } from 'react'
import { ThemeContext } from './context'

// { theme, resolvedTheme, setTheme }
export function useAppTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useAppTheme must be used inside ThemeProvider')
  return value
}
