import { useCallback, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppointmentConfirmedPage } from './AppointmentConfirmedPage'
import { FiveStarFeedbackThankYouPage } from './FiveStarFeedbackThankYouPage'
import { ProviderRecommendationsPage } from './ProviderRecommendationsPage'
import { SessionCompletePage } from './SessionCompletePage'
import { captureSessionPageHeightForHandoff } from './sessionPageHandoff'
import { clearHandoffPageMinHeight } from './sessionPageHandoff'
import styles from './App.module.css'

const routerBasename =
  import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')

type FollowUpDemoMode = 'noFollowUp' | 'alreadyBooked'

export type PrototypeScreen =
  | 'home'
  | 'appointmentConfirmed'
  | 'providerRecommendations'
  | 'fiveStarThankYou'

const PROTOTYPE_TOAST_MS = 2500

function ScrollToTopOnScreenChange({ screen }: { screen: PrototypeScreen }) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [screen])

  return null
}

function PrototypeApp() {
  const [sessionKey, setSessionKey] = useState(0)
  const [followUpDemo, setFollowUpDemo] = useState<FollowUpDemoMode>('noFollowUp')
  const [screen, setScreen] = useState<PrototypeScreen>('home')
  const [showPrototypeToast, setShowPrototypeToast] = useState(false)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goHome = useCallback(() => setScreen('home'), [])

  const reviewHandoffNavigate = useCallback(
    (destination: Exclude<PrototypeScreen, 'home' | 'appointmentConfirmed'>) => {
      setScreen(destination)
    },
    [],
  )

  const triggerPrototypeToast = useCallback(() => {
    if (toastTimerRef.current != null) {
      clearTimeout(toastTimerRef.current)
      toastTimerRef.current = null
    }
    setShowPrototypeToast(true)
    toastTimerRef.current = window.setTimeout(() => {
      toastTimerRef.current = null
      setShowPrototypeToast(false)
    }, PROTOTYPE_TOAST_MS)
  }, [])

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return
      const target = event.target
      if (!(target instanceof Element)) return

      const placeholderInteractive = target.closest('[data-prototype-placeholder]')
      if (
        placeholderInteractive instanceof HTMLButtonElement ||
        placeholderInteractive instanceof HTMLAnchorElement
      ) {
        event.preventDefault()
        triggerPrototypeToast()
        return
      }

      const anchor = target.closest('a')
      if (!anchor) return

      const hrefAttr = anchor.getAttribute('href') ?? ''
      const isPlaceholderAnchor = hrefAttr === '#' || anchor.href.endsWith('#')
      if (!isPlaceholderAnchor) return

      event.preventDefault()
      triggerPrototypeToast()
    }

    document.addEventListener('click', onDocumentClick, true)
    return () => document.removeEventListener('click', onDocumentClick, true)
  }, [triggerPrototypeToast])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        clearTimeout(toastTimerRef.current)
        toastTimerRef.current = null
      }
    }
  }, [])

  const resetPrototype = () => {
    clearHandoffPageMinHeight()
    setSessionKey((k) => k + 1)
    setScreen('home')
  }

  const homePage =
    followUpDemo === 'noFollowUp' ? (
      <SessionCompletePage
        key={`${sessionKey}-session`}
        onBookSessionComplete={() => setScreen('appointmentConfirmed')}
      />
    ) : (
      <AppointmentConfirmedPage
        key={`${sessionKey}-followup-booked`}
        variant="sessionCompleteFollowUpBooked"
        onLogoHome={goHome}
        onReviewHandoffNavigate={reviewHandoffNavigate}
      />
    )

  return (
    <>
      <ScrollToTopOnScreenChange screen={screen} />
      <div className={styles.prototypeBar}>
        <button
          type="button"
          className={styles.reset}
          onClick={resetPrototype}
          aria-label="Reset to the start of the selected scenario; does not change No follow up yet or F.u booked"
        >
          Reset
        </button>
        <div
          className={styles.followUpToggle}
          role="radiogroup"
          aria-label="Demo: which home-screen prototype opens on /"
        >
          <button
            type="button"
            className={[
              styles.followUpOption,
              followUpDemo === 'noFollowUp' ? styles.followUpOptionSelected : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="radio"
            aria-checked={followUpDemo === 'noFollowUp'}
            onClick={() => {
              setFollowUpDemo('noFollowUp')
              setScreen('home')
            }}
          >
            No follow up
          </button>
          <button
            type="button"
            className={[
              styles.followUpOption,
              followUpDemo === 'alreadyBooked' ? styles.followUpOptionSelected : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="radio"
            aria-checked={followUpDemo === 'alreadyBooked'}
            aria-label="Follow up booked"
            onClick={() => {
              if (followUpDemo === 'noFollowUp') {
                captureSessionPageHeightForHandoff()
              }
              setFollowUpDemo('alreadyBooked')
              setScreen('home')
            }}
          >
            F.u booked
          </button>
        </div>
      </div>
      <div className={styles.routeHost}>
        {screen === 'home' ? homePage : null}
        {screen === 'appointmentConfirmed' ? (
          <AppointmentConfirmedPage
            key={`appt-${sessionKey}`}
            variant="appointmentConfirmed"
            onLogoHome={goHome}
            onReviewHandoffNavigate={reviewHandoffNavigate}
          />
        ) : null}
        {screen === 'providerRecommendations' ? (
          <ProviderRecommendationsPage key={`rec-${sessionKey}`} onLogoHome={goHome} />
        ) : null}
        {screen === 'fiveStarThankYou' ? (
          <FiveStarFeedbackThankYouPage key={`5star-${sessionKey}`} onLogoHome={goHome} />
        ) : null}
      </div>
      {showPrototypeToast ? (
        <div className={styles.prototypeToast} role="status" aria-live="polite">
          Interaction not part of the prototype
        </div>
      ) : null}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <Routes>
        <Route path="*" element={<PrototypeApp />} />
      </Routes>
    </BrowserRouter>
  )
}
