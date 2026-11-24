// Определение окружения: установленное PWA, Telegram Mini App, платформа и браузер

const isBrowser = typeof window !== 'undefined'

export const isStandalonePwa = () => {
  if (!isBrowser) return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true
  )
}

const TG_KEY = 'inTelegram'

function detectTelegram() {
  try {
    // Telegram передаёт данные Mini App в hash только при первом открытии — запоминаем на сессию
    if (/tgWebApp(Data|Platform|Version)/.test(window.location.hash)) {
      sessionStorage.setItem(TG_KEY, '1')
    }
    if (sessionStorage.getItem(TG_KEY) === '1') return true
  } catch {
    // sessionStorage может быть недоступен
  }
  return Boolean(window.TelegramWebviewProxy || window.Telegram?.WebApp?.initData)
}

export const inTelegram = isBrowser && detectTelegram()

const TG_PLATFORM_KEY = 'tgPlatform'

// 'ios' | 'android' | null (компьютер или неизвестно)
function detectPlatform() {
  let tgPlatform = ''
  try {
    tgPlatform = new URLSearchParams(window.location.hash.slice(1)).get('tgWebAppPlatform') || ''
    if (tgPlatform) sessionStorage.setItem(TG_PLATFORM_KEY, tgPlatform)
    else tgPlatform = sessionStorage.getItem(TG_PLATFORM_KEY) || ''
  } catch {
    // sessionStorage может быть недоступен
  }
  if (tgPlatform === 'ios') return 'ios'
  if (tgPlatform.startsWith('android')) return 'android'

  const ua = navigator.userAgent || ''
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/i.test(ua) || navigator.userAgentData?.platform === 'Android') return 'android'
  return null
}

export const platform = isBrowser ? detectPlatform() : null

// Открыт ли сайт в Safari на iPhone: только из него можно добавить сайт на экран «Домой»
// (встроенный браузер Telegram на iOS по user agent от Safari не отличить)
export const iosSafari =
  isBrowser &&
  platform === 'ios' &&
  !inTelegram &&
  /Safari/.test(navigator.userAgent || '') &&
  !/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser|GSA|Telegram/.test(navigator.userAgent || '')

// 'new' — iOS 26+ («Поделиться» спрятано в меню «⋯»), 'old' — iOS 18 и раньше, null — неизвестно.
// С iOS 26 версия системы в user agent заморожена на 18_6, поэтому смотрим на Version/ от Safari
function detectIosGeneration() {
  const ua = navigator.userAgent || ''
  const safari = ua.match(/Version\/(\d+)/)
  if (safari) return Number(safari[1]) >= 26 ? 'new' : 'old'
  const os = ua.match(/OS (\d+)_(\d+)/)
  if (!os) return null
  const [major, minor] = [Number(os[1]), Number(os[2])]
  return major < 18 || (major === 18 && minor < 6) ? 'old' : null
}

export const iosGeneration = isBrowser && platform === 'ios' ? detectIosGeneration() : null

// Встроенный браузер Telegram (куда по умолчанию ведёт openLink): это WebView,
// в нём нет beforeinstallprompt и пункта «Добавить на гл. экран»
export const inTelegramBrowser = isBrowser && !inTelegram && /Telegram/i.test(navigator.userAgent || '')

export const appUrl = () => (inTelegramBrowser ? window.location.href : `${window.location.origin}/`)

export function openInBrowser() {
  const url = appUrl()
  // Без try_browser Telegram на Android открывает ссылку во встроенном браузере, где установка невозможна
  const options = platform === 'android' ? { try_browser: 'chrome' } : {}
  if (window.Telegram?.WebApp?.openLink) {
    window.Telegram.WebApp.openLink(url, options)
  } else if (window.TelegramWebviewProxy?.postEvent) {
    window.TelegramWebviewProxy.postEvent('web_app_open_link', JSON.stringify({ url, ...options }))
  } else if (window.parent !== window) {
    // Telegram Web / Desktop: Mini App открыт во фрейме
    window.parent.postMessage(JSON.stringify({ eventType: 'web_app_open_link', eventData: { url, ...options } }), '*')
  } else {
    window.open(url, '_blank', 'noopener')
  }
}

// Внутри Telegram ссылку на t.me открывает сам Telegram, иначе — браузер или приложение Telegram
export function openTelegramLink(url) {
  const webApp = window.Telegram?.WebApp
  if (webApp?.openTelegramLink) webApp.openTelegramLink(url)
  else window.open(url, '_blank', 'noopener')
}
