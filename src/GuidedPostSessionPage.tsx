import { useRef } from 'react'
import sessionStyles from './SessionCompletePage.module.css'
import { SiteFooter } from './SiteFooter'
import guidedStyles from './GuidedFlow.module.css'
import { useEntranceReveal } from './useEntranceReveal'

export type GuidedPostSessionPageProps = {
  onFeelGood: () => void
  onNotSure: () => void
  onDidNotFeelRight: () => void
}

export function GuidedPostSessionPage({
  onFeelGood,
  onNotSure,
  onDidNotFeelRight,
}: GuidedPostSessionPageProps) {
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
            <div className={guidedStyles.guidedLeftColumn} data-confirm-reveal>
              <header>
                <h1 className={sessionStyles.display}>Your session is complete</h1>
              </header>
              <div className={sessionStyles.rejoinRow}>
                <span className={sessionStyles.mutedSmall}>Appointment not over yet?</span>
                <a className={sessionStyles.rejoinLink} href="#">
                  Rejoin waiting room
                </a>
              </div>
            </div>

            <section
              className={guidedStyles.guidedChoices}
              aria-labelledby="guided-session-feel-heading"
              role="group"
            >
              <p id="guided-session-feel-heading" className={guidedStyles.guidedQuestion} data-confirm-reveal>
                How did your session feel for you?
              </p>
              <div className={guidedStyles.guidedOptionStack} data-confirm-reveal>
                <button type="button" className={guidedStyles.guidedOption} onClick={onFeelGood}>
                  I feel good about how it went
                </button>
                <button type="button" className={guidedStyles.guidedOption} onClick={onNotSure}>
                  I&apos;m not sure how I feel yet
                </button>
                <button type="button" className={guidedStyles.guidedOption} onClick={onDidNotFeelRight}>
                  It didn&apos;t feel quite right
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
      <SiteFooter />
    </div>
  )
}
