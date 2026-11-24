import { Button } from '@heroui/react'
import { Gear } from '@gravity-ui/icons'
import { useSchedule } from '@/entities/schedule'
import { ChangeGroupButton } from '@/features/change-group'
import { InstallBanner } from '@/features/install-app'
import { RefreshButton } from '@/features/refresh-schedule'
import { GroupForm } from '@/features/select-group'
import { ScheduleViewer } from '@/widgets/schedule-viewer'
import { useI18n } from '@/shared/i18n'
import { AppHeader } from '@/shared/ui'

export function SchedulePage({ onOpenSettings, onOpenInstall }) {
  const { t } = useI18n()
  const { isGroupSelected } = useSchedule()

  return (
    <>
      <AppHeader
        title={t('schedule')}
        actions={
          <>
            {isGroupSelected && (
              <>
                <ChangeGroupButton />
                <RefreshButton />
              </>
            )}
            <Button isIconOnly aria-label={t('settings')} variant="ghost" onPress={onOpenSettings}>
              <Gear />
            </Button>
          </>
        }
      />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pt-3 pb-[env(safe-area-inset-bottom)]">
        <InstallBanner onOpenGuide={onOpenInstall} />
        {isGroupSelected ? (
          <ScheduleViewer />
        ) : (
          <div className="min-h-0 flex-1 overflow-auto">
            <GroupForm />
          </div>
        )}
      </main>
    </>
  )
}
