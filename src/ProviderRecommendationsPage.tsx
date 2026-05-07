import gsap from 'gsap'
import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'
import styles from './ProviderRecommendationsPage.module.css'

const PREVIOUS_PROVIDER_NAME = 'Anita Rollins'

const prAsset = (filename: string) =>
  `${import.meta.env.BASE_URL}assets/provider-recommendations/${filename}`

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type RecommendedProvider = {
  id: string
  name: string
  credentialLine: string
  ratingLabel: string
  photoUrl: string
  highlightTags: readonly string[]
  specialtyTags: readonly string[]
}

const RECOMMENDED_PROVIDERS: readonly RecommendedProvider[] = [
  {
    id: '1',
    name: 'Jamie Wanen',
    credentialLine: 'LMFT, 7 years of experience',
    ratingLabel: '4.6 (230)',
    photoUrl: prAsset('jamie-wanen-avatar.png'),
    highlightTags: ['Frequently rebooked', 'Solution oriented', 'Open-minded', 'Authentic'],
    specialtyTags: ['Authentic', 'Depression'],
  },
  {
    id: '2',
    name: 'Fred Thomas',
    credentialLine: 'LMFT, 7 years of experience',
    ratingLabel: '4.6 (230)',
    photoUrl: prAsset('fred-thomas-avatar.png'),
    highlightTags: ['Frequently rebooked', 'Solution oriented', 'Open-minded', 'Authentic'],
    specialtyTags: ['Authentic', 'Depression'],
  },
]

function RatingBlock({ label }: { label: string }) {
  return (
    <div className={styles.ratingRow}>
      <i className={`fa-solid fa-star ${styles.ratingStar}`} aria-hidden />
      <span>{label}</span>
    </div>
  )
}

function ProviderCard({ provider }: { provider: RecommendedProvider }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardLeft}>
        <div className={styles.avatar}>
          <img
            className={styles.avatarImg}
            src={provider.photoUrl}
            width={132}
            height={132}
            alt=""
          />
        </div>
        <div className={styles.ratingUnderPhoto}>
          <RatingBlock label={provider.ratingLabel} />
        </div>
        <div className={styles.cardHeaderMobile}>
          <h2 className={styles.providerName}>{provider.name}</h2>
          <p className={styles.providerMeta}>{provider.credentialLine}</p>
          <RatingBlock label={provider.ratingLabel} />
        </div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardBodyTop}>
          <div className={styles.cardHeaderDesktop}>
            <h2 className={styles.providerName}>{provider.name}</h2>
            <p className={styles.providerMeta}>{provider.credentialLine}</p>
          </div>
          <div className={styles.tagRow}>
            {provider.highlightTags.map((t) => (
              <span key={t} className={styles.tag}>
                {t}
              </span>
            ))}
          </div>
          <div className={styles.specialtiesBlock}>
            <p className={styles.specialtiesHeading}>Specialities</p>
            <div className={styles.tagRowLoose}>
              {provider.specialtyTags.map((t) => (
                <span key={t} className={styles.tag}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.availabilityStack}>
            <div className={styles.availabilityRow}>
              <i className="fa-solid fa-location-dot" aria-hidden />
              <span>Offers in-person in Bloomfield, 2.3 mi away</span>
            </div>
            <div className={styles.availabilityRow}>
              <i className="fa-regular fa-calendar-days" aria-hidden />
              <span>Next available on Fri, Mar 7</span>
            </div>
          </div>
        </div>
        <div className={styles.cardActions}>
          <Link className={styles.btnSecondary} to="#">
            View profile
          </Link>
          <Link className={styles.btnPrimary} to="#">
            Book session
          </Link>
        </div>
      </div>
    </article>
  )
}

export function ProviderRecommendationsPage() {
  const entranceRootRef = useRef<HTMLDivElement>(null)

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
    <div className={styles.page} ref={entranceRootRef}>
      <div className={styles.shell}>
        <nav aria-label="Site" className={styles.nav}>
          <Link to="/" className={styles.logoLink}>
            <span className={styles.visuallyHidden}>Grow Therapy home</span>
            <img
              className={styles.logo}
              src={`${import.meta.env.BASE_URL}assets/grow-logo.svg`}
              width={63}
              height={32}
              alt=""
            />
          </Link>
        </nav>

        <main className={styles.main}>
          <div className={styles.layout}>
            <header className={styles.introCol} data-confirm-reveal>
              <h1 className={styles.headline}>Thank you for your feedback!</h1>
              <div className={styles.introCopyBlock}>
                <p className={styles.bodyCopy}>
                  It looks like your experience with {PREVIOUS_PROVIDER_NAME} wasn&apos;t the right
                  fit. Based on your details, here are other providers that may be a better match
                  for you.
                </p>
                <Link className={styles.returnToPortal} to="#">
                  Return to portal
                </Link>
              </div>
            </header>

            <div className={styles.cardsCol} data-confirm-reveal>
              {RECOMMENDED_PROVIDERS.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}

              <div className={styles.moreWrap}>
                <Link className={styles.btnMore} to="#">
                  See more providers
                </Link>
                <div className={styles.supportBlock}>
                  <p className={styles.supportLead}>
                    For real time support in finding the right provider, our team is here to help
                  </p>
                  <p className={styles.supportSub}>Call us at (929) 661-9780</p>
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
