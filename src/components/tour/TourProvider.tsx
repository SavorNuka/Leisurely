import { createContext, useContext, useState, type ReactNode } from 'react'
import { Joyride, type EventData, STATUS } from 'react-joyride'
import { TOUR_STEPS } from '../../lib/tourSteps'

interface TourContextValue {
  startTour: () => void
}

const TourContext = createContext<TourContextValue>({ startTour: () => {} })

export function useTour() {
  return useContext(TourContext)
}

interface TourProviderProps {
  children: ReactNode
}

export function TourProvider({ children }: TourProviderProps) {
  const [run, setRun] = useState(false)

  function startTour() {
    setRun(false)
    requestAnimationFrame(() => setRun(true))
  }

  function handleEvent(data: EventData) {
    const { status } = data
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false)
      localStorage.setItem('leisurely:tour_seen', 'true')
    }
  }

  return (
    <TourContext.Provider value={{ startTour }}>
      <Joyride
        steps={TOUR_STEPS}
        run={run}
        continuous
        scrollToFirstStep
        onEvent={handleEvent}
        options={{
          primaryColor: '#7D9B76',
          backgroundColor: '#F5F0E8',
          textColor: '#3D4A2E',
          arrowColor: '#F5F0E8',
          overlayColor: 'rgba(61,74,46,0.45)',
          zIndex: 9000,
          showProgress: true,
          skipBeacon: true,
          overlayClickAction: false,
          buttons: ['back', 'primary', 'skip'],
        }}
        styles={{
          buttonPrimary: {
            backgroundColor: '#7D9B76',
            borderRadius: '12px',
            fontSize: '13px',
            padding: '8px 16px',
          },
          buttonBack: {
            color: '#3D4A2E',
            fontSize: '13px',
          },
          buttonSkip: {
            color: '#3D4A2E',
            fontSize: '12px',
            opacity: 0.5,
          },
          tooltip: {
            borderRadius: '12px',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          tooltipTitle: {
            fontFamily: 'Lora, Georgia, serif',
          },
        }}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next →',
          skip: 'Skip tour',
        }}
      />
      {children}
    </TourContext.Provider>
  )
}
