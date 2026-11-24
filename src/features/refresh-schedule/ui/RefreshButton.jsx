import { Button } from '@heroui/react'
import { ArrowRotateRight } from '@gravity-ui/icons'
import { useSchedule } from '@/entities/schedule'
import { useI18n } from '@/shared/i18n'
import { refreshSchedule } from '../model/refreshSchedule'

export function RefreshButton() {
  const { t } = useI18n()
  const { refreshing } = useSchedule()
  return (
    <Button isIconOnly aria-label={t('refresh')} isDisabled={refreshing} variant="ghost" onPress={refreshSchedule}>
      <ArrowRotateRight className={refreshing ? 'animate-spin' : undefined} />
    </Button>
  )
}
