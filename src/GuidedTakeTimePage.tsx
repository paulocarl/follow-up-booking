import { useRef } from 'react'
import sessionStyles from './SessionCompletePage.module.css'
import thankYouStyles from './FiveStarFeedbackThankYouPage.module.css'
import styles from './GuidedTakeTimePage.module.css'
import { SiteFooter } from './SiteFooter'
import guidedStyles from './GuidedFlow.module.css'
import { useEntranceReveal } from './useEntranceReveal'

export function GuidedTakeTimePage() {
  const entranceRootRef = useRef<HTMLDivElement>(null)
  useEntranceReveal(entranceRootRef)

  return (
    <div className={sessionStyles.page} ref={entranceRootRef}>
      <div className={sessionStyles.shell}>
        <nav aria-label="Site" className={sessionStyles.nav}>
          <div className={sessionStyles.logoWrap}>
            <img
              className={sessionStyles.logo}
              src={`${import.meta.env.BASE_URL}assets/grow-logo.svg`}
              width={63}
              height={32}
              alt="Grow Therapy"
            />
          </div>
        </nav>

        <main className={`${sessionStyles.main} ${guidedStyles.guidedMainBottomPad}`}>
          <div className={sessionStyles.layout}>
            <div className={styles.introCol} data-confirm-reveal>
              <h1 className={sessionStyles.display}>
                Take the time <br className={styles.breakBeforeYouNeed} aria-hidden="true" />
                you need
              </h1>
              <p className={styles.introBody}>
                Whether you want to continue or explore other options, you can pick back up whenever
                it feels right for you.
              </p>
            </div>

            <div className={thankYouStyles.actionsCol} data-confirm-reveal>
              <div className={thankYouStyles.actionCard}>
                <div className={thankYouStyles.actionRow}>
                  <div className={thankYouStyles.actionText}>
                    <p className={thankYouStyles.actionTitle}>Unlock more from Grow</p>
                    <p className={thankYouStyles.actionDesc}>
                      Message your provider, manage billing, and more
                    </p>
                  </div>
                  <button
                    type="button"
                    className={thankYouStyles.btnPrimary}
                    data-prototype-placeholder
                  >
                    Go to my Dashboard
                  </button>
                </div>

                <div className={thankYouStyles.actionRow}>
                  <div className={thankYouStyles.actionText}>
                    <p className={thankYouStyles.actionTitle}>Schedule a follow-up</p>
                    <p className={thankYouStyles.actionDesc}>Book an additional appointment anytime</p>
                  </div>
                  <button type="button" className={thankYouStyles.btnSecondary} data-prototype-placeholder>
                    Schedule follow-up
                  </button>
                </div>

                <div className={thankYouStyles.actionRow}>
                  <div className={thankYouStyles.actionText}>
                    <p className={thankYouStyles.actionTitle}>Browse other providers</p>
                    <p className={thankYouStyles.actionDesc}>
                      Discover therapists with different approaches, backgrounds, and expertise to find
                      your best fit.
                    </p>
                  </div>
                  <button type="button" className={thankYouStyles.btnSecondary} data-prototype-placeholder>
                    Browse providers
                  </button>
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
