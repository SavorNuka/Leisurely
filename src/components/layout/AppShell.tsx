import { type ReactNode } from 'react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { ShareImportBanner } from '../ui/ShareImportBanner'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <ShareImportBanner />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
