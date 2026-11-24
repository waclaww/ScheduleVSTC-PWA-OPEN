import { getSavedGroup, isValidGroup, normalizeGroup, saveGroup } from '@/entities/group'
import { loadSchedule, selectGroup, setGroup, setScheduleError } from '@/entities/schedule'

export async function submitGroup(value) {
  const group = normalizeGroup(value)
  setGroup(group)

  if (!isValidGroup(group)) {
    setScheduleError('groupMinLength')
    return
  }

  saveGroup(group)
  await loadSchedule(group)
}

let restored = false

// При запуске сразу открываем последнюю выбранную группу
export function restoreSavedGroup() {
  if (restored) return
  restored = true
  const group = getSavedGroup()
  if (!group) return
  selectGroup(group)
  loadSchedule(group)
}
