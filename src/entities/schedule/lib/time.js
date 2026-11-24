export function splitTime(raw) {
  const [start = '', end = ''] = String(raw || '')
    .split(/[–-]/)
    .map((part) => part.trim().replace(/^(\d{1,2})\.(\d{2})$/, '$1:$2'))
  return { start, end }
}

export function toMinutes(value) {
  const match = String(value || '').match(/(\d{1,2})[:.](\d{2})/)
  return match ? Number(match[1]) * 60 + Number(match[2]) : null
}
