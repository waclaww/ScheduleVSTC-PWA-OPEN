import { useState } from 'react'
import { useI18n } from '@/shared/i18n'
import { SegmentedTabs } from '@/shared/ui'
import { applyScale, getSavedScale } from '../model/scale'

const ITEMS = [
  { id: 'sm', label: '90%' },
  { id: 'md', label: '100%' },
  { id: 'lg', label: '110%' },
]

export function ScaleSwitcher() {
  const { t } = useI18n()
  const [scale, setScale] = useState(getSavedScale)

  const handleChange = (value) => {
    setScale(value)
    applyScale(value)
  }

  return <SegmentedTabs ariaLabel={t('scale')} items={ITEMS} selectedKey={scale} onChange={handleChange} />
}
