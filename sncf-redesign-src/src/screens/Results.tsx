import { useMemo, useState } from 'react'
import { getJourneys } from '../data/journeys'
import { BANNER, getDays } from '../data/dates'
import { ResultCard } from '../components/ResultCard'
import { DateStrip } from '../components/DateStrip'
import { WorksBanner } from '../components/WorksBanner'
import { TrajetDetailDrawer } from '../components/TrajetDetailDrawer'
import { useSheet } from '../lib/useSheet'
import { Toggle } from '../components/Toggle'
import { JourneyBar, UpsellRow } from '../components/JourneyBar'
import { ModeTabs } from '../components/ModeTabs'
import { LoadMoreBar } from '../components/LoadMoreBar'
import { EmptyState } from '../components/EmptyState'
import { Toast } from '../components/Toast'
import { useIsDesktop } from '../lib/useMedia'
import { go } from '../lib/router'

const LONG = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
const SHORT = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
const at = (iso: string) => new Date(`${iso}T12:00:00`)

export function Results({ date, filtre }: { date: string; filtre: boolean }) {
  const desktop = useIsDesktop()
  const [hide, setHide] = useState(filtre)
  const [mode, setMode] = useState<'train' | 'bus'>('train')
  const [klass, setKlass] = useState<'2de' | '1re'>('2de')
  const days = useMemo(() => getDays(), [])
  const s = useSheet()
  const [toast, setToast] = useState<{ msg: string; tone: 'on' | 'off' } | null>(null)

  /* "Suivre ce trajet" is the bridge into the proactive story.
     Desktop confirms with a toast; mobile hands straight over to the
     pre-departure lock screen, which is where the idea actually lands. */
  const handleFollow = (on: boolean) => {
    s.setFollowed(on)
    if (!on) {
      // Turning it off confirms too, so the change is never silent.
      setToast({ msg: 'Notifications désactivées pour ce trajet', tone: 'off' })
      return
    }
    if (desktop) {
      setToast({ msg: 'Notifications activées pour ce trajet', tone: 'on' })
    } else {
      s.close()
      go('/alerte')
    }
  }

  const scrollTo = (sel: string) => {
    const el = document.querySelector(sel)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('is-flagged')
    setTimeout(() => el.classList.remove('is-flagged'), 1600)
  }

  // Mobile carries an extra late departure; desktop does not show it.
  const all = (mode === 'bus' ? [] : getJourneys(date))
    .filter((j) => !desktop || !j.mobileOnly)
    .sort((a, b) => Number(b.recommended) - Number(a.recommended))
  const shown = hide ? all.filter((j) => !j.strips.length) : all
  const hidden = all.length - shown.length
  const disrupted = all.some((j) => j.strips.length)

  const setDate = (iso: string) => go(`/resultats?date=${iso}${hide ? '&filtre=1' : ''}`)

  return (
    <>
      <JourneyBar depart="Massy" arrivee="Marseille" dateLabel={SHORT.format(at(date))} />

      <main className="main">
        <div className="shell stack results">
          <ModeTabs value={mode} onChange={setMode} />
          <DateStrip days={days} selected={date} onSelect={setDate} />
          {disrupted && <WorksBanner {...BANNER} onOpen={() => s.open('works')} />}

          <div className="filterbar">
            <span className="filterbar__count">
              {shown.length} trajet{shown.length > 1 ? 's' : ''}, {LONG.format(at(date))}
            </span>
            {/* Nothing to hide on a clean day, so the control stays out of the way. */}
            {disrupted && (
              <span className="filterbar__switch">
                <label htmlFor="hide-disrupted">Masquer les trajets perturbés</label>
                <Toggle id="hide-disrupted" checked={hide} onChange={setHide}
                        label="Masquer les trajets perturbés" />
              </span>
            )}
          </div>

          {mode === 'bus' ? (
            <EmptyState onReset={() => setMode('train')} />
          ) : (
            <div className="stack results__list">
              {shown.map((j) => (
                <ResultCard key={j.id} journey={j} onDisruption={s.open} />
              ))}
            </div>
          )}

          {hidden > 0 && (
            <div className="hiddenrow">
              <span>
                {hidden} trajet{hidden > 1 ? 's' : ''} perturbé{hidden > 1 ? 's' : ''}{' '}
                {hidden > 1 ? 'sont masqués' : 'est masqué'}
              </span>
              <button type="button" onClick={() => setHide(false)}>Tout afficher</button>
            </div>
          )}

          {mode === 'train' && <LoadMoreBar klass={klass} onKlass={setKlass} />}
          <UpsellRow
            onPrices={() => { setMode('train'); scrollTo('#trajet-recommande') }}
            onBus={() => { setMode('bus'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            onHelp={() => scrollTo('#besoin-aide')}
          />
        </div>
      </main>

      {s.sheet && (
        <TrajetDetailDrawer type={s.sheet} onClose={s.close} followed={s.followed} onFollow={handleFollow} />
      )}

      {toast && (
        <Toast
          key={toast.msg}
          message={toast.msg}
          tone={toast.tone}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  )
}
