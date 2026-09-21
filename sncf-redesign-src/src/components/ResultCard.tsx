import type { Journey } from '../lib/types'
import type { SheetType } from '../lib/useSheet'
import { Icon } from './Icon'
import { DisruptionStrip } from './DisruptionStrip'
import { useIsDesktop } from '../lib/useMedia'

/* The Figma booleans map straight onto the journey data, so a variant is never
   a new component, only different data:
     reco -> recommended   meilleurPrix -> bestPrice   correspondance -> modes>1
     perturbation(2) -> strips[0..1]   alteration/alternative -> those fields  */

const SPOKEN = {
  planned: 'travaux avec car de substitution',
  critical: 'retard annoncé',
  unknown: 'état du trafic indisponible',
} as const

// Order fixed by the brief: departure, arrival, disruption, duration, price.
// The disruption is spoken before the price so it is never the last thing heard.
function summary(j: Journey): string {
  const p = [`Départ ${j.departTime}`, `arrivée ${j.arriveTime}`]
  if (j.strips.length) p.push(j.strips.map((s) => SPOKEN[s.severity]).join(', '))
  p.push(`durée ${j.durationLabel.replace('h', ' heures ')}`, `à partir de ${j.price2nd}`)
  if (j.recommended) p.unshift('Trajet recommandé')
  return p.join(', ')
}

export function ResultCard({ journey: j, onDisruption }: {
  journey: Journey
  onDisruption?: (t: SheetType) => void
}) {
  const desktop = useIsDesktop()
  const correspondance = j.modes.length > 1
  const open = (sev: 'planned' | 'critical' | 'unknown') =>
    onDisruption?.(sev === 'critical' ? 'delay' : 'works')
  /* The detail affordance is on every card, disrupted or not. A clean journey
     opens the same drawer with nothing marked. */
  const detail = () => onDisruption?.(j.strips.length ? 'works' : 'normal')
  /* Figma keeps the "Meilleur prix" slot in both price columns and hides it,
     so a card without the chip is not shorter than one with it. */
  const bestSlot = (on: boolean) =>
    on ? <span className="chip-best">Meilleur prix</span>
       : <span className="chip-best chip-best--ghost" aria-hidden="true">Meilleur prix</span>

  const legs = (
    <div className="card__trip">
      <div className="card__leg"><b>{j.departTime}</b><span>{j.departStation}</span></div>
      <div className="card__leg"><b>{j.arriveTime}</b><span>{j.arriveStation}</span></div>
    </div>
  )

  return (
    <article className="card" id={j.recommended ? 'trajet-recommande' : undefined} aria-label={summary(j)}>
      {j.recommended && (
        <div className="card__reco">
          <p>{j.recommendedLabel ?? 'Trajet recommandé'}</p>
          <Icon name="info" size={20} />
        </div>
      )}

      <div className="card__body">
        {desktop ? (
          <>
            <div className="card__modes">
              <Icon name={j.modes[0]} size={22} />
              {correspondance && <span className="card__arrow">→</span>}
              {correspondance && <Icon name={j.modes[1]} size={22} />}
            </div>
            {legs}
            <div className="card__duration">
              <Icon name="clock" size={18} />
              <span>{j.durationLabel}</span><span>{j.connectionLabel}</span>
            </div>
            <button type="button" className="card__detail" onClick={detail}>
              <span>Détail du trajet</span><Icon name="route" size={20} />
            </button>
            <span className="card__sep" aria-hidden="true" />
            <div className="card__prices">
              <div className="card__price">
                {bestSlot(j.bestPrice)}
                <span className="card__from">dès</span>
                <b className="card__amount">{j.price2nd}</b>
              </div>
              <div className="card__price">
                {bestSlot(false)}
                <span className="card__from">dès</span>
                <b className="card__amount">{j.price1st}</b>
              </div>
            </div>
            <button type="button" className="card__expand" aria-label="Déplier le trajet">
              <Icon name="chevron" size={20} className="card__expand-glyph" />
            </button>
          </>
        ) : (
          <>
            {j.bestPrice && <span className="chip-best">Meilleur prix</span>}
            <div className="card__top">
              {legs}
              <div className="card__price">
                <span className="card__from">dès</span>
                <b className="card__amount">{j.price2nd}</b>
              </div>
            </div>
            {/* Mobile has no Détail button: the duration pill is the tap target. */}
            <button type="button" className="card__duration-pill" onClick={detail}>
              <Icon name="clock" size={18} />
              <span>{j.durationLabel}</span>
              <span className="card__conn">{j.connectionLabel}</span>
              <Icon name="chevron" size={20} />
            </button>
          </>
        )}
      </div>

      {j.strips.map((s, i) => (
        <DisruptionStrip key={i} severity={s.severity} label={s.label} onClick={() => open(s.severity)} />
      ))}

      {j.alteration && (
        <button type="button" className="card__alteration" onClick={() => open('planned')}>
          <span>{j.alteration}</span><Icon name="chevron" size={desktop ? 16 : 14} />
        </button>
      )}

      {j.alternative && (
        <div className="card__alternative">
          <p>{desktop ? j.alternative : j.alternative.replace('Trajet sans car de substitution', 'Sans car')}</p>
          <button type="button" className="card__choose">Choisir</button>
        </div>
      )}
    </article>
  )
}
