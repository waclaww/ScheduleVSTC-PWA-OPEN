// localStorage может быть недоступен (приватный режим, встроенные браузеры) — не падаем
export const storage = {
  get(key) {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value)
    } catch {
      // игнорируем
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch {
      // игнорируем
    }
  },
}
