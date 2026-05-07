/** Pass total page height from Session complete → Appointment confirmed so layouts don’t jump. */

const STORAGE_KEY = 'followUpBooking:sessionPageScrollHeight'

export function captureSessionPageHeightForHandoff(): void {
  const h = Math.round(document.documentElement.scrollHeight)
  sessionStorage.setItem(STORAGE_KEY, String(h))
}

export function readHandoffPageMinHeightPx(): number | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function clearHandoffPageMinHeight(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}
