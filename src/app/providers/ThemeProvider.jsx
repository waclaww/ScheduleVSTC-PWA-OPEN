import { useEffect } from 'react'
import { useTheme } from '@heroui/react'
import { HEADER_COLOR, HEADER_COLOR_DARK } from '@/shared/config'
import { ThemeContext } from '@/shared/lib/theme'

export function ThemeProvider({ children }) {
  const value = useTheme('system')
  const { resolvedTheme } = value

  // Строка состояния в цвет шапки
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta && resolvedTheme) {
      meta.setAttribute('content', resolvedTheme === 'dark' ? HEADER_COLOR_DARK : HEADER_COLOR)
    }
  }, [resolvedTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
