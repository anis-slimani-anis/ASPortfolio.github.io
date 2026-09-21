import { useId } from 'react'
import { Icon } from './Icon'
import { FollowRoute } from './FollowRoute'
import { useDialog } from '../lib/useDialog'
import { ITINERARY, type Row } from '../data/itinerary'
import type { SheetType } from '../lib/useSheet'

/* sheet/trajet-detail `649:796` / `649:918`,
   sheet/trajet-detail-mobile `649:3777` / `649:4019`.
   SNCF already ships a full itinerary drawer; this keeps their structure and
   adds what it omits: a single notice at the top, and the disrupted leg marked
   from the pill through the rail to the stop. Fermer in the header is the only
   close affordance, as on the live site. */

const TONE: Record<SheetType, 'planned' | 'critical' | 'normal'> = {
  works: 'planned',
  delay: 'critical',
  normal: 'normal',
}
/* Works leads with the mode that replaces the train, delay with the alert,
   and a clean journey with the train it is actually taking. */
const GLYPH: Record<SheetType, 'bus' | 'critique' | 'train'> = {
  works: 'bus', delay: 'critique', normal: 'train',
}
const FOLLOW_SUB: Record<SheetType, string> = {
  works: 'Être prévenu si les travaux changent',
  delay: 'Être prévenu si le retard évolue',
  normal: 'Être prévenu en cas de changement',
}

function RailRow({ row }: { row: Row }) {
  return (
    <div className={`etape etape--${row.tone}${row.last ? ' etape--last' : ''}`}>
      <div className="etape__time">
        <span className="etape__pill">{row.time}</span>
        {row.duration && <span className="etape__dur">{row.duration}</span>}
      </div>

      <div className="etape__rail" aria-hidden="true">
        <span className="etape__bar" />
        <span className="etape__dot" />
      </div>

      <div className="etape__body">
        {row.notice && <p className="etape__notice">{row.notice}</p>}
        {row.station && <p className="etape__station">{row.station}</p>}
        {row.sub && <p className="etape__sub">{row.sub}</p>}

        {row.vehicle && (
          <div className={`vehicule${row.vehicle.severity ? ' vehicule--severity' : ''}`}>
            <div className="vehicule__head">
              <Icon name={row.vehicle.icon} size={26} />
              <p className="vehicule__name">{row.vehicle.name}</p>
              <span className="vehicule__badge">{row.vehicle.badge}</span>
            </div>
            {row.vehicle.amenities.map((a) => (
              <div key={a} className="vehicule__service">
                <Icon name="info" size={18} />
                <p>{a}</p>
              </div>
            ))}
          </div>
        )}

        {row.more && (
          <button type="button" className="voirplus">
            Gares desservies et voie
            <Icon name="chevron" size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

type Props = {
  type: SheetType
  onClose: () => void
  followed: boolean
  onFollow: (v: boolean) => void
}

export function TrajetDetailDrawer({ type, onClose, followed, onFollow }: Props) {
  const c = ITINERARY[type]
  const tone = TONE[type]
  const titleId = useId()
  const ref = useDialog(true, onClose)

  return (
    <div
      className="drawer-scrim"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`drawer drawer--${type}`}
      >
        <header className="drawer__header">
          <h2 id={titleId} className="drawer__heading">Ce trajet en détail</h2>
          <button type="button" className="drawer__close" onClick={onClose}>Fermer</button>
        </header>

        <div className="drawer__body">
          <div className="drawer__content">
            <div className={`avis avis--${tone}`}>
              <Icon name={GLYPH[type]} size={22} className="avis__icon" />
              <div className="avis__txt">
                <h3 className="avis__title">{c.title}</h3>
                <p className="avis__body">{c.body}</p>
              </div>
            </div>

            <section className="carte-trajet" aria-label="Itinéraire détaillé">
              {c.rows.map((r, i) => <RailRow key={i} row={r} />)}
            </section>

            <FollowRoute checked={followed} onChange={onFollow} sub={FOLLOW_SUB[type]} />
          </div>
        </div>
      </div>
    </div>
  )
}
