import { useState } from 'react'

/* `normal` is the same drawer for an undisrupted journey: same anatomy,
   a neutral notice instead of a severity one. */
export type SheetType = 'works' | 'delay' | 'normal'

const FOLLOW_KEY = 'sncf-follow'

/* Tracks which drawer is open and the follow opt-in.
   The opt-in is persisted: on mobile, turning it on navigates to the lock
   screen, so without this the state resets on the way back and the route
   could never be un-followed. */
export function useSheet() {
  const [sheet, setSheet] = useState<SheetType | null>(null)
  const [followed, setFollowedState] = useState(() => {
    try { return localStorage.getItem(FOLLOW_KEY) === '1' } catch { return false }
  })
  const setFollowed = (v: boolean) => {
    setFollowedState(v)
    try { localStorage.setItem(FOLLOW_KEY, v ? '1' : '0') } catch { /* private mode */ }
  }
  return { sheet, open: setSheet, close: () => setSheet(null), followed, setFollowed }
}
