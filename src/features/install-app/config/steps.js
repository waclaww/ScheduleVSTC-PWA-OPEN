import { ArrowUpFromSquare, Compass, Ellipsis, EllipsisVertical, House, SquarePlus } from '@gravity-ui/icons'

export const ANDROID_STEPS = [
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

export function iosSteps(generation, inSafari) {
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

export const BENEFITS = ['installWhy1', 'installWhy2']
