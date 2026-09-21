import { ThemeButton } from './ThemeButton'
import type { Theme } from '../lib/useTheme'
import { useIsDesktop } from '../lib/useMedia'

const LOGO = `${import.meta.env.BASE_URL}shell/logo.svg`

/* Everything SNCF put here (Voyager, Panier, Se connecter…) is unreachable in
   this prototype, so the bar is just the logo and, on mobile, the day/night
   switch. The website has no such switch, which is the point of showing it
   only on the app side. */
export function Header({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const desktop = useIsDesktop()
  return (
    <header className="hdr">
      <div className="hdr__inner">
        <a className="hdr__logo" href="#/" aria-label="Retour à l'accueil SNCF Connect">
          <img src={LOGO} alt="" width={116} height={40} />
        </a>
        {!desktop && <ThemeButton theme={theme} onToggle={onToggleTheme} />}
      </div>
    </header>
  )
}
