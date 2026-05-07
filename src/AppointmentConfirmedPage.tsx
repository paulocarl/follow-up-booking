import gsap from 'gsap'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'
import { readHandoffPageMinHeightPx } from './sessionPageHandoff'
import styles from './AppointmentConfirmedPage.module.css'

const PROVIDER_NAME = 'Anita Rollins'

const LOW_RATING_MAX = 3
const HIGH_RATING_MIN = 4

const QUALITY_IMPROVEMENT_OPTIONS = [
  { id: 'audio' as const, label: 'Audio' },
  { id: 'video' as const, label: 'Video' },
  { id: 'other' as const, label: 'Something else' },
]

type QualityIssueId = (typeof QUALITY_IMPROVEMENT_OPTIONS)[number]['id']

const THERAPY_STYLE_TAGS = [
  'Empowering',
  'Authentic',
  'Humorous',
  'Solution oriented',
  'Direct',
  'Open-minded',
  'Holistic',
  'Warm',
  'Intelligent',
  'Challenging',
] as const

const asset = (name: string) =>
  `${import.meta.env.BASE_URL}assets/appointment-confirmed/${name}`

const SUBMITTING_HOLD_MS = 3000
const REVIEW_THANK_YOU_HOLD_MS = 3000
const SUBMIT_OVERLAY_FADE_S = 0.48
const SUBMIT_TRANSITION_HOLD_MS = 1280

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export type AppointmentConfirmedVariant =
  /** After booking flow — headline + provider card + portal + feedback */
  | 'appointmentConfirmed'
  /** Prototype entry: same shell as appointment confirmed, session-complete headline, no provider row */
  | 'sessionCompleteFollowUpBooked'

type AppointmentConfirmedPageProps = {
  variant?: AppointmentConfirmedVariant
}

