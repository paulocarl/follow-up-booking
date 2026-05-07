import { useEffect, useState } from 'react'
import styles from './SiteFooter.module.css'
import {
  FOOTER_COPYRIGHT_LINES,
  FOOTER_MAIN_LINKS,
  FOOTER_POLICY_LINKS,
  FOOTER_US_STATES,
  splitIntoColumns,
} from './siteFooterData'

const MQ_WIDE_STATES = '(min-width: 1024px)'

function initialStateColumns(): 2 | 4 {
  if (typeof window === 'undefined') return 2
  return window.matchMedia(MQ_WIDE_STATES).matches ? 4 : 2
}

export function SiteFooter() {
  const [stateColumns, setStateColumns] = useState<2 | 4>(initialStateColumns)

  useEffect(() => {
    const mq = window.matchMedia(MQ_WIDE_STATES)
    const sync = () => setStateColumns(mq.matches ? 4 : 2)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const stateCols = splitIntoColumns(FOOTER_US_STATES, stateColumns)

  return (
    <footer className={styles.siteFooter} aria-label="Site footer">
      <div className={styles.siteFooterInner}>
        <div className={styles.footerBody}>
          <nav className={styles.mainNav} aria-label="Footer">
            <ul className={styles.mainNavList}>
              {FOOTER_MAIN_LINKS.map((link) => (
                <li key={link.label}>
                  <a className={styles.mainNavLink} href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.footerBodyMain}>
            <div className={styles.stateGrid} role="presentation">
              {stateCols.map((col, colIdx) => (
                <ul key={colIdx} className={styles.stateColumn}>
                  {col.map((name) => (
                    <li key={name}>
                      <a className={styles.stateLink} href="#">
                        {name}
                      </a>
                    </li>
                  ))}
                </ul>
              ))}
            </div>

            <div className={styles.policyBlock}>
              <ul className={styles.policyGrid}>
                {FOOTER_POLICY_LINKS.map((link) => (
                  <li key={link.label}>
                    <a className={styles.policyLink} href={link.href}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className={styles.finePrint}>
                <p className={styles.crisisCopy}>
                  If you or someone you know is experiencing an emergency or crisis, call{' '}
                  <a className={styles.inlineLink} href="tel:988">
                    988
                  </a>{' '}
                  (the Suicide &amp; Crisis Lifeline), call{' '}
                  <a className={styles.inlineLink} href="tel:911">
                    911
                  </a>
                  , or go to the nearest emergency room. Additional resources can be found{' '}
                  <a className={styles.inlineLink} href="#">
                    here
                  </a>
                  .
                </p>
                <div className={styles.copyrightRow}>
                  {FOOTER_COPYRIGHT_LINES.map((line) => (
                    <span key={line} className={styles.copyrightItem}>
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.wordmarkWrap}>
          <div className={styles.wordmarkFlip}>
            <img
              className={styles.wordmark}
              src={`${import.meta.env.BASE_URL}assets/grow-logo.svg`}
              alt="Grow Therapy"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
