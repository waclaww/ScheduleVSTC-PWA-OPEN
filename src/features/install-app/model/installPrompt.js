// Системный промпт установки (Chrome на Android) и пометка «приложение уже установлено»
import { STORAGE_KEYS } from '@/shared/config'
import { storage } from '@/shared/lib/storage'
import { isStandalonePwa } from '@/shared/lib/platform'

// На Android установленное приложение делит хранилище с Chrome: помечаем установку,
// чтобы в браузере не предлагать установить приложение повторно
const markInstalledHere = () => storage.set(STORAGE_KEYS.installedHere, '1')
export const isInstalledHere = () => storage.get(STORAGE_KEYS.installedHere) === '1'

if (typeof window !== 'undefined' && isStandalonePwa()) markInstalledHere()

let deferredPrompt = null
const listeners = new Set()
const emit = () => listeners.forEach((listener) => listener(Boolean(deferredPrompt)))

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event
    emit()
  })
  window.addEventListener('appinstalled', () => {
    markInstalledHere()
    deferredPrompt = null
    emit()
  })
}

export const canPromptInstall = () => Boolean(deferredPrompt)

export function onInstallAvailabilityChange(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export async function promptInstall() {
  if (!deferredPrompt) return false
  const prompt = deferredPrompt
  deferredPrompt = null
  emit()
  await prompt.prompt()
  const { outcome } = await prompt.userChoice
  return outcome === 'accepted'
}

// Отладка: сброс флагов, чтобы заново проверить исчезновение плашки
export function resetInstallFlags() {
  storage.remove(STORAGE_KEYS.installedHere)
  storage.remove(STORAGE_KEYS.installBannerHidden)
}
