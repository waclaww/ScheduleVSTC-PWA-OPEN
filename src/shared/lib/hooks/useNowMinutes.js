import { useEffect, useState } from 'react'

const currentMinutes = () => {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

// Текущее время в минутах от полуночи, обновляется в начале каждой минуты
export function useNowMinutes() {
  const [nowMinutes, setNowMinutes] = useState(currentMinutes)

  useEffect(() => {
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000
    let interval
    const timeout = setTimeout(() => {
      setNowMinutes(currentMinutes())
      interval = setInterval(() => setNowMinutes(currentMinutes()), 60000)
    }, msToNextMinute)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])

  return nowMinutes
}
