import { useCallback, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
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
const PROTOTYPE_TOAST_MS = 2500

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

function AppRoutes() {
  const navigate = useNavigate()
  const [sessionKey, setSessionKey] = useState(0)
  const [followUpDemo, setFollowUpDemo] = useState<FollowUpDemoMode>('noFollowUp')
  const [showPrototypeToast, setShowPrototypeToast] = useState(false)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    navigate('/', { replace: true })
  }

  const homePage =
    followUpDemo === 'noFollowUp' ? (
      <SessionCompletePage key={`${sessionKey}-session`} />
    ) : (
      <AppointmentConfirmedPage
        key={`${sessionKey}-followup-booked`}
        variant="sessionCompleteFollowUpBooked"
      />
    )

  return (
    <>
      <ScrollToTopOnRouteChange />
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
              navigate('/', { replace: true })
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
                // Keep / "F.u booked" home screen content height aligned to current no-follow-up page.
                captureSessionPageHeightForHandoff()
              }
              setFollowUpDemo('alreadyBooked')
              navigate('/', { replace: true })
            }}
          >
            F.u booked
          </button>
        </div>
      </div>
      <div className={styles.routeHost}>
        <Routes>
          <Route path="/" element={homePage} />
          <Route
            path="/appointment-confirmed"
            element={<AppointmentConfirmedPage key={`appt-${sessionKey}`} />}
          />
          <Route
            path="/provider-recommendations"
            element={<ProviderRecommendationsPage key={`rec-${sessionKey}`} />}
          />
          <Route
            path="/follow-up-booked-high-feedback"
            element={<FiveStarFeedbackThankYouPage key={`5star-${sessionKey}`} />}
          />
        </Routes>
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
      <div className={styles.appFrame}>
        <AppRoutes />
      </div>
    </BrowserRouter>
  )
}
