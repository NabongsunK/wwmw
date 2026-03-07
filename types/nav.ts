// src/constants/nav.ts

export interface NavItem {
  label: string
  href: string
}

export const NAV_ITEMS: NavItem[] = [
  // { label: '빌드', href: '/builds' },
  { label: '심법 뽑기', href: '/simulator/mystic' },
  { label: '스무고개', href: '/twentyquestions' },
]
