import { Button } from '@heroui/react'
import { Pencil } from '@gravity-ui/icons'
import { useI18n } from '@/shared/i18n'
import { changeGroup } from '../model/changeGroup'

export function ChangeGroupButton() {
  const { t } = useI18n()
  return (
    <Button isIconOnly aria-label={t('editGroup')} variant="ghost" onPress={changeGroup}>
      <Pencil />
    </Button>
  )
}
