import { Button, Spinner, Tabs } from '@heroui/react'
import { GroupName } from '@/entities/group'
import {
  formatScheduleDate,
  formatUpdatedTime,
  LessonList,
  mergeLessonsIntoPairs,
  setActiveDay,
  useSchedule,
} from '@/entities/schedule'
import { changeGroup } from '@/features/change-group'
import { refreshSchedule } from '@/features/refresh-schedule'
import { useI18n } from '@/shared/i18n'
import { useNowMinutes } from '@/shared/lib/hooks'
import { useSwipeDays } from '../model/useSwipeDays'

export function ScheduleViewer() {
  const { t, locale } = useI18n()
  const { group, data, activeDay, loading, refreshing, lastUpdated } = useSchedule()
  const nowMinutes = useNowMinutes()

  const hasBothDays = data.today.length > 0 && data.tomorrow.length > 0
  const currentSchedule = data[activeDay] || []
  const currentDateLabel = formatScheduleDate(currentSchedule[0]?.date || '')

  const { dragX, dragging, pullY, resetDragX, scrollRef, handlers } = useSwipeDays({
    hasBothDays,
    activeDay,
    onChangeDay: setActiveDay,
    refreshing,
    onRefresh: refreshSchedule,
  })

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (currentSchedule.length === 0) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-3 pt-16 text-center">
        <p className="text-base text-muted">{t('notFound')}</p>
        <Button variant="tertiary" onPress={changeGroup}>{t('chooseAnother')}</Button>
      </div>
    )
  }

  const todayMerged = mergeLessonsIntoPairs(data.today)
  const tomorrowMerged = mergeLessonsIntoPairs(data.tomorrow)

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-col gap-1 border-b border-separator pb-3">
        <div className="flex w-full shrink-0 items-center justify-between gap-2">
          <span className="min-w-0 text-lg font-semibold leading-tight">
            <GroupName name={group} />
          </span>
          {hasBothDays && (
            <Tabs
              className="ml-auto shrink-0"
              selectedKey={activeDay}
              onSelectionChange={(key) => {
                setActiveDay(String(key))
                resetDragX()
              }}
            >
              <Tabs.ListContainer>
                <Tabs.List aria-label={t('day')} className="grid grid-cols-2 p-0.5">
                  <Tabs.Tab className="h-7 px-2.5 text-sm" id="today">
                    {t('today')}
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab className="h-7 px-2.5 text-sm" id="tomorrow">
                    {t('tomorrow')}
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
          )}
        </div>
        {(currentDateLabel || lastUpdated) ? (
          // Точка-разделитель стоит перед каждым элементом, а обёртка сдвинута влево
          // и обрезает её — так она не видна ни в начале, ни после переноса строки
          <div className="shrink-0 overflow-hidden text-[0.9375rem] leading-snug text-foreground/70">
            <p className="-ml-4 flex flex-wrap">
              {currentDateLabel ? <span className="dot-sep">{currentDateLabel}</span> : null}
              {lastUpdated ? (
                <span className="dot-sep whitespace-nowrap">{`${t('updatedAt')} ${formatUpdatedTime(lastUpdated, locale)}`}</span>
              ) : null}
            </p>
          </div>
        ) : null}
      </div>

      <div className="relative min-h-0 w-full flex-1">
        {(pullY > 12 || refreshing) && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-1">
            <Spinner size="sm" />
          </div>
        )}
        <div
          ref={scrollRef}
          className="h-full min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y"
          {...handlers}
        >
          <div
            className="will-change-transform"
            style={{
              transform: `translate3d(0, ${pullY}px, 0)`,
              transition: pullY === 0 || refreshing ? 'transform 220ms ease-out' : 'none',
            }}
          >
            {hasBothDays ? (
              // -mx-2 + px-2: зазор между днями при свайпе, не отнимая ширину у расписания
              <div
                className="-mx-2 flex w-[calc(200%+2rem)] will-change-transform"
                style={{
                  transform: `translate3d(calc(${activeDay === 'today' ? 0 : -50}% + ${dragX}px), 0, 0)`,
                  transition: dragging ? 'none' : 'transform 380ms cubic-bezier(0.32, 0.72, 0, 1)',
                }}
              >
                <div className="w-1/2 px-2">
                  <LessonList isToday items={todayMerged} nowMinutes={nowMinutes} />
                </div>
                <div className="w-1/2 px-2">
                  <LessonList items={tomorrowMerged} isToday={false} nowMinutes={nowMinutes} />
                </div>
              </div>
            ) : (
              <LessonList
                isToday={activeDay === 'today'}
                items={activeDay === 'today' ? todayMerged : tomorrowMerged}
                nowMinutes={nowMinutes}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
