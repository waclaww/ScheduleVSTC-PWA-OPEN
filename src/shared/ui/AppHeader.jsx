import { Button, Header } from '@heroui/react'
import { ArrowLeft } from '@gravity-ui/icons'
import { useI18n } from '../i18n'

// Шапка приложения. С onBack — вложенная страница: «назад», заголовок по центру.
// Без onBack — главная: заголовок слева, кнопки действий справа
export function AppHeader({ title, onBack, onTitleClick, actions }) {
  const { t } = useI18n()

  return (
    <Header className="app-header flex items-center justify-between px-3 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))]">
      {onBack ? (
        <>
          <Button isIconOnly aria-label={t('back')} variant="ghost" onPress={onBack}>
            <ArrowLeft />
          </Button>
          <h1 className="select-none text-xl font-semibold" onClick={onTitleClick}>
            {title}
          </h1>
          <span className="size-10" />
        </>
      ) : (
        <>
          <h1 className="pl-1 text-xl font-semibold tracking-tight">{title}</h1>
          <div className="flex items-center">{actions}</div>
        </>
      )}
    </Header>
  )
}
