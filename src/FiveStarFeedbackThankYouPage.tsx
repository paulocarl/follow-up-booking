import gsap from 'gsap'
import { useLayoutEffect, useRef } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'
import { readHandoffPageMinHeightPx } from './sessionPageHandoff'
import styles from './FiveStarFeedbackThankYouPage.module.css'

const PROVIDER_FIRST = 'Anita'
const FOLLOW_UP_DATE = 'May 27'

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type FiveStarFeedbackThankYouPageProps = {
  onLogoHome: () => void
}

export function FiveStarFeedbackThankYouPage({ onLogoHome }: FiveStarFeedbackThankYouPageProps) {
  const entranceRootRef = useRef<HTMLDivElement>(null)
  const [handoffMinHeightPx] = useState(() => readHandoffPageMinHeightPx())

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const root = entranceRootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const items = root.querySelectorAll<HTMLElement>('[data-confirm-reveal]')
      gsap.set(items, { autoAlpha: 0, y: 32 })
      gsap.to(items, {
        autoAlpha: 1,
        y: 0,
        duration: 0.62,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'opacity,visibility,transform',
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div
      className={styles.page}
      ref={entranceRootRef}
      style={handoffMinHeightPx != null ? { minHeight: handoffMinHeightPx } : undefined}
    >
      <div className={styles.shell}>
        <nav aria-label="Site" className={styles.nav}>
          <button
            type="button"
            className={styles.logoLink}
            aria-label="Grow Therapy home"
            onClick={onLogoHome}
          >
            <img
              className={styles.logo}
              src={`${import.meta.env.BASE_URL}assets/grow-logo.svg`}
              width={63}
              height={32}
              alt=""
            />
          </button>
        </nav>

        <main className={styles.main}>
          <div className={styles.layout}>
            <header className={styles.introCol} data-confirm-reveal>
              <h1 className={styles.headline}>Thank you for your feedback!</h1>
              <p className={styles.subline}>
                You have a follow-up appointment with {PROVIDER_FIRST} on {FOLLOW_UP_DATE}
              </p>
              <button
                type="button"
                className={styles.portalCta}
                data-prototype-placeholder
              >
                Go to your portal
              </button>
            </header>

            <div className={styles.actionsCol} data-confirm-reveal>
              <div className={styles.actionCard}>
                <div className={styles.actionRow}>
                  <div className={styles.actionText}>
                    <p className={styles.actionTitle}>Add another follow-up</p>
                    <p className={styles.actionDesc}>Book an additional appointment anytime</p>
                  </div>
                  <Link className={styles.btnPrimary} to="#">
                    Schedule additional appointment
                  </Link>
                </div>
                <div className={styles.actionRow}>
                  <div className={styles.actionText}>
                    <p className={styles.actionTitle}>Reschedule your appointment</p>
                    <p className={styles.actionDesc}>
                      Change the date or time of your upcoming appointment with your provider
                    </p>
                  </div>
                  <Link className={styles.btnSecondary} to="#">
                    Reschedule follow-up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <SiteFooter />
    </div>
  )
}
