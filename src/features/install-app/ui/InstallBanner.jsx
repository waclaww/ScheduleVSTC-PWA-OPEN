import { Button } from '@heroui/react'
import { ArrowDownToSquare, Xmark } from '@gravity-ui/icons'
import { useI18n } from '@/shared/i18n'
import { inTelegram } from '@/shared/lib/platform'
import { canPromptInstall } from '../model/installPrompt'
import { canShowInstallBanner, hideInstallBanner, installApp, useInstallState } from '../model/installState'

export function InstallBanner({ onOpenGuide }) {
  const { t } = useI18n()
  const installState = useInstallState()

  if (!canShowInstallBanner(installState)) return null

  const handleClick = () => {
    // Chrome на Android умеет ставить сразу — без инструкции
    if (!inTelegram && canPromptInstall()) installApp()
    else onOpenGuide()
  }

  return (
    <div className="mb-3 flex w-full shrink-0 items-center rounded-2xl bg-accent/10 pl-3 text-accent">
      <button
        className="flex min-w-0 flex-1 items-center gap-2 py-2.5 text-left text-sm font-medium"
        type="button"
        onClick={handleClick}
      >
        <ArrowDownToSquare className="size-4 shrink-0" />
        <span className="truncate">{t('installBanner')}</span>
      </button>
      <Button
        isIconOnly
        aria-label={t('hide')}
        className="text-accent"
        size="sm"
        variant="ghost"
        onPress={hideInstallBanner}
      >
        <Xmark />
      </Button>
    </div>
  )
}
