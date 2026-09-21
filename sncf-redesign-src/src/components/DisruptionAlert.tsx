import { Icon } from './Icon'

/* alert/disruption-alert, node 612:2957 (and 612:710).
   The out-of-session card: the payoff of the whole redesign. It reuses the
   strip and the alteration line unchanged, which is why it costs nothing. */
const CONTENT = {
  works: {
    severity: 'planned' as const,
    strip: 'Travaux ajoutés sur votre trajet',
    title: 'Massy vers Marseille, samedi 26 septembre',
    body:
      'Un car de substitution remplace le train entre Avignon et Marseille sur votre ' +
      'trajet de 07h28. Comptez environ 50 minutes de plus.',
    alteration: '4 h 42 au lieu de 3 h 52',
  },
  delay: {
    severity: 'critical' as const,
    strip: 'Retard annoncé sur votre trajet',
    title: 'Massy vers Marseille, samedi 26 septembre',
    body:
      'Un incident d’exploitation entraîne un retard moyen estimé à 20 minutes sur ' +
      'votre trajet de 13h07. Le retard peut évoluer pendant le voyage.',
    alteration: '4 h 51 au lieu de 3 h 55',
  },
}

const GLYPH = { planned: 'bus', critical: 'critique' } as const

export function DisruptionAlert({ type, onAlternatives }: {
  type: 'works' | 'delay'
  onAlternatives?: () => void
}) {
  const c = CONTENT[type]
  return (
    <article className={`dalert dalert--${c.severity}`} aria-labelledby={`dalert-${type}`}>
      <button type="button" className={`strip strip--${c.severity}`} onClick={onAlternatives}>
        <Icon name={GLYPH[c.severity]} size={18} />
        <span className="strip__label">{c.strip}</span>
        <Icon name="chevron" size={14} />
      </button>
      <div className="dalert__body">
        <h2 id={`dalert-${type}`} className="dalert__title">{c.title}</h2>
        <p className="dalert__text">{c.body}</p>
        <p className="dalert__alteration">{c.alteration}</p>
      </div>
    </article>
  )
}
