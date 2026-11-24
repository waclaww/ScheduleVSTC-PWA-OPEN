import { Button } from '@heroui/react'
import { PaperPlane } from '@gravity-ui/icons'
import { SUPPORT_HANDLE, SUPPORT_URL } from '@/shared/config'
import { openTelegramLink } from '@/shared/lib/platform'

export function SupportButton() {
  return (
    <Button fullWidth variant="secondary" onPress={() => openTelegramLink(SUPPORT_URL)}>
      <PaperPlane />
      {SUPPORT_HANDLE}
    </Button>
  )
}
