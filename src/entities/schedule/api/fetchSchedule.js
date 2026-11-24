import { apiClient } from '@/shared/api'
import { parseSchedule } from '../lib/parseSchedule'

// Расписание группы на сегодня и завтра: { today: Lesson[], tomorrow: Lesson[] }
export async function fetchSchedule(groupName) {
  const response = await apiClient.post('/vstechnical_group/', { group_name: groupName })

  if (!response.data) throw new Error('empty response')

  const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data
  if (!data.today || !data.tomorrow) throw new Error('bad structure')

  return {
    today: parseSchedule(data.today),
    tomorrow: parseSchedule(data.tomorrow),
  }
}
