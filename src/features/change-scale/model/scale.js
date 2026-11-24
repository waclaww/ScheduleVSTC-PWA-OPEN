import { STORAGE_KEYS } from '@/shared/config'
import { storage } from '@/shared/lib/storage'

export const SCALES = ['sm', 'md', 'lg']

export function getSavedScale() {
  const saved = storage.get(STORAGE_KEYS.scale)
  return SCALES.includes(saved) ? saved : 'md'
}

// Всё в интерфейсе задано в rem — масштаб меняет font-size у <html> (см. app/styles/index.css)
export function applyScale(value) {
  storage.set(STORAGE_KEYS.scale, value)
  document.documentElement.dataset.scale = value
}
