import { splitTime, toMinutes } from '../lib/time'

// Список занятий дня; текущее (если isToday) подсвечивается
export function LessonList({ items, isToday, nowMinutes }) {
  return (
    <ol className="flex flex-col gap-5 pb-4">
      {items.map((item, index) => {
        const { start, end } = splitTime(item.time)
        const from = toMinutes(start)
        const to = toMinutes(end)
        const isNow = isToday && from !== null && to !== null && nowMinutes >= from && nowMinutes < to

        return (
          <li key={`${item.time}-${item.subject}-${index}`} className="flex gap-3">
            <div className={`w-12 shrink-0 pt-0.5 tabular-nums ${isNow ? 'text-accent' : ''}`}>
              <div className="text-base font-semibold leading-tight">{start}</div>
              {end && <div className={`text-xs leading-tight ${isNow ? '' : 'text-foreground/70'}`}>{end}</div>}
            </div>
            <div className="min-w-0 flex-1 pt-0.5 text-base font-medium leading-snug break-words hyphens-auto">{item.subject}</div>
            {item.room && item.room !== '—' && (
              <div className="shrink-0 pt-0.5 text-right text-base font-medium leading-snug text-foreground/75 tabular-nums">{item.room}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
