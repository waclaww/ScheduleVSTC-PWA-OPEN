import { useSyncExternalStore } from 'react'

// Минимальное глобальное хранилище: состояние живёт вне компонентов
// и не теряется при переходах между страницами
export function createStore(initialState) {
  let state = initialState
  const listeners = new Set()

  return {
    get: () => state,
    set(patch) {
      const next = typeof patch === 'function' ? patch(state) : patch
      state = { ...state, ...next }
      listeners.forEach((listener) => listener())
    },
    reset() {
      state = initialState
      listeners.forEach((listener) => listener())
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export function useStore(store) {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
