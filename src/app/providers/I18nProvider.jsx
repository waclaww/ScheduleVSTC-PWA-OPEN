import { useCallback, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '@/shared/config'
import { I18nContext, resolveLocale, translate } from '@/shared/i18n'
import { storage } from '@/shared/lib/storage'

export function I18nProvider({ children }) {
  const [preference, setPreferenceState] = useState(() => storage.get(STORAGE_KEYS.lang) || 'system')
  const locale = resolveLocale(preference)

  const setPreference = useCallback((value) => {
    setPreferenceState(value)
    storage.set(STORAGE_KEYS.lang, value)
  }, [])

  // Язык документа, название и манифест — то же делает инлайн-скрипт в index.html при запуске.
  // Название при установке: iOS берёт title и apple-mobile-web-app-title, Chrome — манифест
  useEffect(() => {
    document.documentElement.lang = locale
    const appName = translate(locale, 'appName')
    document.title = appName
    document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', appName)
    document
      .querySelector('link[rel="manifest"]')
      ?.setAttribute('href', locale === 'ru' ? '/manifest.webmanifest' : `/manifest-${locale}.webmanifest`)
  }, [locale])

  const value = useMemo(
    () => ({
      locale,
      preference,
      setPreference,
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale, preference, setPreference],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
