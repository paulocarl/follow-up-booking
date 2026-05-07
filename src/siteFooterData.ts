/** Alphabetical US states + DC — matches marketing footer directory. */
export const FOOTER_US_STATES: readonly string[] = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'District of Columbia',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
] as const

export const FOOTER_MAIN_LINKS: readonly { label: string; href: string }[] = [
  { label: 'Home', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'About us', href: '#' },
  { label: 'Blog', href: '#' },
]

export const FOOTER_POLICY_LINKS: readonly { label: string; href: string }[] = [
  { label: 'Website privacy policy', href: '#' },
  { label: 'Terms of service', href: '#' },
  { label: 'Nondiscrimination policy', href: '#' },
  { label: 'HIPAA notice of privacy practices', href: '#' },
  { label: 'Practice policy', href: '#' },
  { label: 'Your privacy choices', href: '#' },
  { label: 'Accessibility', href: '#' },
  { label: 'Cookie preferences', href: '#' },
]

export const FOOTER_COPYRIGHT_LINES: readonly string[] = [
  '© 2025 Grow Care, Inc.',
  '© 2025 Grow Healthcare Group PA',
  '© 2025 Grow Healthcare Group PC',
  '© 2025 Grow Healthcare Group of New Jersey',
  '© 2025 Grow Healthcare Group of Kansas PA',
]

export function splitIntoColumns<T>(items: readonly T[], columnCount: number): T[][] {
  if (columnCount < 1) return [[]]
  const cols: T[][] = Array.from({ length: columnCount }, () => [])
  const perCol = Math.ceil(items.length / columnCount)
  for (let c = 0; c < columnCount; c++) {
    cols[c] = items.slice(c * perCol, (c + 1) * perCol) as T[]
  }
  return cols
}
