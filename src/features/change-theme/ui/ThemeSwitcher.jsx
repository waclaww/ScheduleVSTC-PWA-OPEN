import { DisplayPulse, Moon, Sun } from '@gravity-ui/icons'
import { useI18n } from '@/shared/i18n'
import { useAppTheme } from '@/shared/lib/theme'
import { SegmentedTabs } from '@/shared/ui'

export function ThemeSwitcher() {
  const { t } = useI18n()
  const { theme, setTheme } = useAppTheme()

  const items = [
    { id: 'system', label: <DisplayPulse />, ariaLabel: t('themeSystem') },
    { id: 'light', label: <Sun />, ariaLabel: t('themeLight') },
    { id: 'dark', label: <Moon />, ariaLabel: t('themeDark') },
  ]

  return <SegmentedTabs ariaLabel={t('theme')} items={items} selectedKey={theme} onChange={setTheme} />
}
