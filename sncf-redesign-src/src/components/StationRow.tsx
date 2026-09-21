import { Icon } from './Icon'
import type { Suggestion } from '../data/suggestions'

/* search/station-row, nodes 337:1476 / 337:1600.
   Travaux is announced as text as well as colour, same rule as the strips. */
export function StationRow({ s, onPick }: { s: Suggestion; onPick: () => void }) {
  return (
    <li>
      <button type="button" className="strow" onClick={onPick}>
        <span className="strow__glyph">
          <Icon name={s.kind === 'Ville' ? 'route' : s.kind === 'Arrêt' ? 'bus' : 'train'} size={20} />
        </span>
        <span className="strow__text">
          <span className="strow__name">{s.name}</span>
          <span className="strow__meta">
            {s.kind}{s.region ? ` · ${s.region}` : ''}
          </span>
          {s.lines && (
            <span className="strow__lines">
              {s.lines.map((l) => <span key={l} className="strow__line">{l}</span>)}
              {s.more && <span className="strow__more">{s.more}</span>}
            </span>
          )}
        </span>
        {s.severity === 'travaux' && (
          <span className="strow__flag">
            <Icon name="travaux" size={14} />Travaux
          </span>
        )}
      </button>
    </li>
  )
}
