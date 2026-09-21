import { useEffect, useState } from 'react'

/* Hash routing: the site is static on GitHub Pages under /sncf-redesign/, so a
   shared deep link has to resolve without any server rewrite. */
export type Route = { path: string; params: URLSearchParams }

function parse(): Route {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [path, qs = ''] = raw.split('?')
  return { path: path || '/', params: new URLSearchParams(qs) }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parse)
  useEffect(() => {
    const onHash = () => { setRoute(parse()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

export function go(path: string) {
  window.location.hash = path
}
