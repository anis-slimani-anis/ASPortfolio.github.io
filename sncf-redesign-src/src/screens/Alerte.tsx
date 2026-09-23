import { useState } from 'react'
import { DisruptionAlert } from '../components/DisruptionAlert'
import { go } from '../lib/router'
import { DATE_DISRUPTED } from '../lib/types'

/* 05 ALERTE PRE-DEPART, node 612:2942.
   This screen only ever renders below 1024px (App.tsx redirects desktop back
   to the results), so the audience is always an actual phone-width viewport.
   It used to frame the lock screen in a device mockup, which made sense for a
   preview embedded in something wider, but on a real phone that produced a
   phone-shaped rectangle inside the phone's own screen: shrunk below the real
   viewport height and clipped at the bottom. Full-bleed instead, so it reads
   like the lock screen it is simulating rather than a screenshot of one. */
export function Alerte() {
  const [type, setType] = useState<'works' | 'delay'>('works')
  const back = () => go(`/resultats?date=${DATE_DISRUPTED}`)

  return (
    <main className="sim">
      <div className="lock">
        <div className="lock__bg" aria-hidden="true" />

        <div className="lock__top">
          <p className="sim__note">
            Simulation : la notification reçue avant le départ
          </p>
          <p className="lock__clock">10:24</p>
          <p className="lock__date">samedi 26 septembre</p>

          <div className="push">
            <span className="push__app">SNCF CONNECT</span>
            <p className="push__title">
              {type === 'works'
                ? 'Travaux sur votre trajet de demain'
                : 'Retard annoncé sur votre trajet'}
            </p>
            <p className="push__body">
              {type === 'works'
                ? 'Un car de substitution remplace le train entre Avignon et Marseille. Touchez pour voir les alternatives.'
                : 'Retard moyen estimé à 20 minutes. Touchez pour voir les alternatives.'}
            </p>
          </div>
        </div>

        <div className="lock__sheet">
          <DisruptionAlert type={type} onAlternatives={back} />
        </div>
      </div>

      {/* Demo controls: not part of the simulated notification, so they sit in
          their own bar with a surface of their own. */}
      <div className="sim__bar">
        <div className="sim__switch" role="group" aria-label="Type d’alerte">
          {(['works', 'delay'] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={type === t}
              className={`sim__tab${type === t ? ' sim__tab--on' : ''}`}
              onClick={() => setType(t)}
            >
              {t === 'works' ? 'Travaux' : 'Retard'}
            </button>
          ))}
        </div>
        <button type="button" className="pill pill--primary sim__back" onClick={back}>
          ← Retour aux résultats
        </button>
      </div>
    </main>
  )
}
