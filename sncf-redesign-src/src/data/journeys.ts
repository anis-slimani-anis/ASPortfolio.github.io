import type { Journey } from '../lib/types'
import { DATE_CLEAN, DATE_DISRUPTED } from '../lib/types'

const TRAVAUX = 'Travaux, car de substitution entre Avignon et Marseille'

/* Small builder so each list reads as data rather than as boilerplate. */
function mk(
  id: string, departTime: string, arriveTime: string,
  durationLabel: string, connectionLabel: string,
  modes: ('train' | 'bus')[], price2nd: string, price1st: string,
): Journey {
  return {
    id, departTime, arriveTime,
    departStation: 'Massy TGV', arriveStation: 'Marseille Saint-Charles',
    durationLabel, connectionLabel, modes, price2nd, price1st,
    recommended: false, bestPrice: false, strips: [],
  }
}


// The two demo dates are fixed rather than generated: the whole case rests on a
// specific disruption existing, and a PRNG cannot be trusted to produce it.
const SATURDAY: Journey[] = [
  {
    id: 'sa-1',
    departTime: '07:28', arriveTime: '12:10',
    departStation: 'Massy TGV', arriveStation: 'Marseille Saint-Charles',
    durationLabel: '4h42', connectionLabel: '1 correspondance',
    modes: ['train', 'bus', 'train'] as ('train' | 'bus')[],
    price2nd: '145 €', price1st: '191 €',
    recommended: false, bestPrice: false,
    strips: [{ severity: 'planned', label: TRAVAUX }],
    alteration: '4 h 42 au lieu de 3 h 52',
    alternative: 'Trajet sans car de substitution à 09:13, 41 € de plus',
  },
  {
    id: 'sa-2',
    departTime: '09:13', arriveTime: '12:34',
    departStation: 'Massy TGV', arriveStation: 'Marseille Saint-Charles',
    durationLabel: '3h21', connectionLabel: 'direct',
    modes: ['train'],
    price2nd: '186 €', price1st: '246 €',
    recommended: true,
    recommendedLabel: 'Trajet recommandé, sans car de substitution',
    bestPrice: true,
    strips: [],
  },
  {
    id: 'sa-3',
    departTime: '13:07', arriveTime: '17:58',
    departStation: 'Massy TGV', arriveStation: 'Marseille Saint-Charles',
    durationLabel: '4h51', connectionLabel: '1 correspondance',
    modes: ['train', 'bus', 'train'] as ('train' | 'bus')[],
    price2nd: '98 €', price1st: '129 €',
    recommended: false, bestPrice: false,
    // Two strips already stack on this card; the alteration and alternative
    // rows on top of them made it four bands deep, so they are left off.
    strips: [
      { severity: 'planned', label: TRAVAUX },
      { severity: 'critical', label: 'Retard annoncé de 20 minutes' },
    ],
  },
  {
    id: 'sa-4',
    departTime: '18:12', arriveTime: '23:04',
    departStation: 'Massy TGV', arriveStation: 'Marseille Saint-Charles',
    durationLabel: '4h51', connectionLabel: '1 correspondance',
    modes: ['train'],
    price2nd: '72 €', price1st: '95 €',
    recommended: false, bestPrice: false,
    strips: [{ severity: 'unknown', label: 'État du trafic indisponible' }],
    mobileOnly: true,
  },
]

const MONDAY: Journey[] = [
  {
    id: 'mo-1',
    departTime: '08:12', arriveTime: '12:03',
    departStation: 'Massy TGV', arriveStation: 'Marseille Saint-Charles',
    durationLabel: '3h51', connectionLabel: 'direct', modes: ['train'],
    price2nd: '132 €', price1st: '174 €',
    recommended: false, bestPrice: false, strips: [],
  },
  {
    id: 'mo-2',
    departTime: '10:37', arriveTime: '14:28',
    departStation: 'Massy TGV', arriveStation: 'Marseille Saint-Charles',
    durationLabel: '3h51', connectionLabel: 'direct', modes: ['train'],
    price2nd: '149 €', price1st: '197 €',
    recommended: false, bestPrice: false, strips: [],
  },
  {
    id: 'mo-3',
    departTime: '14:07', arriveTime: '17:58',
    departStation: 'Massy TGV', arriveStation: 'Marseille Saint-Charles',
    durationLabel: '3h51', connectionLabel: 'direct', modes: ['train'],
    price2nd: '118 €', price1st: '156 €',
    recommended: true, recommendedLabel: 'Trajet recommandé', bestPrice: true, strips: [],
  },
]


/* The works run Friday 18 at 23h30 to Sunday 20 at 11h30, so those two days
   carry real disruption too: Friday only on the late departure, Sunday only on
   the morning ones. The date strip and the list therefore agree. */
