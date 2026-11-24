import { dictionaries } from './dictionaries'

export const LOCALES = ['ru', 'be', 'en']

export function detectSystemLocale() {
  const list = typeof navigator === 'undefined'
    ? []
    : (navigator.languages?.length ? navigator.languages : [navigator.language])

  for (const item of list) {
    const code = String(item || '').toLowerCase()
    if (code.startsWith('be')) return 'be'
    if (code.startsWith('ru')) return 'ru'
    if (code.startsWith('en')) return 'en'
  }
  return 'ru'
}

export function resolveLocale(preference) {
  if (LOCALES.includes(preference)) return preference
  return detectSystemLocale()
}

export function translate(locale, key, vars = {}) {
  const dict = dictionaries[locale] || dictionaries.ru
  let text = dict[key] || dictionaries.ru[key] || key
  for (const [name, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${name}}`, String(value ?? ''))
  }
  return text
}

export const intlLocale = (locale) => (locale === 'be' ? 'be-BY' : locale === 'en' ? 'en-GB' : 'ru-RU')
