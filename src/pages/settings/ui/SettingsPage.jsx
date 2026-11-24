import { Button } from '@heroui/react'
import { ChevronRight } from '@gravity-ui/icons'
import { LanguageSwitcher } from '@/features/change-language'
import { ScaleSwitcher } from '@/features/change-scale'
import { ThemeSwitcher } from '@/features/change-theme'
import { SupportButton } from '@/features/contact-support'
import { resetInstallState, useInstallState } from '@/features/install-app'
import { useI18n } from '@/shared/i18n'
import { useMultiTap } from '@/shared/lib/hooks'
import { AppHeader, PageContent, SettingsCard } from '@/shared/ui'

export function SettingsPage({ onBack, onOpenInstall }) {
  const { t } = useI18n()
  const { isInstalled } = useInstallState()

  // Отладка: 7 быстрых нажатий на заголовок сбрасывают флаги установки
  const handleTitleTap = useMultiTap(7, () => {
    resetInstallState()
    window.alert('Install flags reset')
  })

  return (
    <>
      <AppHeader title={t('settings')} onBack={onBack} onTitleClick={handleTitleTap} />
      <PageContent>
        {!isInstalled && (
          <SettingsCard title={t('installApp')} description={t('installAppDesc')}>
            <Button fullWidth variant="secondary" onPress={onOpenInstall}>
              {t('installHow')}
              <ChevronRight />
            </Button>
          </SettingsCard>
        )}
        <SettingsCard title={t('theme')} description={t('themeDesc')}>
          <ThemeSwitcher />
        </SettingsCard>
        <SettingsCard title={t('language')} description={t('languageDesc')}>
          <LanguageSwitcher />
        </SettingsCard>
        <SettingsCard title={t('scale')} description={t('scaleDesc')}>
          <ScaleSwitcher />
        </SettingsCard>
        <SettingsCard title={t('support')} description={t('supportDesc')}>
          <SupportButton />
        </SettingsCard>
      </PageContent>
    </>
  )
}
