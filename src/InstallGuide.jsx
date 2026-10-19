import { useEffect, useState } from 'react'
import { Button, Card, Tabs } from '@heroui/react'
import {
  ArrowDownToSquare,
  ArrowUpFromSquare,
  ArrowUpRightFromSquare,
  Check,
  Compass,
  Copy,
  Ellipsis,
  EllipsisVertical,
  House,
  SquarePlus,
} from '@gravity-ui/icons'
import {
  canPromptInstall,
  copyAppLink,
  inTelegram,
  inTelegramBrowser,
  iosGeneration,
  iosSafari,
  onInstallAvailabilityChange,
  openInBrowser,
  platform as detectedPlatform,
  promptInstall,
} from './install'
import { t } from './i18n'

const ANDROID_STEPS = [
  { key: 'androidStep1', tgKey: 'androidStep1Tg' },
  { key: 'androidStep2', icon: EllipsisVertical },
  { key: 'androidStep3', icon: SquarePlus },
  { key: 'androidStep4' },
]

// На iOS 26 «Поделиться» спрятано в меню «⋯»; если версия неизвестна — описываем оба варианта
const IOS_SHARE_STEP = {
  new: { key: 'iosShareNew', hint: 'iosShareNewHint', icon: Ellipsis },
  old: { key: 'iosShareOld', hint: 'iosShareOldHint', icon: ArrowUpFromSquare },
  unknown: { key: 'iosShareOld', hint: 'iosShareAnyHint', icon: ArrowUpFromSquare },
}

function iosSteps(generation, inSafari) {
  return [
    // Уже в Safari — копировать ссылку и открывать Safari не нужно
    ...(inSafari
      ? []
      : [
          { key: 'iosCopy', hint: 'iosCopyHint', copy: true },
          { key: 'iosOpenSafari', hint: 'iosOpenSafariHint', icon: Compass },
        ]),
    IOS_SHARE_STEP[generation || 'unknown'],
    { key: 'iosAddToHome', hint: 'iosAddToHomeHint', icon: SquarePlus },
    { key: 'iosConfirm', hint: generation === 'old' ? null : 'iosConfirmHint' },
    { key: 'iosDone', hint: 'iosDoneHint', icon: House },
  ]
}

const BENEFITS = ['installWhy1', 'installWhy2']

function CopyLinkButton({ locale, copied, onCopy, ...props }) {
  return (
    <Button {...props} onPress={async () => onCopy(await copyAppLink())}>
      {copied ? <Check /> : <Copy />}
      {t(locale, copied ? 'copied' : 'copyLink')}
    </Button>
  )
}

function InstallGuide({ locale }) {
  const [platform, setPlatform] = useState(detectedPlatform || 'android')
  const [canInstall, setCanInstall] = useState(canPromptInstall)
  const [copied, setCopied] = useState(false)

  useEffect(() => onInstallAvailabilityChange(setCanInstall), [])

  useEffect(() => {
    if (!copied) return undefined
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  const isIos = platform === 'ios'
  const steps = isIos ? iosSteps(iosGeneration, iosSafari) : ANDROID_STEPS

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3">
      {inTelegram && (
        <Card>
          <Card.Header>
            <Card.Title>{t(locale, 'tgTitle')}</Card.Title>
            <Card.Description>{t(locale, isIos ? 'tgDescIos' : 'tgDesc')}</Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-2">
            {/* На iOS Telegram открывает ссылки в своём браузере, откуда установить нельзя — только копирование */}
            {!isIos && (
              <Button fullWidth onPress={openInBrowser}>
                <ArrowUpRightFromSquare />
                {t(locale, 'openInBrowser')}
              </Button>
            )}
            <CopyLinkButton
              fullWidth
              copied={copied}
              locale={locale}
              variant={isIos ? 'primary' : 'secondary'}
              onCopy={setCopied}
            />
          </Card.Content>
        </Card>
      )}

      {inTelegramBrowser && (
        <Card>
          <Card.Header>
            <Card.Title>{t(locale, 'tgBrowserTitle')}</Card.Title>
            <Card.Description>{t(locale, isIos ? 'tgBrowserDescIos' : 'tgBrowserDesc')}</Card.Description>
          </Card.Header>
          <Card.Content>
            <CopyLinkButton fullWidth copied={copied} locale={locale} variant="secondary" onCopy={setCopied} />
          </Card.Content>
        </Card>
      )}

      {canInstall && !inTelegram && (
        <Card>
          <Card.Header>
            <Card.Title>{t(locale, 'installApp')}</Card.Title>
            <Card.Description>{t(locale, 'installNowDesc')}</Card.Description>
          </Card.Header>
          <Card.Content>
            <Button fullWidth onPress={promptInstall}>
              <ArrowDownToSquare />
              {t(locale, 'installNow')}
            </Button>
          </Card.Content>
        </Card>
      )}

      <Card>
        <Card.Content className="flex flex-col gap-2">
          {BENEFITS.map((key) => (
            <div key={key} className="flex items-center gap-2.5 text-sm">
              <Check className="size-4 shrink-0 text-success" />
              {t(locale, key)}
            </div>
          ))}
        </Card.Content>
      </Card>

      <Card>
        <Card.Content className="flex flex-col gap-4">
          <Tabs className="w-full" selectedKey={platform} onSelectionChange={(key) => setPlatform(String(key))}>
            <Tabs.ListContainer className="w-full">
              <Tabs.List aria-label={t(locale, 'install')} className="w-full">
                <Tabs.Tab id="android">
                  {t(locale, 'platformAndroid')}
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="ios">
                  {t(locale, 'platformIos')}
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>

          {isIos && iosSafari && (
            <div className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2 text-sm text-success">
              <Check className="size-4 shrink-0" />
              {t(locale, 'iosInSafari')}
            </div>
          )}

          <ol className="flex flex-col gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <li key={step.key} className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
                    {index + 1}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
                    <span className="text-sm leading-snug font-medium">
                      {t(locale, inTelegram && step.tgKey ? step.tgKey : step.key)}
                    </span>
                    {step.hint && <span className="text-xs leading-snug text-muted">{t(locale, step.hint)}</span>}
                    {step.copy && (
                      <CopyLinkButton
                        className="mt-1 self-start"
                        copied={copied}
                        locale={locale}
                        size="sm"
                        variant="secondary"
                        onCopy={setCopied}
                      />
                    )}
                  </div>
                  {Icon && (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-default">
                      <Icon className="size-4" />
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </Card.Content>
      </Card>

      {isIos && (
        <Card>
          <Card.Header>
            <Card.Title>{t(locale, 'iosTroubleTitle')}</Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-2 text-sm leading-snug">
            <p>{t(locale, 'iosTroubleNoItem')}</p>
            <p>{t(locale, 'iosTroubleNoBar')}</p>
          </Card.Content>
        </Card>
      )}
    </div>
  )
}

export default InstallGuide
