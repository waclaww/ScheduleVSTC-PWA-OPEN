import { Button } from '@heroui/react'
import { Check, Copy } from '@gravity-ui/icons'
import { useI18n } from '@/shared/i18n'
import { copyText } from '@/shared/lib/clipboard'
import { appUrl } from '@/shared/lib/platform'

export function CopyLinkButton({ copied, onCopy, ...props }) {
  const { t } = useI18n()
  return (
    <Button {...props} onPress={async () => onCopy(await copyText(appUrl()))}>
      {copied ? <Check /> : <Copy />}
      {t(copied ? 'copied' : 'copyLink')}
    </Button>
  )
}