const FRIDAY: Journey[] = [
  mk('fr-1', '06:52', '10:43', '3h51', 'direct', ['train'], '128 €', '169 €'),
  { ...mk('fr-2', '09:13', '12:34', '3h21', 'direct', ['train'], '101 €', '134 €'),
    recommended: true, recommendedLabel: 'Trajet recommandé', bestPrice: true },
  mk('fr-3', '14:22', '18:13', '3h51', 'direct', ['train'], '145 €', '191 €'),
  { ...mk('fr-4', '19:47', '00:38', '4h51', '1 correspondance', ['train', 'bus', 'train'], '112 €', '148 €'),
    strips: [{ severity: 'planned', label: TRAVAUX }],
    alteration: '4 h 51 au lieu de 3 h 51',
    alternative: 'Trajet sans car de substitution à 14:22, 33 € de plus' },
]

const SUNDAY: Journey[] = [
  { ...mk('su-1', '07:05', '11:56', '4h51', '1 correspondance', ['train', 'bus', 'train'], '92 €', '121 €'),
    strips: [{ severity: 'planned', label: TRAVAUX }],
    alteration: '4 h 51 au lieu de 3 h 55',
    alternative: 'Trajet sans car de substitution à 12:40, 47 € de plus' },
  { ...mk('su-2', '09:38', '14:20', '4h42', '1 correspondance', ['train', 'bus', 'train'], '118 €', '156 €'),
    strips: [
      { severity: 'planned', label: TRAVAUX },
      { severity: 'critical', label: 'Retard annoncé de 15 minutes' },
    ] },
  { ...mk('su-3', '12:40', '16:31', '3h51', 'direct', ['train'], '139 €', '183 €'),
    recommended: true, recommendedLabel: 'Trajet recommandé, après la fin des travaux', bestPrice: false },
  mk('su-4', '16:52', '20:43', '3h51', 'direct', ['train'], '124 €', '164 €'),
]

/* Two quiet days either side, so moving along the strip always lands on a real
   list rather than on generated filler. */
const WED: Journey[] = [
  { ...mk('we-1', '08:12', '12:03', '3h51', 'direct', ['train'], '19 €', '39 €'), bestPrice: true },
  mk('we-2', '11:37', '15:28', '3h51', 'direct', ['train'], '64 €', '85 €'),
  { ...mk('we-3', '15:07', '18:58', '3h51', 'direct', ['train'], '48 €', '63 €'),
    recommended: true, recommendedLabel: 'Trajet recommandé' },
]

const THU: Journey[] = [
  mk('th-1', '07:28', '11:19', '3h51', 'direct', ['train'], '72 €', '95 €'),
  { ...mk('th-2', '10:13', '14:04', '3h51', 'direct', ['train'], '49 €', '65 €'),
    recommended: true, recommendedLabel: 'Trajet recommandé', bestPrice: true },
  mk('th-3', '17:07', '20:58', '3h51', 'direct', ['train'], '96 €', '127 €'),
]

const TUE: Journey[] = [
  { ...mk('tu-1', '06:44', '10:35', '3h51', 'direct', ['train'], '16 €', '34 €'), bestPrice: true },
  { ...mk('tu-2', '09:58', '13:49', '3h51', 'direct', ['train'], '58 €', '77 €'),
    recommended: true, recommendedLabel: 'Trajet recommandé' },
  mk('tu-3', '18:22', '22:13', '3h51', 'direct', ['train'], '87 €', '115 €'),
]

const FIXED: Record<string, Journey[]> = {
  '2026-09-23': WED,
  '2026-09-24': THU,
  '2026-09-25': FRIDAY,
  [DATE_DISRUPTED]: SATURDAY,
  '2026-09-27': SUNDAY,
  [DATE_CLEAN]: MONDAY,
  '2026-09-29': TUE,
}

/* Deterministic fallback for any other date: same inputs, same list, always. */
function seedFrom(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generated(origin: string, destination: string, date: string): Journey[] {
  const rand = mulberry32(seedFrom(origin + destination + date))
  return Array.from({ length: 4 }, (_, i) => {
    const departMin = 7 * 60 + Math.floor(rand() * 60) + i * 200
    const durMin = 205 + Math.floor(rand() * 70)
    const p2 = 90 + Math.floor(rand() * 120)
    const hhmm = (m: number) =>
      `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
    return {
      id: `gen-${date}-${i}`,
      departTime: hhmm(departMin), arriveTime: hhmm(departMin + durMin),
      departStation: origin, arriveStation: destination,
      durationLabel: `${Math.floor(durMin / 60)}h${String(durMin % 60).padStart(2, '0')}`,
      connectionLabel: 'direct', modes: ['train'] as ('train' | 'bus')[],
      price2nd: `${p2} €`, price1st: `${Math.round(p2 * 1.32)} €`,
      recommended: i === 1, bestPrice: i === 1, strips: [],
    }
  })
}

export function getJourneys(
  date: string,
  origin = 'Massy TGV',
  destination = 'Marseille Saint-Charles',
): Journey[] {
  return FIXED[date] ?? generated(origin, destination, date)
}
