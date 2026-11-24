import { useEffect, useState } from 'react'
import { Button, Card } from '@heroui/react'
import { ArrowDownToSquare, ArrowUpRightFromSquare, Check } from '@gravity-ui/icons'
import { useI18n } from '@/shared/i18n'
import {
  platform as detectedPlatform,
  inTelegram,
  inTelegramBrowser,
  iosGeneration,
  iosSafari,
  openInBrowser,
} from '@/shared/lib/platform'
import { SegmentedTabs } from '@/shared/ui'
import { ANDROID_STEPS, BENEFITS, iosSteps } from '../config/steps'
import { installApp } from '../model/installState'
import { useCanPromptInstall } from '../model/useCanPromptInstall'
import { CopyLinkButton } from './CopyLinkButton'

export function InstallGuide() {
  const { t } = useI18n()
  const [platform, setPlatform] = useState(detectedPlatform || 'android')
  const canInstall = useCanPromptInstall()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return undefined
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  const isIos = platform === 'ios'
  const steps = isIos ? iosSteps(iosGeneration, iosSafari) : ANDROID_STEPS
  const platforms = [
    { id: 'android', label: t('platformAndroid') },
    { id: 'ios', label: t('platformIos') },
  ]

  return (
    <>
      {inTelegram && (
        <Card>
          <Card.Header>
            <Card.Title>{t('tgTitle')}</Card.Title>
            <Card.Description>{t(isIos ? 'tgDescIos' : 'tgDesc')}</Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-2">
            {/* На iOS Telegram открывает ссылки в своём браузере, откуда установить нельзя — только копирование */}
            {!isIos && (
              <Button fullWidth onPress={openInBrowser}>
                <ArrowUpRightFromSquare />
                {t('openInBrowser')}
              </Button>
            )}
            <CopyLinkButton fullWidth copied={copied} variant={isIos ? 'primary' : 'secondary'} onCopy={setCopied} />
          </Card.Content>
        </Card>
      )}

      {inTelegramBrowser && (
        <Card>
          <Card.Header>
            <Card.Title>{t('tgBrowserTitle')}</Card.Title>
            <Card.Description>{t(isIos ? 'tgBrowserDescIos' : 'tgBrowserDesc')}</Card.Description>
          </Card.Header>
          <Card.Content>
            <CopyLinkButton fullWidth copied={copied} variant="secondary" onCopy={setCopied} />
          </Card.Content>
        </Card>
      )}

      {canInstall && !inTelegram && (
        <Card>
          <Card.Header>
            <Card.Title>{t('installApp')}</Card.Title>
            <Card.Description>{t('installNowDesc')}</Card.Description>
          </Card.Header>
          <Card.Content>
            <Button fullWidth onPress={installApp}>
              <ArrowDownToSquare />
              {t('installNow')}
            </Button>
          </Card.Content>
        </Card>
      )}

      <Card>
        <Card.Content className="flex flex-col gap-2">
          {BENEFITS.map((key) => (
            <div key={key} className="flex items-center gap-2.5 text-sm">
              <Check className="size-4 shrink-0 text-success" />
              {t(key)}
            </div>
          ))}
        </Card.Content>
      </Card>

      <Card>
        <Card.Content className="flex flex-col gap-4">
          <SegmentedTabs ariaLabel={t('install')} items={platforms} selectedKey={platform} onChange={setPlatform} />

          {isIos && iosSafari && (
            <div className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2 text-sm text-success">
              <Check className="size-4 shrink-0" />
              {t('iosInSafari')}
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
                      {t(inTelegram && step.tgKey ? step.tgKey : step.key)}
                    </span>
                    {step.hint && <span className="text-xs leading-snug text-muted">{t(step.hint)}</span>}
                    {step.copy && (
                      <CopyLinkButton
                        className="mt-1 self-start"
                        copied={copied}
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
            <Card.Title>{t('iosTroubleTitle')}</Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-2 text-sm leading-snug">
            <p>{t('iosTroubleNoItem')}</p>
            <p>{t('iosTroubleNoBar')}</p>
          </Card.Content>
        </Card>
      )}
    </>
  )
}
