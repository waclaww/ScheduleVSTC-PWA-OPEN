import { useEffect, useState } from 'react'
import { InstallPage } from '@/pages/install'
import { SchedulePage } from '@/pages/schedule'
import { SettingsPage } from '@/pages/settings'
import { restoreSavedGroup } from '@/features/select-group'
import { AppProviders } from './providers'

// Навигация без роутера: экранов три, адрес не меняется (PWA открывается со start_url)
function Pages() {
  const [page, setPage] = useState('schedule')

  useEffect(() => {
    restoreSavedGroup()
  }, [])

  return (
    <div className="app-bg flex h-full min-h-0 flex-col text-foreground">
      {page === 'install' ? (
        <InstallPage onBack={() => setPage('settings')} />
      ) : page === 'settings' ? (
        <SettingsPage onBack={() => setPage('schedule')} onOpenInstall={() => setPage('install')} />
      ) : (
        <SchedulePage onOpenInstall={() => setPage('install')} onOpenSettings={() => setPage('settings')} />
      )}
    </div>
  )
}

export function App() {
  return (
    <AppProviders>
      <Pages />
    </AppProviders>
  )
}
