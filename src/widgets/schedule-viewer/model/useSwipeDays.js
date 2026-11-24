import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

const AXIS_LOCK_DISTANCE = 10
const MAX_PULL = 92
const PULL_DAMPING = 0.4
const PULL_TO_REFRESH = 56
const PULL_HOLD = 48
const EDGE_RESISTANCE = 0.22

// Жесты области расписания: свайп влево/вправо между «сегодня» и «завтра»
// и потянуть вниз для обновления. Работает и пальцем, и мышью
export function useSwipeDays({ hasBothDays, activeDay, onChangeDay, refreshing, onRefresh }) {
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [pullY, setPullY] = useState(0)
  const scrollRef = useRef(null)
  const startRef = useRef(null)
  const axisRef = useRef(null)
  const dragXRef = useRef(0)
  const pullYRef = useRef(0)
  const scrollCleanupRef = useRef(null)
  // Свежие значения для нативного touchmove-обработчика, который вешается один раз
  const latestRef = useRef({ hasBothDays, activeDay, onChangeDay, refreshing, onRefresh })

  useLayoutEffect(() => {
    latestRef.current = { hasBothDays, activeDay, onChangeDay, refreshing, onRefresh }
  })

  useEffect(() => {
    if (!refreshing) {
      pullYRef.current = 0
      setPullY(0)
    }
  }, [refreshing])

  // event передаётся только для touch: там нужно отменить прокрутку страницы
  const move = useCallback((clientX, clientY, event) => {
    if (!startRef.current) return
    const { hasBothDays, activeDay, refreshing } = latestRef.current
    const dx = clientX - startRef.current.x
    const dy = clientY - startRef.current.y

    if (!axisRef.current) {
      if (Math.abs(dx) + Math.abs(dy) < AXIS_LOCK_DISTANCE) return
      axisRef.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      if (axisRef.current === 'y') setDragging(false)
    }

    if (axisRef.current === 'y') {
      const node = scrollRef.current
      if (node && node.scrollTop <= 0 && dy > 0 && !refreshing) {
        event?.preventDefault()
        const damped = Math.min(MAX_PULL, dy * PULL_DAMPING)
        pullYRef.current = damped
        setPullY(damped)
      }
      return
    }

    if (!hasBothDays) return
    event?.preventDefault()
    let next = dx
    // Дальше крайнего дня тянется с сопротивлением
    if (activeDay === 'today' && next > 0) next *= EDGE_RESISTANCE
    if (activeDay === 'tomorrow' && next < 0) next *= EDGE_RESISTANCE
    dragXRef.current = next
    setDragX(next)
  }, [])

  // touchmove вешаем вручную с passive: false — иначе preventDefault не сработает
  const attachScrollNode = useCallback((node) => {
    if (scrollCleanupRef.current) {
      scrollCleanupRef.current()
      scrollCleanupRef.current = null
    }
    scrollRef.current = node
    if (!node) return

    const onTouchMove = (event) => move(event.touches[0].clientX, event.touches[0].clientY, event)
    node.addEventListener('touchmove', onTouchMove, { passive: false })
    scrollCleanupRef.current = () => node.removeEventListener('touchmove', onTouchMove)
  }, [move])

  const begin = (clientX, clientY) => {
    startRef.current = { x: clientX, y: clientY }
    axisRef.current = null
    dragXRef.current = 0
    pullYRef.current = 0
    setDragging(latestRef.current.hasBothDays)
  }

  const end = () => {
    if (!startRef.current) return
    const { hasBothDays, activeDay, onChangeDay, refreshing, onRefresh } = latestRef.current
    const dx = dragXRef.current

    if (hasBothDays) {
      const width = scrollRef.current?.clientWidth || 1
      const threshold = Math.min(72, width * 0.18)
      if (dx < -threshold && activeDay === 'today') onChangeDay('tomorrow')
      if (dx > threshold && activeDay === 'tomorrow') onChangeDay('today')
    }

    if (pullYRef.current >= PULL_TO_REFRESH && !refreshing) {
      // Держим индикатор, пока идёт обновление; сбросится, когда refreshing станет false
      pullYRef.current = PULL_HOLD
      setPullY(PULL_HOLD)
      onRefresh()
    } else {
      pullYRef.current = 0
      setPullY(0)
    }

    startRef.current = null
    axisRef.current = null
    dragXRef.current = 0
    setDragX(0)
    setDragging(false)
  }

  return {
    dragX,
    dragging,
    pullY,
    resetDragX: () => setDragX(0),
    scrollRef: attachScrollNode,
    handlers: {
      onMouseDown: (event) => begin(event.clientX, event.clientY),
      onMouseMove: (event) => move(event.clientX, event.clientY),
      onMouseUp: end,
      onMouseLeave: end,
      onTouchStart: (event) => begin(event.touches[0].clientX, event.touches[0].clientY),
      onTouchEnd: end,
    },
  }
}
