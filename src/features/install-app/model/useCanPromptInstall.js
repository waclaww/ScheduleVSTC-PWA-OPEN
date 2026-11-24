import { useEffect, useState } from 'react'
import { canPromptInstall, onInstallAvailabilityChange } from './installPrompt'

export function useCanPromptInstall() {
  const [canInstall, setCanInstall] = useState(canPromptInstall)
  useEffect(() => onInstallAvailabilityChange(setCanInstall), [])
  return canInstall
}
