import { useId } from 'react'
import type { Theme } from '../lib/useTheme'

export function ThemeButton({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const night = theme === 'night'
  const maskId = useId()
  return (
    <button
      type="button"
      className="themebtn"
      onClick={onToggle}
      aria-label={night ? 'Passer en mode jour' : 'Passer en mode nuit'}
      title={night ? 'Mode jour' : 'Mode nuit'}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        {night ? (
          /* The crescent is a circle centred on (10,10) with a second circle
             cut out of it, so the glyph sits dead centre in the 20x20 box. */
          <>
            <mask id={maskId}>
              <rect width="20" height="20" fill="white" />
              <circle cx="14.4" cy="6.6" r="6.9" fill="black" />
            </mask>
            <circle cx="10" cy="10" r="7" fill="currentColor" mask={`url(#${maskId})`} />
          </>
        ) : (
          <>
            <circle cx="10" cy="10" r="3.6" fill="currentColor" />
            <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M10 1.8v2.2M10 16v2.2M18.2 10H16M4 10H1.8M15.8 4.2l-1.6 1.6M5.8 14.2l-1.6 1.6M15.8 15.8l-1.6-1.6M5.8 5.8 4.2 4.2" />
            </g>
          </>
        )}
      </svg>
    </button>
  )
}