export function AppointmentConfirmedPage({
  variant = 'appointmentConfirmed',
}: AppointmentConfirmedPageProps = {}) {
  const navigate = useNavigate()
  const [rating, setRating] = useState(0)
  const [starHover, setStarHover] = useState<number | null>(null)
  const [quality, setQuality] = useState<'up' | 'down' | null>(null)
  const [qualityIssues, setQualityIssues] = useState<Record<QualityIssueId, boolean>>({
    audio: false,
    video: false,
    other: false,
  })
  const [reviewNote, setReviewNote] = useState('')
  const [consentPublicReview, setConsentPublicReview] = useState(false)
  const [consentShareWithProvider, setConsentShareWithProvider] = useState(false)
  const [selectedTherapyStyleTags, setSelectedTherapyStyleTags] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const [handoffMinHeightPx] = useState(() => readHandoffPageMinHeightPx())
  const [submitPhase, setSubmitPhase] = useState<
    'idle' | 'submitting' | 'transitioning' | 'thankYou' | 'dismissed'
  >('idle')

  const entranceRootRef = useRef<HTMLDivElement>(null)
  const submitOverlayRef = useRef<HTMLDivElement>(null)
  const ratingBlockRef = useRef<HTMLDivElement>(null)
  const submittingLabelRef = useRef<HTMLSpanElement>(null)
  const thankYouRowRef = useRef<HTMLDivElement>(null)
  const qualityThankYouRowRef = useRef<HTMLDivElement>(null)
  const submittingHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const submitTransitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reviewThankYouHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeStarCount = starHover ?? rating
  const isLowRatingTrack = rating > 0 && rating <= LOW_RATING_MAX
  const isHighRatingTrack = rating >= HIGH_RATING_MIN
  const reviewFormBusy = submitPhase === 'submitting' || submitPhase === 'transitioning'
  const showLowRatingFollowUp =
    (submitPhase === 'idle' || submitPhase === 'submitting') && isLowRatingTrack
  const showHighRatingFollowUp =
    (submitPhase === 'idle' || submitPhase === 'submitting') && isHighRatingTrack
  const ratingSectionDismissed = submitPhase === 'dismissed'
  const isSessionCompleteFollowUpBooked = variant === 'sessionCompleteFollowUpBooked'
  const lowReviewFollowUpBooked = isSessionCompleteFollowUpBooked && isLowRatingTrack
  const fiveStarFollowUpBooked = isSessionCompleteFollowUpBooked && rating === 5
  const submitNavigatesToNextPage = lowReviewFollowUpBooked || fiveStarFollowUpBooked
  const submitTransitionTargetPath = lowReviewFollowUpBooked
    ? '/provider-recommendations'
    : fiveStarFollowUpBooked
      ? '/follow-up-booked-high-feedback'
      : null
  const showSubmitTransitionOverlay = submitPhase === 'transitioning' && submitNavigatesToNextPage

  useEffect(() => {
    if (quality !== 'down') {
      setQualityIssues({ audio: false, video: false, other: false })
    }
  }, [quality])

  const toggleQualityIssue = (id: QualityIssueId) => {
    setQualityIssues((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleQualityImprovementSubmit = () => {
    // Prototype — wire to analytics or API later (read qualityIssues before state changes)
    setQuality('up')
  }

  const toggleTherapyStyleTag = (tag: string) => {
    setSelectedTherapyStyleTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  const handleSubmitReview = () => {
    if (submitPhase !== 'idle') return
    const hasFollowUp =
      (rating > 0 && rating <= LOW_RATING_MAX) || rating >= HIGH_RATING_MIN
    if (!hasFollowUp) return
    setSubmitPhase('submitting')
  }

  const reviewSubmitButton = (
    <button
      type="button"
      className={[
        styles.lowRatingSubmit,
        reviewFormBusy ? styles.lowRatingSubmitBusy : '',
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={reviewFormBusy}
      aria-busy={reviewFormBusy}
      onClick={handleSubmitReview}
    >
      {reviewFormBusy ? (
        <>
          <span className={styles.submitButtonSpinner} aria-hidden />
          <span ref={submittingLabelRef} className={styles.submitButtonBusyLabel}>
            Submitting…
          </span>
        </>
      ) : (
        'Submit review'
      )}
    </button>
  )

  useLayoutEffect(() => {
    if (submitPhase !== 'submitting') return
    if (prefersReducedMotion()) return
    const label = submittingLabelRef.current
    if (!label) return
    gsap.fromTo(
      label,
      { autoAlpha: 0, x: -8 },
      { autoAlpha: 1, x: 0, duration: 0.34, ease: 'power2.out' },
    )
  }, [submitPhase])

  useLayoutEffect(() => {
    if (!showSubmitTransitionOverlay) return
    const overlayEl = submitOverlayRef.current
    if (prefersReducedMotion()) {
      if (overlayEl) gsap.set(overlayEl, { autoAlpha: 1 })
      return
    }
    if (overlayEl) {
      gsap.fromTo(
        overlayEl,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: SUBMIT_OVERLAY_FADE_S,
          ease: 'power2.out',
        },
      )
    }
    return () => {
      if (overlayEl) gsap.killTweensOf(overlayEl)
    }
  }, [showSubmitTransitionOverlay])

  useEffect(() => {
    if (submitPhase !== 'submitting') return

    submittingHoldTimerRef.current = window.setTimeout(() => {
      submittingHoldTimerRef.current = null
      if (submitNavigatesToNextPage) {
        setSubmitPhase('transitioning')
        return
      }
      setSubmitPhase('thankYou')
    }, SUBMITTING_HOLD_MS)

    return () => {
      if (submittingHoldTimerRef.current != null) {
        clearTimeout(submittingHoldTimerRef.current)
        submittingHoldTimerRef.current = null
      }
      const lab = submittingLabelRef.current
      if (lab) gsap.killTweensOf(lab)
    }
  }, [submitPhase, submitNavigatesToNextPage])

  useEffect(() => {
    if (submitPhase !== 'transitioning') return
    if (!submitTransitionTargetPath) return

    submitTransitionTimerRef.current = window.setTimeout(() => {
      submitTransitionTimerRef.current = null
      navigate(submitTransitionTargetPath)
    }, SUBMIT_TRANSITION_HOLD_MS)

    return () => {
      if (submitTransitionTimerRef.current != null) {
        clearTimeout(submitTransitionTimerRef.current)
        submitTransitionTimerRef.current = null
      }
    }
  }, [submitPhase, submitTransitionTargetPath, navigate])

  useEffect(() => {
    return () => {
      const overlay = submitOverlayRef.current
      if (overlay) gsap.killTweensOf(overlay)
      if (submitTransitionTimerRef.current != null) {
        clearTimeout(submitTransitionTimerRef.current)
        submitTransitionTimerRef.current = null
      }
    }
  }, [])

  useLayoutEffect(() => {
    if (submitPhase !== 'thankYou') return
    if (prefersReducedMotion()) return
    const el = thankYouRowRef.current
    if (!el) return
    gsap.killTweensOf(el)
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 16, scale: 0.985 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' },
    )
    return () => {
      gsap.killTweensOf(el)
    }
  }, [submitPhase])

  useEffect(() => {
    if (submitPhase !== 'thankYou') return

    reviewThankYouHoldTimerRef.current = window.setTimeout(() => {
      reviewThankYouHoldTimerRef.current = null
      const el = ratingBlockRef.current
      if (!el) {
        setSubmitPhase('dismissed')
        return
      }

      if (prefersReducedMotion()) {
        setSubmitPhase('dismissed')
        return
      }

      const h = el.getBoundingClientRect().height
      gsap.set(el, { height: h, overflow: 'hidden' })
      gsap.to(el, {
        height: 0,
        opacity: 0,
        marginTop: 0,
        marginBottom: 0,
        y: -10,
        duration: 0.62,
        ease: 'power3.inOut',
        onComplete: () => {
          gsap.killTweensOf(el)
          setSubmitPhase('dismissed')
        },
      })
    }, REVIEW_THANK_YOU_HOLD_MS)

    return () => {
      if (reviewThankYouHoldTimerRef.current != null) {
        clearTimeout(reviewThankYouHoldTimerRef.current)
        reviewThankYouHoldTimerRef.current = null
      }
      const elCleanup = ratingBlockRef.current
      if (elCleanup) gsap.killTweensOf(elCleanup)
    }
  }, [submitPhase])

  useLayoutEffect(() => {
    if (quality !== 'up') return
    if (prefersReducedMotion()) return
    const el = qualityThankYouRowRef.current
    if (!el) return
    gsap.killTweensOf(el)
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 16, scale: 0.985 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' },
    )
    return () => {
      gsap.killTweensOf(el)
    }
  }, [quality])

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
          <Link
            to="/"
            className={[
              styles.logoLink,
              showSubmitTransitionOverlay ? styles.logoLinkHiddenDuringOverlay : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
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
          <div
            className={[styles.layout, showSubmitTransitionOverlay ? styles.bookingLocked : '']
              .filter(Boolean)
              .join(' ')}
          >
            <div className={styles.confirmCol}>
              <h1 className={styles.display} data-confirm-reveal>
                {isSessionCompleteFollowUpBooked
                  ? 'Your session is complete'
                  : 'Appointment confirmed!'}
              </h1>

              {!isSessionCompleteFollowUpBooked ? (
                <div className={styles.providerBlock} data-confirm-reveal>
                  <div className={styles.avatar}>
                    <img
                      className={styles.avatarImg}
                      src={asset('anita-rollins-avatar.png')}
                      width={48}
                      height={48}
                      alt=""
                    />
                  </div>
                  <div className={styles.providerMeta}>
                    <p className={styles.providerName}>{PROVIDER_NAME}</p>
                    <div className={styles.providerDetails}>
                      <span className={styles.sessionWhen}>February 28, 10:00 AM EST</span>
                      <span className={styles.pill}>Virtual</span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className={styles.confirmLeadCtaStack}>
                <p className={styles.bodyLead} data-confirm-reveal>
                  Message your provider, cancel &amp; reschedule appointments, manage billing and more
                </p>

                <Link className={styles.portalCta} to="#" data-confirm-reveal>
                  Go to your portal
                </Link>
              </div>
            </div>

            <div className={styles.feedbackColumn}>
              <aside
                className={styles.feedbackCard}
                aria-label="Session feedback"
                data-confirm-reveal
              >
              <div className={styles.feedbackNest}>
                {!ratingSectionDismissed ? (
                  <div ref={ratingBlockRef} className={styles.ratingSectionRoot}>
                    <div
                      className={[styles.feedbackNestSection, styles.feedbackNestSectionRated].join(
                        ' ',
                      )}
                    >
                      {submitPhase === 'thankYou' ? (
                        <div
                          ref={thankYouRowRef}
                          className={styles.feedbackThankYouRow}
                          role="status"
                          aria-live="polite"
                        >
                          <span className={styles.feedbackThankYouIconBadge} aria-hidden>
                            <i className={`fa-solid fa-check ${styles.feedbackThankYouCheck}`} />
                          </span>
                          <p className={styles.feedbackThankYouText}>
                            Thank you for your feedback!
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className={styles.feedbackNestQuestion} id="rating-q">
                            How would you rate {PROVIDER_NAME}?
                          </p>
                          <div
                            className={styles.stars}
                            role="group"
                            aria-labelledby="rating-q"
                            onMouseLeave={() => setStarHover(null)}
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                className={styles.starBtn}
                                aria-label={`Rate ${n} out of 5`}
                                onMouseEnter={() => setStarHover(n)}
                                onClick={() => {
                                  setRating(n)
                                  setStarHover(null)
                                }}
                              >
                                <img
                                  className={styles.starImg}
                                  src={
                                    n <= activeStarCount
                                      ? asset('star-filled.svg')
                                      : asset('star-empty.svg')
                                  }
                                  width={48}
                                  height={48}
                                  alt=""
                                />
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                  {showLowRatingFollowUp ? (
                    <div className={styles.lowRatingFollowUp} aria-live="polite">
                      <div className={styles.lowRatingBanner}>
                        <p className={styles.lowRatingBannerText}>
                          We&apos;d love to know how we could improve your experience.
                        </p>
                      </div>

                      <div className={styles.lowRatingField}>
                        <label className={styles.lowRatingLabel} htmlFor="low-rating-review">
                          Please leave a review for {PROVIDER_NAME} (Optional)
                        </label>
                        <textarea
                          id="low-rating-review"
                          className={styles.lowRatingTextarea}
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          rows={5}
                          placeholder="Consider sharing what brought you to this provider, what stood out about their personality, how their approach impacted your experience, or anything specific about your session."
                        />
                      </div>

                      <div className={styles.lowRatingConsentStack}>
                        <label className={styles.lowRatingConsentRow}>
                          <input
                            type="checkbox"
                            className={styles.lowRatingCheckbox}
                            checked={consentPublicReview}
                            onChange={(e) => setConsentPublicReview(e.target.checked)}
                          />
                          <span className={styles.lowRatingConsentText}>
                            I agree to make my review public on this provider&apos;s profile.{' '}
                            <a className={styles.lowRatingInlineLink} href="#">
                              Show terms
                            </a>
                          </span>
                        </label>
                        <label className={styles.lowRatingConsentRow}>
                          <input
                            type="checkbox"
                            className={styles.lowRatingCheckbox}
                            checked={consentShareWithProvider}
                            onChange={(e) => setConsentShareWithProvider(e.target.checked)}
                          />
                          <span className={styles.lowRatingConsentText}>
                            I agree to share my feedback with my provider.{' '}
                            <a className={styles.lowRatingInlineLink} href="#">
                              Show terms
                            </a>
                          </span>
                        </label>
                      </div>

                      {reviewSubmitButton}
                    </div>
                  ) : showHighRatingFollowUp ? (
                    <div className={styles.highRatingFollowUp} aria-live="polite">
                      <div className={styles.therapyStyleSection}>
                        <p className={styles.therapyStyleTitle}>
                          What stands out about {PROVIDER_NAME}&apos;s therapy style? (Optional)
                        </p>
                        <div
                          className={styles.therapyStyleTagList}
                          role="group"
                          aria-label="Therapy style"
                        >
                          {THERAPY_STYLE_TAGS.map((tag) => {
                            const selected = selectedTherapyStyleTags.has(tag)
                            return (
                              <button
                                key={tag}
                                type="button"
                                className={[
                                  styles.therapyStyleTag,
                                  selected ? styles.therapyStyleTagSelected : '',
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                                aria-pressed={selected}
                                onClick={() => toggleTherapyStyleTag(tag)}
                              >
                                {tag}
                              </button>
                            )
                          })}
                        </div>
                        <a className={styles.therapyStyleHelpLink} href="#">
                          What does this mean?
                        </a>
                      </div>

                      <div className={styles.lowRatingField}>
                        <label className={styles.highRatingReviewLabel} htmlFor="high-rating-review">
                          Please leave a review for {PROVIDER_NAME} (Optional)
                        </label>
                        <textarea
                          id="high-rating-review"
                          className={styles.lowRatingTextarea}
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          rows={5}
                          placeholder="Consider sharing what brought you to this provider, what stood out about their personality, how their approach impacted your experience, or anything specific about your session."
                        />
                      </div>

                      <div className={styles.lowRatingConsentStack}>
                        <label className={styles.lowRatingConsentRow}>
                          <input
                            type="checkbox"
                            className={styles.lowRatingCheckbox}
                            checked={consentPublicReview}
                            onChange={(e) => setConsentPublicReview(e.target.checked)}
                          />
                          <span className={styles.lowRatingConsentText}>
                            I agree to make my review public on this provider&apos;s profile.{' '}
                            <a className={styles.lowRatingInlineLink} href="#">
                              Show terms
                            </a>
                          </span>
                        </label>
                        <label className={styles.lowRatingConsentRow}>
                          <input
                            type="checkbox"
                            className={styles.lowRatingCheckbox}
                            checked={consentShareWithProvider}
                            onChange={(e) => setConsentShareWithProvider(e.target.checked)}
                          />
                          <span className={styles.lowRatingConsentText}>
                            I agree to share my feedback with my provider.{' '}
                            <a className={styles.lowRatingInlineLink} href="#">
                              Show terms
                            </a>
                          </span>
                        </label>
                      </div>

                      {reviewSubmitButton}
                    </div>
                  ) : null}
                    </div>
                  </div>
                ) : null}

                <div className={styles.feedbackNestSection}>
                  {quality === 'up' ? (
                    <div
                      ref={qualityThankYouRowRef}
                      className={styles.feedbackThankYouRow}
                      role="status"
                      aria-live="polite"
                    >
                      <span className={styles.feedbackThankYouIconBadge} aria-hidden>
                        <i className={`fa-solid fa-check ${styles.feedbackThankYouCheck}`} />
                      </span>
                      <p className={styles.feedbackThankYouText}>
                        Thank you for your feedback!
                      </p>
                    </div>
                  ) : quality === 'down' ? (
                    <div className={styles.qualityDownFollowUp} aria-live="polite">
                      <div className={styles.qualityDownHeader}>
                        <p
                          id="quality-improved-title"
                          className={styles.qualityDownTitle}
                        >
                          What could be improved?
                        </p>
                        <p className={styles.qualityDownHint}>Select all that apply (optional)</p>
                      </div>
                      <div
                        className={styles.qualityIssueList}
                        role="group"
                        aria-labelledby="quality-improved-title"
                      >
                        {QUALITY_IMPROVEMENT_OPTIONS.map((opt) => (
                          <label
                            key={opt.id}
                            className={styles.qualityIssueRow}
                            htmlFor={`quality-issue-${opt.id}`}
                          >
                            <span className={styles.qualityIssueLabel}>{opt.label}</span>
                            <input
                              id={`quality-issue-${opt.id}`}
                              type="checkbox"
                              className={styles.qualityIssueCheckbox}
                              checked={qualityIssues[opt.id]}
                              onChange={() => toggleQualityIssue(opt.id)}
                            />
                          </label>
                        ))}
                      </div>
                      <button
                        type="button"
                        className={styles.lowRatingSubmit}
                        onClick={handleQualityImprovementSubmit}
                      >
                        Submit
                      </button>
                    </div>
                  ) : (
                    <p className={styles.feedbackNestQuestion} id="quality-q">
                      How was the session audio and video quality?
                    </p>
                  )}
                  {quality !== 'down' && quality !== 'up' ? (
                    <div
                      className={styles.thumbs}
                      role="group"
                      aria-labelledby="quality-q"
                    >
                      <button
                        type="button"
                        className={styles.thumbBtn}
                        aria-label="Thumbs down"
                        aria-pressed={false}
                        onClick={() => setQuality((q) => (q === 'down' ? null : 'down'))}
                      >
                        <i className="fa-regular fa-thumbs-down" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className={styles.thumbBtn}
                        aria-label="Thumbs up"
                        aria-pressed={quality === 'up'}
                        onClick={() => setQuality((q) => (q === 'up' ? null : 'up'))}
                      >
                        <i className="fa-regular fa-thumbs-up" aria-hidden />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </aside>

              {isSessionCompleteFollowUpBooked ? (
                <div
                  className={styles.feedbackRejoinBlock}
                  data-confirm-reveal
                  aria-label="Still in appointment"
                >
                  <div className={styles.feedbackRejoinRow}>
                    <span className={styles.feedbackRejoinMuted}>Appointment not over yet?</span>
                    <a className={styles.feedbackRejoinLink} href="#">
                      Rejoin waiting room
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
            {showSubmitTransitionOverlay ? (
              <div
                ref={submitOverlayRef}
                className={styles.bookingOverlay}
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <div className={styles.bookingOverlayPanel}>
                  <img
                    className={styles.bookingOverlayLogo}
                    src={`${import.meta.env.BASE_URL}assets/grow-logo.svg`}
                    width={78}
                    height={40}
                    alt=""
                  />
                  <div className={styles.bookingOverlayDots} aria-hidden>
                    <span className={styles.bookingOverlayDot} />
                    <span className={styles.bookingOverlayDot} />
                    <span className={styles.bookingOverlayDot} />
                  </div>
                </div>
                <span className={styles.srOnly}>Submitting your review, please wait.</span>
              </div>
            ) : null}
          </div>
        </main>
      </div>
      <SiteFooter />
    </div>
  )
}
