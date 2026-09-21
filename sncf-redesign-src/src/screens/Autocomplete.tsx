import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { StationRow } from '../components/StationRow'
import { FORCED_QUERY, SUGGESTIONS, STOPS } from '../data/suggestions'
import { useIsDesktop } from '../lib/useMedia'
import { go } from '../lib/router'
import { DATE_DISRUPTED } from '../lib/types'
import { Landing } from './Landing'

/* 02 AUTOCOMPLETE. Desktop 265:3627 is a panel under the field with the page
   dimmed behind. Mobile 320:1948 is a full-screen sheet with a dark header. */
export function Autocomplete() {
  const desktop = useIsDesktop()
  const [q, setQ] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => { input.current?.focus() }, [])

  // The passenger step now sits between search and results.
  const pick = () => go(`/voyageurs?date=${DATE_DISRUPTED}`)
  // Whatever is typed, the panel resolves to the Marseille set.
  const list = q.trim() ? SUGGESTIONS : SUGGESTIONS
  const stops = q.trim() ? STOPS : STOPS

  const panel = (
    <div className="ac__panel" role="listbox" aria-label="Suggestions de gares">
      <ul className="ac__list">
        {list.map((s, i) => <StationRow key={`${s.name}-${i}`} s={s} onPick={pick} />)}
      </ul>
      <p className="ac__section">Arrêts et stations</p>
      <ul className="ac__list">
        {stops.map((s, i) => <StationRow key={`stop-${i}`} s={s} onPick={pick} />)}
      </ul>
    </div>
  )

  if (!desktop) {
    return (
      <div className="ac ac--sheet">
        <div className="ac__bar">
          <h1 className="ac__barTitle">Recherche</h1>
          <button type="button" className="ac__close" onClick={() => go('/')}>Fermer</button>
        </div>
        {/* Same pill as the landing search, so the field does not change shape
            between the two screens. */}
        <form className="bigsearch ac__search" role="search"
              onSubmit={(e) => { e.preventDefault(); pick() }}>
          <input
            ref={input} className="bigsearch__input" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Entrez une destination, un trajet..."
            aria-label="Entrez une destination, un trajet"
          />
          {q && <button type="button" className="ac__clear" onClick={() => setQ('')} aria-label="Effacer">×</button>}
          <button type="submit" className="bigsearch__go" aria-label="Rechercher">
            <Icon name="loupe" size={20} />
          </button>
        </form>
        {panel}
      </div>
    )
  }

  // The dimmed area is the way out: anything that is not the field or the
  // panel sends you back to the landing screen.
  const dismiss = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!(e.target as HTMLElement).closest('.ac__panel, .bigsearch')) go('/')
  }

  return (
    <div className="ac" onMouseDown={dismiss}>
      {/* The page you came from stays visible behind the scrim. */}
      <div className="ac__behind" aria-hidden="true"><Landing /></div>
      <div className="ac__dim" aria-hidden="true" />
      <div className="shell ac__inner">
        <form className="bigsearch bigsearch--open" onSubmit={(e) => { e.preventDefault(); pick() }} role="search">
          <input
            ref={input} className="bigsearch__input" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Entrez une destination, un trajet..."
            aria-label="Entrez une destination, un trajet"
          />
          <button type="submit" className="bigsearch__go">Rechercher</button>
        </form>
        {panel}
        <p className="ac__hint">
          La démo suit un scénario unique : toute recherche renvoie les gares de {FORCED_QUERY}.
        </p>
      </div>
    </div>
  )
}
