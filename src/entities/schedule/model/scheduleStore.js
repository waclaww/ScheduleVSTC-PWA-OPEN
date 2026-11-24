import { createStore, useStore } from '@/shared/lib/store'
import { fetchSchedule } from '../api/fetchSchedule'

const initialState = {
  // Название группы: и значение поля ввода, и группа открытого расписания
  group: '',
  isGroupSelected: false,
  loading: false,
  refreshing: false,
  lastUpdated: null,
  // Ключ перевода, а не текст — чтобы ошибка переводилась при смене языка
  errorKey: '',
  data: { today: [], tomorrow: [] },
  activeDay: 'today',
}

const store = createStore(initialState)

export const useSchedule = () => useStore(store)
export const getSchedule = store.get

export const setGroupInput = (value) => store.set({ group: value.toUpperCase(), errorKey: '' })
export const setGroup = (group) => store.set({ group })
export const setScheduleError = (errorKey) => store.set({ errorKey })
export const setActiveDay = (activeDay) => store.set({ activeDay })
export const resetSchedule = () => store.reset()

// Открыть расписание сразу, ещё до ответа сервера (сохранённая группа)
export const selectGroup = (group) => store.set({ group, isGroupSelected: true })

// silent — обновление уже открытого расписания: без полноэкранного спиннера и смены дня
export async function loadSchedule(groupName, { silent = false } = {}) {
  if (!groupName || groupName.trim().length < 2) {
    store.set({ errorKey: 'groupMinLength' })
    return
  }

  store.set({ [silent ? 'refreshing' : 'loading']: true, errorKey: '' })

  try {
    const data = await fetchSchedule(groupName)

    if (data.today.length > 0 || data.tomorrow.length > 0) {
      store.set({
        data,
        isGroupSelected: true,
        lastUpdated: new Date(),
        ...(!silent && { activeDay: data.today.length > 0 ? 'today' : 'tomorrow' }),
      })
    } else {
      store.set({ data, errorKey: 'notFound', isGroupSelected: false })
    }
  } catch (error) {
    console.error('Ошибка:', error)
    store.set({ errorKey: 'notFound', isGroupSelected: false })
  } finally {
    store.set({ loading: false, refreshing: false })
  }
}
