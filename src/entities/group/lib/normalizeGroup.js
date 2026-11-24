// Группы в колледже вида БУКВЫ-ЧИСЛО: «ВР31», «вр 31», «ВР–31» → «ВР-31»
export function normalizeGroup(value) {
  const trimmed = String(value || '').trim().toUpperCase()
  const match = trimmed.match(/^([А-ЯЁA-Z]+)[\s\-–—_]*(\d.*)$/u)
  return match ? `${match[1]}-${match[2]}` : trimmed
}

export const isValidGroup = (value) => Boolean(value) && value.trim().length >= 2
