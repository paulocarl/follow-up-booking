import gsap from 'gsap'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'
import { captureSessionPageHeightForHandoff } from './sessionPageHandoff'
import styles from './SessionCompletePage.module.css'

type DateChoice = {
  weekday: string
  monthDay: string
  /** Appointment-style slots offered that day (EDT demo). */
  slots: readonly string[]
}

const DATE_OPTIONS: DateChoice[] = [
  {
    weekday: 'Mon',
    monthDay: 'May 21',
    slots: ['9:00 AM', '10:45 AM', '12:30 PM', '3:15 PM', '5:45 PM'],
  },
  {
    weekday: 'Thu',
    monthDay: 'May 24',
    slots: ['9:00 AM', '4:45 PM'],
  },
  {
    weekday: 'Fri',
    monthDay: 'May 25',
    slots: ['8:30 AM', '10:00 AM', '12:45 PM', '2:45 PM', '4:45 PM'],
  },
  {
    weekday: 'Sat',
    monthDay: 'June 1',
    slots: ['9:00 AM', '10:15 AM', '11:30 AM', '1:30 PM', '3:15 PM'],
  },
  {
    weekday: 'Sun',
    monthDay: 'June 3',
    slots: ['11:00 AM', '12:30 PM', '2:00 PM', '5:45 PM'],
  },
  {
    weekday: 'Tue',
    monthDay: 'June 5',
    slots: ['8:15 AM', '9:45 AM', '11:15 AM', '1:15 PM', '3:45 PM', '6:15 PM'],
  },
  {
    weekday: 'Thu',
    monthDay: 'June 7',
    slots: ['2:00 PM', '7:15 PM'],
  },
  {
    weekday: 'Mon',
    monthDay: 'June 10',
    slots: ['10:45 AM', '12:45 PM', '3:00 PM', '4:15 PM', '5:45 PM', '8:15 PM'],
  },
  {
    weekday: 'Wed',
    monthDay: 'June 12',
    slots: ['9:30 AM', '3:45 PM'],
  },
  {
    weekday: 'Fri',
    monthDay: 'June 14',
    slots: ['9:45 AM', '11:30 AM', '1:30 PM', '3:45 PM', '5:30 PM'],
  },
]

const DESKTOP_DATES_VISIBLE = 6

const desktopWindowMaxStart = Math.max(0, DATE_OPTIONS.length - DESKTOP_DATES_VISIBLE)

