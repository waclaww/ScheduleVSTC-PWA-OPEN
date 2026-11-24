import { I18nProvider } from './I18nProvider'
import { ThemeProvider } from './ThemeProvider'

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <I18nProvider>{children}</I18nProvider>
    </ThemeProvider>
  )
}
