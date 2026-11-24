import { Alert, Button, Input, Label, Spinner, Surface } from '@heroui/react'
import { setGroupInput, useSchedule } from '@/entities/schedule'
import { useI18n } from '@/shared/i18n'
import { submitGroup } from '../model/selectGroup'

export function GroupForm() {
  const { t } = useI18n()
  const { group, loading, errorKey } = useSchedule()

  const handleSubmit = (event) => {
    event.preventDefault()
    submitGroup(group)
  }

  return (
    <Surface className="mx-auto mt-[6vh] flex w-full max-w-md flex-col gap-3 rounded-3xl p-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{t('group')}</h2>
        <p className="mt-0.5 text-sm text-muted">{t('groupHint')}</p>
      </div>
      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Label className="sr-only" htmlFor="group-input">{t('group')}</Label>
          <Input
            id="group-input"
            autoCapitalize="characters"
            autoFocus
            fullWidth
            placeholder={t('groupPlaceholder')}
            value={group}
            variant="secondary"
            onChange={(event) => setGroupInput(event.target.value)}
          />
        </div>
        <Button isDisabled={loading || group.trim().length < 2} type="submit">
          {loading ? <Spinner color="current" size="sm" /> : null}
          {t('open')}
        </Button>
      </form>
      {errorKey && (
        <Alert status="danger">
          <Alert.Content>
            <Alert.Description>{t(errorKey)}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}
    </Surface>
  )
}
