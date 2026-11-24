import { InstallGuide } from '@/features/install-app'
import { useI18n } from '@/shared/i18n'
import { AppHeader, PageContent } from '@/shared/ui'

export function InstallPage({ onBack }) {
  const { t } = useI18n()

  return (
    <>
      <AppHeader title={t('install')} onBack={onBack} />
      <PageContent>
        <InstallGuide />
      </PageContent>
    </>
  )
}
