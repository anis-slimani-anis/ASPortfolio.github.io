import { getJourneys } from './journeys'
import type { DayEntry } from '../components/DateStrip'

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

// The banner runs the works from Friday 18 at 23h30 to Sunday 20 at 11h30,
// so those three days carry the Travaux marker in the strip.
const TRAVAUX = new Set(['2026-09-25', '2026-09-26', '2026-09-27'])

export const STRIP_DATES = [
  '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26',
  '2026-09-27', '2026-09-28', '2026-09-29',
]

function cheapest(iso: string): string {
  const prices = getJourneys(iso)
    .map((j) => parseInt(j.price2nd, 10))
    .filter((n) => Number.isFinite(n))
  return prices.length ? `${Math.min(...prices)} €` : '—'
}

export function getDays(): DayEntry[] {
  return STRIP_DATES.map((iso) => {
    const d = new Date(`${iso}T12:00:00`)
    return {
      iso,
      label: `${DAYS[d.getDay()]} ${d.getDate()}`,
      price: cheapest(iso),
      severity: TRAVAUX.has(iso) ? ('travaux' as const) : ('normal' as const),
    }
  })
}

export const BANNER = {
  title: 'Travaux à Marseille',
  body:
    'En raison de travaux d’infrastructure à Marseille, les TGV INOUI seront limités à ' +
    'Marseille Saint-Charles du vendredi 25 septembre 23h30 au dimanche 27 septembre 11h30. ' +
    'Les TER à destination de la Côte d’Azur auront pour départ ou terminus la gare de ' +
    'Marseille Blancarde.',
}
