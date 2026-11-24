import { useRef } from 'react'

// Обработчик, который вызывает onTrigger после `count` быстрых нажатий подряд
export function useMultiTap(count, onTrigger, interval = 600) {
  const tapsRef = useRef({ count: 0, last: 0 })

  return () => {
    const now = Date.now()
    const taps = tapsRef.current
    taps.count = now - taps.last < interval ? taps.count + 1 : 1
    taps.last = now
    if (taps.count < count) return
    taps.count = 0
    onTrigger()
  }
}
