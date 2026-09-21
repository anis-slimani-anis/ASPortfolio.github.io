import { useState } from 'react'
import { DisruptionAlert } from '../components/DisruptionAlert'
import { go } from '../lib/router'
import { DATE_DISRUPTED } from '../lib/types'

/* 05 ALERTE PRE-DEPART, node 612:2942.
   Presented as a device mockup rather than as a full-bleed page: this screen is
   a simulation of a push the traveller gets outside the app, and framing it in a
   phone makes that legible instead of looking like app chrome. The demo controls
   (severity switch, return) sit outside the frame, where they belong. */
export function Alerte() {
  const [type, setType] = useState<'works' | 'delay'>('works')
  const back = () => go(`/resultats?date=${DATE_DISRUPTED}`)

  return (
    <main className="sim">
      <h1 className="sim__note">
        Simulation : la notification reçue avant le départ
      </h1>

      <div className="phone">
        <div className="phone__bezel">
          <span className="phone__notch" aria-hidden="true" />
          <div className="phone__screen">
            <div className="lock__bg" aria-hidden="true" />

            <div className="lock__top">
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
        </div>
      </div>

      {/* Controls live at the bottom: easier to reach, and clearly not part of
          the simulated phone. */}
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
