/* The prototype demonstrates one disruption scenario end to end.
   Any query resolves to the Marseille station set so the scenario always holds. */
export const FORCED_QUERY = 'Marseille'

export type Suggestion = {
  name: string
  kind: 'Ville' | 'Gare' | 'Arrêt'
  region?: string
  lines?: string[]
  more?: string
  severity?: 'travaux'
  /* Real UIC codes from stations.json, so the scripted panel is still backed by
     the open dataset rather than being invented. */
  uic?: string
}

export const SUGGESTIONS: Suggestion[] = [
  { name: 'Marseille', kind: 'Ville', region: "Provence-Alpes-Côte d'Azur" },
  {
    name: 'Marseille Saint-Charles', kind: 'Gare', uic: '87751008',
    lines: ['33', '34', '48', '50', '51'], more: '+ 13 autres', severity: 'travaux',
  },
  { name: 'Marseille Blancarde', kind: 'Gare', uic: '87751081', severity: 'travaux' },
  { name: 'Vitrolles Aéroport Marseille-Provence', kind: 'Gare', uic: '87439554' },
  { name: 'Marseille-en-Beauvaisis', kind: 'Ville', region: 'Hauts-de-France' },
  { name: 'Marseille-en-Beauvaisis', kind: 'Gare', region: 'Hauts-de-France', uic: '87313726' },
  { name: 'Picon-Busserine (Marseille)', kind: 'Gare' },
  { name: 'Marseillette', kind: 'Ville', region: 'Occitanie' },
]

export const STOPS: Suggestion[] = [
  { name: 'Marseille', kind: 'Arrêt', region: 'Réseau urbain' },
]
