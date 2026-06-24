import { type ReactNode, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { ShareImportBanner } from '../ui/ShareImportBanner'
import { ToastStack } from '../ui/ToastStack'
import { TourProvider, useTour } from '../tour/TourProvider'
import { useAuth } from '../../hooks/useAuth'

function ShellInner({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { user } = useAuth()
  const { startTour } = useTour()

  useEffect(() => {
    if (user && !localStorage.getItem('leisurely:tour_seen')) {
      const timer = setTimeout(() => startTour(), 900)
      return () => clearTimeout(timer)
    }
  }, [user, startTour])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <ShareImportBanner />
      <ToastStack />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pb-32">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  )
}

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <TourProvider>
      <ShellInner>{children}</ShellInner>
    </TourProvider>
  )
}