/** Mock network + server time before the confirmation screen. */
const BOOKING_DELAY_MS = 1280
const BOOKING_BUTTON_HOLD_MS = 1500
const BOOKING_OVERLAY_FADE_S = 0.48

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function SessionCompletePage() {
  const navigate = useNavigate()
  const bookingOverlayRef = useRef<HTMLDivElement>(null)
  const navLogoRef = useRef<HTMLDivElement>(null)

  const [selectedDateIdx, setSelectedDateIdx] = useState(0)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [desktopDateWindowStart, setDesktopDateWindowStart] = useState(0)
  const [isBooking, setIsBooking] = useState(false)
  const [isBookingTransitioning, setIsBookingTransitioning] = useState(false)

  const desktopDatesShown = DATE_OPTIONS.slice(
    desktopDateWindowStart,
    desktopDateWindowStart + DESKTOP_DATES_VISIBLE,
  )

  const canPrevDates = desktopDateWindowStart > 0
  const canNextDates = desktopDateWindowStart < desktopWindowMaxStart

  useEffect(() => {
    setDesktopDateWindowStart((start) => {
      if (selectedDateIdx < start) {
        return Math.max(0, selectedDateIdx)
      }
      if (selectedDateIdx >= start + DESKTOP_DATES_VISIBLE) {
        return Math.min(desktopWindowMaxStart, selectedDateIdx - DESKTOP_DATES_VISIBLE + 1)
      }
      return start
    })
  }, [selectedDateIdx])

  const shiftDesktopDates = (delta: number) => {
    setDesktopDateWindowStart((s) =>
      Math.min(desktopWindowMaxStart, Math.max(0, s + delta)),
    )
  }

  const slotsForSelectedDay = DATE_OPTIONS[selectedDateIdx].slots

  useEffect(() => {
    const slots = DATE_OPTIONS[selectedDateIdx].slots
    setSelectedTime((prev) => (prev && slots.includes(prev) ? prev : null))
  }, [selectedDateIdx])

  useEffect(() => {
    return () => {
      const o = bookingOverlayRef.current
      const logo = navLogoRef.current
      if (o) gsap.killTweensOf(o)
      if (logo) gsap.killTweensOf(logo)
    }
  }, [])

  const handleBookSession = useCallback(async () => {
    if (isBooking) return

    setIsBooking(true)
    await new Promise((r) => setTimeout(r, BOOKING_BUTTON_HOLD_MS))
    setIsBookingTransitioning(true)

    await new Promise<void>((r) => requestAnimationFrame(() => r()))
    await new Promise<void>((r) => requestAnimationFrame(() => r()))

    const overlayEl = bookingOverlayRef.current

    const logoEl = navLogoRef.current

    if (prefersReducedMotion()) {
      if (overlayEl) gsap.set(overlayEl, { autoAlpha: 1 })
      if (logoEl) gsap.set(logoEl, { autoAlpha: 0 })
      await new Promise((r) => setTimeout(r, 420))
      captureSessionPageHeightForHandoff()
      navigate('/appointment-confirmed')
      return
    }

    if (logoEl) {
      gsap.to(logoEl, {
        autoAlpha: 0,
        duration: BOOKING_OVERLAY_FADE_S * 0.75,
        ease: 'power2.out',
      })
    }

    if (overlayEl) {
      gsap.fromTo(
        overlayEl,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: BOOKING_OVERLAY_FADE_S,
          ease: 'power2.out',
        },
      )
    }

    await new Promise((r) => setTimeout(r, BOOKING_DELAY_MS))
    captureSessionPageHeightForHandoff()
    navigate('/appointment-confirmed')
  }, [isBooking, navigate])

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <nav aria-label="Site" className={styles.nav}>
          <div ref={navLogoRef} className={styles.logoWrap}>
            <img
              className={styles.logo}
              src={`${import.meta.env.BASE_URL}assets/grow-logo.svg`}
              width={63}
              height={32}
              alt="Grow Therapy"
            />
          </div>
        </nav>

        <main className={styles.main}>
        <div className={styles.layout}>
          <div className={styles.leftStack}>
            <header className={styles.hero}>
              <h1 className={styles.display}>Your session is complete</h1>
            </header>
            <p className={styles.intro}>
              You and Anita don’t have a next session booked — schedule your next session.
            </p>
          </div>

          <section
            className={[styles.booking, isBooking ? styles.bookingLocked : ''].join(' ')}
            aria-label="Book a follow-up"
            aria-busy={isBooking}
          >
            <div className={styles.bookingInner}>
              <div className={styles.dayPickerHeader}>
                <h2 id="followup-days" className={styles.dayPickerMobileTitle}>
                  Select an available day for your follow-up
                </h2>

                <div className={styles.dayPickerDesktopRow}>
                  <h2 id="followup-days-desktop" className={styles.dayPickerGrow}>
                    Select an available day for your follow-up
                  </h2>
                  <div className={styles.carousel}>
                    <button
                      type="button"
                      className={styles.iconButton}
                      aria-label="Previous dates"
                      disabled={!canPrevDates}
                      onClick={() => shiftDesktopDates(-DESKTOP_DATES_VISIBLE)}
                    >
                      <i aria-hidden className={`fa-solid fa-chevron-left ${styles.faIcon}`} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconButton}
                      aria-label="Next dates"
                      disabled={!canNextDates}
                      onClick={() => shiftDesktopDates(DESKTOP_DATES_VISIBLE)}
                    >
                      <i aria-hidden className={`fa-solid fa-chevron-right ${styles.faIcon}`} />
                    </button>
                  </div>
                </div>
              </div>

              <DatesMobile
                options={DATE_OPTIONS}
                selectedIdx={selectedDateIdx}
                onSelect={setSelectedDateIdx}
              />

              <DatesDesktop
                options={desktopDatesShown}
                windowStart={desktopDateWindowStart}
                selectedIdx={selectedDateIdx}
                onSelect={setSelectedDateIdx}
              />
            </div>

            <section className={styles.timesBlock} aria-labelledby="times-heading">
              <div className={styles.timesHeadingRow}>
                <h3 id="times-heading" className={styles.timesTitle}>
                  Times available
                </h3>
                <p className={[styles.timesHeadingNote, styles.mutedSmaller].join(' ')}>
                  45 minute sessions in EDT Timezone
                </p>
              </div>

              <div className={styles.timeSectionMobile}>
                <TimeGrid slots={slotsForSelectedDay} selected={selectedTime} onSelect={setSelectedTime} />
              </div>
              <div className={styles.timeSectionDesktop}>
                <TimeGrid slots={slotsForSelectedDay} selected={selectedTime} onSelect={setSelectedTime} />
              </div>
            </section>

            <section className={styles.actions} aria-label="Finalize booking">
              <button
                type="button"
                className={[
                  styles.primaryCta,
                  isBooking ? styles.primaryCtaBusy : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={isBooking}
                aria-busy={isBooking}
                onClick={handleBookSession}
              >
                {isBooking ? (
                  <>
                    <span className={styles.primaryCtaSpinner} aria-hidden />
                    <span className={styles.primaryCtaBusyLabel}>Booking...</span>
                  </>
                ) : (
                  'Book session'
                )}
              </button>
            </section>

            <footer className={styles.bookingFooter}>
              <section
                className={styles.browseProvidersAction}
                aria-label="Browse other therapists"
              >
                <div className={styles.browseProvidersCopy}>
                  <p className={styles.browseProvidersTitle}>Browse other providers</p>
                  <p className={styles.browseProvidersBody}>
                    Discover therapists with different approaches, backgrounds, and expertise to find
                    your best fit.
                  </p>
                </div>
                <a className={styles.browseProvidersCta} href="#">
                  Browse providers
                </a>
              </section>
              <div className={styles.rejoinFooterBlock}>
                <div className={styles.rejoinRow}>
                  <span className={styles.mutedSmall}>Appointment not over yet?</span>
                  <a className={styles.rejoinLink} href="#">
                    Rejoin waiting room
                  </a>
                </div>
              </div>
            </footer>
          </section>
        </div>

        {isBookingTransitioning ? (
          <div
            ref={bookingOverlayRef}
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
            <span className={styles.srOnly}>Confirming your appointment, please wait.</span>
          </div>
        ) : null}
      </main>
      </div>
      <SiteFooter />
    </div>
  )
}

