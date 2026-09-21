import { useEffect, useState } from 'react'

/* The design has two breakpoints and the components genuinely differ in
   structure, not just in styling, so the variant is read from the real
   viewport rather than from a prop somebody has to remember to pass. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    // `change` is the right event, but some embedded and emulated browsers never
    // dispatch it even though the query itself evaluates correctly. `resize` is
    // a cheap belt-and-braces so the breakpoint never gets stuck.
    mq.addEventListener('change', onChange)
    window.addEventListener('resize', onChange)
    return () => {
      mq.removeEventListener('change', onChange)
      window.removeEventListener('resize', onChange)
    }
  }, [query])
  return matches
}

/* Desktop is >= 1024px and behaves as the 1440 design. Everything below is
   the 393 design. Mobile is the default, which is why the query is inverted. */
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
