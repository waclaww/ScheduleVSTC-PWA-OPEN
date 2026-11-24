import { clearSavedGroup } from '@/entities/group'
import { resetSchedule } from '@/entities/schedule'

// Забыть текущую группу и вернуться к вводу
export function changeGroup() {
  clearSavedGroup()
  resetSchedule()
}
