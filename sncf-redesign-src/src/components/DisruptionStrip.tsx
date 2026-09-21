import { Icon, type IconName } from './Icon'
import { useIsDesktop } from '../lib/useMedia'

export type Severity = 'planned' | 'critical' | 'unknown'

// Severity is never carried by colour alone: each pairs a distinct glyph with
// its own spoken label, per section 7 of the brief.
const GLYPH: Record<Severity, IconName> = { planned: 'bus', critical: 'critique', unknown: 'indisponible' }
const SPOKEN: Record<Severity, string> = {
  planned: 'Travaux',
  critical: 'Retard',
  unknown: '\u00c9tat du trafic indisponible',
}

export function DisruptionStrip({ severity, label, onClick }: {
  severity: Severity; label: string; onClick?: () => void
}) {
  const desktop = useIsDesktop()
  return (
    <button type="button" className={`strip strip--${severity}`} onClick={onClick}>
      <Icon name={GLYPH[severity]} size={desktop ? 20 : 18} />
      <span className="strip__label">
        <span className="sr-only">{SPOKEN[severity]}. </span>{label}
      </span>
      <Icon name="chevron" size={desktop ? 16 : 14} />
    </button>
  )
}
