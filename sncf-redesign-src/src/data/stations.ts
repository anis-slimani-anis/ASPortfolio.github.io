export type Station = {
  name: string
  uic: string
  lat: number | null
  lon: number | null
  commune: string
  region: string
}

/* 2,950 passenger stations from `liste-des-gares` (ressources.data.sncf.com,
   Licence Ouverte), filtered to voyageurs = O and trimmed to the fields the
   brief asks for. Loaded as its own chunk so it never sits in the main bundle,
   and never fetched from a live API at runtime. */
let cache: Station[] | null = null

export async function loadStations(): Promise<Station[]> {
  if (!cache) {
    const mod = await import('./stations.json')
    cache = (mod.default ?? mod) as unknown as Station[]
  }
  return cache
}

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export async function findStations(query: string, limit = 8): Promise<Station[]> {
  const q = norm(query.trim())
  if (!q) return []
  const all = await loadStations()
  return all.filter((s) => norm(s.name).includes(q)).slice(0, limit)
}
