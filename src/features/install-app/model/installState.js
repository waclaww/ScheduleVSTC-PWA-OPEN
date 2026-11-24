import { STORAGE_KEYS } from '@/shared/config'
import { inTelegram, isStandalonePwa, platform } from '@/shared/lib/platform'
import { storage } from '@/shared/lib/storage'
import { createStore, useStore } from '@/shared/lib/store'
import { isInstalledHere, promptInstall, resetInstallFlags } from './installPrompt'

const store = createStore({
  isInstalled: isStandalonePwa() || isInstalledHere(),
  bannerHidden: storage.get(STORAGE_KEYS.installBannerHidden) === '1',
})

if (typeof window !== 'undefined') {
  window.addEventListener('appinstalled', () => store.set({ isInstalled: true }))
}

export const useInstallState = () => useStore(store)

// Плашка: в Telegram и в браузере телефона (platform = null на компьютере)
export const canShowInstallBanner = ({ isInstalled, bannerHidden }) =>
  !isInstalled && !bannerHidden && (inTelegram || platform !== null)

export function hideInstallBanner() {
  store.set({ bannerHidden: true })
  storage.set(STORAGE_KEYS.installBannerHidden, '1')
}

export async function installApp() {
  if (await promptInstall()) store.set({ isInstalled: true })
}

// Вызывается 7 быстрыми нажатиями на заголовок «Настройки»
export function resetInstallState() {
  resetInstallFlags()
  store.set({ bannerHidden: false, isInstalled: isStandalonePwa() })
}
