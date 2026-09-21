import { useEffect, useState } from 'react'

export type Theme = 'day' | 'night'
const KEY = 'sncf-theme'

/* SNCF Connect's website has no appearance switch: the site decides how it
   looks, the visitor does not. Only the app follows the device. So night mode
   is a mobile affordance here, and `enabled` pins the desktop to day. The
   preference is still stored, so widening and narrowing the window gives it
   back rather than losing it. */
export function useTheme(enabled = true) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null
    if (saved === 'day' || saved === 'night') return saved
    return typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day'
  })

  const effective: Theme = enabled ? theme : 'day'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effective)
  }, [effective])

  useEffect(() => {
    try { localStorage.setItem(KEY, theme) } catch { /* private mode */ }
  }, [theme])

  return { theme: effective, toggle: () => setTheme((t) => (t === 'day' ? 'night' : 'day')) }
}
