import { useEffect, useRef } from 'react'
import { Header } from './components/Header'
import { Faq } from './components/Faq'
import { SiteFooter } from './components/SiteFooter'
import { Landing } from './screens/Landing'
import { Results } from './screens/Results'
import { Autocomplete } from './screens/Autocomplete'
import { Voyageurs } from './screens/Voyageurs'
import { Alerte } from './screens/Alerte'
import { go, useRoute } from './lib/router'
import { useIsDesktop } from './lib/useMedia'
import { useTheme } from './lib/useTheme'
import { DATE_DISRUPTED } from './lib/types'

const TITLES: Record<string, string> = {
  '/recherche': 'Recherche',
  '/voyageurs': 'Qui voyage ?',
  '/resultats': 'Résultats, Massy vers Marseille',
  '/alerte': 'Alerte avant le départ',
}

export function App() {
  const route = useRoute()
  const desktop = useIsDesktop()
  // Night mode is the app's, not the website's: the desktop stays in day.
  const { theme, toggle } = useTheme(!desktop)

  // The lock-screen simulation is a mobile artefact. Reaching it on desktop —
  // by a shared link, or by widening the window after following a route — would
  // be a mistake, so it hands back to the results instead. The redirect runs as
  // an effect rather than during render, which is the only place navigation is
  // safe to trigger.
  /* Hash routing swaps the screen without a page load, so a screen reader
     hears nothing and its cursor is left on a button that no longer exists.
     On every change of screen (not of query: picking a date keeps focus on the
     date strip) the title is updated and focus moves to the new h1.
     /recherche is skipped because it focuses its own search field. */
  const firstPath = useRef(true)
  const baseTitle = useRef(document.title)
  useEffect(() => {
    const t = TITLES[route.path]
    document.title = t ? `${t} | SNCF Connect` : baseTitle.current
    if (firstPath.current) { firstPath.current = false; return }
    if (route.path === '/recherche') return
    const h1 = document.querySelector<HTMLElement>('h1')
    if (!h1) return
    h1.tabIndex = -1
    h1.focus({ preventScroll: true })
  }, [route.path])

  const onAlerte = route.path === '/alerte'
  useEffect(() => {
    if (onAlerte && desktop) go(`/resultats?date=${DATE_DISRUPTED}`)
  }, [onAlerte, desktop])

  if (onAlerte) {
    if (desktop) return null
    return <div className="page"><Alerte /></div>
  }

  // The autocomplete is an overlay; it draws the landing page behind itself.
  if (route.path === '/recherche') {
    return (
      <div className="page">
        <Header theme={theme} onToggleTheme={toggle} />
        <Autocomplete />
      </div>
    )
  }

  const screen =
    route.path === '/voyageurs' ? (
      <Voyageurs />
    ) : route.path === '/resultats' ? (
      <Results
        date={route.params.get('date') ?? DATE_DISRUPTED}
        filtre={route.params.get('filtre') === '1'}
      />
    ) : (
      <Landing />
    )

  return (
    <div className="page">
      <a className="skip" href="#contenu">Aller au contenu</a>
      <Header theme={theme} onToggleTheme={toggle} />
      <div id="contenu" tabIndex={-1}>{screen}</div>
      <div className="shell faq__wrap"><Faq /></div>
      <SiteFooter />
    </div>
  )
}
