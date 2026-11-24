import { createContext } from 'react'

// Значение задаёт провайдер в app/providers: useTheme из HeroUI хранит состояние
// в самом хуке, поэтому вызывается один раз и раздаётся через контекст
export const ThemeContext = createContext(null)
