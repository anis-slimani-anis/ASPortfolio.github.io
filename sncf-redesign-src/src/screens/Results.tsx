import { useEffect, useMemo, useRef, useState } from 'react'
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
import { useAnnouncer } from '../components/Announcer'
import { useIsDesktop } from '../lib/useMedia'
import { go } from '../lib/router'

const LONG = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
const SHORT = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
const at = (iso: string) => new Date(`${iso}T12:00:00`)
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

/* Scrolling alone moves nothing for a screen reader, so every jump also moves
   focus. Targets that are not controls get tabindex -1 on the way. Runs a tick
   late so a target that the same click just rendered exists by then. */
function focusOn(sel: string) {
  setTimeout(() => {
    const el = document.querySelector<HTMLElement>(sel)
    if (!el) return
    if (!el.matches('a[href],button,input,select,textarea')) el.tabIndex = -1
    el.focus({ preventScroll: true })
  })
}

export function Results({ date, filtre }: { date: string; filtre: boolean }) {
  const desktop = useIsDesktop()
  const [hide, setHide] = useState(filtre)
  const [mode, setMode] = useState<'train' | 'bus'>('train')
  const [klass, setKlass] = useState<'2de' | '1re'>('2de')
  const days = useMemo(() => getDays(), [])
  const s = useSheet()
  const [toast, setToast] = useState<{ msg: string; tone: 'on' | 'off' } | null>(null)
  const { say, region } = useAnnouncer()
  const notify = (msg: string, tone: 'on' | 'off') => { setToast({ msg, tone }); say(msg) }

  /* "Suivre ce trajet" is the bridge into the proactive story.
     Desktop confirms with a toast; mobile hands straight over to the
     pre-departure lock screen, which is where the idea actually lands. */
  const handleFollow = (on: boolean) => {
    s.setFollowed(on)
    if (!on) {
      // Turning it off confirms too, so the change is never silent.
      notify('Notifications désactivées pour ce trajet', 'off')
      return
    }
    if (desktop) {
      notify('Notifications activées pour ce trajet', 'on')
    } else {
      s.close()
      go('/alerte')
    }
  }

  const scrollTo = (sel: string) => {
    const el = document.querySelector(sel)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    focusOn(sel)
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

  /* The list changes under the user without focus moving, on a new date or
     on the filter, so the new count is spoken. Not on first render: the page
     heading already carries that. */
  const perturbes = all.length - all.filter((j) => !j.strips.length).length
  const countFor = (masque: boolean) => {
    const n = masque ? all.length - perturbes : all.length
    const base = `${plural(n, 'trajet', 'trajets')}, ${LONG.format(at(date))}`
    if (!perturbes) return base
    return masque
      ? `${base}. ${plural(perturbes, 'trajet perturbé masqué', 'trajets perturbés masqués')}`
      : `${base}, dont ${plural(perturbes, 'perturbé', 'perturbés')}`
  }
  const firstDate = useRef(true)
  useEffect(() => {
    if (firstDate.current) { firstDate.current = false; return }
    say(countFor(hide))
  }, [date])
  const setHideSpoken = (v: boolean) => { setHide(v); say(countFor(v)) }

  return (
    <>
      <JourneyBar depart="Massy" arrivee="Marseille" dateLabel={SHORT.format(at(date))}
                  dateSpoken={LONG.format(at(date))} />

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
                <Toggle id="hide-disrupted" checked={hide} onChange={setHideSpoken}
                        label="Masquer les trajets perturbés" />
              </span>
            )}
          </div>

          {mode === 'bus' ? (
            <EmptyState onReset={() => { setMode('train'); focusOn('.modetab') }} />
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
              {/* This button disappears when pressed; focus goes to the switch
                  that controls the same thing rather than falling to <body>. */}
              <button type="button" onClick={() => { setHideSpoken(false); focusOn('#hide-disrupted') }}>
                Tout afficher
              </button>
            </div>
          )}

          {mode === 'train' && <LoadMoreBar klass={klass} onKlass={setKlass} />}
          <UpsellRow
            onPrices={() => { setMode('train'); scrollTo('#trajet-recommande') }}
            onBus={() => { setMode('bus'); window.scrollTo({ top: 0, behavior: 'smooth' }); focusOn('.empty__title') }}
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
      {region}
    </>
  )
}
