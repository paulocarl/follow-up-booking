import { useRef } from 'react'
import sessionStyles from './SessionCompletePage.module.css'
import { SiteFooter } from './SiteFooter'
import guidedStyles from './GuidedFlow.module.css'
import { useEntranceReveal } from './useEntranceReveal'

export type GuidedNotSurePageProps = {
  onAnotherSession: () => void
  onExploreProviders: () => void
  onDecideLater: () => void
}

export function GuidedNotSurePage({
  onAnotherSession,
  onExploreProviders,
  onDecideLater,
}: GuidedNotSurePageProps) {
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
            <div className={guidedStyles.guidedIntroStack}>
              <h1
                className={`${sessionStyles.display} ${guidedStyles.guidedChooseHeading}`}
                data-confirm-reveal
              >
                Choose what feels
                <br />
                right for now
              </h1>
              <p className={guidedStyles.guidedIntroLine} data-confirm-reveal>
                It&apos;s okay to be unsure. We&apos;ll help you find a next step that feels right for you.
              </p>
            </div>

            <section
              className={guidedStyles.guidedChoices}
              aria-labelledby="guided-next-step-heading"
              role="group"
            >
              <span id="guided-next-step-heading" className={sessionStyles.srOnly}>
                Next step options
              </span>
              <div className={guidedStyles.guidedOptionStack} data-confirm-reveal>
                <button type="button" className={guidedStyles.guidedOption} onClick={onAnotherSession}>
                  I&apos;d like to give it another session to see how it feels
                </button>
                <button type="button" className={guidedStyles.guidedOption} onClick={onExploreProviders}>
                  I want to explore other providers before deciding
                </button>
                <button type="button" className={guidedStyles.guidedOption} onClick={onDecideLater}>
                  I&apos;ll take more time and decide later
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
