// Сервер отдаёт день строкой-«питоновским» списком: [[время...], [предметы...], [аудитории...], дата].
// Первый элемент каждого списка — заголовок столбца
export function parseSchedule(dataString) {
  try {
    const clean = typeof dataString === 'string' ? dataString.replace(/'/g, '"') : dataString
    const parsed = typeof clean === 'string' ? JSON.parse(clean) : clean

    if (!Array.isArray(parsed) || parsed.length < 4) return []

    const timeValues = (parsed[0] || []).slice(1)
    const subjectValues = (parsed[1] || []).slice(1)
    const roomValues = (parsed[2] || []).slice(1)
    const date = parsed[3] || ''

    const schedule = []
    const maxLength = Math.min(timeValues.length, subjectValues.length, roomValues.length)

    for (let i = 0; i < maxLength; i++) {
      const subject = subjectValues[i] || ''
      const room = roomValues[i] || ''
      const time = timeValues[i] || ''

      if (!time) continue
      if (subject || room) {
        schedule.push({
          time,
          subject: subject || '—',
          room: room || '—',
          date,
          originalIndex: i,
        })
      }
    }

    return schedule
  } catch (error) {
    console.error('Ошибка парсинга:', error, dataString)
    return []
  }
}
