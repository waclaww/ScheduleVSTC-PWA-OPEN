import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import {
  Alert,
  Button,
  Card,
  Header,
  Input,
  Label,
  Spinner,
  Surface,
  Tabs,
  useTheme,
} from '@heroui/react'
import { ArrowDownToSquare, ArrowLeft, ArrowRotateRight, ChevronRight, DisplayPulse, Gear, Moon, PaperPlane, Pencil, Sun, Xmark } from '@gravity-ui/icons'
import { LANG_KEY, resolveLocale, t } from './i18n'

const SCALE_KEY = 'app-scale'
const SCALES = ['sm', 'md', 'lg']
// Цвет шапки (и строки состояния) — тёмный оттенок зелёного из логотипа
const HEADER_COLOR = '#2f6f56'
const HEADER_COLOR_DARK = '#1d4a3a'
const SUPPORT_HANDLE = '@studx_support'
const SUPPORT_URL = 'https://t.me/studx_support'

// Внутри Telegram ссылку открывает сам Telegram, иначе — браузер или приложение Telegram
// Группы в колледже вида БУКВЫ-ЧИСЛО: «ВР31», «вр 31», «ВР–31» → «ВР-31»
function normalizeGroup(value) {
  const trimmed = value.trim().toUpperCase()
  const match = trimmed.match(/^([А-ЯЁA-Z]+)[\s\-–—_]*(\d.*)$/u)
  return match ? `${match[1]}-${match[2]}` : trimmed
}

function openSupport() {
  const webApp = window.Telegram?.WebApp
  if (webApp?.openTelegramLink) webApp.openTelegramLink(SUPPORT_URL)
  else window.open(SUPPORT_URL, '_blank', 'noopener')
}
import InstallGuide from './InstallGuide'
import {
  canPromptInstall,
  inTelegram,
  isInstalledHere,
  isStandalonePwa,
  platform,
  promptInstall,
  resetInstallFlags,
} from './install'

