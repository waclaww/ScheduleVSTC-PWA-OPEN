import { intlLocale } from '@/shared/i18n'

// «на 24 ноября 2026 года (вторник)» → «Вторник, 24 ноября»
export function formatScheduleDate(raw) {
  if (!raw || typeof raw !== 'string') return ''
  const text = raw.replace(/\s+/g, ' ').trim()
  const weekdayRaw = text.match(/\(([^)]+)\)/)?.[1]?.trim() || ''
  const weekday = weekdayRaw
    ? weekdayRaw.charAt(0).toLocaleUpperCase('ru-RU') + weekdayRaw.slice(1).toLocaleLowerCase('ru-RU')
    : ''
  const rest = text
    .replace(/^на\s+/i, '')
    .replace(/\s+года/gi, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\b\d{4}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (weekday && rest) return `${weekday}, ${rest}`
  return weekday || rest
}

export function formatUpdatedTime(date, locale) {
  if (!date) return ''
  return new Intl.DateTimeFormat(intlLocale(locale), {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}
