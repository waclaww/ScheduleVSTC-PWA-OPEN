import { useI18n } from '@/shared/i18n'
import { SegmentedTabs } from '@/shared/ui'

export function LanguageSwitcher() {
  const { t, locale, setPreference } = useI18n()

  const items = [
    { id: 'ru', label: t('langAbbrRu') },
    { id: 'be', label: t('langAbbrBe') },
    { id: 'en', label: t('langAbbrEn') },
  ]

  return <SegmentedTabs ariaLabel={t('language')} items={items} selectedKey={locale} onChange={setPreference} />
}
