import { STORAGE_KEYS } from '@/shared/config'
import { storage } from '@/shared/lib/storage'
import { normalizeGroup } from '../lib/normalizeGroup'

export const getSavedGroup = () => normalizeGroup(storage.get(STORAGE_KEYS.savedGroup) || '')
export const saveGroup = (group) => storage.set(STORAGE_KEYS.savedGroup, group)
export const clearSavedGroup = () => storage.remove(STORAGE_KEYS.savedGroup)
