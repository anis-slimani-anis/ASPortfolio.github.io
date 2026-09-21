
export type Vehicle = {
  icon: 'train' | 'bus'
  name: string
  badge: string
  amenities: string[]
  /* The disrupted leg's card is tinted and severity-bordered. */
  severity?: boolean
}

export type Row = {
  time: string
  /* Drives the pill, the rail and the stop dot together. */
  tone: 'muted' | 'accent' | 'severity'
  duration?: string
  notice?: string
  station?: string
  sub?: string
  vehicle?: Vehicle
  /* Renders the plain "Gares desservies et voie" link under the vehicle card. */
  more?: boolean
  /* Terminus: dot only, no rail continuing below it. */
  last?: boolean
}

const BOARDING = 'Accueil embarquement jusqu’à 2 min avant le départ'

const TGV: Vehicle = {
  icon: 'train',
  name: 'TGV INOUI n° 6172',
  badge: 'INOUI',
  amenities: ['Wifi à bord', 'Voiture bar', 'Accessible voyageurs handicapés'],
}

/* The itinerary is identical across the two types except for the final leg:
   the same journey, disrupted two different ways. That is the point the
   drawer makes, so the shape is shared and only the leg swaps. */
function rows(type: 'works' | 'delay'): Row[] {
  const delay = type === 'delay'
  return [
    { time: '07:26', tone: 'muted', notice: BOARDING },
    { time: '07:28', tone: 'accent', duration: '2 h 44', station: 'Massy TGV', vehicle: TGV, more: true },
    { time: '10:12', tone: 'accent', station: 'Avignon TGV', sub: 'Correspondance, 18 min' },
    { time: '10:28', tone: 'muted', notice: BOARDING },
    {
      time: '10:30',
      tone: 'severity',
      duration: delay ? '1 h 58' : '1 h 40',
      station: 'Avignon TGV',
      vehicle: delay
        ? {
            icon: 'train', name: 'TER n° 17806, retardé', badge: 'TER', severity: true,
            amenities: ['Retard estimé de 20 minutes au départ', 'Correspondance garantie'],
          }
        : {
            icon: 'bus', name: 'Car de substitution', badge: 'CAR', severity: true,
            amenities: ['Travaux sur la ligne entre Avignon et Marseille', 'Départ parvis de la gare, quai bus n° 3'],
          },
      more: true,
    },
    { time: delay ? '12:30' : '12:10', tone: 'severity', station: 'Marseille Saint-Charles', last: true },
  ]
}

/* The clean journey: same drawer, same anatomy, nothing marked. Opening it
   from an undisrupted card is what makes the disrupted one legible as a
   variant rather than a different screen. */
function directRows(): Row[] {
  return [
    { time: '09:11', tone: 'muted', notice: BOARDING },
    {
      time: '09:13', tone: 'accent', duration: '3 h 21', station: 'Massy TGV',
      vehicle: { ...TGV, name: 'TGV INOUI n° 6108' }, more: true,
    },
    { time: '12:34', tone: 'accent', station: 'Marseille Saint-Charles', last: true },
  ]
}

/* One notice per drawer, carrying the altered duration inline rather than in a
   band of its own. Nothing above it repeats it. */
export const ITINERARY = {
  works: {
    title: 'Car de substitution entre Avignon et Marseille',
    body: 'Les travaux imposent ce car. La correspondance ci-dessous existe pour cette raison. 4 h 42 au lieu de 3 h 52.',
    rows: rows('works'),
  },
  delay: {
    title: 'Retard moyen annoncé de 20 minutes',
    body: 'La correspondance reste garantie. 12 h 30 au lieu de 12 h 10.',
    rows: rows('delay'),
  },
  normal: {
    title: 'Aucune perturbation sur ce trajet',
    body: 'Ni travaux ni retard annoncé. Trajet direct, 3 h 21 de Massy TGV à Marseille Saint-Charles.',
    rows: directRows(),
  },
} as const
