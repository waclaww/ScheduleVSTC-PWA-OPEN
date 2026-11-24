export const isLunch = (subject) => String(subject || '').trim().toLowerCase() === 'обед'

// Два подряд одинаковых занятия в одной аудитории — это пара: склеиваем в одну строку
export function mergeLessonsIntoPairs(schedule) {
  const merged = []
  let i = 0

  while (i < schedule.length) {
    const current = schedule[i]

    if (isLunch(current.subject)) {
      merged.push({ ...current, type: 'lunch', pairCount: 1 })
      i++
      continue
    }

    const next = schedule[i + 1]
    if (
      next &&
      current.subject !== '—' &&
      next.subject !== '—' &&
      !isLunch(next.subject) &&
      current.subject === next.subject &&
      current.room === next.room
    ) {
      const startTime = current.time.split(/[–-]/)[0].trim()
      const endTime = next.time.split(/[–-]/)[1] || next.time.split(/[–-]/)[0]

      merged.push({
        time: `${startTime}–${endTime}`,
        subject: current.subject,
        room: current.room,
        date: current.date,
        type: 'pair',
        pairCount: 2,
        originalIndex: current.originalIndex,
      })
      i += 2
      continue
    }

    if (current.subject !== '—') {
      merged.push({ ...current, type: 'single', pairCount: 1 })
    }
    i++
  }

  return merged
}