function formatScheduleDate(raw) {
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

function formatUpdatedTime(date, locale) {
  if (!date) return ''
  const intlLocale = locale === 'be' ? 'be-BY' : locale === 'en' ? 'en-GB' : 'ru-RU'
  return new Intl.DateTimeFormat(intlLocale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function splitTime(raw) {
  const [start = '', end = ''] = String(raw || '')
    .split(/[–-]/)
    .map((part) => part.trim().replace(/^(\d{1,2})\.(\d{2})$/, '$1:$2'))
  return { start, end }
}

function isLunch(subject) {
  return String(subject || '').trim().toLowerCase() === 'обед'
}

function toMinutes(value) {
  const match = String(value || '').match(/(\d{1,2})[:.](\d{2})/)
  return match ? Number(match[1]) * 60 + Number(match[2]) : null
}

function App() {
  const { theme, setTheme, resolvedTheme } = useTheme('system')
  const [view, setView] = useState('schedule')
  const [langPref, setLangPref] = useState(() => localStorage.getItem(LANG_KEY) || 'system')
  const locale = resolveLocale(langPref)
  const [scale, setScale] = useState(() => {
    const saved = localStorage.getItem(SCALE_KEY)
    return SCALES.includes(saved) ? saved : 'md'
  })
  const [isInstalled, setIsInstalled] = useState(() => isStandalonePwa() || isInstalledHere())
  const [installBannerHidden, setInstallBannerHidden] = useState(() => {
    try {
      return localStorage.getItem('installBannerHidden') === '1'
    } catch {
      return false
    }
  })

  const [group, setGroup] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState('')
  const [scheduleData, setScheduleData] = useState({ today: [], tomorrow: [] })
  const [activeDay, setActiveDay] = useState('today')
  const [isGroupSelected, setIsGroupSelected] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [pullY, setPullY] = useState(0)
  const [nowMinutes, setNowMinutes] = useState(() => new Date().getHours() * 60 + new Date().getMinutes())
  const trackRef = useRef(null)
  const scrollRef = useRef(null)
  const startRef = useRef(null)
  const axisRef = useRef(null)
  const dragXRef = useRef(0)
  const pullYRef = useRef(0)
  const groupRef = useRef(group)
  const refreshingRef = useRef(false)
  const activeDayRef = useRef(activeDay)
  const hasBothDaysRef = useRef(false)
  const scrollCleanupRef = useRef(null)

  useEffect(() => {
    activeDayRef.current = activeDay
  }, [activeDay])

  useEffect(() => {
    groupRef.current = group
  }, [group])

  useEffect(() => {
    refreshingRef.current = refreshing
    if (!refreshing) {
      pullYRef.current = 0
      setPullY(0)
    }
  }, [refreshing])

  useEffect(() => {
    document.documentElement.lang = locale
    // Название при установке: iOS берёт title и apple-mobile-web-app-title, Chrome — манифест
    const appName = t(locale, 'appName')
    document.title = appName
    document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', appName)
    document
      .querySelector('link[rel="manifest"]')
      ?.setAttribute('href', locale === 'ru' ? '/manifest.webmanifest' : `/manifest-${locale}.webmanifest`)
  }, [locale])

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta && resolvedTheme) {
      meta.setAttribute('content', resolvedTheme === 'dark' ? HEADER_COLOR_DARK : HEADER_COLOR)
    }
  }, [resolvedTheme])

  useEffect(() => {
    const onInstalled = () => setIsInstalled(true)
    window.addEventListener('appinstalled', onInstalled)
    return () => window.removeEventListener('appinstalled', onInstalled)
  }, [])

  useEffect(() => {
    const now = new Date()
    const msToNextMinute = (60 - now.getSeconds()) * 1000
    let interval
    const timeout = setTimeout(() => {
      setNowMinutes(new Date().getHours() * 60 + new Date().getMinutes())
      interval = setInterval(() => setNowMinutes(new Date().getHours() * 60 + new Date().getMinutes()), 60000)
    }, msToNextMinute)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const savedGroup = normalizeGroup(localStorage.getItem('savedGroup') || '')
    if (savedGroup) {
      setGroup(savedGroup)
      setIsGroupSelected(true)
      loadSchedule(savedGroup)
    }
  }, [])

  const titleTapsRef = useRef({ count: 0, last: 0 })

  const handleSettingsTitleTap = () => {
    const now = Date.now()
    const taps = titleTapsRef.current
    taps.count = now - taps.last < 600 ? taps.count + 1 : 1
    taps.last = now
    if (taps.count < 7) return
    taps.count = 0
    resetInstallFlags()
    setInstallBannerHidden(false)
    setIsInstalled(isStandalonePwa())
    window.alert('Install flags reset')
  }

  // Плашка: в Telegram и в браузере телефона (platform = null на компьютере)
  const showInstallBanner = !isInstalled && !installBannerHidden && (inTelegram || platform !== null)

  const handleInstallBanner = async () => {
    // Chrome на Android умеет ставить сразу — без инструкции
    if (!inTelegram && canPromptInstall()) {
      if (await promptInstall()) setIsInstalled(true)
      return
    }
    setView('install')
  }

  const dismissInstallBanner = () => {
    setInstallBannerHidden(true)
    try {
      localStorage.setItem('installBannerHidden', '1')
    } catch {
      // localStorage может быть недоступен
    }
  }

  const handleScale = (value) => {
    setScale(value)
    localStorage.setItem(SCALE_KEY, value)
    document.documentElement.dataset.scale = value
  }

  const handleLang = (value) => {
    setLangPref(value)
    localStorage.setItem(LANG_KEY, value)
  }

  const loadSchedule = async (groupName, options = {}) => {
    if (!groupName || groupName.trim().length < 2) {
      setError(t(locale, 'groupMinLength'))
      return
    }

    const silent = options.silent === true
    if (silent) setRefreshing(true)
    else setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/vstechnical_group/',
        { group_name: groupName },
        {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      )

      if (!response.data) {
        throw new Error(t(locale, 'emptyResponse'))
      }

      let parsedData = response.data
      if (typeof response.data === 'string') {
        parsedData = JSON.parse(response.data)
      }

      if (parsedData.today && parsedData.tomorrow) {
        const todaySchedule = parseScheduleData(parsedData.today)
        const tomorrowSchedule = parseScheduleData(parsedData.tomorrow)

        setScheduleData({
          today: todaySchedule,
          tomorrow: tomorrowSchedule,
        })

        if (todaySchedule.length > 0 || tomorrowSchedule.length > 0) {
          setIsGroupSelected(true)
          setLastUpdated(new Date())
          if (!silent) {
            if (todaySchedule.length > 0) setActiveDay('today')
            else setActiveDay('tomorrow')
          }
        } else {
          setError(t(locale, 'notFound'))
          setIsGroupSelected(false)
        }
      } else {
        throw new Error('bad structure')
      }
    } catch (err) {
      console.error('Ошибка:', err)
      setError(t(locale, 'notFound'))
      setIsGroupSelected(false)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const parseScheduleData = (dataString) => {
    try {
      let cleanString = dataString
      if (typeof dataString === 'string') {
        cleanString = dataString.replace(/'/g, '"')
      }

      const parsed = JSON.parse(cleanString)

      if (!Array.isArray(parsed) || parsed.length < 4) {
        return []
      }

      const timeSlots = parsed[0] || []
      const subjects = parsed[1] || []
      const rooms = parsed[2] || []
      const date = parsed[3] || ''

      const timeValues = timeSlots.slice(1)
      const subjectValues = subjects.slice(1)
      const roomValues = rooms.slice(1)

      const schedule = []
      const maxLength = Math.min(timeValues.length, subjectValues.length, roomValues.length)

      for (let i = 0; i < maxLength; i++) {
        const subject = subjectValues[i] || ''
        const room = roomValues[i] || ''
        const time = timeValues[i] || ''

        if (!time) continue

        if (subject || room) {
          schedule.push({
            time,
            subject: subject || '—',
            room: room || '—',
            date,
            originalIndex: i,
          })
        }
      }

      return schedule
    } catch (parseError) {
      console.error('Ошибка парсинга:', parseError, dataString)
      return []
    }
  }

  const mergeLessonsIntoPairs = (schedule) => {
    if (!schedule.length) return []

    const merged = []
    let i = 0

    while (i < schedule.length) {
      const current = schedule[i]

      if (isLunch(current.subject)) {
        merged.push({
          ...current,
          type: 'lunch',
          pairCount: 1,
        })
        i++
        continue
      }

      if (i + 1 < schedule.length) {
        const next = schedule[i + 1]

        if (
          current.subject !== '—' &&
          !isLunch(current.subject) &&
          next.subject !== '—' &&
          !isLunch(next.subject) &&
          current.subject === next.subject &&
          current.room === next.room
        ) {
          const startTime = current.time.split(/[–-]/)[0].trim()
          const endTime = next.time.split(/[–-]/)[1] || next.time.split(/[–-]/)[0]

          merged.push({
            time: `${startTime}–${endTime}`,
            subject: current.subject,
            room: current.room,
            date: current.date,
            type: 'pair',
            pairCount: 2,
            originalIndex: current.originalIndex,
          })

          i += 2
          continue
        }
      }

      if (current.subject !== '—') {
        merged.push({
          ...current,
          type: 'single',
          pairCount: 1,
        })
      }
      i++
    }

    return merged
  }

  const handleGroupChange = (e) => {
    setGroup(e.target.value.toUpperCase())
    if (error) setError('')
  }

  const handleGroupSubmit = async (e) => {
    e.preventDefault()
    const trimmedGroup = normalizeGroup(group)
    setGroup(trimmedGroup)

    if (!trimmedGroup || trimmedGroup.length < 2) {
      setError(t(locale, 'groupMinLength'))
      return
    }

    localStorage.setItem('savedGroup', trimmedGroup)
    await loadSchedule(trimmedGroup)
  }

  const handleChangeGroup = () => {
    setGroup('')
    setScheduleData({ today: [], tomorrow: [] })
    setError('')
    setIsGroupSelected(false)
    localStorage.removeItem('savedGroup')
    setLastUpdated(null)
    setView('schedule')
    setDragX(0)
    setDragging(false)
  }

  const hasBothDays = scheduleData.today.length > 0 && scheduleData.tomorrow.length > 0
  const todayMerged = mergeLessonsIntoPairs(scheduleData.today)
  const tomorrowMerged = mergeLessonsIntoPairs(scheduleData.tomorrow)
  const currentSchedule = scheduleData[activeDay] || []
  const currentDateLabel = formatScheduleDate((currentSchedule[0] && currentSchedule[0].date) || '')
  hasBothDaysRef.current = hasBothDays

  const attachScrollNode = useCallback((node) => {
    if (scrollCleanupRef.current) {
      scrollCleanupRef.current()
      scrollCleanupRef.current = null
    }
    scrollRef.current = node
    if (!node) return

    const onMove = (event) => {
      if (!startRef.current) return
      const point = event.touches ? event.touches[0] : event
      const dx = point.clientX - startRef.current.x
      const dy = point.clientY - startRef.current.y
      if (!axisRef.current) {
        if (Math.abs(dx) + Math.abs(dy) < 10) return
        axisRef.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        if (axisRef.current === 'y') setDragging(false)
      }
      if (axisRef.current === 'y') {
        const atTop = node.scrollTop <= 0
        if (atTop && dy > 0 && !refreshingRef.current) {
          event.preventDefault()
          const damped = Math.min(92, dy * 0.4)
          pullYRef.current = damped
          setPullY(damped)
        }
        return
      }
      if (!hasBothDaysRef.current || axisRef.current !== 'x') return
      event.preventDefault()
      let next = dx
      if (activeDayRef.current === 'today' && next > 0) next *= 0.22
      if (activeDayRef.current === 'tomorrow' && next < 0) next *= 0.22
      dragXRef.current = next
      setDragX(next)
    }

    node.addEventListener('touchmove', onMove, { passive: false })
    scrollCleanupRef.current = () => node.removeEventListener('touchmove', onMove)
  }, [])

  const beginDrag = (clientX, clientY) => {
    startRef.current = { x: clientX, y: clientY }
    axisRef.current = null
    dragXRef.current = 0
    pullYRef.current = 0
    setDragging(hasBothDays)
  }

  const endDrag = () => {
    if (!startRef.current) return
    const dx = dragXRef.current
    const pulled = pullYRef.current
    if (hasBothDays) {
      const width = scrollRef.current?.clientWidth || 1
      const threshold = Math.min(72, width * 0.18)
      if (dx < -threshold && activeDayRef.current === 'today') setActiveDay('tomorrow')
      if (dx > threshold && activeDayRef.current === 'tomorrow') setActiveDay('today')
    }
    if (pulled >= 56 && !refreshingRef.current && groupRef.current) {
      pullYRef.current = 48
      setPullY(48)
      loadSchedule(groupRef.current, { silent: true })
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

  const renderDayList = (items, isToday) => (
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


  return (
    <div className="app-bg flex h-full min-h-0 flex-col text-foreground">
      <Header className="app-header flex items-center justify-between px-3 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))]">
        {view !== 'schedule' ? (
          <>
            <Button
              isIconOnly
              aria-label={t(locale, 'back')}
              variant="ghost"
              onPress={() => setView(view === 'install' ? 'settings' : 'schedule')}
            >
              <ArrowLeft />
            </Button>
            <h1 className="select-none text-xl font-semibold" onClick={view === 'settings' ? handleSettingsTitleTap : undefined}>
              {t(locale, view === 'install' ? 'install' : 'settings')}
            </h1>
            <span className="size-10" />
          </>
        ) : (
          <>
            <h1 className="pl-1 text-xl font-semibold tracking-tight">{t(locale, 'schedule')}</h1>
            <div className="flex items-center">
              {isGroupSelected && (
                <>
                  <Button isIconOnly aria-label={t(locale, 'editGroup')} variant="ghost" onPress={handleChangeGroup}>
                    <Pencil />
                  </Button>
                  <Button
                    isIconOnly
                    aria-label={t(locale, 'refresh')}
                    isDisabled={refreshing}
                    variant="ghost"
                    onPress={() => loadSchedule(group, { silent: true })}
                  >
                    <ArrowRotateRight className={refreshing ? 'animate-spin' : undefined} />
                  </Button>
                </>
              )}
              <Button isIconOnly aria-label={t(locale, 'settings')} variant="ghost" onPress={() => setView('settings')}>
                <Gear />
              </Button>
            </div>
          </>
        )}
      </Header>

      {view === 'install' ? (
        <main className="min-h-0 flex-1 overflow-auto px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <InstallGuide locale={locale} />
        </main>
      ) : view === 'settings' ? (
        <main className="min-h-0 flex-1 overflow-auto px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="mx-auto flex w-full max-w-md flex-col gap-3">
            {!isInstalled && (
              <Card>
                <Card.Header>
                  <Card.Title>{t(locale, 'installApp')}</Card.Title>
                  <Card.Description className="truncate">{t(locale, 'installAppDesc')}</Card.Description>
                </Card.Header>
                <Card.Content>
                  <Button fullWidth variant="secondary" onPress={() => setView('install')}>
                    {t(locale, 'installHow')}
                    <ChevronRight />
                  </Button>
                </Card.Content>
              </Card>
            )}

            <Card>
              <Card.Header>
                <Card.Title>{t(locale, 'theme')}</Card.Title>
                <Card.Description className="truncate">{t(locale, 'themeDesc')}</Card.Description>
              </Card.Header>
              <Card.Content>
                <Tabs
                  className="w-full"
                  selectedKey={theme}
                  onSelectionChange={(key) => setTheme(String(key))}
                >
                  <Tabs.ListContainer className="w-full">
                    <Tabs.List aria-label={t(locale, 'theme')} className="w-full">
                      <Tabs.Tab aria-label={t(locale, 'themeSystem')} id="system">
                        <DisplayPulse />
                        <Tabs.Indicator />
                      </Tabs.Tab>
                      <Tabs.Tab aria-label={t(locale, 'themeLight')} id="light">
                        <Sun />
                        <Tabs.Indicator />
                      </Tabs.Tab>
                      <Tabs.Tab aria-label={t(locale, 'themeDark')} id="dark">
                        <Moon />
                        <Tabs.Indicator />
                      </Tabs.Tab>
                    </Tabs.List>
                  </Tabs.ListContainer>
                </Tabs>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>{t(locale, 'language')}</Card.Title>
                <Card.Description className="truncate">{t(locale, 'languageDesc')}</Card.Description>
              </Card.Header>
              <Card.Content>
                <Tabs
                  className="w-full"
                  selectedKey={locale}
                  onSelectionChange={(key) => handleLang(String(key))}
                >
                  <Tabs.ListContainer className="w-full">
                    <Tabs.List aria-label={t(locale, 'language')} className="w-full">
                      <Tabs.Tab id="ru">
                        {t(locale, 'langAbbrRu')}
                        <Tabs.Indicator />
                      </Tabs.Tab>
                      <Tabs.Tab id="be">
                        {t(locale, 'langAbbrBe')}
                        <Tabs.Indicator />
                      </Tabs.Tab>
                      <Tabs.Tab id="en">
                        {t(locale, 'langAbbrEn')}
                        <Tabs.Indicator />
                      </Tabs.Tab>
                    </Tabs.List>
                  </Tabs.ListContainer>
                </Tabs>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>{t(locale, 'scale')}</Card.Title>
                <Card.Description className="truncate">{t(locale, 'scaleDesc')}</Card.Description>
              </Card.Header>
              <Card.Content>
                <Tabs
                  className="w-full"
                  selectedKey={scale}
                  onSelectionChange={(key) => handleScale(String(key))}
                >
                  <Tabs.ListContainer className="w-full">
                    <Tabs.List aria-label={t(locale, 'scale')} className="w-full">
                      <Tabs.Tab id="sm">
                        90%
                        <Tabs.Indicator />
                      </Tabs.Tab>
                      <Tabs.Tab id="md">
                        100%
                        <Tabs.Indicator />
                      </Tabs.Tab>
                      <Tabs.Tab id="lg">
                        110%
                        <Tabs.Indicator />
                      </Tabs.Tab>
                    </Tabs.List>
                  </Tabs.ListContainer>
                </Tabs>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>{t(locale, 'support')}</Card.Title>
                <Card.Description className="truncate">{t(locale, 'supportDesc')}</Card.Description>
              </Card.Header>
              <Card.Content>
                <Button fullWidth variant="secondary" onPress={openSupport}>
                  <PaperPlane />
                  {SUPPORT_HANDLE}
                </Button>
              </Card.Content>
            </Card>
          </div>
        </main>
      ) : (
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pt-3 pb-[env(safe-area-inset-bottom)]">
          {showInstallBanner && (
            <div className="mb-3 flex w-full shrink-0 items-center rounded-2xl bg-accent/10 pl-3 text-accent">
              <button
                className="flex min-w-0 flex-1 items-center gap-2 py-2.5 text-left text-sm font-medium"
                type="button"
                onClick={handleInstallBanner}
              >
                <ArrowDownToSquare className="size-4 shrink-0" />
                <span className="truncate">{t(locale, 'installBanner')}</span>
              </button>
              <Button
                isIconOnly
                aria-label={t(locale, 'hide')}
                className="text-accent"
                size="sm"
                variant="ghost"
                onPress={dismissInstallBanner}
              >
                <Xmark />
              </Button>
            </div>
          )}
          {!isGroupSelected ? (
            <div className="min-h-0 flex-1 overflow-auto">
            <Surface className="mx-auto mt-[6vh] flex w-full max-w-md flex-col gap-3 rounded-3xl p-5">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{t(locale, 'group')}</h2>
                <p className="mt-0.5 text-sm text-muted">{t(locale, 'groupHint')}</p>
              </div>
              <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleGroupSubmit}>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Label className="sr-only" htmlFor="group-input">{t(locale, 'group')}</Label>
                  <Input
                    id="group-input"
                    autoCapitalize="characters"
                    autoFocus
                    fullWidth
                    placeholder={t(locale, 'groupPlaceholder')}
                    value={group}
                    variant="secondary"
                    onChange={handleGroupChange}
                  />
                </div>
                <Button isDisabled={loading || group.trim().length < 2} type="submit">
                  {loading ? <Spinner color="current" size="sm" /> : null}
                  {t(locale, 'open')}
                </Button>
              </form>
              {error && (
                <Alert status="danger">
                  <Alert.Content>
                    <Alert.Description>{error}</Alert.Description>
                  </Alert.Content>
                </Alert>
              )}
            </Surface>
            </div>
          ) : loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : currentSchedule.length === 0 ? (
            <div className="mx-auto flex max-w-sm flex-col items-center gap-3 pt-16 text-center">
              <p className="text-base text-muted">{t(locale, 'notFound')}</p>
              <Button variant="tertiary" onPress={handleChangeGroup}>{t(locale, 'chooseAnother')}</Button>
            </div>
          ) : (
            <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
              <div className="flex shrink-0 flex-col gap-1 border-b border-separator pb-3">
                <div className="flex w-full shrink-0 items-center justify-between gap-2">
                  <span className="min-w-0 text-lg font-semibold leading-tight">
                    {/* Между дефисом и цифрой браузер строку не переносит — разрешаем явно */}
                    {group.split('-').map((part, index) => (
                      <span key={index}>
                        {index > 0 && '-'}
                        {index > 0 && <wbr />}
                        {part}
                      </span>
                    ))}
                  </span>
                  {hasBothDays && (
                    <Tabs
                      className="ml-auto shrink-0"
                      selectedKey={activeDay}
                      onSelectionChange={(key) => {
                        setActiveDay(String(key))
                        setDragX(0)
                      }}
                    >
                      <Tabs.ListContainer>
                        <Tabs.List aria-label={t(locale, 'day')} className="grid grid-cols-2 p-0.5">
                          <Tabs.Tab className="h-7 px-2.5 text-sm" id="today">
                            {t(locale, 'today')}
                            <Tabs.Indicator />
                          </Tabs.Tab>
                          <Tabs.Tab className="h-7 px-2.5 text-sm" id="tomorrow">
                            {t(locale, 'tomorrow')}
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
                        <span className="dot-sep whitespace-nowrap">{`${t(locale, 'updatedAt')} ${formatUpdatedTime(lastUpdated, locale)}`}</span>
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
                  ref={attachScrollNode}
                  className="h-full min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y"
                  onMouseDown={(event) => beginDrag(event.clientX, event.clientY)}
                  onMouseLeave={startRef.current ? endDrag : undefined}
                  onMouseMove={(event) => {
                    if (!startRef.current) return
                    const dx = event.clientX - startRef.current.x
                    const dy = event.clientY - startRef.current.y
                    if (!axisRef.current) {
                      if (Math.abs(dx) + Math.abs(dy) < 10) return
                      axisRef.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
                      if (axisRef.current === 'y') setDragging(false)
                    }
                    if (axisRef.current === 'y') {
                      const el = scrollRef.current
                      if (el && el.scrollTop <= 0 && dy > 0 && !refreshing) {
                        const damped = Math.min(92, dy * 0.4)
                        pullYRef.current = damped
                        setPullY(damped)
                      }
                      return
                    }
                    if (!hasBothDays) return
                    let next = dx
                    if (activeDay === 'today' && next > 0) next *= 0.22
                    if (activeDay === 'tomorrow' && next < 0) next *= 0.22
                    dragXRef.current = next
                    setDragX(next)
                  }}
                  onMouseUp={endDrag}
                  onTouchEnd={endDrag}
                  onTouchStart={(event) => beginDrag(event.touches[0].clientX, event.touches[0].clientY)}
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
                        ref={trackRef}
                        className="-mx-2 flex w-[calc(200%+2rem)] will-change-transform"
                        style={{
                          transform: `translate3d(calc(${activeDay === 'today' ? 0 : -50}% + ${dragX}px), 0, 0)`,
                          transition: dragging ? 'none' : 'transform 380ms cubic-bezier(0.32, 0.72, 0, 1)',
                        }}
                      >
                        <div className="w-1/2 px-2">{renderDayList(todayMerged, true)}</div>
                        <div className="w-1/2 px-2">{renderDayList(tomorrowMerged, false)}</div>
                      </div>
                    ) : (
                      renderDayList(activeDay === 'today' ? todayMerged : tomorrowMerged, activeDay === 'today')
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  )
}

export default App
