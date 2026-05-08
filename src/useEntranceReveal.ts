import gsap from 'gsap'
import { useLayoutEffect, type RefObject } from 'react'

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Staggered fade-up for `[data-confirm-reveal]` within root (matches Provider / Appointment confirmed). */
export function useEntranceReveal(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const root = rootRef.current
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
  }, [rootRef])
}