const DATE_STRIP_DRAG_SLOP_PX = 10

type PendingDrag = {
  pointerId: number
  originX: number
  originScrollLeft: number
}

function DatesMobile({
  options,
  selectedIdx,
  onSelect,
}: {
  options: readonly DateChoice[]
  selectedIdx: number
  onSelect: (idx: number) => void
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const dragPointerId = useRef<number | null>(null)
  const dragOrigin = useRef({ x: 0, scrollLeft: 0 })
  const pendingDrag = useRef<PendingDrag | null>(null)
  const didDrag = useRef(false)
  const suppressNextClick = useRef(false)
  const [grabbing, setGrabbing] = useState(false)

  const endActiveDrag = () => {
    dragPointerId.current = null
    setGrabbing(false)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current
    if (!el || !e.isPrimary) return

    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (e.pointerType !== 'mouse') return

    const onButton = e.target instanceof Element && e.target.closest('button')

    didDrag.current = false
    suppressNextClick.current = false
    pendingDrag.current = null

    /* Mouse on empty rail: drag immediately */
    if (e.pointerType === 'mouse' && !onButton) {
      dragPointerId.current = e.pointerId
      dragOrigin.current = { x: e.clientX, scrollLeft: el.scrollLeft }
      setGrabbing(true)
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        /* */
      }
      return
    }

    /* Mouse starting on a button: wait for horizontal movement past slop, then capture */
    pendingDrag.current = {
      pointerId: e.pointerId,
      originX: e.clientX,
      originScrollLeft: el.scrollLeft,
    }
  }

  const activateDragFromPending = (
    e: React.PointerEvent<HTMLDivElement>,
    p: PendingDrag,
    el: HTMLDivElement,
  ) => {
    const dxTotal = e.clientX - p.originX
    dragPointerId.current = e.pointerId
    dragOrigin.current = {
      x: p.originX,
      scrollLeft: p.originScrollLeft,
    }
    pendingDrag.current = null
    setGrabbing(true)
    try {
      el.setPointerCapture(e.pointerId)
    } catch {
      /* */
    }
    el.scrollLeft = dragOrigin.current.scrollLeft - dxTotal
    if (Math.abs(dxTotal) > 2) didDrag.current = true
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current
    if (!el || !e.isPrimary) return

    if (dragPointerId.current === e.pointerId) {
      const dx = e.clientX - dragOrigin.current.x
      el.scrollLeft = dragOrigin.current.scrollLeft - dx
      if (Math.abs(dx) > 2) didDrag.current = true
      return
    }

    const p = pendingDrag.current
    if (!p || p.pointerId !== e.pointerId) return

    const dx = e.clientX - p.originX
    if (Math.abs(dx) < DATE_STRIP_DRAG_SLOP_PX) return

    activateDragFromPending(e, p, el)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current
    if (!e.isPrimary) return

    if (pendingDrag.current?.pointerId === e.pointerId) {
      pendingDrag.current = null
      return
    }

    if (dragPointerId.current !== e.pointerId) return

    if (didDrag.current) suppressNextClick.current = true
    try {
      el?.releasePointerCapture(e.pointerId)
    } catch {
      /* released */
    }
    endActiveDrag()
  }

  const onPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary) return

    if (pendingDrag.current?.pointerId === e.pointerId) {
      pendingDrag.current = null
      return
    }

    if (dragPointerId.current !== e.pointerId) return

    try {
      scrollerRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      /* released */
    }
    endActiveDrag()
  }

  const onLostPointerCapture = () => {
    pendingDrag.current = null
    endActiveDrag()
  }

  const onDateClick = (idx: number) => {
    if (suppressNextClick.current) {
      suppressNextClick.current = false
      return
    }
    onSelect(idx)
  }

  return (
    <div
      ref={scrollerRef}
      role="presentation"
      className={[styles.dateStripWrapMobile, grabbing ? styles.dateStripWrapGrabbing : '']
        .filter(Boolean)
        .join(' ')}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onLostPointerCapture={onLostPointerCapture}
    >
      <ul className={styles.dateStrip} aria-labelledby="followup-days">
        {options.map((d, idx) => (
          <li key={`${d.monthDay}-${d.weekday}-${idx}`}>
            <button
              type="button"
              className={`${styles.dateCard} ${selectedIdx === idx ? styles.dateCardSelected : ''}`}
              onClick={() => onDateClick(idx)}
            >
              <span className={styles.lineDate}>{d.monthDay}</span>
              <span className={styles.lineWeekday}>{d.weekday}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DatesDesktop({
  options,
  windowStart,
  selectedIdx,
  onSelect,
}: {
  options: readonly DateChoice[]
  windowStart: number
  selectedIdx: number
  onSelect: (idx: number) => void
}) {
  return (
    <div className={styles.dateStripWrapDesktop}>
      <ul className={styles.dateStrip} aria-labelledby="followup-days-desktop">
        {options.map((d, idx) => {
          const globalIdx = windowStart + idx
          return (
          <li key={`desk-${d.monthDay}-${d.weekday}-${globalIdx}`}>
            <button
              type="button"
              className={`${styles.dateCard} ${selectedIdx === globalIdx ? styles.dateCardSelected : ''}`}
              onClick={() => onSelect(globalIdx)}
            >
              <span className={styles.lineDate}>{d.monthDay}</span>
              <span className={styles.lineWeekday}>{d.weekday}</span>
            </button>
          </li>
          )
        })}
      </ul>
    </div>
  )
}

function TimeGrid({
  slots,
  selected,
  onSelect,
}: {
  slots: readonly string[]
  selected: string | null
  onSelect: (value: string) => void
}) {
  return (
    <div className={styles.timeGrid}>
      {slots.map((t) => (
        <button
          key={t}
          type="button"
          className={`${styles.timeSlot} ${selected === t ? styles.timeSlotSelected : ''}`}
          aria-pressed={selected === t}
          onClick={() => onSelect(t)}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
