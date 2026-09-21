export type Severity = 'planned' | 'critical' | 'unknown'

export type Strip = { severity: Severity; label: string }

export type Journey = {
  id: string
  departTime: string        // "07:28"
  arriveTime: string        // "12:10"
  departStation: string     // "Massy TGV"
  arriveStation: string     // "Marseille Saint-Charles"
  durationLabel: string     // "4h42"
  connectionLabel: string   // "1 correspondance" | "direct"
  modes: ('train' | 'bus')[]
  price2nd: string          // "145 €"
  price1st: string          // "191 €" | "-"
  recommended: boolean
  recommendedLabel?: string
  bestPrice: boolean
  strips: Strip[]
  alteration?: string       // "4 h 42 au lieu de 3 h 52"
  alternative?: string      // "Trajet sans car de substitution à 09:13, 41 € de plus"
  mobileOnly?: boolean
}

export const DATE_DISRUPTED = '2026-09-26'  // samedi, travaux Avignon–Marseille
export const DATE_CLEAN = '2026-09-28'      // lundi, aucun incident
