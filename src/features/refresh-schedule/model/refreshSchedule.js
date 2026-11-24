import { getSchedule, loadSchedule } from '@/entities/schedule'

export function refreshSchedule() {
  const { group, refreshing } = getSchedule()
  if (!group || refreshing) return
  loadSchedule(group, { silent: true })
}
